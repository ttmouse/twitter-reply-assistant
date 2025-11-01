# Twitter Reply Assistant - 快速开始

## 🎉 第一阶段完成！

Chrome 扩展的基础配置已经完成，现在你可以在浏览器中加载和测试这个扩展了。

## 📦 已完成的配置

✅ Manifest V3 配置文件
✅ Vite + CRXJS 插件配置
✅ Tailwind CSS 样式系统
✅ 基础目录结构（background, content, popup）
✅ 占位符文件和示例代码

## 🚀 如何在浏览器中加载扩展

### 方法一：使用开发服务器（推荐）

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **在 Chrome/Edge 中加载扩展**
   - 打开浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`
   - 开启右上角的「开发者模式」
   - 点击「加载已解压的扩展程序」
   - 选择项目根目录下的 `dist` 文件夹

3. **查看效果**
   - 浏览器工具栏会出现扩展图标（可能是默认图标）
   - 点击图标会打开配置弹窗
   - 访问 twitter.com 或 x.com（虽然功能还未实现，但 content script 会加载）

### 方法二：生产构建

```bash
npm run build
# 然后加载 dist 目录
```

## 📝 当前可以看到的内容

### 1. 弹窗界面（Popup）
- 点击扩展图标会打开一个弹窗
- 显示「配置界面开发中」的占位消息
- 使用 Tailwind CSS 样式

### 2. 后台服务（Background）
- 在扩展安装时会在控制台输出日志
- 可以在 `chrome://extensions/` 点击「查看服务工作进程」查看日志

### 3. Content Script
- 访问 Twitter/X.com 时会在页面控制台输出日志
- 打开开发者工具（F12）可以看到：`Twitter Reply Assistant: Content script loaded`

## 🔧 开发工作流

### 热重载
开发服务器运行时，修改代码后：
- 弹窗和 content script 会自动重载
- 某些情况需要手动刷新扩展或页面

### 调试技巧

**调试 Popup（弹窗）**
- 右键点击扩展图标 → 「检查弹出内容」
- 或者点击图标后在弹窗上右键 → 「检查」

**调试 Content Script（内容脚本）**
- 访问 Twitter/X.com
- F12 打开开发者工具
- 在 Console 中查看日志

**调试 Background（后台服务）**
- 访问 `chrome://extensions/`
- 找到 Twitter Reply Assistant
- 点击「查看服务工作进程」

## 📂 项目结构

```
TwitterReplyAssistant/
├── dist/                    # 构建输出（加载这个目录到浏览器）
├── src/
│   ├── background/
│   │   └── index.ts        # 后台服务工作进程
│   ├── content/
│   │   ├── index.tsx       # Twitter 页面注入脚本
│   │   └── styles.css      # 注入元素的样式
│   ├── popup/
│   │   ├── index.html      # 弹窗 HTML
│   │   └── index.tsx       # 弹窗 React 组件
│   └── index.css           # 全局样式（Tailwind）
├── public/
│   └── icons/              # 扩展图标（待添加）
├── manifest.json           # 扩展配置清单
├── vite.config.ts          # Vite + CRXJS 配置
└── tailwind.config.js      # Tailwind CSS 配置
```

## ✨ 下一步开发计划

### 阶段 2：类型定义和工具服务
- [ ] 创建 `src/types/index.ts` - TypeScript 接口定义
- [ ] 创建 `src/services/storage-service.ts` - Chrome 存储封装
- [ ] 创建 `src/services/ai-service.ts` - AI API 调用服务

### 阶段 3：弹窗配置界面
- [ ] 实现 AI 提供商选择（SiliconFlow, DeepSeek, GLM, 自定义）
- [ ] 实现 API 密钥配置
- [ ] 实现配置保存和加载
- [ ] 添加表单验证

### 阶段 4：Twitter 集成
- [ ] 实现推文检测（MutationObserver）
- [ ] 在推文上注入 AI 按钮
- [ ] 实现样式选择器组件
- [ ] 实现回复生成和填充

### 阶段 5：样式和优化
- [ ] 设计和添加正式图标
- [ ] 优化 UI 样式
- [ ] 添加加载状态和错误处理
- [ ] 性能优化

## 🐛 常见问题

**Q: 扩展图标不显示**
A: 这是正常的，我们还没有添加图标文件。可以在 `public/icons/` 目录添加 PNG 图标。

**Q: 刷新 Twitter 后功能失效**
A: 开发阶段正常，后续会实现持久化注入。

**Q: 修改代码后没有更新**
A: 尝试在 `chrome://extensions/` 点击扩展的刷新按钮。

## 📖 参考文档

- [Chrome Extension 开发文档](https://developer.chrome.com/docs/extensions/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- 项目详细文档：`.claude/dev-docs/`

## 💡 开发建议

1. **保持开发服务器运行**：`npm run dev`
2. **频繁测试**：每次修改后在浏览器中验证
3. **查看控制台**：所有日志信息都很有用
4. **增量开发**：一次只实现一个功能
5. **提交代码**：每完成一个功能就提交

---

**当前版本**: v0.1.0 (基础框架)
**最后更新**: 2025-11-01
**状态**: ✅ 可以加载到浏览器中进行开发

开始开发吧！🚀
