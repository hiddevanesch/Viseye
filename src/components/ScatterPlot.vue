<template>
  <div class="visrow height-fix">
    <div class="viscol col80">
      <section class = "vis">
        <div id ="scatterPlot">
          <div id="tooltip"></div>
          <svg class="aperture" viewbox = "0 0 960 500" preserveAspectRatio="none">
            <g>
              <svg id = "scatterPlotSVG" width = "960" height = "500"></svg><!--scatterPlot-->
            </g>
            </svg>
        </div>
      </section>
    </div>
    <div class="viscol col20 bg-ldgray">
      <div class="accordionWrapper">
        <div class="accordionItem accClosed">
          <h2 class="accordionItemTitle">Basic controls</h2>
          <div class="accordionItemContent">
            <div class="vismenurow bmar-tiny">
              <label class="label">Minimap</label>
            </div>
            <div class="vismenurow bmar-tiny">
              <div id="mini">
                <svg viewBox="0 0 960 500">
                  <use xlink:href="#scatterPlotSVG" />
                </svg><!--miniMap-->
              </div>
            </div>
            <div class="vismenurow bmar-tiny">
              <label class="label">Cumulative</label>
            </div>
            <div class="vismenurow bmar-tiny">
              <input type="checkbox" id='checkBox_id' class="checkbox" checked='checked'/>
            </div>
            <div class="vismenurow bmar-tiny">
              <button id="play-button" class="full-width">Play</button>
            </div>
            <div class="vismenurow bmar-tiny">
              <label class="label">Time slider</label>
            </div>
            <div class="vismenurow bmar-tiny">
              <input type="range" class="slider" id="timeSlider" width="200" />
            </div>
            <div class="vismenurow bmar-tiny">
              <label id="timeLabel" class="label">NO DATA</label>
            </div>
          </div>
        </div>
        <div class="accordionItem accClosed">
          <h2 class="accordionItemTitle">Circle settings</h2>
          <div class="accordionItemContent">
            <div class="vismenurow bmar-tiny">
              <label class="label">Opacity slider</label>
            </div>
            <div class="vismenurow bmar-tiny">
              <input type="range" min="0" max="10" value="5" class="range full-width" id="opacityAtt">
            </div>
            <div class="vismenurow bmar-tiny">
              <label class="label">Circle radius slider</label>
            </div>
            <div class="vismenurow bmar-tiny">
              <input type="range" min="0" max="12" value="6" class="range full-width" id="radiusCircle">
            </div>
          </div>
        </div>
        <div class="accordionItem accClosed">
          <h2 class="accordionItemTitle">K-means clustering</h2>
          <div class="accordionItemContent">
            <form action="/action_page.php" id="userInputForm">
                <div class="vismenurow bmar-tiny">
                  <label class="label">Number of clusters</label>
                </div>
                <div class = "vismenurow bmar-tiny">
                  <label class = "cluster">2 
                      <input type="radio" id="2" name="radio1" onclick = "clearInputFieldClusters()">
                      <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">3 
                    <input type="radio" id="3" name="radio1" onclick = "clearInputFieldClusters()">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">4 
                    <input type="radio" id="4" name="radio1" onclick = "clearInputFieldClusters()">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">5 
                    <input type="radio" id="5" name="radio1" onclick = "clearInputFieldClusters()">
                    <span class="checkmark"></span>
                  </label>
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Customized quantity<br>(1-10)</label>
                </div>
                <div class="vismenurow bmar-tiny">
                <input type="number" id="userInputClusters" min="2" max="10" onkeyup="uncheckButtonsClusters()">
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Number of iterations</label>
                </div>
                <div class="vismenurow bmar-tiny">
                  <label class = "cluster">25 
                      <input type="radio" id="25" name="radio2" onclick = "clearInputFieldIterations()">
                      <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">50 (recommended)
                    <input type="radio" id="50" name="radio2" onclick = "clearInputFieldIterations()">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">100
                    <input type="radio" id="100" name="radio2" onclick = "clearInputFieldIterations()">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">200
                    <input type="radio" id="200" name="radio2" onclick = "clearInputFieldIterations()">
                    <span class="checkmark"></span>
                  </label>
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Customized quantity</label>
                </div>
                <div class="vismenurow bmar-tiny">
                <input type="number" id="userInputIteration" onkeyup="uncheckButtonsIterations()">
                </div>
                <div class="vismenurow">
                <input type="button" id="submit" value="Start" onclick="clustersQuantity()" class="button button-blue full-width">
                </div>
            </form>
          </div>
        </div>
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
  computed: {
    ...mapState([
      'files'
    ])
  },
  mounted: function() {
    this.visualize();
    this.accordion();
  },
  methods: {
    accordion() {
        var accItem = document.getElementsByClassName('accordionItem');
        var accHD = document.getElementsByClassName('accordionItemTitle');
        for (let i = 0; i < accHD.length; i++) {
            accHD[i].addEventListener('click', toggleItem, false);
        }
        function toggleItem() {
            var itemClass = this.parentNode.className;
            for (let i = 0; i < accItem.length; i++) {
                accItem[i].className = 'accordionItem accClosed';
            }
            if (itemClass == 'accordionItem accClosed') {
                this.parentNode.className = 'accordionItem accOpened';
            }
        }
    },
    visualize() {
    // Loads the SVG in variable
    let svg = d3.select('#scatterPlotSVG');

    /*
    Useful variables for the window 
    Width and height of the slider etc.
    */
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const widthSlider = 50;
    let width = +svg.attr('width');
    let height = +svg.attr('height');
    let innerWidth = width - margin.left - margin.right;
    let innerHeight = height - margin.top - margin.bottom;


    //Defining variables for general access
    let data;
    let slider;
    let sliderLabel;
    let timelineScale;
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
    let firstLoad = true;
    let resData;
    const yAxisLabel = 'Mapped fixation point y';
    const xAxisLabel = 'Mapped fixation point x';

    /*
    Selects the play button and the checkbox for interactions
    If the checkbox is clicked, then the boolean filter will be flipped
    */
    var playButton = d3.select('#play-button');
    var checkBox = d3.select("#checkBox_id")
      checkBox.on('change', function(){ 
        cumulativeFilter = cumulativeFilter ? false : true;
      });
    var tooltip = d3.select("#scatterPlot").append("div")
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

      // The slider and label are added
      slider = d3.select("#timeSlider");
      sliderLabel = d3.select('#timeLabel');

      // The bar of the slider is initialized, and its style is corrected
      slider
        .attr("min", timelineScale.range()[0])
        .attr("max", timelineScale.range()[1])
        .attr("value", timelineScale.range()[1]);

      // Add the text to the slider
      // slider.insert("g", ".track-overlay")
      //   .attr("class", "ticks")
      //   .attr("transform", "translate(0," + 18 + ")")
      //   .selectAll("text")
      //   .data(timelineScale.ticks(10))
      //   .enter()
      //   .append("text")
      //   .attr("x", timelineScale)
      //   .attr("y", 10)
      //   .attr("text-anchor", "middle")
      //   .text(function(d) { d.Timestamp });


      // Add the circle in the bar at the current value
      // handle = slider.insert("circle", ".track-overlay")
      //   .attr("class", "handle")
      //   .attr("r", 9);

      // The amount of the slider above the circle
      // label = slider.append("text")  
      //   .attr("class", "label")
      //   .attr("text-anchor", "middle")
      //   .text(minTimeSlider/1000)
      //   .attr("transform", "translate("+0+","+ -13 +")")
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
    const scatterPlot = (selection, props) => {
      const {
        xValue,
        yValue,
        circleRadius,
        margin,
      } = props;

      //Filter the data, first it corrects the timeline, then it filters the data
      currentValue = maxvalueData;
      slider.attr("value", timelineScale(currentValue));

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
          slider.attr("value", timelineScale(currentValue));
          sliderLabel.text(Math.round(currentValue/10/100)+ ' sec');
          // label
          //   .attr("x", timelineScale(currentValue))
          //   .text(Math.round(currentValue/10)/100+' sec');
    }

    //Select the image according to the selected option
      let imageSelected = allVersions.filter(d => d == stimulusName);

    //Select the image resolution according to the selected map
      let citySelected = resData.filter(d => stimulusName.includes(d.city));

      let imgWidth = citySelected[0].width;
      let imgHeight = citySelected[0].height;

    //Update image and set background
      let background = 'static/jpg/' + imageSelected;

      const img = selection.selectAll('image').data([null]);
      const imgEnter = img.enter().append('image');

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
        .domain([0, imgWidth])
        .range([0, innerWidth])
        .nice();

      const yScale = d3.scaleLinear()
        .domain([0, imgHeight])
        .range([0, innerHeight])
        .nice();

      const yScaleAxis = d3.scaleLinear()
        .domain([0, imgHeight])
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

      const yAxis = d3.axisLeft(yScaleAxis)
        .tickSize(-innerWidth)
        .tickPadding(10);
      
      if (firstLoad) {
        //Creating the axes
        const yAxisG = g.select('.y-axis');
        const yAxisGEnter = gEnter
          .append('g')
            .attr('class', 'y-axis');
        // svg.append('text')
        //     .attr('class', 'title')
        //     .attr('y', margin.top/2)
        //     .attr('x', margin.left)
        //     .text(title);
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
            .attr('y', margin.top * 4)
            .attr('x', innerWidth / 2)
            .text(xAxisLabel);

        yAxisGEnter
          .append('text')
              .attr('class', 'axis-label')
              .attr('y', -50)
              .attr('x', -(innerHeight / 2))
              .attr('transform', `rotate(-90)`)
              .style('text-anchor', 'middle')
              .text(yAxisLabel);
          firstLoad = false;
      }
      
      //Draw circles for each row of the selected data
      const circles = g.merge(gEnter)
        .selectAll('circle').data(dataSelected);
      circles
        .enter().append('circle')
          .merge(circles)
            .attr('cx', innerWidth/2)
            .attr('cy', innerHeight/2)
            .attr('r', 0)
            .attr('class', 'circle')
            .on("mouseover", function(d) {
              tooltip.transition()
                .duration(200)
                .style("opacity", 1)
                .style("left", "calc(" + (d3.event.pageX + 10) + "px - 20vw)")
                .style("top", "calc(" + (d3.event.pageY + 10) + "px - 15vh)");
              tooltip.html("Coordinates: " + d.MappedFixationPointX + ", " + (imgHeight - d.MappedFixationPointY) + "<br/> By user: " + d.user);
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


      const main_svg = d3.select("#scatterPlot svg.aperture").attr("class", "zoom");
      const mini_svg = d3.select("#mini svg").append("g").attr("class", "zoom");
      const viewbox = main_svg.attr("viewbox").split(' ').map(d => +d);

      // store the image's initial viewBox
      const extent_1 = [
        [viewbox[0], viewbox[1]]
        , [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
      ]
      const brush  = d3.brush()
            .extent(extent_1)
        .on("brush", brushed)
      const zoom = d3.zoom()
        .scaleExtent([0.2, 1])
        .extent(extent_1)
        .on("zoom", zoomed)
      ;

      // Apply the brush to the minimap, and also apply the zoom behavior here
      mini_svg
        .call(brush)
        .call(brush.move, brush.extent())
        .call(zoom)
      ;
      // Apply the zoom behavior to the main svg
      main_svg
        .call(zoom)
      ;

      function brushed() {
        // Ignore brush-via-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;
        
        let sel = d3.event.selection
          , vb = sel
            ? [sel[0][0], sel[0][1], (sel[1][0] - sel[0][0]), (sel[1][1] - sel[0][1])]
            : viewbox
          , k = vb[3] / viewbox[3]
          , t = d3.zoomIdentity.translate(vb[0], vb[1]).scale(k)
        ;

        mini_svg
          .property("__zoom", t)
        ;
        main_svg
          .attr("viewBox", vb.join(' '))
          .property("__zoom", t)
        ;
      } // brushed()
      
      function zoomed() {
        // If the zoom input was on the minimap, forward it to the main SVG
        if(this === mini_svg.node()) {
          return main_svg.call(zoom.transform, d3.event.transform);
        }

        // Disable panning on main_svg
        if(d3.event.sourceEvent.type === "mousemove") return;
        // Ignore zoom via brush
        if(!d3.event.sourceEvent || d3.event.sourceEvent.type === "brush") return;
      
        // Process the zoom event on the main SVG
        let t = d3.event.transform;
        
        t.x = t.x < viewbox[0] ? viewbox[0] : t.x;
        t.x = t.x > viewbox[2] ? viewbox[2] : t.x;
        t.y = t.y < viewbox[1] ? viewbox[1] : t.y;
        t.y = t.y > viewbox[3] ? viewbox[3] : t.y;
        
        if(t.k === 1) t.x = t.y = 0;
      
        const vb = [t.x, t.y, viewbox[2] * t.k, viewbox[3] * t.k];
      
        main_svg.attr("viewBox", vb.join(' '));
        mini_svg
          .property("__zoom", t)
          .call(
              brush.move
            , [[t.x, t.y], [t.x + vb[2], t.y + vb[3]]]
            )
        ;
      } // zoomed()

      // Update the data from the timeline scaler
      function drawPlot(dataDrawPlot) {
        const circles = g.merge(gEnter)
          .selectAll('circle').data(dataDrawPlot);
        circles
          .enter().append('circle')
            .merge(circles)
              .attr('r', circleRadius)
              .attr('class', 'circle')
              .attr('cx', d => xScale(xValue(d)))
              .attr('cy', d => yScale(yValue(d)))
              .on("mouseover", function(d) {
                tooltip.transition()
                  .duration(200)
                  .style("opacity", 1)
                  .style("left", "calc(" + (d3.event.pageX + 10) + "px - 20vw)")
                  .style("top", "calc(" + (d3.event.pageY + 10) + "px - 15vh)");
                tooltip.html("Coordinates: " + d.MappedFixationPointX + ", " + (imgHeight - d.MappedFixationPointY) + "<br/> By user: " + d.user);
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

      slider
          .on("input", function() {
            currentValue = timelineScale.invert(this.value);
            update(currentValue); 
            });

      // Update button for the new value
      function update(h) {
        // update position and text of label according to slider scale
        slider.attr("value", Math.round(timelineScale(h)));
        sliderLabel.text(Math.round(currentValue/10/100)+ ' sec');

        // filter data set and redraw plot
            if(cumulativeFilter){
            dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h);
            }
            else{
              dataSelected = data.filter(d => d.StimuliName == stimulusName && d.Timestamp < h && d.Timestamp>h-500);
            }
        drawPlot(dataSelected);
      }

      // Step function for the play button
      function step() {
        update(currentValue);

        amountSlider = Math.min(data.filter(d => d.StimuliName == stimulusName).length,50);
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
    }

    //Function render
    const render = () => {
    //Invoke function dropdownMenu to generate menu  

      //Invoke function to generate the scatterplot
      svg.call(scatterPlot, {
        xValue: d => d.MappedFixationPointX,
        yValue: d => d.MappedFixationPointY,
        circleRadius: 5,
        margin: { top: 10, right: 20, bottom: 50, left: 60 },
      })
    }

    //(RE-)Render the data according to the selection by filter
      d3.csv('static/csv/resolution.csv')
      .then(loadedData => {
      resData = loadedData;

      data = this.files;
      data.forEach(d => {
        d.MappedFixationPointX = +d.MappedFixationPointX;
        d.MappedFixationPointY = +d.MappedFixationPointY;
        d.Timestamp  = +d.Timestamp;
        if (!allVersions.includes(d.StimuliName)) {
          allVersions.push(d.StimuliName);
        }
      });

      resData.forEach(d => {
        d.width = +d.width;
        d.height = +d.height
      });

      createTimeline();
      stimulusName = d3.select("#selectMenu").node().value;
      timelineUpdate = true;
      render();
      });
    },
    info() {
      window.alert("In a scatterplot, the gaze points of a user are plotted. The metro map is the stimulus and can also be seen in the scatterplot. This way, important parts of the metro map can be distinguished.\n\nThere are several interactions for the scatterplot of this website. Between the different metro maps can be filtered. The timestamp slider accommodates the user to filter over time. Pressing the play button results in an animated visualization which plots the gaze points in the correct order in time which shows the general path of the users. When selecting the cumulative filter (which is turned on by default), all gaze points from the time before the time stamp is shown. Hovering over a point in the scatterplot is followed by the appearance of a tooltip which shows the coordinates. It is also possible to find clusters with k-means clustering by defining the number of clusters and the number of iterations. Other interactions include changing the opacity and circle radius of the points using the two sliders as to make it easier to understand the data.");
    }
  }
}
</script>

<style>
.circle {
  fill: #498fff;
  opacity: 0.75;
}

div.tooltip {
  position: absolute;
  text-align: center;
  color: #ffffff;
  /*width: 150px;*/
  padding: 5px;
  background: #498fff;
  border: 0px;
  border-radius: 3px;
  pointer-events: none;
  font-family: 'Product Sans Light';
  font-weight: 400;
  font-size: 16px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
}

text {
  font-family: 'Product Sans Light';
  font-weight: 400;
  font-size: 16px;
}

.tick text {
  fill: #666666;
  font-family: 'Product Sans Regular';
  font-weight: 400;
  font-size: 16px;
}

.tick line {
  stroke: #C0C0BB;
  opacity: 0.4;
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
  fill: #666666;
  font-family: 'Product Sans Bold';
  font-weight: 400;
  font-size: 16px;
}

#scatterPlot {
  border: 100px;
  border-style: solid black;
}

#checkBox_id {
  top: 0px;
  left: 205px;
  color: white;
  width: 20px;
  height: 20px;
}

#cumulativeCheck-Box {
  position: relative;
  top: 5px;
  left: 45px;
}

#play-button {
  padding: 10px;
  color: #ffffff;
  border: 0px;
  font-size: 18px;
  font-family: 'Product Sans Bold';
  font-weight: 400;
  border-radius: 3px;
  text-transform: uppercase;
  background-color: #498fff;
}

