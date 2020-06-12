<template>
  <div class="visualization-container">
    <header class="topbar bg-white center">
      <div class="topcol col15">
        <div>
          <router-link to="/"><h1 class="topbar-title tx-dgray">Viseye.</h1></router-link>
        </div>
      </div>
      <div class="topcol col85 center">
        <h1 class="plot-title tmar-mini bmar-mini" v-if="activeVis === 'scatter_plot'">Scatter plot: Eye tracking data per city</h1>
        <h1 class="plot-title tmar-mini bmar-mini" v-if="activeVis === 'gaze_stripes'">Gaze stripes: Eye tracking data per city</h1>
        <h1 class="plot-title tmar-mini bmar-mini" v-if="activeVis === 'attention_map'">Attention Map: Eye tracking data per city</h1>
        <h1 class="plot-title tmar-mini bmar-mini" v-if="activeVis === 'alp_scarf'">Alp Scarf: Eye tracking data per city (BETA)</h1>
      </div>
    </header>
    <div class="visrow">
      <div class="menubar viscol col15 bg-ldgray">
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('scatter_plot')">scatter plot</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('gaze_stripes')">gaze stripes</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('attention_map')">attention map</button>
        <button type="button" class="button button-blue bmar-small full-width" @click="setActiveVis('alp_scarf')">alp scarf (beta)</button>
        <select class="selectMenu bmar-small full-width" id="selectMenu"></select>
          <div class="bottom-align vw15 left-zero">
            <button type="button" class="button button-green bmar-small full-width" @click="downloadScreenshot">screenshot</button>
          </div>
      </div>
      <div class="visualizationbox viscol col85 order2 bg-dgray">
        <scatter-plot v-if="activeVis === 'scatter_plot'" />
        <gaze-stripes-plot v-if="activeVis === 'gaze_stripes'" />
        <attention-map v-if="activeVis === 'attention_map'" />
        <alp-scarf v-if="activeVis === 'alp_scarf'" />
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
      activeVis: 'attention_map'
    }
  },
  mounted: function() {
    this.setOptions();
  },
  methods: {
    downloadScreenshot() {
      const vm = this;
      screenshot();

      function triggerDownload (imgURI, fileName) {
        //internal click event to activate the download
        var evt = new MouseEvent("click", {
          view: window,
          bubbles: false,
          cancelable: true
        });
        //the html element that will provide the download
        var a = document.createElement("a");
        //setting the attribute so the download can happen
        a.setAttribute("download", fileName);
        a.setAttribute("href", imgURI);
        a.setAttribute("target", '_blank');
        //trigger the download event
        a.dispatchEvent(evt);
      }
      
      async function screenshot() {
        var screenshotJpegBlob = await takeScreenshotJpegBlob()
  
        // show preview with max size 300 x 300 px
        var previewCanvas = await blobToCanvas(screenshotJpegBlob, 300, 300)
        previewCanvas.style.position = 'fixed'
        document.body.appendChild(previewCanvas)
  
        // send it to the server
        let formdata = new FormData()
        formdata.append("screenshot", screenshotJpegBlob)
        // await fetch('file:///C:/Users/20191704/Documents/GitHub/Viseye/index.html', {
        //     method: 'POST',
        //     body: formdata,
        //     'Content-Type' : "multipart/form-data",
        // })
      }
  
      function getDisplayMedia(options) {
          if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
              return navigator.mediaDevices.getDisplayMedia(options)
          }
          if (navigator.getDisplayMedia) {
              return navigator.getDisplayMedia(options)
          }
          if (navigator.webkitGetDisplayMedia) {
              return navigator.webkitGetDisplayMedia(options)
          }
          if (navigator.mozGetDisplayMedia) {
              return navigator.mozGetDisplayMedia(options)
          }
          throw new Error('getDisplayMedia is not defined')
      }
  
      function getUserMedia(options) {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              return navigator.mediaDevices.getUserMedia(options)
          }
          if (navigator.getUserMedia) {
              return navigator.getUserMedia(options)
          }
          if (navigator.webkitGetUserMedia) {
              return navigator.webkitGetUserMedia(options)
          }
          if (navigator.mozGetUserMedia) {
              return navigator.mozGetUserMedia(options)
          }
          throw new Error('getUserMedia is not defined')
      }
  
      async function takeScreenshotStream() {
          // see: https://developer.mozilla.org/en-US/docs/Web/API/Window/screen
          const width = screen.width * (window.devicePixelRatio || 1)
          const height = screen.height * (window.devicePixelRatio || 1)
  
          const errors = []
          let stream
          try {
              stream = await getDisplayMedia({
                  audio: false,
                  // see: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints/video
                  video: {
                      width,
                      height,
                      frameRate: 1,
                  },
              })
          } catch (ex) {
              errors.push(ex)
          }
  
          try {
              // for electron js
              stream = await getUserMedia({
                  audio: false,
                  video: {
                      mandatory: {
                          chromeMediaSource: 'desktop',
                          // chromeMediaSourceId: source.id,
                          minWidth         : width,
                          maxWidth         : width,
                          minHeight        : height,
                          maxHeight        : height,
                      },
                  },
              })
          } catch (ex) {
              errors.push(ex)
          }
  
          if (errors.length) {
              console.debug(...errors)
          }
  
          return stream
      }
  
      async function takeScreenshotCanvas() {
          const stream = await takeScreenshotStream()
  
          if (!stream) {
              return null
          }
  
          // from: https://stackoverflow.com/a/57665309/5221762
          const video = document.createElement('video')
          const result = await new Promise((resolve) => {
              video.onloadedmetadata = () => {
                  video.play()
                  video.pause()
  
                  // from: https://github.com/kasprownik/electron-screencapture/blob/master/index.js
                  const canvas = document.createElement('canvas')
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight
                  const context = canvas.getContext('2d')
                  // see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement
                  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
                  resolve(canvas)
              }
              video.srcObject = stream
          })
  
          stream.getTracks().forEach(function (track) {
              track.stop()
          })
  
          return result
      }
  
      // from: https://stackoverflow.com/a/46182044/5221762
      function getJpegBlob(canvas) {
          return new Promise((resolve) => {
              // docs: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
              canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.95)
          })
      }
  
      async function takeScreenshotJpegBlob() {
          const canvas = await takeScreenshotCanvas()
          if (!canvas) {
              return null
          }
          return getJpegBlob(canvas)
      }
  
      function blobToCanvas(blob, maxWidth, maxHeight) {
          return new Promise((resolve, reject) => {
              const img = new Image()
              img.onload = function () {
                  const canvas = document.createElement('canvas')
                  const scale = Math.min(
                      1,
                      maxWidth ? maxWidth / img.width : 1,
                      maxHeight ? maxHeight / img.height : 1,
                  )
                  canvas.width = img.width * scale
                  canvas.height = img.height * scale
                  const ctx = canvas.getContext('2d')
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
                  resolve(canvas)
              }
              img.onerror = () => {
                  reject(new Error('Error load blob to Image'))
              }
              img.src = URL.createObjectURL(blob)
              triggerDownload(URL.createObjectURL(blob), vm.activeVis + "_" + d3.select("#selectMenu").node().value.replace(".jpg", "") + ".png");
          })
      }
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

