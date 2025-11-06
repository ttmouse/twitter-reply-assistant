/**
 * 高级按钮组件
 *
 * 每个交互细节都经过精心打磨
 * 追求60fps的流畅动画和细腻的反馈
 */

import React, { forwardRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, transitions, container } from '../styles/design-tokens';

// 按钮变体类型
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// 按钮属性接口
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否正在加载 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 按钮宽度 */
  fullWidth?: boolean;
  /** 子元素 */
  children: React.ReactNode;
}

// 按钮样式映射
const getButtonStyles = (variant: ButtonVariant, size: ButtonSize, fullWidth: boolean, isHovered: boolean, isActive: boolean, isDisabled: boolean) => {
  const baseStyles = {
    position: 'relative' as const,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'inherit',
    fontWeight: typography.fontWeight.medium,
    transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    whiteSpace: 'nowrap' as const,
    userSelect: 'none' as const,
    outline: 'none',
    border: 'none',
    // 微妙的transform用于hover效果
    transform: isHovered && !isDisabled ? 'translateY(-1px)' : 'translateY(0)',
  };

  // 尺寸样式
  const sizeStyles = {
    sm: {
      height: '32px',
      padding: `0 ${spacing[3]}`,
      fontSize: typography.fontSize.xs,
      borderRadius: borderRadius.sm,
    },
    md: {
      height: container.buttonHeight,
      padding: `0 ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.base,
    },
    lg: {
      height: '44px',
      padding: `0 ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      borderRadius: borderRadius.md,
    },
  };

  // 变体样式
  const variantStyles = {
    primary: {
      backgroundColor: isDisabled ? colors.bg.border : colors.primary[500],
      color: '#FFFFFF',
      boxShadow: isHovered && !isDisabled ? shadows.md : shadows.sm,
      ...(isActive && !isDisabled && {
        backgroundColor: colors.primary[600],
        transform: 'translateY(0)',
        boxShadow: shadows.sm,
      }),
    },
    secondary: {
      backgroundColor: isDisabled ? colors.bg.surface : colors.bg.elevated,
      color: isDisabled ? colors.text.disabled : colors.text.secondary,
      boxShadow: isHovered && !isDisabled ? shadows.base : shadows.sm,
      ...(isActive && !isDisabled && {
        backgroundColor: colors.bg.surface,
        transform: 'translateY(0)',
      }),
    },
    outline: {
      backgroundColor: 'transparent',
      color: isDisabled ? colors.text.disabled : colors.primary[500],
      border: `1px solid ${isDisabled ? colors.bg.border : colors.primary[500]}`,
      boxShadow: 'none',
      ...(isHovered && !isDisabled && {
        backgroundColor: colors.primary[50],
      }),
      ...(isActive && !isDisabled && {
        backgroundColor: colors.primary[100],
        transform: 'translateY(0)',
      }),
    },
    ghost: {
      backgroundColor: 'transparent',
      color: isDisabled ? colors.text.disabled : colors.primary[500],
      boxShadow: 'none',
      border: `1px solid ${colors.primary[500]}`,
      ...(isHovered && !isDisabled && {
        backgroundColor: `${colors.primary[500]}15`,
      }),
      ...(isActive && !isDisabled && {
        backgroundColor: `${colors.primary[500]}25`,
        transform: 'translateY(0)',
      }),
    },
    danger: {
      backgroundColor: isDisabled ? colors.bg.border : colors.error[500],
      color: '#FFFFFF',
      boxShadow: isHovered && !isDisabled ? shadows.md : shadows.sm,
      ...(isActive && !isDisabled && {
        backgroundColor: colors.error[600],
        transform: 'translateY(0)',
        boxShadow: shadows.sm,
      }),
    },
  };

  return {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
};

// 按钮组件
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  style,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  ...rest
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const buttonStyles = getButtonStyles(variant, size, fullWidth, isHovered, isActive, disabled || loading);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      setIsHovered(true);
      onMouseEnter?.(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      setIsActive(true);
      onMouseDown?.(e);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsActive(false);
    onMouseUp?.(e);
  };

  const handleMouseUpCapture = () => {
    // 确保在按钮外部释放时也能重置状态
    setTimeout(() => setIsActive(false), 0);
  };

  // 渲染图标
  const renderIcon = (icon: React.ReactNode, size: number = 14) => {
    if (!icon) return null;

    return React.cloneElement(icon as React.ReactElement, {
      size,
      style: { flexShrink: 0 },
    } as any);
  };

  // 图标尺寸
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <button
      ref={ref}
      className={className}
      style={{
        ...buttonStyles,
        ...style,
      }}
      disabled={disabled || loading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseUpCapture={handleMouseUpCapture}
      {...rest}
    >
      {/* 加载状态 */}
      {loading && (
        <Loader2
          size={iconSize}
          style={{
            animation: 'spin 1s linear infinite',
            position: 'absolute',
            opacity: 0.7,
          }}
        />
      )}

      {/* 按钮内容 */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing[2],
          opacity: loading ? 0 : 1,
          transition: `opacity ${transitions.duration.fast} ${transitions.easing.easeOut}`,
        }}
      >
        {renderIcon(leftIcon, iconSize)}
        {children}
        {renderIcon(rightIcon, iconSize)}
      </span>

      {/* Ripple效果容器 */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      />
    </button>
  );
});

Button.displayName = 'Button';

// 按钮组合组件 - 用于按钮组
interface ButtonGroupProps {
  children: React.ReactNode;
  spacing?: number;
  fullWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  spacing: gapSize = 3,
  fullWidth = false,
}) => {
  const getGap = (value: number) => {
    switch (value) {
      case 1: return '4px';
      case 2: return '8px';
      case 3: return '12px';
      case 4: return '16px';
      case 5: return '20px';
      case 6: return '24px';
      case 8: return '32px';
      case 10: return '40px';
      case 12: return '48px';
      default: return '12px'; // 默认12px
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: getGap(gapSize),
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            fullWidth: fullWidth,
          } as Partial<ButtonProps>);
        }
        return child;
      })}
    </div>
  );
};