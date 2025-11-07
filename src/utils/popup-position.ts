/**
 * 弹窗位置和层级管理
 *
 * 定义UI元素的层级和位置常量
 */

/**
 * UI元素的z-index层级
 */
export const Z_INDEX = {
  NOTIFICATION: 10000,     // 通知提示
  POPUP: 11000,           // 弹出层
  MODAL_OVERLAY: 12000,    // 模态框遮罩
  MODAL: 13000,           // 模态框内容
  TOOLTIP: 14000,         // 工具提示
  LOADING: 15000,         // 加载遮罩
  TWITTER_DROPDOWN: 10500, // Twitter下拉菜单
} as const;

/**
 * 计算弹出菜单位置
 */
export function calculatePopupPosition(
  buttonRect: DOMRect,
  menuHeight: number,
  menuWidth: number = 280,
  viewportWidth: number = window.innerWidth,
  viewportHeight: number = window.innerHeight
): {
  top: number;
  left: number;
  maxHeight: number;
  transform?: string;
} {
  // 默认位置：按钮下方
  let top = buttonRect.bottom + window.scrollY + 8;
  let left = buttonRect.left + window.scrollX;
  let maxHeight = Math.min(menuHeight, viewportHeight - 40);

  // 检查是否超出右边界
  if (left + menuWidth > viewportWidth - 20) {
    left = viewportWidth - menuWidth - 20;
  }

  // 检查是否超出左边界
  if (left < 20) {
    left = 20;
  }

  // 检查是否超出底部边界
  if (top + menuHeight > viewportHeight - 20) {
    // 尝试放在按钮上方
    if (buttonRect.top - menuHeight - 8 > 20) {
      top = buttonRect.top - menuHeight - 8 + window.scrollY;
      maxHeight = Math.min(menuHeight, buttonRect.top - 20);
    } else {
      // 仍然放在下方，但限制高度
      top = buttonRect.bottom + window.scrollY + 8;
      maxHeight = Math.min(menuHeight, viewportHeight - top - 20);
    }
  }

  return { top, left, maxHeight };
}

/**
 * 获取响应式弹窗样式
 */
export function getResponsivePopupStyles(
  buttonRect: DOMRect,
  menuHeight: number,
  menuWidth: number = 280
): React.CSSProperties {
  const position = calculatePopupPosition(buttonRect, menuHeight, menuWidth);

  return {
    position: 'absolute',
    top: `${position.top}px`,
    left: `${position.left}px`,
    width: `${menuWidth}px`,
    maxHeight: `${position.maxHeight}px`,
    zIndex: Z_INDEX.TWITTER_DROPDOWN,
    transform: position.transform,
  };
}