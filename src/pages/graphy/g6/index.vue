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
import { uniqueId, differenceBy, differenceWith } from 'lodash';
import { EdgeData, NodeData } from '@antv/g6';
import { ElMessageBox } from 'element-plus';

defineOptions({
  name: 'GraphyG6',
});

const modifyNodeDialog = shallowRef<InstanceType<typeof ModifyNodeDialog>>();
const container = shallowRef<HTMLElement>();
const { graphInstance, getRootDataItem, createNodeData, generateNodeAndEdge } =
  useGraph(container, {
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
  // @ts-ignore
  graphInstance.value?.on(CUSTOM_EVENTS.MODIFY_NODE, (data: RootDataItem) => {
    modifyNodeDialog.value?.open({
      isEdit: true,
      data,
    });
  });

  // @ts-ignore
  graphInstance.value?.on(CUSTOM_EVENTS.ADD_NODE, (data: RootDataItem) => {
    modifyNodeDialog.value?.open({
      isEdit: false,
      data,
    });
  });

  graphInstance.value?.on(
    CUSTOM_EVENTS.DELETE_NODE,
    // @ts-ignore
    async (data: RootDataItem) => {
      if (!data.pid) return;

      const parentNode = getRootDataItem(data.pid);

      if (!parentNode) return;

      await ElMessageBox.confirm('确定删除该节点以及节点下的所有吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      parentNode.children = parentNode.children?.filter(
        (item) => item.id !== data.id,
      );

      const { nodes: newNodes, edges: newEdges } = generateNodeAndEdge();
      const { nodes: oldNodes, edges: oldEdges } =
        graphInstance.value?.getData()!;

      const { diffNodes, diffEdges } = getDiffData({
        oldNodes,
        newNodes,
        oldEdges,
        newEdges,
      });

      graphInstance.value?.removeData({
        nodes: diffNodes.map((item) => item.id!),
        edges: diffEdges.map((item) => item.id!),
      });
      graphInstance.value?.render();
    },
  );

  // @ts-ignore
  graphInstance.value?.on(CUSTOM_EVENTS.EXPAND_NODE, (data: RootDataItem) => {
    const id = data.id;
    const dataNode = getRootDataItem(id);
    const currentNode = graphInstance.value?.getNodeData(id);

    if (!dataNode) return;

    dataNode.hideChildren = false;
    const { nodes: newNodes, edges: newEdges } = generateNodeAndEdge();
    const { nodes: oldNodes, edges: oldEdges } =
      graphInstance.value?.getData()!;

    const { diffNodes, diffEdges } = getDiffData({
      oldNodes: newNodes,
      newNodes: oldNodes,
      oldEdges: newEdges,
      newEdges: oldEdges,
    });

    graphInstance.value?.updateNodeData([
      Object.assign({}, currentNode, {
        data: dataNode,
      }),
    ]);
    graphInstance.value?.addData({
      nodes: diffNodes,
      edges: diffEdges,
    });
    graphInstance.value?.render();
  });

  // @ts-ignore
  graphInstance.value?.on(CUSTOM_EVENTS.COLLAPSE_NODE, (data: RootDataItem) => {
    const id = data.id;
    const dataNode = getRootDataItem(id);
    const currentNode = graphInstance.value?.getNodeData(id);

    if (!dataNode) return;

    dataNode.hideChildren = true;
    const { nodes: newNodes, edges: newEdges } = generateNodeAndEdge();
    const { nodes: oldNodes, edges: oldEdges } =
      graphInstance.value?.getData()!;
    const { diffNodes, diffEdges } = getDiffData({
      oldNodes,
      newNodes,
      oldEdges,
      newEdges,
    });

    graphInstance.value?.updateNodeData([
      Object.assign({}, currentNode, {
        data: dataNode,
      }),
    ]);
    graphInstance.value?.removeData({
      nodes: diffNodes.map((item) => item.id!),
      edges: diffEdges.map((item) => item.id!),
    });
    graphInstance.value?.render();
  });
}

function getDiffData(options: {
  oldNodes: NodeData[];
  newNodes: NodeData[];
  oldEdges: EdgeData[];
  newEdges: EdgeData[];
}) {
  const { oldNodes, newNodes, oldEdges, newEdges } = options;

  const diffNodes = differenceBy(oldNodes, newNodes, 'id');
  const diffEdges = differenceWith(
    oldEdges,
    newEdges,
    (a: EdgeData, b: EdgeData) => {
      return a.source === b.source && a.target === b.target;
    },
  );

  return { diffNodes, diffEdges };
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
