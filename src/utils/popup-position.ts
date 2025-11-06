/**
 * 浮层定位工具
 * 
 * 提供统一的浮层定位逻辑，确保浮层在各种屏幕尺寸下正确显示
 */

export interface PositionOptions {
  /** 触发元素的位置和尺寸 */
  triggerRect: DOMRect;
  /** 浮层的宽度和高度预估 */
  popupSize: {
    width: number;
    height: number;
  };
  /** 可选的偏移量 */
  offset?: {
    x: number;
    y: number;
  };
  /** 浮层相对于触发器的位置偏好 */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** 是否应该自适应以避免超出视口 */
  avoidViewportOverflow?: boolean;
}

export interface PositionResult {
  /** 最终定位方式 */
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** 最终位置 */
  position: {
    top: number;
    left: number;
  };
  /** 是否因为空间不足而自动调整了位置 */
  isAdjusted: boolean;
}

/**
 * 获取视口尺寸信息
 */
function getViewportInfo() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
    scrollTop: window.pageYOffset || document.documentElement.scrollTop,
    scrollLeft: window.pageXOffset || document.documentElement.scrollLeft,
  };
}

/**
 * 计算最佳浮层位置
 */
export function calculatePopupPosition(options: PositionOptions): PositionResult {
  const {
    triggerRect,
    popupSize,
    offset = { x: 0, y: 0 },
    placement = 'bottom',
    avoidViewportOverflow = true,
  } = options;

  const viewport = getViewportInfo();
  let finalPlacement = placement;
  let top = 0;
  let left = 0;
  let isAdjusted = false;

  // 根据placement计算初始位置
  switch (placement) {
    case 'bottom':
      top = triggerRect.bottom + offset.y;
      left = triggerRect.left + offset.x;
      break;
    case 'top':
      top = triggerRect.top - popupSize.height + offset.y;
      left = triggerRect.left + offset.x;
      break;
    case 'left':
      top = triggerRect.top + offset.y;
      left = triggerRect.left - popupSize.width + offset.x;
      break;
    case 'right':
      top = triggerRect.top + offset.y;
      left = triggerRect.right + offset.x;
      break;
    case 'center':
      top = viewport.height / 2 - popupSize.height / 2 + viewport.scrollTop;
      left = viewport.width / 2 - popupSize.width / 2 + viewport.scrollLeft;
      break;
  }

  // 如果不需要自适应，直接返回结果
  if (!avoidViewportOverflow) {
    return {
      placement: finalPlacement,
      position: { top, left },
      isAdjusted,
    };
  }

  // 检查并调整水平位置
  if (left < viewport.scrollLeft) {
    // 左边界超出
    left = viewport.scrollLeft + 8; // 留一点边距
    isAdjusted = true;
  } else if (left + popupSize.width > viewport.scrollLeft + viewport.width) {
    // 右边界超出
    left = viewport.scrollLeft + viewport.width - popupSize.width - 8; // 留一点边距
    isAdjusted = true;
  }

  // 检查并调整垂直位置
  if (top < viewport.scrollTop) {
    // 上边界超出
    top = viewport.scrollTop + 8; // 留一点边距
    isAdjusted = true;
  } else if (top + popupSize.height > viewport.scrollTop + viewport.height) {
    // 下边界超出
    top = viewport.scrollTop + viewport.height - popupSize.height - 8; // 留一点边距
    isAdjusted = true;
  }

  // 特殊处理：如果是基于触发元素定位且位置需要调整
  if (isAdjusted && placement !== 'center') {
    // 尝试反转位置
    switch (placement) {
      case 'bottom':
        // 如果底部空间不足，尝试放在上方
        if (triggerRect.top - popupSize.height >= viewport.scrollTop) {
          top = triggerRect.top - popupSize.height + offset.y;
          left = triggerRect.left + offset.x;
          finalPlacement = 'top';
        }
        break;
      case 'top':
        // 如果上方空间不足，尝试放在下方
        if (triggerRect.bottom + popupSize.height <= viewport.scrollTop + viewport.height) {
          top = triggerRect.bottom + offset.y;
          left = triggerRect.left + offset.x;
          finalPlacement = 'bottom';
        }
        break;
      case 'right':
        // 如果右侧空间不足，尝试放在左侧
        if (triggerRect.left - popupSize.width >= viewport.scrollLeft) {
          left = triggerRect.left - popupSize.width + offset.x;
          top = triggerRect.top + offset.y;
          finalPlacement = 'left';
        }
        break;
      case 'left':
        // 如果左侧空间不足，尝试放在右侧
        if (triggerRect.right + popupSize.width <= viewport.scrollLeft + viewport.width) {
          left = triggerRect.right + offset.x;
          top = triggerRect.top + offset.y;
          finalPlacement = 'right';
        }
        break;
    }
  }

  return {
    placement: finalPlacement,
    position: { top, left },
    isAdjusted,
  };
}

