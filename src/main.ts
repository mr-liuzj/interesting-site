import { createApp } from 'vue';
import App from './App.vue';
import setupPlugins from './plugins';
import './styles/index.less';

import 'virtual:svg-icons-register';

const app = createApp(App);

setupPlugins(app);

app.mount('#app');
