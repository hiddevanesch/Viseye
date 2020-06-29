<template>
  <div class="visrow height-fix">
    <div class="viscol col80">
      <section class = "vis">
        <div id ="scatterPlot">
          <div id="tooltip"></div>
          <svg class="aperture" viewBox = "0 0 960 500" preserveAspectRatio="none">
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
              <input type="range" min="0" max="10" value="5" class="range full-width" id="opacityCircle">
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
                      <input type="radio" id="2" name="radio1" @click="clearInputFieldClusters">
                      <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">3 
                    <input type="radio" id="3" name="radio1" @click="clearInputFieldClusters">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">4 
                    <input type="radio" id="4" name="radio1" @click="clearInputFieldClusters">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">5 
                    <input type="radio" id="5" name="radio1" @click="clearInputFieldClusters">
                    <span class="checkmark"></span>
                  </label>
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Customized quantity</label>
                </div>
                <div class="vismenurow bmar-tiny">
                <input class="full-width" type="number" id="userInputClusters" min="2" max="10" v-on:change="uncheckButtonsClusters">
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Number of iterations</label>
                </div>
                <div class="vismenurow bmar-tiny">
                  <label class = "cluster">25 
                      <input type="radio" id="25" name="radio2" @click="clearInputFieldIterations">
                      <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">50
                    <input type="radio" id="50" name="radio2" @click="clearInputFieldIterations" checked="checked">
                    <span class="checkmark"></span>
                  </label>
                  </div>
                  <div class="vismenurow bmar-tiny">
                  <label class = "cluster">100
                    <input type="radio" id="100" name="radio2" @click="clearInputFieldIterations">
                    <span class="checkmark"></span>
                  </label>
                  <label class = "cluster">200
                    <input type="radio" id="200" name="radio2" @click="clearInputFieldIterations">
                    <span class="checkmark"></span>
                  </label>
                </div>
                <div class="vismenurow bmar-tiny">
                <label class="label">Customized quantity</label>
                </div>
                <div class="vismenurow bmar-tiny">
                <input type="number" class="full-width" id="userInputIteration" v-on:change="uncheckButtonsIterations">
                </div>
                <div class="vismenurow">
                <input type="button" id="submit" value="Start" class="button button-blue full-width">
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
    this.accordion();
    this.visualize();
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
    const svg = d3.select('#scatterPlotSVG');

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    let data;
    let stimulusName;
    let allVersions = [];
    let dataSelected;
    let resData;
    let globalCluster;
    let globalIterations;

    //Random color for Circles
    const randomColor =  Math.floor(Math.random()*16777215).toString(16);

    //Create dropdown menu
    //Create select keyword with click event listener
      d3.select("#selectMenu")
            .on('change', function() {
              onStimulusNameClicked(this.value);
            });

      //Store the selected option
      const onStimulusNameClicked = option => {
        stimulusName = option;
        render(undefined, undefined);
      }

    //plot a scatterplot
    const scatterPlot = (selection, props) => {
      const {
        title,
        xValue,
        yValue,
        margin,
        clusters,
        iterations
      } = props;

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      
      const yAxisLabel = 'Mapped fixation point y';
      const xAxisLabel = 'Mapped fixation point x';

      let circleRadius;

      //Filter the data on the selected stimulus
      dataSelected = data.filter(d => d.StimuliName == stimulusName);

      //Select the image according to the selected map(version)
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

      //Transform the image resolution into range and domain of the axes
      const xScale = d3.scaleLinear()
        .domain([0, imgWidth])
        .range([0, innerWidth])
        .nice();

      const yScaleAxis = d3.scaleLinear()
        .domain([0, imgHeight])
        .range([innerHeight, 0])
        .nice();

      const yScale = d3.scaleLinear()
      .domain([0, imgHeight])
      .range([0, innerHeight])
      .nice();

      //Create container for scatterplot
      const g = selection.selectAll('.containerScatter').data([null]);
      const gEnter = g
        .enter().append('g')
          .attr('class', 'containerScatter');
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

      //Creating the axes
      const yAxisG = g.select('.y-axis');
      const yAxisGEnter = gEnter
        .append('g')
          .attr('class', 'y-axis');
      yAxisG
        .merge(yAxisGEnter)
          .call(yAxis)
          .selectAll('.domain').remove();

      //Y-axis label
      yAxisGEnter
          .append('text')
          .attr('class', 'axis-label')
          .attr('y', -60)
          .attr('transform', `rotate(-90)`)
          .attr('text-anchor', 'middle')
          .merge(yAxisG.select('.axis-label'))
              .attr('x', -innerHeight / 2)
              .text(yAxisLabel);

      const xAxisG = g.select('.x-axis');
      const xAxisGEnter = gEnter
        .append('g')
            .attr('class', 'x-axis');
      xAxisG
        .merge(xAxisGEnter)
          .attr('transform', `translate(0,${innerHeight})`)
          .call(xAxis)
          .selectAll('.domain').remove();

      //X-axis label
      xAxisGEnter
        .append('text')
          .attr('class', 'axis-label')
          .attr('y', 60)
          .attr('text-anchor', 'middle')
        .merge(xAxisG.select('.axis-label'))
          .attr('x', innerWidth / 2)
          .text(xAxisLabel);

      gEnter.append('text')
        .attr('class', 'title')
          .attr('y', -15)
        .text(title);

      //Format of tooltip
      let tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
        + ', ' + d['MappedFixationPointY'] + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
        + '<br/>' + 'Description: ' + d['description'];

      //Draw the circles using data join
      const drawScatterPlot = (radius, opacity) => {
        //Draw circles for each row of the selected data
        const circles = g.merge(gEnter)
          .selectAll('circle').data(dataSelected);
        circles
          .enter().append('circle')
          .merge(circles)
            .on('mouseover', d => {
              d3.select('#tooltip').transition()
                  .duration(200)
                    .style('opacity', 1)
                    .style("left", "calc(" + (d3.event.pageX + 90) + "px - 20vw)")
                    .style("top", "calc(" + (d3.event.pageY + 15) + "px - 15vh)")
                    .style('display', 'block');
              d3.select('#tooltip').html(tooltipformat(d));
            })
            .on('mouseout', () => {
              d3.select('#tooltip')
                .transition().duration(400)
                .style('opacity', 0);
            })
            .attr('r', radius)
            .attr('cx', innerWidth/2)
            .attr('cy', innerHeight/2)
            .style('fill', '#' + randomColor)
            .attr('fill-opacity', opacity)
          .transition().duration(1000)
            .attr('cx', d => {return xScale(xValue(d))})
            .attr('cy', d => {return yScale(yValue(d))});
        circles
          .exit()
            .transition().duration(1000)
              .attr('r', 0)
              .attr('cx', innerWidth/2)
              .attr('cy', innerHeight/2)
            .remove();
      }

      //Update the plot with the selected circle radius
      const updateRadius = (radius, opacity) => {
        //Unclustered format of tooltip
        let tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
          + ', ' + d['MappedFixationPointY'] + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
          + '<br/>' + 'Description: ' + d['description'];

        //Draw circles for each row of the selected data
        const circles = g.merge(gEnter)
          .selectAll('circle').data(dataSelected);
        circles
          .enter().append('circle')
          .merge(circles)
            .on('mouseover', d => {
              d3.select('#tooltip').transition()
                  .duration(200)
                    .style('opacity', 1)
                    .style("left", "calc(" + (d3.event.pageX + 90) + "px - 20vw)")
                    .style("top", "calc(" + (d3.event.pageY + 15) + "px - 15vh)")
                    .style('display', 'block');
              d3.select('#tooltip').html(tooltipformat(d));
            })
            .on('mouseout', () => {
              d3.select('#tooltip')
                .transition().duration(400)
                .style('opacity', 0);
            })
            .attr('r', radius)
            .style('fill', '#' + randomColor)
            .attr('fill-opacity', opacity)
          .transition().duration(1000)
            .attr('cx', d => {return xScale(xValue(d))})
            .attr('cy', d => {return yScale(yValue(d))});
        circles
          .exit()
            .transition().duration(1000)
              .attr('r', 0)
              .attr('cx', innerWidth/2)
              .attr('cy', innerHeight/2)
            .remove();
      }

      let opacity = +document.getElementById('opacityCircle').value * 0.1;
      circleRadius = +document.getElementById('radiusCircle').value;

      if (globalCluster == undefined && (globalIterations == undefined)) {
        drawScatterPlot(circleRadius, opacity);
        //update circleRadius
        d3.select('#radiusCircle').on('input', function() {
          circleRadius = +this.value;
          updateRadius(circleRadius, opacity);
        });

        //update circleOpacity
        d3.select('#opacityCircle').on('input', function() {
          opacity = +this.value * 0.1;
          updateRadius(circleRadius, opacity);
        });
      }

      const Cluster = (numClusters, maxIter) => {
        //Clone the array of objects without dependencies
        //const clone = require('rfdc')() // Returns the deep copy function

        // the current iteration		
        let iter = 1,
          centroids = [],
          points = [],
          temp = [],
          intervalTime = 50,
          duringIteration,
          maxTempIter = maxIter;

        for (let i = 0; i < dataSelected.length; i++) {
          points.push(Object.assign({}, dataSelected[i]));
          temp.push(Object.assign({}, dataSelected[i]));
        }

        const colors = d3.scaleOrdinal(d3.schemeCategory10);

        //Update iteration text
        const iterationsText = svg.selectAll('.numberIterations').data([null])
        iterationsText
          .enter().append('g')
          .merge(iterationsText)
            .append('text')
              .attr('class', 'numberIterations')
              .attr('transform', `translate(${innerWidth + margin.left - (1/4 * innerWidth)}, ${55 + innerHeight + margin.top})`)
              .text('');

        //Return random centroid points with coloring
        let randomCentroid = (fill) => {
          let r = Math.floor(Math.random()*temp.length);
          let centroid = Object.assign({}, temp[r]);

          temp.splice(r, 1);
          centroid.fill = fill;
          return centroid;
        }
      
        //Gives distinct coloring to all centroid points
        let initializeCentroids = (num) => {
          let allCentroids = [];
          for (let i = 0; i < num; i++) {
            let color = colors(i);
            let centroid = randomCentroid(color);
            centroid.id = 'centroid' + '-' + i + 1;
            centroid.clusterGroup = i + 1 + ' (centroid)'
            allCentroids.push(centroid);
          }
          return allCentroids;
        }
        
        //Computes the euclidian distane
        let euclidianDistance = (a, b) => {
          let dx = b.MappedFixationPointX - a.MappedFixationPointX,
            dy = b.MappedFixationPointY - a.MappedFixationPointY;
          return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        }

        //Find the closest centroid to the point as argument
        let findClosestCentroid = (point) => {
          let closest = {i: -1, distance: Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2))};
          centroids.forEach((d, i) => {
            let distance = euclidianDistance(d, point);
            // Only update when the centroid is closer
            if (distance < closest.distance) {
              closest.i = i;
              closest.distance = distance;
            }
          });
          return (centroids[closest.i]); 
        }
        
        //All points close to the centroid get the according coloring
        const colorizePoints = () => {
          points.forEach(d => {
            let closest = findClosestCentroid(d);
            d.fill = closest.fill;
            d.clusterGroup = closest.clusterGroup.substring(0, 1);
          });
        }
      
        //Computes the center of the cluster by the coordinates
        let computeClusterCenter = (cluster) => {
          return [
            d3.mean(cluster, d => { return d.MappedFixationPointX; }), 
            d3.mean(cluster, d => { return d.MappedFixationPointY; })
          ];
        }
        
        //Move the centroids to the center of cluster
        const moveCentroids = () => {
          centroids.forEach(d => {
            // Get clusters based on their coloring
            let cluster = points.filter((points) => {
              return points.fill === d.fill;
            });
            // Compute the cluster centers
            let center = computeClusterCenter(cluster);
            // Move the centroid
            d.MappedFixationPointX = center[0];
            d.MappedFixationPointY = center[1];
          });
        }
      
        //updates the plot
        const update = (radius) => {
          let clusterData = points.concat(centroids);
        
          // The data join
          let circles = g.merge(gEnter)
            .selectAll('circle').data(clusterData);

          //Reformat of tooltip
          tooltipformat = d => 'User: ' + d['user'] + '<br/>' + 'Coordinates: (' + d['MappedFixationPointX']
            + ', ' + d['MappedFixationPointY'] + ')' + '<br/>' + 'Fixation duration: ' + d['FixationDuration']
            + '<br/>' + 'Description: ' + d['description'] + '<br/>' + 'Cluster Group: ' + d['clusterGroup'];

          // Create new elements as needed
          circles
            .enter().append('circle')
            .merge(circles)
              .attr('r', radius)
              .attr('class', d => d.id)
              .on('mouseover', d => {
                d3.select('#tooltip').transition()
                    .duration(200)
                      .style('opacity', 1)
                      .style("left", "calc(" + (d3.event.pageX + 90) + "px - 20vw)")
                      .style("top", "calc(" + (d3.event.pageY + 15) + "px - 15vh)")
                      .style('display', 'block');
                d3.select('#tooltip').html(tooltipformat(d));
              })
              .on('mouseout', () => {
                d3.select('#tooltip')
                  .transition().duration(400)
                  .style('opacity', 0);
              })
            // Update old elements as needed
              .transition().delay(intervalTime/20).duration(intervalTime/2)
                .attr('cx', d => {return xScale(xValue(d))})
                .attr('cy', d => {return yScale(yValue(d))})
                .style('fill', d => { return d.fill; });
          // Remove old nodes
          circles
            .exit()
              .remove();
        }

        if (globalCluster != undefined && (globalIterations != undefined)) {
          //update circleRadius
          d3.select('#radiusCircle').on('input', function() {
            circleRadius = +this.value;
            update(circleRadius, opacity);
            if(duringIteration) {
              maxTempIter -= 1;
            }
          });
          //update circleOpacity
          d3.select('#opacityCircle').on('input', function() {
            opacity = +this.value * 0.1;
            update(circleRadius, opacity);
            if(duringIteration) {
              maxTempIter -= 1;
            }
          });
        }
      
        //Update the text in the label
        const setText = (text) => {
          svg.selectAll('.numberIterations').text(text);
        }
        
        //Executes iteration of the algorithm
        const iterate = () => {
          // Update label
          setText('Iteration ' + iter + ' of ' + maxIter);
      
          // Colorize the points
          colorizePoints();
          
          // Move the centroids
          moveCentroids();

          duringIteration = true;
          // Update the scatter plot
          update(circleRadius);
          duringIteration = false;
        }
      
        //Initialization of the algorithm, calls one iteration each 500 ms
        const initialize = () => {
          
          // Initialize random and centroids
          centroids = initializeCentroids(numClusters);

          // initial drawing
          update(circleRadius);
          
          let interval = setInterval(() => {
            if(iter <= maxTempIter) {
              iterate();
              iter++;
            } else {
              clearInterval(interval);
              setText('Done');
            }
          }, intervalTime);
        }

          // Call the main function
          initialize();
      }


      if (clusters != undefined && iterations != undefined) {
        Cluster(clusters, iterations);
      }
    }

    //Function render
    const render = (clusters, iterations) => {
      globalCluster = clusters;
      globalIterations = iterations;

      //Invoke function to generate the scatterplot
      svg.call(scatterPlot, {
        title: 'Scatterplot: Eye tracking data per city',
        xValue: d => d.MappedFixationPointX,
        yValue: d => d.MappedFixationPointY,
        margin: { top: 10, right: 20, bottom: 70, left: 80 },
        clusters: clusters,
        iterations: iterations
      });
    }

    //(RE-)Render the data according to the selection by filter
    d3.csv('static/csv/resolution.csv')
    .then(loadedData => {
    resData = loadedData;

    data = this.files;
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
    });

    stimulusName = d3.select("#selectMenu").node().value;
    render(undefined, undefined);
    });

    let code;

    d3.select("#submit")
            .on('click', function() {
              clustersQuantity();
            });

    //Add event handlers to the form of the cluster collapsible.
    const clustersQuantity = () => {
      const userInputForm = document.getElementById('userInputForm');
      let preDefinedClusterQuantity;
      for (let i = 0; i < 5; i++) {
        if(userInputForm.elements[i].checked == true) {
          preDefinedClusterQuantity = +userInputForm.elements[i].id;
          break;
        }
      }
      let customizedClusterQuantity = userInputForm.elements[4].value;
      let preDefinedIterationQuantity;
      for (let i = 5; i < 9; i++) {
        if(userInputForm.elements[i].checked == true) {
          preDefinedIterationQuantity = +userInputForm.elements[i].id;
          break;
        }
      }
      let customizedIterationQuantity = userInputForm.elements[9].value;

      //When user input field is filled in, choose the customized values.
      //When the radio boxes are checked, choose the pre-defined values.
      if (customizedClusterQuantity != '' && (customizedIterationQuantity != '')) {
        if (code != undefined) {
          clearTimeout(code);
          code = render(customizedClusterQuantity, customizedIterationQuantity);
          setTimeout(code, 17000000);
        } else {
          code = render(customizedClusterQuantity, customizedIterationQuantity);
          setTimeout(code, 10000000);
        }
      } else if (preDefinedClusterQuantity != undefined && (preDefinedIterationQuantity != undefined)) {
        if (code != undefined) {
          clearTimeout(code);
          code = render(preDefinedClusterQuantity, preDefinedIterationQuantity);
          setTimeout(code, 10000000);
        } else {
          code = render(preDefinedClusterQuantity, preDefinedIterationQuantity);
          setTimeout(code, 10000000);
        }
      } else if (preDefinedClusterQuantity != undefined && (customizedIterationQuantity != '')) {
        if (code != undefined) {
          clearTimeout(code);
          code = render(preDefinedClusterQuantity, customizedIterationQuantity);
          setTimeout(code, 10000000);
        } else {
          code = render(preDefinedClusterQuantity, customizedIterationQuantity);
          setTimeout(code, 10000000);
        }
      } else if (customizedClusterQuantity != '' && (preDefinedIterationQuantity != undefined)) {
        if (code != undefined) {
          clearTimeout(code);
          code = render(customizedClusterQuantity, preDefinedIterationQuantity);
          setTimeout(code, 10000000);
        } else {
          code = render(customizedClusterQuantity, preDefinedIterationQuantity);
          setTimeout(code, 10000000);
        }
      } else {
        alert('Please select the desired number of iterations and clusters for k-means clustering.');
      }
    }

    const zoom = () => {      
      const main_svg = d3.select('#scatterPlot svg.aperture').attr('class', 'zoom')
      , mini_svg   = d3.select('#mini svg').append('g').attr('class', 'zoom')
      , viewbox = main_svg.attr('viewBox').split(' ').map(d => +d)
      // store the image's initial viewBox
      , extent_1 = [
        [viewbox[0], viewbox[1]]
      , [(viewbox[2] - viewbox[0]), (viewbox[3] - viewbox[1])]
      ]
      , brush  = d3.brush()
        .extent(extent_1)
        .on('brush', brushed)
      , zoom = d3.zoom()
        .scaleExtent([0.05, 1])
        .extent(extent_1)
        .on('zoom', zoomed)
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
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
        
        let sel = d3.event.selection
        , vb = sel
            ? [sel[0][0], sel[0][1], (sel[1][0] - sel[0][0]), (sel[1][1] - sel[0][1])]
            : viewbox
        , k = vb[3] / viewbox[3]
        , t = d3.zoomIdentity.translate(vb[0], vb[1]).scale(k)
        ;

        mini_svg
          .property('__zoom', t)
        ;
        main_svg
          .attr('viewBox', vb.join(' '))
          .property('__zoom', t)
        ;
      } // brushed()
      
      function zoomed() {
        // If the zoom input was on the minimap, forward it to the main SVG
        if(this === mini_svg.node()) {
          return main_svg.call(zoom.transform, d3.event.transform);
        }

        // Disable panning on main_svg
        if(d3.event.sourceEvent.type === 'mousemove') return;
        // Ignore zoom via brush
        if(!d3.event.sourceEvent || d3.event.sourceEvent.type === 'brush') return;
      
        // Process the zoom event on the main SVG
        let t = d3.event.transform;
        
        t.x = t.x < viewbox[0] ? viewbox[0] : t.x;
        t.x = t.x > viewbox[2] ? viewbox[2] : t.x;
        t.y = t.y < viewbox[1] ? viewbox[1] : t.y;
        t.y = t.y > viewbox[3] ? viewbox[3] : t.y;
        
        if(t.k === 1) t.x = t.y = 0;
      
        const vb = [t.x, t.y, viewbox[2] * t.k, viewbox[3] * t.k];
      
        main_svg.attr('viewBox', vb.join(' '));
        mini_svg
          .property('__zoom', t)
          .call(
            brush.move
            , [[t.x, t.y], [t.x + vb[2], t.y + vb[3]]]
          )
        ;
      } // zoomed()
    }

    zoom();
    },
    info() {
      window.alert("In a scatterplot, the gaze points of a user are plotted. The metro map is the stimulus and can also be seen in the scatterplot. This way, important parts of the metro map can be distinguished.\n\nThere are several interactions for the scatterplot of this website. Between the different metro maps can be filtered. The timestamp slider accommodates the user to filter over time. Pressing the play button results in an animated visualization which plots the gaze points in the correct order in time which shows the general path of the users. When selecting the cumulative filter (which is turned on by default), all gaze points from the time before the time stamp is shown. Hovering over a point in the scatterplot is followed by the appearance of a tooltip which shows the coordinates. It is also possible to find clusters with k-means clustering by defining the number of clusters and the number of iterations. Other interactions include changing the opacity and circle radius of the points using the two sliders as to make it easier to understand the data.");
    },
    clearInputFieldClusters() {
      const userInputForm = document.getElementById('userInputForm');
      const userInputClusters = document.getElementById('userInputClusters');
      for (let i = 0; i < 4; i++){
        if (userInputForm.elements[i].checked == true) {
          userInputClusters.value = '';
          break;
        }
      }
    },
    uncheckButtonsClusters() {
      const userInputClusters = document.getElementById('userInputClusters');
      const userInputForm = document.getElementById('userInputForm');
      if (userInputClusters.value != '') {
        for (let i = 0; i < 4; i++) {
          if(userInputForm.elements[i].checked == true) {
            userInputForm.elements[i].checked = false;
            break;
          }
        }
      }
    },
    clearInputFieldIterations() {
      const userInputForm = document.getElementById('userInputForm');
      const userInputIteration = document.getElementById('userInputIteration');
      for (let i = 5; i < 9; i++){
        if (userInputForm.elements[i].checked == true) {
          userInputIteration.value = '';
          break;
        }
      }
    },
    uncheckButtonsIterations() {
      const userInputIteration = document.getElementById('userInputIteration');
      const userInputForm = document.getElementById('userInputForm');

      if (userInputIteration.value != '') {
        for (let i = 5; i < 9; i++) {
          if(userInputForm.elements[i].checked == true) {
            userInputForm.elements[i].checked = false;
            break;
          }
        }
      }
    }
  }
}
</script>

<style>
#tooltip {
  opacity: 0;
  position: absolute;
  padding: 5px;
  pointer-events: none;
  color: white;
  font-family: 'Product Sans Light';
  font-weight: 400;
  font-size: 14px;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.25);
  background-color: #498fff;
  border-radius: 3px;
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

.cluster {
  color: #666666;
  font-family: 'Product Sans Regular';
  font-weight: 400;
  font-size: 16px;
  margin-left: 8px;
  margin-right: 8px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-left: 4px;
  padding-right: 4px;
  background-color: #dddddd;
  border-radius: 3px;
}
</style>