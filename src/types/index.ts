/**
 * TypeScript Type Definitions for Twitter Reply Assistant
 *
 * This file contains all shared type definitions used across the extension
 */

// ==================== AI Configuration ====================

/**
 * Supported AI providers
 */
export type AIProvider = 'siliconflow' | 'deepseek' | 'glm' | 'custom';

/**
 * AI model configuration
 * Stored in chrome.storage.sync for cross-device synchronization
 */
export interface AIConfig {
  /** Selected AI provider */
  provider: AIProvider;
  /** API endpoint URL */
  apiUrl: string;
  /** API authentication token */
  apiToken: string;
  /** Model name/identifier (e.g., "Qwen/Qwen2.5-7B-Instruct") */
  model: string;
}

/**
 * Default API URLs for each provider
 */
export const PROVIDER_URLS: Record<Exclude<AIProvider, 'custom'>, string> = {
  siliconflow: 'https://api.siliconflow.cn/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  glm: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
};

/**
 * Suggested models for each provider
 */
export const MODEL_SUGGESTIONS: Record<Exclude<AIProvider, 'custom'>, string[]> = {
  siliconflow: [
    'Qwen/Qwen2.5-7B-Instruct',
    'deepseek-ai/DeepSeek-V3',
    'meta-llama/Meta-Llama-3.1-8B-Instruct',
    'Qwen/Qwen2.5-14B-Instruct',
  ],
  deepseek: [
    'deepseek-chat',
    'deepseek-coder',
  ],
  glm: [
    'glm-4-flash',
    'glm-4',
    'glm-4-plus',
  ],
};

/**
 * Provider display names
 */
export const PROVIDER_NAMES: Record<AIProvider, string> = {
  siliconflow: 'SiliconFlow',
  deepseek: 'DeepSeek',
  glm: 'GLM (智谱清言)',
  custom: '自定义',
};

// ==================== Reply Styles ====================

/**
 * Available reply style identifiers (preset styles)
 */
export type ReplyStyleId =
  | 'supportive'     // 友好支持
  | 'questioning';   // 提问引导

/**
 * Reply style configuration
 */
export interface ReplyStyle {
  /** Unique identifier */
  id: ReplyStyleId | string; // Support both preset and custom styles
  /** Display name (Chinese) */
  name: string;
  /** Icon/emoji */
  icon: string;
  /** Use case description */
  description: string;
  /** System prompt for this style */
  systemPrompt: string;
}

/**
 * Custom reply style (user-created)
 */
export interface CustomReplyStyle {
  /** Unique identifier (timestamp-based) */
  id: string;
  /** Display name (Chinese) */
  name: string;
  /** Icon/emoji */
  icon: string;
  /** Use case description */
  description: string;
  /** System prompt for this style */
  systemPrompt: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last updated timestamp */
  updatedAt: number;
}

/**
 * All available reply styles
 */
export const REPLY_STYLES: ReplyStyle[] = [
  {
    id: 'professional',
    name: '专业严谨',
    icon: '💼',
    description: '适用于行业讨论、专业话题',
    systemPrompt: '你是一个专业的评论者。请用严谨、专业的语气回复推文，提供有价值的见解和分析，展现专业素养。',
  },
  {
    id: 'humorous',
    name: '幽默风趣',
    icon: '😄',
    description: '适用于娱乐、轻松话题',
    systemPrompt: '你是一个幽默的评论者。请用风趣、轻松的语气回复推文，可以适当加入幽默元素，让回复更有趣。',
  },
  {
    id: 'concise',
    name: '简洁明了',
    icon: '✨',
    description: '适用于快速回复、简短互动',
    systemPrompt: '你是一个简洁的评论者。请用简练、明了的语气回复推文，直击要点，避免冗长的表达。',
  },
  {
    id: 'supportive',
    name: '友好支持',
    icon: '👍',
    description: '适用于鼓励、赞同',
    systemPrompt: '你是一个友好支持的评论者。请用温暖、鼓励的语气回复推文，表达认同和支持，传递正能量。',
  },
  {
    id: 'critical',
    name: '批判性思考',
    icon: '🤔',
    description: '适用于辩论、分析性讨论',
    systemPrompt: '你是一个批判性思考者。请用理性、分析的语气回复推文，提供多角度思考，鼓励深入探讨。',
  },
  {
    id: 'questioning',
    name: '提问引导',
    icon: '❓',
    description: '适用于激发讨论、探索话题',
    systemPrompt: '你是一个善于提问的评论者。请通过提出有深度的问题来回复推文，引导更深入的讨论和思考。',
  },
];

