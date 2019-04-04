var svgWidth = 550;
var svgHeight = 450;

var margin = {
  top: 20,
  right: 20,
  bottom: 80,
  left: 60
};
// var scatterDiv = document.getElementById("scatter");
// var svg = d3.select(scatterDiv).append("svg");

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// var width = scatterDiv.clientWidth;
// var height = scatterDiv.clientHeight;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  svg.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "white")
  .attr("fill-opacity", 0.9);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "vel";

// function used for updating x-scale var upon click on axis label
function xScale(fireballdata, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(fireballdata, d => d[chosenXAxis]) * 0.8,
      d3.max(fireballdata, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "vel") {
    var label = "Velocity:";
  }
  else {
    var label = "Altitude:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`Energy: ${d.energy}<br> ${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.json("/scatterapi", function(err, fireballdata) {
  if (err) throw err;
  var result = fireballdata.result;
// console.log(result);
//   // parse data

result.forEach(function(data){
    // console.log(data["date"]);
    data.vel = +data.vel;
    data.alt = +data.alt;
    data.energy = +data.energy;
})

  // xLinearScale function above csv import
  var xLinearScale = xScale(result, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([-50, d3.max(result, d => d.energy)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(result)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.energy))
    .attr("r", 5)
    .attr("fill", "red")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var velLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "vel") // value to grab for event listener
    .classed("active", true)
    .text("Velocity in (km/s)");

  var altLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "alt") // value to grab for event listener
    .classed("inactive", true)
    .text("Altitude in (km)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height /2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Total Radiated Energy in (J)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(result, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "vel") {
          velLabel
            .classed("active", true)
            .classed("inactive", false);
          altLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            velLabel
            .classed("active", false)
            .classed("inactive", true);
            altLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
