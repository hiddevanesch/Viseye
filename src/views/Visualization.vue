<template>
  <div class="visualization-container">
    <header class="topbar bg-white">
      <router-link to="/"><h1 class="tx-dgray">Viseye.</h1></router-link>
    </header>
    <div class="visrow">
      <div class="menubar viscol col20 bg-ldgray">
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('scatterplot')">scatter plot</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('gazestripes')">gaze stripes</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('attentionmap')">attention map</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('alpscarf')">alp scarf (beta)</button>
        <select class="selectMenu bmar-small full-width" id="selectMenu"></select>
          <div class="bottom-align">
            <button type="button" class="button button-green bmar-small full-width" @click="downloadSVG(activeVis)">screenshot</button>
          </div>
      </div>
      <div class="visualizationbox viscol col80 order2 bg-dgray">
        <scatter-plot v-if="activeVis === 'scatterplot'" />
        <gaze-stripes-plot v-if="activeVis === 'gazestripes'" />
        <attention-map v-if="activeVis === 'attentionmap'" />
        <alp-scarf v-if="activeVis === 'alpscarf'" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import * as d3 from "d3";
import ScatterPlot from "../components/ScatterPlot.vue";
import GazeStripesPlot from "../components/GazeStripesPlot.vue";
import AttentionMap from "../components/AttentionMap.vue";
import AlpScarf from "../components/AlpScarf.vue";

export default {
  components: {
    ScatterPlot,
    GazeStripesPlot,
    AttentionMap,
    AlpScarf
  },
  computed: {
    ...mapState([
      'files'
    ])
  },
  data() {
    return {
      activeVis: 'attentionmap'
    }
  },
  mounted: function() {
    this.setOptions();
  },
  methods: {
    downloadSVG(activeVis) {
      function triggerDownload(imgURL) {
      //both the triggerDownload and the downloadSvg function are
      //from https://stackoverflow.com/questions/3975499/convert-svg-to-image-jpeg-png-etc-in-the-browser
      //from user worstenbrood
      //internal click event to activate the download
      var evt = new MouseEvent("click", {
        view: window,
        bubbles: false,
        cancelable: true
      });
      //the html element that will provide the download
      var a = document.createElement("a");
      //setting the attribute so the download can happen
      a.setAttribute("download", "screenshot.png");
      a.setAttribute("href", imgURL);
      a.setAttribute("target", '_blank');
      //trigger the download event
      a.dispatchEvent(evt);
      }
      
      //setting up the canvas
      let svg;
      if (activeVis === 'scatterplot') {
        svg = document.getElementById("scatterPlotSVG");
      } else if (activeVis === 'gazestripes') {
        svg = document.getElementById("canvas");
      } else if (activeVis === 'attentionmap') {
        svg = document.getElementById("svgAttention");
      }
      var canvas = document.createElement("canvas");
      var bbox = svg.getBBox();
      canvas.width = bbox.width;
      canvas.height = bbox.height;
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, bbox.width, bbox.height);
      //serialize the svg to data so that it can be made into a picture blob
      var data = (new XMLSerializer()).serializeToString(svg);
      var DOMURL = window.URL || window.webkitURL || window;
      var screenShot = new Image();
      var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
      var url = DOMURL.createObjectURL(svgBlob);
      screenShot.onload = function () {
        ctx.drawImage(screenShot, 0, 0);
        DOMURL.revokeObjectURL(url);
        if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob)
        {
            var blob = canvas.msToBlob();
            navigator.msSaveOrOpenBlob(blob, "screenshot.png");
        }
        else {
            var imgURL = canvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            triggerDownload(imgURL);
        }
        document.removeChild(canvas);
      };
      screenShot.src = url;
    },
    setOptions() {
      let data;
      let allVersions = [];

      //Create options inside the dropdown menu with the corresponding value for the displayed text
      function pushOptions() {
        const option = d3.select("#selectMenu").selectAll('option').data(allVersions);
        option.enter().append('option')
          .merge(option)
            .text(d => d)
            .attr("value", d => d);
      }
      
      data = this.files;
      data.forEach(d => {
        if (!allVersions.includes(d.StimuliName)) {
          allVersions.push(d.StimuliName);
        }
        pushOptions();
      });
    },
    setActiveVis(visType) {
      this.activeVis = visType;
    }
  }
}
</script>

