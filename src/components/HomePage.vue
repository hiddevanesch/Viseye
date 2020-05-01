<template>
  <div>
    <p class="p bmar-small tx-dgray">Welcome to Viseye, a tool that visualizes eye movement data. The tool has been created for a DBL project by TU/e students.</p>
    <p class="p bmar-small tx-dgray">To start the visualization with your own data, please head to the upload page by pressing the button below.</p>
    <button type="button" class="button" name="toUpload" id="toUploadButton" value="toUpload" @click="enableUploadMode">upload my data</button>
  </div>
</template>

<script>
export default {
  methods: {
    enableUploadMode() {
      this.$emit('enable-upload-mode')
    }
  }
}
</script>