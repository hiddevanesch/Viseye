<template>
  <div class="backdrop">
    <div class="container">
      <div class="landingbox bg-white">
        <h1 class="bmar-med tx-dgray">Viseye.</h1>
        <upload-tool class="bmar-small" />
        <p class="ps tx-gray">Background image is randomly chosen from Unsplash on load.
          <br>Website is optimized for use with Google Chrome.</p>
        <div class="footer bg-ldgray tmar-med">
          <p class="pps tx-gray">&copy; 2IOA0 GROUP 25BD 2020</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UploadTool from "../components/UploadTool.vue";

export default {
  components: {
    UploadTool
  }
}
</script>

<style>
  * {
    margin: 0px;
    padding: 0px;
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

  .backdrop {
    background-color: #000000;
    background-image: url('https://source.unsplash.com/random/3840x2160');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: scroll;
  }

  .container {
    height: calc(100vh);
    padding-left: calc(20vw);
    padding-right: calc(20vw);
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .landingbox {
    padding-left: 100px;
    padding-right: 100px;
    padding-top: 80px;
    padding-bottom: 80px;
    -webkit-box-shadow: 0px 0px 50px 0px rgba(0,0,0,0.25);
    -moz-box-shadow: 0px 0px 50px 0px rgba(0,0,0,0.25);
    box-shadow: 0px 0px 50px 0px rgba(0,0,0,0.25);
    margin: auto;
  }

  .footer {
    margin-left: -100px;
    margin-right: -100px;
    margin-bottom: -80px;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .landingbox h1 {
    font-size: 50px;
    font-family: 'Product Sans Black';
    font-weight: 400;
  }

  .button {
    padding: 10px;
    color: #ffffff;
    background-color: #498fff;
    border: 0px;
    font-size: 18px;
    font-family: 'Product Sans Bold';
    font-weight: 400;
    border-radius: 3px;
    text-transform: uppercase;
    display: inline-block;
  }

  .button:hover {
    background-color: #3978dd;
  }

  .button:active {
    background-color: #2b67c7;
  }

  .uploadbutton {
      display: none;
  }

  .p {
    font-family: 'Product Sans Light';
    font-weight: 400;
    font-size: 24px;
  }

  .ps {
    font-family: 'Product Sans Light';
    font-weight: 400;
    font-size: 18px;
  }

  .pps {
    font-family: 'Product Sans Bold';
    font-weight: 400;
    font-size: 12px;
    text-align: center;
  }
</style>
