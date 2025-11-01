项目概述

开发一个浏览器插件,帮助用户快速生成 Twitter 回复内容,支持自定义 AI 模型接入和多种回复风格。

核心功能

1. 自定义 AI 模型配置





支持配置自定义 API URL



支持配置 API Token/密钥



优先适配以下模型:





硅基流动 (SiliconFlow)



DeepSeek



智谱 GLM



其他兼容 OpenAI API 格式的模型

2. 回复风格选择

用户点击推文时可选择不同风格:





专业严谨 - 正式、有深度的回复



幽默风趣 - 轻松、有趣的互动



简洁明了 - 直接、精炼的观点



友好支持 - 鼓励、认同的态度



批判性思考 - 理性分析、提出不同观点



提问引导 - 通过问题引发讨论

3. 智能回复生成





自动读取推文内容



根据选择的风格生成 120 字以内的回复



自动填充到 Twitter 回复框

技术架构

技术栈选择

前端框架: React + TypeScript
构建工具: Vite + CRXJS
UI 组件: Tailwind CSS
状态管理: Zustand
API 请求: Axios

插件结构

twitter-reply-assistant/
├── manifest.json           # 插件配置文件
├── src/
│   ├── background/        # 后台脚本
│   │   └── index.ts
│   ├── content/           # 内容脚本
│   │   ├── index.tsx
│   │   └── twitter-injector.ts
│   ├── popup/             # 弹出页面(设置界面)
│   │   ├── App.tsx
│   │   └── index.html
│   ├── components/        # 共享组件
│   │   ├── StyleSelector.tsx
│   │   └── ReplyButton.tsx
│   ├── services/          # API 服务
│   │   ├── ai-service.ts
│   │   └── storage-service.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   └── utils/             # 工具函数
│       └── prompt-builder.ts
└── package.json

详细实现方案

1. Manifest 配置

{
  "manifest_version": 3,
  "name": "Twitter Reply Assistant",
  "version": "1.0.0",
  "description": "AI-powered Twitter reply generator with customizable styles",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://twitter.com/*",
    "https://x.com/*"
  ],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://twitter.com/*", "https://x.com/*"],
      "js": ["src/content/index.tsx"],
      "css": ["src/content/styles.css"]
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}

2. 配置页面 (Popup)

// src/popup/App.tsx
import React, { useState, useEffect } from 'react';

interface AIConfig {
  provider: string;
  apiUrl: string;
  apiToken: string;
  model: string;
}

const App: React.FC = () => {
  const [config, setConfig] = useState<aiconfig>({
    provider: 'siliconflow',
    apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
    apiToken: '',
    model: 'deepseek-ai/DeepSeek-V2.5'
  });

  const presetProviders = {
    siliconflow: {
      name: '硅基流动',
      apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
      models: ['deepseek-ai/DeepSeek-V2.5', 'Qwen/Qwen2.5-72B-Instruct']
    },
    deepseek: {
      name: 'DeepSeek',
      apiUrl: 'https://api.deepseek.com/v1/chat/completions',
      models: ['deepseek-chat', 'deepseek-reasoner']
    },
    glm: {
      name: '智谱 GLM',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      models: ['glm-4-plus', 'glm-4-flash']
    }
  };

  const saveConfig = async () => {
    await chrome.storage.sync.set({ aiConfig: config });
    alert('配置已保存!');
  };

  useEffect(() => {
    chrome.storage.sync.get(['aiConfig'], (result) => {
      if (result.aiConfig) {
        setConfig(result.aiConfig);
      }
    });
  }, []);

  return (
    <div classname="w-96 p-4">
      <h1 classname="text-xl font-bold mb-4">Twitter 回复助手设置</h1>
      
      <div classname="space-y-4">
        <div>
          <label classname="block text-sm font-medium mb-1">AI 服务商</label>
          <select classname="w-full border rounded px-3 py-2" value="{config.provider}" onchange="{(e)" ==""> {
              const provider = e.target.value;
              setConfig({
                ...config,
                provider,
                apiUrl: presetProviders[provider].apiUrl,
                model: presetProviders[provider].models[0]
              });
            }}
          >
            <option value="siliconflow">硅基流动</option>
            <option value="deepseek">DeepSeek</option>
            <option value="glm">智谱 GLM</option>
            <option value="custom">自定义</option>
          </select>
        </div>

        <div>
          <label classname="block text-sm font-medium mb-1">API URL</label>
          <input type="text" classname="w-full border rounded px-3 py-2" value="{config.apiUrl}" onchange="{(e)" ==""> setConfig({...config, apiUrl: e.target.value})}
            placeholder="https://api.example.com/v1/chat/completions"
          />
        </div>

        <div>
          <label classname="block text-sm font-medium mb-1">API Token</label>
          <input type="password" classname="w-full border rounded px-3 py-2" value="{config.apiToken}" onchange="{(e)" ==""> setConfig({...config, apiToken: e.target.value})}
            placeholder="sk-..."
          />
        </div>

        <div>
          <label classname="block text-sm font-medium mb-1">模型</label>
          <input type="text" classname="w-full border rounded px-3 py-2" value="{config.model}" onchange="{(e)" ==""> setConfig({...config, model: e.target.value})}
            placeholder="模型名称"
          />
        </div>

        <button onclick="{saveConfig}" classname="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600">
          保存配置
        </button>
      </div>
    </div>
  );
};

