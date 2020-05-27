<template>
  <div class="canvas">
    <div id="canvasCase">
      <svg id="canvas" />
    </div>
    <br />
    <input type="range" min="0" max="10000" value="0" class="slider" id="timeLineSlider" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  computed: {
    ...mapState(["files"])
  },
  mounted: function() {
    this.visualize();
  },
  methods: {
    visualize() {
      var jsonObj = this.files;
      var imageNames = [];

      var pictureSize = 200;

      var userScroll = 0;
      var loadedUserLines = [];
      var selectUserLine = 0;
      var userLineData = [];
      var pictureZoomFactor = 0.9;

     //var mouseX = 0;
      var mouseY = 0;

      var svg = d3.select("#canvas");

      var svgInfo = document.getElementById("canvas").getBoundingClientRect();
      var width = svgInfo.width;
      var height = svgInfo.height;

      var uniqueUsers = [];

      var select = d3.select("#selectMenu");
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
        userScroll = 0;
        loadedUserLines = [];
        userLineData = [];
        pictureZoomFactor = 0.9;

        //mouseX = 0;
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
        console.log("loadingline");

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
              "static/jpg/" + userLineData[lineNumber].points[i].StimuliName
            );

          svg
            .append("rect") // attach a rectangle
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
      }

      function unloadUserLine(lineNumber) {
        loadedUserLines.pop(loadedUserLines.indexOf(lineNumber));
        d3.selectAll(".userPictures-" + lineNumber.toString()).remove();
        d3.selectAll(".userDefs-" + lineNumber.toString()).remove();
      }

      function overLoadPicture(lineNumber, forwards) {
        console.log("overLoadPicture");
        if (forwards) {
          if (
            userLineData[lineNumber].pictureOffset <
            userLineData[lineNumber].points.length
          ) {
            d3.select(
              d3.selectAll(".userPictures-" + lineNumber.toString())[
                "_groups"
              ][0][0]
            ).remove();
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
                "static/jpg/" + userLineData[lineNumber].points[ik].StimuliName
              );

            svg
              .append("rect") // attach a rectangle
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
          }
        } else {
          if (userLineData[lineNumber].pictureOffset > 0) {
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
                "static/jpg/" + userLineData[lineNumber].points[ij].StimuliName
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
          if (
            (loadedUserLines.includes(i) &&
              userLineData[i].height < -pictureSize) ||
            (loadedUserLines.includes(i) && height < userLineData[i].height)
          ) {
            unloadUserLine(i);
          } else if (
            !loadedUserLines.includes(i) &&
            -pictureSize < userLineData[i].height &&
            userLineData[i].height < height
          ) {
            loadUserLine(i);
          }
          //set height of the pictures
          if (loadedUserLines.includes(i)) {
            d3.selectAll(".userPictures-" + i.toString()).attr("y", () => {
              return userLineData[i].height;
            });
          }
        }
      }

      function scrollUserLine() {
        if (loadedUserLines.length > 0) {
          //calculate the userline that is closest to the middle
          var closestUserLine = loadedUserLines[0];
          for (var i = 1; i < loadedUserLines.length; i++) {
            if (
              Math.pow(
                userLineData[loadedUserLines[i]].height - height / 2,
                2
              ) < Math.pow(userLineData[closestUserLine].height - height / 2, 2)
            ) {
              closestUserLine = loadedUserLines[i];
            }
          }

          if (closestUserLine != selectUserLine) {
            selectUserLine = closestUserLine;
            var slider = document.getElementById("timeLineSlider");
            slider.max =
              userLineData[closestUserLine].points.length * pictureSize;
            slider.value = -userLineData[closestUserLine].horizontalOffset;
          }

          //add sideways scrolling
          var slide = document.getElementById("timeLineSlider").value;
          userLineData[closestUserLine].horizontalOffset = -slide;

          //limit the horizontal scrolling to the first and last pictures
          if (userLineData[closestUserLine].horizontalOffset > 0) {
            userLineData[closestUserLine].horizontalOffset = 0;
          } else if (
            userLineData[closestUserLine].horizontalOffset <
            -userLineData[closestUserLine].points.length * pictureSize
          ) {
            userLineData[closestUserLine].horizontalOffset =
              -userLineData[closestUserLine].points.length * pictureSize;
          }

          //scroll the pictures
          for (
            let i = 0;
            i <
            d3.selectAll(".userPictures-" + closestUserLine.toString())[
              "_groups"
            ][0].length;
            i++
          ) {
            d3.select(
              d3.selectAll(".userPictures-" + closestUserLine.toString())[
                "_groups"
              ][0][i]
            ).attr("x", () => {
              return (
                userLineData[closestUserLine].horizontalOffset +
                pictureSize * (i + userLineData[closestUserLine].pictureOffset)
              );
            });
          }
          //update the pictures if one goes out of bounds
          var max =
            d3.selectAll(".userPictures-" + closestUserLine.toString())[
              "_groups"
            ][0].length - 1;
          if (
            max >= 0 &&
            d3
              .select(
                d3.selectAll(".userPictures-" + closestUserLine.toString())[
                  "_groups"
                ][0][0]
              )
              .attr("x") <
              -pictureSize * 1.5
          ) {
            overLoadPicture(closestUserLine, true);
          } else if (
            max >= 0 &&
            d3
              .select(
                d3.selectAll(".userPictures-" + closestUserLine.toString())[
                  "_groups"
                ][0][max]
              )
              .attr("x") >
              width + pictureSize * 2
          ) {
            overLoadPicture(closestUserLine, false);
          }
        }
      }

      svg.on("mousemove", function() {
        var mouseCoords = d3.mouse(this);
        //mouseX = mouseCoords[0];
        mouseY = mouseCoords[1];
      });

      setInterval(main, 10);

      function main() {
        //if user wants to scroll up or down
        if (
          0.01 * (height / 2 - mouseY) > 0.75 ||
          0.01 * (height / 2 - mouseY) < -0.75
        ) {
          userScroll += 0.1 * (height / 2 - mouseY);
        }
        //sets maximum for vertical scrolling
        if (userScroll < -uniqueUsers.length * pictureSize) {
          userScroll = -uniqueUsers.length * pictureSize;
        } else if (userScroll > 0) {
          userScroll = 0;
        }
        //scrolls the user lines up and down
        setLineHeight();
        scrollUserLine();
      }
    }
  }
};
</script>

<style>
#canvas{
  border-width: 2px;
  border-style: solid;
  border-color: black;
  width: 100%;
  height: 90%;
}

#timeLineSlider{
  width: 100%;
}

#canvasCase{
  width: 800px;
  height: 450px;
}
</style>