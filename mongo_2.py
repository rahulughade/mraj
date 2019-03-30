# Dependencies and Setup
import pandas as pd
import numpy as np
import requests
import time
import json
import pprint
from pymongo import MongoClient


# Import API key
from config import api_key

#Create Dataframe & Column Header
#col=['date','lat','lon','lat_dir','lon_dir','alt','vel','energy','impact-e','nuke']
#df=pd.DataFrame(columns=col)

#API pieces & count
url="https://ssd-api.jpl.nasa.gov/fireball.api?" 

#API requests in 4 loop 
#.set_value will have to be replaced .at
res=requests.get(url)
data = res.json()

#Connect local Mongo
client = MongoClient('mongodb://localhost:27017')

#Declare the database
db = client.fireballdb
db.fireballs.drop()
collection = db.fireballs



for i in data["data"]:
    data = {
        "date": i[0],
        "energy":i[1],
        "impact-e":i[2],
        "lat":i[3],
        "lat-dir":i[4],
        "lon":i[5],
        "lon-dir":i[6],
        "alt":i[7],
        "vel":i[8]}
    collection.insert(data)

#Verify results:
results = db.fireballs.find()
for result in results:
    print(results)
    