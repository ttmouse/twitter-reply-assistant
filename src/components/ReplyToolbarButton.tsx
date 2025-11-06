/**
 * 回复框工具栏中的 AI 按钮组件
 *
 * 显示在 Twitter 回复框的工具栏中（类似表情按钮的位置）
 * 点击后显示风格选择器，选择风格后生成回复
 */

import React, { useState, useRef } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { StyleSelector } from './StyleSelector';
import { AIService } from '../services/ai-service';
import { TwitterDOM } from '../utils/twitter-dom';
import { ErrorHelper, AppError, ErrorType } from '../types';
import { Z_INDEX } from '../utils/popup-position';

interface ReplyToolbarButtonProps {
  /** 推文文本内容 */
  tweetText: string;
  /** 回复框元素（Draft.js contenteditable div）*/
  replyBox: HTMLElement;
}

export function ReplyToolbarButton({ tweetText, replyBox }: ReplyToolbarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<AppError | null>(null);
  const [lastStyleId, setLastStyleId] = useState<string | null>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = () => {
    if (isLoading) return;

    // 获取按钮位置信息
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }

    setIsOpen(!isOpen);
  };

  const handleSelectStyle = async (styleId: string) => {
    setIsLoading(true);
    setIsOpen(false);
    setLastStyleId(styleId);
    setLastError(null);

    try {
      console.log(`[AI Reply Toolbar] 开始生成回复，风格: ${styleId}`);

      // 生成回复
      const reply = await AIService.generateReply(tweetText, styleId);

      console.log(`[AI Reply Toolbar] 回复生成成功: "${reply}"`);

      // 填充回复
      try {
        TwitterDOM.fillReplyText(replyBox, reply);
        console.log('[AI Reply Toolbar] 回复已填充到输入框');
      } catch (fillError) {
        console.error('[AI Reply Toolbar] 填充失败:', fillError);
        throw new AppError(
          ErrorType.TWITTER_DOM_ERROR,
          'Failed to fill reply text into Twitter input box',
          fillError
        );
      }

      // 聚焦输入框
      replyBox.focus();

      // 显示成功提示
      showSuccessToast('✅ 回复已生成！');
    } catch (err: unknown) {
      console.error('[AI Reply Toolbar] 生成失败:', err);

      // Store error for potential retry
      if (err instanceof AppError) {
        setLastError(err);
        showDetailedErrorToast(err);
      } else if (err instanceof Error) {
        const appError = new AppError(
          ErrorType.GENERATION_FAILED,
          err.message,
          err
        );
        setLastError(appError);
        showDetailedErrorToast(appError);
      } else {
        const appError = new AppError(
          ErrorType.GENERATION_FAILED,
          'Unknown error occurred',
          err
        );
        setLastError(appError);
        showDetailedErrorToast(appError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 重试上次失败的操作
  const handleRetry = () => {
    if (lastStyleId && !isLoading) {
      handleSelectStyle(lastStyleId);
    }
  };

  // 简单的成功提示
  const showSuccessToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#00ba7c',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: Z_INDEX.NOTIFICATION,
      fontSize: '14px',
      fontWeight: '600',
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // 详细的错误提示（带重试按钮）
  const showDetailedErrorToast = (error: AppError) => {
    const toast = document.createElement('div');
    const errorIcon = ErrorHelper.getErrorIcon(error.type);
    const userMessage = error.getUserMessage();
    const info = error.getDetailedInfo();
    const canRetry = ErrorHelper.shouldShowRetry(error);

    // Create toast container
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#f4212e',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      zIndex: Z_INDEX.NOTIFICATION,
      fontSize: '13px',
      maxWidth: '350px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    });

    // Build content
    let content = `
      <div style="display: flex; align-items: start; gap: 8px;">
        <span style="font-size: 20px;">${errorIcon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 6px;">${userMessage}</div>
          <div style="font-size: 12px; opacity: 0.9; line-height: 1.4;">
            ${info.tips.slice(0, 2).map(tip => `• ${tip}`).join('<br>')}
          </div>
    `;

    // Add retry button if retryable
    if (canRetry) {
      content += `
          <button
            id="ai-reply-retry-btn"
            style="
              margin-top: 10px;
              padding: 6px 12px;
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.3);
              border-radius: 6px;
              color: white;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.2s;
            "
            onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'"
            onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'"
          >
            🔄 重试
          </button>
      `;
    }

    content += `
        </div>
      </div>
    `;

    toast.innerHTML = content;
    document.body.appendChild(toast);

    // Add retry click handler
    if (canRetry) {
      const retryBtn = toast.querySelector('#ai-reply-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          toast.remove();
          handleRetry();
        });
      }
    }

    // Auto remove after 8 seconds
    setTimeout(() => {
      toast.remove();
    }, 8000);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* AI 按钮 - 模仿 Twitter 工具栏按钮样式 */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={isLoading}
        className="twitter-ai-toolbar-button"
        title="AI 智能回复"
        aria-label="AI 智能回复"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34.75px',
          height: '34.75px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: isOpen ? 'rgba(29, 155, 240, 0.1)' : 'transparent',
          color: isOpen ? '#1d9bf0' : '#1d9bf0',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s, color 0.2s',
          fontSize: '17.5px',
          padding: 0,
          opacity: isLoading ? 0.38 : 1,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            e.currentTarget.style.color = '#1d9bf0';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#536471';
          }
        }}
      >
        {isLoading ? (
          <Loader2 size={18.75} style={{
            animation: 'spin 1s linear infinite',
          }} />
        ) : (
          <Bot size={18.75} />
        )}
      </button>

      {/* 风格选择器 - 使用 Portal 渲染到 body */}
      {buttonRect && (
        <StyleSelector
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelectStyle={handleSelectStyle}
          isLoading={isLoading}
          buttonRect={buttonRect}
        />
      )}
    </div>
  );
}
