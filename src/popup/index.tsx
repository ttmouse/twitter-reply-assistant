import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { StorageService, ConfigValidator } from '../services/storage-service';
import { AIService } from '../services/ai-service';
import type { AIConfig, AIProvider } from '../types';
import { PROVIDER_URLS, PROVIDER_NAMES, MODEL_SUGGESTIONS, REPLY_STYLES, ErrorHelper, AppError } from '../types';
import { CustomStyleManager } from '../components/CustomStyleManager';

function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'status' | 'test' | 'customStyles'>('config');
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [testResult, setTestResult] = useState<string>('');
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
      setTimeout(() => {
        setActiveTab('status');
      }, 1000);
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
    if (!config) {
      setTestResult('❌ 请先保存 API 配置');
      return;
    }

    setIsLoading(true);
    setTestResult('生成测试回复...\n');

    try {
      const reply = await AIService.generateReply(
        '今天天气真好！☀️',
        'humorous'
      );

      setTestResult(
        (prev) =>
          prev +
          `✅ 回复生成成功！\n\n` +
          `原推文: "今天天气真好！☀️"\n` +
          `风格: 幽默风趣\n` +
          `AI 回复: "${reply}"\n\n` +
          `字符数: ${reply.length}/280`
      );
    } catch (error: unknown) {
      const formattedError = ErrorHelper.formatForUser(error);
      setTestResult((prev) => prev + `❌ 生成失败:\n\n${formattedError}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[480px] bg-white">
      {/* 标题栏 */}
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Twitter Reply Assistant</h1>
        <p className="text-sm text-blue-100">AI 智能回复助手</p>
      </div>

      {/* 标签切换 */}
      <div className="flex border-b">
        <button
          className={`flex-1 py-3 px-4 font-medium ${
            activeTab === 'config'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('config')}
        >
          ⚙️ API 配置
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium ${
            activeTab === 'status'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('status')}
        >
          📊 状态
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium ${
            activeTab === 'customStyles'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('customStyles')}
        >
          🎨 自定义
        </button>
        <button
          className={`flex-1 py-3 px-4 font-medium ${
            activeTab === 'test'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('test')}
        >
          🧪 测试
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {/* API 配置标签页 */}
        {activeTab === 'config' && (
          <div className="space-y-4">
            {/* 配置状态指示器 */}
            {config ? (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                <p className="text-green-800 font-medium">✅ 已配置</p>
                <p className="text-green-600 text-xs mt-1">
                  提供商: {PROVIDER_NAMES[config.provider]} | 模型: {config.model}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                <p className="text-yellow-800 font-medium">⚠️ 未配置</p>
                <p className="text-yellow-600 text-xs mt-1">
                  请配置 API 以使用智能回复功能
                </p>
              </div>
            )}

            {/* 提供商选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI 提供商
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['siliconflow', 'deepseek', 'glm', 'custom'] as AIProvider[]).map(
                  (provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={`p-3 rounded border-2 text-sm font-medium transition-colors ${
                        formData.provider === provider
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {PROVIDER_NAMES[provider]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* API Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={formData.apiToken}
                  onChange={(e) =>
                    setFormData({ ...formData, apiToken: e.target.value })
                  }
                  placeholder="sk-xxxx..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                >
                  {showToken ? '隐藏' : '显示'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                从 {PROVIDER_NAMES[formData.provider]} 获取您的 API Token
              </p>
            </div>

            {/* 模型名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                模型名称
              </label>
              <input
                list="model-suggestions"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                placeholder="输入或选择模型"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="model-suggestions">
                {formData.provider !== 'custom' &&
                  MODEL_SUGGESTIONS[formData.provider].map((model) => (
                    <option key={model} value={model} />
                  ))}
              </datalist>
              {formData.provider !== 'custom' && (
                <p className="text-xs text-gray-500 mt-1">
                  建议: {MODEL_SUGGESTIONS[formData.provider].join(', ')}
                </p>
              )}
            </div>

            {/* 自定义 URL（仅自定义提供商） */}
            {formData.provider === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API URL
                </label>
                <input
                  type="url"
                  value={formData.apiUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, apiUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  需要兼容 OpenAI Chat Completions API
                </p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={testAPI}
                disabled={isLoading || isSaving}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '测试中...' : '🔌 测试连接'}
              </button>
              <button
                onClick={saveConfig}
                disabled={isLoading || isSaving}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '💾 保存配置'}
              </button>
            </div>

            {config && (
              <button
                onClick={clearConfig}
                className="w-full py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🗑️ 清除配置
              </button>
            )}

            {/* 测试结果 */}
            {testResult && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 状态标签页 */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* 配置状态 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">当前配置</h3>
              {config ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">提供商:</span>
                    <span className="font-medium">{PROVIDER_NAMES[config.provider]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API URL:</span>
                    <span className="font-mono text-xs truncate max-w-[300px]">
                      {config.apiUrl}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Token:</span>
                    <span className="font-mono text-xs">
                      {config.apiToken.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">模型:</span>
                    <span className="font-medium">{config.model}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂无配置</p>
              )}
            </div>

            {/* 存储信息 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">存储使用</h3>
              {storageInfo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">已使用:</span>
                    <span className="font-medium">
                      {storageInfo.bytesInUse} 字节
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">配额:</span>
                    <span className="font-medium">{storageInfo.quota} 字节</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">使用率:</span>
                    <span className="font-medium">
                      {storageInfo.percentUsed}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${storageInfo.percentUsed}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">加载中...</p>
              )}
            </div>

            {/* 回复风格列表 */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">可用回复风格</h3>
              <div className="space-y-2">
                {REPLY_STYLES.map((style) => (
                  <div
                    key={style.id}
                    className="flex items-start space-x-2 text-sm p-2 bg-gray-50 rounded"
                  >
                    <span className="text-xl">{style.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-gray-600">
                        {style.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 自定义风格标签页 */}
        {activeTab === 'customStyles' && (
          <CustomStyleManager />
        )}

        {/* 测试标签页 */}
        {activeTab === 'test' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="text-blue-800 font-medium">🧪 开发测试工具</p>
              <p className="text-blue-600 text-xs mt-1">
                用于开发调试，正常使用不需要此功能
              </p>
            </div>

            <button
              onClick={testAIGeneration}
              disabled={isLoading || !config}
              className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '测试中...' : '🤖 测试生成回复'}
            </button>

            {!config && (
              <p className="text-xs text-amber-600">
                ⚠️ 需要先在"API 配置"中保存配置
              </p>
            )}

            {testResult && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <h3 className="font-semibold text-gray-800 mb-2">测试结果</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {testResult}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <div className="border-t bg-gray-50 p-3 text-xs text-gray-600">
        <p>
          💡 提示: {config ? '配置已就绪，可以在 Twitter 上使用了' : '请先配置 API 以使用智能回复'}
        </p>
      </div>
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
