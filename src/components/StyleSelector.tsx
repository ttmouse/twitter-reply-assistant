/**
 * 风格选择器组件
 *
 * 显示预设风格和自定义风格的下拉菜单
 */

import React, { useState, useEffect, useRef } from 'react';
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
}

export function StyleSelector({
  onSelectStyle,
  isOpen,
  onClose,
  isLoading = false,
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

  // 分离预设风格和自定义风格
  const presetStyles = allStyles.filter(s => REPLY_STYLES.some(preset => preset.id === s.id));
  const customStyles = allStyles.filter(s => !REPLY_STYLES.some(preset => preset.id === s.id));

  return (
    <div
      ref={containerRef}
      className="twitter-ai-style-selector"
      style={{
        position: 'absolute',
        top: '0',
        left: '40px', // 按钮宽度 36px + 4px 间距
        zIndex: 999999,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '8px',
        minWidth: '280px',
      }}
    >
      {/* 标题 */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #eff3f4',
          marginBottom: '4px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 700,
            color: '#0f1419',
          }}
        >
          选择回复风格
        </h3>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '13px',
            color: '#536471',
          }}
        >
          {isLoading ? '生成中...' : 'AI 将以选定风格生成回复'}
        </p>
      </div>

      {/* 风格列表 */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* 自定义风格 */}
        {customStyles.length > 0 && (
          <>
            <div
              style={{
                padding: '8px 12px',
                marginBottom: '4px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#536471',
                }}
              >
                自定义风格 ({customStyles.length})
              </p>
            </div>
            {customStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleClick(style.id)}
                disabled={isLoading}
                className="twitter-ai-style-option"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  textAlign: 'left',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#f7f9f9';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* 图标 */}
                <span
                  style={{
                    fontSize: '24px',
                    marginRight: '12px',
                    flexShrink: 0,
                  }}
                >
                  {style.icon}
                </span>

                {/* 内容 */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#0f1419',
                      marginBottom: '2px',
                    }}
                  >
                    {style.name}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#536471',
                      lineHeight: '16px',
                    }}
                  >
                    {style.description}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* 预设风格分隔线（如果有自定义风格） */}
        {customStyles.length > 0 && presetStyles.length > 0 && (
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #eff3f4',
              marginTop: '4px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: '#536471',
              }}
            >
              预设风格
            </p>
          </div>
        )}

        {/* 预设风格 */}
        {presetStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => handleStyleClick(style.id)}
            disabled={isLoading}
            className="twitter-ai-style-option"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              width: '100%',
              padding: '12px',
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              textAlign: 'left',
              opacity: isLoading ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#f7f9f9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* 图标 */}
            <span
              style={{
                fontSize: '24px',
                marginRight: '12px',
                flexShrink: 0,
              }}
            >
              {style.icon}
            </span>

            {/* 内容 */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#0f1419',
                  marginBottom: '2px',
                }}
              >
                {style.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#536471',
                  lineHeight: '16px',
                }}
              >
                {style.description}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 底部提示 */}
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid #eff3f4',
          marginTop: '4px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#536471',
            textAlign: 'center',
          }}
        >
          🤖 由 AI 驱动 · 最多生成 280 字符
        </p>
      </div>
    </div>
  );
}
