/**
 * 通用表单组件库
 *
 * 提供输入框、选择器、错误提示等表单元素的统一实现
 */

import React, { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, transitions, container } from '../styles/design-tokens';

// 输入框属性接口
interface InputProps {
  /** 是否错误 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 是否显示密码切换按钮 */
  showPasswordToggle?: boolean;
  /** 标签 */
  label?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 类型 */
  type?: 'text' | 'password' | 'email' | 'url' | 'number';
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符 */
  placeholder?: string;
  /** 值 */
  value?: string;
  /** 变更回调 */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 焦点回调 */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 失焦回调 */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** 最大长度 */
  maxLength?: number;
  /** 自动完成 */
  autoComplete?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 是否必填 */
  required?: boolean;
  /** 只读 */
  readOnly?: boolean;
}

// 输入框状态样式
const getInputStyles = (isFocused: boolean, hasError: boolean, disabled: boolean) => ({
  width: '100%',
  height: container.inputHeight,
  padding: `0 ${spacing[3]}`,
  fontSize: typography.fontSize.base,
  fontFamily: 'inherit',
  lineHeight: 1.4,
  backgroundColor: colors.bg.input,
  border: `1px solid ${hasError ? colors.error[500] : isFocused ? colors.primary[500] : colors.bg.borderLight}`,
  borderRadius: borderRadius.base,
  color: disabled ? colors.text.disabled : colors.text.primary,
  transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
  cursor: disabled ? 'not-allowed' : 'text',
  boxShadow: isFocused && !hasError ? shadows.focus : 'none',
  outline: 'none',
});

