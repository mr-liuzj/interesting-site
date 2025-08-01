const MENU_CONFIG: MenuItem[] = [
  {
    path: '/dashboard',
    icon: 'dashboard',
    title: '控制台',
  },
  {
    path: '/system',
    icon: 'setting',
    title: '系统管理',
    children: [
      {
        path: '/system/user',
        title: '用户管理',
        icon: 'user',
        children: [
          {
            path: '/system/user/list',
            title: '用户列表',
            children: [
              { path: '/system/user/list/all', title: '全部用户' },
              { path: '/system/user/list/vip', title: 'VIP用户' },
            ],
          },
          { path: '/system/user/role', title: '角色管理' },
        ],
      },
      { path: '/system/menu', title: '菜单配置' },
    ],
  },
  {
    path: '/product',
    icon: 'shopping',
    title: '商品中心',
    children: [
      { path: '/product/list', title: '商品列表' },
      { path: '/product/category', title: '分类管理' },
      { path: '/product/brand', title: '品牌管理' },
    ],
  },
  {
    path: '/order',
    icon: 'shopping-cart',
    title: '订单管理',
    children: [
      { path: '/order/list', title: '订单列表' },
      { path: '/order/after-sale', title: '售后管理' },
    ],
  },
  {
    path: '/marketing',
    icon: 'gift',
    title: '营销中心',
    children: [
      { path: '/marketing/coupon', title: '优惠券' },
      { path: '/marketing/seckill', title: '秒杀活动' },
    ],
  },
  {
    path: '/content',
    icon: 'file-text',
    title: '内容管理',
    children: [
      { path: '/content/article', title: '文章管理' },
      { path: '/content/banner', title: '轮播图管理' },
    ],
  },
  {
    path: '/statistics',
    icon: 'pie-chart',
    title: '数据统计',
    children: [
      { path: '/statistics/sales', title: '销售统计' },
      { path: '/statistics/user', title: '用户统计' },
    ],
  },
  {
    path: '/finance',
    icon: 'dollar',
    title: '财务管理',
    children: [
      { path: '/finance/record', title: '收支记录' },
      { path: '/finance/invoice', title: '发票管理' },
    ],
  },
  {
    path: '/customer',
    icon: 'team',
    title: '客户管理',
    children: [
      { path: '/customer/list', title: '客户列表' },
      { path: '/customer/group', title: '客户分组' },
    ],
  },
  {
    path: '/warehouse',
    icon: 'database',
    title: '仓储管理',
    children: [
      { path: '/warehouse/inventory', title: '库存管理' },
      { path: '/warehouse/log', title: '出入库记录' },
    ],
  },
  {
    path: '/logistics',
    icon: 'car',
    title: '物流管理',
    children: [
      { path: '/logistics/express', title: '快递公司' },
      { path: '/logistics/template', title: '运费模板' },
    ],
  },
  {
    path: '/service',
    icon: 'customer-service',
    title: '客服管理',
    children: [
      { path: '/service/chat', title: '在线对话' },
      { path: '/service/feedback', title: '意见反馈' },
    ],
  },
  {
    path: '/report',
    icon: 'alert',
    title: '报表中心',
    children: [
      { path: '/report/daily', title: '日报表' },
      { path: '/report/monthly', title: '月报表' },
    ],
  },
  {
    path: '/setting',
    icon: 'tool',
    title: '系统设置',
    children: [
      { path: '/setting/base', title: '基础设置' },
      { path: '/setting/payment', title: '支付设置' },
    ],
  },
  {
    path: '/audit',
    icon: 'safety',
    title: '审计管理',
    children: [
      { path: '/audit/log', title: '操作日志' },
      { path: '/audit/security', title: '安全审计' },
    ],
  },
  {
    path: '/extensions',
    icon: 'appstore',
    title: '扩展功能',
    children: [
      { path: '/extensions/plugins', title: '插件管理' },
      { path: '/extensions/api', title: 'API接口' },
    ],
  },
];

export default MENU_CONFIG;
