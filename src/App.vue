<template>
    <router-view />
</template>

<script>
export default {
  data() {
    return {
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
