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
  
      d3.select("#saveButton").on("click", function() {
        screenshot();
      });
      async function screenshot() {
        var screenshotJpegBlob = await takeScreenshotJpegBlob()
  
        // show preview with max size 300 x 300 px
        var previewCanvas = await blobToCanvas(screenshotJpegBlob, 300, 300)
        previewCanvas.style.position = 'fixed'
        document.body.appendChild(previewCanvas)
  
        // send it to the server
        let formdata = new FormData()
        formdata.append("screenshot", screenshotJpegBlob)
        // await fetch('file:///C:/Users/20191704/Documents/GitHub/Viseye/index.html', {
        //     method: 'POST',
        //     body: formdata,
        //     'Content-Type' : "multipart/form-data",
        // })
      }
  
      function getDisplayMedia(options) {
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
              return navigator.mediaDevices.getDisplayMedia(options)
          }
          if (navigator.getDisplayMedia) {
              return navigator.getDisplayMedia(options)
          }
          if (navigator.webkitGetDisplayMedia) {
              return navigator.webkitGetDisplayMedia(options)
          }
          if (navigator.mozGetDisplayMedia) {
              return navigator.mozGetDisplayMedia(options)
          }
          throw new Error('getDisplayMedia is not defined')
      }
  
      function getUserMedia(options) {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              return navigator.mediaDevices.getUserMedia(options)
          }
          if (navigator.getUserMedia) {
              return navigator.getUserMedia(options)
          }
          if (navigator.webkitGetUserMedia) {
              return navigator.webkitGetUserMedia(options)
          }
          if (navigator.mozGetUserMedia) {
              return navigator.mozGetUserMedia(options)
          }
          throw new Error('getUserMedia is not defined')
      }
  
      async function takeScreenshotStream() {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/Window/screen
          const width = screen.width * (window.devicePixelRatio || 1)
          const height = screen.height * (window.devicePixelRatio || 1)
  
          const errors = []
          let stream
          try {
              stream = await getDisplayMedia({
                  audio: false,
                  // see: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints/video
                  video: {
                      width,
                      height,
                      frameRate: 1,
                  },
              })
          } catch (ex) {
              errors.push(ex)
          }
  
          try {
              // for electron js
              stream = await getUserMedia({
                  audio: false,
                  video: {
                      mandatory: {
                          chromeMediaSource: 'desktop',
                          // chromeMediaSourceId: source.id,
                          minWidth         : width,
                          maxWidth         : width,
                          minHeight        : height,
                          maxHeight        : height,
                      },
                  },
              })
          } catch (ex) {
              errors.push(ex)
          }
  
          if (errors.length) {
              console.debug(...errors)
          }
  
          return stream
      }
  
      async function takeScreenshotCanvas() {
          const stream = await takeScreenshotStream()
  
          if (!stream) {
              return null
          }
  
          // from: https://stackoverflow.com/a/57665309/5221762
          const video = document.createElement('video')
          const result = await new Promise((resolve, reject) => {
              video.onloadedmetadata = () => {
                  video.play()
                  video.pause()
  
                  // from: https://github.com/kasprownik/electron-screencapture/blob/master/index.js
                  const canvas = document.createElement('canvas')
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight
                  const context = canvas.getContext('2d')
                  // see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement
                  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
                  resolve(canvas)
              }
              video.srcObject = stream
          })
  
          stream.getTracks().forEach(function (track) {
              track.stop()
          })
  
          return result
      }
  
      // from: https://stackoverflow.com/a/46182044/5221762
      function getJpegBlob(canvas) {
          return new Promise((resolve, reject) => {
              // docs: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
              canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95)
          })
      }
  
      async function getJpegBytes(canvas) {
          const blob = await getJpegBlob(canvas)
          return new Promise((resolve, reject) => {
              const fileReader = new FileReader()
  
              fileReader.addEventListener('loadend', function () {
                  if (this.error) {
                      reject(this.error)
                      return
                  }
                  resolve(this.result)
              })
  
              fileReader.readAsArrayBuffer(blob)
          })
      }
  
      async function takeScreenshotJpegBlob() {
          const canvas = await takeScreenshotCanvas()
          if (!canvas) {
              return null
          }
          return getJpegBlob(canvas)
      }
  
      async function takeScreenshotJpegBytes() {
          const canvas = await takeScreenshotCanvas()
          if (!canvas) {
              return null
          }
          return getJpegBytes(canvas)
      }
  
      function blobToCanvas(blob, maxWidth, maxHeight) {
          return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = function () {
                  const canvas = document.createElement('canvas')
                  const scale = Math.min(
                      1,
                      maxWidth ? maxWidth / img.width : 1,
                      maxHeight ? maxHeight / img.height : 1,
                  )
                  canvas.width = img.width * scale
                  canvas.height = img.height * scale
                  const ctx = canvas.getContext('2d')
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
                  resolve(canvas)
              }
              img.onerror = () => {
                  reject(new Error('Error load blob to Image'))
              }
              img.src = URL.createObjectURL(blob)
              triggerDownload(URL.createObjectURL(blob), "hello.png");
          })
          // var imgURI = canvas
          //     .toDataURL("image/png")
          //     .replace("image/png", "image/octet-stream");
          // triggerDownload(imgURI, fileName);
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