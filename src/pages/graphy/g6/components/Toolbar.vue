<template>
  <div class="graphy-g6-toolbar">
    <el-tooltip content="缩小" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item" @click="handleZoomTo(zoom - 0.1)">
        <el-icon :size="18"><ZoomOut /></el-icon>
      </div>
    </el-tooltip>
    <div class="graphy-g6-toolbar-slider">
      <el-slider
        :model-value="zoom"
        :min="MIN_ZOOM"
        :max="MAX_ZOOM"
        :step="0.1"
        :show-tooltip="false"
        label="21"
        size="small"
        @update:model-value="handleZoomTo($event as number)"
      />
      <span class="graphy-g6-toolbar-slider-value">
        {{ formatZoomPercent(zoom) }}
      </span>
    </div>

    <el-tooltip content="放大" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item" @click="handleZoomTo(zoom + 0.1)">
        <el-icon :size="18"><ZoomIn /></el-icon>
      </div>
    </el-tooltip>
    <el-tooltip content="移动到画布中心" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item" @click="handleCenter">
        <el-icon :size="18"><Aim /></el-icon>
      </div>
    </el-tooltip>
    <el-tooltip content="添加" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item">
        <el-icon :size="18"><Plus /></el-icon>
      </div>
    </el-tooltip>
    <el-tooltip content="编辑" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item">
        <el-icon :size="18"><Edit /></el-icon>
      </div>
    </el-tooltip>
    <el-tooltip content="清空画布" placement="bottom" :show-after="300">
      <div class="graphy-g6-toolbar-item">
        <el-icon :size="18"><Refresh /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import {
  Aim,
  Edit,
  Plus,
  Refresh,
  ZoomIn,
  ZoomOut,
} from '@element-plus/icons-vue';
import { computed, inject, nextTick, Ref, ref } from 'vue';
import {
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ANIMATION_DURATION,
} from '../graph';
import { Graph, CanvasEvent } from '@antv/g6';
import { throttle } from 'lodash';

defineOptions({
  name: 'GraphyG6Toolbar',
});

/** 获取 graphInstance 实例 父级graph实例存在后才会渲染 */
const graphInstance = inject<Ref<Graph>>('graphInstance')!;

const zoom = ref(DEFAULT_ZOOM);

const graph = computed(() => graphInstance?.value);

function formatZoomPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

/** 缩放 */
function handleZoomTo(zoomValue: number) {
  let newZoom = zoomValue;

  if (newZoom < MIN_ZOOM) {
    newZoom = MIN_ZOOM;
  } else if (newZoom > MAX_ZOOM) {
    newZoom = MAX_ZOOM;
  }

  newZoom = Number(newZoom.toFixed(1));

  zoom.value = newZoom;

  graphInstance.value?.zoomTo(newZoom, {
    duration: DEFAULT_ANIMATION_DURATION,
  });
}

async function handleCenter() {
  await graphInstance.value.fitCenter({
    duration: DEFAULT_ANIMATION_DURATION,
  });

  await graphInstance.value.zoomTo(DEFAULT_ZOOM, {
    duration: DEFAULT_ANIMATION_DURATION,
  });

  zoom.value = DEFAULT_ZOOM;
}

graphInstance.value?.on(
  CanvasEvent.WHEEL,
  throttle(
    () => {
      nextTick(() => {
        const currentZoom = graphInstance.value?.getZoom();
        zoom.value = Number(currentZoom.toFixed(1));
      });
    },
    30,
    {
      trailing: true,
    },
  ),
);
</script>

<style scoped lang="less">
.graphy-g6-toolbar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 100;
  display: flex;
  gap: 12px;
  align-items: center;

  .graphy-g6-toolbar-item {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-radius: 4px;
    cursor: pointer;
    box-shadow: 2px 2px 10px 3px rgba(0, 0, 0, 0.12);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.1);
    }
  }

  .graphy-g6-toolbar-slider {
    height: 40px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 2px 2px 10px 3px rgba(0, 0, 0, 0.12);
    position: relative;

    .el-slider {
      width: 120px;
      ::v-deep(.el-slider__runway),
      ::v-deep(.el-slider__bar) {
        height: 4px;
      }

      ::v-deep(.el-slider__button) {
        width: 12px;
        height: 12px;
      }
    }

    span {
      width: 40px;
    }
  }
}
</style>
