<template>
  <div class="nav-action-container">
    <el-tooltip content="设置" placement="bottom">
      <div class="nav-action-item">
        <el-icon><Setting /></el-icon>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue';

defineOptions({
  name: 'NavAction',
});
</script>

<style scoped lang="less">
.nav-action-container {
  display: flex;
  align-items: center;
  gap: 6px;

  .nav-action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: #f9fafc;
    box-shadow: 0 0 3px 2px rgba(0, 0, 0, 0.12);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.15);
    }
  }
}
</style>
