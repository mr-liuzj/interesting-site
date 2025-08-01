<script setup lang="ts">
import { computed } from 'vue';
import TopLayout from './TopLayout.vue';

defineOptions({
  name: 'Layout',
});

const renderComponent = computed(() => {
  return TopLayout;
});
</script>

<template>
  <div class="layout-container">
    <component :is="renderComponent" />
  </div>
</template>