export default App;
</aiconfig>

3. 内容脚本 - Twitter 页面注入

// src/content/twitter-injector.ts
import { createRoot } from 'react-dom/client';
import StyleSelector from '../components/StyleSelector';

class TwitterInjector {
  private observer: MutationObserver | null = null;

  init() {
    this.observeTwitter();
  }

  observeTwitter() {
    this.observer = new MutationObserver(() => {
      this.injectReplyButtons();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.injectReplyButtons();
  }

  injectReplyButtons() {
    // 查找所有推文的回复按钮
    const tweets = document.querySelectorAll('[data-testid="tweet"]');
    
    tweets.forEach((tweet) => {
      if (tweet.querySelector('.ai-reply-assistant')) return;

      const replyButton = tweet.querySelector('[data-testid="reply"]');
      if (!replyButton) return;

      // 创建 AI 助手按钮容器
      const container = document.createElement('div');
      container.className = 'ai-reply-assistant';
      container.style.cssText = 'display: inline-block; margin-left: 8px;';
      
      replyButton.parentElement?.appendChild(container);

      // 渲染 React 组件
      const root = createRoot(container);
      root.render(
        <styleselector tweetelement="{tweet" as="" htmlelement}="" onstyleselect="{this.handleStyleSelect.bind(this)}">
      );
    });
  }

  async handleStyleSelect(style: string, tweetElement: HTMLElement) {
    // 获取推文内容
    const tweetText = this.extractTweetText(tweetElement);
    
    // 点击原生回复按钮
    const replyButton = tweetElement.querySelector('[data-testid="reply"]') as HTMLElement;
    replyButton?.click();

    // 等待回复框出现
    await this.waitForReplyBox();

    // 生成回复内容
    const reply = await this.generateReply(tweetText, style);

    // 填充到回复框
    this.fillReplyBox(reply);
  }

  extractTweetText(tweetElement: HTMLElement): string {
    const textElement = tweetElement.querySelector('[data-testid="tweetText"]');
    return textElement?.textContent || '';
  }

  async waitForReplyBox(timeout = 3000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (replyBox) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  fillReplyBox(text: string) {
    const replyBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    
    if (replyBox) {
      // 使用 React 的方式更新输入框
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      
      nativeInputValueSetter?.call(replyBox, text);
      
      // 触发 input 事件
      const event = new Event('input', { bubbles: true });
      replyBox.dispatchEvent(event);
    }
  }

  async generateReply(tweetText: string, style: string): Promise<string> {
    // 通过 background script 调用 AI API
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { 
          action: 'generateReply', 
          tweetText, 
          style 
        },
        (response) => {
          resolve(response.reply);
        }
      );
    });
  }
}

export default TwitterInjector;
</string></void></styleselector>

4. 风格选择器组件

// src/components/StyleSelector.tsx
import React, { useState } from 'react';

interface StyleSelectorProps {
  tweetElement: HTMLElement;
  onStyleSelect: (style: string, tweetElement: HTMLElement) => void;
}

