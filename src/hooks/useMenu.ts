import { ref } from 'vue';
import MENU_CONFIG from '@/constants/menu';
import { cloneDeep } from 'lodash';

export default function useMenu() {
  const menuConfig = ref<MenuItem[]>([]);

  function generateMenuConfig() {
    menuConfig.value = cloneDeep(MENU_CONFIG);
  }

  generateMenuConfig();

  return {
    menuConfig,
  };
}
