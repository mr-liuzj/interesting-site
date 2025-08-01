<!-- components/SvgIcon.vue -->
<template>
  <svg
    :style="{ width: size, height: size, color }"
    aria-hidden="true"
    class="svg-icon"
  >
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: string;
    color?: string;
  }>(),
  {
    size: '1em',
    color: 'currentColor',
  },
);

const symbolId = computed(() => `#icon-${props.name}`);
</script>

<style lang="less" scoped>
.svg-icon {
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: initial;
}
</style>
