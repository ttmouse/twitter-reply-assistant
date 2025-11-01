# CORS 问题修复说明

## ✅ 已修复的问题

刚才遇到的 CORS 错误：
```
Access to script at 'http://localhost:5174/@vite/env' from origin 'chrome-extension://...'
has been blocked by CORS policy
```

**原因**: CRXJS 在开发模式下需要从 localhost 加载资源，但 Chrome 扩展默认不允许这种跨域访问。

## 🔧 已完成的修复

### 1. 更新 manifest.json
添加了开发服务器权限：
```json
"host_permissions": [
  "https://twitter.com/*",
  "https://x.com/*",
  "http://localhost:*/*"  // 新增：允许访问 localhost
],
"web_accessible_resources": [
  {
    "resources": ["**/*"],
    "matches": ["<all_urls>"]
  }
]
```

### 2. 更新 vite.config.ts
固定开发服务器端口：
```typescript
server: {
  port: 5173,
  strictPort: true,
  hmr: {
    port: 5173,
  },
}
```

## 🚀 重新加载扩展

**重要**: 必须完全重新加载扩展才能应用新的权限配置！

### 方式 1: 刷新扩展（推荐）

1. 访问 `chrome://extensions/`
2. 找到 **Twitter Reply Assistant**
3. 点击 **刷新按钮** 🔄
4. 确认扩展重新加载完成

### 方式 2: 完全重新加载

1. 访问 `chrome://extensions/`
2. 找到 **Twitter Reply Assistant**
3. 点击 **移除** 按钮
4. 点击 **加载已解压的扩展程序**
5. 选择项目的 `dist` 文件夹

## ✅ 验证修复

重新加载扩展后：

1. **点击扩展图标**
2. **应该看到测试界面正常显示**
3. **打开控制台** (右键弹窗 → 检查)
4. **确认没有 CORS 错误**

### 测试功能

1. 点击 **📦 测试存储服务** 按钮
2. 应该看到：
   ```
   ✅ 步骤 1: 配置已保存
   ✅ 步骤 2: 配置读取成功
   ✅ 步骤 3: 配置验证通过
   ✅ 步骤 4: 存储使用 xxx / 102400 字节 (x.xx%)

   ✅ 所有测试通过！
   ```

## 🐛 如果仍然有问题

### 检查服务器端口

确认开发服务器运行在正确的端口：
```bash
# 应该显示 port: 5173
npm run dev
```

### 清除浏览器缓存

1. 在 `chrome://extensions/` 页面
2. 打开 **开发者模式**
3. 找到扩展，点击 **详细信息**
4. 滚动到底部，点击 **清除数据**
5. 刷新扩展

### 检查控制台错误

1. 右键点击扩展图标 → **检查弹出内容**
2. 查看 Console 标签
3. 查找任何新的错误信息

如果还有 CORS 错误，请复制完整的错误信息。

## 📝 注意事项

### 开发模式 vs 生产模式

- **开发模式** (npm run dev): 需要 localhost 权限
- **生产模式** (npm run build): 不需要 localhost 权限

发布到 Chrome Web Store 前，应该移除 `http://localhost:*/*` 权限。

### 端口固定

现在开发服务器固定使用 **端口 5173**：
- ✅ 更稳定
- ✅ 避免端口冲突
- ✅ CORS 配置更可靠

如果 5173 端口被占用，开发服务器会启动失败（strictPort: true）。

## 🎯 下一步

修复完成后，继续测试：

1. ✅ 测试存储服务
2. ✅ 查看配置状态
3. ✅ 测试所有工具按钮
4. （可选）配置 API 密钥测试 AI 服务

---

**当前状态**:
- 🟢 开发服务器运行中 (http://localhost:5173)
- 🟢 CORS 配置已修复
- 🟡 等待重新加载扩展

**重新加载扩展后，所有功能都应该正常工作！** 🎉
