# AI 服务配置指南

## 🎯 支持的 API 服务商

本扩展支持 4 种 AI 服务商，都使用 OpenAI 兼容的 API 格式：

### 1. SiliconFlow （推荐 - 性价比高）

**特点**:
- 🇨🇳 国内访问快
- 💰 价格便宜（Qwen 系列模型很实惠）
- 🚀 支持多种开源模型

**获取 API 密钥**:
1. 访问: https://cloud.siliconflow.cn
2. 注册/登录账号
3. 进入「API 密钥」页面
4. 点击「创建新密钥」
5. 复制生成的密钥（sk-开头）

**推荐模型**:
- `Qwen/Qwen2.5-7B-Instruct` - 速度快，质量好
- `Qwen/Qwen2.5-14B-Instruct` - 质量更高
- `deepseek-ai/DeepSeek-V2.5` - 综合能力强

**API URL**: `https://api.siliconflow.cn/v1/chat/completions`

---

### 2. DeepSeek （推荐 - 性能强）

**特点**:
- 🧠 推理能力强
- 💡 代码能力优秀
- 🇨🇳 中文支持好

**获取 API 密钥**:
1. 访问: https://platform.deepseek.com
2. 注册/登录账号
3. 进入「API Keys」
4. 创建新密钥
5. 复制密钥

**推荐模型**:
- `deepseek-chat` - 通用对话模型
- `deepseek-coder` - 代码专用（如果需要）

**API URL**: `https://api.deepseek.com/v1/chat/completions`

---

### 3. 智谱 GLM （国内大厂）

**特点**:
- 🏢 清华团队背景
- 🇨🇳 中文优化
- 📱 支持多模态

**获取 API 密钥**:
1. 访问: https://open.bigmodel.cn
2. 注册/登录
3. 进入「API Keys」
4. 创建密钥
5. 复制密钥

**推荐模型**:
- `glm-4` - 最新版本
- `glm-4-flash` - 更快版本

**API URL**: `https://open.bigmodel.cn/api/paas/v4/chat/completions`

---

### 4. 自定义（使用其他服务商）

如果你有其他 OpenAI 兼容的 API：
- OpenRouter
- Groq
- Together AI
- 本地部署的模型（Ollama 等）

只需提供完整的 API URL 和密钥即可。

---

## 🔧 配置方法

### 方法 1: 通过控制台配置（推荐）

1. **打开测试界面**
   - 点击扩展图标

2. **打开控制台**
   - 右键点击弹窗 → 「检查」（或 F12）
   - 确保在 Console 标签

3. **运行配置脚本**

根据你选择的服务商，复制对应的脚本：

#### 🟦 配置 SiliconFlow

```javascript
// 1. 导入服务
const { StorageService } = await import('./services/storage-service.ts');

// 2. 配置 API（替换为你的真实密钥）
const config = {
  provider: 'siliconflow',
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiToken: 'sk-你的SiliconFlow密钥',  // 替换这里！
  model: 'Qwen/Qwen2.5-7B-Instruct'
};

// 3. 保存配置
await StorageService.setAIConfig(config);
console.log('✅ 配置已保存！');

// 4. 刷新界面
location.reload();
```

#### 🟦 配置 DeepSeek

```javascript
const { StorageService } = await import('./services/storage-service.ts');

const config = {
  provider: 'deepseek',
  apiUrl: 'https://api.deepseek.com/v1/chat/completions',
  apiToken: 'sk-你的DeepSeek密钥',  // 替换这里！
  model: 'deepseek-chat'
};

await StorageService.setAIConfig(config);
console.log('✅ 配置已保存！');
location.reload();
```

#### 🟦 配置智谱 GLM

```javascript
const { StorageService } = await import('./services/storage-service.ts');

const config = {
  provider: 'glm',
  apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiToken: '你的GLM密钥',  // 替换这里！
  model: 'glm-4'
};

await StorageService.setAIConfig(config);
console.log('✅ 配置已保存！');
location.reload();
```

#### 🟦 配置自定义服务

```javascript
const { StorageService } = await import('./services/storage-service.ts');

const config = {
  provider: 'custom',
  apiUrl: 'https://你的API地址/v1/chat/completions',
  apiToken: '你的API密钥',
  model: '你的模型名称'
};

await StorageService.setAIConfig(config);
console.log('✅ 配置已保存！');
location.reload();
```

---

## ✅ 验证配置

配置保存并刷新后：

1. **切换到「⚙️ 配置状态」标签**
   - 应该看到你的配置信息
   - 提供商、API URL、Token（部分显示）、模型

2. **回到「🧪 功能测试」标签**
   - **🤖 测试 AI 服务** 按钮应该变为可点击状态
   - 不再显示 "⚠️ 需要先配置 API" 警告

