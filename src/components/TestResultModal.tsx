import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, Loader2, Copy, ExternalLink } from 'lucide-react';

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

  // 计算浮层显示位置
  const getModalPosition = () => {
    if (!isOpen) return {};

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const modalMaxHeight = viewportHeight * 0.7;

    // 检查是否在小屏幕上（移动设备或小窗口）
    const isSmallScreen = viewportHeight < 600 || viewportWidth < 500;

    if (isSmallScreen) {
      // 小屏幕上居中显示
      return {
        position: 'fixed' as const,
        top: '50%',
        bottom: 'auto',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxHeight: '90vh',
      };
    }

    // 获取鼠标位置或popup中心位置
    const popupCenter = viewportHeight / 2;

    // 如果popup在屏幕上半部分，向下显示
    if (popupCenter < viewportHeight * 0.4) {
      return {
        position: 'fixed' as const,
        top: '60%',
        bottom: 'auto',
        left: '50%',
        transform: 'translate(-50%, 0)',
        maxHeight: `${viewportHeight * 0.4}px`,
      };
    }
    // 如果popup在屏幕下半部分，向上显示
    else if (popupCenter > viewportHeight * 0.6) {
      return {
        position: 'fixed' as const,
        top: 'auto',
        bottom: '20%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        maxHeight: `${viewportHeight * 0.4}px`,
      };
    }
    // 默认居中显示
    else {
      return {
        position: 'fixed' as const,
        top: '50%',
        bottom: 'auto',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  };

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

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--color-bg-surface)',
          border: `2px solid ${getBorderColor()}`,
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...getModalPosition(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div
          style={{
            padding: '20px 20px 16px 20px',
            borderBottom: `1px solid var(--color-border-medium)`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-bg-surface)',
              border: `2px solid ${getBorderColor()}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div className={testResult.type === 'success' ? 'success-icon' : testResult.type === 'error' ? 'error-icon' : ''} style={{ color: getIconColor() }}>
              {getIcon()}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {testResult.title}
            </h2>
            {testResult.latency && (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  margin: '2px 0 0 0',
                }}
              >
                响应时间: {testResult.latency}ms
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--color-border-medium)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
              e.currentTarget.style.borderColor = getBorderColor();
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.borderColor = 'var(--color-border-medium)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 内容 */}
        <div
          style={{
            padding: '20px',
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {/* 主要消息 */}
          <div
            style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
              marginBottom: '16px',
            }}
          >
            {testResult.message}
          </div>

          {/* 详细信息 */}
          {testResult.details && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
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
                    gap: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                    e.currentTarget.style.color = 'var(--color-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                  }}
                >
                  <Copy size={10} />
                  复制
                </button>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: `1px solid var(--color-border-medium)`,
                  borderRadius: '8px',
                  padding: '12px',
                }}
              >
                <pre
                  style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.4,
                    margin: 0,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {testResult.details}
                </pre>
              </div>
            </div>
          )}

          {/* 原始数据（JSON格式） */}
          {testResult.rawData && (
            <div style={{ marginTop: '16px' }}>
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                原始响应数据
              </h3>

              <div
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: `1px solid var(--color-border-medium)`,
                  borderRadius: '8px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <pre
                  style={{
                    fontSize: '10px',
                    color: 'var(--color-text-muted)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    lineHeight: 1.3,
                    margin: 0,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {JSON.stringify(testResult.rawData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: `1px solid var(--color-border-medium)`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
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
                padding: '8px 16px',
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                backgroundColor: 'var(--color-bg-subtle)',
                border: '1px solid var(--color-border-light)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <ExternalLink size={12} />
              新窗口查看
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              fontSize: '12px',
              fontWeight: 500,
              color: '#F8F8FA',
              backgroundColor: testResult.type === 'success' ? 'var(--color-success)' : 'var(--color-primary)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
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
    </div>
  );
};