/**
 * 检查是否在小屏幕设备上
 */
export function isSmallScreen(): boolean {
  const viewport = getViewportInfo();
  return viewport.width < 600 || viewport.height < 600;
}

/**
 * 获取响应式的浮层尺寸
 */
export function getResponsivePopupSize() {
  const viewport = getViewportInfo();
  
  if (isSmallScreen()) {
    return {
      width: Math.min(viewport.width * 0.9, 350),
      height: Math.min(viewport.height * 0.7, 400),
      maxWidth: viewport.width * 0.9,
      maxHeight: viewport.height * 0.8,
    };
  }
  
  return {
    width: 500,
    height: 400,
    maxWidth: 500,
    maxHeight: viewport.height * 0.8,
  };
}

/**
 * 获取响应式的浮层样式
 */
export function getResponsivePopupStyles(
  position: { top: number; left: number },
  options: {
    type?: 'dropdown' | 'modal' | 'tooltip';
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    border?: string;
    backdropFilter?: string;
    animation?: string;
  } = {}
): React.CSSProperties {
  const {
    type = 'dropdown',
    backgroundColor = 'var(--color-bg-elevated)',
    borderRadius = type === 'dropdown' ? '16px' : '12px',
    boxShadow = type === 'modal' 
      ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
      : '0 8px 24px rgba(0, 0, 0, 0.15)',
    border = '1px solid var(--color-border-medium)',
    backdropFilter = 'blur(8px)',
    animation = type === 'modal' 
      ? 'fadeInScale 0.2s ease-out' 
      : 'fadeInScale 0.15s ease-out',
  } = options;
  
  const size = getResponsivePopupSize();
  
  return {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: type === 'dropdown' ? '230px' : size.width,
    maxWidth: size.maxWidth,
    maxHeight: size.maxHeight,
    zIndex: type === 'modal' ? Z_INDEX.MODAL : Z_INDEX.DROPDOWN,
    backgroundColor,
    borderRadius,
    boxShadow,
    border,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    animation,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };
}

/**
 * 获取用于不同类型浮层的z-index层级
 */
export const Z_INDEX = {
  TOOLTIP: 1000,
  DROPDOWN: 1050,
  MODAL: 1100,
  NOTIFICATION: 1200,
  OVERLAY: 2000,
  // Twitter相关浮层使用更高的层级确保不被遮挡
  TWITTER_TOOLTIP: 2100,
  TWITTER_DROPDOWN: 2150,
  TWITTER_MODAL: 2200,
} as const;

/**
 * 创建浮层样式
 */
export function createPopupStyles(
  position: { top: number; left: number },
  options: {
    width?: string | number;
    height?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    zIndex?: number;
    backgroundColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    border?: string;
    backdropFilter?: string;
    animation?: string;
  } = {}
): React.CSSProperties {
  const {
    width = 'auto',
    height = 'auto',
    maxWidth = '90vw',
    maxHeight = '90vh',
    zIndex = Z_INDEX.DROPDOWN,
    backgroundColor = 'var(--color-bg-elevated)',
    borderRadius = '12px',
    boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)',
    border = '1px solid var(--color-border-medium)',
    backdropFilter = 'blur(8px)',
    animation = 'fadeInScale 0.15s ease-out',
  } = options;

  return {
    position: 'fixed',
    top: `${position.top}px`,
    left: `${position.left}px`,
    width,
    height,
    maxWidth,
    maxHeight,
    zIndex,
    backgroundColor,
    borderRadius,
    boxShadow,
    border,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter,
    animation,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };
}