import { Graph } from '@antv/g6';
import { onMounted, Ref, shallowRef } from 'vue';

export interface useGraphOptions {
  onGraphReady?: (graph: Graph) => void;
}

/** 默认缩放比例 */
export const DEFAULT_ZOOM = 1;
/** 最小缩放比例 */
export const MIN_ZOOM = 0.5;
/** 最大缩放比例 */
export const MAX_ZOOM = 3;

export function useGraph(
  container: Ref<HTMLElement | undefined>,
  options?: useGraphOptions,
) {
  const graphInstance = shallowRef<Graph>();

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
      behaviors: ['zoom-canvas', 'drag-canvas'],
      data: {
        nodes: [
          {
            id: 'node-1',
            style: { x: 50, y: 100 },
          },
          {
            id: 'node-2',
            style: { x: 150, y: 100 },
          },
        ],
        edges: [{ id: 'edge-1', source: 'node-1', target: 'node-2' }],
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
