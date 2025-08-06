<template>
  <div class="graphy-g6-node" :class="{ selected: isSelected }">
    <div class="graphy-g6-node-content">
      <!-- 节点标题区域 -->
      <div class="node-header">
        <div class="node-title">
          <el-icon class="title-icon">
            <Document />
          </el-icon>
          <el-text class="title-text" :line-clamp="1">
            {{ nodeData?.title || '未命名节点' }}
          </el-text>
        </div>
      </div>

      <!-- 节点描述区域 -->
      <div class="node-description">
        <el-icon class="description-icon">
          <InfoFilled />
        </el-icon>
        <el-text class="description-text" :line-clamp="1">
          {{ nodeData?.description || '暂无描述信息' }}
        </el-text>
      </div>

      <el-divider style="margin: 10px 0" />

      <!-- 操作区域 -->
      <div class="node-actions">
        <el-tooltip
          content="添加子节点"
          placement="bottom"
          :show-after="0"
          :hide-after="0"
        >
          <el-button
            type="primary"
            :icon="Plus"
            circle
            @click="handleAddChild"
          />
        </el-tooltip>
        <el-tooltip
          content="编辑节点"
          placement="bottom"
          :show-after="0"
          :hide-after="0"
        >
          <el-button
            type="primary"
            :icon="Edit"
            plain
            circle
            @click="handleEdit"
          />
        </el-tooltip>
        <template v-if="nodeData?.children?.length">
          <el-tooltip
            :content="nodeData?.hideChildren ? '展开' : '收起'"
            placement="bottom"
            :show-after="0"
            :hide-after="0"
          >
            <el-button
              :icon="nodeData?.hideChildren ? ArrowDown : ArrowUp"
              circle
              @click="handleChangeHideChildren"
            />
          </el-tooltip>
        </template>
      </div>
    </div>

    <div v-if="!!nodeData?.pid" class="graphy-g6-node-delete">
      <el-tooltip
        content="删除节点"
        placement="bottom"
        :show-after="0"
        :hide-after="0"
      >
        <el-button
          type="danger"
          size="small"
          plain
          :icon="Delete"
          circle
          @click="handleDelete"
        />
      </el-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GraphEvent,
  IGraphLifeCycleEvent,
  NodeData,
  type State,
} from '@antv/g6';
import { CUSTOM_EVENTS, getGraphInstance } from '../graph';
import { computed, onBeforeUnmount, ref } from 'vue';
import {
  Plus,
  Edit,
  Document,
  InfoFilled,
  ArrowUp,
  ArrowDown,
  Delete,
} from '@element-plus/icons-vue';
import { RootDataItem } from '../graph/RootData';

defineOptions({
  name: 'CustomNode',
});

const props = defineProps<{
  nodeId: string;
}>();

const graph = getGraphInstance();

const nodeData = ref<RootDataItem>();

const stateList = ref<State[]>([]);

const isSelected = computed(() => stateList.value.includes('selected'));

function updateNodeData() {
  const nodeConfig = graph?.getNodeData(props.nodeId);
  nodeData.value = (nodeConfig?.data as unknown as RootDataItem) ?? {};
  stateList.value = [...(nodeConfig?.states ?? [])];
}

function bindUpdateNodeData(e: IGraphLifeCycleEvent) {
  const newData = e.data as NodeData;

  if (props.nodeId !== newData?.id) return;

  if (nodeData.value === newData.data) return;

  updateNodeData();
}

function bindEvents() {
  graph?.on(GraphEvent.AFTER_ELEMENT_UPDATE, bindUpdateNodeData);
}

function unbindEvents() {
  graph?.off(GraphEvent.AFTER_ELEMENT_UPDATE, bindUpdateNodeData);
}

function initNode() {
  bindEvents();
  updateNodeData();
}

// 操作处理函数
function handleAddChild() {
  graph?.emit(CUSTOM_EVENTS.ADD_NODE, nodeData.value);
}

function handleEdit() {
  graph?.emit(CUSTOM_EVENTS.MODIFY_NODE, nodeData.value);
}

function handleDelete() {
  graph?.emit(CUSTOM_EVENTS.DELETE_NODE, nodeData.value);
}

function handleChangeHideChildren() {
  if (!nodeData.value) return;

  const hideChildren = !nodeData.value.hideChildren;

  if (hideChildren) {
    graph?.emit(CUSTOM_EVENTS.COLLAPSE_NODE, nodeData.value);
  } else {
    graph?.emit(CUSTOM_EVENTS.EXPAND_NODE, nodeData.value);
  }
}

onBeforeUnmount(() => {
  unbindEvents();
});

initNode();
</script>

<style scoped lang="less">
.graphy-g6-node {
  width: 240px;
  height: 120px;
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px var(--el-color-primary-light-8);
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: var(--el-color-primary-light-4);
    box-shadow: 0 4px 16px var(--el-color-primary-light-6);
  }

  &.selected {
    border-color: var(--primary-color);
    box-shadow: 0 4px 16px var(--el-color-primary-light-3);
  }

  .graphy-g6-node-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .node-header {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      .node-title {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;

        .title-icon {
          font-size: 16px;
          color: var(--primary-color);
          margin-right: 8px;
          flex-shrink: 0;
        }

        .title-text {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }
    }

    .node-description {
      flex: 1;
      display: flex;
      align-items: center;

      .description-icon {
        font-size: 14px;
        color: var(--el-color-primary);
        margin-right: 6px;
        flex-shrink: 0;
      }

      .description-text {
        font-size: 12px;
        color: #606266;
      }
    }

    .node-actions {
      display: flex;
      justify-content: center;
      gap: 8px;

      .el-button {
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 12px;
        transition: all 0.2s ease;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }

  .graphy-g6-node-delete {
    position: absolute;
    top: 10px;
    right: 10px;
    cursor: pointer;
    color: var(--el-color-danger);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--el-color-danger);
  }
}
</style>
