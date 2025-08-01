const MENU_CONFIG: MenuItem[] = [
  {
    title: 'AI 接入',
    path: '/chat',
    children: [
      {
        title: 'DeepSeek',
        path: '/chat/deepseek',
        component: () => import('@/pages/chat/deepseek/index.vue'),
      },
    ],
  },
  {
    title: '图表Demo',
    path: '/graphy',
    children: [
      {
        title: 'antv G6',
        path: '/graphy/g6',
        component: () => import('@/pages/graphy/g6/index.vue'),
      },
    ],
  },
];

export default MENU_CONFIG;
