import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import '../content/styles-optimized.css';
import { StorageService, ConfigValidator } from '../services/storage-service';
import { AIService } from '../services/ai-service';
import type { AIConfig, AIProvider } from '../types';
import { PROVIDER_URLS, PROVIDER_NAMES, MODEL_SUGGESTIONS, REPLY_STYLES, ErrorHelper, AppError } from '../types';
import { CustomStyleManager } from '../components/CustomStyleManager';
import { TestResultModal } from '../components/TestResultModal';
import { Button, ButtonGroup } from '../components/Button';
import { Input, Select, FormError } from '../components/Form';
import { Tabs, TabPanel } from '../components/Tabs';
import { colors, spacing, typography, borderRadius, shadows, transitions, container } from '../styles/design-tokens';
import { injectGlobalStyles } from '../styles/global-styles';
import { FlaskConical, Zap, Settings, Database, Bug, TestTube, AlertCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'test' | 'customStyles'>('config');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 浮层相关状态
  const [showTestModal, setShowTestModal] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    type: 'success' | 'error' | 'loading';
    title: string;
    message: string;
    details?: string;
    latency?: number;
    rawData?: any;
  } | null>(null);

  // 测试相关状态
  const [testStyle, setTestStyle] = useState('humorous');

  // 配置表单状态
  const [formData, setFormData] = useState<AIConfig>({
    provider: 'siliconflow',
    apiUrl: PROVIDER_URLS.siliconflow,
    apiToken: '',
    model: 'Qwen/Qwen2.5-7B-Instruct',
  });

  // 缓存用户的自定义API URL，防止切换下拉菜单时丢失
  const [customApiUrlCache, setCustomApiUrlCache] = useState('');

  const [showToken, setShowToken] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);

  // 注入全局样式和加载配置
  useEffect(() => {
    // 注入全局样式确保设计系统生效
    injectGlobalStyles();
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
      // 如果切换到自定义，使用缓存的URL或保持当前输入的URL
      const currentUrl = formData.apiUrl;
      if (currentUrl && !Object.values(PROVIDER_URLS).includes(currentUrl)) {
        // 如果当前URL不是预设URL，说明是用户输入的自定义URL，缓存它
        setCustomApiUrlCache(currentUrl);
      }

      newFormData = {
        provider,
        apiUrl: customApiUrlCache || currentUrl || '',
        apiToken: formData.apiToken,
        model: formData.model,
      };
    } else {
      // 如果从自定义切换到预设provider，缓存当前的自定义URL
      if (formData.provider === 'custom' && formData.apiUrl && !Object.values(PROVIDER_URLS).includes(formData.apiUrl)) {
        setCustomApiUrlCache(formData.apiUrl);
      }

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
      setShowToast({
        message: `配置验证失败：${validation.errors[0]}`,
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 5000);
      return;
    }

    setIsSaving(true);

    try {
      await StorageService.setAIConfig(formData);
      setConfig(formData);
      await loadData();

      setShowToast({
        message: '✅ 配置已成功保存！',
        type: 'success'
      });
      setTimeout(() => setShowToast(null), 3000);
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setShowToast({
        message: `保存失败：${formattedError.split('\n')[0]}`,
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // 测试 API 连接
  const testAPI = async () => {
    // 验证配置
    const validation = ConfigValidator.validateConfig(formData);

    if (!validation.valid) {
      setModalTestResult({
        type: 'error',
        title: '配置验证失败',
        message: '配置信息不完整或格式有误',
        details: validation.errors.join('\n'),
      });
      setShowTestModal(true);
      return;
    }

    setIsLoading(true);

    // 显示加载中的浮层
    setModalTestResult({
      type: 'loading',
      title: '正在测试 API 连接',
      message: `正在连接到 ${PROVIDER_NAMES[formData.provider]} 的服务器...`,
    });
    setShowTestModal(true);

    try {
      const result = await AIService.testConfig(formData);

      if (result.success) {
        setModalTestResult({
          type: 'success',
          title: 'API 连接成功',
          message: `成功连接到 ${PROVIDER_NAMES[formData.provider]} 的 API 服务`,
          details: `✅ 连接状态: 正常\n⏱️ 响应延迟: ${result.latency}ms\n🤖 模型: ${formData.model}\n\n提示: 连接测试通过，您可以保存配置了`,
          latency: result.latency,
          rawData: {
            provider: formData.provider,
            model: formData.model,
            apiUrl: formData.apiUrl,
            testTime: new Date().toISOString(),
          }
        });
      } else {
        const errorMessage = result.error || '未知错误';
        setModalTestResult({
          type: 'error',
          title: 'API 连接失败',
          message: '无法连接到 API 服务器',
          details: `❌ 错误信息:\n${errorMessage}\n\n🔧 调试信息:\n提供商: ${PROVIDER_NAMES[formData.provider]}\nAPI 端点: ${formData.apiUrl}\n模型: ${formData.model}`,
          rawData: {
            provider: formData.provider,
            model: formData.model,
            apiUrl: formData.apiUrl,
            error: result.error,
            testTime: new Date().toISOString(),
          }
        });
      }
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setModalTestResult({
        type: 'error',
        title: 'API 连接失败',
        message: '测试过程中发生错误',
        details: `❌ 错误信息:\n${formattedError}\n\n🔧 调试信息:\n提供商: ${PROVIDER_NAMES[formData.provider]}\nAPI 端点: ${formData.apiUrl}\n模型: ${formData.model}`,
        rawData: {
          provider: formData.provider,
          model: formData.model,
          apiUrl: formData.apiUrl,
          error: error instanceof Error ? error.message : String(error),
          testTime: new Date().toISOString(),
        }
      });
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
      setShowToast({
        message: '✅ 配置已清除',
        type: 'success'
      });
      setTimeout(() => setShowToast(null), 3000);
      setActiveTab('config');
      await loadData();
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setShowToast({
        message: `清除失败：${formattedError.split('\n')[0]}`,
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 5000);
    }
  };

  // 测试 AI 生成回复
  const testAIGeneration = async () => {
    // 使用当前表单配置或已保存的配置
    const testConfig = config || formData;

    // 验证配置
    const validation = ConfigValidator.validateConfig(testConfig);
    if (!validation.valid) {
      setModalTestResult({
        type: 'error',
        title: '配置验证失败',
        message: '配置信息不完整或格式有误',
        details: validation.errors.join('\n'),
      });
      setShowTestModal(true);
      return;
    }

    setIsLoading(true);

    // 显示加载中的浮层
    setModalTestResult({
      type: 'loading',
      title: '正在测试 AI 生成',
      message: '正在向 AI 发送测试请求...',
    });
    setShowTestModal(true);

    try {
      const startTime = Date.now();
      const reply = await AIService.generateReplyWithConfig(
        '今天天气真好！☀️',
        testStyle,
        testConfig
      );
      const latency = Date.now() - startTime;

      setModalTestResult({
        type: 'success',
        title: 'AI 生成测试成功',
        message: 'AI 模型成功生成了回复',
        details: `✅ 生成状态: 成功\n⏱️ 响应时间: ${latency}ms\n🤖 模型: ${testConfig.model}\n🎭 回复风格: ${REPLY_STYLES.find(s => s.id === testStyle)?.name}\n\n📝 测试推文: "今天天气真好！☀️"\n💬 AI 回复: "${reply}"\n\n字符数: ${reply.length}/280\n\n提示: AI 功能正常，可以在 Twitter 上使用了！`,
        latency: latency,
        rawData: {
          provider: testConfig.provider,
          model: testConfig.model,
          style: testStyle,
          styleName: REPLY_STYLES.find(s => s.id === testStyle)?.name,
          testTweet: '今天天气真好！☀️',
          aiReply: reply,
          replyLength: reply.length,
          testTime: new Date().toISOString(),
        }
      });

      setShowToast({
        message: '测试成功！API连接和模型响应正常',
        type: 'success'
      });
      setTimeout(() => setShowToast(null), 3000);
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setModalTestResult({
        type: 'error',
        title: 'AI 生成测试失败',
        message: 'AI 模型无法生成回复',
        details: `❌ 错误信息:\n${formattedError}\n\n🔧 调试信息:\n提供商: ${PROVIDER_NAMES[testConfig.provider]}\n模型: ${testConfig.model}\n🎭 回复风格: ${REPLY_STYLES.find(s => s.id === testStyle)?.name}\n\n📝 测试推文: "今天天气真好！☀️"`,
        rawData: {
          provider: testConfig.provider,
          model: testConfig.model,
          style: testStyle,
          styleName: REPLY_STYLES.find(s => s.id === testStyle)?.name,
          testTweet: '今天天气真好！☀️',
          error: error instanceof Error ? error.message : String(error),
          testTime: new Date().toISOString(),
        }
      });

      setShowToast({
        message: '测试失败：' + formattedError.split('\n')[0],
        type: 'error'
      });
      setTimeout(() => setShowToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="extension-popup"
      style={{
        width: container.maxWidth,
        minHeight: '580px', // 确保底部按钮始终可见
        maxHeight: '85vh', // 适当增加最大高度
        backgroundColor: colors.bg.primary,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.xl,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${colors.bg.border}`,
        position: 'relative', // 添加相对定位作为Modal的定位上下文
      }}
    >
      {/* 紧凑的头部 */}
      <div
        style={{
          background: colors.bg.elevated,
          borderBottom: `1px solid ${colors.bg.border}`,
          padding: `${spacing[3]} ${spacing[5]}`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: borderRadius.sm,
                  background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: shadows.sm,
                }}
              >
                <Zap size={14} style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Twitter Reply Assistant
                </h1>
                <p
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.secondary,
                    margin: 0,
                    marginTop: '2px',
                  }}
                >
                  {config ? `${PROVIDER_NAMES[config.provider]} 已连接` : '配置AI模型'}
                </p>
              </div>
            </div>
          </div>

          {/* 简化的状态指示器 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[3]}`,
              background: config ? `${colors.success[500]}10` : `${colors.bg.border}`,
              border: `1px solid ${config ? colors.success[500] + '20' : colors.bg.borderMedium}`,
              borderRadius: borderRadius.full,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: config ? colors.success[500] : colors.text.muted,
                animation: config ? 'pulse 2s infinite' : 'none',
              }}
            />
            <span
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                color: config ? colors.success[500] : colors.text.secondary,
                whiteSpace: 'nowrap',
              }}
            >
              {config ? PROVIDER_NAMES[config.provider] : '未配置'}
            </span>
          </div>
        </div>
      </div>

      {/* 标签导航 - 紧凑布局 */}
      <div
        style={{
          background: colors.bg.secondary,
          padding: `${spacing[1]} ${spacing[5]}`,
          borderBottom: `1px solid ${colors.bg.border}`,
          flexShrink: 0,
        }}
      >
        <Tabs
          items={[
            { id: 'config', label: 'API 配置', icon: <Settings size={14} /> },
            { id: 'customStyles', label: '自定义', icon: <FlaskConical size={14} /> },
            { id: 'test', label: '测试', icon: <TestTube size={14} /> }
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as any)}
          size="sm"
        />
      </div>

      {/* 内容区域 */}
      <div
        style={{
          padding: `${spacing[4]} ${spacing[5]}`,
          background: colors.bg.primary,
          flex: 1,
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {/* API 配置标签页 */}
        <TabPanel active={activeTab === 'config'} tabId="config">
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {/* AI 提供商 */}
            <div>
              <Select
                label="AI 提供商"
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                helpText={`选择您的 AI 服务提供商，将从 ${PROVIDER_NAMES[formData.provider]} 获取模型`}
                options={[
                  { value: 'siliconflow', label: 'SiliconFlow' },
                  { value: 'deepseek', label: 'DeepSeek' },
                  { value: 'glm', label: 'GLM' },
                  { value: 'custom', label: '自定义' },
                ]}
              />
            </div>

            {/* API Token 输入 */}
            <div>
              <Input
                label="API Token"
                type="password"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                placeholder="sk-xxxx..."
                showPasswordToggle={true}
                helpText={`从 ${PROVIDER_NAMES[formData.provider]} 官网获取您的 API Token`}
                leftIcon={<Database size={16} />}
                error={!formData.apiToken}
                errorMessage={formData.apiToken ? undefined : '请输入 API Token'}
              />
            </div>

            {/* 模型选择 */}
            <div>
              <Input
                label="模型名称"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="输入或选择模型名称"
                helpText={
                  formData.provider === 'custom'
                    ? '输入自定义模型名称'
                    : `从下拉列表选择 ${PROVIDER_NAMES[formData.provider]} 支持的模型`
                }
                error={!formData.model}
                errorMessage={formData.model ? undefined : '请输入模型名称'}
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
              <div
                style={{
                  padding: spacing[4],
                  background: `${colors.primary[500]}10`,
                  border: `1px solid ${colors.primary[500]}30`,
                  borderRadius: borderRadius.md,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    marginBottom: spacing[3],
                  }}
                >
                  <Database size={16} style={{ color: colors.primary[500] }} />
                  <h3
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    自定义 API 端点
                  </h3>
                </div>
                <Input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) => {
                  const newUrl = e.target.value;
                  setFormData({ ...formData, apiUrl: newUrl });
                  // 实时更新缓存，防止切换时丢失
                  if (newUrl && !Object.values(PROVIDER_URLS).includes(newUrl)) {
                    setCustomApiUrlCache(newUrl);
                  }
                }}
                  placeholder="https://api.example.com/v1/chat/completions"
                  helpText="需要兼容 OpenAI Chat Completions API 格式"
                  error={!formData.apiUrl}
                  errorMessage={formData.apiUrl ? undefined : '请输入有效的 API URL'}
                />
              </div>
            )}

            {/* 操作按钮组 */}
            <div style={{ marginTop: spacing[2] }}>
              <ButtonGroup fullWidth spacing={3}>
                <Button
                  variant="outline"
                  onClick={testAPI}
                  disabled={isLoading || isSaving}
                  loading={isLoading}
                  size="md"
                  style={{ flex: 1 }}
                >
                  测试连接
                </Button>
                <Button
                  variant="primary"
                  onClick={saveConfig}
                  disabled={isLoading || isSaving}
                  loading={isSaving}
                  size="md"
                  style={{ flex: 1 }}
                >
                  应用配置
                </Button>
                {config && (
                  <Button
                    variant="ghost"
                    onClick={clearConfig}
                    size="md"
                    style={{ flex: 1 }}
                  >
                    清除
                  </Button>
                )}
              </ButtonGroup>
            </div>

                        </div>
        </TabPanel>

        {/* 自定义风格标签页 */}
        <TabPanel active={activeTab === 'customStyles'} tabId="customStyles">
          <CustomStyleManager key="custom-styles" />
        </TabPanel>

        {/* 测试标签页 */}
        <TabPanel active={activeTab === 'test'} tabId="test">
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {/* 功能介绍卡片 */}
            <div
              style={{
                padding: spacing[4],
                background: `linear-gradient(135deg, ${colors.primary[500]}15 0%, ${colors.primary[500]}05 100%)`,
                border: `1px solid ${colors.primary[500]}30`,
                borderRadius: borderRadius.md,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[3],
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
                    boxShadow: shadows.sm,
                  }}
                >
                  <TestTube size={18} style={{ color: '#FFFFFF' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing[1],
                      marginTop: 0,
                    }}
                  >
                    功能测试工具
                  </h3>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    验证当前配置是否能正常生成 AI 回复
                  </p>
                </div>
              </div>
            </div>

            {/* 风格选择 */}
            <div>
              <Select
                label="选择回复风格"
                value={testStyle}
                onChange={(e) => setTestStyle(e.target.value)}
                helpText="选择要测试的回复风格，不同风格会有不同的生成效果"
                options={REPLY_STYLES.map((style) => ({
                  value: style.id,
                  label: `${style.icon} ${style.name}`,
                }))}
              />
            </div>

            {/* 系统提示词预览 */}
            <div>
              <h3
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[3],
                }}
              >
                系统提示词预览
              </h3>
              <div
                style={{
                  padding: spacing[4],
                  background: colors.bg.elevated,
                  border: `1px solid ${colors.bg.borderLight}`,
                  borderRadius: borderRadius.md,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.tertiary,
                    marginBottom: spacing[2],
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      background: colors.primary[500],
                      borderRadius: '50%',
                      opacity: 0.8,
                    }}
                  />
                  {REPLY_STYLES.find((s) => s.id === testStyle)?.name}
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    lineHeight: 1.6,
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {REPLY_STYLES.find((s) => s.id === testStyle)?.systemPrompt}
                </p>
              </div>
            </div>

            {/* 测试按钮 */}
            <Button
              variant="primary"
              onClick={testAIGeneration}
              disabled={isLoading || !config}
              loading={isLoading}
              size="lg"
              fullWidth
              leftIcon={<TestTube size={16} />}
            >
              {isLoading ? '测试中...' : '测试生成回复'}
            </Button>

            {/* 配置警告 */}
            {!config && !formData.apiToken && (
              <div
                style={{
                  padding: spacing[3] + spacing[1],
                  background: `${colors.warning[500]}15`,
                  border: `1px solid ${colors.warning[500]}30`,
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
                  <AlertCircle size={14} style={{ color: colors.warning[500] }} />
                  <span
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.warning[500],
                      fontWeight: typography.fontWeight.medium,
                    }}
                  >
                    请先配置 API Token 才能进行测试
                  </span>
                </div>
              </div>
            )}
          </div>
        </TabPanel>
      </div>

      {/* Toast 提示 */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: spacing[5],
            right: spacing[5],
            zIndex: 999,
            maxWidth: '320px',
            padding: `${spacing[3]} ${spacing[4]}`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: '#FFFFFF',
            background: showToast.type === 'success' ? colors.success[500] : colors.error[500],
            boxShadow: shadows.lg,
            animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.sm,
                lineHeight: 1,
                fontWeight: typography.fontWeight.semibold,
              }}
            >
              {showToast.type === 'success' ? '✓' : '!'}
            </span>
          </div>
          <span style={{ flex: 1, minWidth: 0 }}>{showToast.message}</span>
          <button
            onClick={() => setShowToast(null)}
            style={{
              width: '24px',
              height: '24px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: borderRadius.full,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: spacing[2],
              flexShrink: 0,
              transition: `all ${transitions.duration.fast} ${transitions.easing.easeOut}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* CSS 动画样式 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes slideInRight {
              from {
                transform: translateX(100%);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }

            @keyframes slideInUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes slideInDown {
              from {
                transform: translateY(-20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }

            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }

            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }

            .animate-spin {
              animation: spin 1s linear infinite;
            }
          `,
        }}
      />

      {/* 测试结果浮层 */}
      <TestResultModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        testResult={modalTestResult}
      />
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
