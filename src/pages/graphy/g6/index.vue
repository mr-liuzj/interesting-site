<template>
  <div class="graphy-g6-page">
    <transition name="fade">
      <Toolbar v-if="state.isReady" />
    </transition>
    <div ref="container" class="graphy-g6-container"></div>
    <ModifyNodeDialog ref="modifyNodeDialog" @confirm="handleDialogConfirm" />
  </div>
</template>

<script setup lang="ts">
import { provide, reactive, shallowRef } from 'vue';
import { useGraph, CUSTOM_EVENTS } from './graph';
import Toolbar from './components/Toolbar.vue';
import ModifyNodeDialog from './components/ModifyDialog.vue';
import { RootDataItem } from './graph/RootData';
import { uniqueId } from 'lodash';
// import { GraphEvent } from '@antv/g6';

defineOptions({
  name: 'GraphyG6',
});

const modifyNodeDialog = shallowRef<InstanceType<typeof ModifyNodeDialog>>();
const container = shallowRef<HTMLElement>();
const { graphInstance, getRootDataItem, createNodeData } = useGraph(container, {
  onGraphReady() {
    state.isReady = true;

    bindGraphEvents();
  },
});

const state = reactive({
  isReady: false,
});

/** 提供 graphInstance 实例 */
provide('graphInstance', graphInstance);

function bindGraphEvents() {
  graphInstance.value?.on(
    CUSTOM_EVENTS.MODIFY_NODE,
    // @ts-ignore
    (data: RootDataItem) => {
      modifyNodeDialog.value?.open({
        isEdit: true,
        data,
      });
    },
  );

  // @ts-ignore
  graphInstance.value?.on(CUSTOM_EVENTS.ADD_NODE, (data: RootDataItem) => {
    modifyNodeDialog.value?.open({
      isEdit: false,
      data,
    });
  });
}

async function handleDialogConfirm(options: {
  id: string;
  title: string;
  description: string;
  isEdit: boolean;
}) {
  const graph = graphInstance.value!;

  if (options.isEdit) {
    const item = getRootDataItem(options.id);
    const nodeData = graph.getNodeData(options.id);

    if (item) {
      Object.assign(item, {
        title: options.title,
        description: options.description,
      });
      graph.updateNodeData([
        Object.assign({}, nodeData, {
          data: item,
        }),
      ]);

      await graph.draw();
    }
  } else {
    const parent = getRootDataItem(options.id);
    const newItemId = `node-${uniqueId()}`;
    const newItem: RootDataItem = {
      id: newItemId,
      title: options.title,
      description: options.description,
      pid: options.id,
      children: [],
    };

    if (parent) {
      Object.assign(parent, {
        children: [...(parent.children ?? []), newItem],
      });

      graph.addData({
        nodes: [createNodeData(newItem)],
        edges: [{ source: options.id, target: newItemId }],
      });

      await graph.render();
    }
  }
}
</script>

<style scoped lang="less">
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

    ::v-deep(#g-canvas-camera) {
      div.key {
        will-change: unset !important;
      }
    }
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