#play-button:hover {
  background-color: #3978dd;
}

#play-button:active {
  background-color: #2b67c7;
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
  stroke: #858585;
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

.label {
  fill: #666666;
  font-family: 'Product Sans Regular';
  font-weight: 400;
  font-size: 16px;
}

.aperture {
    /* Occupy the full viewport */
    width: 100%;
    height: 100%;
}

.accordionItem{
    float:left;
    display:block;
    width:100%;
    box-sizing: border-box;
    font-family:'Open-sans',Arial,sans-serif;
}
.accordionItemTitle{
    cursor:pointer;
    margin:0px 0px 20px 0px;
    padding:10px;
    background:#498fff;
    color:#fff;
    font-size: 18px;
    font-family: 'Product Sans Bold';
    font-weight: 400;
    text-transform: uppercase;
    width:100%;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    border-radius: 3px;
    box-sizing: border-box;
    text-align: center;
}

.accordionItemTitle:hover {
  background-color: #3978dd;
}

.accordionItemTitle:active {
  background-color: #2b67c7;
}

.accClosed .accordionItemContent{
    height:0px;
    transition:height 1s ease-out;
    -webkit-transform: scaleY(0);
	-o-transform: scaleY(0);
	-ms-transform: scaleY(0);
	transform: scaleY(0);
    float:left;
    display:block;
    
    
}
.accOpened .accordionItemContent{
        padding: 20px;
    background-color: #fff;
    width: 100%;
    margin: 0px 0px 20px 0px;
    display:block;
    -webkit-transform: scaleY(1);
	-o-transform: scaleY(1);
	-ms-transform: scaleY(1);
	transform: scaleY(1);
    -webkit-transform-origin: top;
	-o-transform-origin: top;
	-ms-transform-origin: top;
	transform-origin: top;

	-webkit-transition: -webkit-transform 0.4s ease-out;
	-o-transition: -o-transform 0.4s ease;
	-ms-transition: -ms-transform 0.4s ease;
	transition: transform 0.4s ease;
        box-sizing: border-box;
}

.accOpened .accordionItemTitle{
    margin:0px;
        -webkit-border-top-left-radius: 3px;
    -webkit-border-top-right-radius: 3px;
    -moz-border-radius-topleft: 3px;
    -moz-border-radius-topright: 3px;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    -webkit-border-bottom-right-radius: 0px;
    -webkit-border-bottom-left-radius: 0px;
    -moz-border-radius-bottomright: 0px;
    -moz-border-radius-bottomleft: 0px;
    border-bottom-right-radius: 0px;
    border-bottom-left-radius: 0px;
    background-color: #bdc3c7;
    color: #7f8c8d;
}

</style>