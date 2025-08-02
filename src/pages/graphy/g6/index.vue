<template>
  <div class="graphy-g6-page">
    <Toolbar />
    <div ref="container" class="graphy-g6-container"></div>
  </div>
</template>

<script setup lang="ts">
import { provide, shallowRef } from 'vue';
import { useGraph } from './graph';
import Toolbar from './components/Toolbar.vue';

defineOptions({
  name: 'GraphyG6',
});

const container = shallowRef<HTMLElement>();
const { graphInstance } = useGraph(container);

provide('graphInstance', graphInstance);
</script>

<style scoped>
.graphy-g6-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  .graphy-g6-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
