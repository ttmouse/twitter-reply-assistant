/**
 * 设计Token系统
 *
 * 这是整个UI系统的基石。所有尺寸、颜色、间距都必须从这里导入。
 * 严禁任何地方硬编码设计值。
 */

// 色彩系统 - 基于现代深色设计语言
export const colors = {
  // 基础色板 - 深色主题
  bg: {
    primary: 'hsl(220, 13%, 16%)',      // 主背景 - 更深的深色
    secondary: 'hsl(220, 13%, 18%)',    // 次要背景
    elevated: 'hsl(220, 14%, 20%)',     // 浮层背景
    surface: 'hsl(220, 14%, 22%)',      // 表面背景
    input: 'hsl(220, 14%, 24%)',        // 输入框背景
    border: 'hsl(220, 16%, 28%)',       // 边框
    borderLight: 'hsl(220, 16%, 32%)',  // 浅边框
    borderMedium: 'hsl(220, 16%, 36%)', // 中等边框
  },

  // 文本色板
  text: {
    primary: 'hsl(210, 11%, 85%)',      // 主文本
    secondary: 'hsl(210, 9%, 65%)',     // 次要文本
    tertiary: 'hsl(210, 7%, 45%)',      // 三级文本
    muted: 'hsl(210, 7%, 35%)',         // 弱化文本
    disabled: 'hsl(210, 7%, 25%)',      // 禁用文本
  },

  // 功能色板
  primary: {
    50: 'hsl(276, 100%, 97%)',
    100: 'hsl(276, 100%, 93%)',
    500: '#9d00ff',                    // 主色 - 紫红色
    600: 'hsl(276, 100%, 55%)',
    700: 'hsl(276, 100%, 48%)',
  },

  success: {
    50: 'hsl(142, 76%, 96%)',
    100: 'hsl(142, 76%, 88%)',
    500: 'hsl(142, 76%, 36%)',         // 成功色
    600: 'hsl(142, 76%, 30%)',
  },

  error: {
    50: 'hsl(0, 84%, 97%)',
    100: 'hsl(0, 84%, 92%)',
    500: 'hsl(0, 84%, 60%)',           // 错误色
    600: 'hsl(0, 84%, 50%)',
  },

  warning: {
    50: 'hsl(38, 92%, 96%)',
    100: 'hsl(38, 92%, 88%)',
    500: 'hsl(38, 92%, 50%)',          // 警告色
    600: 'hsl(38, 92%, 40%)',
  },
};

// 间距系统 - 严格遵循4px网格，8px基础单位
export const spacing = {
  0: '0px',
  1: '4px',    // micro
  2: '8px',    // base unit
  3: '12px',   // small
  4: '16px',   // medium
  5: '20px',   // large
  6: '24px',   // xlarge
  8: '32px',   // xxlarge
  10: '40px',  // huge
  12: '48px',  // massive
};

// 字阶系统 - 基于几何级数
export const typography = {
  fontSize: {
    xs: '11px',    // 辅助信息
    sm: '12px',    // 小标签
    base: '13px',  // 正文
    lg: '14px',    // 大正文
    xl: '16px',    // 小标题
    '2xl': '18px', // 大标题
  },

  fontWeight: {
    normal: 400,
    medium: 500,  // 中等 - 用于次要强调
    semibold: 600, // 半粗 - 用于标题
    bold: 700,     // 粗体 - 用于重要强调
  },

  lineHeight: {
    tight: '1.2',
    normal: '1.4',
    relaxed: '1.6',
  },
};

// 圆角系统
export const borderRadius = {
  none: '0px',
  sm: '4px',     // 小圆角 - 用于内部元素
  base: '6px',   // 基础圆角 - 用于按钮、输入框
  md: '8px',     // 中等圆角 - 用于卡片
  lg: '12px',    // 大圆角 - 用于弹窗
  full: '9999px', // 完全圆角 - 用于徽章
};

