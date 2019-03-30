#PART 1 - loading API data into MongoDB

# Import dependencies
import requests
import json
from pprint import pprint
from pymongo import MongoClient

# Get json response from fireball url
url = 'https://api.nasa.gov/DONKI/GST?startDate=1988-01-01&endDate=2019-12-31&api_key=qY4Prsq2htit5vyZ0H4053jiaZtERZ7gBrPQaz8L'
response = requests.get(url)
data = response.json()

# Connect to local MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Declare the database
db = client.donkidb

#Drop collection if exists
db.donkis.drop()

# Declare the collection
collection = db.donkis

# Loop through api data and insert into collection
for i in data:
  d = {
        "gstID": i['gstID'],
        "startTime": i['startTime'],
        "kindex": i["allKpIndex"][0]["kpIndex"],
        "observedTime": i["allKpIndex"][0]["observedTime"]
        # "impact-e": i[2],
        # "lat": i[3],
        # "lat-dir": i[4],
        # "lon": i[5],
        # "lon-dir": i[6],
        # "alt": i[7],
        # "vel": i[8]
    }

        # print(i)
  collection.insert(d)

# Verify results:
results = db.donkis.find()
for result in results:
    print(result)


#PART 2 - Creating RESTful API for MongoDB collection
# mongo.py

from flask import Flask
from flask import jsonify
from flask import request
from flask import render_template
from flask_pymongo import PyMongo

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

#Configure mongoDB connection
app.config['MONGO_DBNAME'] = 'donkidb'
app.config['MONGO_URI'] = 'mongodb://localhost:27017/donkidb'

mongo = PyMongo(app)

@app.route('/donkiapi', methods=['GET'])
def get_all_fireballs():
  donki = mongo.db.donkis
  output = []
  for i in donki.find():
    output.append({'gstID' : i['gstID'],
                  "startTime": i['startTime'],
                  "kindex": i['kindex'],
                  "observedTime": i["observedTime"]
                  # 'lat': i['lat'],
                  # 'lat-dir': i['lat-dir'],
                  # 'lon': i['lon'],
                  # 'lon-dir': i['lon-dir'],
                  # 'alt': i['alt'],
                  # 'vel': i['vel']
                  })
  return jsonify({'result' : output})

# @app.route('/fireballapi/', methods=['GET'])
# def get_one_fireball(name):
#   fireball = mongo.db.fireballs
#   f = fireball.find_one({'name' : name})
#   if f:
#     output = {'name' : s['name'], 'distance' : s['distance']}
#   else:
#     output = "No such name"
#   return jsonify({'result' : output})

# @app.route('/star', methods=['POST'])
# def add_star():
#   star = mongo.db.stars
#   name = request.json['name']
#   distance = request.json['distance']
#   star_id = star.insert({'name': name, 'distance': distance})
#   new_star = star.find_one({'_id': star_id })
#   output = {'name' : new_star['name'], 'distance' : new_star['distance']}
#   return jsonify({'result' : output})

if __name__ == '__main__':
    app.run(debug=True)