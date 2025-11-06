/**
 * 自定义风格编辑浮层组件
 *
 * 使用统一的Modal组件重构
 */

import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Check, X, AlertCircle } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, transitions, container } from '../styles/design-tokens';
import { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
import { Button, ButtonGroup } from './Button';
import type { CustomReplyStyle } from '../types';
import { CUSTOM_STYLE_CONSTRAINTS } from '../types';

interface EditModalProps {
  isOpen: boolean;
  style: CustomReplyStyle | null;
  onClose: () => void;
  onSave: (data: Omit<CustomReplyStyle, 'id' | 'createdAt'>) => Promise<void>;
  isLoading: boolean;
  formErrors: string[];
}

export function EditModal({ isOpen, style, onClose, onSave, isLoading, formErrors }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: '',
    updatedAt: Date.now(),
  });

  useEffect(() => {
    if (style) {
      setFormData({
        name: style.name,
        systemPrompt: style.systemPrompt,
        updatedAt: style.updatedAt,
      });
    } else {
      setFormData({
        name: '',
        systemPrompt: '',
        updatedAt: Date.now(),
      });
    }
  }, [style]);

  const handleSave = () => {
    onSave({
      ...formData,
      icon: '🎨',
      description: '' // 添加空的描述字段以保持兼容性
    });
  };

  const renderInputField = (
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    placeholder: string,
    maxLength: number,
    currentLength: number,
    required: boolean = false,
    isTextarea: boolean = false
  ) => (
    <div>
      <label style={{
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text.primary,
        marginBottom: spacing[2],
        display: 'block',
      }}>
        {label} {required && '*'}
      </label>
      {isTextarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={6}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: spacing[3],
            fontSize: typography.fontSize.base,
            backgroundColor: colors.bg.input,
            border: `1px solid ${colors.bg.borderLight}`,
            borderRadius: borderRadius.base,
            color: colors.text.primary,
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
            boxSizing: 'border-box',
            resize: 'none',
            fontFamily: 'inherit',
            lineHeight: typography.lineHeight.relaxed,
            minHeight: '120px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary[500];
            e.currentTarget.style.boxShadow = shadows.focus;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.bg.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          style={{
            width: '100%',
            height: container.inputHeight,
            padding: `0 ${spacing[3]}`,
            fontSize: typography.fontSize.base,
            backgroundColor: colors.bg.input,
            border: `1px solid ${colors.bg.borderLight}`,
            borderRadius: borderRadius.base,
            color: colors.text.primary,
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
            boxSizing: 'border-box',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = colors.primary[500];
            e.currentTarget.style.boxShadow = shadows.focus;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = colors.bg.borderLight;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      )}
      <div style={{
        fontSize: typography.fontSize.xs,
        color: colors.text.muted,
        marginTop: spacing[1],
        textAlign: 'right',
      }}>
        {currentLength}/{maxLength}
        {isTextarea && (
          <span>（至少 {CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH} 字符）</span>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="600px"
      closeOnEscape={true}
      closeOnBackdrop={true}
    >
      <ModalHeader
        title={style ? '编辑风格' : '添加新风格'}
        onClose={onClose}
        icon={style ? (
          <Edit3 size={16} style={{ color: '#FFFFFF' }} />
        ) : (
          <Plus size={16} style={{ color: '#FFFFFF' }} />
        )}
      />

      <ModalBody padding={`${spacing[5]} ${spacing[6]} ${spacing[4]} ${spacing[6]}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          {/* 风格名称 */}
          {renderInputField(
            '风格名称',
            formData.name,
            (e) => setFormData({ ...formData, name: e.target.value, updatedAt: Date.now() }),
            '例如：诗意浪漫',
            CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH,
            formData.name.length,
            true,
            false
          )}

          {/* 系统提示词 */}
          {renderInputField(
            '系统提示词',
            formData.systemPrompt,
            (e) => setFormData({ ...formData, systemPrompt: e.target.value, updatedAt: Date.now() }),
            '例如：你是一个富有诗意的评论者。请用优美、浪漫的语言回复推文，可以引用诗句或使用比喻...',
            CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH,
            formData.systemPrompt.length,
            true,
            true
          )}

          {/* 验证错误 */}
          {formErrors.length > 0 && (
            <div style={{
              padding: `${spacing[3]} ${spacing[4]}`,
              background: `${colors.error[500]}08`,
              border: `1px solid ${colors.error[500]}15`,
              borderRadius: borderRadius.base,
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: spacing[3],
              }}>
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
                    请修正以下错误：
                  </p>
                  <ul style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.error[500],
                    margin: 0,
                    paddingLeft: spacing[4],
                    listStylePosition: 'inside',
                  }}>
                    {formErrors.map((error, index) => (
                      <li key={index} style={{ marginBottom: spacing[1] }}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <ButtonGroup fullWidth spacing={3}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
            size="md"
            leftIcon={isLoading ? undefined : <Check size={16} />}
          >
            {style ? '保存修改' : '添加风格'}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            size="md"
            leftIcon={<X size={16} />}
          >
            取消
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
}
