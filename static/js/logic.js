// Store API query variable
//var url = "https://ssd-api.jpl.nasa.gov/fireball.api";
// var url = "http://localhost:5000/fireballapi";
var url = "/fireballapi";


// Grab the data with d3
d3.json(url, function(err, response) {

  if(err) console.log("error fetching data");
  console.log(response);

  // Create a new marker cluster group
  var markers = L.markerClusterGroup();

  // Create empty arrays for altitude and energy
  var altMarkers = [];
  var energyMarkers = [];
  

  //Loop through data
  for (var i = 0; i < response.result.length; i++) {

    //console.log(response)

    var alt = response.result[i]['alt'];

    var location_x = response.result[i]['lat'];
    //console.log(location_x);
    var location_y = response.result[i]['lon'];
    //console.log(location_x);
    var energy = response.result[i]['energy'];

    var impact = response.result[i]['impact-e'];

    var date = response.result[i]['date'];

    var velocity = response.result[i]['vel'];
    
    var location = [location_x, location_y];
    
// Convert directions in decimal
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

    // Conditionals for energy points
    var color = "";
    var radius = "";

    if (energy < 50) {
      color = "green";
      radius = 100
    }
    else if (energy < 500) {
      color = "yellow";
      radius = 200
    }
    else if (energy < 5000) {
      color = "orange";
      radius = 300
    }
    else {
      color = "red";
      radius = 700
    }
    
    // Add marker layer
    markers.addLayer(L.marker([location_x, location_y])
        .bindPopup("<h5> Date: " + date + "</h5> <hr> <h6> Total Energy(J): " + energy + "</h6> <h6> Impact Energy(kt): " + impact + "</h6> <h6> Velocity(km/s): " + velocity + "</h6><h6> Altitude(km): " + alt + "</h6>"));

        
//  Append circles to map for energy and altitude datasets
  energyMarkers.push(
    L.circle([location_x, location_y], {
      fillOpacity: 0.56,
      color: color,
      weight: 1,
      //scale:
      fillColor: color,
      // Adjust radius
      //if (energy > 1000)
      radius: radius * 1000
    })
  
);

  altMarkers.push(
    L.circle([location_x, location_y], {
      fillOpacity: 0.75,
      color: 'white',
      weight: 0,
      //scale:
      fillColor: 'white',
      // Adjust radius
      //if (energy > 1000)
      radius: alt * 2500
    })
  
  );
}

// Setup streetmap and darkmap for the map
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });
  
  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

// Create layer groups
var energies = L.layerGroup(energyMarkers);
var altitudes = L.layerGroup(altMarkers);


var baseMaps = {
  "Street Map": streetmap,
  "Dark Map": darkmap
};

// Create an overlay object
var overlayMaps = {
  "Total Energy layer": energies,
  "Altitude layer": altitudes
};

// Define a map object with fullscreen control
var myMap = L.map("map", {
  center: [0, 0],
  zoom: 2,
  fullscreenControl: true,
  layers: [streetmap, energies, altitudes]
});

// Add control layer to map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Add markers to map
myMap.addLayer(markers);
});