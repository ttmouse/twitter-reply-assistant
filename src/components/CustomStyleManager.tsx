/**
 * 自定义风格管理组件
 *
 * 提供自定义回复风格的 CRUD 功能界面
 */

import React, { useState, useEffect } from 'react';
import { StorageService, ConfigValidator } from '../services/storage-service';
import type { CustomReplyStyle } from '../types';
import { MAX_CUSTOM_STYLES, ErrorHelper } from '../types';
import { Settings, Plus, Edit3, Trash2, AlertCircle, Palette, Clock, MessageSquare } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows, transitions, container } from '../styles/design-tokens';
import { Button, ButtonGroup } from './Button';
import { EditModal } from './CustomStyleManagerEditModal';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
      {/* 顶部标题栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing[4],
      }}>
        <div>
          <h3 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[1]} 0`
          }}>
            自定义回复风格
          </h3>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0
          }}>
            {styles.length}/{MAX_CUSTOM_STYLES} 个风格
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES}
          style={{
            padding: `0 ${spacing[5]}`,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            height: container.buttonHeight,
            background: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? colors.bg.border
              : colors.primary[500],
            color: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? colors.text.disabled
              : '#FFFFFF',
            border: 'none',
            borderRadius: borderRadius.base,
            cursor: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? 'not-allowed'
              : 'pointer',
            transition: `all ${transitions.duration.normal} ${transitions.easing.easeOut}`,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            whiteSpace: 'nowrap',
            flexShrink: 0,
            boxShadow: isLoading || styles.length >= MAX_CUSTOM_STYLES
              ? 'none'
              : shadows.sm,
          }}
          onMouseEnter={(e) => {
            if (!isLoading && styles.length < MAX_CUSTOM_STYLES) {
              e.currentTarget.style.backgroundColor = colors.primary[600];
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = shadows.md;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && styles.length < MAX_CUSTOM_STYLES) {
              e.currentTarget.style.backgroundColor = colors.primary[500];
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = shadows.sm;
            }
          }}
        >
          <Plus size={16} />
          <span>添加新风格</span>
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div style={{
          padding: `${spacing[3]} ${spacing[4]}`,
          background: message.type === 'success'
            ? `${colors.success[500]}08`
            : `${colors.error[500]}08`,
          border: `1px solid ${
            message.type === 'success'
              ? `${colors.success[500]}15`
              : `${colors.error[500]}15`
          }`,
          borderRadius: borderRadius.base,
          animation: `fadeIn ${transitions.duration.normal} ${transitions.easing.easeOut}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: borderRadius.full,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: message.type === 'success'
                ? colors.success[500]
                : colors.error[500]
            }}>
              {message.type === 'success' ? (
                <span style={{ color: '#FFFFFF', fontSize: '12px' }}>✓</span>
              ) : (
                <AlertCircle
                  size={12}
                  style={{ color: '#FFFFFF' }}
                />
              )}
            </div>
            <span style={{
              fontSize: typography.fontSize.sm,
              color: message.type === 'success'
                ? colors.success[500]
                : colors.error[500],
              fontWeight: typography.fontWeight.medium
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
          padding: `${spacing[10]} ${spacing[5]}`,
          background: colors.bg.elevated,
          borderRadius: borderRadius.base,
          border: `1px solid ${colors.bg.borderLight}`,
          textAlign: 'center',
          animation: `fadeIn ${transitions.duration.normal} ${transitions.easing.easeOut}`
        }}>
          <h3 style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[2]} 0`
          }}>
            还没有自定义风格
          </h3>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: `0 0 ${spacing[4]} 0`,
            lineHeight: typography.lineHeight.normal
          }}>
            创建属于您的个性化回复风格，让AI回复更符合您的表达习惯
          </p>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES}
            loading={isLoading}
            leftIcon={<Plus size={16} />}
          >
            创建第一个风格
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          {styles.map((style, index) => (
            <div
              key={style.id}
              style={{
                padding: `${spacing[3]} ${spacing[4]}`, // 12px 16px - 减少内边距
                background: colors.bg.elevated,
                borderRadius: borderRadius.md, // 8px - 稍微减少圆角
                border: `1px solid ${colors.bg.borderLight}`,
                transition: `all ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                animation: `fadeIn 0.3s ease-out ${index * 0.06}s both`,
                boxShadow: shadows.sm,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}> {/* 12px gap */}
                {/* 标题行包含操作按钮 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: spacing[3], // 12px gap
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0
                  }}>
                    <h3 style={{
                      fontSize: typography.fontSize.lg, // 14px - 减小字体
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.2,
                    }}>
                      {style.name}
                    </h3>
                  </div>

                  {/* 操作按钮 */}
                  <div style={{
                    display: 'flex',
                    gap: spacing[1], // 4px gap - 减少按钮间距
                    flexShrink: 0,
                  }}>
                    <button
                      onClick={() => handleEdit(style)}
                      disabled={isLoading}
                      title="编辑"
                      style={{
                        width: '28px', // 减小按钮尺寸
                        height: '28px',
                        background: isLoading
                          ? colors.bg.border
                          : `${colors.primary[500]}15`, // 非常淡的背景色
                        color: isLoading
                          ? colors.text.disabled
                          : colors.primary[500], // 使用主色而不是白色
                        border: `1px solid ${colors.primary[500]}20`, // 非常淡的边框
                        borderRadius: borderRadius.sm, // 4px - 更小的圆角
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: `all ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.background = `${colors.primary[500]}25`; // 稍微增强背景
                          e.currentTarget.style.borderColor = `${colors.primary[500]}40`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${colors.primary[500]}15`;
                        e.currentTarget.style.borderColor = `${colors.primary[500]}20`;
                      }}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(style.id, style.name)}
                      disabled={isLoading}
                      title="删除"
                      style={{
                        width: '28px', // 减小按钮尺寸
                        height: '28px',
                        background: `${colors.error[500]}10`, // 非常淡的红色背景
                        color: colors.error[500],
                        border: `1px solid ${colors.error[500]}20`, // 非常淡的边框
                        borderRadius: borderRadius.sm, // 4px
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: `all ${transitions.duration.fast} ${transitions.easing.easeOut}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLoading) {
                          e.currentTarget.style.background = `${colors.error[500]}20`; // 稍微增强背景
                          e.currentTarget.style.borderColor = `${colors.error[500]}35`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `${colors.error[500]}10`;
                        e.currentTarget.style.borderColor = `${colors.error[500]}20`;
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* 内容部分 */}
                <div>
                  {/* 系统提示词预览 */}
                  <div style={{
                    background: colors.bg.surface,
                    borderRadius: borderRadius.sm, // 4px
                    padding: spacing[3], // 12px - 减少padding
                    border: `1px solid ${colors.bg.borderLight}`,
                    marginBottom: spacing[2], // 8px - 减少底部间距
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      fontSize: typography.fontSize.xs, // 11px
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.tertiary,
                      marginBottom: spacing[2], // 8px
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px', // 减少字间距
                      display: 'flex',
                      alignItems: 'center',
                      gap: spacing[1], // 4px
                    }}>
                      <div style={{
                        width: '4px', // 更小的圆点
                        height: '4px',
                        background: colors.primary[500],
                        borderRadius: borderRadius.full,
                        opacity: 0.4, // 更透明的圆点
                      }} />
                      系统提示词
                    </div>
                    <p style={{
                      fontSize: typography.fontSize.sm, // 12px - 减小字体
                      color: colors.text.secondary,
                      lineHeight: typography.lineHeight.normal, // 1.4
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      margin: 0,
                    }}>
                      {style.systemPrompt}
                    </p>
                  </div>

                  {/* 时间戳 */}
                  <div style={{
                    fontSize: typography.fontSize.xs, // 11px
                    color: colors.text.tertiary,
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[1], // 4px
                  }}>
                    <span style={{
                      fontSize: '6px', // 更小的圆点
                      opacity: 0.3, // 更透明
                    }}>●</span>
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
          padding: `${spacing[3]} ${spacing[4]}`,
          background: `${colors.warning[500]}10`,
          border: `1px solid ${colors.warning[500]}30`,
          borderRadius: borderRadius.base,
          animation: `fadeIn ${transitions.duration.normal} ${transitions.easing.easeOut}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[3]
          }}>
            <AlertCircle
              size={16}
              style={{ color: colors.warning[500], flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.semibold,
                color: colors.warning[500],
                marginBottom: spacing[0]
              }}>
                已达到风格数量上限
              </div>
              <div style={{
                fontSize: typography.fontSize.xs,
                color: colors.warning[500],
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