// 输入框组件
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  error = false,
  errorMessage,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  label,
  helpText,
  type,
  disabled,
  value,
  onChange,
  onFocus,
  onBlur,
  style,
  className,
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const actualType = type === 'password' && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;
  const hasError = error || Boolean(errorMessage);
  const displayRightIcon = rightIcon || (type === 'password' && showPasswordToggle);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const renderIcon = (icon: React.ReactNode, size: number = 16) => {
    if (!icon) return null;

    return React.cloneElement(icon as React.ReactElement, {
      size,
      style: {
        color: hasError ? colors.error[500] : isFocused ? colors.primary[500] : colors.text.muted,
        flexShrink: 0,
      },
    } as any);
  };

  return (
    <>
      <div style={{ width: '100%' }} className={className}>
        {/* 标签 */}
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: hasError ? colors.error[500] : colors.text.primary,
              marginBottom: spacing[1],
              transition: `color ${transitions.duration.fast} ${transitions.easing.easeOut}`,
            }}
          >
            {label}
          </label>
        )}

        {/* 输入框容器 */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 左侧图标 */}
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: spacing[3],
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              {renderIcon(leftIcon)}
            </div>
          )}

          {/* 输入框 */}
          <input
            ref={ref}
            type={actualType}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            style={{
              ...getInputStyles(isFocused, hasError, Boolean(disabled)),
              paddingLeft: leftIcon ? spacing[10] : spacing[3],
              paddingRight: displayRightIcon ? spacing[10] : spacing[3],
              ...style,
            }}
            className={`form-input ${className || ''}`}
            {...rest}
          />

          {/* 右侧图标 */}
          {displayRightIcon && (
            <div
              style={{
                position: 'absolute',
                right: spacing[2],
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {type === 'password' && showPasswordToggle ? (
                <button
                  type="button"
                  onClick={togglePassword}
                  disabled={disabled}
                  style={{
                    width: spacing[8],
                    height: spacing[8],
                    border: 'none',
                    background: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: borderRadius.full,
                    transition: `background-color ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                    color: hasError ? colors.error[500] : isFocused ? colors.primary[500] : colors.text.muted,
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.backgroundColor = `${colors.bg.surface}`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {renderIcon(showPassword ? <EyeOff /> : <Eye />)}
                </button>
              ) : (
                renderIcon(rightIcon)
              )}
            </div>
          )}
        </div>

        {/* 帮助文本 */}
        {helpText && !hasError && (
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.muted,
              marginTop: spacing[1],
              lineHeight: 1.4,
            }}
          >
            {helpText}
          </div>
        )}

        {/* 错误信息 */}
        {hasError && errorMessage && (
          <div
            style={{
              marginTop: spacing[1],
              padding: `${spacing[1]} ${spacing[3]}`,
              background: `${colors.error[500]}08`,
              border: `1px solid ${colors.error[500]}20`,
              borderRadius: borderRadius.base,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                marginBottom: spacing[1],
              }}
            >
              <AlertCircle
                size={12}
                style={{ color: colors.error[500], flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: typography.fontSize.xs,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.error[500],
                }}
              >
                {error ? '输入格式错误' : '请修正以下问题：'}
              </span>
            </div>
            {errorMessage && (
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.error[500],
                marginLeft: spacing[4],
              }}>
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS样式 - 处理伪元素选择器 */}
      <style>{`
        .form-input:-webkit-autofill,
        .form-input:-webkit-autofill:hover,
        .form-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px ${colors.bg.input} inset;
          -webkit-text-fill-color: ${colors.text.primary};
          transition: background-color 5000s ease-in-out 0s;
        }

        .form-input::placeholder {
          color: ${colors.text.tertiary};
        }

        .form-input:-ms-input-placeholder {
          color: ${colors.text.tertiary};
        }

        .form-input::-ms-input-placeholder {
          color: ${colors.text.tertiary};
        }
      `}</style>
    </>
  );
});

Input.displayName = 'Input';

// 选择器属性接口
interface SelectProps {
  /** 是否错误 */
  error?: boolean;
  /** 错误信息 */
  errorMessage?: string;
  /** 标签 */
  label?: string;
  /** 帮助文本 */
  helpText?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 值 */
  value?: string;
  /** 变更回调 */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** 选项 */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 是否必填 */
  required?: boolean;
}

// 选择器组件
export const Select: React.FC<SelectProps> = ({
  error = false,
  errorMessage,
  label,
  helpText,
  disabled,
  value,
  onChange,
  options,
  style,
  className,
  required,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasError = error || Boolean(errorMessage);

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
  };

  return (
    <div style={{ width: '100%' }} className={className}>
      {/* 标签 */}
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: hasError ? colors.error[500] : colors.text.primary,
            marginBottom: spacing[1],
            transition: `color ${transitions.duration.fast} ${transitions.easing.easeOut}`,
          }}
        >
          {label}
          {required && (
            <span style={{ color: colors.error[500], marginLeft: spacing[0] }}>*</span>
          )}
        </label>
      )}

      {/* 选择器 */}
      <select
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={{
          ...getInputStyles(isFocused, hasError, Boolean(disabled)),
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: `right ${spacing[3]} center`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          paddingRight: spacing[10],
          ...style,
        }}
        className={`form-select ${className || ''}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 帮助文本 */}
      {helpText && !hasError && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.muted,
            marginTop: spacing[1],
            lineHeight: 1.4,
          }}
        >
          {helpText}
        </div>
      )}

      {/* 错误信息 */}
      {hasError && errorMessage && (
        <div
          style={{
            marginTop: spacing[1],
            padding: `${spacing[1]} ${spacing[3]}`,
            background: `${colors.error[500]}08`,
            border: `1px solid ${colors.error[500]}20`,
            borderRadius: borderRadius.base,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <AlertCircle
              size={12}
              style={{ color: colors.error[500], flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.semibold,
                color: colors.error[500],
              }}
            >
              {errorMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// 表单错误组件
interface FormErrorProps {
  /** 错误信息列表 */
  errors: string[];
  /** 错误标题 */
  title?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ errors, title = '请修正以下问题：' }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div
      style={{
        padding: `${spacing[3]} ${spacing[4]}`,
        background: `${colors.error[500]}08`,
        border: `1px solid ${colors.error[500]}20`,
        borderRadius: borderRadius.base,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: spacing[3],
        }}
      >
        <AlertCircle
          size={16}
          style={{ color: colors.error[500], flexShrink: 0, marginTop: '2px' }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: colors.error[500],
            marginBottom: spacing[2],
            margin: '0 0 8px 0',
          }}>
            {title}
          </p>
          <ul style={{
            fontSize: typography.fontSize.sm,
            color: colors.error[500],
            margin: 0,
            paddingLeft: spacing[4],
            listStylePosition: 'inside',
          }}>
            {errors.map((error, index) => (
              <li key={index} style={{ marginBottom: spacing[1] }}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};