/**
 * DeepSeek 聊天模块常量定义
 */

// API 相关常量
export const API_URL = 'https://api.deepseek.com/v1/chat/completions';
export const MODEL = 'deepseek-chat';
export const MAX_TOKENS = 2000;
export const TEMPERATURE = 0.7;

// 存储相关常量
export const STORAGE_KEY = 'deepseek_chat_history';

// 事件名称常量
export const EVENTS = {
  SESSION_SELECTED: 'sessionSelected',
  NEW_SESSION: 'newSession',
  NEW_MESSAGE: 'newMessage',
  LOADING_CHANGE: 'loadingChange',
} as const;

// 消息角色常量
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

// 时间格式化常量
export const TIME_CONSTANTS = {
  ONE_MINUTE: 60000,
  ONE_HOUR: 3600000,
  ONE_DAY: 86400000,
} as const;

// 文本截断常量
export const TEXT_LIMITS = {
  TITLE_MAX_LENGTH: 20,
  PREVIEW_MAX_LENGTH: 50,
} as const;

// 组件名称常量
export const COMPONENT_NAMES = {
  CHAT_DEEPSEEK: 'ChatDeepSeek',
  CHAT_HISTORY: 'ChatHistory',
  CHAT_CONTENT: 'ChatContent',
} as const;
