import { Graph } from '@antv/g6';
import { onMounted, Ref, shallowRef, h, getCurrentInstance } from 'vue';
import { edgeConfig } from './edges';
import { registerVueNode } from './nodes';

export interface useGraphOptions {
  onGraphReady?: (graph: Graph) => void;
}

/** 默认缩放比例 */
export const DEFAULT_ZOOM = 1;
/** 最小缩放比例 */
export const MIN_ZOOM = 0.5;
/** 最大缩放比例 */
export const MAX_ZOOM = 4;
/** 默认动画时间 */
export const DEFAULT_ANIMATION_DURATION = 300;

const DEFAULT_NODE_STYLE = {
  ports: [{ placement: 'top' }, { placement: 'bottom' }],
  size: [240, 100],
};

export function useGraph(
  container: Ref<HTMLElement | undefined>,
  options?: useGraphOptions,
) {
  const graphInstance = shallowRef<Graph>();
  const vueInstance = getCurrentInstance();

  registerVueNode();

  onMounted(() => {
    if (!container.value) {
      console.error('container is not found');
      return;
    }

    const graph = new Graph({
      container: container.value,
      autoFit: {
        type: 'center',
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
      ],
      edge: edgeConfig,
      layout: {
        type: 'antv-dagre',
        rankdir: 'TB',
        nodesep: 100,
        ranksep: 60,
        controlPoints: true,
      },
      data: {
        nodes: Array.from(
          { length: 8 },
          (_, i) =>
            ({
              id: `node-${i + 1}`,
              type: 'vue-node',
              style: {
                ...DEFAULT_NODE_STYLE,
                appContext: vueInstance?.root?.appContext,
              },
            }) as any,
        ),
        edges: [
          { source: 'node-1', target: 'node-2' },
          { source: 'node-1', target: 'node-3' },
          { source: 'node-2', target: 'node-4' },
          { source: 'node-2', target: 'node-5' },
          { source: 'node-2', target: 'node-6' },
          { source: 'node-3', target: 'node-7' },
          { source: 'node-4', target: 'node-8' },
        ],
      },
    });

    graph.render().then(() => {
      options?.onGraphReady?.(graph!);
    });

    graphInstance.value = graph;
  });

  return {
    graphInstance,
  };
}
