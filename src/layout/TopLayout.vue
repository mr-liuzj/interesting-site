<script setup lang="ts">
import NavAction from './components/NavAction.vue';
import MENU_CONFIG from '@/constants/menu';
import { ElMenuItem, ElSubMenu } from 'element-plus';
import { map } from 'lodash';
import { h, ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'TopLayout', // 顶部菜单布局
});
const router = useRouter();

const menuConfig = ref<MenuItem[]>(MENU_CONFIG);

function handleMenuItemClick(item: MenuItem) {
  router.push(item.path);
}

function renderMenuNode() {
  function renderMenuItem(item: MenuItem) {
    return h(
      ElMenuItem,
      {
        key: item.path,
        index: item.path,
        onClick: () => handleMenuItemClick(item),
      },
      () => item.title,
    );
  }

  function renderSubMenu(item: MenuItem) {
    return h(
      ElSubMenu,
      {
        key: item.path,
        index: item.path,
      },
      {
        default: item.children?.length
          ? () => renderNodes(item.children!)
          : undefined,
        title: () => item.title,
      },
    );
  }

  function renderNodes(items: MenuItem[]) {
    return map(items, (item) => {
      if (item.children?.length) {
        return renderSubMenu(item);
      }
      return renderMenuItem(item);
    });
  }

  return renderNodes(menuConfig.value);
}
</script>

<template>
  <el-container class="top-layout-wrapper">
    <el-header class="top-layout-header">
      <div class="top-layout-header-logo"> 自用后台模板 </div>

      <div class="top-layout-header-menu-wrapper">
        <el-menu
          mode="horizontal"
          ellipsis
          :popper-offset="16"
          class="top-layout-header-menu"
        >
          <component :is="renderMenuNode" />
        </el-menu>
      </div>

      <div class="top-layout-header-action">
        <NavAction />
      </div>
    </el-header>

    <el-main class="top-layout-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped lang="less">
.top-layout-wrapper {
  width: 100vw;
  height: 100vh;
}

.top-layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.12);
  height: 60px;
  overflow: hidden;

  .top-layout-header-logo {
    display: flex;
    align-items: center;
  }

  .top-layout-header-menu-wrapper {
    height: 100%;
    padding: 0 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    overflow: hidden;
    box-sizing: border-box;

    .top-layout-header-menu {
      max-width: 100%;
    }
  }

  .top-layout-header-action {
    width: max-content;
  }
}
</style>
