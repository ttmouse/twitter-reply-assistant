/**
 * AI Service
 *
 * Handles communication with AI APIs to generate Twitter replies
 * Supports multiple providers with OpenAI-compatible API format
 */

import axios, { AxiosError } from 'axios';
import type {
  AIConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ReplyStyle,
} from '../types';
import {
  MAX_REPLY_LENGTH,
  API_TIMEOUT,
  MAX_RETRY_ATTEMPTS,
  ErrorType,
  AppError,
} from '../types';
import { StorageService } from './storage-service';

/**
 * AI Service class
 * Provides methods to generate AI-powered replies
 */
export class AIService {
  /**
   * Generate a reply for a tweet
   * @param tweetText - The text content of the tweet to reply to
   * @param styleId - The reply style to use (preset or custom style ID)
   * @returns Promise<string> - Generated reply text
   */
  static async generateReply(
    tweetText: string,
    styleId: string
  ): Promise<string> {
    return this.generateReplyWithConfig(tweetText, styleId, null);
  }

  /**
   * Generate a reply for a tweet with specific config
   * @param tweetText - The text content of the tweet to reply to
   * @param styleId - The reply style to use (preset or custom style ID)
   * @param config - AI configuration to use (if null, load from storage)
   * @returns Promise<string> - Generated reply text
   */
  static async generateReplyWithConfig(
    tweetText: string,
    styleId: string,
    config: AIConfig | null
  ): Promise<string> {
    console.log('[AI Service] 开始生成回复...', { styleId, tweetLength: tweetText.length });

    // Use provided config or load from storage
    const finalConfig = config || await StorageService.getAIConfig();

    if (!finalConfig) {
      console.error('[AI Service] 未找到 API 配置');
      throw new AppError(
        ErrorType.INVALID_CONFIG,
        'AI configuration not found. Please configure the extension first.'
      );
    }

    // Get all styles (preset + custom)
    const allStyles = await StorageService.getAllStyles();
    const style = allStyles.find((s) => s.id === styleId);

    if (!style) {
      console.error('[AI Service] 无效的回复风格:', styleId);
      throw new AppError(
        ErrorType.INVALID_CONFIG,
        `Invalid style ID: ${styleId}`
      );
    }

    console.log('[AI Service] 使用回复风格:', style.name);

    // Generate reply with retry logic
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`[AI Service] 🔄 第 ${attempt} 次重试...`);
        }

        const reply = await this.callAIAPI(finalConfig, tweetText, style);

        console.log('[AI Service] ✅ 回复生成成功:', {
          length: reply.length,
          attempts: attempt + 1
        });

        return reply;
      } catch (error) {
        lastError = error as Error;

        console.warn(`[AI Service] ❌ 生成失败 (尝试 ${attempt + 1}/${MAX_RETRY_ATTEMPTS + 1}):`,
          error instanceof AppError ? error.getUserMessage() : (error as Error).message
        );

        // Don't retry on certain errors
        if (error instanceof AppError && !error.isRetryable()) {
          console.error('[AI Service] 错误不可重试:', error.type);
          throw error;
        }

        // Wait before retry (exponential backoff)
        if (attempt < MAX_RETRY_ATTEMPTS) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s
          console.log(`[AI Service] ⏱️ 等待 ${delay}ms 后重试...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    console.error('[AI Service] 所有重试均失败');

    // Wrap in GENERATION_FAILED error for better user feedback
    if (lastError instanceof AppError) {
      throw lastError;
    }

    throw new AppError(
      ErrorType.GENERATION_FAILED,
      'Failed to generate reply after multiple attempts',
      lastError
    );
  }

  /**
   * Call AI API to generate reply
   * @param config - AI configuration
   * @param tweetText - Tweet text to reply to
   * @param style - Reply style configuration
   * @returns Promise<string> - Generated reply
   */
  private static async callAIAPI(
    config: AIConfig,
    tweetText: string,
    style: ReplyStyle
  ): Promise<string> {
    // Build the request
    const request: ChatCompletionRequest = {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(style),
        },
        {
          role: 'user',
          content: this.buildUserPrompt(tweetText),
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    };

    try {
      // Make API call
      const response = await axios.post<ChatCompletionResponse>(
        config.apiUrl,
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiToken}`,
          },
          timeout: API_TIMEOUT,
        }
      );

      // Extract reply from response
      const reply = this.extractReply(response.data);

      // Truncate if needed
      return this.truncateReply(reply);
    } catch (error) {
      throw this.handleAPIError(error);
    }
  }

  /**
   * Build system prompt with style guidance
   * @param style - Reply style
   * @returns string - System prompt
   */
  private static buildSystemPrompt(style: ReplyStyle): string {
    return `${style.systemPrompt}

重要要求：
1. 回复必须简短，最多 ${MAX_REPLY_LENGTH} 个字符
2. 使用中文回复（除非原推文是英文）
3. 回复要自然、贴合上下文
4. 不要使用 hashtag 或 @mention
5. 避免过度正式或生硬`;
  }

  /**
   * Build user prompt with tweet content
   * @param tweetText - Tweet text
   * @returns string - User prompt
   */
  private static buildUserPrompt(tweetText: string): string {
    return `请为以下推文生成一条回复：

推文内容：
${tweetText}

要求：简短（最多 ${MAX_REPLY_LENGTH} 字符）、自然、贴合语境。`;
  }

  /**
   * Extract reply text from API response
   * @param response - API response
   * @returns string - Reply text
   */
  private static extractReply(response: ChatCompletionResponse): string {
    if (!response.choices || response.choices.length === 0) {
      throw new AppError(
        ErrorType.INVALID_RESPONSE,
        'No choices in API response'
      );
    }

    const message = response.choices[0].message;

    if (!message || !message.content) {
      throw new AppError(
        ErrorType.INVALID_RESPONSE,
        'No content in API response'
      );
    }

    return message.content.trim();
  }

  /**
   * Truncate reply to maximum length
   * @param reply - Reply text
   * @returns string - Truncated reply
   */
  private static truncateReply(reply: string): string {
    if (reply.length <= MAX_REPLY_LENGTH) {
      return reply;
    }

    // Truncate at sentence boundary if possible
    const truncated = reply.substring(0, MAX_REPLY_LENGTH - 3);
    const lastPeriod = truncated.lastIndexOf('。');
    const lastExclamation = truncated.lastIndexOf('！');
    const lastQuestion = truncated.lastIndexOf('？');

    const lastPunctuation = Math.max(
      lastPeriod,
      lastExclamation,
      lastQuestion
    );

    if (lastPunctuation > MAX_REPLY_LENGTH * 0.7) {
      // If punctuation is in the last 30%, use it
      return truncated.substring(0, lastPunctuation + 1);
    }

    // Otherwise just truncate with ellipsis
    return truncated + '...';
  }

  /**
   * Handle API errors and convert to AppError
   * @param error - Error from API call
   * @returns AppError
   */
  private static handleAPIError(error: unknown): AppError {
    console.error('[AI Service] API 错误:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Network error
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED') {
          console.error('[AI Service] 请求超时');
          return new AppError(
            ErrorType.API_TIMEOUT,
            `API request timed out after ${API_TIMEOUT / 1000}s. Please try again.`,
            error
          );
        }

        if (axiosError.code === 'ERR_NETWORK') {
          console.error('[AI Service] 网络错误');
          return new AppError(
            ErrorType.NETWORK_ERROR,
            'Network error. Please check your internet connection.',
            error
          );
        }

        console.error('[AI Service] 未知网络错误:', axiosError.code);
        return new AppError(
          ErrorType.NETWORK_ERROR,
          'Unable to connect to API server. Please check your network.',
          error
        );
      }

      // HTTP error
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      console.error(`[AI Service] HTTP ${status} 错误:`, data);

      switch (status) {
        case 401:
          return new AppError(
            ErrorType.INVALID_CONFIG,
            'Invalid API token. Please check your API configuration.',
            { error, data }
          );

        case 403:
          return new AppError(
            ErrorType.INVALID_CONFIG,
            'Access forbidden. Please verify your API token has the necessary permissions.',
            { error, data }
          );

        case 429:
          // Extract rate limit info if available
          const retryAfter = axiosError.response.headers['retry-after'];
          const rateLimitMessage = retryAfter
            ? `Rate limit exceeded. Please retry after ${retryAfter} seconds.`
            : 'Rate limit exceeded. Please wait a few minutes and try again.';

          return new AppError(
            ErrorType.RATE_LIMITED,
            rateLimitMessage,
            { error, data, retryAfter }
          );

        case 400:
          // Try to extract more specific error message
          let badRequestMessage = 'Invalid request. Please check your model configuration.';
          if (data && typeof data === 'object' && 'error' in data) {
            const errorData = data as any;
            if (errorData.error?.message) {
              badRequestMessage = `Invalid request: ${errorData.error.message}`;
            }
          }

          return new AppError(
            ErrorType.INVALID_RESPONSE,
            badRequestMessage,
            { error, data }
          );

        case 404:
          return new AppError(
            ErrorType.INVALID_CONFIG,
            'API endpoint not found. Please check your API URL configuration.',
            { error, data }
          );

        case 500:
        case 502:
        case 503:
        case 504:
          return new AppError(
            ErrorType.API_REQUEST_FAILED,
            `API server error (${status}). The service may be temporarily unavailable. Please try again later.`,
            { error, data }
          );

        default:
          return new AppError(
            ErrorType.API_REQUEST_FAILED,
            `API request failed with status ${status}. Please check your configuration.`,
            { error, data }
          );
      }
    }

    // Unknown error
    console.error('[AI Service] 未知错误类型:', error);

    if (error instanceof Error) {
      return new AppError(
        ErrorType.API_REQUEST_FAILED,
        `An unexpected error occurred: ${error.message}`,
        error
      );
    }

    return new AppError(
      ErrorType.API_REQUEST_FAILED,
      'An unexpected error occurred. Please try again.',
      error
    );
  }

  /**
   * Sleep utility for retry delays
   * @param ms - Milliseconds to sleep
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Test API configuration
   * Sends a simple test request to verify the API is working
   * @param config - AI configuration to test
   * @returns Promise<{success: boolean, error?: string}>
   */
  static async testConfig(
    config: AIConfig
  ): Promise<{ success: boolean; error?: string; latency?: number }> {
    const startTime = Date.now();

    const testRequest: ChatCompletionRequest = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: 'Say "OK" if you can read this.',
        },
      ],
      max_tokens: 10,
      temperature: 0.5,
    };

    try {
      const response = await axios.post<ChatCompletionResponse>(
        config.apiUrl,
        testRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiToken}`,
          },
          timeout: 10000, // 10s timeout for test
        }
      );

      const latency = Date.now() - startTime;

      // Check if we got a valid response
      if (response.data.choices && response.data.choices.length > 0) {
        return { success: true, latency };
      }

      return {
        success: false,
        error: 'Invalid response from API',
      };
    } catch (error) {
      const appError = this.handleAPIError(error);
      return {
        success: false,
        error: appError.message,
      };
    }
  }
}
