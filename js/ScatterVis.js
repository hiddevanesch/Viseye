//simon
//opens the file the filebutton gives
var openfileBrowse = function(event){
  //input is the filebutton
  var input = event.target;

  //check for right file type
  if (input.files[0].type != "application/vnd.ms-excel"){
    alert("wrong file type. We require a .csv file not a " + input.files[0].type
     + " file");
  } else {
    //reader to read out the file
    var reader = new FileReader();

    //aftertext will store the result of the reader
    var aftertext = "";
    reader.onload = function(){
      //the reader.result will only be available when loading not after
      //or before
      aftertext = reader.result;

      //storetext is he function that will do something with the file,
      //like making a visualization
      storetext(aftertext);
    };

    //debug operation to check if the loading and processing of the file went
    //correct
    reader.onloadend = function(){
      console.log("done loading");
    };

    //the line that will activate the reading of the file and the
    //reader.onload and the reader.onloadend
    reader.readAsText(input.files[0]);
  }
}

//the function that will display the visualization with the (.csv) .tsv as input
function storetext(text) {
  //turns the tsv into json format
  var data = tsvJSON(text);

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
  var svg = d3.select("#svgpainter")
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
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

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
        .attr("transform", function(d, i) { return "translate(0," + i * 20
                                                    + ")"; });

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

    //from http://bl.ocks.org/Rokotyan/0556f8facbaf344507cdc45dc3622177
    // Set-up the export button
    d3.select('#saveButton').on('click', function(){
    	downloadSvg(document.getElementById("svgpainter"), "fun.png");
    });

    //both the triggerDownload and the downloadSvg function are
    //from https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
    //form user worstenbrood
    function triggerDownload (imgURI, fileName) {
      //internal click event to activate the download
      var evt = new MouseEvent("click", {
        view: window,
        bubbles: false,
        cancelable: true
      });
      //the html element that will provide the download
      var a = document.createElement("a");
      //setting the attribute so the download can happen
      a.setAttribute("download", fileName);
      a.setAttribute("href", imgURI);
      a.setAttribute("target", '_blank');
      //trigger the download event
      a.dispatchEvent(evt);
    }

    //the svg to download procedure has the structure of going from
    //svg to canvas to picture to download
    function downloadSvg(svg, fileName) {
      //setting up the canvas
      var canvas = document.createElement("canvas");
      var bbox = svg.getBBox();
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, bbox.width, bbox.height);
      //serialize the svg to data so that it can be made into a picture blob
      var data = (new XMLSerializer()).serializeToString(svg);
      var DOMURL = window.URL || window.webkitURL || window;
      var img = new Image();
      var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
      var url = DOMURL.createObjectURL(svgBlob);
      img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob)
        {
            var blob = canvas.msToBlob();
            navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            var imgURI = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            triggerDownload(imgURI, fileName);
        }
        document.removeChild(canvas);
      };
      img.src = url;
    }

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
