import { App } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import setupCustomComponents from '@/components';
import { setupRouter } from '@/router';

function setupElementIcon(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}

export default function setupPlugins(app: App) {
  // 注册 Element Plus 图标
  setupElementIcon(app);
  // 注册自定义组件
  setupCustomComponents(app);
  // 注册路由
  setupRouter(app);
}
