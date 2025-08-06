<template>
  <div>
    <h1>X6 拓扑图编辑器【待开发】</h1>
    <div ref="container" class="graphy-x6-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const container = ref<HTMLDivElement>();
</script>
