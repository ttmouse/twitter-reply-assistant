/**
 * 自定义风格管理组件
 *
 * 提供自定义回复风格的 CRUD 功能界面
 */

import React, { useState, useEffect } from 'react';
import { StorageService, ConfigValidator } from '../services/storage-service';
import type { CustomReplyStyle } from '../types';
import { MAX_CUSTOM_STYLES, CUSTOM_STYLE_CONSTRAINTS, ErrorHelper } from '../types';
import { Settings, Plus, Edit3, Trash2, AlertCircle, Check, Loader2, Palette, Clock, MessageSquare, X } from 'lucide-react';


// 浮层编辑组件
interface EditModalProps {
  isOpen: boolean;
  style: CustomReplyStyle | null;
  onClose: () => void;
  onSave: (data: Omit<CustomReplyStyle, 'id' | 'createdAt'>) => Promise<void>;
  isLoading: boolean;
  formErrors: string[];
}

function EditModal({ isOpen, style, onClose, onSave, isLoading, formErrors }: EditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    updatedAt: Date.now(),
  });

  useEffect(() => {
    if (style) {
      setFormData({
        name: style.name,
        description: style.description,
        systemPrompt: style.systemPrompt,
        updatedAt: style.updatedAt,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        systemPrompt: '',
        updatedAt: Date.now(),
      });
    }
  }, [style]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-base)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '24px',
          boxSizing: 'border-box',
          animation: 'fadeIn var(--transition-base) ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--color-primary)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {style ? (
                <Edit3 size={16} style={{ color: '#F8F8FA' }} />
              ) : (
                <Plus size={16} style={{ color: '#F8F8FA' }} />
              )}
            </div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              {style ? '编辑风格' : '添加新风格'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-base)'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 表单内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 风格名称 */}
          <div>
            <label style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
              display: 'block'
            }}>
              风格名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, updatedAt: Date.now() })}
              placeholder="例如：诗意浪漫"
              maxLength={CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                fontSize: '14px',
                background: 'var(--color-bg-surface)',
                border: `1px solid var(--color-border-light)`,
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-base)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
              textAlign: 'right'
            }}>
              {formData.name.length}/{CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
            </div>
          </div>

          
          {/* 描述/}
          <div>
            <label style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
              display: 'block'
            }}>
              描述
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value, updatedAt: Date.now() })}
              placeholder="例如：适用于文艺、情感类话题"
              maxLength={CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                fontSize: '14px',
                background: 'var(--color-bg-surface)',
                border: `1px solid var(--color-border-light)`,
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-base)',
                boxSizing: 'border-box'
              }}
            />
            <div style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
              textAlign: 'right'
            }}>
              {formData.description.length}/{CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
            </div>
          </div>

          {/* 系统提示词 */}
          <div>
            <label style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '8px',
              display: 'block'
            }}>
              系统提示词 *
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value, updatedAt: Date.now() })}
              placeholder="例如：你是一个富有诗意的评论者。请用优美、浪漫的语言回复推文，可以引用诗句或使用比喻..."
              rows={6}
              maxLength={CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                background: 'var(--color-bg-surface)',
                border: `1px solid var(--color-border-light)`,
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                transition: 'all var(--transition-base)',
                boxSizing: 'border-box',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.5,
                minHeight: '120px'
              }}
            />
            <div style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              marginTop: '6px',
              textAlign: 'right'
            }}>
              {formData.systemPrompt.length}/{CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH}
              {' '}（至少 {CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH} 字符）
            </div>
          </div>

          {/* 验证错误 */}
          {formErrors.length > 0 && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255, 107, 107, 0.08)',
              border: `1px solid rgba(255, 107, 107, 0.15)`,
              borderRadius: '8px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertCircle
                  size={16}
                  style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--color-error)',
                    marginBottom: '8px',
                    margin: '0 0 8px 0'
                  }}>
                    请修正以下错误：
                  </p>
                  <ul style={{
                    fontSize: '12px',
                    color: 'var(--color-error)',
                    margin: 0,
                    paddingLeft: '16px',
                    listStylePosition: 'inside'
                  }}>
                    {formErrors.map((error, index) => (
                      <li key={index} style={{ marginBottom: '4px' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '8px'
          }}>
            <button
              onClick={() => onSave({ ...formData, icon: '🎨' })}
              disabled={isLoading}
              style={{
                flex: 1,
                height: '44px',
                padding: '0 16px',
                fontSize: '14px',
                fontWeight: 600,
                background: isLoading ? 'var(--color-bg-muted)' : 'var(--color-primary)',
                color: isLoading ? 'var(--color-text-disabled)' : '#F8F8FA',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{style ? '保存修改' : '添加风格'}</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                height: '44px',
                padding: '0 16px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-light)',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <X size={16} />
              <span>取消</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomStyleManager() {
  const [styles, setStyles] = useState<CustomReplyStyle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 浮层状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStyle, setEditingStyle] = useState<CustomReplyStyle | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // 加载自定义风格
  useEffect(() => {
    loadStyles();
  }, []);

  // 当组件重新获得焦点时重新加载（从其他标签切换回来时）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadStyles();
      }
    };

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 也监听 storage 事件，跨标签页同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'customStyles' || e.key === 'customStyle') {
        loadStyles();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadStyles = async () => {
    try {
      const loadedStyles = await StorageService.getCustomStyles();
      setStyles(loadedStyles);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: `加载失败：${formatted}` });
    }
  };

  // 打开添加表单
  const handleAdd = () => {
    setEditingStyle(null);
    setFormErrors([]);
    setShowEditModal(true);
  };

  // 打开编辑表单
  const handleEdit = (style: CustomReplyStyle) => {
    setEditingStyle(style);
    setFormErrors([]);
    setShowEditModal(true);
  };

  // 保存（添加或更新）
  const handleSave = async (data: Omit<CustomReplyStyle, 'id' | 'createdAt'>) => {
    // 确保有图标（添加默认图标如果用户没有自定义）
    const dataWithIcon = {
      ...data,
      icon: data.icon || '🎨' // 默认图标
    };

    // 验证
    const validation = ConfigValidator.validateCustomStyle(dataWithIcon);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setFormErrors([]);

    try {
      if (editingStyle) {
        // 更新
        await StorageService.updateCustomStyle(editingStyle.id, dataWithIcon);
        setMessage({ type: 'success', text: '✅ 风格已更新' });
      } else {
        // 添加
        await StorageService.saveCustomStyle(dataWithIcon);
        setMessage({ type: 'success', text: '✅ 风格已添加' });
      }

      // 重新加载列表
      await loadStyles();

      // 关闭浮层
      setShowEditModal(false);
      setEditingStyle(null);

      // 3秒后清除消息
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: formatted });
    } finally {
      setIsLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除"${name}"风格吗？此操作不可撤销。`)) {
      return;
    }

    setIsLoading(true);

    try {
      await StorageService.deleteCustomStyle(id);
      setMessage({ type: 'success', text: '✅ 风格已删除' });

      // 重新加载列表
      await loadStyles();

      // 3秒后清除消息
      setTimeout(() => setMessage(null), 3000);
    } catch (error: unknown) {
      const formatted = ErrorHelper.formatForUser(error);
      setMessage({ type: 'error', text: formatted });
    } finally {
      setIsLoading(false);
    }
  };

  // 关闭浮层
  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingStyle(null);
    setFormErrors([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* 顶部标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
            自定义回复风格
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
            {styles.length}/{MAX_CUSTOM_STYLES} 个风格
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES}
          style={{
            padding: '10px 20px',
            fontSize: '13px',
            fontWeight: 600,
            height: '40px',
            background: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? 'var(--color-bg-muted)'
              : 'var(--color-primary)',
            color: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? 'var(--color-text-disabled)'
              : '#F8F8FA',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? 'not-allowed'
              : 'pointer',
            transition: 'all var(--transition-base)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <Plus size={16} />
          <span>添加新风格</span>
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{
          padding: '12px 16px',
          background: message.type === 'success'
            ? 'rgba(95, 207, 128, 0.08)'
            : 'rgba(255, 107, 107, 0.08)',
          border: `1px solid ${
            message.type === 'success'
              ? 'rgba(95, 207, 128, 0.15)'
              : 'rgba(255, 107, 107, 0.15)'
          }`,
          borderRadius: '8px',
          animation: 'fadeIn var(--transition-base) ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: message.type === 'success'
                ? 'var(--color-success)'
                : 'var(--color-error)'
            }}>
              {message.type === 'success' ? (
                <Check
                  size={12}
                  style={{ color: '#F8F8FA' }}
                />
              ) : (
                <AlertCircle
                  size={12}
                  style={{ color: '#F8F8FA' }}
                />
              )}
            </div>
            <span style={{
              fontSize: '13px',
              color: message.type === 'success'
                ? 'var(--color-success)'
                : 'var(--color-error)',
              fontWeight: 500
            }}>
              {message.text}
            </span>
          </div>
        </div>
      )}

      {/* 编辑浮层 */}
      <EditModal
        isOpen={showEditModal}
        style={editingStyle}
        onClose={handleCloseModal}
        onSave={handleSave}
        isLoading={isLoading}
        formErrors={formErrors}
      />

      {/* 风格列表 */}
      {styles.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          background: 'var(--color-bg-elevated)',
          borderRadius: '8px',
          border: `1px solid var(--color-border-light)`,
          textAlign: 'center',
          animation: 'fadeIn var(--transition-base) ease-out'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: '0 0 8px 0'
          }}>
            还没有自定义风格
          </h3>
          <p style={{
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            margin: '0 0 20px 0',
            lineHeight: 1.4
          }}>
            创建属于您的个性化回复风格，让AI回复更符合您的表达习惯
          </p>
          <button
            onClick={handleAdd}
            disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 600,
              height: '40px',
              background: isLoading || styles.length >= MAX_CUSTOM_STYLES
                ? 'var(--color-bg-muted)'
                : 'var(--color-primary)',
              color: isLoading || styles.length >= MAX_CUSTOM_STYLES
                ? 'var(--color-text-disabled)'
                : '#F8F8FA',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoading || styles.length >= MAX_CUSTOM_STYLES
                ? 'not-allowed'
                : 'pointer',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            <span>创建第一个风格</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {styles.map((style, index) => (
            <div
              key={style.id}
              style={{
                padding: '18px 20px',
                background: 'var(--color-bg-elevated)',
                borderRadius: '10px',
                border: `1px solid var(--color-border-light)`,
                transition: 'all 0.2s ease',
                animation: `fadeIn 0.3s ease-out ${index * 0.06}s both`,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 标题行包含操作按钮 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '-0.2px'
                    }}>
                      {style.name}
                    </h3>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{
                    display: 'flex',
                    gap: '6px',
                    flexShrink: 0
                  }}>
                    <button
                      onClick={() => handleEdit(style)}
                      disabled={isLoading}
                      title="编辑"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: isLoading
                          ? 'var(--color-bg-muted)'
                          : 'linear-gradient(135deg, var(--color-primary), rgba(107, 127, 255, 0.9))',
                        color: isLoading
                          ? 'var(--color-text-disabled)'
                          : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(107, 127, 255, 0.25)',
                        fontSize: '15px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(107, 127, 255, 0.35)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(107, 127, 255, 0.25)';
                      }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(style.id, style.name)}
                      disabled={isLoading}
                      title="删除"
                      style={{
                        width: '34px',
                        height: '34px',
                        background: 'var(--color-bg-elevated)',
                        color: 'var(--color-error)',
                        border: '1.5px solid var(--color-error)',
                        borderRadius: '8px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px'
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.background = 'var(--color-error)';
                          e.currentTarget.style.color = '#FFFFFF';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-bg-elevated)';
                        e.currentTarget.style.color = 'var(--color-error)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* 内容部分 */}
                <div>
                  {/* 系统提示词预览 */}
                  <div style={{
                    background: 'linear-gradient(135deg, var(--color-bg-subtle), rgba(0, 0, 0, 0.02))',
                    borderRadius: '8px',
                    padding: '16px',
                    border: `1px solid rgba(0, 0, 0, 0.06)`,
                    marginBottom: '10px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--color-text-tertiary)',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        background: 'var(--color-primary)',
                        borderRadius: '50%',
                        opacity: 0.6
                      }} />
                      系统提示词
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      margin: 0,
                      letterSpacing: '0.1px'
                    }}>
                      {style.systemPrompt}
                    </p>
                  </div>

                  {/* 时间戳 */}
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--color-text-tertiary)',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '10px' }}>●</span>
                    {new Date(style.createdAt).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 限制提示 */}
      {styles.length >= MAX_CUSTOM_STYLES && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(255, 179, 102, 0.1)',
          border: `1px solid rgba(255, 179, 102, 0.3)`,
          borderRadius: '8px',
          animation: 'fadeIn var(--transition-base) ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle
              size={16}
              style={{ color: 'var(--color-warning)', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--color-warning)',
                marginBottom: '2px'
              }}>
                已达到风格数量上限
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--color-warning)',
                opacity: 0.9
              }}>
                您已创建 {MAX_CUSTOM_STYLES} 个自定义风格，请先删除现有风格再添加新风格。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
