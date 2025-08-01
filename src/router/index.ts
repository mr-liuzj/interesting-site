import { App } from 'vue';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import dynamicRoutes from './dynamicRoutes';

const baseRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    redirect: dynamicRoutes[0].path,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...baseRoutes, ...dynamicRoutes],
});

export function setupRouter(app: App) {
  app.use(router);
}

export default router;
