/**
 * 自定义风格管理组件
 *
 * 提供自定义回复风格的 CRUD 功能界面
 */

import React, { useState, useEffect } from 'react';
import { StorageService, ConfigValidator } from '../services/storage-service';
import type { CustomReplyStyle } from '../types';
import { MAX_CUSTOM_STYLES, CUSTOM_STYLE_CONSTRAINTS, ErrorHelper } from '../types';

// 常用 emoji 供快速选择
const COMMON_EMOJIS = ['🎨', '✨', '💡', '🚀', '⚡', '🌟', '💎', '🔥', '🎯', '🎪', '🎭', '🎬'];

export function CustomStyleManager() {
  const [styles, setStyles] = useState<CustomReplyStyle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 表单状态
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '🎨',
    description: '',
    systemPrompt: '',
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // 加载自定义风格
  useEffect(() => {
    loadStyles();
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
    setEditingId(null);
    setFormData({
      name: '',
      icon: '🎨',
      description: '',
      systemPrompt: '',
    });
    setFormErrors([]);
    setShowForm(true);
  };

  // 打开编辑表单
  const handleEdit = (style: CustomReplyStyle) => {
    setEditingId(style.id);
    setFormData({
      name: style.name,
      icon: style.icon,
      description: style.description,
      systemPrompt: style.systemPrompt,
    });
    setFormErrors([]);
    setShowForm(true);
  };

  // 保存（添加或更新）
  const handleSave = async () => {
    // 验证
    const validation = ConfigValidator.validateCustomStyle(formData);
    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setFormErrors([]);

    try {
      if (editingId) {
        // 更新
        await StorageService.updateCustomStyle(editingId, formData);
        setMessage({ type: 'success', text: '✅ 风格已更新' });
      } else {
        // 添加
        await StorageService.saveCustomStyle(formData);
        setMessage({ type: 'success', text: '✅ 风格已添加' });
      }

      // 重新加载列表
      await loadStyles();

      // 关闭表单
      setShowForm(false);
      setEditingId(null);

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

  // 取消编辑
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormErrors([]);
  };

  return (
    <div className="space-y-4">
      {/* 顶部统计和添加按钮 */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-gray-800">自定义回复风格</h3>
          <p className="text-sm text-gray-600 mt-1">
            {styles.length}/{MAX_CUSTOM_STYLES} 个风格
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isLoading || styles.length >= MAX_CUSTOM_STYLES || showForm}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          ➕ 添加新风格
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-3 rounded border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <pre className="text-sm whitespace-pre-wrap font-sans">{message.text}</pre>
        </div>
      )}

      {/* 添加/编辑表单 */}
      {showForm && (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold text-gray-800 mb-3">
            {editingId ? '✏️ 编辑风格' : '➕ 添加新风格'}
          </h4>

          <div className="space-y-3">
            {/* 风格名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                风格名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：诗意浪漫"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.name.length}/{CUSTOM_STYLE_CONSTRAINTS.NAME_MAX_LENGTH}
              </p>
            </div>

            {/* 图标选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                图标 *
              </label>
              <div className="flex gap-2 mb-2">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-10 h-10 text-xl rounded border-2 transition-colors ${
                      formData.icon === emoji
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="或输入自定义 emoji"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.ICON_MAX_LENGTH}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述 *
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="例如：适用于文艺、情感类话题"
                maxLength={CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/{CUSTOM_STYLE_CONSTRAINTS.DESCRIPTION_MAX_LENGTH}
              </p>
            </div>

            {/* 系统提示词 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                系统提示词 *
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="例如：你是一个富有诗意的评论者。请用优美、浪漫的语言回复推文，可以引用诗句或使用比喻..."
                rows={10}
                maxLength={CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.systemPrompt.length}/{CUSTOM_STYLE_CONSTRAINTS.PROMPT_MAX_LENGTH} （至少 {CUSTOM_STYLE_CONSTRAINTS.PROMPT_MIN_LENGTH} 字符）
              </p>
            </div>

            {/* 验证错误 */}
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800 font-medium mb-1">❌ 请修正以下错误：</p>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {formErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '保存中...' : editingId ? '💾 保存修改' : '➕ 添加风格'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 风格列表 */}
      {styles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-4xl mb-2">🎨</p>
          <p className="text-sm">暂无自定义风格</p>
          <p className="text-xs mt-1">点击上方按钮添加您的第一个风格</p>
        </div>
      ) : (
        <div className="space-y-2">
          {styles.map((style) => (
            <div
              key={style.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* 图标 */}
                  <span className="text-2xl flex-shrink-0">{style.icon}</span>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{style.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 border border-gray-200">
                      <p className="font-medium mb-1">系统提示词：</p>
                      <p className="whitespace-pre-wrap break-words">{style.systemPrompt}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      创建于 {new Date(style.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => handleEdit(style)}
                    disabled={isLoading || showForm}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    onClick={() => handleDelete(style.id, style.name)}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 限制提示 */}
      {styles.length >= MAX_CUSTOM_STYLES && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
          ⚠️ 已达到最大数量限制（{MAX_CUSTOM_STYLES} 个）。如需添加新风格，请先删除现有风格。
        </div>
      )}
    </div>
  );
}
