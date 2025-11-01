# Twitter Reply Assistant - 功能测试指南

本指南将帮助你测试已完成的功能模块。

## 📋 测试前准备

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 加载扩展到浏览器

1. 打开 Chrome/Edge 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择项目的 `dist` 文件夹
6. 确认扩展已加载成功

---

## 🧪 测试 1: 扩展基础功能

### 预期结果
- ✅ 扩展图标出现在浏览器工具栏
- ✅ 点击图标显示弹窗
- ✅ 弹窗显示测试界面（下一步会添加）

### 测试步骤

1. **查看扩展状态**
   - 在 `chrome://extensions/` 页面
   - 找到 "Twitter Reply Assistant"
   - 确认状态为「已启用」
   - 确认没有错误提示

2. **测试弹窗**
   - 点击工具栏的扩展图标
   - 应该弹出一个窗口
   - 窗口标题：Twitter Reply Assistant

---

## 🧪 测试 2: 后台服务 (Background Service Worker)

### 打开后台控制台

1. 访问 `chrome://extensions/`
2. 找到 Twitter Reply Assistant
3. 点击「查看服务工作进程」（或「service worker」链接）
4. 会打开一个开发者工具窗口

### 测试命令

在控制台中执行以下命令：

```javascript
// 查看扩展是否正常运行
console.log('Background script running:', chrome.runtime.id);

// 测试消息通信
chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
  console.log('Response:', response);
});
```

### 预期结果
```
Background script running: <扩展ID>
Response: { status: 'ok' }
```

---

## 🧪 测试 3: 存储服务 (Storage Service)

### 方式 A: 在弹窗控制台测试

1. **打开弹窗控制台**
   - 点击扩展图标打开弹窗
   - 在弹窗上右键 → 「检查」
   - 或者右键点击扩展图标 → 「检查弹出内容」

2. **导入存储服务**

```javascript
// 先加载模块（通过动态 import）
const { StorageService, ConfigValidator } = await import('/src/services/storage-service.ts');
const { PROVIDER_URLS } = await import('/src/types/index.ts');
```

3. **测试配置保存**

```javascript
// 创建测试配置
const testConfig = {
  provider: 'siliconflow',
  apiUrl: PROVIDER_URLS.siliconflow,
  apiToken: 'sk-test-token-123456789',
  model: 'Qwen/Qwen2.5-7B-Instruct'
};

// 保存配置
await StorageService.setAIConfig(testConfig);
console.log('✅ 配置已保存');
```

4. **测试配置读取**

```javascript
// 读取配置
const config = await StorageService.getAIConfig();
console.log('读取的配置:', config);
```

5. **测试配置验证**

```javascript
// 测试有效配置
const validResult = ConfigValidator.validateConfig(testConfig);
console.log('验证结果:', validResult);
// 应该输出: { valid: true, errors: [] }

// 测试无效配置
const invalidConfig = {
  provider: 'siliconflow',
  apiUrl: 'http://invalid-url',  // HTTP 不安全
  apiToken: '',  // 空 token
  model: 'test'
};
const invalidResult = ConfigValidator.validateConfig(invalidConfig);
console.log('无效配置验证:', invalidResult);
// 应该输出: { valid: false, errors: [...] }
```

6. **测试存储信息**

```javascript
// 查看存储使用情况
const info = await StorageService.getStorageInfo();
console.log('存储使用:', info);
// 输出: { bytesInUse: xxx, quota: 102400, percentUsed: x.xx }
```

7. **清理测试数据**

```javascript
// 清除配置
await StorageService.clearAIConfig();
console.log('✅ 配置已清除');

// 验证已清除
const cleared = await StorageService.getAIConfig();
console.log('清除后的配置:', cleared);  // 应该是 null
```

### 方式 B: 使用 Chrome 存储查看器

1. 安装扩展后，在控制台执行：
```javascript
chrome.storage.sync.get(null, console.log);
```

2. 或者使用 Chrome 开发者工具：
   - F12 → Application → Storage → Chrome Extension Storage

---

## 🧪 测试 4: AI 服务 (需要真实 API 密钥)

### ⚠️ 注意
测试 AI 服务需要真实的 API 密钥，会产生 API 调用费用。

### 在弹窗控制台测试

```javascript
// 1. 导入服务
const { AIService } = await import('/src/services/ai-service.ts');
const { StorageService } = await import('/src/services/storage-service.ts');

// 2. 配置 API（使用你自己的密钥）
const config = {
  provider: 'siliconflow',
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiToken: '你的API密钥',  // 替换为真实密钥
  model: 'Qwen/Qwen2.5-7B-Instruct'
};

// 3. 保存配置
await StorageService.setAIConfig(config);

// 4. 测试配置连接
console.log('测试 API 连接...');
const testResult = await AIService.testConfig(config);
console.log('连接测试结果:', testResult);
// 成功: { success: true, latency: xxx }
// 失败: { success: false, error: '错误信息' }

// 5. 生成回复（如果连接成功）
if (testResult.success) {
  console.log('生成幽默风格回复...');
  const reply = await AIService.generateReply(
    '今天天气真好！',
    'humorous'
  );
  console.log('生成的回复:', reply);
}
```

### 测试所有回复风格