// 阴影系统 - 分层阴影
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',                    // 微妙阴影
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // 基础阴影
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // 中等阴影
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // 大阴影
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', // 超大阴影

  // 特殊阴影
  focus: `0 0 0 2px ${colors.primary[500]}`,                // 焦点阴影
  error: `0 0 0 2px ${colors.error[500]}`,                // 错误阴影
};

// 过渡动画系统
export const transitions = {
  duration: {
    fast: '150ms',    // 快速过渡 - 用于hover
    normal: '200ms',  // 正常过渡 - 用于大部分交互
    slow: '300ms',    // 慢速过渡 - 用于复杂动画
  },

  easing: {
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',     // 标准缓出
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',      // 标准缓入
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // 标准缓入缓出
  },
};

// 容器尺寸
export const container = {
  maxWidth: '440px',  // 弹窗最大宽度
  minHeight: '520px', // 弹窗最小高度
  headerHeight: '68px', // 头部高度
  tabsHeight: '56px',   // 标签页高度
  buttonHeight: '36px', // 按钮标准高度
  inputHeight: '36px',  // 输入框标准高度
};

// Z-index层级
export const zIndex = {
  base: 0,
  overlay: 1000,
  modal: 10000,
  tooltip: 100000,
};

// 组合常用样式
export const semanticTokens = {
  // 按钮尺寸
  button: {
    height: container.buttonHeight,
    padding: `0 ${spacing[4]}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
  },

  // 输入框尺寸
  input: {
    height: container.inputHeight,
    padding: `0 ${spacing[3]}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.bg.borderLight}`,
    transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
  },

  // 卡片样式
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.md,
    backgroundColor: colors.bg.elevated,
    border: `1px solid ${colors.bg.borderLight}`,
    boxShadow: shadows.sm,
  },
};

// CSS变量映射 - 用于React内联样式
export const cssVars = {
  // 背景色 - 深色主题
  '--color-bg-primary': colors.bg.primary,
  '--color-bg-secondary': colors.bg.secondary,
  '--color-bg-elevated': colors.bg.elevated,
  '--color-bg-surface': colors.bg.surface,
  '--color-bg-input': colors.bg.input,
  '--color-bg-border': colors.bg.border,
  '--color-bg-border-light': colors.bg.borderLight,
  '--color-bg-border-medium': colors.bg.borderMedium,

  // 文本色 - 深色主题
  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-tertiary': colors.text.tertiary,
  '--color-text-muted': colors.text.muted,
  '--color-text-disabled': colors.text.disabled,

  // 功能色 - 紫红色主题
  '--color-primary-50': colors.primary[50],
  '--color-primary-100': colors.primary[100],
  '--color-primary-500': colors.primary[500],
  '--color-primary-600': colors.primary[600],
  '--color-success-500': colors.success[500],
  '--color-success-600': colors.success[600],
  '--color-error-500': colors.error[500],
  '--color-error-600': colors.error[600],
  '--color-warning-500': colors.warning[500],
  '--color-warning-600': colors.warning[600],

  // 间距
  '--spacing-1': spacing[1],
  '--spacing-2': spacing[2],
  '--spacing-3': spacing[3],
  '--spacing-4': spacing[4],
  '--spacing-5': spacing[5],
  '--spacing-6': spacing[6],
  '--spacing-8': spacing[8],

  // 圆角
  '--radius-none': borderRadius.none,
  '--radius-sm': borderRadius.sm,
  '--radius-base': borderRadius.base,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-full': borderRadius.full,

  // 过渡
  '--transition-fast': transitions.duration.fast,
  '--transition-normal': transitions.duration.normal,
  '--transition-slow': transitions.duration.slow,
  '--transition-base': `${transitions.duration.normal} ${transitions.easing.easeOut}`,
};

export type DesignToken = typeof colors | typeof spacing | typeof typography | typeof borderRadius | typeof shadows | typeof transitions;