import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { Z_INDEX } from '../utils/popup-position';
import { colors, spacing, borderRadius, shadows } from '../styles/design-tokens';

interface TestResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  testResult: {
    type: 'success' | 'error' | 'loading';
    title: string;
    message: string;
    details?: string;
    latency?: number;
    rawData?: any;
  } | null;
}

export const TestResultModal: React.FC<TestResultModalProps> = ({
  isOpen,
  onClose,
  testResult
}) => {
  // 检测是否在popup环境中
  const [isPopupContext, setIsPopupContext] = useState(false);
  
  useEffect(() => {
    // 更精确的检测方式：检查URL中是否有popup参数
    const isPopup = window.location.search.includes('popup') || 
                   window.location.pathname.includes('popup') ||
                   window.innerWidth < 400;
    setIsPopupContext(isPopup);
  }, []);
  
  // 键盘事件处理
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !testResult) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // 更新所有复制按钮的文本和添加动画
      const copyButtons = document.querySelectorAll('[data-copy-btn]');
      copyButtons.forEach((btn) => {
        const originalHTML = btn.innerHTML;
        btn.classList.add('copy-success');
        btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"></polyline></svg>已复制';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.classList.remove('copy-success');
        }, 2000);
      });
    }).catch(() => {
      // 复制失败时的处理
      const copyButtons = document.querySelectorAll('[data-copy-btn]');
      copyButtons.forEach((btn) => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>复制失败';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
        }, 2000);
      });
    });
  };

  const getIcon = () => {
    switch (testResult.type) {
      case 'loading':
        return <Loader2 size={24} className="animate-spin" />;
      case 'success':
        return <CheckCircle size={24} />;
      case 'error':
        return <XCircle size={24} />;
      default:
        return null;
    }
  };

  const getIconColor = () => {
    switch (testResult.type) {
      case 'loading':
        return 'var(--color-primary)';
      case 'success':
        return 'var(--color-success)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--color-text-muted)';
    }
  };

  const getBackgroundColor = () => {
    switch (testResult.type) {
      case 'loading':
        return 'var(--color-bg-elevated)';
      case 'success':
        return 'rgba(95, 207, 128, 0.15)';
      case 'error':
        return 'rgba(255, 99, 71, 0.15)';
      default:
        return 'var(--color-bg-elevated)';
    }
  };

  const getBorderColor = () => {
    switch (testResult.type) {
      case 'loading':
        return 'var(--color-border-medium)';
      case 'success':
        return 'rgba(95, 207, 128, 0.4)';
      case 'error':
        return 'rgba(255, 99, 71, 0.4)';
      default:
        return 'var(--color-border-medium)';
    }
  };

  // 在popup中的简化版本 - 适配popup窗口尺寸
  if (isPopupContext) {
    // 获取popup窗口的实际尺寸
    const popupWidth = Math.max(window.innerWidth, 360); // 确保最小宽度
    const popupHeight = Math.max(window.innerHeight, 500); // 确保最小高度
    
    return createPortal(
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: popupWidth - 32, // 减去padding
            height: popupHeight - 32, // 减去padding
            maxWidth: popupWidth - 32,
            maxHeight: popupHeight - 32,
            backgroundColor: getBackgroundColor(),
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInUp 0.2s ease-out',
            border: `2px solid ${getBorderColor()}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div
            style={{
              padding: spacing[3], // 减小padding以适应小屏幕
              borderBottom: `1px solid ${colors.bg.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[3],
            }}>
              <div style={{ 
                width: '32px', // 减小尺寸以适应小屏幕
                height: '32px',
                borderRadius: borderRadius.md,
                backgroundColor: colors.bg.elevated,
                border: `2px solid ${getBorderColor()}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getIconColor()
              }}>
                {getIcon()}
              </div>
              <h3 style={{
                fontSize: '16px', // 减小字体大小
                fontWeight: 600,
                color: colors.text.primary,
                margin: 0,
              }}>
                {testResult.title}
              </h3>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: borderRadius.full,
                border: 'none',
                backgroundColor: colors.bg.elevated,
                color: colors.text.secondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.surface;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.elevated;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <X size={14} /> {/* 减小图标尺寸 */}
            </button>
          </div>

          {/* 内容区域 */}
          <div
            style={{
              padding: spacing[3], // 减小padding以适应小屏幕
              flex: 1,
              overflow: 'auto',
            }}
          >
            {/* 主要消息 */}
            <div
              style={{
                fontSize: '14px',
                color: colors.text.primary,
                lineHeight: 1.5,
                marginBottom: spacing[4],
              }}
            >
              {testResult.message}
            </div>

            {testResult.latency && (
              <p
                style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  margin: `2px 0 ${spacing[4]} 0`,
                }}
              >
                响应时间: {testResult.latency}ms
              </p>
            )}

            {/* 详细信息 */}
            {testResult.details && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: spacing[2],
                  }}
                >
                  <h3
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: colors.text.tertiary,
                      margin: 0,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    详细信息
                  </h3>
                  <button
                    data-copy-btn
                    onClick={() => copyToClipboard(testResult.details!)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1],
                      padding: `${spacing[1]} ${spacing[2]}`,
                      fontSize: '11px',
                      color: colors.text.tertiary,
                      backgroundColor: colors.bg.secondary,
                      border: `1px solid ${colors.bg.border}`,
                      borderRadius: borderRadius.sm,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.bg.surface;
                      e.currentTarget.style.color = colors.text.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.bg.secondary;
                      e.currentTarget.style.color = colors.text.tertiary;
                    }}
                  >
                    <Copy size={10} />
                    复制
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: colors.bg.surface,
                    border: `1px solid ${colors.bg.border}`,
                    borderRadius: borderRadius.md,
                    padding: spacing[3],
                  }}
                >
                  <pre
                    style={{
                      fontSize: '11px',
                      color: colors.text.tertiary,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      lineHeight: 1.4,
                      margin: 0,
                      wordWrap: 'break-word',
                    }}
                  >
                    {testResult.details}
                  </pre>
                </div>
              </div>
            )}

            {/* 原始数据（JSON格式） */}
            {testResult.rawData && (
              <div style={{ marginTop: spacing[4] }}>
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.tertiary,
                    margin: `0 0 ${spacing[2]} 0`,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  原始响应数据
                </h3>

                <div
                  style={{
                    backgroundColor: colors.bg.surface,
                    border: `1px solid ${colors.bg.border}`,
                    borderRadius: borderRadius.md,
                    padding: spacing[3],
                    maxHeight: '150px', // 减小最大高度以适应popup
                    overflowY: 'auto',
                  }}
                >
                  <pre
                    style={{
                      fontSize: '10px',
                      color: colors.text.muted,
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      lineHeight: 1.3,
                      margin: 0,
                      wordWrap: 'break-word',
                    }}
                  >
                    {JSON.stringify(testResult.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮区域 */}
          <div
            style={{
              padding: `${spacing[3]} ${spacing[4]} ${spacing[4]} ${spacing[4]}`, // 减小padding
              borderTop: `1px solid ${colors.bg.border}`,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: spacing[2], // 减小gap
            }}
          >
            {testResult.type === 'success' && (
              <button
                onClick={() => {
                  // 可以添加"在新标签页中查看详细结果"的功能
                  window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(testResult.details || ''), '_blank');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: `${spacing[2]} ${spacing[4]}`,
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid ${colors.bg.border}`,
                  borderRadius: borderRadius.sm,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.surface;
                  e.currentTarget.style.color = colors.text.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.secondary;
                  e.currentTarget.style.color = colors.text.tertiary;
                }}
              >
                <ExternalLink size={12} />
                新窗口查看
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: `${spacing[2]} ${spacing[5]}`,
                fontSize: '12px',
                fontWeight: 500,
                color: '#F8F8FA',
                backgroundColor: testResult.type === 'success' ? colors.success[500] : colors.primary[500],
                border: 'none',
                borderRadius: borderRadius.sm,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              关闭
            </button>
          </div>
        </div>
      </div>, document.body
    );
  }

  // 在content script中使用Portal版本
  return createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `rgba(0, 0, 0, 0.85)`,
        zIndex: Z_INDEX.MODAL,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: "500px",
          maxHeight: '90vh',
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInUp 0.2s ease-out',
          border: `2px solid ${getBorderColor()}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          style={{
            padding: `${spacing[5]} ${spacing[6]} ${spacing[4]} ${spacing[6]}`,
            borderBottom: `1px solid ${colors.bg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3],
          }}>
            <div style={{ 
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.md,
              backgroundColor: colors.bg.elevated,
              border: `2px solid ${getBorderColor()}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: getIconColor()
            }}>
              {getIcon()}
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: colors.text.primary,
              margin: 0,
            }}>
              {testResult.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: borderRadius.full,
              border: 'none',
              backgroundColor: colors.bg.elevated,
              color: colors.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.surface;
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg.elevated;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容区域 */}
        <div
          style={{
            padding: spacing[6],
            flex: 1,
            overflow: 'auto',
          }}
        >
          {/* 主要消息 */}
          <div
            style={{
              fontSize: '14px',
              color: colors.text.primary,
              lineHeight: 1.5,
              marginBottom: spacing[4],
            }}
          >
            {testResult.message}
          </div>

          {testResult.latency && (
            <p
              style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                margin: `2px 0 ${spacing[4]} 0`,
              }}
            >
              响应时间: {testResult.latency}ms
            </p>
          )}

          {/* 详细信息 */}
          {testResult.details && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: spacing[2],
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.text.tertiary,
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  详细信息
                </h3>
                <button
                  data-copy-btn
                  onClick={() => copyToClipboard(testResult.details!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1],
                    padding: `${spacing[1]} ${spacing[2]}`,
                    fontSize: '11px',
                    color: colors.text.tertiary,
                    backgroundColor: colors.bg.secondary,
                    border: `1px solid ${colors.bg.border}`,
                    borderRadius: borderRadius.sm,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.surface;
                    e.currentTarget.style.color = colors.text.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bg.secondary;
                    e.currentTarget.style.color = colors.text.tertiary;
                  }}
                >
                  <Copy size={10} />
                  复制
                </button>
              </div>

              <div
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.bg.border}`,
                  borderRadius: borderRadius.md,
                  padding: spacing[3],
                }}
              >
                <pre
                  style={{
                    fontSize: '11px',
                    color: colors.text.tertiary,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.4,
                    margin: 0,
                    wordWrap: 'break-word',
                  }}
                >
                  {testResult.details}
                </pre>
              </div>
            </div>
          )}

          {/* 原始数据（JSON格式） */}
          {testResult.rawData && (
            <div style={{ marginTop: spacing[4] }}>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: colors.text.tertiary,
                  margin: `0 0 ${spacing[2]} 0`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                原始响应数据
              </h3>

              <div
                style={{
                  backgroundColor: colors.bg.surface,
                  border: `1px solid ${colors.bg.border}`,
                  borderRadius: borderRadius.md,
                  padding: spacing[3],
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <pre
                  style={{
                    fontSize: '10px',
                    color: colors.text.muted,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.3,
                    margin: 0,
                    wordWrap: 'break-word',
                  }}
                >
                  {JSON.stringify(testResult.rawData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮区域 */}
        <div
          style={{
            padding: `${spacing[4]} ${spacing[6]} ${spacing[6]} ${spacing[6]}`,
            borderTop: `1px solid ${colors.bg.border}`,
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: spacing[3],
          }}
        >
          {testResult.type === 'success' && (
            <button
              onClick={() => {
                // 可以添加"在新标签页中查看详细结果"的功能
                window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(testResult.details || ''), '_blank');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: '12px',
                color: colors.text.tertiary,
                backgroundColor: colors.bg.secondary,
                border: `1px solid ${colors.bg.border}`,
                borderRadius: borderRadius.sm,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.surface;
                e.currentTarget.style.color = colors.text.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.bg.secondary;
                e.currentTarget.style.color = colors.text.tertiary;
              }}
            >
              <ExternalLink size={12} />
              新窗口查看
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: `${spacing[2]} ${spacing[5]}`,
              fontSize: '12px',
              fontWeight: 500,
              color: '#F8F8FA',
              backgroundColor: testResult.type === 'success' ? colors.success[500] : colors.primary[500],
              border: 'none',
              borderRadius: borderRadius.sm,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};