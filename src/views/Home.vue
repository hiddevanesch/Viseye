<template>
  <div class="backdrop">
    <div class="container">
      <div class="landingbox bg-white">
        <router-link to="/"><h1 class="logo-text bmar-med tx-dgray">Viseye.</h1></router-link>
        <home-page class="bmar-small"/>
        <p class="ps tx-gray">Background image is randomly chosen from Unsplash on load.
          <br>Website is optimized for use with Google Chrome on a 1080p display.</p>
        <div class="footer bg-ldgray tmar-med">
          <p class="pps tx-gray">&copy; 2IOA0 GROUP 25BD 2020</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HomePage from "../components/HomePage.vue";

export default {
  components: {
    HomePage
  }
}
</script>
