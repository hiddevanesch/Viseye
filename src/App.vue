<template>
    <router-view />
</template>

<script>
export default {
  name: 'Viseye app',
  data() {
    return {
      prevHeight: 0
    };
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}
</style>
