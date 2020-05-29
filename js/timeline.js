function useFile(event){
  var files = event.target.files[0];
  var reader = new FileReader();
  reader.onload = function(ev) {
    var json = csvJSON(ev.target.result);
    visualize(json);
  };
  reader.readAsText(files);
}

//var csv is the CSV file with headers
function csvJSON(csv){

  var lines=csv.split("\n");

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers=lines[0].split("	");

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

function visualize(jsonObj) {
  var imageNames = [];
  var pictureSize = 200;
  var userScroll = 0;
  var loadedUserLines = [];
  var selectUserLine = 0;
  var userLineData = [];
  var pictureZoomFactor = 0.9;
  var mouseX = 0;
  var mouseY = 0;
  var svg = d3.select("#canvas");
  var svgInfo = document.getElementById("canvas").getBoundingClientRect();
  var width = svgInfo.width;
  var height = svgInfo.height;
  var uniqueUsers = [];
  var select = d3.select("#selector");
  select.on("change", function() {
    filterImageNames(this.value);
  });
  sortImageNames();
  filterImageNames(imageNames[0]);
  console.log("finished");
  function sortImageNames() {
    for (const el of jsonObj) {
      if (!imageNames.includes(el.StimuliName)) {
        imageNames.push(el.StimuliName);
      }
    }
    var x = document.getElementById("selector");
    for (const el of imageNames) {
      var option = document.createElement("option");
      option.text = el;
      option.value = el;
      x.add(option);
    }
  }
  function reloadData(json) {
    //changed this
    for( let i=0; i < uniqueUsers.length; i++){
      d3.selectAll(".userPictures-" + i.toString()).remove();
      d3.selectAll(".userDefs" + i.toString()).remove();
      d3.selectAll("#userText-" + i.toString()).remove();
    }

    userScroll = 0;
    loadedUserLines = [];
    userLineData = [];
    pictureZoomFactor = 0.9;
    mouseX = 0;
    mouseY = 0;
    uniqueUsers = [];
    svg.remove();
    svg = d3
      .select("#canvasCase")
      .append("svg")
      .attr("id", "canvas");
    for (let i = 0; i < json.length; i++) {
      if (!uniqueUsers.includes(json[i].user)) {
        uniqueUsers.push(json[i].user);
      }
    }
    for (let i = 0; i < uniqueUsers.length; i++) {
      var pointsOfInterest = [];
      for (var j = 0; j < json.length; j++) {
        if (json[j].user == uniqueUsers[i]) {
          pointsOfInterest.push(json[j]);
        }
      }
      var currentLineData = {
        loadedPictures: [],
        points: pointsOfInterest,
        pictureOffset: 0
      };
      userLineData.push(currentLineData);
      userLineData[i].height = pictureSize * i;
      userLineData[i].horizontalOffset = 0;
    }
    for (let i = 0; i < height / pictureSize; i++) {
      if (userLineData.length > i) {
        loadUserLine(i);
      }
    }
    //changed this
    var slider = document.getElementById("timeLineSlider");
    slider.max = userLineData[0].points.length * pictureSize - width;
    slider.value = -userLineData[0].horizontalOffset;

    //changed this
    svg.on("mousemove", function() {
      var mouseCoords = d3.mouse(this);
      mouseX = mouseCoords[0];
      mouseY = mouseCoords[1];
    });
    setInterval(main, 10);
  }
  function filterImageNames(name) {
    var jsonRet = [];
    for (var i = 0; i < jsonObj.length; i++) {
      if (jsonObj[i].StimuliName == name) {
        jsonRet.push(jsonObj[i]);
      }
    }
    reloadData(jsonRet);
  }
  function loadUserLine(lineNumber) {
    loadedUserLines.push(lineNumber);
    for (var i = 0; i < Math.ceil(width / pictureSize) + 2; i++) {
      userLineData[lineNumber].loadedPictures.push(i);
      var defs = svg
        .append("defs")
        .attr("class", "userDefs" + lineNumber.toString());
      var pattern = defs
        .append("pattern")
        .attr(
          "id",
          "imgpattern-" + lineNumber.toString() + "-" + i.toString()
        )
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", 0)
        .attr("y", 0);
      pattern
        .append("svg:image")
        .attr(
          "x",
          pictureSize / 2 -
            pictureZoomFactor *
              userLineData[lineNumber].points[i].MappedFixationPointX
        )
        .attr(
          "y",
          pictureSize / 2 -
            pictureZoomFactor *
              userLineData[lineNumber].points[i].MappedFixationPointY
        )
        .attr("width", pictureZoomFactor * 1600)
        .attr("height", pictureZoomFactor * 1200)
        .attr(
          "xlink:href",
          "pictures/" + userLineData[lineNumber].points[i].StimuliName
        );
      svg
        .insert("rect") // attach a rectangle
        .style("stroke", "black") // colour the rectangle
        .attr(
          "id",
          "userPictures-" + lineNumber.toString() + "-" + i.toString()
        )
        .attr("class", "userPictures-" + lineNumber.toString()) // the rectangle for each picture of a single user
        .attr("x", pictureSize * i) // x position of the left and up most point of the rectangle
        .attr("y", userLineData[lineNumber].height) // y position of the left and up most point of the rectangle
        .attr("width", pictureSize)
        .attr("height", pictureSize)
        .attr(
          "fill",
          "url(#imgpattern-" +
            lineNumber.toString() +
            "-" +
            i.toString() +
            ")"
        );
    }
    //added this
    svg.append("text")
        .attr("id", "userText-" + lineNumber.toString())
        .attr("x", 20)
        .attr("y", userLineData[lineNumber].height - pictureSize/2)
        .attr("fill", "red")
        .text(userLineData[lineNumber].points[0].user)
  }
  function unloadUserLine(lineNumber) {
    //changed this
    loadedUserLines.splice(loadedUserLines.indexOf(lineNumber));
    d3.selectAll(".userPictures-" + lineNumber.toString()).remove();
    d3.selectAll(".userDefs" + lineNumber.toString()).remove();
    d3.selectAll("#userText-" + lineNumber.toString()).remove();
  }

  function overLoadPicture(lineNumber, forwards) {
    if (forwards) {
      //changed this
      d3.select(d3.selectAll(".userPictures-" + lineNumber.toString())["_groups"][0][0]).remove();
      userLineData[lineNumber].loadedPictures.shift();
      var ik =
        Math.ceil(width / pictureSize) +
        userLineData[lineNumber].pictureOffset;
      userLineData[lineNumber].loadedPictures.push(ik);
      let defs = svg
        .append("defs")
        .attr("class", "userDefs" + lineNumber.toString());
      let pattern = defs
        .append("pattern")
        .attr(
          "id",
          "imgpattern-" + lineNumber.toString() + "-" + ik.toString()
        )
        .attr("height", 1)
        .attr("width", 1)
        .attr("x", 0)
        .attr("y", 0);
      pattern
        .append("svg:image")
        .attr(
          "x",
          pictureSize / 2 -
            pictureZoomFactor *
              userLineData[lineNumber].points[ik].MappedFixationPointX
        )
        .attr(
          "y",
          pictureSize / 2 -
            pictureZoomFactor *
              userLineData[lineNumber].points[ik].MappedFixationPointY
        )
        .attr("width", pictureZoomFactor * 1600)
        .attr("height", pictureZoomFactor * 1200)
        .attr(
          "xlink:href",
          "pictures/" + userLineData[lineNumber].points[ik].StimuliName
        );
      svg
        .insert("rect") // attach a rectangle
        .style("stroke", "black") // colour the rectangle
        .attr(
          "id",
          "userPictures-" + lineNumber.toString() + "-" + ik.toString()
        )
        .attr("class", "userPictures-" + lineNumber.toString()) // the rectangle for each picture of a single user
        .attr("x", pictureSize * ik) // x position of the left and up most point of the rectangle
        .attr("y", userLineData[lineNumber].height) // y position of the left and up most point of the rectangle
        .attr("width", pictureSize)
        .attr("height", pictureSize)
        .attr(
          "fill",
          "url(#imgpattern-" +
            lineNumber.toString() +
            "-" +
            ik.toString() +
            ")"
        );
      userLineData[lineNumber].pictureOffset += 1;
    } else {
      //changed this
      if(userLineData[lineNumber].pictureOffset - 1 >= 0){
        d3.select(
          d3.selectAll(".userPictures-" + lineNumber.toString())[
            "_groups"
          ][0][
            d3.selectAll(".userPictures-" + lineNumber.toString())[
              "_groups"
            ][0].length - 1
          ]
        ).remove();
        userLineData[lineNumber].loadedPictures.pop();
        var ij = userLineData[lineNumber].pictureOffset - 1;
        userLineData[lineNumber].loadedPictures.unshift(ij);
        let defs = svg
          .append("defs")
          .attr("class", "userDefs" + lineNumber.toString());
        let pattern = defs
          .append("pattern")
          .attr(
            "id",
            "imgpattern-" + lineNumber.toString() + "-" + ij.toString()
          )
          .attr("height", 1)
          .attr("width", 1)
          .attr("x", 0)
          .attr("y", 0);
        pattern
          .append("svg:image")
          .attr(
            "x",
            pictureSize / 2 -
              pictureZoomFactor *
                userLineData[lineNumber].points[ij].MappedFixationPointX
          )
          .attr(
            "y",
            pictureSize / 2 -
              pictureZoomFactor *
                userLineData[lineNumber].points[ij].MappedFixationPointY
          )
          .attr("width", pictureZoomFactor * 1600)
          .attr("height", pictureZoomFactor * 1200)
          .attr(
            "xlink:href",
            "pictures/" + userLineData[lineNumber].points[ij].StimuliName
          );
        svg
          .insert(
            "rect",
            "#userPictures-" +
              lineNumber.toString() +
              "-" +
              userLineData[lineNumber].loadedPictures[1].toString()
          ) // attach a rectangle
          .style("stroke", "black") // colour the rectangle
          .attr(
            "id",
            "userPictures-" + lineNumber.toString() + "-" + ij.toString()
          )
          .attr("class", "userPictures-" + lineNumber.toString()) // the rectangle for each picture of a single user
          .attr("x", pictureSize * ij) // x position of the left and up most point of the rectangle
          .attr("y", userLineData[lineNumber].height) // y position of the left and up most point of the rectangle
          .attr("width", pictureSize)
          .attr("height", pictureSize)
          .attr(
            "fill",
            "url(#imgpattern-" +
              lineNumber.toString() +
              "-" +
              ij.toString() +
              ")"
          );
        userLineData[lineNumber].pictureOffset -= 1;
      }
    }
  }
  function setLineHeight() {
    for (var i = 0; i < uniqueUsers.length; i++) {
      userLineData[i].height = pictureSize * i + userScroll;
      //if not looked at this line and was looked at this line than unload the points of interest
      if ((loadedUserLines.includes(i) && userLineData[i].height < -pictureSize) || (loadedUserLines.includes(i) && height+pictureSize < userLineData[i].height)) {
        unloadUserLine(i);
      } else if (!loadedUserLines.includes(i) &&-pictureSize < userLineData[i].height && userLineData[i].height < height+pictureSize) {
        loadUserLine(i);
      }
      //set height of the pictures
      if (loadedUserLines.includes(i)) {
        d3.selectAll(".userPictures-" + i.toString()).attr("y", () => {
          return userLineData[i].height;
        });
        d3.selectAll("#userText-" + i.toString()).attr("y", () => {
          return userLineData[i].height-pictureSize/2;
        });
      }
    }
  }
  function scrollUserLine() {
    if (loadedUserLines.length > 0) {
      //calculate the userline that is closest to the middle
      var closestUserLine = loadedUserLines[0];
      for (var i = 1; i < loadedUserLines.length; i++) {
        //changed to height == 0
        if ( Math.pow(userLineData[loadedUserLines[i]].height, 2) < Math.pow(userLineData[closestUserLine].height, 2)) {
          closestUserLine = loadedUserLines[i];
        }
      }

      //changed this
      if (closestUserLine != selectUserLine) {
        selectUserLine = closestUserLine;
        var slider = document.getElementById("timeLineSlider");
        slider.max = userLineData[closestUserLine].points.length * pictureSize - width;
        slider.value = -userLineData[closestUserLine].horizontalOffset;
      }
      //add sideways scrolling
      //changed this
      var slide = document.getElementById("timeLineSlider").value;
      if(-slide + pictureSize * (userLineData[closestUserLine].points.length) > width){
        userLineData[closestUserLine].horizontalOffset = -slide;
      }

      //remove this
      // //limit the horizontal scrolling to the first and last pictures
      // if (userLineData[closestUserLine].horizontalOffset > 0) {
      //   userLineData[closestUserLine].horizontalOffset = 0;
      // } else if (userLineData[closestUserLine].horizontalOffset < -(userLineData[closestUserLine].points.length-1) * pictureSize
      // ) {
      //   userLineData[closestUserLine].horizontalOffset =
      //     -(userLineData[closestUserLine].points.length-1) * pictureSize;
      // }

      //scroll the pictures
      for (let i = 0; i < d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0].length;i++) {
        d3.select(d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0][i]).attr("x", () => {
          return (userLineData[closestUserLine].horizontalOffset + pictureSize * (i + userLineData[closestUserLine].pictureOffset)
          );
        });
      }
      //update the pictures if one goes out of bounds
      var max = d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0].length - 1;
      if (max >= 0 && d3.select(d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0][0]).attr("x") < -pictureSize * 1.5) {
        overLoadPicture(closestUserLine, true);
      } else if (max >= 0 && d3.select(d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0][max]).attr("x") > width + pictureSize * 2) {
        overLoadPicture(closestUserLine, false);
      }
    }
  }
  function main() {
    //if user wants to scroll up or down
    //changed this
    if ( mouseX > width*4/5 && mouseX < width && (
      0.01 * (height / 2 - mouseY) > 0.75 ||
      0.01 * (height / 2 - mouseY) < -0.75
    )) {
      userScroll += 0.1 * (height / 2 - mouseY);
    }
    //sets maximum for vertical scrolling
    //changed this
    if (userScroll < -(userLineData.length-1) * pictureSize) {
      userScroll = -(userLineData.length-1) * pictureSize;
    } else if (userScroll > 0) {
      userScroll = 0;
    }
    //scrolls the user lines up and down
    setLineHeight();
    scrollUserLine();
  }
}
