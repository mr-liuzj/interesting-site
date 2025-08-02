<template>
  <el-container class="chat-deepseek-page">
    <el-header>
      <el-card>
        <div class="apikey-input-wrapper">
          <el-input
            v-model="inputApiKey"
            placeholder="API Key"
            @input="handleApiKeyInput"
          />
          <el-button
            type="primary"
            :disabled="!inputApiKey || !isApiKeyModified"
            @click="saveApiKey"
          >
            保存
          </el-button>
        </div>
      </el-card>
    </el-header>
    <el-container>
      <el-aside v-show="hasHistory" width="300px">
        <el-card>
          <ChatHistory
            :api-key="apiKey"
            ref="chatHistoryRef"
            @sessionSelected="handleSessionSelected"
            @newSession="handleNewSession"
            :disabled="isChatLoading"
          />
        </el-card>
      </el-aside>
      <el-main :class="{ 'full-width': !hasHistory }">
        <el-card>
          <ChatContent
            :api-key="apiKey"
            ref="chatContentRef"
            @newMessage="handleNewMessage"
            :has-history="hasHistory"
            @loadingChange="handleLoadingChange"
          />
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import {
  DEEPSEEK_STORAGE_KEY,
  DEFAULT_API_KEY,
} from '@/constants/modules/deepseek';
import { useStorage } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { ref, watch, computed } from 'vue';
import ChatHistory from './components/ChatHistory.vue';
import ChatContent from './components/ChatContent.vue';
import type { ChatSession, ChatMessage } from './types';
import { COMPONENT_NAMES } from './constants';

defineOptions({
  name: COMPONENT_NAMES.CHAT_DEEPSEEK,
});

// 响应式数据
const apiKey = useStorage(DEEPSEEK_STORAGE_KEY, DEFAULT_API_KEY);
const inputApiKey = ref('');
const chatHistoryRef = ref<InstanceType<typeof ChatHistory>>();
const chatContentRef = ref<InstanceType<typeof ChatContent>>();
const isChatLoading = ref(false);
const isApiKeyModified = ref(false);

// 计算是否有历史记录 - 优化性能，避免频繁调用
const hasHistory = computed(() => {
  const historyRef = chatHistoryRef.value;
  return historyRef ? historyRef.getHistoryCount() > 0 : false;
});

// API Key 输入处理
function handleApiKeyInput() {
  isApiKeyModified.value = inputApiKey.value !== apiKey.value;
}

// 保存 API Key
function saveApiKey() {
  apiKey.value = inputApiKey.value;
  isApiKeyModified.value = false;
  ElMessage.success('保存成功');
}

// 处理会话选择 - 优化消息比较逻辑
function handleSessionSelected(session: ChatSession | null) {
  if (!chatContentRef.value) return;

  if (session?.messages) {
    const currentMessages = chatContentRef.value.getCurrentMessages();
    const sessionMessages = session.messages;

    // 优化比较逻辑，避免深度比较
    const isSameMessages =
      currentMessages.length === sessionMessages.length &&
      currentMessages.every(
        (msg, index) =>
          msg.role === sessionMessages[index].role &&
          msg.content === sessionMessages[index].content,
      );

    if (!isSameMessages) {
      // 转换消息格式以匹配ChatContent组件的Message接口
      const formattedMessages = sessionMessages.map((msg, index) => ({
        ...msg,
        id: msg.id || `${Date.now()}-${index}`,
      }));
      chatContentRef.value.loadMessages(formattedMessages);
    }
  } else {
    chatContentRef.value.clearMessages();
  }
}

// 处理新建会话
function handleNewSession() {
  chatContentRef.value?.clearMessages();
}

// 处理新消息 - 优化逻辑
function handleNewMessage(message: ChatMessage) {
  if (!message?.content) return;

  const historyRef = chatHistoryRef.value;
  if (!historyRef) return;

  const currentSessionId = historyRef.getCurrentSessionId();
  if (currentSessionId) {
    historyRef.updateSessionPreview(currentSessionId, message);
  } else {
    historyRef.createSessionForMessage(message);
  }
}

// 处理加载状态变化
function handleLoadingChange(loading: boolean) {
  isChatLoading.value = loading;
}

// 监听 API Key 变化，同步到输入框
watch(
  () => apiKey.value,
  (value: string) => {
    if (value !== inputApiKey.value) {
      inputApiKey.value = value;
      isApiKeyModified.value = false;
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="less">
.chat-deepseek-page {
  height: 100%;
  gap: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px;
  overflow: hidden;

  .el-container {
    height: 100%;
    gap: 16px;
    overflow: hidden;
  }

  .el-header {
    padding: 0;
    overflow: hidden;
    height: max-content;

    .el-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      :deep(.el-card__body) {
        padding: 20px 24px;
      }
    }
  }

  .el-main,
  .el-aside {
    padding: 0;
    overflow: hidden;

    .el-card {
      height: 100%;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      overflow: hidden;

      :deep(.el-card__body) {
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
    }
  }

  .apikey-input-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;

    .el-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;

        &:hover {
          border-color: rgba(255, 255, 255, 0.5);
        }

        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        }
      }

      :deep(.el-input__inner) {
        font-size: 14px;
        font-weight: 500;

        &::placeholder {
          color: rgba(0, 0, 0, 0.5);
        }
      }
    }

    .el-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      height: 40px;
      padding: 0 24px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        background: rgba(156, 163, 175, 0.5);
        box-shadow: none;
        transform: none;
      }
    }
  }
}

// 全宽度样式
.full-width {
  width: 100% !important;
}

// 响应式设计
@media (max-width: 768px) {
  .chat-deepseek-page {
    padding: 12px;
    gap: 12px;

    .el-aside {
      width: 100% !important;
      height: 200px;
    }

    .el-container {
      flex-direction: column;
    }

    .apikey-input-wrapper {
      flex-direction: column;
      gap: 12px;

      .el-button {
        width: 100%;
      }
    }
  }
}

// 动画效果
.el-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
