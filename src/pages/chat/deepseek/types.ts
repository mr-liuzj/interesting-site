/**
 * DeepSeek 聊天模块类型定义
 */

// 基础消息类型
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id?: string;
}

// 聊天会话类型
export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: number;
  messages: ChatMessage[];
}

// 消息类型（用于ChatContent组件）
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  isWelcome?: boolean;
  id: string;
}

// API 相关类型
export interface DeepSeekApiConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  stream: boolean;
}

// 组件 Props 类型
export interface ChatHistoryProps {
  apiKey: string;
  disabled?: boolean;
}

export interface ChatContentProps {
  apiKey: string;
  hasHistory?: boolean;
}

// 组件 Emits 类型
export interface ChatHistoryEmits {
  sessionSelected: [session: ChatSession | null];
  newSession: [];
}

export interface ChatContentEmits {
  newMessage: [message: Message];
  loadingChange: [loading: boolean];
}

// 暴露方法类型
export interface ChatHistoryExpose {
  updateSessionPreview: (sessionId: string, message: ChatMessage) => void;
  createNewChat: () => void;
  selectFirstSession: () => void;
  createSessionForMessage: (message: ChatMessage) => void;
  getCurrentSessionId: () => string | null;
  getHistoryCount: () => number;
}

export interface ChatContentExpose {
  loadMessages: (msgs: Message[]) => void;
  clearMessages: () => void;
  getCurrentMessages: () => Message[];
  isLoading: () => boolean;
}
