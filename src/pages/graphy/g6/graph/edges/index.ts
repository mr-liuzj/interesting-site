import { GraphOptions } from '@antv/g6';

export const edgeConfig: GraphOptions['edge'] = {
  type: 'polyline',
  style: {
    controlPoints: [],
    stroke: '#8b9baf',
    radius: 8,
    router: {
      type: 'orth',
      padding: 30,
    },
  },
};
