import { EdgeData, Graph, NodeData, Placement, Size } from '@antv/g6';
import {
  onMounted,
  Ref,
  shallowRef,
  getCurrentInstance,
  ref,
  watch,
  onBeforeUnmount,
} from 'vue';
import './nodes';
import { edgeConfig } from './edges';
import { RootData, RootDataItem } from './RootData';
import { cloneDeep } from 'lodash';

export interface useGraphOptions {
  onGraphReady?: (graph: Graph) => void;
}

/** 默认缩放比例 */
export const DEFAULT_ZOOM = 1;
/** 最小缩放比例 */
export const MIN_ZOOM = 0.2;
/** 最大缩放比例 */
export const MAX_ZOOM = 3;
/** 默认动画时间 */
export const DEFAULT_ANIMATION_DURATION = 300;
/** 默认节点大小 */
export const DEFAULT_NODE_SIZE: Size = [240, 120];

const DEFAULT_NODE_STYLE = {
  ports: [
    { placement: 'top' as Placement },
    { placement: 'bottom' as Placement },
  ],
  // isSelected: false,
  size: DEFAULT_NODE_SIZE,
};

export function useGraph(
  container: Ref<HTMLElement | undefined>,
  options?: useGraphOptions,
) {
  const graphInstance = shallowRef<Graph>();
  const vueInstance = getCurrentInstance();
  const rootData = ref(cloneDeep(RootData));
  const rootDataMap = new Map<string, RootDataItem>();

  setRootDataMap(rootData.value);

  function setRootDataMap(data: RootDataItem[]) {
    data.forEach((item) => {
      rootDataMap.set(item.id, item);

      if (item.children && item.children.length > 0) {
        setRootDataMap(item.children);
      }
    });
  }

  function createNodeData(item: RootDataItem): NodeData {
    return {
      id: item.id,
      type: 'vue-node',
      style: {
        ...DEFAULT_NODE_STYLE,
        appContext: vueInstance?.root?.appContext,
      },
      data: item as Record<string, any>,
    };
  }

  /** 生成节点数据 */
  function generateNodeAndEdge() {
    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    function loopAppendNode(data: RootDataItem[]) {
      data.forEach((item) => {
        const node: NodeData = createNodeData(item);

        nodes.push(node);

        if (item.pid) {
          edges.push({
            source: item.pid,
            target: item.id,
          });
        }

        if (!item.hideChildren && item.children && item.children.length > 0) {
          loopAppendNode(item.children);
        }
      });
    }

    loopAppendNode(rootData.value);

    return {
      nodes,
      edges,
    };
  }

  function getRootDataItem(id: string) {
    return rootDataMap.get(id);
  }

  onMounted(() => {
    if (!container.value) {
      console.error('container is not found');
      return;
    }

    const { nodes, edges } = generateNodeAndEdge();

    const graph = new Graph({
      container: container.value,
      autoFit: {
        type: 'center',
      },
      animation: {
        duration: 300,
        delay: 0,
        direction: 'normal' as PlaybackDirection,
      },
      autoResize: true,
      zoom: DEFAULT_ZOOM,
      zoomRange: [MIN_ZOOM, MAX_ZOOM],
      behaviors: [
        {
          type: 'zoom-canvas',
          key: 'zoom-canvas', // 为交互指定标识符，方便动态更新
          sensitivity: 0.2,
        },
        'drag-canvas',
        {
          type: 'click-select',
          enable: (e: { targetType: string }) => {
            if (e.targetType === 'edge') return false;
            return true;
          },
          degree: 0,
          state: 'selected', // 选中的状态
          multiple: false,
        },
      ],
      edge: edgeConfig,
      layout: {
        type: 'antv-dagre',
        rankdir: 'TB',
        nodesep: 50,
        ranksep: 80,
        controlPoints: true,
        nodeSize: DEFAULT_NODE_SIZE,
      },
      data: {
        nodes,
        edges,
      },
    });

    graph.render().then(() => {
      options?.onGraphReady?.(graph!);
    });

    graphInstance.value = graph;

    window.__graph = graph;
  });

  onBeforeUnmount(() => {
    graphInstance.value?.off();
    graphInstance.value?.destroy();
    window.__graph = undefined;
  });

  watch(
    () => rootData.value,
    (newVal) => {
      setRootDataMap(newVal);
    },
    {
      deep: true,
    },
  );

  return {
    graphInstance,
    rootData,
    getRootDataItem,
    createNodeData,
    generateNodeAndEdge,
  };
}

export function getGraphInstance() {
  return window.__graph;
}

export * from './event';
