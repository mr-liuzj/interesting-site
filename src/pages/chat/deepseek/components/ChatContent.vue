<template>
  <div class="chat-content">
    <!-- 消息列表区域 -->
    <div v-if="messages.length > 0" class="chat-messages" ref="messagesRef">
      <div
        v-for="(message, index) in messages"
        :key="message.id"
        class="message-item"
        :class="{
          'message-user': message.role === 'user',
          'message-assistant': message.role === 'assistant',
        }"
      >
        <div class="message-avatar">
          <el-avatar
            :size="32"
            :src="message.role === 'user' ? UserImage : DeepSeekImage"
          />
        </div>
        <div class="message-content">
          <!-- 用户消息：直接显示文本 -->
          <div v-if="message.role === 'user'" class="message-text">
            {{ message.content }}
          </div>

          <!-- AI消息：使用MdPreview组件渲染 -->
          <div v-else class="message-text">
            <MdPreview :modelValue="message.content" />
          </div>

          <!-- 流式响应指示器 -->
          <div
            v-if="message.role === 'assistant' && message.isStreaming"
            class="streaming-indicator"
          >
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="typing-text">AI正在思考...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 无消息时的欢迎区域 -->
    <div v-else class="welcome-area">
      <div class="welcome-content">
        <div class="welcome-icon">
          <img
            :src="DeepSeekImage"
            alt="DeepSeek AI"
            style="width: 80px; height: 80px; border-radius: 50%"
          />
        </div>
        <h2 class="welcome-title">欢迎使用 DeepSeek AI 助手</h2>
        <p class="welcome-subtitle"
          >我是您的AI助手，可以帮您回答问题、编写代码、分析数据等</p
        >
        <div class="welcome-tips">
          <div class="tip-item">💡 您可以问我任何问题</div>
          <div class="tip-item">💡 我可以帮您编写代码</div>
          <div class="tip-item">💡 我可以分析数据和图表</div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <div class="input-container">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="1"
          :autosize="{ minRows: 1, maxRows: 6 }"
          placeholder="请输入您的问题..."
          @keydown="handleKeydown"
          :disabled="isLoading"
          ref="inputRef"
        />
        <el-button
          type="primary"
          :icon="ArrowUp"
          circle
          @click.stop="handleSend"
          :disabled="!inputMessage.trim() || isLoading || isSending"
          class="send-button"
        />
      </div>
      <div class="input-tips"> 💡 按 Enter 发送，Shift + Enter 换行 </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { ArrowUp } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/preview.css';
import DeepSeekImage from '@/assets/images/deepseek.webp';
import UserImage from '@/assets/images/user.jpg';
import type {
  Message,
  ChatContentProps,
  ChatContentEmits,
  ChatContentExpose,
} from '../types';
import {
  API_URL,
  MODEL,
  MAX_TOKENS,
  TEMPERATURE,
  EVENTS,
  COMPONENT_NAMES,
} from '../constants';

defineOptions({
  name: COMPONENT_NAMES.CHAT_CONTENT,
});

// 组件属性定义
const props = defineProps<ChatContentProps>();

// 组件事件定义
const emit = defineEmits<ChatContentEmits>();

// 响应式数据
const messages = ref<Message[]>([]);
const inputMessage = ref('');
const isLoading = ref(false);
const isSending = ref(false);
const messagesRef = ref<HTMLElement>();
const inputRef = ref();

// 工具函数
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const scrollToBottom = (): void => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight;
  }
};

const isDuplicateMessage = (message: Message): boolean => {
  return messages.value.some(
    (msg) => msg.role === message.role && msg.content === message.content,
  );
};

// 事件处理
const handleKeydown = (event: Event | KeyboardEvent): void => {
  if (
    event instanceof KeyboardEvent &&
    event.key === 'Enter' &&
    !event.shiftKey &&
    !isLoading.value &&
    !isSending.value
  ) {
    event.preventDefault();
    handleSend();
  }
};

// 发送消息的主要处理函数
const handleSend = async (): Promise<void> => {
  if (!inputMessage.value.trim() || isLoading.value || isSending.value) return;

  isSending.value = true;

  const userMessage: Message = {
    role: 'user',
    content: inputMessage.value.trim(),
    id: generateMessageId(),
  };

  const userInput = inputMessage.value.trim();
  inputMessage.value = '';

  messages.value.push(userMessage);

  const assistantMessage: Message = {
    role: 'assistant',
    content: '',
    isStreaming: true,
    id: generateMessageId(),
  };
  messages.value.push(assistantMessage);

  emit(EVENTS.NEW_MESSAGE, userMessage);

  isLoading.value = true;
  emit(EVENTS.LOADING_CHANGE, true);

  try {
    await streamDeepSeekResponse(userInput, assistantMessage);
  } catch (error) {
    ElMessage.error('发送失败，请检查API Key是否正确');
    messages.value.pop();
  } finally {
    isLoading.value = false;
    isSending.value = false;
    emit(EVENTS.LOADING_CHANGE, false);
    await nextTick();
    scrollToBottom();
  }
};

