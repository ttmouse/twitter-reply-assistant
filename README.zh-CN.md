# Twitter Reply Assistant 🤖 | 推特智能回复助手

[English](./README.md)

---

## 🎯 概述

Twitter Reply Assistant 是一个 Chrome 扩展程序，使用 AI 为 Twitter (X) 生成智能回复。支持多种 AI 提供商（SiliconFlow、DeepSeek、智谱清言）和自定义回复风格。一键生成符合您期望语气的智能上下文感知回复。

## ✨ 功能特点

- 🤖 **AI 智能回复** - 使用先进的 AI 模型生成上下文相关的回复
- 📝 **内容扩写功能** - 将您的种子内容扩展为完整的上下文相关回复
- 🎨 **6 种预设风格** - 专业严谨、幽默风趣、简洁明了、友好支持、批判性思考、提问引导
- 🎭 **自定义风格** - 创建您自己的回复风格和提示词
- 🔌 **多种 AI 提供商** - 支持 SiliconFlow、DeepSeek、智谱清言和自定义 API
- 💨 **一键操作** - 无缝集成到 Twitter 界面
- 🌍 **多语言支持** - 支持任何语言的推文
- 🔒 **隐私优先** - 所有 API 密钥都存储在本地 Chrome 中

## 📥 安装方法

### 方法一：从源代码安装（推荐）

1. **下载扩展程序**

   ```bash
   git clone https://github.com/yourusername/TwitterReplyAssistant.git
   cd TwitterReplyAssistant
   ```

2. **安装依赖并构建**

   ```bash
   npm install
   npm run build
   ```

3. **在 Chrome 中加载**
   - 打开 Chrome，访问 `chrome://extensions/`
   - 在右上角启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `dist` 文件夹

### 方法二：下载发布版本

1. 前往 [Releases](https://github.com/yourusername/TwitterReplyAssistant/releases) 页面
2. 下载最新的 `twitter-reply-assistant.zip`
3. 解压 ZIP 文件
4. 打开 Chrome，访问 `chrome://extensions/`
5. 启用"开发者模式"
6. 点击"加载已解压的扩展程序"，选择解压后的文件夹

## 🚀 快速开始

1. **配置 AI 提供商**
   - 点击 Chrome 工具栏中的扩展图标
   - 选择您的 AI 提供商（SiliconFlow、DeepSeek、智谱清言或自定义）
   - 输入您的 API 密钥
   - （可选）配置模型名称

2. **在 Twitter 上使用**
   - 访问 Twitter/X
   - 找到您想要回复的推文
   - 点击回复按钮打开回复对话框
   - 点击工具栏中出现的 🤖 按钮生成完整回复
   - 或点击 📝 按钮将您的种子内容扩写为完整回复
   - 对于 📝 内容扩写：输入简短的方向/想法，然后点击 📝 扩展它
   - 对于 🤖 AI 回复：选择一个回复风格，AI 将生成完整回复
   - 生成的回复将自动填入，并且完全可编辑

## ⚙️ 配置说明

### 支持的 AI 提供商

| 提供商 | API 端点 | 获取 API Key |
|--------|---------|--------------|
| SiliconFlow | `https://api.siliconflow.cn/v1/chat/completions` | [获取密钥](https://siliconflow.cn) |
| DeepSeek | `https://api.deepseek.com/v1/chat/completions` | [获取密钥](https://platform.deepseek.com) |
| 智谱清言 | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | [获取密钥](https://open.bigmodel.cn) |
| 自定义 | 您自己的 OpenAI 兼容端点 | - |

### 回复风格

- 💼 **专业严谨** - 正式、商务场合适用
- 😄 **幽默风趣** - 轻松、娱乐性
- ✨ **简洁明了** - 简短、直接
- 👍 **友好支持** - 鼓励、积极
- 🤔 **批判性思考** - 分析、深入
- ❓ **提问引导** - 好奇、探索

### 内容扩写

- 📝 **智能扩写** - 输入简短的方向或种子内容，点击扩展按钮将其转化为完整回复
- 适合当您有大致想法但需要 AI 协助完善为完整回复
- 结合您的种子内容与原推文上下文，创建相关的扩写回复
- 扩写后完全可编辑 - 您可以根据需要修改生成的内容

## 🛠️ 开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/TwitterReplyAssistant.git
cd TwitterReplyAssistant

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📦 技术栈

- React 18 + TypeScript
- Vite + CRXJS
- Tailwind CSS
- Chrome Extension Manifest V3

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

## 📄 许可证

MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🐛 问题反馈

如果您遇到任何问题或有功能建议，请在 [Issues](https://github.com/yourusername/TwitterReplyAssistant/issues) 中提出。

## ⭐ Star History

如果这个项目对您有帮助，请给它一个 ⭐ Star！

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/yourusername">Bruce Yang</a>
</p>