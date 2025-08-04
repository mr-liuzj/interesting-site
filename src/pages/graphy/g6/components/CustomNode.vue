<template>
  <div class="graphy-g6-node">
    <div class="graphy-g6-node-content">
      <div class="graphy-g6-node-content-title">
        自定义Vue节点【{{ title }}】
      </div>

      <div class="graphy-g6-node-content-footer">
        <el-button type="primary" size="small">
          <el-icon><Plus /></el-icon>
          添加子节点
        </el-button>
        <el-button type="primary" size="small"> 收起所有子节点 </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CustomNode',
});

defineProps<{
  title: string;
}>();
</script>

<style scoped lang="less">
.graphy-g6-node {
  width: 100%;
  height: 100%;
}
.graphy-g6-node-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.12);
}
.graphy-g6-node-content-title {
  font-size: 14px;
  font-weight: bold;
}
</style>
