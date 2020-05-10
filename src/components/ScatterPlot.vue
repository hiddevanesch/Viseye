<template>
  <div>
    <div id="menus"></div>
    <input type="checkbox" id='checkBox_id' class="checkbox" checked='checked'/>
    <label id='labelCheckBox'>Cumulative</label>
    <button id="play-button">Play</button>
    <svg id='svgSlider' height='50' width='500'></svg>
    <!-- Color Scale -->
    <div id="tooltip"></div>
    <div id="scatterPlot">
      <svg id="scatterPlotSVG" viewBox="0 0 960 500" width="960" height="500"></svg>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";

export default {
  computed: {
    ...mapState([
      'files'
    ])
  },
  mounted: function() {
    this.visualize();
  },
  methods: {
    visualize() {// Loads both of the SVG's in variables
    const svg = d3.select('#scatterPlotSVG');
    const svgSlider = d3.select('#svgSlider');

    /*
    Useful variables for the window 
    Width and height of the slider etc.
    */
    const margin = { top: 40, right: 20, bottom: 50, left: 60 };
    const widthSlider = +svgSlider.attr('width') - 100;
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;


    //Defining variables for general access
    let data;
    let slider;
    let timelineScale;
    let handle;
    let label;
    let timer;
    let stimulusName;
    let allVersions = [];
    let dataSelected;
    let currentValue;
    let targetValue;
    var cumulativeFilter = true;
    var amountSlider;
    let minTimeSlider;
    let maxTimeSlider;
    let timelineUpdate = false;
    let maxvalueData;
    let sliderLine;
    const yAxisLabel = 'Y coordinate';
    const xAxisLabel = 'X coordinate';
    const title = 'Scatterplot: Eye tracking data per city';

    /*
    Selects the play button and the checkbox for interactions
    If the checkbox is clicked, then the boolean filter will be flipped
    */
    var playButton = d3.select('#play-button');
    var checkBox = d3.select("#checkBox_id")
      checkBox.on('change', function(){ 
        cumulativeFilter = cumulativeFilter ? false : true;
      });
    var tooltip = d3.select("#menus").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


    /* 
    The timeline slider will be created here
    1. The slider consists of three parts, the slider itself
    2. The circle in the middle that shows the value
    3. The amount of the slider which is  shown above the circle
    */
    function createTimeline(){

      /*
      define the axisTimeline for easy access to the timestamps
      define the mintime of the slider, which is the minimal value of the dataset
      define the maxtime of the slider, which is the maximal value of the dataset
      the maximum value of the data  is used later for redrawing
      the targetValue is needed to make the distribution
      */
      const axisTimeline = data => data.Timestamp;
      minTimeSlider = +d3.min(data, function(d) {return d.Timestamp || Infinity; });
      maxTimeSlider = +d3.max(data,axisTimeline);
      maxvalueData = maxTimeSlider;
      targetValue = maxTimeSlider - minTimeSlider;

      /*
      Make the distribution of the timeline
      the domain is set between the minimum and maximum value of the data
      the range is set to the width of the slider
      */
      timelineScale = d3.scaleLinear()     
        .domain([minTimeSlider,maxTimeSlider])
        .range([0,widthSlider])
        .clamp(true);

      // The slider is added to its svg and translated to the correct position
      slider = svgSlider.append('g')
        .attr('class', 'slider')
        .attr( 'transform', `translate(25,25)`);

      // The bar of the slider is initialized, and its style is corrected
      sliderLine = slider.append("line")
        .attr("class", "track")
        .attr("x1", timelineScale.range()[0])
        .attr("x2", timelineScale.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay");

      // Add the text to the slider
      slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(timelineScale.ticks(10))
        .enter()
        .append("text")
        .attr("x", timelineScale)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { d.Timestamp });


      // Add the circle in the bar at the current value
      handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

      // The amount of the slider above the circle
      label = slider.append("text")  
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(minTimeSlider/1000)
        .attr("transform", "translate("+0+","+ -13 +")")
    }

    //function dropdown menu
    const dropdownMenu = (selection, props) => {
      const {
        options,
        onOptionClicked
      } = props;

      //Create select keyword with click event listener
      let select = selection.selectAll('select').data([null]);
      select = select.enter().append('select')
        .merge(select)
          .on('change', function() {
            onOptionClicked(this.value);
          });

      //Create options inside the dropdown menu with the corresponding value for the displayed text
      const option = select.selectAll('option').data(options);
      option.enter().append('option')
        .merge(option)
          .text(d => d)
          .attr("value", d => d);
      }

    //Store the selected option
    const onStimulusNameClicked = option => {
      stimulusName = option;
      render();
    }

    //plot a scatterplot
    const scatterPlot = (selection, props) => {
      const {
        xValue,
        yValue,
        circleRadius,
        margin,
      } = props;

      //Filter the data, first it corrects the timeline, then it filters the data
      currentValue = maxvalueData;
      handle.attr("cx", timelineScale(currentValue));
      label
        .attr("x", timelineScale(currentValue))
        .text(Math.round(currentValue/10)/100+ ' sec');

      // It selects all the values under the value of the slider
        dataSelected = data.filter(d => (d.StimuliName == stimulusName && d.Timestamp <= currentValue));

      // update the timeline according to the data if a chart has been selected
      if (timelineUpdate){
        const axisTimeline = dataSelected => dataSelected.Timestamp;
        /* 
        update the minimum and maximum value of the selected data
        update the domain of the slider 
        update the value above the slider
        */
        minTimeSlider = +d3.min(dataSelected, function(d) {return d.Timestamp || Infinity; });
        maxTimeSlider = +d3.max(dataSelected,axisTimeline);
        targetValue = maxTimeSlider - minTimeSlider;
        timelineScale.domain([minTimeSlider,maxTimeSlider]);
        slider.selectAll("text")
          .data(timelineScale.ticks(10))
          currentValue = maxTimeSlider;
          handle.attr("cx", timelineScale(currentValue));
          label
            .attr("x", timelineScale(currentValue))
            .text(Math.round(currentValue/10)/100+' sec');
    }

    //Select the image according to the selected option
      let imageSelected = allVersions.filter(d => d == stimulusName);

    //Update image and set background
      let background = 'stimuli/' + imageSelected;

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

      //Transform the data values into positions
      const xScale = d3.scaleLinear()
        .domain([d3.min(dataSelected, xValue), d3.max(dataSelected, xValue)])
        .range([0, innerWidth])
        .nice();

      const yScale = d3.scaleLinear()
        .domain([d3.min(dataSelected, yValue), d3.max(dataSelected, yValue)])
        .range([innerHeight, 0])
        .nice();

      //Create container for scatterplot
      const g = selection.selectAll('.container').data([null]);
        const gEnter = g
        .enter().append('g')
        .attr('class', 'container');
        
      //Translating the visualisation to innerposition with the updated data
      gEnter
        .merge(g)
          .attr('transform',
            `translate(${margin.left},${margin.top})`
          );


      //Customizing the axis
      const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(10);

      const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);

      //Creating the axes
      const yAxisG = g.select('.y-axis');
      const yAxisGEnter = gEnter
        .append('g')
          .attr('class', 'y-axis');
      svg.append('text')
          .attr('class', 'title')
          .attr('y', margin.top/2)
          .attr('x', margin.left)
          .text(title);
      yAxisG
        .merge(yAxisGEnter)
          .call(yAxis)
          .selectAll('.domain').remove();
        
      const xAxisG = g.select('.x-axis')
        .append('text')
          .attr('class', 'axis-label')
          .attr('y',innerHeight+margin.top)
          .attr('x', innerWidth / 2)
          .attr('fill', 'black')
          .text(xAxisLabel);
      const xAxisGEnter = gEnter
        .append('g')
            .attr('class', 'x-axis');
      xAxisG
        .merge(xAxisGEnter)
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis)
          .selectAll('.domain').remove();

      xAxisGEnter
        .append('text')
          .attr('class', 'axis-label')
          .attr('y', margin.top)
          .attr('x', innerWidth / 2)
          .text(xAxisLabel);

      yAxisGEnter
        .append('text')
            .attr('class', 'axis-label')
            .attr('y', -40)
            .attr('x', -innerHeight / 2 )
            .attr('transform', `rotate(-90)`)
            .style('text-anchor', 'middle')
            .text(yAxisLabel);
      

      //Draw circles for each row of the selected data
      const circles = g.merge(gEnter)
        .selectAll('circle').data(dataSelected);
      circles
        .enter().append('circle')
          .merge(circles)
            .attr('cx', innerWidth/2)
            .attr('cy', innerHeight/2)
            .attr('r', 0)
            .on("mouseover", function(d) {
              tooltip.transition()
                .duration(200)
                .style("opacity", 1);
              tooltip.html("Coordinates :" + d.MappedFixationPointX + "," + d.MappedFixationPointX + "<br/> By user:" + d.user)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function() {
              tooltip.transition()
                .duration(500)
                .style("opacity", 0);
              })
          .transition().duration(2000)
          .delay((d, i) => i)
            .attr('r', circleRadius)
            .attr('cx', d => xScale(xValue(d)))
            .attr('cy', d => yScale(yValue(d)))
            
      circles
        .exit()
          .transition().duration(2000)
            .attr('r', 0)
            .attr('cx', innerWidth/2)
            .attr('cy', innerHeight/2)
          .remove();

      
      // Update the data from the timeline scaler
      function drawPlot(dataDrawPlot) {
        const circles = g.merge(gEnter)
          .selectAll('circle').data(dataDrawPlot);
        circles
          .enter().append('circle')
            .merge(circles)
              .attr('r', circleRadius)
              .attr('cx', d => xScale(xValue(d)))
              .attr('cy', d => yScale(yValue(d)))
              .on("mouseover", function(d) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 1);
                tooltip.html("Coordinates :" + d.MappedFixationPointX + "," + d.MappedFixationPointX + "<br/> By user:" + d.user)
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - 28) + "px");
              })
              .on("mouseout", function() {
                tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
                });
        circles
          .exit().remove();
        }	
      /*
      Play button on click
      if the button is on pause, it will change to play
        then the slider will stop moving
        and the interval will be cleared
      if the button is on play, it will change to pause
        then the slider will start moving
        the command step will be executed every 0.1 seconds
      */ 
      playButton.on("click", function() {
        var button = d3.select(this);
        if (button.text() == "Pause") {
        clearInterval(timer);
        button.text("Play");
        } else {
          if (currentValue >= maxTimeSlider){
            currentValue=minTimeSlider;
            update(currentValue);
          }
        timer = setInterval(step, 250);
        button.text("Pause");
        }
      })

      // Step function for the play button
      function step() {
        update(currentValue);

        const amountOfPoints = data.filter(d => d.StimuliName == stimulusName).length;
        amountSlider = amountOfPoints;
        // Updates the slider by the compensated amount
        currentValue +=  targetValue/amountSlider;
        // If the slider is finished, then don't move it anymore, clear the interval and set the value to its start
        if (currentValue > maxTimeSlider) {
          currentValue = minTimeSlider;
          clearInterval(timer);
          // timer = 0;
          playButton.text("Play");
        }
        }

      sliderLine.call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() {
            currentValue = timelineScale.invert(d3.event.x);
            update(currentValue); 
            }
          )
        );
        
      // Update button for the new value
      function update(h) {
        // update position and text of label according to slider scale
        handle.attr("cx", timelineScale(h));
        label
        .attr("x", timelineScale(h))
        .text(Math.round(h/10)/100 + ' sec');
        // filter data set and redraw plot
            if(cumulativeFilter){
            dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h);
            }
            else{
              dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h && d.Timestamp>h-500);
            }
        drawPlot(dataSelected);
      }
    }

    //Function render
    const render = () => {
    //Invoke function dropdownMenu to generate menu
      d3.select('#menus')
        .call(dropdownMenu, {
          options: allVersions,
          onOptionClicked: onStimulusNameClicked
          }
        );
        

      //Invoke function to generate the scatterplot
      svg.call(scatterPlot, {
        xValue: d => d.MappedFixationPointX,
        yValue: d => d.MappedFixationPointY,
        circleRadius: 10,
        margin: { top: 40, right: 20, bottom: 50, left: 60 },
      })
    }

    //(RE-)Render the data according to the selection by filter
    d3.csv('data.csv')
      .then(() => {
        data = this.files;
        data.forEach(d => {
          d.MappedFixationPointX = +d.MappedFixationPointX;
        d.MappedFixationPointY = +d.MappedFixationPointY;
        d.Timestamp  = +d.Timestamp;
          if (!allVersions.includes(d.StimuliName)) {
            allVersions.push(d.StimuliName);
          }
      });
      createTimeline();
      stimulusName = '01_Antwerpen_S1.jpg';
      timelineUpdate = true;
        render()
    });
    }
  }
}
</script>

