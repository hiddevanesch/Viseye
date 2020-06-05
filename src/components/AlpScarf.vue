<template>
  <div>
    <alp-select v-if="state === 'alpselect'" @to-alp-plot="toAlpPlot"/>
    <alp-plot v-if="state === 'alpplot'" />
  </div>
</template>

<script>
import AlpSelect from '../components/AlpSelect.vue'
import AlpPlot from '../components/AlpPlot.vue'

export default {
  components: {
    AlpSelect,
    AlpPlot
  },
  data() {
    return {
      state: ''
    }
  },
  mounted: function() {
    this.onLoad();
  },
  methods: {
    onLoad() {
      this.state = 'alpselect';
    },
    toAlpPlot() {
      this.state = 'alpplot';
    }
  }
}
</script>