// ==================== API Communication ====================

/**
 * OpenAI-compatible API request format
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

/**
 * Chat message format
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI-compatible API response format
 */
export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ==================== Storage Keys ====================

/**
 * Chrome storage keys
 */
export enum StorageKey {
  AI_CONFIG = 'ai_config',
  REPLY_HISTORY = 'reply_history',
  USER_PREFERENCES = 'user_preferences',
  CUSTOM_STYLES = 'custom_styles',
}

// ==================== Error Types ====================

/**
 * Custom error types for better error handling
 */
export enum ErrorType {
  INVALID_CONFIG = 'INVALID_CONFIG',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_TIMEOUT = 'API_TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  TWITTER_DOM_ERROR = 'TWITTER_DOM_ERROR',
  GENERATION_FAILED = 'GENERATION_FAILED',
}

/**
 * User-friendly error messages for each error type
 */
export const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.INVALID_CONFIG]: '配置无效，请检查您的 API 设置',
  [ErrorType.API_REQUEST_FAILED]: 'API 请求失败，请稍后重试',
  [ErrorType.API_TIMEOUT]: 'API 请求超时，请检查网络连接',
  [ErrorType.INVALID_RESPONSE]: 'API 响应格式错误，请检查模型配置',
  [ErrorType.RATE_LIMITED]: 'API 调用频率限制，请稍后再试',
  [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查您的网络',
  [ErrorType.STORAGE_ERROR]: '存储操作失败，请重试',
  [ErrorType.TWITTER_DOM_ERROR]: 'Twitter 页面元素未找到，请刷新页面',
  [ErrorType.GENERATION_FAILED]: 'AI 回复生成失败，请重试',
};

/**
 * Detailed error descriptions with troubleshooting tips
 */
export const ERROR_DESCRIPTIONS: Record<ErrorType, { description: string; tips: string[] }> = {
  [ErrorType.INVALID_CONFIG]: {
    description: 'API 配置信息不完整或格式错误',
    tips: [
      '检查 API Token 是否正确',
      '确认 API URL 格式正确',
      '验证模型名称是否存在',
    ],
  },
  [ErrorType.API_REQUEST_FAILED]: {
    description: 'API 服务器返回错误响应',
    tips: [
      '检查 API 服务是否正常',
      '确认您的账户额度充足',
      '尝试切换其他模型',
    ],
  },
  [ErrorType.API_TIMEOUT]: {
    description: 'API 请求在规定时间内未响应',
    tips: [
      '检查网络连接状态',
      '尝试使用更快的模型',
      '稍后重试',
    ],
  },
  [ErrorType.INVALID_RESPONSE]: {
    description: 'API 返回的数据格式不符合预期',
    tips: [
      '确认模型名称正确',
      '检查 API URL 是否兼容 OpenAI 格式',
      '联系 API 提供商确认服务状态',
    ],
  },
  [ErrorType.RATE_LIMITED]: {
    description: 'API 调用次数超过限制',
    tips: [
      '等待几分钟后重试',
      '检查您的 API 配额',
      '考虑升级 API 套餐',
    ],
  },
  [ErrorType.NETWORK_ERROR]: {
    description: '无法连接到 API 服务器',
    tips: [
      '检查您的网络连接',
      '确认没有防火墙拦截',
      '尝试使用 VPN（如果需要）',
    ],
  },
  [ErrorType.STORAGE_ERROR]: {
    description: '浏览器存储操作失败',
    tips: [
      '检查浏览器存储空间',
      '尝试清除扩展数据后重新配置',
      '确认浏览器权限正常',
    ],
  },
  [ErrorType.TWITTER_DOM_ERROR]: {
    description: '无法在页面中找到 Twitter 元素',
    tips: [
      '刷新 Twitter 页面',
      '确认在 twitter.com 或 x.com 域名下',
      '禁用可能冲突的其他扩展',
    ],
  },
  [ErrorType.GENERATION_FAILED]: {
    description: 'AI 回复生成过程失败',
    tips: [
      '检查原推文内容是否正常',
      '尝试选择其他回复风格',
      '确认 API 配置正确',
    ],
  },
};

