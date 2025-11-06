/**
 * 现代化标签页组件
 *
 * 借鉴Linear和Figma的设计语言，提供流畅的切换体验
 */

import React, { useState, useRef, useEffect } from 'react';
import { colors, spacing, typography, borderRadius, shadows, transitions } from '../styles/design-tokens';

// 标签项接口
interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
  badge?: string | number;
  icon?: React.ReactNode;
}

// 标签页属性接口
interface TabsProps {
  /** 标签项列表 */
  items: TabItem[];
  /** 当前激活的标签ID */
  activeId: string;
  /** 标签切换回调 */
  onChange: (id: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: 'sm' | 'md';
  /** 变体 */
  variant?: 'underline' | 'pills';
}

// 标签页组件
export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'underline',
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});
  const [activeItemRect, setActiveItemRect] = useState<DOMRect | null>(null);

  // 计算指示器位置
  const updateIndicator = () => {
    if (tabsRef.current && activeId) {
      const activeElement = tabsRef.current.querySelector(`[data-tab-id="${activeId}"]`) as HTMLElement;

      if (activeElement) {
        const rect = activeElement.getBoundingClientRect();
        const containerRect = tabsRef.current.getBoundingClientRect();

        const newStyle: React.CSSProperties = {
          left: `${rect.left - containerRect.left}px`,
          width: `${rect.width}px`,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        };

        setIndicatorStyle(newStyle);
        setActiveItemRect(rect);
      }
    }
  };

  // 标签点击处理
  const handleTabClick = (itemId: string) => {
    if (!disabled) {
      onChange(itemId);
    }
  };

  // 更新指示器位置
  useEffect(() => {
    updateIndicator();

    // 监听窗口大小变化
    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [activeId, items]);

  // 尺寸样式
  const sizeStyles = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.xs,
      gap: spacing[1],
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      gap: spacing[2],
    },
  };

  const currentSizeStyles = sizeStyles[size];

  if (variant === 'pills') {
    return (
      <div
        style={{
          display: 'flex',
          padding: spacing[1],
          backgroundColor: colors.bg.secondary,
          borderRadius: borderRadius.lg,
          gap: spacing[1],
        }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const isDisabled = disabled || item.disabled;

          return (
            <button
              key={item.id}
              data-tab-id={item.id}
              onClick={() => handleTabClick(item.id)}
              disabled={isDisabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                padding: currentSizeStyles.padding,
                fontSize: currentSizeStyles.fontSize,
                fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                borderRadius: borderRadius.md,
                border: 'none',
                backgroundColor: isActive ? colors.bg.elevated : 'transparent',
                color: isDisabled
                  ? colors.text.disabled
                  : isActive
                    ? colors.text.primary
                    : colors.text.secondary,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
                boxShadow: isActive ? shadows.sm : 'none',
                flex: 1,
                minWidth: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = colors.bg.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {/* 图标 */}
              {item.icon && React.cloneElement(item.icon as React.ReactElement, {
                size: 16,
                style: { flexShrink: 0 },
              } as any)}

              {/* 标签文本 */}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </span>

              {/* 徽章 */}
              {item.badge && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '20px',
                    height: '20px',
                    padding: `0 ${spacing[1]}`,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.medium,
                    backgroundColor: isActive ? colors.primary[500] : colors.bg.border,
                    color: isActive ? '#FFFFFF' : colors.text.muted,
                    borderRadius: borderRadius.full,
                    marginLeft: spacing[1],
                    flexShrink: 0,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {/* 激活状态背景 */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${colors.primary[500]}20 0%, ${colors.primary[500]}10 100%)`,
                    borderRadius: 'inherit',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // 默认 underline 变体 - 现代化重设计
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: colors.bg.primary,
        borderRadius: borderRadius.md,
        padding: spacing[1],
      }}
    >
      {/* 标签容器 */}
      <div
        ref={tabsRef}
        style={{
          display: 'flex',
          gap: currentSizeStyles.gap,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const isDisabled = disabled || item.disabled;

          return (
            <button
              key={item.id}
              data-tab-id={item.id}
              onClick={() => handleTabClick(item.id)}
              disabled={isDisabled}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing[2],
                padding: currentSizeStyles.padding,
                fontSize: currentSizeStyles.fontSize,
                fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                borderRadius: borderRadius.sm,
                border: 'none',
                backgroundColor: isActive
                  ? colors.bg.primary
                  : 'transparent',
                color: isDisabled
                  ? colors.text.disabled
                  : isActive
                    ? colors.text.primary
                    : colors.text.secondary,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
                position: 'relative',
                flex: 1,
                minWidth: 0,
                // 精细的hover和active效果
                transform: isActive ? 'translateY(0)' : 'translateY(0)',
                boxShadow: isActive
                  ? `0 1px 2px 0 ${colors.bg.borderMedium}20`
                  : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = colors.bg.surface;
                  e.currentTarget.style.color = colors.text.primary;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.text.secondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              onMouseDown={(e) => {
                if (!isDisabled && !isActive) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* 图标 */}
              {item.icon && React.cloneElement(item.icon as React.ReactElement, {
                size: size === 'sm' ? 14 : 16,
                style: {
                  flexShrink: 0,
                  color: isActive ? colors.primary[500] : 'currentColor',
                  transition: `color ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                },
              } as any)}

              {/* 标签文本 */}
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.label}
              </span>

              {/* 徽章 */}
              {item.badge && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: size === 'sm' ? '18px' : '22px',
                    height: size === 'sm' ? '18px' : '22px',
                    padding: `0 ${spacing[1]}`,
                    fontSize: size === 'sm' ? '10px' : typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    backgroundColor: isActive ? colors.primary[500] : colors.bg.border,
                    color: isActive ? '#FFFFFF' : colors.text.muted,
                    borderRadius: borderRadius.full,
                    marginLeft: spacing[1],
                    flexShrink: 0,
                    boxShadow: isActive
                      ? `0 1px 2px 0 ${colors.primary[500]}40`
                      : 'none',
                    transition: `all ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                  }}
                >
                  {item.badge}
                </span>
              )}

              {/* 激活状态背景装饰 */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(135deg, ${colors.primary[500]}15 0%, ${colors.primary[500]}05 100%)`,
                    borderRadius: 'inherit',
                    zIndex: 0,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 简化的指示器 - 更细腻 */}
      <div
        style={{
          position: 'absolute',
          bottom: spacing[1],
          height: '2px',
          backgroundColor: colors.primary[500],
          borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
          zIndex: 2,
          pointerEvents: 'none',
          boxShadow: `0 0 6px ${colors.primary[500]}40`,
          ...indicatorStyle,
        }}
      />
    </div>
  );
};

// 标签页内容面板
interface TabPanelProps {
  /** 标签ID */
  tabId: string;
  /** 是否激活 */
  active?: boolean;
  /** 子元素 */
  children: React.ReactNode;
  /** 动画持续时间 */
  animationDuration?: number;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  tabId,
  active = false,
  children,
  animationDuration = 200,
}) => {
  const [isVisible, setIsVisible] = useState(active);
  const [shouldRender, setShouldRender] = useState(active);

  useEffect(() => {
    if (active) {
      setShouldRender(true);
      // 延迟显示以创建淡入效果
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // 延迟移除以创建淡出效果
      const timer = setTimeout(() => setShouldRender(false), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [active, animationDuration]);

  if (!shouldRender) return null;

  return (
    <div
      role="tabpanel"
      id={`panel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: `translateY(${isVisible ? 0 : 8}px)`,
        transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {children}
    </div>
  );
};