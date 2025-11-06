/**
 * Storage Service
 *
 * Type-safe wrapper for Chrome storage API
 * Handles all data persistence for the extension
 */

import type { AIConfig, CustomReplyStyle, ReplyStyle } from '../types';
import {
  StorageKey,
  ErrorType,
  AppError,
  REPLY_STYLES,
  MAX_CUSTOM_STYLES,
  CUSTOM_STYLE_CONSTRAINTS,
} from '../types';

/**
 * Storage service class
 * Wraps chrome.storage.sync API with type safety and error handling
 */
export class StorageService {
  /**
   * Get AI configuration from storage
   * @returns Promise<AIConfig | null> - Configuration or null if not set
   */
  static async getAIConfig(): Promise<AIConfig | null> {
    try {
      const result = await chrome.storage.sync.get(StorageKey.AI_CONFIG);
      const config = result[StorageKey.AI_CONFIG];

      if (!config) {
        return null;
      }

      // Validate the stored config
      if (!this.isValidAIConfig(config)) {
        console.warn('Invalid AI config in storage, returning null');
        return null;
      }

      return config as AIConfig;
    } catch (error) {
      console.error('Failed to get AI config:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to retrieve configuration',
        error
      );
    }
  }

  /**
   * Save AI configuration to storage
   * @param config - AI configuration to save
   */
  static async setAIConfig(config: AIConfig): Promise<void> {
    try {
      // Validate config before saving
      if (!this.isValidAIConfig(config)) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          'Invalid configuration provided'
        );
      }

      await chrome.storage.sync.set({
        [StorageKey.AI_CONFIG]: config,
      });

