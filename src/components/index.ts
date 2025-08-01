import { App } from 'vue';
import SvgIcon from './SvgIcon/index.vue';

export default function (app: App) {
  app.component('SvgIcon', SvgIcon);
}
