<template>
  <div class="chat-history">
    <!-- 历史记录标题 -->
    <div class="history-header">
      <h3>💬 聊天记录</h3>
      <el-button
        type="text"
        size="small"
        @click="clearHistory"
        :disabled="!chatHistory.length || disabled"
      >
        🗑️ 清空记录
      </el-button>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" ref="historyListRef">
      <div
        v-for="(session, index) in chatHistory"
        :key="session.id"
        class="history-item"
        :class="{ active: activeSessionIndex === index }"
        @click="!disabled && selectSession(index)"
      >
        <div class="history-item-content">
          <div class="history-item-title">
            {{ session.title || `对话 ${index + 1}` }}
          </div>
          <div class="history-item-preview">
            {{ session.preview || '暂无消息' }}
          </div>
          <div class="history-item-time">
            {{ formatTime(session.timestamp) }}
          </div>
        </div>
        <el-button
          size="small"
          @click.stop="!disabled && deleteSession(index)"
          class="delete-btn"
          title="删除对话"
          :disabled="disabled"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 新建对话按钮 -->
    <div class="new-chat-section">
      <el-button
        type="primary"
        @click="handleCreateNewChat"
        class="new-chat-btn"
        :icon="Plus"
        :disabled="disabled"
      >
        ✨ 新建对话
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Delete, Plus } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type {
  ChatSession,
  ChatMessage,
  ChatHistoryProps,
  ChatHistoryEmits,
  ChatHistoryExpose,
} from '../types';
import {
  STORAGE_KEY,
  EVENTS,
  MESSAGE_ROLES,
  TIME_CONSTANTS,
  TEXT_LIMITS,
  COMPONENT_NAMES,
} from '../constants';

defineOptions({
  name: COMPONENT_NAMES.CHAT_HISTORY,
});

const props = defineProps<ChatHistoryProps>();

const emit = defineEmits<ChatHistoryEmits>();

// 响应式数据
const chatHistory = ref<ChatSession[]>([]);
const activeSessionIndex = ref(-1);
const historyListRef = ref<HTMLElement>();

// 工具函数
const loadHistory = (): void => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      chatHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    // 加载历史记录失败，使用空数组
    chatHistory.value = [];
  }
};

const saveHistory = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.value));
  } catch (error) {
    // 保存历史记录失败，忽略错误
  }
};

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// 创建新对话
const createNewChat = (): void => {
  const newSession: ChatSession = {
    id: generateSessionId(),
    title: '',
    preview: '',
    timestamp: Date.now(),
    messages: [],
  };

  chatHistory.value.unshift(newSession);
  activeSessionIndex.value = 0;
  saveHistory();
  emit(EVENTS.NEW_SESSION);
  emit(EVENTS.SESSION_SELECTED, newSession);
};

// 处理新建对话按钮点击
const handleCreateNewChat = (): void => {
  if (!props.disabled) {
    createNewChat();
  }
};

// 选择对话
const selectSession = (index: number): void => {
  if (activeSessionIndex.value === index) return;

  activeSessionIndex.value = index;
  emit(EVENTS.SESSION_SELECTED, chatHistory.value[index]);
};

// 删除对话
const deleteSession = async (index: number): Promise<void> => {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    chatHistory.value.splice(index, 1);

    if (activeSessionIndex.value === index) {
      activeSessionIndex.value = -1;
      emit(EVENTS.SESSION_SELECTED, null);
    } else if (activeSessionIndex.value > index) {
      activeSessionIndex.value--;
    }

    saveHistory();
    ElMessage.success('删除成功');
  } catch {
    // 用户取消删除
  }
};

// 清空所有历史记录
const clearHistory = async (): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有聊天记录吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    chatHistory.value = [];
    activeSessionIndex.value = -1;
    saveHistory();
    emit(EVENTS.SESSION_SELECTED, null);
    ElMessage.success('清空成功');
  } catch {
    // 用户取消清空
  }
};

