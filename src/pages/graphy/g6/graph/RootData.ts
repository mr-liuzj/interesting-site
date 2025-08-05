import { uniqueId } from 'lodash';

export interface RootDataItem {
  id: string;
  title?: string;
  description?: string;
  pid?: string;
  hideChildren?: boolean;
  children?: RootDataItem[];
}

const rootId = `node-${uniqueId()}`;
const firstLevelId = `node-${uniqueId()}`;

export const RootData: RootDataItem[] = [
  {
    id: rootId,
    title: '根节点',
    description: '根节点的描述',
    children: [
      {
        id: firstLevelId,
        pid: rootId,
        title: '左青龙',
        description: '左边一条小青龙',
        children: [
          {
            id: `node-${uniqueId()}`,
            pid: firstLevelId,
            title: '小青龙1号',
            description: '这是小青龙1号',
          },
        ],
      },
      {
        id: `node-${uniqueId()}`,
        pid: rootId,
        title: '中玄武',
        description: '中间一只玄武',
      },
      {
        id: `node-${uniqueId()}`,
        pid: rootId,
        title: '右白虎',
        description: '右边一只白老虎',
      },
    ],
  },
];
