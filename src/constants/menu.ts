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
        title: 'antv G6',
        path: '/graphy/g6',
        icon: 'antv',
        component: () => import('@/pages/graphy/g6/index.vue'),
      },
    ],
  },
];

export default MENU_CONFIG;
