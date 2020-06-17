<template>
  <div class="backdrop">
    <div class="container">
      <div class="landingbox bg-white">
        <router-link to="/"><h1 class="logo-text bmar-med tx-dgray">Viseye.</h1></router-link>
        <upload-tool class="bmar-small" />
        <p class="ps tx-gray">Background image is randomly chosen from Unsplash on load.
          <br>Website is optimized for use with a Chromium-based browser on a desktop.</p>
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
