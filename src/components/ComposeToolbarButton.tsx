/**
 * 首页发布框工具栏中的 AI 扩写按钮组件
 *
 * 显示在 Twitter 首页发布框的工具栏中（类似表情按钮的位置）
 * 点击后将当前内容扩写为更完整的推文
 */

import { useState } from 'react';
import { Loader2, Expand } from 'lucide-react';
import { AIService } from '../services/ai-service';
import { TwitterDOM } from '../utils/twitter-dom';
import { ErrorHelper, AppError, ErrorType } from '../types';
import { Z_INDEX } from '../utils/popup-position';

interface ComposeToolbarButtonProps {
  /** 发布框元素（Draft.js contenteditable div）*/
  composeBox: HTMLElement;
}

export function ComposeToolbarButton({ composeBox }: ComposeToolbarButtonProps) {
  const [isExpanding, setIsExpanding] = useState(false);
  const [lastError, setLastError] = useState<AppError | null>(null);

  const handleExpandClick = async () => {
    if (isExpanding) return;

    // 获取当前发布框中的文本
    const currentText = TwitterDOM.getComposeText();
    
    // 如果发布框为空，则不处理
    if (!currentText.trim()) {
      showSimpleErrorToast('请先输入一些内容作为扩写的种子');
      return;
    }

    setIsExpanding(true);
    setLastError(null);

    try {
      console.log(`[AI Compose Toolbar] 开始内容扩写，种子: "${currentText}"`);

      // 生成扩写内容 - 使用expandContent方法
      const expandedContent = await AIService.expandContent('', currentText);

      console.log(`[AI Compose Toolbar] 内容扩写成功: "${expandedContent}"`);

      // 替换扩写内容（完全替换原有内容）
      try {
        TwitterDOM.replaceReplyText(composeBox, expandedContent);
        console.log('[AI Compose Toolbar] 扩写内容已替换到输入框');
      } catch (fillError) {
        console.error('[AI Compose Toolbar] 替换失败:', fillError);
        throw new AppError(
          ErrorType.TWITTER_DOM_ERROR,
          'Failed to replace expanded content into Twitter compose box',
          fillError
        );
      }

      // 聚焦输入框
      composeBox.focus();

      // 显示成功提示
      showSuccessToast('✅ 内容已扩写！');
    } catch (err: unknown) {
      console.error('[AI Compose Toolbar] 扩写失败:', err);

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
          'Unknown error occurred during expansion',
          err
        );
        setLastError(appError);
        showDetailedErrorToast(appError);
      }
    } finally {
      setIsExpanding(false);
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

  // 简单的错误提示
  const showSimpleErrorToast = (message: string) => {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: '#f4212e',
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
            id="ai-compose-retry-btn"
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
      const retryBtn = toast.querySelector('#ai-compose-retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          toast.remove();
          handleExpandClick();
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
      {/* 扩写按钮 - 模仿 Twitter 工具栏按钮样式 */}
      <button
        onClick={handleExpandClick}
        disabled={isExpanding}
        className="twitter-compose-ai-button"
        title="内容扩写"
        aria-label="内容扩写"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34.75px',
          height: '34.75px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#1d9bf0',
          cursor: isExpanding ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s, color 0.2s',
          fontSize: '17.5px',
          padding: 0,
          opacity: isExpanding ? 0.38 : 1,
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isExpanding) {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            e.currentTarget.style.color = '#1d9bf0';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#1d9bf0'; // 修复：保持蓝色，不要变成灰色
        }}
      >
        {isExpanding ? (
          <Loader2 size={18.75} style={{
            animation: 'spin 1s linear infinite',
          }} />
        ) : (
          <Expand size={18.75} />
        )}
      </button>
    </div>
  );
}