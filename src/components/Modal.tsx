/**
 * 通用浮层组件
 *
 * 统一所有浮层的样式和交互行为
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, transitions, zIndex } from '../styles/design-tokens';
import { Z_INDEX } from '../utils/popup-position';

interface ModalProps {
  /** 是否显示浮层 */
  isOpen: boolean;
  /** 关闭浮层 */
  onClose: () => void;
  /** 子元素 */
  children: React.ReactNode;
  /** 最大宽度 */
  maxWidth?: string;
  /** 是否支持ESC键关闭 */
  closeOnEscape?: boolean;
  /** 是否支持点击背景关闭 */
  closeOnBackdrop?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 背景透明度 */
  backdropOpacity?: number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = '520px',
  closeOnEscape = true,
  closeOnBackdrop = true,
  style = {},
  backdropOpacity = 0.6,
}) => {
  // 键盘事件处理
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (typeof document === 'undefined') {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalNode = (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})`,
        zIndex: Z_INDEX.MODAL,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[4],
        animation: `fadeIn ${transitions.duration.normal} ${transitions.easing.easeOut}`,
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          backgroundColor: colors.bg.primary,
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: `slideInUp ${transitions.duration.normal} ${transitions.easing.easeOut}`,
          ...style,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};

// 浮层头部组件
interface ModalHeaderProps {
  /** 标题 */
  title: string;
  /** 关闭回调 */
  onClose: () => void;
  /** 图标 */
  icon?: React.ReactNode;
  /** 是否显示关闭按钮 */
  showCloseButton?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  icon,
  showCloseButton = true,
}) => {
  return (
    <div
      style={{
        padding: `${spacing[5]} ${spacing[6]} ${spacing[4]} ${spacing[6]}`,
        borderBottom: `1px solid ${colors.bg.borderLight}`,
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
        {icon && (
          <div style={{
            width: spacing[8],
            height: spacing[8],
            background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
            borderRadius: borderRadius.full,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: shadows.md,
          }}>
            {icon}
          </div>
        )}
        <h3 style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
        }}>
          {title}
        </h3>
      </div>

      {showCloseButton && (
        <button
          onClick={onClose}
          style={{
            width: spacing[8],
            height: spacing[8],
            borderRadius: borderRadius.full,
            border: 'none',
            backgroundColor: colors.bg.elevated,
            color: colors.text.secondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
            boxShadow: shadows.sm,
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
      )}
    </div>
  );
};

// 浮层内容组件
interface ModalBodyProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义内边距 */
  padding?: string;
  /** 是否可滚动 */
  scrollable?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  padding = `${spacing[6]}`,
  scrollable = true,
}) => {
  return (
    <div
      style={{
        padding,
        flex: 1,
        overflow: scrollable ? 'auto' : 'visible',
        // 改善滚动体验
        WebkitOverflowScrolling: 'touch',
        // 自定义滚动条样式
        scrollbarWidth: 'thin',
        scrollbarColor: `${colors.bg.borderMedium} transparent`,
        // 确保最小高度，避免内容过少时布局异常
        minHeight: '200px',
      }}
    >
      {children}
      {/* 添加全局滚动条样式 */}
      <style>{`
        .modal-content::-webkit-scrollbar {
          width: 6px;
        }
        .modal-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .modal-content::-webkit-scrollbar-thumb {
          background: ${colors.bg.borderMedium};
          border-radius: 3px;
        }
        .modal-content::-webkit-scrollbar-thumb:hover {
          background: ${colors.bg.border};
        }
      `}</style>
    </div>
  );
};

// 浮层底部组件
interface ModalFooterProps {
  /** 子元素 */
  children: React.ReactNode;
  /** 自定义内边距 */
  padding?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  padding = `${spacing[4]} ${spacing[6]} ${spacing[6]} ${spacing[6]}`,
}) => {
  return (
    <div
      style={{
        padding,
        borderTop: `1px solid ${colors.bg.borderLight}`,
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
};