---

## 🧪 测试 AI 服务

配置完成后：

1. **点击 「🤖 测试 AI 服务」按钮**

2. **等待测试结果**（可能需要 3-10 秒）

3. **预期输出**:
```
测试 API 连接...
✅ API 连接成功！延迟: 1234ms

生成测试回复...
✅ 回复生成成功！

原推文: "今天天气真好！☀️"
AI 回复: "是啊，可惜我在办公室看不到 😢"

字符数: 18/120
```

---

## 🎨 测试不同的回复风格

在控制台中运行，测试所有 6 种风格：

```javascript
// 导入服务
const { AIService } = await import('./services/ai-service.ts');

// 测试推文
const testTweet = '今天学到了很多关于 AI 的知识';

// 所有风格
const styles = [
  'professional',   // 💼 专业严谨
  'humorous',       // 😄 幽默风趣
  'concise',        // ✨ 简洁明了
  'supportive',     // 👍 友好支持
  'critical',       // 🤔 批判性思考
  'questioning'     // ❓ 提问引导
];

// 批量测试
console.log('开始测试所有风格...\n');
for (const style of styles) {
  console.log(`🎯 风格: ${style}`);
  try {
    const reply = await AIService.generateReply(testTweet, style);
    console.log(`✅ ${reply}\n`);
  } catch (error) {
    console.error(`❌ 错误: ${error.message}\n`);
  }
}
console.log('测试完成！');
```

---

## 💰 费用说明

### SiliconFlow 参考价格
- Qwen2.5-7B-Instruct: ￥0.00105 / 1K tokens
- 生成一条回复大约消耗 200-500 tokens
- **每条回复成本约 ￥0.0002-0.0005（不到一分钱）**

### DeepSeek 参考价格
- DeepSeek-Chat: ￥0.001 / 1K tokens（输入）
- **成本也非常低**

### 新用户福利
- SiliconFlow: 新用户通常有免费额度
- DeepSeek: 注册送 500 万 tokens
- GLM: 有免费额度

---

## 🐛 常见问题

### Q1: 配置保存后按钮还是禁用？

**解决**: 确保刷新了界面
```javascript
location.reload();  // 运行这个刷新
```

### Q2: 点击测试后显示 "API 连接失败"？

**可能原因**:
1. **API 密钥错误** - 检查密钥是否正确复制
2. **网络问题** - 检查网络连接
3. **余额不足** - 检查账户余额
4. **模型名称错误** - 确认模型名称正确

### Q3: 如何查看当前配置？

```javascript
const { StorageService } = await import('./services/storage-service.ts');
const config = await StorageService.getAIConfig();
console.log('当前配置:', config);
```

### Q4: 如何修改配置？

重新运行配置脚本即可，会覆盖旧配置。

### Q5: 如何删除配置？

点击测试界面的 **🗑️ 清除配置** 按钮，或在控制台运行：
```javascript
const { StorageService } = await import('./services/storage-service.ts');
await StorageService.clearAIConfig();
console.log('✅ 配置已清除');
location.reload();
```

---

## 📊 性能基准测试

在控制台运行性能测试：

```javascript
const { AIService } = await import('./services/ai-service.ts');

console.log('开始性能测试...');
const testTweet = '测试推文';
const runs = 3;

let totalTime = 0;

for (let i = 1; i <= runs; i++) {
  const start = performance.now();
  await AIService.generateReply(testTweet, 'concise');
  const duration = performance.now() - start;

  totalTime += duration;
  console.log(`第 ${i} 次: ${duration.toFixed(0)}ms`);
}

const avgTime = totalTime / runs;
console.log(`\n平均响应时间: ${avgTime.toFixed(0)}ms`);
console.log(`预估 QPS: ${(1000 / avgTime).toFixed(2)}`);
```

---

## 🔒 安全提示

1. **不要分享 API 密钥**
   - 密钥就像密码，不要给别人

2. **不要提交到 Git**
   - 密钥只保存在浏览器本地
   - 不会被提交到代码仓库

3. **定期轮换密钥**
   - 建议定期更换 API 密钥

4. **监控使用量**
   - 定期检查 API 服务商的使用统计

---

## 📚 相关文档

- 完整测试指南: `TESTING_GUIDE.md`
- 快速测试: `QUICK_TEST.md`
- 类型定义: `src/types/index.ts`
- AI 服务代码: `src/services/ai-service.ts`

---

**现在就去注册一个 API 服务商，获取密钥，然后测试 AI 功能吧！** 🚀

推荐从 **SiliconFlow** 开始，注册快、免费额度多、速度快！
