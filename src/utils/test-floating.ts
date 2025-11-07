/**
 * 悬浮按钮测试工具
 * 
 * 用于测试悬浮按钮功能的工具
 * 可以在浏览器控制台运行
 */

/**
 * 测试悬浮按钮功能
 */
export function testFloatingButton(): void {
  console.log('🧪 测试悬浮按钮功能...');
  
  // 检查悬浮按钮注入器
  const floatingInjector = (window as any).twitterAIReply?.floatingInjector;
  if (!floatingInjector) {
    console.error('❌ 悬浮按钮注入器未找到，请确保扩展已正确加载');
    return;
  }
  
  console.log('✅ 悬浮按钮注入器已找到');
  
  // 检查是否已注入
  const container = document.getElementById('twitter-ai-floating-button-container');
  if (container) {
    console.log('✅ 悬浮按钮容器已注入页面');
    console.log('容器元素:', container);
  } else {
    console.log('❌ 悬浮按钮容器未找到，尝试重新注入...');
    floatingInjector.reinject();
    
    // 再次检查
    setTimeout(() => {
      const newContainer = document.getElementById('twitter-ai-floating-button-container');
      if (newContainer) {
        console.log('✅ 悬浮按钮重新注入成功');
      } else {
        console.error('❌ 悬浮按钮重新注入失败');
      }
    }, 1000);
  }
  
  // 检查是否有发布框
  const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
  if (composeBox) {
    console.log('✅ 找到发布框');
    console.log('  - 元素标签:', composeBox.tagName);
    console.log('  - 元素类名:', composeBox.className);
    console.log('  - 是否可见:', composeBox.offsetParent !== null);
    console.log('  - 当前内容:', composeBox.textContent?.substring(0, 50) || '(空)');
  } else {
    console.log('❌ 未找到发布框，请先点击发布按钮');
  }
  
  // 输出悬浮按钮状态
  console.log('📋 悬浮按钮状态信息:');
  console.log('  - 页面URL:', window.location.href);
  console.log('  - 是否在Twitter/X:', window.location.hostname.includes('twitter.com') || window.location.hostname.includes('x.com'));
  console.log('  - 是否在首页:', window.location.pathname === '/' || window.location.pathname === '/home');
}

/**
 * 手动创建简单的测试按钮
 */
export function createTestButton(): void {
  console.log('🔧 创建测试按钮...');
  
  // 移除已存在的测试按钮
  const existingButton = document.getElementById('test-ai-button');
  if (existingButton) {
    existingButton.remove();
  }
  
  // 创建测试按钮
  const testButton = document.createElement('button');
  testButton.id = 'test-ai-button';
  testButton.textContent = '🤖 测试AI扩写';
  testButton.style.cssText = `
    position: fixed;
    right: 20px;
    top: 100px;
    z-index: 999999;
    background-color: #1DA1F2;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 12px 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 4px 12px rgba(29, 161, 242, 0.3);
    transition: all 0.3s ease;
  `;
  
  testButton.addEventListener('click', () => {
    // 查找发布框
    const composeBox = document.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
    if (!composeBox) {
      alert('请先打开发布框！');
      return;
    }
    
    // 模拟AI扩写
    const currentText = composeBox.textContent || '';
    const expandedText = currentText + ' [这是AI扩写测试内容]';
    
    // 聚焦并填充文本
    composeBox.focus();
    composeBox.textContent = expandedText;
    
    // 触发输入事件
    composeBox.dispatchEvent(new Event('input', { bubbles: true }));
    
    alert('测试成功！文本已扩写。');
  });
  
  // 添加到页面
  document.body.appendChild(testButton);
  console.log('✅ 测试按钮已添加到页面');
  
  // 5秒后自动移除
  setTimeout(() => {
    testButton.remove();
    console.log('🗑️ 测试按钮已自动移除');
  }, 5000);
}

// 暴露到全局
(window as any).testFloatingButton = testFloatingButton;
(window as any).createTestButton = createTestButton;

/**
 * 使用说明:
 * 1. 打开Twitter首页
 * 2. 打开浏览器控制台(F12)
 * 3. 运行 testFloatingButton() 测试悬浮按钮
 * 4. 如果悬浮按钮不工作，运行 createTestButton() 创建测试按钮
 */