import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { StorageService, ConfigValidator } from '../services/storage-service';
import { AIService } from '../services/ai-service';
import type { AIConfig, AIProvider } from '../types';
import { PROVIDER_URLS, PROVIDER_NAMES, MODEL_SUGGESTIONS, REPLY_STYLES, ErrorHelper, AppError } from '../types';
import { CustomStyleManager } from '../components/CustomStyleManager';
import { Shield, FlaskConical, Zap, Settings, Check, AlertCircle, ChevronDown, Eye, EyeOff, Link2, Database, Bug, Loader2, TestTube } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'test' | 'customStyles'>('config');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 配置表单状态
  const [formData, setFormData] = useState<AIConfig>({
    provider: 'siliconflow',
    apiUrl: PROVIDER_URLS.siliconflow,
    apiToken: '',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  });

  const [showToken, setShowToken] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  // 加载配置
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cfg = await StorageService.getAIConfig();

      if (cfg) {
        setConfig(cfg);
        setFormData(cfg);
      } else {
        // 首次使用，切换到配置标签页
        setActiveTab('config');
      }

      const info = await StorageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error: unknown) {
      console.error('加载数据失败:', error);
      // Don't show error in UI for load failures, just log it
    }
  };

  // 处理提供商变化
  const handleProviderChange = (provider: AIProvider) => {
    let newFormData: AIConfig;

    if (provider === 'custom') {
      newFormData = {
        provider,
        apiUrl: '',
        apiToken: formData.apiToken,
        model: formData.model,
      };
    } else {
      newFormData = {
        provider,
        apiUrl: PROVIDER_URLS[provider],
        apiToken: formData.apiToken,
        model: MODEL_SUGGESTIONS[provider][0] || '',
      };
    }

    setFormData(newFormData);
  };

  // 保存配置
  const saveConfig = async () => {
    // 验证配置
    const validation = ConfigValidator.validateConfig(formData);

    if (!validation.valid) {
      setTestResult(`❌ 配置验证失败:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsSaving(true);
    setTestResult('');

    try {
      await StorageService.setAIConfig(formData);
      setConfig(formData);
      await loadData();

      setTestResult('✅ 配置已成功保存！');
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult(`❌ 保存失败:\n\n${formattedError}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 测试 API 连接
  const testAPI = async () => {
    // 验证配置
    const validation = ConfigValidator.validateConfig(formData);

    if (!validation.valid) {
      setTestResult(`❌ 配置验证失败:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsLoading(true);
    setTestResult('测试 API 连接...\n');

    try {
      const result = await AIService.testConfig(formData);

      if (result.success) {
        setTestResult(
          (prev) =>
            prev +
            `✅ API 连接成功！延迟: ${result.latency}ms\n\n` +
            `模型: ${formData.model}\n` +
            `提示: 连接成功，您可以保存配置了`
        );
      } else {
        // Use ErrorHelper to format error message if possible
        const errorMessage = result.error || '未知错误';
        setTestResult((prev) => prev + `❌ 连接失败:\n\n${errorMessage}`);
      }
    } catch (error: unknown) {
      // Use ErrorHelper to format error for better user experience
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult((prev) => prev + `❌ 错误:\n\n${formattedError}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 清除配置
  const clearConfig = async () => {
    if (!confirm('确定要清除配置吗？')) return;

    try {
      await StorageService.clearAIConfig();
      setConfig(null);
      setFormData({
        provider: 'siliconflow',
        apiUrl: PROVIDER_URLS.siliconflow,
        apiToken: '',
        model: 'Qwen/Qwen2.5-7B-Instruct',
      });
      setTestResult('✅ 配置已清除');
      setActiveTab('config');
      await loadData();
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult(`❌ 清除失败:\n\n${formattedError}`);
    }
  };

  // 测试 AI 生成回复
  const testAIGeneration = async () => {
    // 使用当前表单配置或已保存的配置
    const testConfig = config || formData;

    // 验证配置
    const validation = ConfigValidator.validateConfig(testConfig);
    if (!validation.valid) {
      setTestResult(`❌ 配置验证失败:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsLoading(true);
    setTestResult('生成测试回复...\n');

    try {
      const reply = await AIService.generateReplyWithConfig(
        '今天天气真好！☀️',
        'humorous',
        testConfig
      );

      setShowToast({
        message: '测试成功！API连接和模型响应正常',
        type: 'success'
      });

      // 3秒后自动关闭toast
      setTimeout(() => setShowToast(null), 3000);
      setTestResult(`AI 回复: "${reply}"\n\n字符数: ${reply.length}/280`);
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setShowToast({
        message: '测试失败：' + formattedError.split('\n')[0],
        type: 'error'
      });

      // 5秒后自动关闭toast
      setTimeout(() => setShowToast(null), 5000);
      setTestResult(`错误详情：\n${formattedError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[440px]" style={{ backgroundColor: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '600px', maxHeight: '80vh' }}>
      {/* 极简克制头部 */}
      <div style={{
        background: 'var(--color-bg-elevated)',
        borderBottom: `1px solid var(--color-border-divider)`,
        padding: '16px 20px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Shield
              size={14}
              style={{ color: '#F8F8FA' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Twitter Reply Assistant
            </h1>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div style={{
        background: 'var(--color-bg-raised)',
        borderBottom: `1px solid var(--color-border-divider)`,
        padding: '12px 20px',
        flexShrink: 0
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '4px',
          background: 'var(--color-bg-subtle)',
          padding: '2px',
          borderRadius: 'var(--radius-base)'
        }}>
          {[
            { id: 'config', label: 'API 配置' },
            { id: 'customStyles', label: '自定义' },
            { id: 'test', label: '测试' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: 'var(--radius-xs)',
                background: activeTab === tab.id
                  ? 'var(--color-primary)'
                  : 'transparent',
                color: activeTab === tab.id
                  ? '#F8F8FA'
                  : 'var(--color-text-muted)',
                border: 'none',
                transition: 'all var(--transition-base)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{
        padding: '24px',
        background: 'var(--color-bg-base)',
        flex: 1,
        overflowY: 'auto',
        minWidth: 0,
        paddingBottom: '32px'
      }}>
        {/* API 配置标签页 */}
        {activeTab === 'config' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 状态指示器 */}
            {config ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(95, 207, 128, 0.08)',
                border: `1px solid rgba(95, 207, 128, 0.15)`,
                borderRadius: 'var(--radius-base)'
              }}>
                <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-success)', margin: '0 0 2px 0' }}>
                    配置已就绪
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {PROVIDER_NAMES[config.provider]} · {config.model}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(255, 179, 102, 0.08)',
                border: `1px solid rgba(255, 179, 102, 0.15)`,
                borderRadius: 'var(--radius-base)'
              }}>
                <AlertCircle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-warning)', margin: '0 0 2px 0' }}>
                    需要配置 API
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: 0 }}>
                    请配置 API 以使用智能回复功能
                  </p>
                </div>
              </div>
            )}

            {/* AI 提供商 */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                AI 提供商
              </h3>
              <select
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 36px 0 12px',
                  fontSize: '14px',
                  background: 'var(--color-bg-surface)',
                  border: `1px solid var(--color-border-light)`,
                  borderRadius: '8px',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-base)',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                {(['siliconflow', 'deepseek', 'glm', 'custom'] as AIProvider[]).map(
                  (provider) => (
                    <option key={provider} value={provider}>
                      {PROVIDER_NAMES[provider]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 极简 API Token 输入 */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                API Token
              </h3>
              <div style={{ position: 'relative' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  value={formData.apiToken}
                  onChange={(e) =>
                    setFormData({ ...formData, apiToken: e.target.value })
                  }
                  placeholder="sk-xxxx..."
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 40px 0 12px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    background: 'var(--color-bg-surface)',
                    border: `1px solid var(--color-border-light)`,
                    borderRadius: 'var(--radius-base)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-base)',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '8px',
                    transform: 'translateY(-50%)',
                    padding: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showToken ? (
                    <EyeOff size={14} style={{ color: 'var(--color-text-muted)' }} />
                  ) : (
                    <Eye size={14} style={{ color: 'var(--color-text-muted)' }} />
                  )}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                从 {PROVIDER_NAMES[formData.provider]} 获取您的 API Token
              </p>
            </div>

            {/* 极简模型选择 */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                模型名称
              </h3>
              <input
                list="model-suggestions"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="输入或选择模型"
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  fontSize: '13px',
                  background: 'var(--color-bg-surface)',
                  border: `1px solid var(--color-border-light)`,
                  borderRadius: 'var(--radius-base)',
                  color: 'var(--color-text-primary)',
                  transition: 'all var(--transition-base)',
                  boxSizing: 'border-box'
                }}
              />
              <datalist id="model-suggestions">
                {formData.provider !== 'custom' &&
                  MODEL_SUGGESTIONS[formData.provider].map((model) => (
                    <option key={model} value={model} />
                  ))}
              </datalist>
            </div>

            {/* 自定义 URL */}
            {formData.provider === 'custom' && (
              <div style={{
                padding: '12px',
                background: 'rgba(107, 127, 255, 0.05)',
                border: `1px solid rgba(107, 127, 255, 0.2)`,
                borderRadius: 'var(--radius-base)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
                }}>
                  <Link2 size={16} style={{ color: 'var(--color-primary)' }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                    API URL
                  </h3>
                </div>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, apiUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/v1/chat/completions"
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
                    background: 'var(--color-bg-surface)',
                    boxSizing: 'border-box',
                    border: `1px solid var(--color-primary)`,
                    borderRadius: 'var(--radius-base)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-base)',
                    marginBottom: '4px'
                  }}
                />
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                  <AlertCircle size={12} />
                  需要兼容 OpenAI Chat Completions API 格式
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <button
                  onClick={testAPI}
                  disabled={isLoading || isSaving}
                  style={{
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-base)',
                    border: '1px solid var(--color-accent)',
                    background: 'var(--color-accent)',
                    color: '#F8F8FA',
                    cursor: isLoading || isSaving ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isSaving ? 0.6 : 1,
                    transition: 'all var(--transition-base)'
                  }}
                >
                  {isLoading ? '测试中...' : '测试连接'}
                </button>
                <button
                  onClick={saveConfig}
                  disabled={isLoading || isSaving}
                  style={{
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-base)',
                    border: '1px solid var(--color-primary)',
                    background: 'var(--color-primary)',
                    color: '#F8F8FA',
                    cursor: isLoading || isSaving ? 'not-allowed' : 'pointer',
                    opacity: isLoading || isSaving ? 0.6 : 1,
                    transition: 'all var(--transition-base)'
                  }}
                >
                  {isSaving ? '保存中...' : '保存配置'}
                </button>
              </div>

              {config && (
                <button
                  onClick={clearConfig}
                  style={{
                    width: '100%',
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-base)',
                    border: '1px solid var(--color-error)',
                    background: 'var(--color-error)',
                    color: '#F8F8FA',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)'
                  }}
                >
                  清除配置
                </button>
              )}
            </div>

            {/* 测试结果 */}
            {testResult && (
              <div style={{
                padding: '12px',
                background: 'var(--color-bg-elevated)',
                borderRadius: 'var(--radius-base)',
                border: `1px solid var(--color-border-light)`
              }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  测试结果
                </h3>
                <pre style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: 1.4,
                  margin: 0,
                  padding: '8px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid var(--color-border-light)`
                }}>
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}

  
        {/* 自定义风格标签页 */}
        {activeTab === 'customStyles' && (
          <CustomStyleManager />
        )}

        {/* 测试标签页 */}
        {activeTab === 'test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="modern-card" style={{
            background: 'var(--color-bg-elevated)',
            border: `1px solid var(--color-primary)`,
            padding: '12px'
          }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: 'var(--color-primary)',
                  opacity: 0.15
                }}>
                  <TestTube
                    size={16}
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    marginBottom: '4px',
                    marginTop: '0'
                  }}>功能测试工具</p>
                  <p style={{
                    fontSize: '11px',
                    color: 'var(--color-text-secondary)',
                    margin: 0
                  }}>
                    验证当前配置是否能正常生成回复
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={testAIGeneration}
              disabled={isLoading || !config}
              className="modern-btn accent w-full"
              style={{ padding: '12px 16px' }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: 'currentColor' }} />
                  <span>测试中...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <TestTube size={14} />
                  <span>测试生成回复</span>
                </span>
              )}
            </button>

            {!config && !formData.apiToken && (
              <div className="modern-card" style={{
                background: 'var(--color-warning)',
                border: `1px solid var(--color-warning)`,
                padding: '12px'
              }}>
                <p className="text-xs flex items-center gap-2" style={{ color: '#F5F5F7' }}>
                  <AlertCircle
                    size={14}
                    style={{ color: '#F5F5F7', minWidth: 14, minHeight: 14 }}
                  />
                  <span>请先配置 API Token</span>
                </p>
              </div>
            )}

            {testResult && (
              <div className="modern-card" style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }} className="flex items-center gap-2">
                  <Bug
                    size={16}
                    style={{ color: 'var(--color-primary)', minWidth: 16, minHeight: 16 }}
                  />
                  <span>测试结果</span>
                </h3>
                <pre style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  lineHeight: 1.4,
                  margin: 0,
                  padding: '8px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  borderRadius: 'var(--radius-base)',
                  border: `1px solid var(--color-border-light)`,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  overflowX: 'hidden',
                  maxWidth: '100%'
                }}>
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            maxWidth: '300px',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: showToast.type === 'success' ? '#F8F8FA' : '#F8F8FA',
            background: showToast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideInRight 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '10px', lineHeight: 1 }}>
              {showToast.type === 'success' ? '✓' : '!'}
            </span>
          </div>
          <span>{showToast.message}</span>
          <button
            onClick={() => setShowToast(null)}
            style={{
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              color: '#F8F8FA',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '8px',
              flexShrink: 0
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 无底部状态栏，避免重叠 */}
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
