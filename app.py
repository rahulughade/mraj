from flask import Flask, render_template

# Import our pymongo library, which lets us connect our Flask app to our Mongo database.
import pymongo

# Create an instance of our Flask app.
app = Flask(__name__)

# Create connection variable
conn = 'mongodb://localhost:27017'

# Pass connection to the pymongo instance.
client = pymongo.MongoClient(conn)

# Connect to a database. Will create one if not already available.
db = client.fireball

@app.route('/')
def index():
    return render_template('index.html')


# Set route
@app.route('/api')
def getmongodata():
    # Store the entire team collection in a list
    fireballs = list(db.fireball.find())


    # Return the template with the teams list passed in
    return jsonify(fireballs)



if __name__ == "__main__":
    app.run(debug=True)