```javascript
const testTweet = '今天学到了很多关于 AI 的知识';

const styles = ['professional', 'humorous', 'concise', 'supportive', 'critical', 'questioning'];

for (const style of styles) {
  console.log(`\n测试风格: ${style}`);
  try {
    const reply = await AIService.generateReply(testTweet, style);
    console.log('✅', reply);
  } catch (error) {
    console.error('❌', error.message);
  }
}
```

---

## 🧪 测试 5: Content Script (Twitter 页面注入)

### 测试步骤

1. **访问 Twitter**
   - 打开 https://twitter.com 或 https://x.com
   - 确保已登录账号

2. **打开控制台**
   - F12 打开开发者工具
   - 切换到 Console 标签

3. **查看日志**
   - 应该看到: `Twitter Reply Assistant: Content script loaded`
   - 这说明 content script 已成功注入

4. **测试选择器**

```javascript
// 测试 Twitter DOM 选择器
const tweets = document.querySelectorAll('[data-testid="tweet"]');
console.log('找到的推文数量:', tweets.length);

// 查看第一条推文的文本
if (tweets.length > 0) {
  const firstTweet = tweets[0];
  const tweetText = firstTweet.querySelector('[data-testid="tweetText"]');
  console.log('第一条推文内容:', tweetText?.textContent);
}
```

---

## 🧪 测试 6: 错误处理

### 测试无效配置错误

```javascript
const { AIService } = await import('/src/services/ai-service.ts');
const { StorageService } = await import('/src/services/storage-service.ts');

// 清除配置
await StorageService.clearAIConfig();

// 尝试生成回复（应该失败）
try {
  await AIService.generateReply('测试', 'humorous');
} catch (error) {
  console.log('错误类型:', error.type);
  console.log('错误信息:', error.message);
  // 应该输出: INVALID_CONFIG, "AI configuration not found..."
}
```

### 测试网络错误

```javascript
// 使用无效的 URL
const badConfig = {
  provider: 'custom',
  apiUrl: 'https://invalid-api-endpoint-123456.com/v1/chat',
  apiToken: 'test',
  model: 'test'
};

await StorageService.setAIConfig(badConfig);

try {
  await AIService.generateReply('测试', 'humorous');
} catch (error) {
  console.log('错误类型:', error.type);
  console.log('错误信息:', error.message);
  // 应该输出: NETWORK_ERROR 或 API_TIMEOUT
}
```

---

## 📊 测试检查清单

完成所有测试后，确认以下项目：

### 基础功能
- [ ] 扩展正常加载
- [ ] 弹窗可以打开
- [ ] 后台服务正常运行
- [ ] Content script 在 Twitter 页面加载

### 存储服务
- [ ] 可以保存配置
- [ ] 可以读取配置
- [ ] 配置验证正常工作
- [ ] 可以查看存储使用情况
- [ ] 可以清除配置

### AI 服务（需要 API 密钥）
- [ ] API 连接测试成功
- [ ] 可以生成回复
- [ ] 不同风格生成不同内容
- [ ] 回复长度控制在 120 字符内
- [ ] 错误处理正常工作

---

## 🐛 常见问题排查

### 问题 1: 找不到模块

**症状**: `Cannot find module '/src/services/storage-service.ts'`

**解决**:
```javascript
// 使用相对路径
const module = await import('./services/storage-service.ts');
```

### 问题 2: Chrome API 未定义

**症状**: `chrome is not defined`

**原因**: 在错误的上下文中执行（例如网页控制台）

**解决**: 确保在扩展的控制台中执行（popup、background、content script）

### 问题 3: 存储权限错误

**症状**: `Error: storage permission not granted`

**解决**: 检查 manifest.json 中是否包含 `"permissions": ["storage"]`

### 问题 4: API 调用失败

**可能原因**:
1. API 密钥无效 → 检查密钥是否正确
2. 网络问题 → 检查网络连接
3. API 地址错误 → 确认 URL 正确
4. 模型名称错误 → 检查模型是否可用

---

## 💡 高级测试技巧

### 监听存储变化

```javascript
const { StorageService } = await import('/src/services/storage-service.ts');

const unsubscribe = StorageService.onConfigChange((config) => {
  console.log('配置已更新:', config);
});

// 测试: 在另一个控制台修改配置，这里应该能看到通知

// 取消监听
unsubscribe();
```

### 性能测试

```javascript
// 测试 API 响应时间
const start = performance.now();
const reply = await AIService.generateReply('测试', 'concise');
const duration = performance.now() - start;
console.log(`生成回复耗时: ${duration.toFixed(0)}ms`);
```

### 批量测试

```javascript
// 生成 10 条不同的回复
const tweets = [
  '今天天气真好',
  '学习 JavaScript 好难啊',
  '这个产品太棒了',
  'AI 技术发展真快',
  '周末愉快！'
];

for (const tweet of tweets) {
  const reply = await AIService.generateReply(tweet, 'humorous');
  console.log(`推文: "${tweet}"`);
  console.log(`回复: "${reply}"\n`);
}
```

---

## 📝 测试报告模板

完成测试后，可以这样记录：

```
测试日期: 2025-11-01
测试人员: [你的名字]
扩展版本: 1.0.0

✅ 通过的测试:
- 扩展加载
- 存储服务读写
- 配置验证
- [...]

❌ 失败的测试:
- [列出失败项和原因]

🐛 发现的问题:
- [列出发现的 bug]

💡 改进建议:
- [列出改进想法]
```

---

**下一步**: 完成测试后，我们将实现弹窗配置界面，让这些功能可以通过 UI 操作！
