var openfileBrowse = function(event){
  var input = event.target;
  if (input.files[0].type != "application/vnd.ms-excel"){
    alert("wrong file type. We require a .csv file not a " + input.files[0].type + " file");
  } else {
    var reader = new FileReader();
    var aftertext = "";
    reader.onload = function(){
      aftertext = reader.result;
      storetext(aftertext);
    };
    reader.onloadend = function(){
      console.log("done loading");
      document.getElementById("visualization").style.display = "block";
    };
    reader.readAsText(input.files[0]);
  }
}

function storetext(text) {
  var indata = tsvJSON(text);
  var data = [];
  for(var i=0; i<indata.length;i++){
    if(indata[i].StimuliName === "01_Antwerpen_S1.jpg"){
      data.push(indata[i]);
    }
  }

  var margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  /*
   * value accessor - returns the value to encode for a given data object.
   * scale - maps value to a visual display encoding, such as a pixel position.
   * map function - maps from data value to display value
   * axis - sets up axis
   */

  // setup x
  var xValue = function(d) { return d.MappedFixationPointX;}, // data -> value
      xScale = d3.scale.linear().range([0, width]), // value -> display
      xMap = function(d) { return xScale(xValue(d));}, // data -> display
      xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  // setup y
  var yValue = function(d) { return d["MappedFixationPointY"];}, // data -> value
      yScale = d3.scale.linear().range([height, 0]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}, // data -> display
      yAxis = d3.svg.axis().scale(yScale).orient("left");

  // setup fill color
  var cValue = function(d) { return d.StimuliName;},
      color = d3.scale.category10();

  // add the graph canvas to the body of the webpage
  var svg = d3.select("#visualization").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // add the tooltip area to the webpage
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // change string (from CSV) into number format
    data.forEach(function(d) {
      d.MappedFixationPointX = +d.MappedFixationPointX;
      d["MappedFixationPointY"] = +d["MappedFixationPointY"];
    });

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([0, 1600]);
    yScale.domain([0, 1600]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("X-coord");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Y-coord");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html(d["StimuliName"] + "<br/> (" + xValue(d)
  	        + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d;})
}

//from http://techslides.com/convert-csv-to-json-in-javascript
//var tsv is the TSV file with headers
function tsvJSON(csv){

var lines=csv.split("\n");

// NOTE: If your columns contain commas in their values, you'll need
// to deal with those before doing the next step
// (you might convert them to &&& or something, then covert them back later)
// jsfiddle showing the issue https://jsfiddle.net/
var headers=lines[0].split("	");

var result = [];
for(var i=1;i<lines.length;i++){

    var obj = {};
    var currentline=lines[i].split("	");

    for(var j=0;j<headers.length;j++){
        obj[headers[j]] = currentline[j];
    }

    result.push(obj);

}

//return result; //JavaScript object
return JSON.parse(JSON.stringify(result)); //JSON
}