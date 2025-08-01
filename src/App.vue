<script setup lang="ts">
import Layout from '@/layout/index.vue';

defineOptions({
  name: 'App',
});
</script>

<template>
  <div class="app-container">
    <Layout />
  </div>
</template>

<style scoped lang="less">
.app-container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
}
</style>
