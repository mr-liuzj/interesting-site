const MENU_CONFIG: MenuItem[] = [
  {
    title: 'AI 接入',
    path: '/chat',
    icon: 'bot',
    children: [
      {
        title: 'DeepSeek',
        path: '/chat/deepseek',
        icon: 'deepseek',
        component: () => import('@/pages/chat/deepseek/index.vue'),
      },
    ],
  },
  {
    title: '图表',
    path: '/graphy',
    icon: 'graphy',
    children: [
      {
        title: 'G6 树形图',
        path: '/graphy/g6',
        icon: 'antv',
        component: () => import('@/pages/graphy/g6/index.vue'),
      },
      {
        title: 'X6 拓扑图编辑器',
        path: '/graphy/x6',
        icon: 'x6',
        component: () => import('@/pages/graphy/x6/index.vue'),
      },
    ],
  },
];

export default MENU_CONFIG;
