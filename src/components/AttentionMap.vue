<template>
  <div class = "visrow height-fix">
    <div class="viscol col80">
      <div id ="attentionMap">
        <svg class = "aperture" width = 960 height = 500 viewBox="0 0 960 500" preserveAspectRatio="none">
          <svg id = "svgAttention" width = "960" height = "500"></svg>
          <svg id = "svgLegend"></svg>
        </svg>
      </div>
    </div>
    <div class="viscol col20 bg-ldgray">
      <div id="mini">
        <svg viewBox="0 0 960 500">
          <use xlink:href="#svgAttention" />
        </svg>
      </div><!--miniMap-->
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
    visualize() {
      const svg = d3.select('#svgAttention');

      const width = +svg.attr('width');
      const height = +svg.attr('height');

      let data;
      let stimulusName;
      let dataSelected;
      let resData;
      let allVersions = [];

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

      //Plot a attention map
      const attentionMap = (selection, props) => {
        const {
          margin,
          maps
        } = props;

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        const yAxisLabel = 'Mapped fixation point y';
        const xAxisLabel = 'Mapped fixation point x';

        //Filter the data
        dataSelected = data.filter(d => d.StimuliName == stimulusName);

        //Select the image according to the selected map(version)
        let imageSelected = maps.filter(d => d == stimulusName);

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

        const yScale = d3.scaleLinear()
          .domain([0, imgHeight])
          .range([0, innerHeight])
          .nice();

        const yScaleAxis = d3.scaleLinear()
          .domain([0, imgHeight])
          .range([innerHeight, 0])
          .nice();

        //Create container for attention map
        const g = selection.selectAll('.containerAttention').data([null]);
        const gEnter = g
          .enter().append('g')
          .attr('class', 'containerAttention');
          
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
                .attr('x', innerHeight / 2)
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

        // compute the density data
        const densityData = d3.contourDensity()
          .x(d => { 
            return xScale(d.MappedFixationPointX); 
          })
          .y(d => { 
            return yScale(d.MappedFixationPointY); 
          })
          .size([imgWidth, imgHeight])
          .bandwidth(15);
        
        // Prepare a color palette
        let color = d3.scaleSequential(d3.interpolateInferno).domain(d3.extent(densityData(dataSelected).map(d => d.value))).nice()
        ;

        // Plot the attentio map
        const paths = g.merge(gEnter)
          .selectAll('path').data(densityData(dataSelected));
        paths
          .enter().append('path')
          .merge(paths)
            .attr('d', d3.geoPath())
            .attr('fill', d => {
              return color(d.value);
            })
            .attr('opacity', 0.4);
        paths
          .exit().remove();
        
        const main_svg = d3.select('#attentionMap svg.aperture').attr('class', 'zoom')
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
            .scaleExtent([0.2, 1])
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

        //Color gradient legend
        const legend = d3.select('#svgLegend');

        let colorScale = d3.scaleSequential(d3.interpolateInferno)
        .domain([innerHeight, 0])

        //Draw the rectangle and fill with gradient
        legend.selectAll(".bars")
          .data(d3.range(innerHeight), function(d) { return d; })
            .enter().append("rect")
              .attr("class", "bars")
              .attr("x", function(d, i) { return i; })
              .attr("y", 0)
              .attr('transform',
                `translate(${width - margin.right + 25},${margin.top}) rotate(90)`
              )
              .attr('width', 1)
              .attr('height', 20)
              .style("fill", function(d) { return colorScale(d); })
        ;

        //create tick marks
        const legScale = d3.scaleBand()
          .domain('Low Medium-low Medium Medium-high High'.split(' '))
          .range([innerHeight, 0]);
        
        const axisLeg = d3.axisRight(legScale);

        const titleLeg = 'Level of Density'
        
        //Draw axis
        legend
          .append("g")
            .attr('class', 'axisLeg')
            .attr('transform',
                  `translate(${width - margin.right + 25},${margin.top})`
                )
            .call(axisLeg)
            .selectAll('.domain').remove();

        //Denote that the legend is about density
        legend
          .append('text')
            .attr('class', 'titleLeg')
            .attr('transform',
                  `translate(${width - margin.right + 5},${margin.top - 10})`
                )
            .text(titleLeg);
      }

      //Function render
      const render = () => {
        //Invoke function to generate the scatterplot
        svg.call(attentionMap, {
          margin: { top: 10, right: 130, bottom: 80, left: 90 },
          maps: allVersions,
          xValue: d => d.MappedFixationPointX,
          yValue: d => d.MappedFixationPointY,
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
        if (!allVersions.includes(d.StimuliName)) {
          allVersions.push(d.StimuliName);
        }
      });

      resData.forEach(d => {
        d.width = +d.width;
        d.height = +d.height
      });

      stimulusName = d3.select("#selectMenu").node().value;
      render();
      });
    }
  }
}
</script>

<style>
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

#attentionMap {
  border: 100px;
  border-style: solid black;
}

.axis-label {
  fill: #8E8883;
}

.aperture {
    /* Occupy the full viewport */
    width: 100%;
    height: 100%;
}
</style>