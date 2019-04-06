#PART 1 - loading API data into MongoDB

# Import dependencies
import requests
import json
from pprint import pprint
from pymongo import MongoClient
import pandas

# Get json response from fireball url
url = 'https://api.nasa.gov/DONKI/GST?startDate=1988-01-01&endDate=2019-01-30&api_key=qY4Prsq2htit5vyZ0H4053jiaZtERZ7gBrPQaz8L'
response = requests.get(url)
data = response.json()

# Connect to local MongoDB
client = MongoClient('mongodb://localhost:27017/')

# Declare the database
db = client.donkidb

#Drop collection if exists
db.donki.drop()

# Declare the collection
collection = db.donki

# Loop through api data and insert into collection
for i in data:
#   print(i["allKpIndex"])
  d = {
        "gstID": i["gstID"],
        "startTime": i["startTime"],
        "observedTime": i["allKpIndex"][0]["observedTime"],
        "kpIndex": i["allKpIndex"][0]["kpIndex"],
        }

        # print(i)
collection.insert(d)

with open('donki.txt', 'w') as outfile:  
    json.dump(data, outfile)
"""
# Verify results:
for result in db.donki.find():
    print(result)
"""

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


@app.route('/donki', methods=['GET'])
def get_all_donki():
    output = []
    donkis = mongo.db.donki
    for i in donkis.find():
        print(i)
        dictionary = {'gstID' : i['gstID'], 
                  'startTime' : i['startTime'],
                  'kpIndex' : i['kpIndex'],
                  'observedTime': i['observedTime']
                  }
        output.append(dictionary)
    return jsonify({'anything' : output})

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