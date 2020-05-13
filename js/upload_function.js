function openfileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    console.log(overallData.length);

    var input = evt.dataTransfer; // FileList object.
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
      };
      reader.readAsText(input.files[0]);
    }
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', openfileDrop, false);

  var overallData = [];

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
      };
      reader.readAsText(input.files[0]);
    }
  }

  function storetext(text) {
    var jsonData = tsvJSON(text);
    // var nested_data = d3.nest()
    //                   .key(function(d) { return d.StimuliName; })
    //                   .entries(jsonData);
    overallData = jsonData;
    var svgContainer = d3.select("#painter").append("svg")
                                      .attr("width", 200)
                                      .attr("height", 200);

    var circles = svgContainer.selectAll("circle")
                              .data(dat.map(function(d){return d.FixationIndex}))
                              .enter()
                              .append("circle");

    var circleAttributes = circles
                          .attr("cx", function (d) { return d; })
                          .attr("cy", function (d) { return d; })
                          .attr("r", 20 )
                          .style("fill", function(d) {
                          var returnColor;
                          if (d === 30) { returnColor = "green";
                          } else if (d === 70) { returnColor = "purple";
                          } else if (d === 110) { returnColor = "red"; }
                          return returnColor;
                          });
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