const StyleSelector: React.FC<styleselectorprops> = ({ tweetElement, onStyleSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = [
    { id: 'professional', name: '专业严谨', icon: '💼' },
    { id: 'humorous', name: '幽默风趣', icon: '😄' },
    { id: 'concise', name: '简洁明了', icon: '✨' },
    { id: 'supportive', name: '友好支持', icon: '👍' },
    { id: 'critical', name: '批判性思考', icon: '🤔' },
    { id: 'questioning', name: '提问引导', icon: '❓' }
  ];

  const handleStyleClick = async (styleId: string) => {
    setIsGenerating(true);
    setIsOpen(false);
    
    await onStyleSelect(styleId, tweetElement);
    
    setIsGenerating(false);
  };

  return (
    <div classname="relative inline-block">
      <button onclick="{()" ==""> setIsOpen(!isOpen)}
        disabled={isGenerating}
        className="ai-reply-btn"
        title="AI 回复助手"
      >
        {isGenerating ? '⏳' : '🤖'}
      </button>

      {isOpen && (
        <div classname="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 min-w-[200px]">
          <div classname="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
            选择回复风格
          </div>
          {styles.map((style) => (
            <button key="{style.id}" onclick="{()" ==""> handleStyleClick(style.id)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2 text-sm"
            >
              <span>{style.icon}</span>
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StyleSelector;
</styleselectorprops>

5. AI 服务封装

// src/services/ai-service.ts
import axios from 'axios';

interface AIConfig {
  apiUrl: string;
  apiToken: string;
  model: string;
}

interface StylePrompt {
  [key: string]: string;
}

class AIService {
  private config: AIConfig | null = null;

  private stylePrompts: StylePrompt = {
    professional: '请以专业、严谨的语气回复这条推文,展现深度思考和专业见解',
    humorous: '请以幽默、风趣的方式回复这条推文,让互动更轻松有趣',
    concise: '请用简洁明了的语言回复这条推文,直接表达核心观点',
    supportive: '请以友好、支持的态度回复这条推文,表达认同和鼓励',
    critical: '请以批判性思维回复这条推文,理性分析并提出不同观点',
    questioning: '请通过提问的方式回复这条推文,引发更深入的讨论'
  };

  async loadConfig(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['aiConfig'], (result) => {
        this.config = result.aiConfig;
        resolve();
      });
    });
  }

  async generateReply(tweetText: string, style: string): Promise<string> {
    if (!this.config) {
      await this.loadConfig();
    }

    if (!this.config?.apiToken) {
      throw new Error('请先在插件设置中配置 API Token');
    }

    const systemPrompt = `你是一个 Twitter 回复助手。${this.stylePrompts[style]}。
要求:
1. 回复内容必须在 120 字以内
2. 语言自然流畅,符合社交媒体风格
3. 不要使用过多的表情符号
4. 直接给出回复内容,不要有任何前缀或说明`;

    const userPrompt = `推文内容: "${tweetText}"

请生成一条合适的回复。`;

    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: this.config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const reply = response.data.choices[0].message.content.trim();
      
      // 确保回复不超过 120 字
      return reply.length > 120 ? reply.substring(0, 120) : reply;
      
    } catch (error) {
      console.error('AI API 调用失败:', error);
      throw new Error('生成回复失败,请检查 API 配置');
    }
  }
}

export default new AIService();
</string></void>

6. Background Script

// src/background/index.ts
import AIService from '../services/ai-service';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    AIService.generateReply(request.tweetText, request.style)
      .then((reply) => {
        sendResponse({ success: true, reply });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // 保持消息通道开启
  }
});

开发步骤

第一阶段: 基础框架搭建





初始化项目 (npm create vite@latest)



安装 CRXJS 插件 (npm install @crxjs/vite-plugin)



配置 manifest.json



搭建基础目录结构

第二阶段: 核心功能开发





开发配置页面 (Popup)



实现存储服务



开发 AI 服务封装



实现 Twitter 页面注入逻辑

第三阶段: UI 组件开发





开发风格选择器组件



添加加载状态提示



优化样式和交互

第四阶段: 测试与优化





测试各个 AI 服务商的接入



测试不同风格的回复质量



优化性能和用户体验



处理边界情况和错误

构建与打包

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 打包为 zip (用于发布)
npm run package

构建后的文件在 dist 目录,可以通过 Chrome 的"加载已解压的扩展程序"进行安装测试。

注意事项





API 安全: Token 存储在 chrome.storage.sync 中,仅在本地加密存储



速率限制: 建议添加请求频率限制,避免 API 调用过于频繁



错误处理: 完善的错误提示和降级方案



Twitter 更新: Twitter/X 的 DOM 结构可能变化,需要定期维护选择器



隐私保护: 推文内容仅用于生成回复,不进行存储或上传

后续优化方向





添加回复历史记录



支持自定义风格和提示词模板



添加多语言支持



支持图片识别和多模态回复



添加回复质量评分和优化建议



开发周期预估: 2-3 周
技术难度: 中等
维护成本: 低