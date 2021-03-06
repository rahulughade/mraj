#PART 1 - loading API data into MongoDB

# Import dependencies
import requests
import json
from pprint import pprint
from pymongo import MongoClient

# Get json response from fireball url
url = 'https://ssd-api.jpl.nasa.gov/fireball.api'
response = requests.get(url)
data = response.json()

# Connect to local MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Declare the database
db = client.fireballdb

#Drop collection if exists
db.fireballs.drop()

# Declare the collection
collection = db.fireballs

# Loop through api data and insert into collection
for i in data["data"]:
  d = {
        "date": i[0],
        "energy": i[1],
        "impact-e": i[2],
        "lat": i[3],
        "lat-dir": i[4],
        "lon": i[5],
        "lon-dir": i[6],
        "alt": i[7],
        "vel": i[8]
    }
  #Insert dictionary to mongodb collection
  collection.insert_one(d)

# Verify results:
# results = db.fireballs.find()
# for result in results:
#     print(result)


#PART 2 - Creating RESTful API for MongoDB collection

from flask import Flask
from flask import jsonify
from flask import request
from flask import render_template
from flask_pymongo import PyMongo

app = Flask(__name__)

#Create route for homepage 
@app.route('/')
def index():
    return render_template('index.html')

#Configure mongoDB connection
app.config['MONGO_DBNAME'] = 'fireballdb'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/fireballdb'
mongo = PyMongo(app)

#Create route for restful api
#Read data from mongodb collection and return to the route
@app.route('/fireballapi', methods=['GET'])
def get_all_fireballs():
  fireball = mongo.db.fireballs
  output = []

#Filter out data with null lat and lon values
  for i in fireball.find({"lat":{"$ne":None},"lon":{"$ne":None}}):
    output.append({'date' : i['date'], 
                  'energy' : i['energy'],
                  'impact-e' : i['impact-e'],
                  'lat': i['lat'],
                  'lat-dir': i['lat-dir'],
                  'lon': i['lon'],
                  'lon-dir': i['lon-dir'],
                  'alt': i['alt'],
                  'vel': i['vel']
                  })
  return jsonify({'result' : output})

#Read data from mongodb collection and return to the route
@app.route('/article')
def get_article():
  return render_template('article.html')

#Create route for scatter plot
#Read data from mongodb collection and return to the route
@app.route('/scatterapi', methods=['GET'])
def get_scatterdata():
  fireball = mongo.db.fireballs
  output = []

#Filter out data with null lat and lon values
  # for i in fireball.find({"$and":[{"energy":{"$ne":37500}},{"energy":{"$ne":13000}}]}):
  for i in fireball.find({"$and":[{"date":{"$ne":"2013-02-15 03:20:33"}},{"date":{"$ne":"2018-12-18 23:48:20"}}]}):
    output.append({'date' : i['date'], 
                  'energy' : i['energy'],
                  'impact-e' : i['impact-e'],
                  'lat': i['lat'],
                  'lat-dir': i['lat-dir'],
                  'lon': i['lon'],
                  'lon-dir': i['lon-dir'],
                  'alt': i['alt'],
                  'vel': i['vel']
                  })
  return jsonify({'result' : output})

if __name__ == '__main__':
    app.run(debug=True)