/**
 * Application error with type information
 */
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.type] || this.message;
  }

  /**
   * Get detailed error information
   */
  getDetailedInfo(): { description: string; tips: string[] } {
    return ERROR_DESCRIPTIONS[this.type] || {
      description: this.message,
      tips: ['请联系开发者寻求帮助'],
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return ![
      ErrorType.INVALID_CONFIG,
      ErrorType.RATE_LIMITED,
      ErrorType.INVALID_RESPONSE,
    ].includes(this.type);
  }
}

/**
 * Error helper utilities
 */
export class ErrorHelper {
  /**
   * Format error for user display
   */
  static formatForUser(error: unknown): string {
    if (error instanceof AppError) {
      const info = error.getDetailedInfo();
      return `${error.getUserMessage()}\n\n💡 建议：\n${info.tips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}`;
    }

    if (error instanceof Error) {
      return `发生错误：${error.message}`;
    }

    return '发生未知错误，请重试';
  }

  /**
   * Check if error should show retry button
   */
  static shouldShowRetry(error: unknown): boolean {
    if (error instanceof AppError) {
      return error.isRetryable();
    }
    return true; // Default to allowing retry
  }

  /**
   * Get error icon emoji
   */
  static getErrorIcon(errorType: ErrorType): string {
    const icons: Record<ErrorType, string> = {
      [ErrorType.INVALID_CONFIG]: '⚙️',
      [ErrorType.API_REQUEST_FAILED]: '❌',
      [ErrorType.API_TIMEOUT]: '⏱️',
      [ErrorType.INVALID_RESPONSE]: '📋',
      [ErrorType.RATE_LIMITED]: '🚦',
      [ErrorType.NETWORK_ERROR]: '🌐',
      [ErrorType.STORAGE_ERROR]: '💾',
      [ErrorType.TWITTER_DOM_ERROR]: '🔍',
      [ErrorType.GENERATION_FAILED]: '🤖',
    };
    return icons[errorType] || '❌';
  }
}

// ==================== UI State ====================

/**
 * Generation status for UI feedback
 */
export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Save status for configuration
 */
export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

// ==================== Twitter DOM ====================

/**
 * Twitter/X.com data-testid selectors
 * These are used to identify elements in Twitter's DOM
 */
export const TWITTER_SELECTORS = {
  TWEET: '[data-testid="tweet"]',
  TWEET_TEXT: '[data-testid="tweetText"]',
  REPLY_BUTTON: '[data-testid="reply"]',
  REPLY_TEXTAREA: '[data-testid="tweetTextarea_0"]',
  TWEET_BUTTON: '[data-testid="tweetButtonInline"]',
  SHOW_MORE_BUTTON: '[data-testid="tweet-text-show-more-link"]',
} as const;

// ==================== Constants ====================

/**
 * Maximum reply length (Twitter limit is 280, we use 280 for full utilization)
 */
export const MAX_REPLY_LENGTH = 280;

/**
 * API request timeout in milliseconds
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Maximum retry attempts for API calls
 */
export const MAX_RETRY_ATTEMPTS = 2;

/**
 * Debounce delay for DOM operations (milliseconds)
 */
export const DOM_DEBOUNCE_DELAY = 100;

// ==================== Custom Style Constraints ====================

/**
 * Maximum number of custom styles allowed
 */
export const MAX_CUSTOM_STYLES = 10;

/**
 * Custom style validation constraints
 */
export const CUSTOM_STYLE_CONSTRAINTS = {
  NAME_MAX_LENGTH: 20,
  NAME_MIN_LENGTH: 1,
  DESCRIPTION_MAX_LENGTH: 50,
  PROMPT_MAX_LENGTH: 3000,
  PROMPT_MIN_LENGTH: 10,
  ICON_MAX_LENGTH: 4, // Support multi-char emojis
} as const;
