<template>
  <div class="graphy-g6-page">
    <transition name="fade">
      <Toolbar v-if="state.isReady" />
    </transition>
    <div ref="container" class="graphy-g6-container"></div>
  </div>
</template>

<script setup lang="ts">
import { provide, reactive, shallowRef } from 'vue';
import { useGraph } from './graph';
import Toolbar from './components/Toolbar.vue';

defineOptions({
  name: 'GraphyG6',
});

const container = shallowRef<HTMLElement>();
const { graphInstance } = useGraph(container, {
  onGraphReady() {
    state.isReady = true;
  },
});

const state = reactive({
  isReady: false,
});

/** 提供 graphInstance 实例 */
provide('graphInstance', graphInstance);
</script>

<style scoped>
.graphy-g6-page {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  user-select: none;

  .graphy-g6-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