<style>
body {
  margin: 0px;
  overflow: hidden;
  font-family:"avenir next", Arial, sans-serif;
  font-size: 12px;
  color: #696969;
}

circle {
  fill: blue;
  opacity: 0.4;
}

div.tooltip {
  position: absolute;
  text-align: center;
  /*width: 150px;*/
  height: 28px;
  padding: 2px 5px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

text {
  font-family: sans-serif;
}

.tick text {
  font-size: 1.6em;
  fill: #635F5D;
}

.tick line {
  stroke: #C0C0BB;
  opacity: 0.4;
}

.title{
  font-size: 2em;
  text-align: center;
}

#menus {
  font-size: 1em;
  border: 100px;
  border-style: solid black;
}

#menus select {
  font-size: 1rem;
}

#menus select option {
  font-size: 1rem;
}

.axis-label {
  fill: black;
  font-size: 15pt;
  font-family: sans-serif;
}

#scatterPlot {
  border: 100px;
  border-style: solid black;
}

#play-button {
  position: relative;
  top: 0px;
  left: 295px;
  background: #f08080;
  padding-right: 26px;
  border-radius: 3px;
  border: none;
  color: white;
  margin: 0;
  padding: 0 12px;
  width: 60px;
  cursor: pointer;
  height: 25px;
}

#checkBox_id {
  position: relative;
  top: 0px;
  left: 205px;
  color: white;
  width: 20px;
  height: 20px;
}

#labelCheckBox {
  position: relative;
  top: 6px;
  left: 230px;
}


#cumulativeCheck-Box {
  position: relative;
  top: 5px;
  left: 45px;
}

#play-button:hover {
  background-color: #696969;
}    

.ticks {
  font-size: 28px;
}

.track,
.track-inset,
.track-overlay {
  stroke-linecap: round;
}

.track {
  stroke: #000;
  stroke-opacity: 0.3;
  stroke-width: 10px;
}

.track-inset {
  stroke: #dcdcdc;
  stroke-width: 8px;
}

.track-overlay {
  pointer-events: stroke;
  stroke-width: 50px;
  stroke: transparent;
  cursor: crosshair;
}

.handle {
  fill: #fff;
  stroke: #000;
  stroke-opacity: 0.5;
  stroke-width: 1.25px;
}
</style>