      console.log('AI config saved successfully');
    } catch (error) {
      console.error('Failed to save AI config:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to save configuration',
        error
      );
    }
  }

  /**
   * Check if AI configuration exists
   * @returns Promise<boolean> - True if config exists and is valid
   */
  static async hasAIConfig(): Promise<boolean> {
    const config = await this.getAIConfig();
    return config !== null;
  }

  /**
   * Clear AI configuration
   */
  static async clearAIConfig(): Promise<void> {
    try {
      await chrome.storage.sync.remove(StorageKey.AI_CONFIG as string);
      console.log('AI config cleared');
    } catch (error) {
      console.error('Failed to clear AI config:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to clear configuration',
        error
      );
    }
  }

  /**
   * Get all stored data (for debugging)
   * @returns Promise<Record<string, any>>
   */
  static async getAll(): Promise<Record<string, any>> {
    try {
      return await chrome.storage.sync.get(null);
    } catch (error) {
      console.error('Failed to get all storage:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to retrieve storage data',
        error
      );
    }
  }

  /**
   * Clear all stored data (use with caution!)
   */
  static async clearAll(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
      console.log('All storage cleared');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to clear storage',
        error
      );
    }
  }

  /**
   * Get storage usage information
   * @returns Promise<{bytesInUse: number, quota: number}>
   */
  static async getStorageInfo(): Promise<{
    bytesInUse: number;
    quota: number;
    percentUsed: number;
  }> {
    try {
      const bytesInUse = await chrome.storage.sync.getBytesInUse(null);
      const quota = chrome.storage.sync.QUOTA_BYTES;
      const percentUsed = (bytesInUse / quota) * 100;

      return {
        bytesInUse,
        quota,
        percentUsed: Math.round(percentUsed * 100) / 100,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to get storage information',
        error
      );
    }
  }

  /**
   * Validate AI configuration object
   * @param config - Configuration to validate
   * @returns boolean - True if valid
   */
  private static isValidAIConfig(config: any): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const required = ['provider', 'apiUrl', 'apiToken', 'model'];

    for (const key of required) {
      if (!(key in config) || typeof config[key] !== 'string') {
        return false;
      }

      // Check for empty strings
      if (config[key].trim() === '') {
        return false;
      }
    }

    // Validate provider value
    const validProviders = ['siliconflow', 'deepseek', 'glm', 'custom'];
    if (!validProviders.includes(config.provider)) {
      return false;
    }

    // Validate URL format
    try {
      new URL(config.apiUrl);
    } catch {
      return false;
    }

    return true;
  }

  /**
   * Listen for storage changes
   * @param callback - Function to call when storage changes
   * @returns Unsubscribe function
   */
  static onConfigChange(
    callback: (config: AIConfig | null) => void
  ): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== 'sync') return;

      if (StorageKey.AI_CONFIG in changes) {
        const newValue = changes[StorageKey.AI_CONFIG].newValue;
        callback(newValue || null);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }

  // ==================== Custom Styles Management ====================

  /**
   * Check if chrome extension context is valid
   * @returns boolean
   */
  private static isExtensionContextValid(): boolean {
    try {
      return !!(chrome && chrome.storage && chrome.runtime && chrome.runtime.id);
    } catch {
      return false;
    }
  }

  /**
   * Get all custom styles from storage
   * @returns Promise<CustomReplyStyle[]> - Array of custom styles
   */
  static async getCustomStyles(): Promise<CustomReplyStyle[]> {
    try {
      // Check extension context first
      if (!this.isExtensionContextValid()) {
        console.warn('Extension context invalidated, returning empty custom styles');
        return [];
      }

      const result = await chrome.storage.sync.get(StorageKey.CUSTOM_STYLES);
      const styles = result[StorageKey.CUSTOM_STYLES];

      if (!styles || !Array.isArray(styles)) {
        return [];
      }

      // Validate and filter valid styles
      const validStyles = styles.filter((style) =>
        this.isValidCustomStyle(style)
      );

      // Sort by creation date (newest first)
      return validStyles.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      // Check if it's extension context invalidation error
      if (error instanceof Error && error.message.includes('Extension context invalidated')) {
        console.warn('Extension context invalidated during getCustomStyles, returning empty array');
        return [];
      }

      console.error('Failed to get custom styles:', error);
      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to retrieve custom styles',
        error
      );
    }
  }

  /**
   * Save a new custom style
   * @param styleData - Style data (without id, createdAt, updatedAt)
   * @returns Promise<CustomReplyStyle> - The saved style with generated id
   */
  static async saveCustomStyle(
    styleData: Omit<CustomReplyStyle, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CustomReplyStyle> {
    try {
      // Get existing styles
      const existingStyles = await this.getCustomStyles();

      // Check limit
      if (existingStyles.length >= MAX_CUSTOM_STYLES) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          `Maximum ${MAX_CUSTOM_STYLES} custom styles allowed`
        );
      }

      // Validate style data
      const validation = ConfigValidator.validateCustomStyle(styleData);
      if (!validation.valid) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          `Invalid custom style: ${validation.errors.join(', ')}`
        );
      }

      // Create new style with generated id and timestamps
      const now = Date.now();
      const newStyle: CustomReplyStyle = {
        ...styleData,
        id: `custom_${now}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      // Save to storage
      const updatedStyles = [...existingStyles, newStyle];
      await chrome.storage.sync.set({
        [StorageKey.CUSTOM_STYLES]: updatedStyles,
      });

      console.log('Custom style saved:', newStyle.id);
      return newStyle;
    } catch (error) {
      console.error('Failed to save custom style:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to save custom style',
        error
      );
    }
  }

  /**
   * Update an existing custom style
   * @param id - Style ID to update
   * @param updates - Partial style data to update
   */
  static async updateCustomStyle(
    id: string,
    updates: Partial<Omit<CustomReplyStyle, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<void> {
    try {
      const existingStyles = await this.getCustomStyles();
      const styleIndex = existingStyles.findIndex((s) => s.id === id);

      if (styleIndex === -1) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          `Custom style not found: ${id}`
        );
      }

      // Merge updates
      const updatedStyle: CustomReplyStyle = {
        ...existingStyles[styleIndex],
        ...updates,
        updatedAt: Date.now(),
      };

      // Validate updated style
      const validation = ConfigValidator.validateCustomStyle(updatedStyle);
      if (!validation.valid) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          `Invalid custom style: ${validation.errors.join(', ')}`
        );
      }

      // Update in array
      existingStyles[styleIndex] = updatedStyle;

      // Save to storage
      await chrome.storage.sync.set({
        [StorageKey.CUSTOM_STYLES]: existingStyles,
      });

      console.log('Custom style updated:', id);
    } catch (error) {
      console.error('Failed to update custom style:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to update custom style',
        error
      );
    }
  }

  /**
   * Delete a custom style
   * @param id - Style ID to delete
   */
  static async deleteCustomStyle(id: string): Promise<void> {
    try {
      const existingStyles = await this.getCustomStyles();
      const filteredStyles = existingStyles.filter((s) => s.id !== id);

      if (filteredStyles.length === existingStyles.length) {
        throw new AppError(
          ErrorType.INVALID_CONFIG,
          `Custom style not found: ${id}`
        );
      }

      await chrome.storage.sync.set({
        [StorageKey.CUSTOM_STYLES]: filteredStyles,
      });

      console.log('Custom style deleted:', id);
    } catch (error) {
      console.error('Failed to delete custom style:', error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        ErrorType.STORAGE_ERROR,
        'Failed to delete custom style',
        error
      );
    }
  }

  /**
   * Get all styles (preset + custom)
   * @returns Promise<ReplyStyle[]> - All available styles
   */
  static async getAllStyles(): Promise<ReplyStyle[]> {
    try {
      const customStyles = await this.getCustomStyles();
      // Combine preset styles with custom styles
      return [...REPLY_STYLES, ...customStyles];
    } catch (error) {
      console.error('Failed to get all styles:', error);
      // If custom styles fail to load, return only preset styles
      return REPLY_STYLES;
    }
  }

  /**
   * Validate custom style object
   * @param style - Style to validate
   * @returns boolean - True if valid
   */
  private static isValidCustomStyle(style: any): boolean {
    if (!style || typeof style !== 'object') {
      return false;
    }

    const required = [
      'id',
      'name',
      'icon',
      'description',
      'systemPrompt',
      'createdAt',
      'updatedAt',
    ];

    for (const key of required) {
      if (!(key in style)) {
        return false;
      }
    }

    // Type checks
    if (typeof style.id !== 'string') return false;
    if (typeof style.name !== 'string') return false;
    if (typeof style.icon !== 'string') return false;
    if (typeof style.description !== 'string') return false;
    if (typeof style.systemPrompt !== 'string') return false;
    if (typeof style.createdAt !== 'number') return false;
    if (typeof style.updatedAt !== 'number') return false;

    return true;
  }
}

/**
 * Validation utilities
 */
export class ConfigValidator {
  /**
   * Validate API URL format
   * @param url - URL to validate
   * @returns {valid: boolean, error?: string}
   */
  static validateApiUrl(url: string): { valid: boolean; error?: string } {
    if (!url || url.trim() === '') {
      return { valid: false, error: 'API URL is required' };
    }

    try {
      const parsed = new URL(url);

      // Enforce HTTPS for security
      if (parsed.protocol !== 'https:') {
        return { valid: false, error: 'API URL must use HTTPS' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validate API token
   * @param token - Token to validate
   * @returns {valid: boolean, error?: string}
   */
  static validateApiToken(token: string): { valid: boolean; error?: string } {
    if (!token || token.trim() === '') {
      return { valid: false, error: 'API Token is required' };
    }

    // Basic length check (most API tokens are at least 20 chars)
    if (token.length < 10) {
      return { valid: false, error: 'API Token seems too short' };
    }

    return { valid: true };
  }

  /**
   * Validate model name
   * @param model - Model name to validate
   * @returns {valid: boolean, error?: string}
   */
  static validateModel(model: string): { valid: boolean; error?: string } {
    if (!model || model.trim() === '') {
      return { valid: false, error: 'Model name is required' };
    }

    return { valid: true };
  }

  /**
   * Validate complete AI configuration
   * @param config - Configuration to validate
   * @returns {valid: boolean, errors: string[]}
   */
  static validateConfig(config: AIConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const urlResult = this.validateApiUrl(config.apiUrl);
    if (!urlResult.valid) {
      errors.push(urlResult.error!);
    }

    const tokenResult = this.validateApiToken(config.apiToken);
    if (!tokenResult.valid) {
      errors.push(tokenResult.error!);
    }

    const modelResult = this.validateModel(config.model);
    if (!modelResult.valid) {
      errors.push(modelResult.error!);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate custom style data
   * @param style - Custom style to validate
   * @returns {valid: boolean, errors: string[]}
   */
  static validateCustomStyle(
    style: Partial<CustomReplyStyle> | Omit<CustomReplyStyle, 'id' | 'createdAt' | 'updatedAt'>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate name
    if (!style.name || typeof style.name !== 'string') {
      errors.push('风格名称不能为空');
    } else {
      const trimmedName = style.name.trim();
      if (trimmedName.length < CUSTOM_STYLE_CONSTRAINTS.NAME_MIN_LENGTH) {
        errors.push('风格名称不能为空');
      } else if (trimmedName.length > CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH) {
        errors.push(`风格名称不能超过 ${CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH} 个字符`);
      }
    }

    // Validate icon
    if (!style.icon || typeof style.icon !== 'string') {
      errors.push('图标不能为空');
    } else {
      const trimmedIcon = style.icon.trim();
      if (trimmedIcon.length === 0) {
        errors.push('图标不能为空');
      } else if (trimmedIcon.length > CUSTOM_STYLE_CONSTRAINTS.ICON_MAX_LENGTH) {
        errors.push(`图标不能超过 ${CUSTOM_STYLE_CONSTRAINTS.ICON_MAX_LENGTH} 个字符`);
      }
    }

    // Validate description (optional)
    if (style.description && typeof style.description === 'string') {
      const trimmedDesc = style.description.trim();
      if (trimmedDesc.length > 0 && trimmedDesc.length > CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
        errors.push(`描述不能超过 ${CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} 个字符`);
      }
    }

    // Validate system prompt
    if (!style.systemPrompt || typeof style.systemPrompt !== 'string') {
      errors.push('系统提示词不能为空');
    } else {
      const trimmedPrompt = style.systemPrompt.trim();
      if (trimmedPrompt.length < CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH) {
        errors.push(`系统提示词至少需要 ${CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH} 个字符`);
      } else if (trimmedPrompt.length > CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH) {
        errors.push(`系统提示词不能超过 ${CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH} 个字符`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
