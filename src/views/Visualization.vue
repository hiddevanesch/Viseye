<template>
  <div class="visualization-container">
    <header class="topbar">
      <h1 class="tx-dgray bg-white">Viseye.</h1>
    </header>
    <div class="visrow">
      <div class="menubar viscol col20 bg-ldgray">
        <p>placeholder</p>
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

<style>
* {
    margin: 0px;
    padding: 0px;
    overflow: hidden;
    box-sizing: border-box;
  }

  div {
    display: block;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  img {
    vertical-align: middle;
    border-style: none;
  }

  .bg-white {
    background-color: #ffffff;
  }

  .bg-lgray {
    background-color: #f1f1f1;
  }

  .bg-ldgray {
    background-color: #1a1a1a;
  }

  .bg-dgray {
    background-color: #111111;
  }

  .tx-white {
    color: #ffffff;
  }

  .tx-black {
    color: #000000;
  }

  .tx-lgray {
    color: #f1f1f1;
  }

  .tx-gray {
    color: #adadad;
  }

  .tx-viseyeblue {
    color: #498fff;
  }

  .tx-ldgray {
    color: #1a1a1a;
  }

  .tx-dgray {
    color: #111111;
  }

  .tmar-small {
    margin-top: 20px;
  }

  .tmar-med {
    margin-top: 40px;
  }

  .tmar-big {
    margin-top: 60px;
  }

  .bmar-small {
    margin-bottom: 20px;
  }

  .bmar-med {
    margin-bottom: 40px;
  }

  .bmar-big {
    margin-bottom: 60px;
  }

.center {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
}

.visualization-container {
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
}

.visrow {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-right: -15px;
    margin-left: -15px;
}

.viscol {
  position: relative;
  width: 100%;
  min-height: 1px;
  height: 100vh;
  padding-right: 15px;
  padding-left: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.col20 {
    flex: 0 0 20%;
    max-width: 20%;
}

.col80 {
    flex: 0 0 80%;
    max-width: 80%;
}

.order2 {
    -webkit-box-ordinal-group: 3;
    -ms-flex-order: 2;
    order: 2;
}

.topbar {
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 30px;
  padding-right: 30px;
}

.topbar h1 {
    font-size: 50px;
    font-family: 'Product Sans Black';
    font-weight: 400;
  }
</style>