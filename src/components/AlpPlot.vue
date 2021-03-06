<template>
  <div class="visrow height-fix">
    <div class="viscol col80">
      <svg class="alp-plot" id="alpPlot"/>
    </div>
    <div class="viscol col20 bg-ldgray">
      <div class="vismenurow bmar-tiny">
        <label class="label">Visualization type</label>
      </div>
      <div class="vismenurow bmar-tiny">
        <select class="selectMenu full-width" id="plot_type-select"></select>
      </div>
      <div class="vismenurow bmar-tiny">
        <label class="label">Visualizations view</label>
      </div>
      <div class="vismenurow bmar-tiny">
        <select class="selectMenu full-width" id="normalized_view-select"></select>
      </div>
      <div class="vismenurow bmar-tiny">
        <label class="label">Focus mode</label>
      </div>
      <div class="vismenurow bmar-tiny">
        <select class="selectMenu full-width" id="focus_mode-select"></select>
      </div>
      <div class="bottom-align vw17 right-zero">
        <button type="button" class="button button-orange bmar-small full-width" @click="info">info</button>
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
      'filesAOI'
      ])
  },
  mounted: function() {
    this.visualize();
  },
  methods: {
    visualize() {
      /// FROM alpGeneration
      //const yValue = d => d.seq_bar_length + d.re_reading_bar_length;
      //const xValue = d => d.trial;
      //const xValue = d => d.bar_position;
      const xWidth = d => d.dwell_duration_log;

      const height = document.body.clientHeight - 50;
      const width = document.body.clientWidth * 0.68;
      const svg = d3
        .select("#alpPlot")
        .attr("width", width)
        .attr("height", height);

      const margin = { top: 200, right: 50, bottom: 50, left: 50 };

      const alpVizWidth = width - margin.left - margin.right;
      let alpVizHeight;
      const alpSpacing = 10;

      // zooming and panning
      const zoomG = svg
        .append("g")
        .attr("width", width)
        .attr("height", height);
      svg.call(
        d3.zoom().on("zoom", () => {
          zoomG.attr("transform", d3.event.transform);
        })
      );

      //Create select keyword with click event listener
      //to go back to alpselector when stimuli changes
      const vm = this;
      d3.select("#selectMenu")
            .on('change', function() {
              vm.$emit('to-alp-select');
            });

      // create the group for alpscarf and legend respecrtively
      // legend doesn't need to be zoomable
      const legendG = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, 25)`);
      // group array for alpscarf; one group for each participant
      let alpG = [];

      // restore state
      let data;
      let palette;
      let pNameList;

      let loadedData = loadAndProcessData();
      const AOIValue = d => d.AOI;
      const colorValue = d => d.color;

      palette = d3
        .scaleOrdinal()
        .domain(loadedData[2].map(AOIValue))
        .range(loadedData[2].map(colorValue));

      data = loadedData[1];

      // generate list of unique p_name
      const pName = data.map(d => d.p_name);
      pNameList = [...new Set(pName)];

      alpVizHeight = (height - margin.top - margin.bottom) / pNameList.length;

      pNameList.forEach((d, i) => {
        // alpscarf is zoomable
        alpG[i] = zoomG
          .append("g")
          .attr(
            "transform",
            `translate(${margin.left}, ${margin.top + alpVizHeight * i})`
          );
      });

      //let selectedAOI = null;
      let selectedAOI = [];
      const setSelectedAOI = aoi => {
        /*
          selectedAOI = (!selectedAOI || !selectedAOI.includes(aoi))
              ? aoi
              : null;
          */

        if (selectedAOI.length === 0 || !selectedAOI.includes(aoi)) {
          selectedAOI.push(aoi);
        } else {
          selectedAOI = selectedAOI.filter(item => item !== aoi);
        }
        render();
      };

      let plot_type = "alpscarf";
      let normalized_view = "normalized";
      let focus_mode = "transition-focus";

      const plot_type_clicked = value => {
        plot_type = value;
        render();
      };
      const normalized_view_clicked = value => {
        normalized_view = value;
        render();
      };
      const focus_mode_clicked = value => {
        focus_mode = value;
        render();
      };

      function render() {
        // create the outer 'select' element
        let selectPlotType = d3.select("#plot_type-select"); //null means one 'select' element as we only need one menu
        selectPlotType = selectPlotType
          .on("change", function() {
            //https://www.w3schools.com/jsref/event_onchange.asp
            plot_type_clicked(this.value);
            //console.log(this.value);
          });

        const optionPlotType = selectPlotType.selectAll("option").data([
            "alpscarf",
            "traditional scarf",
            "mountain only",
            "valley only"
          ]);
        optionPlotType
          .enter()
          .append("option")
          .merge(optionPlotType)
          .attr("value", d => d)
          .property("selected", d => d === plot_type)
          .text(d => d);

        // create the outer 'select' element
        let selectNormalizedView = d3.select("#normalized_view-select"); //null means one 'select' element as we only need one menu
        selectNormalizedView = selectNormalizedView
          .on("change", function() {
            //https://www.w3schools.com/jsref/event_onchange.asp
            normalized_view_clicked(this.value);
            //console.log(this.value);
          });

        const optionNormalizedView = selectNormalizedView.selectAll("option").data(["normalized", "unnormalized"]);
        optionNormalizedView
          .enter()
          .append("option")
          .merge(optionNormalizedView)
          .attr("value", d => d)
          .property("selected", d => d === normalized_view)
          .text(d => d);

        // create the outer 'select' element
        let selectFocusMode = d3.select("#focus_mode-select"); //null means one 'select' element as we only need one menu
        selectFocusMode = selectFocusMode
          .on("change", function() {
            //https://www.w3schools.com/jsref/event_onchange.asp
            focus_mode_clicked(this.value);
            //console.log(this.value);
          });

        const optionFocusMode = selectFocusMode.selectAll("option").data(["transition-focus", "duration-focus"]);
        optionFocusMode
          .enter()
          .append("option")
          .merge(optionFocusMode)
          .attr("value", d => d)
          .property("selected", d => d === focus_mode)
          .text(d => d);

        pNameList.forEach((d, i) => {
          alpGen(alpG[i],
                data,
                palette,
                d,
                50,
                alpVizWidth,
                (alpVizHeight-alpSpacing),
                setSelectedAOI,
                selectedAOI,
                plot_type,
                (normalized_view == "normalized"),
                (focus_mode == "transition-focus"))
        });

        colorLegend(legendG,
                    palette,
                    10,
                    30,
                    30,
                    180,
                    setSelectedAOI,
                    selectedAOI
        )
      }

      render();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ///////////////////////////////////////////////////////////////////FORMER loadAndProcessData.js FUNCTION ///////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

      function loadAndProcessData() {
        let data = vm.filesAOI.slice();

        //Code for deleting points without AOI
        for (let i = data.length - 1; i >= 0; i--) {
          // eslint-disable-next-line no-prototype-builtins
          if (!data[i].hasOwnProperty("AOIName")) {
            data.splice(i, 1);
          }
        }
        let loadedData = [
          data_order(data),
          data_systhetic(data),
          data_color(data)
        ];
        loadedData[0].forEach(d => {
          d.AOI_order = +d.AOI_order;
        });
        loadedData[1].forEach(d => {
          //AOI
          //d.dwell_duration = +d.dwell_duration;
          d.FixationDuration = +d.FixationDuration;
          //p_name
          //group
        });

        // merge fixations into dwell + calculate width + calculate height
        loadedData[1] = alpscarf_add_height(
          alpscarf_add_width(merge_sequence(loadedData[1])),
          loadedData[0]
        );

        //Function for creating loadeddata[0]
        // Made by Simon & Floris
        function data_order(data) {
          var result = [];
          data.forEach(function(d) {
            let boolie = false;
            for (let i = 0; i < result.length; i++) {
              if (result[i].AOI == d.AOIName) {
                boolie = true
              }
            }
            if (!boolie) {
              result.push({ AOI_order: d.AOI_order, AOI: d.AOIName });
            }
          });
          return result;
        }

        function data_systhetic(data) {
          var results = JSON.parse(JSON.stringify(data));
          results.forEach(function(d) {
            delete d.AOI_order;
            delete d.AOIcolor;
          });
          return results;
        }

        function data_color(data) {
          var result = [];
          data.forEach(function(d) {
            let boolie = false;
            for (let i = 0; i < result.length; i++) {
              if (result[i].AOI == d.AOIName) {
                boolie = true
              }
            }
            if (!boolie) {
              result.push({ color: d.AOIcolor, AOI: d.AOIName });
            }
          });
          return result;
        }

        function alpscarf_add_height(data, aoi_names_pages_seq) {
          // restore result with height information
          let result = [];

          // parameter settings
          const w = 3;
          const s_min = 2;
          const incr_re_reading_length = 0.3;
          const scale_factor = 0.2;
          const base_factor = 2;
          const height_mode = "linear";

          // generate list of unique p_name
          const pName = data.map(d => d.p_name);
          let pNameList = [...new Set(pName)];

          let dataVis = [];

          pNameList.forEach(a_p_name => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.p_name === a_p_name);

            // initialize revisiting and conformity score
            dataVis.forEach(d => {
              d.revisiting_score = 0;
              d.conformity_score = 0;
            });

            const AOI_name = d => d.AOI;
            const AOI_seq = dataVis.map(AOI_name);
            // const AOI_order = d => d.AOI_order;
            // const AOI_order_seq = dataVis.map(AOI_order);
            const n_AOI_order = aoi_names_pages_seq.map(d => d.AOI_order)
              .length;

            // generate the sequence of interest in string
            const seq_of_interest = aoi_names_pages_seq
              .filter(d => d.AOI_order > 0)
              .sort(function(a, b) {
                return a.AOI_order - b.AOI_order;
              })
              .map(AOI_name)
              .join("_")
              .concat("_");

            // calculate revisiting score
            for (let i = 0; i < AOI_seq.length; i++) {
              if (i < AOI_seq.length - w + 1) {
                if (AOI_seq[i] == AOI_seq[i + w - 1]) {
                  for (let j = i; j <= i + w - 1; j++) {
                    dataVis[j].revisiting_score++;
                  }
                }
              }
            }

            // calculate conformity score
            for (let i = 0; i < AOI_seq.length; i++) {
              if (i < AOI_seq.length - s_min + 1) {
                for (
                  let s = s_min;
                  s <= Math.min(n_AOI_order, AOI_seq.length - i);
                  s++
                ) {
                  // generate the local sequence to compare (with seq_of_interest)
                  const seq_to_compare = AOI_seq.slice(i, i + s)
                    .join("_")
                    .concat("_");

                  // count the frequency of seq_to_compare in seq_of_interest
                  const rgxp = new RegExp(seq_to_compare, "g");
                  const freq_seq = (seq_of_interest.match(rgxp) || []).length;

                  //if (AOI_order_seq[i + s - 1] - AOI_order_seq[i + s - 2] == 1){
                  if (freq_seq >= 1) {
                    for (let j = i; j <= i + s - 1; j++) {
                      //dataVis[j].conformity_score++;
                      dataVis[j].conformity_score += freq_seq;
                    }
                  } else break;
                }
              }
            }

            // calculate bar length for mountains and valleys
            dataVis.forEach(d => {
              d.seq_bar_length =
                height_mode == "linear"
                  ? 1 + scale_factor * d.conformity_score
                  : base_factor ^ (scale_factor * d.conformity_score);
              d.re_reading_bar_length =
                incr_re_reading_length * d.revisiting_score;
            });

            result.push(...dataVis);
          });

          return result;
        }

        function alpscarf_add_width(data) {
          // restore result with width information
          let result = [];

          // generate list of unique p_name
          const pName = data.map(d => d.p_name);
          let pNameList = [...new Set(pName)];

          let dataVis = [];

          pNameList.forEach(a_p_name => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.p_name === a_p_name);

            // calculate width information
            let sum = 0;
            dataVis.forEach((d, j) => {
              d.trial = j + 1;
              d.dwell_duration_log =
                1 + Math.round(Math.log10(d.dwell_duration + 1));
              d.cum_dwell_duration = d.dwell_duration_log + sum;
              d.bar_position =
                d.cum_dwell_duration - 0.5 * d.dwell_duration_log;
              sum = d.cum_dwell_duration;
            });

            result.push(...dataVis);
          });

          return result;
        }

        function merge_sequence(data) {
          // restore merged result
          let result = [];

          // generate list of unique p_name
          const pName = data.map(d => d.user);
          let pNameList = [...new Set(pName)];

          let dataVis = [];

          pNameList.forEach(a_p_name => {
            // select the data of the participant specified
            dataVis = data.filter(d => d.user === a_p_name);

            // cumulating data
            let sum = 0;
            dataVis.forEach(d => {
              d.cum_duration = d.FixationDuration + sum;
              sum = d.cum_duration;
            });

            const AOI_name = d => d.AOIName;
            const AOI_seq = dataVis.map(AOI_name);
            const cum_duration = d => d.cum_duration;
            const cum_duration_seq = dataVis.map(cum_duration);

            let dwell_duration = 0;
            let incoming_dwell = []; // the most recently read dwell

            // approach similar to run_length
            for (let i = 0; i < AOI_seq.length; i++) {
              let count = 1;
              for (let j = i; j < AOI_seq.length; j++) {
                if (AOI_seq[i] !== AOI_seq[j + 1]) break;
                count++;
                i++;
              }

              dwell_duration =
                i < count
                  ? cum_duration_seq[i]
                  : cum_duration_seq[i] - cum_duration_seq[i - count];
              incoming_dwell = {
                p_name: a_p_name,
                AOI: AOI_seq[i],
                dwell_duration: dwell_duration
              };

              result.push(incoming_dwell);
            }
          });
          return result;
        }
        return loadedData;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////// FORMER colorLegend.js //////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      function colorLegend(selection,
                          colorScale,
                          circleRadius,
                          spacing,
                          textOffset,
                          backgroundRectHeight,
                          setSelectedAOI,
                          selectedAOI)
      {
        const n = colorScale.domain().length;
        const backgroundRect = selection.selectAll("rect").data([null]);
        backgroundRect
          .enter()
          .append("rect")
          .merge(backgroundRect)
          .attr("x", -circleRadius * 2)
          .attr("y", -circleRadius * 2)
          .attr("rx", circleRadius * 2)
          .attr("height", backgroundRectHeight)
          .attr("width", spacing * n + circleRadius * 6)
          .attr("fill", "black")
          .attr("opacity", 0.1);

        const groups = selection.selectAll("g").data(colorScale.domain());

        const groupEnter = groups
          .enter()
          .append("g") // make a function for enter so that circles can re-use
          .attr("class", "plot-tick");
        groupEnter
          .merge(groups)
          .attr("transform", (d, i) => `translate(${i * spacing}, 0)`)
          .attr("opacity", d =>
            //(!selectedAOI || d === selectedAOI)
            selectedAOI.length === 0 || selectedAOI.includes(d) ? 1 : 0.2
          )
          .on("click", d => setSelectedAOI(d)); // adding event listeners;
        groups.exit().remove();

        groupEnter
          .append("circle")
          .merge(groups.select("circle")) // groups already selectALl groups, so here we only need to select circles out of it
          .attr("fill", colorScale)
          .classed("highlighted", d => selectedAOI && selectedAOI === d)
          .attr("r", circleRadius);

        groupEnter
          .append("text")
          .merge(groups.select("text"))
          .text(d => d)
          .attr("y", textOffset)
          .attr("transform", `translate(${circleRadius * 2}, 0) rotate(45)`)
          .attr("class", "AOI-text");
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////// FORMER alpGeneration.js //////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
      function alpGen(selection,
                      data,
                      palette,
                      pName,
                      pNameOffset,
                      alpVizWidth,
                      alpVizHeight,
                      setSelectedAOI,
                      selectedAOI,
                      plot_type,
                      normalized_view,
                      transition_focus_mode) {

        // select the data of the participant specified
        const dataVis = data.filter(d => d.p_name === pName);

        // parameter for the canvas of Alpscarf
        //const maxSeqLength = d3.max(dataVis, d => d.seq_bar_length);
        //const maxReReadingLength = d3.max(dataVis, d => d.re_reading_bar_length);
        const maxSeqLength = d3.max(data, d => d.seq_bar_length);
        const maxReReadingLength = d3.max(data, d => d.re_reading_bar_length);

        const yValue = d =>
          plot_type == "alpscarf"
            ? d.seq_bar_length + d.re_reading_bar_length
            : plot_type == "mountain only"
            ? d.seq_bar_length
            : plot_type == "valley only"
            ? d.re_reading_bar_length + 1
            : 1;

        const yPosition = d => d.seq_bar_length + maxReReadingLength;
        const scarfBarYPosition = d =>
          plot_type == "alpscarf" || plot_type == "mountain only"
            ? yScale(yPosition(d))
            : yScale(maxReReadingLength + 1);
        const scarfBarHeight = d =>
          plot_type == "alpscarf" ||
          plot_type == "mountain only" ||
          plot_type == "valley only"
            ? alpVizHeight - yScale(yValue(d))
            : alpVizHeight - yScale(1);

        const yScale = d3
          .scaleLinear()
          .domain([0, maxSeqLength + maxReReadingLength])
          .range([alpVizHeight, 0]);

        const xValue = d =>
          transition_focus_mode
            ? d.trial + 1
            : d.bar_position + d.dwell_duration_log / 2;
        const xValueMax = normalized_view
          ? d3.max(dataVis, xValue)
          : d3.max(data, xValue);
        const xScale = d3
          .scaleLinear()
          .domain([0, xValueMax])
          .range([0, alpVizWidth]);

        const groups = selection.selectAll("g").data(dataVis);
        const groupEnter = groups
          .enter()
          .append("g")
          .attr("class", "plot-tick"); // make a function for enter so that circles can re-use
        groupEnter
          .attr("transform", `translate(${pNameOffset}, 0)`)
          .merge(groups)
          //.on('click', d => setSelectedAOI(d.AOI))
          .transition()
          .duration(1000)
          .attr("transform", `translate(${pNameOffset}, 0)`);
        groups
          .exit()
          .transition()
          .duration(1000)
          .remove();

        // TODO: transition is working; figure out how to avoid creating a new variable groupsRect
        //const groupsRect = groups.select('.bars');
        const groupsRect = selection.selectAll("rect").data(dataVis);
        groupsRect
          .exit()
          .transition()
          .duration(1000)
          .attr("x", alpVizWidth)
          .remove();

        groupEnter
          .append("rect")
          .attr("class", "bars")
          // play with animation; from scarf to Alpscarf
          .attr("y", scarfBarYPosition)
          //.attr('y', d =>
          //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
          //        ? yScale(yPosition(d))
          //        : yScale(maxReReadingLength + 1)
          //    )
          .attr("height", scarfBarHeight)
          //.attr('height', d =>
          //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
          //        ? alpVizHeight - yScale(yValue(d))
          //        : alpVizHeight - yScale(1)
          //    )
          //.attr('x', d => xScale(xValue(d)))
          .attr("x", alpVizWidth)
          //.attr('width', xScale.bandwidth())
          .attr("width", d =>
            transition_focus_mode ? xScale(1) : xScale(xWidth(d))
          )
          .attr("stroke-width", "2")
          .merge(groups.select(".bars"))
          .on("click", d => setSelectedAOI(d.AOI))
          .classed(
            "highlighted",
            d =>
              //selectedAOI && selectedAOI === d.AOI
              selectedAOI.length > 0 && selectedAOI.includes(d.AOI)
          )
          .attr("opacity", d =>
            //(!selectedAOI || d.AOI === selectedAOI)
            selectedAOI.length === 0 || selectedAOI.includes(d.AOI) ? 1 : 0.2
          )
          .transition()
          .duration(1000)
          // play with animation; from scarf to Alpscarf
          .attr("y", scarfBarYPosition)
          //.attr('y', d =>
          //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
          //        ? yScale(yPosition(d))
          //        : yScale(maxReReadingLength + 1)
          //    )
          .attr("height", scarfBarHeight)
          //.attr('height', d =>
          //    (selectedAOI.length > 0  && selectedAOI.includes(d.AOI))
          //        ? alpVizHeight - yScale(yValue(d))
          //        : alpVizHeight - yScale(1)
          //    )
          //.attr('width', xScale.bandwidth())
          //.attr('x', d => xScale(xValue(d)))
          .attr("width", d =>
            transition_focus_mode ? xScale(1) : xScale(xWidth(d))
          )
          .attr("x", d =>
            transition_focus_mode
              ? xScale(xValue(d) - 1)
              : xScale(xValue(d) - xWidth(d))
          )
          .attr("fill", d => palette(d.AOI));

        groupEnter
          .append("title")
          .merge(groups.select("title"))
          .text(d => d.AOI + ": " + d.dwell_duration + " ms");

        // print p_name
        const groupText = selection.selectAll("text").data([null]);
        groupText
          .enter()
          .append("text")
          .attr("dy", ".35em")
          .text(pName)
          .attr("x", 10)
          .attr("y", alpVizHeight / 2)
          .style("fill-opacity", 1e-6)
          .merge(groupText)
          .transition()
          .duration(1000)
          .attr("x", 0)
          .style("fill-opacity", 1)
          .attr("class", "user-text");

        // todo: fade-out of text (p_name) doesn't work
        groupText
          .exit()
          .transition()
          .duration(1000)
          .attr("x", -10)
          .style("fill-opacity", 1e-6)
          .remove();
      }
    },
    info() {
      window.alert("The Alpscarf is an extension of scarf plots on several topics. Scarf plots are used to show the transition of the view of a user between multiple AOI’s which is done by defining the AOI’s and giving each of them a unique color. Then, for each user, a horizontal line is drawn which consists of intervals of color which correspond with the AOI that the user is looking at in that time. An Alpscarf is an extension of scarf plots on the color palette, the visual components and the modes of the scarf width. In this version of the Alpscarf, the user can choose the visualization type (alpscarf, traditional scarf plot, mountain only or valley only), the visualization view (normalized or not), and the focus mode (transition-focused or duration-focused). The Alpscarf makes use of three visual components: mountains, valleys and creeks. The mountain height indicates AOI visits confirming to an expected order. The valley depth indicates occurrences of revisiting. Short mountains and shallow valleys are visually distinguishable by creeks, which are gaps. These components can be made clearer by zooming in. By selecting an AOI or a part of the plot that indicates an AOI, this AOI is highlighted in the rest of the plot.");
    }
  }
};
</script>

<style>
g.x-axis-hidden {
    display: none;
}

g.y-axis-hidden {
    display: none;
}

.bars:hover {
    stroke-width: 2px;
    stroke: #FFFFFF;
}

.plot-tick {
    cursor: pointer;
}

.highlighted {
    stroke: #FFFFFF;
    stroke-width: 0px;
}

.alp-plot {
  width: 100%;
  height: 100%;
}

.user-text {
  fill: #666666;
  font-family: 'Product Sans Regular';
  font-weight: 400;
}

.AOI-text {
  fill: #666666;
  font-family: 'Product Sans Bold';
  font-weight: 400;
  font-size: 20px;
}
</style>