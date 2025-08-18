<script setup lang="ts">
import { ElMenuItem, ElSubMenu } from 'element-plus';
import { map } from 'lodash';
import { h, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useMenu from '@/hooks/useMenu';
import NavAction from './components/NavAction.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';

defineOptions({
  name: 'TopLayout', // 顶部菜单布局
});

const router = useRouter();
const route = useRoute();

const { menuConfig } = useMenu();
const currentPath = ref('');

function handleMenuItemClick(item: MenuItem) {
  if (!item.path) return;

  router.push(item.path);
}

// 生成菜单节点
function generateMenuNodes() {
  // 渲染菜单项标题
  function renderMenuItemTitle(item: MenuItem) {
    if (!item.icon) return item.title;

    return [
      h(SvgIcon, {
        name: item.icon,
        size: '18px',
        style: 'margin-right: 6px;',
      }),
      h('span', item.title),
    ];
  }

  // 渲染菜单项
  function renderMenuItem(item: MenuItem) {
    return h(
      ElMenuItem,
      {
        key: item.path,
        index: item.path,
        onClick: () => handleMenuItemClick(item),
      },
      () => renderMenuItemTitle(item),
    );
  }

  // 渲染子菜单
  function renderSubMenu(item: MenuItem) {
    return h(
      ElSubMenu,
      {
        key: item.path,
        index: item.path,
      },
      {
        default: item.children?.length
          ? () => renderMenuItems(item.children!)
          : undefined,
        title: () => renderMenuItemTitle(item),
      },
    );
  }

  // 渲染菜单项数组
  function renderMenuItems(items: MenuItem[]) {
    return map(items, (item) => {
      if (item.children?.length) {
        return renderSubMenu(item);
      }

      return renderMenuItem(item);
    });
  }

  return renderMenuItems(menuConfig.value!);
}

watchEffect(() => {
  currentPath.value = route.path;
});
</script>

<template>
  <el-container class="top-layout-wrapper">
    <el-header class="top-layout-header">
      <div class="top-layout-header-logo">
        <SvgIcon name="xigua" size="24px" />
        <span>Hello</span>
      </div>

      <div class="top-layout-header-menu-wrapper">
        <el-menu
          mode="horizontal"
          ellipsis
          :popper-offset="12"
          :key="currentPath"
          :default-active="currentPath"
          class="top-layout-header-menu"
        >
          <component :is="generateMenuNodes" />
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
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 0 14px 1px rgba(0, 0, 0, 0.08);
  height: 60px;
  overflow: hidden;

  .top-layout-header-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
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
      width: 100%;
    }
  }

  .top-layout-header-action {
    width: max-content;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  ::v-deep(.el-sub-menu.el-sub-menu__hide-arrow:last-child) {
    .el-sub-menu__title {
      padding-right: var(--el-menu-base-level-padding);
    }
  }
}

.top-layout-content {
  padding: 0;
}
</style>
