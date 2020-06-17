<template>
  <div class="visrow height-fix">
    <div class="viscol col80">
      <div id="canvasCase">
        <svg id="canvas" />
      </div>
    </div>
    <div class="viscol col20 bg-ldgray">
      <div class="vismenurow bmar-tiny">
        <label class="label">Horizontal slider</label>
      </div>
      <div class="vismenurow bmar-tiny">
        <input type="range" min="0" max="10000" value="0" class="slider" id="timeLineSlider" />
      </div>
      <div class="vismenurow bmar-tiny">
        <label class="label">Vertical slider</label>
      </div>
      <div class="vismenurow bmar-tiny">
        <input type="range" min="0" max="10000" value="0" class="slider" id="userSlider" />
      </div>
      <div class="vismenurow bmar-tiny">
        <div class="bottom-align vw17 right-zero">
          <button type="button" class="button button-orange bmar-small full-width" @click="info">info</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  data() {
    return {
      activeVis: this.$parent.activeVis
    }
  },
  computed: {
    ...mapState(["files"])
  },
  mounted: function() {
    this.visualize();
  },
  methods: {
    visualize() {
      const vm = this;
      var jsonObj = vm.files;
      var imageNames = [];
      var pictureSize = 200;
      var userScroll = 0;
      var loadedUserLines = [];
      var selectUserLine = 0;
      var userLineData = [];
      var pictureZoomFactor = 0.9;
      var svg = d3.select("#canvas");
      var svgInfo = document.getElementById("canvas").getBoundingClientRect();
      var width = svgInfo.width;
      var height = svgInfo.height;
      var uniqueUsers = [];
      var select = d3.select("#selectMenu");
      var timer;

      select.on("change", function () {
        filterImageNames(this.value);
      });
      var startSelection = select.node().value;

      sortImageNames();
      filterImageNames(startSelection);

      function sortImageNames() {
        for (const el of jsonObj) {
          if (!imageNames.includes(el.StimuliName)) {
            imageNames.push(el.StimuliName);
          }
        }
        var x = document.getElementById("selectMenu");
        for (const el of imageNames) {
          var option = document.createElement("option");
          option.text = el;
          option.value = el;
          x.add(option);
        }
      }
      function reloadData(json) {
        //changed this
        for (let i = 0; i < uniqueUsers.length; i++) {
          d3.selectAll(".userPictures-" + i.toString()).remove();
          d3.selectAll(".userDefs" + i.toString()).remove();
          d3.selectAll("#userText-" + i.toString()).remove();
          d3.selectAll("#userTextrect-" + i.toString()).remove();
        }

        userScroll = 0;
        loadedUserLines = [];
        userLineData = [];
        pictureZoomFactor = 0.9;
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
        for (let i = 0; i < Math.ceil(height / pictureSize); i++) {
          if (userLineData.length > i) {
            loadUserLine(i);
          }
        }
        var slider = document.getElementById("timeLineSlider");
        slider.max = userLineData[0].points.length * pictureSize - width;
        slider.value = -userLineData[0].horizontalOffset;

        var userSlider = document.getElementById("userSlider");
        userSlider.max = (userLineData.length-1) * pictureSize;
        slider.value = 0;

        timer = setInterval(main, 10);
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
              "static/jpg/" + userLineData[lineNumber].points[i].StimuliName
            );
          svg
            .insert("rect", "#userText-" + lineNumber.toString()) // attach a rectangle
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
        let text = svg.append("text")
          .attr("id", "userText-" + lineNumber.toString())
          .attr("x", 20)
          .attr("y", userLineData[lineNumber].height - pictureSize / 2)
          .text(userLineData[lineNumber].points[0].user)
          .style("fill", "white");

        let bbox = text.node().getBBox();
        let padding = 6;
        svg.insert("rect", "#userText-" + lineNumber.toString())
            .attr("id", "userTextrect-" + lineNumber.toString())
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + (padding*2))
            .attr("height", bbox.height + (padding*2))
            .style("fill", "black");
      }
      function unloadUserLine(lineNumber) {
        //changed this
        loadedUserLines.splice(loadedUserLines.indexOf(lineNumber));
        d3.selectAll(".userPictures-" + lineNumber.toString()).remove();
        d3.selectAll(".userDefs" + lineNumber.toString()).remove();
        d3.selectAll("#userText-" + lineNumber.toString()).remove();
        d3.selectAll("#userTextrect-" + lineNumber.toString()).remove();
      }

      function overLoadPicture(lineNumber) {
        //changed this
        d3.selectAll(".userPictures-" + lineNumber.toString()).remove();
        d3.selectAll(".userDefs" + lineNumber.toString()).remove();
        userLineData[lineNumber].loadedPictures = [];
        d3.selectAll("#userText-" + lineNumber.toString()).remove();
        d3.selectAll("#userTextrect-" + lineNumber.toString()).remove();

        let startingPictureID = Math.floor(-userLineData[lineNumber].horizontalOffset/pictureSize);
        let startingPictureOffset = userLineData[lineNumber].horizontalOffset % pictureSize;

        for( let a=0; a < Math.floor(width/pictureSize)+1; a++){
          userLineData[lineNumber].loadedPictures.push(startingPictureID+a);
          let defs = svg
            .append("defs")
            .attr("class", "userDefs" + lineNumber.toString());
          let pattern = defs
            .append("pattern")
            .attr(
              "id",
              "imgpattern-" + lineNumber.toString() + "-" + (startingPictureID+a).toString()
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
              userLineData[lineNumber].points[startingPictureID+a].MappedFixationPointX
            )
            .attr(
              "y",
              pictureSize / 2 -
              pictureZoomFactor *
              userLineData[lineNumber].points[startingPictureID+a].MappedFixationPointY
            )
            .attr("width", pictureZoomFactor * 1600)
            .attr("height", pictureZoomFactor * 1200)
            .attr(
              "xlink:href",
              "static/jpg/" + userLineData[lineNumber].points[startingPictureID+a].StimuliName
            );
          svg
            .insert("rect", "#userText-" + lineNumber.toString()) // attach a rectangle
            .style("stroke", "black") // colour the rectangle
            .attr(
              "id",
              "userPictures-" + lineNumber.toString() + "-" + (startingPictureID+a).toString()
            )
            .attr("class", "userPictures-" + lineNumber.toString()) // the rectangle for each picture of a single user
            .attr("x", pictureSize * a + startingPictureOffset) // x position of the left and up most point of the rectangle
            .attr("y", userLineData[lineNumber].height) // y position of the left and up most point of the rectangle
            .attr("width", pictureSize)
            .attr("height", pictureSize)
            .attr(
              "fill",
              "url(#imgpattern-" +
              lineNumber.toString() +
              "-" +
              (startingPictureID+a).toString() +
              ")"
            );
        }
        // now load the text of the user

        let text = svg.append("text")
          .attr("id", "userText-" + lineNumber.toString())
          .attr("x", 20)
          .attr("y", userLineData[lineNumber].height - pictureSize / 2)
          .text(userLineData[lineNumber].points[0].user)
          .style("fill", "white");

        let bbox = text.node().getBBox();
        let padding = 6;
        svg.insert("rect", "#userText-" + lineNumber.toString())
            .attr("id", "userTextrect-" + lineNumber.toString())
            .attr("x", bbox.x - padding)
            .attr("y", bbox.y - padding)
            .attr("width", bbox.width + (padding*2))
            .attr("height", bbox.height + (padding*2))
            .style("fill", "black");

      }

      function setLineHeight() {
        userScroll = -document.getElementById("userSlider").value;
        for (var i = 0; i < uniqueUsers.length; i++) {
          userLineData[i].height = pictureSize * i + userScroll;
          //if not looked at this line and was looked at this line than unload the points of interest
          if ((loadedUserLines.includes(i) && userLineData[i].height < -pictureSize) || (loadedUserLines.includes(i) && height + pictureSize < userLineData[i].height)) {
            unloadUserLine(i);
          } else if (!loadedUserLines.includes(i) && -pictureSize < userLineData[i].height && userLineData[i].height < height + pictureSize) {
            loadUserLine(i);
          }
          //set height of the pictures
          if (loadedUserLines.includes(i)) {
            d3.selectAll(".userPictures-" + i.toString()).attr("y", () => {
              return userLineData[i].height;
            });
            d3.selectAll("#userText-" + i.toString()).attr("y", () => {
              return userLineData[i].height + pictureSize / 2;
            });
            d3.selectAll("#userTextrect-" + i.toString()).attr("y", () => {
              let text = d3.select("#userText-" + i.toString());
              let bbox = text.node().getBBox();
              let padding = 6;
              return bbox.y - padding;
            });
          } else {
            d3.selectAll(".userPictures-" + i.toString()).attr("y", () => {
              return -2*pictureSize;
            });
            d3.selectAll("#userText-" + i.toString()).attr("y", () => {
              return -2*pictureSize;
            });
            d3.selectAll("#userTextrect-" + i.toString()).attr("y", () => {
              let text = d3.select("#userText-" + i.toString());
              let bbox = text.node().getBBox();
              let padding = 6;
              return bbox.y - padding;
            });
          }
        }
      }
      function scrollUserLine() {
        if (loadedUserLines.length > 0) {
          //calculate the userline that is closest to the middle
          var closestUserLine = loadedUserLines[0];
          for (var i = 1; i < loadedUserLines.length; i++) {
            if (Math.pow(userLineData[loadedUserLines[i]].height-pictureSize/2, 2) < Math.pow(userLineData[closestUserLine].height-pictureSize/2, 2)) {
              closestUserLine = loadedUserLines[i];
            }
          }
          if (closestUserLine != selectUserLine) {
            selectUserLine = closestUserLine;
            var slider = document.getElementById("timeLineSlider");
            slider.max = userLineData[closestUserLine].points.length * pictureSize - width;
            slider.value = -userLineData[closestUserLine].horizontalOffset;
          }
          //add sideways scrolling
          var slide = document.getElementById("timeLineSlider").value;
          if (-slide + pictureSize * (userLineData[closestUserLine].points.length) > width) {
            userLineData[closestUserLine].horizontalOffset = -slide;
          }

          //scroll the pictures
          for (let i = 0; i < d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0].length; i++) {
            d3.select(d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0][i]).attr("x", () => {
              return (userLineData[closestUserLine].horizontalOffset + pictureSize * (i + userLineData[closestUserLine].pictureOffset)
              );
            });
          }
          //changed this
          //update the pictures if one goes out of bounds
          let needReload = false;
          for (let i = 0; i < d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0].length; i++) {
            if(width < d3.select(d3.selectAll(".userPictures-" + closestUserLine.toString())["_groups"][0][i]).attr("x") < -pictureSize){
              needReload = true;
              break;
            }
          }
          //changed this
          if (needReload === true) {
            overLoadPicture(closestUserLine);
          }
        }
      }
      function main() {
        vm.updateActiveVis();
        if (vm.activeVis === "gaze_stripes") {
        setLineHeight();
        scrollUserLine();
        } else {
          clearInterval(timer);
        }
      }
    },
    info() {
      window.alert("A gaze stripe plot is a series of images with a gaze point in the middle of each image. Each gaze stripe is fixated to a single participant. You are able to scroll through the gaze stripe using the upper slider in the right column. This shows the focus points of a participant over time. Scrolling through the gaze stripes of the different participants vertically can be done with the bottom slider. To select another metro map, you can simply change the city in the left column.");
    },
    updateActiveVis() {
      this.activeVis = this.$parent.activeVis;
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
  height: 100%;
}

#canvasCase{
  height: 100%;
}
</style>