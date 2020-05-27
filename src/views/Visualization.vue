<template>
  <div class="visualization-container">
    <header class="topbar bg-white">
      <router-link to="/"><h1 class="tx-dgray">Viseye.</h1></router-link>
    </header>
    <div class="visrow">
      <div class="menubar viscol col20 bg-ldgray">
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('scatterplot')">scatter plot</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('gazestripes')">gaze stripes</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('vis3')">visualization 3</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('vis4')">visualization 4</button>
        <select class="selectMenu bmar-small full-width" id="selectMenu"></select>
          <div class="bottom-align">
            <button type="button" class="button button-green bmar-small full-width" @click="downloadSVG(activeVis)">screenshot</button>
          </div>
      </div>
      <div class="visualizationbox viscol col80 order2 bg-dgray">
        <scatter-plot v-if="activeVis === 'scatterplot'" />
        <gaze-stripes-plot v-if="activeVis === 'gazestripes'" />
      </div>
    </div>
  </div>
</template>

<script>
import ScatterPlot from "../components/ScatterPlot.vue"
import GazeStripesPlot from "../components/GazeStripesPlot.vue"

export default {
  components: {
    ScatterPlot,
    GazeStripesPlot
  },
  data() {
    return {
      activeVis: 'scatterplot'
    }
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
    setActiveVis(visType) {
      this.activeVis = visType;
    }
  }
}
</script>

