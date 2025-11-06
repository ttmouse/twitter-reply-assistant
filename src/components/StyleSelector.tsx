/**
 * 风格选择器组件
 *
 * 使用 Twitter 原生菜单样式显示回复风格
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bot, Brain, Sparkles, MessageCircle } from 'lucide-react';
import type { ReplyStyle } from '../types';
import { REPLY_STYLES } from '../types';
import { StorageService } from '../services/storage-service';

interface StyleSelectorProps {
  /** 选择风格时的回调 */
  onSelectStyle: (styleId: string) => void;
  /** 是否显示 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 是否正在加载 */
  isLoading?: boolean;
  /** 按钮位置信息 */
  buttonRect?: DOMRect;
}

export function StyleSelector({
  onSelectStyle,
  isOpen,
  onClose,
  isLoading = false,
  buttonRect,
}: StyleSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allStyles, setAllStyles] = useState<ReplyStyle[]>(REPLY_STYLES);

  // 加载所有风格（预设 + 自定义）
  useEffect(() => {
    const loadStyles = async () => {
      try {
        const styles = await StorageService.getAllStyles();
        setAllStyles(styles);
      } catch (error) {
        console.error('Failed to load styles:', error);
        // 如果加载失败，使用默认预设风格
        setAllStyles(REPLY_STYLES);
      }
    };

    loadStyles();
  }, [isOpen]); // 每次打开时重新加载，确保显示最新的自定义风格

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // 延迟添加监听器，避免立即触发
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStyleClick = (styleId: string) => {
    if (isLoading) return;
    onSelectStyle(styleId);
  };

  // 计算菜单位置
  const getMenuPosition = () => {
    if (!buttonRect) {
      return {
        top: '0px',
        left: '40px',
      };
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // 菜单显示在按钮右侧，确保不被视口边缘裁剪
    const menuWidth = 230;
    const menuHeight = 400;

    let left = buttonRect.right + 4; // 按钮右边 + 4px间距
    let top = buttonRect.top;

    // 如果右侧空间不足，显示在左侧
    if (left + menuWidth > window.innerWidth + scrollLeft) {
      left = buttonRect.left - menuWidth - 4;
    }

    // 如果下方空间不足，向上调整
    if (top + menuHeight > window.innerHeight + scrollTop) {
      top = window.innerHeight + scrollTop - menuHeight - 20;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // 分离预设风格和自定义风格
  const presetStyles = allStyles.filter(s => REPLY_STYLES.some(preset => preset.id === s.id));
  const customStyles = allStyles.filter(s => !REPLY_STYLES.some(preset => preset.id === s.id));

  // Twitter 风格映射到 Lucide 图标
  const getStyleIcon = (style: ReplyStyle) => {
    switch (style.id) {
      case 'professional':
        return <Brain size={16} />;
      case 'humorous':
        return <Sparkles size={16} />;
      case 'concise':
        return <MessageCircle size={16} />;
      case 'supportive':
        return <Bot size={16} />;
      case 'critical':
        return <Brain size={16} />;
      case 'questioning':
        return <MessageCircle size={16} />;
      default:
        return <Bot size={16} />;
    }
  };

  const menuPosition = getMenuPosition();

  return createPortal(
    <div
      role="menu"
      className="css-175oi2r r-j2cz3j r-kemksi r-1q9bdsx r-qo02w8 r-1udh08x r-1rnoaur r-1r851ge r-1xcajam twitter-ai-style-selector"
      ref={containerRef}
      style={{
        position: 'fixed',
        top: menuPosition.top,
        left: menuPosition.left,
        zIndex: 2147483647,
        backgroundColor: 'rgba(32, 35, 39, 1)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(47, 51, 54, 1)',
        minWidth: '230px',
        maxHeight: 'calc(-48px + 100vh)',
        overflowY: 'auto',
        animation: 'fadeInScale 0.15s ease-out',
      }}
    >
      <div className="css-175oi2r">
        <div className="css-175oi2r" data-testid="Dropdown">
          {/* 所有风格选项 */}
          {[...customStyles, ...presetStyles].map((style) => (
            <div
              key={style.id}
              role="menuitem"
              tabIndex={0}
              className={`css-175oi2r r-1loqt21 r-18u37iz r-1mmae3n r-3pj75a r-13qz1uu r-o7ynqc r-6416eg r-1ny4l3l twitter-ai-menu-item ${isLoading ? 'r-icoktb' : ''}`}
              onClick={() => !isLoading && handleStyleClick(style.id)}
              style={{
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div className="css-175oi2r r-1777fci r-faml9v">
                {style.icon ? (
                  <div className="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-1q142lx">
                    {style.icon}
                  </div>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="r-4qtqp9 r-yyyyoo r-1xvli5t r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-1q142lx">
                    <g>
                      <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </g>
                  </svg>
                )}
              </div>
              <div className="css-175oi2r r-16y2uox r-1wbh5a2">
                <div dir="ltr" className="css-146c3p1 r-bcqeeo r-1ttztb7 r-qvutc0 r-37j5jr r-a023e6 r-rjixqe r-b88u0q">
                  <span className="css-1jxf684 r-bcqeeo r-1ttztb7 r-qvutc0 r-poiln3">{style.name}</span>
                </div>
                              </div>
            </div>
          ))}
        </div>
      </div>
        </div>,
    document.body
  );
}
