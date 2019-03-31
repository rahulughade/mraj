// Creating map object
var myMap = L.map("map", {
  center: [40, -95],
  zoom: 4
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
}).addTo(myMap);

// Store API query variable
//var url = "https://ssd-api.jpl.nasa.gov/fireball.api";
var url = "http://localhost:5000/fireballapi";
//{{ url_for('get_all_fireballs') }}

// Grab the data with d3
d3.json(url, function(err, response) {

  if(err) console.log("error fetching data");
  console.log(response);

  // Create a new marker cluster group
  var markers = L.markerClusterGroup();

  //Loop through data
  for (var i = 0; i < response.result.length; i++) {

    //console.log(response)

    var location_x = response.result[i]['lat'];
    //console.log(location_x);
    var location_y = response.result[i]['lon'];
    //console.log(location_x);
    var energy = response.result[i]['energy'];

    var impact = response.result[i]['impact-e'];

    var date = response.result[i]['date'];

    var velocity = response.result[i]['vel'];
    
    var location = [location_x, location_y];

    if (response.result[i]['lat-dir'] == "S"){
      location_x = location_x * -1;
    }
    else
    {
      location_x = location_x * 1;
    }

    if (response.result[i]['lon-dir'] == "W"){
      location_y = location_y * -1;
    }
    else
    {
      location_y = location_y * 1;
    }

    //console.log(location_y);
    //console.log(location);

    var weather = "http://history.openweathermap.org/data/2.5/history/city?lat={" +
     location_x + "}&lon={" + location_y + "}&appid=" + "26f870388fc77a582a83d3cf98ae92f2";

    console.log(weather);

    //var magnitude = response.features[i].properties.mag;

    //var place = response.features[i].properties.place;

    // Conditionals for countries points
    var color = "";
    if (energy < 50) {
      color = "green";
    }
    else if (energy < 500) {
      color = "yellow";
    }
    else if (energy < 5000) {
      color = "orange";
    }
    else {
      color = "red";
    }
  
    // Add circles to map
    L.circle([location_x, location_y], {
      fillOpacity: 0.75,
      color: color,
      weight: 5,
      //scale:
      fillColor: color,
      // Adjust radius
      
      //if (energy > 1000)
      radius: energy * 25
    }).bindPopup("<h1> Energy: " + energy + "</h1> <hr> <h2> Date: " + date + "</h2> <h3> Impact: " + impact + "</h3> <h3> velocity: " + velocity + "</h3>").addTo(myMap);
  }
    //console.log(magnitude)

    // Check for location property
    if (location) {

      // Add a new marker to the cluster group and bind a pop-up
      markers.addLayer(L.marker([location_x, location_y])
        .bindPopup(energy));
    }

  // Add our marker cluster layer to the map
  myMap.addLayer(markers);

});
