import MENU_CONFIG from '@/constants/menu';
import { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/TopLayout.vue';

function generateDynamicRoutes(menuConfig: MenuItem[]): RouteRecordRaw[] {
  const vRoutes: RouteRecordRaw[] = [];

  function loopAppendRoutes(config: MenuItem[]) {
    config.forEach((item) => {
      if (item.children?.length) {
        loopAppendRoutes(item.children);
      } else {
        if (!item.component) {
          console.warn(`无法找到菜单【${item.title}】(${item.path})的组件`);
          return;
        }

        vRoutes.push({
          path: item.path,
          component: Layout,
          children: [
            {
              path: '',
              component: item.component,
              meta: {
                title: item.title,
                icon: item.icon,
              },
            } as RouteRecordRaw,
          ],
        });
      }
    });
  }

  loopAppendRoutes(menuConfig);

  return vRoutes;
}

const dynamicRoutes = generateDynamicRoutes(MENU_CONFIG);

export default dynamicRoutes;
