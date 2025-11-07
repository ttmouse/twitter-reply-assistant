/**
 * 悬浮按钮组件
 * 
 * 在页面右侧添加一个悬浮按钮，作为扩展功能的备选入口
 */

import React, { useState, useEffect } from 'react';
import { Bot, X, ChevronDown } from 'lucide-react';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { TwitterDOM } from '../utils/twitter-dom';

// 防抖函数
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

interface FloatingButtonProps {
  // 可以在这里添加额外的属性
}

/**
 * 悬浮按钮组件
 */
export const FloatingButton: React.FC<FloatingButtonProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [composeBox, setComposeBox] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let lastCheckTime = 0;
    const checkInterval = 1000; // 1秒检查间隔
    const checkCooldown = 500; // 500ms冷却时间，避免频繁检查
    
    // 检查是否有发布框
    const checkComposeBox = () => {
      const now = Date.now();
      
      // 添加冷却时间，避免频繁检查
      if (now - lastCheckTime < checkCooldown) {
        return;
      }
      
      lastCheckTime = now;
      
      const box = TwitterDOM.getComposeTextarea();
      const isActive = TwitterDOM.isComposeDialogActive();
      setComposeBox(box);
      
      // 只有当输入框存在且处于激活状态时才显示悬浮按钮
      // 适应Twitter首页直接激活输入框的交互方式
      const shouldShow = !!box && (isActive || TwitterDOM.isOnHomePage());
      setShow(shouldShow);
    };

    // 初始检查
    checkComposeBox();

    // 定期检查
    const interval = setInterval(checkComposeBox, checkInterval);

    // 监听DOM变化，但添加防抖
    const debouncedCheck = debounce(checkComposeBox, 300);
    const observer = new MutationObserver(debouncedCheck);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // 如果没有发布框，不显示悬浮按钮
  if (!show) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '80px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
      }}
    >
      {/* 展开的内容面板 */}
      {isOpen && (
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: '16px',
            minWidth: '280px',
            maxWidth: '320px',
            border: '1px solid #e1e8ed',
            animation: 'slideInUp 0.3s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: '600',
                color: '#14171a',
              }}
            >
              AI 扩写助手
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color="#657786" />
            </button>
          </div>

          {composeBox && (
            <div>
              <p
                style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#536471',
                }}
              >
                选择扩写风格，AI将帮您扩写发布框中的文本：
              </p>
              <div
                style={{
                  // 渲染ComposeToolbarButton组件，但简化样式
                }}
              >
                <ComposeToolbarButton composeBox={composeBox} />
              </div>
            </div>
          )}

          {!composeBox && (
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#536471',
              }}
            >
              请先打开发布框，然后使用此功能。
            </p>
          )}
        </div>
      )}

      {/* 主按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isOpen ? '#1DA1F2' : '#1DA1F2',
          border: 'none',
          boxShadow: '0 4px 12px rgba(29, 161, 242, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isOpen ? (
          <X size={24} color="white" />
        ) : (
          <Bot size={24} color="white" />
        )}
      </button>

      {/* 添加动画样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `,
        }}
      />
    </div>
  );
};