// API调用
const streamDeepSeekResponse = async (
  userInput: string,
  assistantMessage: Message,
): Promise<void> => {
  const assistantMessageIndex = messages.value.findIndex(
    (msg) => msg.id === assistantMessage.id,
  );

  const contextMessages = messages.value
    .filter(
      (msg) =>
        !msg.isStreaming &&
        !msg.isWelcome &&
        msg.content.trim() !== '' &&
        !(msg.role === 'assistant' && msg.content === ''),
    )
    .map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${props.apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: contextMessages,
      stream: true,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('No reader available');

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            if (assistantMessageIndex !== -1) {
              messages.value[assistantMessageIndex].isStreaming = false;
            }
            const finalMessage = { ...messages.value[assistantMessageIndex] };
            delete finalMessage.isStreaming;
            emit(EVENTS.NEW_MESSAGE, finalMessage);
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content && assistantMessageIndex !== -1) {
              messages.value[assistantMessageIndex].content += content;
              requestAnimationFrame(() => {
                scrollToBottom();
              });
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
    if (assistantMessageIndex !== -1) {
      messages.value[assistantMessageIndex].isStreaming = false;
      const finalMessage = { ...messages.value[assistantMessageIndex] };
      delete finalMessage.isStreaming;
      emit(EVENTS.NEW_MESSAGE, finalMessage);
    }
  }
};

// 生命周期和监听器
watch(
  messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true },
);

onMounted(() => {
  inputRef.value?.focus();
});

// 暴露给父组件的方法
const loadMessages = (msgs: Message[]): void => {
  if (JSON.stringify(messages.value) !== JSON.stringify(msgs)) {
    messages.value = msgs;
  }
};

const clearMessages = (): void => {
  messages.value = [];
};

const getIsLoading = (): boolean => {
  return isLoading.value;
};

// 暴露方法给父组件
defineExpose<ChatContentExpose>({
  loadMessages,
  clearMessages,
  getCurrentMessages: () => messages.value,
  isLoading: getIsLoading,
});
</script>

<style scoped lang="less">
.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.02)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  }
}

.message-item {
  display: flex;
  gap: 16px;
  max-width: 100%;
  animation: fadeInUp 0.3s ease-out;

  &.message-user {
    flex-direction: row-reverse;

    .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 20px 4px 20px 20px;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  }

  &.message-assistant {
    flex-direction: row;

    .message-content {
      background: rgba(255, 255, 255, 0.95);
      color: #2d3748;
      border-radius: 4px 20px 20px 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  }
}

.message-avatar {
  flex-shrink: 0;

  .el-avatar {
    border: 2px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }
  }
}

.message-content {
  flex: 1;
  padding: 16px 20px;
  max-width: 85%;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 15px;
  transition: all 0.3s ease;

  .message-text {
    .md-editor {
      background-color: transparent;
    }

    // MdPreview组件样式覆盖
    :deep(.md-preview) {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
    }

    :deep(.md-preview-html) {
      background: transparent;
      color: inherit;
    }

    // 确保代码块在深色主题下也能正常显示
    :deep(.md-preview-html pre) {
      background: rgba(0, 0, 0, 0.05);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      overflow-x: auto;
    }

    // 表格样式优化
    :deep(.md-preview-html table) {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    :deep(.md-preview-html th) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }

    :deep(.md-preview-html td) {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      font-size: 14px;
      line-height: 1.5;
    }

    :deep(.md-preview-html tr:last-child td) {
      border-bottom: none;
    }

    :deep(.md-preview-html tr:nth-child(even)) {
      background: rgba(0, 0, 0, 0.02);
    }

    :deep(.md-preview-html tr:hover) {
      background: rgba(102, 126, 234, 0.05);
    }
  }
}

.streaming-indicator {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
  align-items: center;

  .dot {
    width: 8px;
    height: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    animation: pulse 1.4s ease-in-out infinite both;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
    &:nth-child(3) {
      animation-delay: 0s;
    }
  }

  .typing-text {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-left: 8px;
    font-weight: 500;
    animation: fadeInOut 2s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
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

@keyframes fadeInOut {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.chat-input-area {
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.input-container {
  display: flex;
  gap: 16px;
  align-items: flex-end;

  .el-textarea {
    flex: 1;

    :deep(.el-textarea__inner) {
      border-radius: 24px;
      padding: 12px 20px;
      resize: none;
      border: 2px solid rgba(255, 255, 255, 0.3);
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      font-size: 15px;
      line-height: 1.4;
      transition: all 0.3s ease;
      overflow-y: auto;
      min-height: 44px;

      &:focus {
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
        background: rgba(255, 255, 255, 0.95);
      }

      &::placeholder {
        color: rgba(0, 0, 0, 0.5);
      }

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(102, 126, 234, 0.3);
        border-radius: 3px;
        margin: 2px;

        &:hover {
          background: rgba(102, 126, 234, 0.5);
        }
      }

      // 确保滚动条不会超出圆角边界
      &::-webkit-scrollbar-corner {
        background: transparent;
      }
    }
  }
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  width: 44px;
  height: 44px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: rgba(156, 163, 175, 0.5);
    box-shadow: none;
    transform: none;
  }

  .el-icon {
    font-size: 18px;
  }
}

.input-tips {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 12px;
  text-align: center;
  font-weight: 500;
}

.welcome-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  z-index: 1;
}

.welcome-content {
  text-align: center;
  max-width: 500px;
  animation: fadeInUp 0.5s ease-out;
}

.welcome-icon {
  margin-bottom: 24px;
  animation: bounce 2s ease-in-out infinite;

  img {
    border-radius: 50%;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }
  }
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
  line-height: 1.6;
}

.welcome-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}
</style>
