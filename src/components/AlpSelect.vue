<template>
  <div class="visrow height-fix">
    <div class="viscol col80">
      <svg class="svg-selection" id='svgSelectionMap' viewBox="0 0 960 500" width = "960" height = "500"></svg>
    </div>
    <div class="viscol col20 bg-ldgray">
      <div class="vismenurow bmar-tiny">
        <button type="button" class="button button-blue full-width" id="toAlpPlotButton" @click="toAlpPlot">go to alpscarf</button>
      </div>
    </div>
    <div class="bottom-align vw17 right-zero">
      <button type="button" class="button button-orange bmar-small full-width" @click="info">info</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import * as d3 from "d3";

export default {
  computed: {
    ...mapState([
      'files'
    ])
  },
  data() {
    return {
      data: []
    }
  },
  mounted: function() {
    this.visualize();
  },
  methods: {
    ...mapMutations([
      'addFilesAOI'
    ]),
    visualize() { 
      const svg = d3.select('#svgSelectionMap');

      const margin = { top: 0, right: 0, bottom: 0, left: 0 };
      const width = +svg.attr('width');
      const height = +svg.attr('height');
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const maxAmountOfAOI = 10;


      //Defining variables for general access
      let data;
      let stimulusName;
      let allVersions = [];
      //let dataSelected;
      let SquareArray = [];
      let xScale;
      let yScale;
      let intersectingRectangles = false;
      let possibleAoiNames = [];
      let currentNumberAoi = 0;
      let textList = [];
      let rectangleList = [];
      let labelMultiplier = 0.2;
      let vm = this;
      let AOIcolorlist;
      let AOIlist;
      let resData;

      // Fills the possible AOI numbers into the array, according to the max amount which is given.
      for(let k = 0; k<maxAmountOfAOI ;k++){
        possibleAoiNames.push(k);
      }

      // Makes a rectangle which is selected
      // Also defines the previous elements etc.
      // Also has a function which returns the attributes of the array
      var selectionRect = {
          element			: null,
          previousElement : null,
          currentY		: 0,
          currentX		: 0,
          originX			: 0,
          originY			: 0,
          setElement: function(ele) {
              this.previousElement = this.element;
              this.element = ele;
          },
          getNewAttributes: function() {
              var x = this.currentX<this.originX?this.currentX:this.originX;
              var y = this.currentY<this.originY?this.currentY:this.originY;
              var widthRectangle = Math.abs(this.currentX - this.originX);
              var heightRectangle = Math.abs(this.currentY - this.originY);
              return {
                  x       : x,
                  y       : y,
                  width  	: widthRectangle,
                  height  : heightRectangle
              };
          },
          getCurrentAttributes: function() {
          // use plus sign to convert string into number
          // Gives the x, y , width and the height of the triangle once asked for it
              var x = +this.element.attr("x");
              var y = +this.element.attr("y");
              var widthRectangle = +this.element.attr("width");
              var heightRectangle = +this.element.attr("height");
              return {
                  x1  : x,
                  y1	: y,
                  x2  : x + widthRectangle,
                  y2  : y + heightRectangle
              };
        },
        // This function makes it able to give a clear attribute in a sentence
          getCurrentAttributesAsText: function() {
              var attrs = this.getCurrentAttributes();
              return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
        },
        // Makes a rectangle once called with the new x and new y.
        // It updates the size, the x, the y, the height and width.
        // If someone double clicked on the rectangle, then it calls the function removelement
          init: function(newX, newY) {
          
              var rectElement = svg.append("rect")
                      .attr('rx',4)
                      .attr('ry',4)
                      .attr('x',0)
                      .attr('y',0)
                      .attr('width',0)
                      .attr('height',0)
                      .attr('class', 'rectangle')
              .classed("selection", true)
              .on("dblclick", removeElement);

              this.setElement(rectElement);
              this.originX = newX;
              this.originY = newY;
              this.update(newX, newY);
        },
        // Updates the new function with the new coordinates.
          update: function(newX, newY) {
              this.currentX = newX;
              this.currentY = newY;
              this.element
              .attr('x',this.getNewAttributes().x)
              .attr('y',this.getNewAttributes().y)
              .attr('width',this.getNewAttributes().width)
              .attr('height',this.getNewAttributes().height);

              
        },
        // Selects the color of the rectangle.
        // Also makes the stroke width to 2.5 with the correct color.
          focus: function() {
              let currentRectangleElement = this.element
                  .style("stroke", AOIcolorlist[currentNumberAoi])
            .style("stroke-width", "2.5");
          // Variables for easy access 
          let boxStartX = Math.round(xScale(SquareArray[SquareArray.length-1].DatasetStartX));
          let boxEndX   = Math.round(xScale(SquareArray[SquareArray.length-1].DatasetEndX));
          let boxStartY = Math.round(yScale(SquareArray[SquareArray.length-1].DatasetStartY));
          let boxEndY   = Math.round(yScale(SquareArray[SquareArray.length-1].DatasetEndY));
          let myText = svg.append('text')
              .attr('text-anchor', 'middle')
              .text(AOIlist[currentNumberAoi])
              .attr("x", function(){
                return (0.5*(boxEndX  + boxStartX))
                })
              .attr("y", function(){
                return (0.5*( boxStartY + boxEndY))
                })
              .attr("font-size", function(){
                return Math.round(labelMultiplier*Math.min(Math.abs( boxEndY - boxStartY),Math.abs( boxEndX - boxStartX)))
              })
              .attr("font-family", "monospace")
              .attr("fill", "black")
              .style("fill", AOIcolorlist[SquareArray[SquareArray.length-1].numberBox]);
          rectangleList.push(currentRectangleElement);
          textList.push(myText); 
        },
        // If the remove function is called, then it removes the element
          remove: function() {
              this.element.remove();
              this.element = null;
        },
        // This function would make it possible to remove the previous element, but this
          removePrevious: function() {
              if(this.previousElement) {
                  this.previousElement.remove();
              }
          }
      };
        
      var attributesText = d3.select("#attributestext");

      function dragStart() {
        if(SquareArray.length<maxAmountOfAOI){
          var p = d3.mouse(this);
          selectionRect.init(p[0], p[1]);
        }
        else{
          console.log('You already have 10 AOIs');
        }
      }
      
      function dragMove() {
        if(SquareArray.length<maxAmountOfAOI){
          var p = d3.mouse(this);
          selectionRect.update(p[0], p[1]);
          attributesText
            .text(selectionRect.getCurrentAttributesAsText());
        }
      }

      function dragEnd() {
        if(SquareArray.length<maxAmountOfAOI){
          var finalAttributes = selectionRect.getCurrentAttributes();
          if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
            // range selected
            d3.event.sourceEvent.preventDefault();
            possibleAoiNames = sortArray(possibleAoiNames);
            var nextBox = {
              DatasetStartX : xScale.invert(Math.min(selectionRect.originX,selectionRect.currentX)),
              DatasetStartY : yScale.invert(Math.max(selectionRect.originY,selectionRect.currentY)),
              DatasetEndX : xScale.invert(Math.max(selectionRect.currentX,selectionRect.originX)),
              DatasetEndY : yScale.invert(Math.min(selectionRect.currentY,selectionRect.originY)),
              numberBox : possibleAoiNames[0]
            }
            currentNumberAoi = possibleAoiNames[0];
            for (var i=0; i<SquareArray.length;i++){
              if(rectanglesIntersect(SquareArray[i],nextBox)){
                intersectingRectangles = true;
              }
            }
            if(intersectingRectangles){
              selectionRect.remove();
              alert('These rectangles intersect!');
              intersectingRectangles = false;
            } else {
              possibleAoiNames.splice(0,1);	
              FilterAOI(nextBox)
              SquareArray.push(nextBox);
              selectionRect.focus();
            }
            // Adds the color to the rectangle
          } else {
            // single point selected
            selectionRect.remove();
          }
        }
      }

      function sortArray(numbers){
        numbers.sort(function(a, b){
          return a - b;
        });
        return numbers;
      }
      function removeElement() {
        for( let i=0 ; i<rectangleList.length;i++){
          if(rectangleList[i]._groups[0][0]==this){
            d3.select(this).remove();
            possibleAoiNames.push(SquareArray[i].numberBox);
            data.forEach(function(d) {
              if (d.MappedFixationPointX > SquareArray[i].DatasetStartX && 
                d.MappedFixationPointX < SquareArray[i].DatasetEndX   &&
                d.MappedFixationPointY > SquareArray[i].DatasetStartY && 
                d.MappedFixationPointY < SquareArray[i].DatasetEndY   ){
                  delete d.AOIName;
                  delete d.AOIcolor;
                  delete d.AOI_order;
                }	
              });
              vm.data = data;
            if(SquareArray.length == 1){
              SquareArray = [];
              textList[i].remove();
              textList = [];
              rectangleList = [];
            }
            else{
              SquareArray.splice(i,1);
              textList[i].remove();
              textList.splice(i,1);
              rectangleList.splice(i,1);	
            }
          }
        }
      }

      // code for filtering datapoints when selecting AOI's made by Floris
      const FilterAOI = (RectangleBox) => {
        // x1,y1 is first click 
        // x2, y2 is second click
        // max 10 AOI's!
        AOIlist = ["AOI1", "AOI2", "AOI3", "AOI4", "AOI5", "AOI6", "AOI7", "AOI8", "AOI9", "AOI10"];
        AOIcolorlist = ["#e129b8", "#0166cc", "#f4a8a1", "#a652ec", "#3a1b12", "#49464e", "#72b36a", "#d693bf", "#f4fe76", "#2713ca"];
        data.forEach(function(d) {
          if (d.MappedFixationPointX > RectangleBox.DatasetStartX && 
            d.MappedFixationPointX < RectangleBox.DatasetEndX   &&
            d.MappedFixationPointY > RectangleBox.DatasetStartY && 
            d.MappedFixationPointY < RectangleBox.DatasetEndY   ){
            // above if statements checks if a point is in the created AOI for all points
            // add columns to the data containing the aoi info.
            // x1,y1 is left lower corner, x2,y2 is right upper corner
            (d.AOIName = AOIlist[RectangleBox.numberBox]);
            (d.AOIcolor = AOIcolorlist[RectangleBox.numberBox]);
            (d.AOI_order = RectangleBox.numberBox+1);
          }
        });
        vm.data = data;
      }

      var dragBehavior = d3.drag()
        .on("drag", dragMove)
        .on("start", dragStart)
        .on("end", dragEnd);

      svg.call(dragBehavior);

      function rectanglesIntersect(rectOne, rectTwo ){
        var maxOneX = Math.max(Math.round(xScale(rectOne.DatasetStartX)),Math.round(xScale(rectOne.DatasetEndX)));
        var minOneX = Math.min(Math.round(xScale(rectOne.DatasetStartX)),Math.round(xScale(rectOne.DatasetEndX)));
        var maxOneY = Math.max(Math.round(yScale(rectOne.DatasetStartY)),Math.round(yScale(rectOne.DatasetEndY)));
        var minOneY = Math.min(Math.round(yScale(rectOne.DatasetStartY)),Math.round(yScale(rectOne.DatasetEndY)));
        var maxTwoX = Math.max(Math.round(xScale(rectTwo.DatasetStartX)),Math.round(xScale(rectTwo.DatasetEndX)));
        var minTwoX = Math.min(Math.round(xScale(rectTwo.DatasetStartX)),Math.round(xScale(rectTwo.DatasetEndX)));
        var maxTwoY = Math.max(Math.round(yScale(rectTwo.DatasetStartY)),Math.round(yScale(rectTwo.DatasetEndY)));
        var minTwoY = Math.min(Math.round(yScale(rectTwo.DatasetStartY)),Math.round(yScale(rectTwo.DatasetEndY)));
        return (maxOneX >= minTwoX && minOneX <= maxTwoX && minOneY <= maxTwoY && maxOneY >= minTwoY);
      }

      //Create select keyword with click event listener
      d3.select("#selectMenu")
            .on('change', function() {
              onStimulusNameClicked(this.value);
            });

      //Store the selected option
      const onStimulusNameClicked = option => {
        stimulusName = option;
        render();
      }

      //plot a scatterplot
      const scatterPlot = (selection) => {
          //dataSelected = data.filter(d => (d.StimuliName == stimulusName));


      //Select the image according to the selected map(version)
      let imageSelected = allVersions.filter(d => d == stimulusName);

      //Select the image resolution according to the selected map
      let citySelected = resData.filter(d => stimulusName.includes(d.city));
      let imgWidth = citySelected[0].width;
      let imgHeight = citySelected[0].height;

      //Update image and set background
      let background = 'static/jpg/' + imageSelected;

      const img = selection.selectAll('image').data([null]);
      const imgEnter = img.enter().append('image')

      imgEnter
        .merge(img)
          .attr('xlink:href', background)
          .attr('preserveAspectRatio', 'none')
          .attr('width', innerWidth)
          .attr('height', innerHeight)
          .attr('transform',
            `translate(${margin.left},${margin.top})`
          );
          //Transform the image resolution into range and domain of the axes
          xScale = d3.scaleLinear()
              .domain([0, imgWidth])
              .range([0, innerWidth])
          yScale = d3.scaleLinear()
              .domain([0, imgHeight])
              .range([innerHeight, 0])
              .nice();
      }

      //Function render
      const render = () => {
      //Invoke function dropdownMenu to generate menu
        svg.call(scatterPlot)
        svg.selectAll('.rectangle').remove();
        SquareArray = [];
      }

      Promise.all([
          d3.csv('static/csv/resolution.csv')
      ]).then(loadedData => {
          data = this.files;
          resData = loadedData[0];

          data.forEach(d => {
          d.MappedFixationPointX = +d.MappedFixationPointX;
          d.MappedFixationPointY = +d.MappedFixationPointY;
              if (!allVersions.includes(d.StimuliName)) {
                  allVersions.push(d.StimuliName);
              }
          });
          resData.forEach(d => {
              d.width = +d.width;
              d.height = +d.height
          })
          stimulusName = d3.select("#selectMenu").node().value;
          render();
      });
    },
    toAlpPlot() {
      let vm = this;
      vm.addFilesAOI(vm.data);
      vm.$emit('to-alp-plot');
    },
    info() {
      window.alert("To use the Alpscarf, you have to define AOI’s first. This can be done with the AOI selector by drawing rectangles with your mouse. You are able to define up to 10 different AOI’s. To remove an AOI simple double click the AOI rectangle. After the AOI’s are defined you are able to go to the Alpscarf itself.");
    }
  }
</script>

<style>
rect.selection {
  cursor: move !important;
  -webkit-touch-callout: none !important;
  -webkit-user-select: none !important;
  -khtml-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  user-select: none !important;
  stroke: #545454;
  stroke-width: 2px;
  stroke-opacity: 1;
  fill: white;
  fill-opacity: 0.5;
}

.svg-selection {
  height: 100%;
  width: 100%;
}
</style>