// 更新对话标题和预览
const updateSessionPreview = (
  sessionId: string,
  message: ChatMessage,
): void => {
  const session = chatHistory.value.find((s) => s.id === sessionId);
  if (!session) return;

  // 检查是否重复添加相同消息
  const isDuplicate = session.messages.some(
    (msg) => msg.role === message.role && msg.content === message.content,
  );

  if (isDuplicate) return;

  // 添加新消息
  session.messages.push({
    role: message.role,
    content: message.content,
  });

  // 更新预览和标题
  const firstUserMessage = session.messages.find(
    (m) => m.role === MESSAGE_ROLES.USER,
  );
  if (firstUserMessage) {
    session.preview = truncateText(
      firstUserMessage.content,
      TEXT_LIMITS.PREVIEW_MAX_LENGTH,
    );

    if (!session.title) {
      session.title = truncateText(
        firstUserMessage.content,
        TEXT_LIMITS.TITLE_MAX_LENGTH,
      );
    }
  }

  saveHistory();
};

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < TIME_CONSTANTS.ONE_MINUTE) return '刚刚';
  if (diff < TIME_CONSTANTS.ONE_HOUR)
    return `${Math.floor(diff / TIME_CONSTANTS.ONE_MINUTE)}分钟前`;
  if (diff < TIME_CONSTANTS.ONE_DAY)
    return `${Math.floor(diff / TIME_CONSTANTS.ONE_HOUR)}小时前`;
  return date.toLocaleDateString();
};

// 选择第一个会话
const selectFirstSession = (): void => {
  if (chatHistory.value.length > 0) {
    activeSessionIndex.value = 0;
    emit(EVENTS.SESSION_SELECTED, chatHistory.value[0]);
  }
};

// 为新消息创建会话
const createSessionForMessage = (message: ChatMessage): void => {
  const newSession: ChatSession = {
    id: generateSessionId(),
    title: truncateText(message.content, TEXT_LIMITS.TITLE_MAX_LENGTH),
    preview: truncateText(message.content, TEXT_LIMITS.PREVIEW_MAX_LENGTH),
    timestamp: Date.now(),
    messages: [], // 不在这里添加消息，避免重复
  };

  chatHistory.value.unshift(newSession);
  activeSessionIndex.value = 0;
  saveHistory();
};

// 监听历史记录变化，自动保存
watch(
  chatHistory,
  () => {
    saveHistory();
  },
  { deep: true },
);

// 组件挂载时加载历史记录
loadHistory();

// 暴露方法给父组件
defineExpose<ChatHistoryExpose>({
  updateSessionPreview,
  createNewChat,
  selectFirstSession,
  createSessionForMessage,
  getCurrentSessionId: (): string | null => {
    if (
      activeSessionIndex.value >= 0 &&
      chatHistory.value[activeSessionIndex.value]
    ) {
      return chatHistory.value[activeSessionIndex.value].id;
    }
    return null;
  },
  getHistoryCount: (): number => {
    return chatHistory.value.length;
  },
});
</script>

<style scoped lang="less">
.chat-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: white;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .el-button {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;

    &:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    &:disabled {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideInLeft 0.3s ease-out;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .delete-btn {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    transform: translateX(8px);

    .history-item-title {
      color: white;
    }

    .history-item-preview {
      color: rgba(255, 255, 255, 0.9);
    }

    .history-item-time {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  // 禁用状态
  &:has(.el-button:disabled) {
    cursor: not-allowed;
    opacity: 0.6;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: none;
      box-shadow: none;
    }
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-weight: 600;
  font-size: 14px;
  color: white;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.history-item-preview {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.history-item-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.delete-btn {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) scale(0.8);

  &:hover {
    color: #ff5252;
    background: rgba(255, 82, 82, 0.2);
    transform: translateY(-50%) scale(1.1);
  }

  .el-icon {
    font-size: 14px;
  }
}

.new-chat-section {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 1;
}

.new-chat-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  height: 48px;
  font-weight: 600;
  font-size: 15px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  .el-icon {
    margin-right: 8px;
    font-size: 16px;
  }
}

// 空状态样式
.history-list:empty::after {
  content: '暂无聊天记录';
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
}
</style>
