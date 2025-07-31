import { App } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

function setupElementIcon(app: App) {
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
}

export default function setupPlugins(app: App) {
  // 注册 Element Plus 图标
  setupElementIcon(app);
}
