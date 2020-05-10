<template>
  <div class="visualization-container">
    <header class="topbar bg-white">
      <router-link to="/"><h1 class="tx-dgray">Viseye.</h1></router-link>
    </header>
    <div class="visrow">
      <div class="menubar viscol col20 bg-ldgray">
        <button type="button" class="button button-blue bmar-small full-width">scatter&shy;plot</button>
        <button type="button" class="button button-blue bmar-small full-width">visualization 2</button>
        <button type="button" class="button button-blue bmar-small full-width">visualization 3</button>
        <button type="button" class="button button-blue bmar-small full-width">visualization 4</button>
      </div>
      <div class="visualizationbox viscol col80 order2 bg-dgray">
        <scatter-plot />
      </div>
    </div>
  </div>
</template>

<script>
import ScatterPlot from "../components/ScatterPlot.vue"

export default {
  components: {
    ScatterPlot
  }  
}
</script>

