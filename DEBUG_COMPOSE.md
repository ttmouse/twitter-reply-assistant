# 首页发布框按钮缺失调试指南

## 问题描述
您发现在发推文界面看不到扩展的入口按钮。这可能是由于以下原因：

1. **不在Twitter首页**：扩展只在Twitter首页(`twitter.com`或`x.com`的根路径或`/home`)注入按钮
2. **DOM结构变化**：Twitter的HTML结构经常变化，导致选择器失效
3. **页面加载时机**：扩展可能在Twitter完全渲染前就尝试注入
4. **新版Twitter交互**：新版Twitter首页不再有单独的"发布"按钮，而是直接激活输入框
5. **配置问题**：如果扩展没有正确配置API，可能会阻止功能运行

## 重要提示：新版Twitter交互方式

**新版Twitter首页没有单独的"发布"按钮，而是直接点击首页的输入框即可激活发布界面。**

请确保您：
1. 在Twitter首页
2. 直接点击主页中部的输入框（显示"有什么新鲜事？"）
3. 等待发布界面完全展开

## 快速诊断步骤

### 1. 打开控制台
在Twitter首页(`https://twitter.com`或`https://x.com`)按F12打开开发者工具，切换到Console标签。

### 2. 激活发布框
点击首页的输入框，激活发布界面。

### 3. 运行诊断命令
在控制台中输入以下命令并按Enter：

```javascript
// 检查扩展是否已加载
window.twitterAIReply

// 检查扩展状态
window.twitterAIReply.composeInjector.processedDialogs.size

// 强制重新注入
window.twitterAIReply.reinjectCompose()

// 测试首页输入框检测
testHomepageInput()

// 尝试手动注入测试按钮
manuallyInjectToHomepage()
```

### 3. 运行详细诊断
如果上述命令无法解决问题，运行详细诊断：

```javascript
// 导入调试工具（可能需要先打开扩展弹窗来触发加载）
import('/src/utils/compose-debugger.ts').then(module => {
  module.debugComposeBox();
});

// 如果上面的导入失败，可以手动运行以下诊断代码：
debugComposeBox()
```

### 4. 尝试强制注入
如果诊断找到发布框但没有按钮，尝试强制注入：

```javascript
forceInjectAIButton()
```

## 常见问题解决

### 问题1：不在首页
**症状**：诊断显示"不在首页，跳过注入"
**解决**：
- 确保您在`https://twitter.com`或`https://x.com`的根路径，而不是在`/home`或其他子页面
- 如果在`/home`页面，可以尝试修改代码中的`isOnHomePage`方法

### 问题2：找不到发布框
**症状**：诊断显示"未找到发布弹窗"
**解决**：
- 确保您已经点击了"发布"按钮，打开了发布对话框
- 等待对话框完全加载后再运行诊断

### 问题3：找不到工具栏
**症状**：诊断显示"未找到工具栏"
**解决**：
- 这可能是因为Twitter更新了DOM结构
- 使用`forceInjectAIButton()`尝试强制注入，它使用多种备用方法

### 问题4：配置问题
**症状**：控制台显示"未找到API配置"
**解决**：
- 点击浏览器工具栏中的扩展图标
- 配置您的API设置
- 刷新页面后重试

## 手动修复

如果自动注入仍然失败，您可以尝试以下手动修复方法：

1. 在控制台运行：
```javascript
// 清除已处理的对话框记录
window.twitterAIReply.composeInjector.processedDialogs.clear()

// 重新注入
window.twitterAIReply.reinjectCompose()
```

2. 如果上述方法无效，尝试完全重启扩展：
```javascript
// 停止注入器
window.twitterAIReply.stop()

// 等待2秒
setTimeout(() => {
  // 重新启动
  window.twitterAIReply.start()
}, 2000)
```

## 报告问题

如果您尝试了所有方法仍然无法解决问题，请提供以下信息：

1. 控制台的完整错误日志
2. `debugComposeBox()`的输出结果
3. 您使用的浏览器和版本
4. Twitter的URL路径
5. 是否能看到"发布"对话框

## 开发者调试

如果您是开发者，可以在代码中添加更多调试信息：

1. 修改`src/content/compose-injector.tsx`，取消注释更多的console.log
2. 在`src/utils/twitter-dom.ts`的`findComposeDialog`方法中添加更多调试信息
3. 检查`manifest.json`确保正确配置了content scripts