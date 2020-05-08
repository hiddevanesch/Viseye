<template>
  <div>
    <p>kak</p>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState([
      'files'
    ])
  }
}
</script>