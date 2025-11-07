/**
 * 调试首页发布框注入功能的脚本
 * 
 * 使用方法：
 * 1. 打开Twitter首页
 * 2. 打开开发者工具（F12）
 * 3. 在Console中复制粘贴此脚本并运行
 */

console.log('=== 开始调试首页发布框功能 ===');

// 1. 检查是否在首页
function checkOnHomePage() {
  const pathname = window.location.pathname;
  const isHome = pathname === '/' || pathname === '/home';
  console.log(`✓ 当前路径: ${pathname}, 是否在首页: ${isHome}`);
  return isHome;
}

// 2. 查找发布框
function findComposeDialog() {
  const textareas = document.querySelectorAll('[data-testid="tweetTextarea_0"]');
  console.log(`✓ 找到 ${textareas.length} 个文本输入框`);
  
  for (const textarea of textareas) {
    const dialog = textarea.closest('[role="dialog"]') as HTMLElement;
    
    if (dialog) {
      const hasQuotedTweet = dialog.querySelector('[data-testid="quotedTweet"]');
      const postButton = dialog.querySelector('[data-testid="tweetButtonInline"]');
      const hasPlaceHolder = dialog.querySelector('[aria-label="Post text"]');
      
      console.log('✓ 检测到对话框:');
      console.log(`  - 有引用推文: ${!!hasQuotedTweet}`);
      console.log(`  - 有发布按钮: ${!!postButton}`);
      console.log(`  - 有发布标签: ${!!hasPlaceHolder}`);
      
      if (!hasQuotedTweet && postButton && hasPlaceHolder) {
        console.log('✅ 确认这是首页发布框');
        return dialog;
      }
    }
  }
  
  console.log('❌ 未找到有效的首页发布框');
  return null;
}

// 3. 查找工具栏
function findToolbar(dialog) {
  const toolbar = dialog.querySelector('[data-testid="toolBar"]') as HTMLElement;
  
  if (toolbar) {
    console.log('✅ 找到工具栏');
    return toolbar;
  }
  
  console.log('❌ 未找到工具栏');
  return null;
}

// 4. 查找ScrollSnap-List
function findScrollSnapList(toolbar) {
  const scrollSnapList = toolbar.querySelector('[data-testid="ScrollSnap-List"]') as HTMLElement;
  
  if (scrollSnapList) {
    console.log('✅ 找到ScrollSnap-List');
    return scrollSnapList;
  }
  
  console.log('❌ 未找到ScrollSnap-List');
  return null;
}

// 5. 查找表情符号按钮
function findEmojiButton(scrollSnapList) {
  const emojiButton = scrollSnapList.querySelector('button[aria-label*="emoji"], button[aria-label*="表情"]');
  
  if (emojiButton) {
    console.log('✅ 找到表情符号按钮');
    return emojiButton;
  }
  
  console.log('❌ 未找到表情符号按钮');
  return null;
}

// 6. 检查是否已经有AI按钮
function hasAIButton(dialog) {
  const aiButton = dialog.querySelector('.twitter-compose-ai-container');
  
  if (aiButton) {
    console.log('⚠️ 已有AI按钮');
    return true;
  }
  
  console.log('✓ 没有AI按钮');
  return false;
}

// 7. 检查发布框激活状态
function checkActivationState(dialog) {
  const editor = dialog.querySelector('.public-DraftEditor-content') as HTMLElement;
  const postButton = dialog.querySelector('[data-testid="tweetButtonInline"]') as HTMLElement;
  
  let isActive = false;
  let reason = '';
  
  // 检查是否有内容
  if (editor && editor.textContent && editor.textContent.trim().length > 0) {
    isActive = true;
    reason = '有内容';
  } else if (editor && editor === document.activeElement) {
    isActive = true;
    reason = '获得焦点';
  } else if (postButton && !postButton.hasAttribute('disabled')) {
    isActive = true;
    reason = '发布按钮可用';
  }
  
  console.log(`✓ 激活状态: ${isActive} (${reason})`);
  return isActive;
}

// 8. 手动注入AI按钮
function injectAIButton() {
  console.log('\n=== 开始手动注入AI按钮 ===');
  
  const dialog = findComposeDialog();
  if (!dialog) {
    console.error('❌ 无法找到发布框，无法注入');
    return false;
  }
  
  if (hasAIButton(dialog)) {
    console.log('⚠️ 已有AI按钮，无需重复注入');
    return false;
  }
  
  const toolbar = findToolbar(dialog);
  if (!toolbar) {
    console.error('❌ 无法找到工具栏');
    return false;
  }
  
  const scrollSnapList = findScrollSnapList(toolbar);
  if (!scrollSnapList) {
    console.error('❌ 无法找到ScrollSnap-List');
    return false;
  }
  
  // 创建AI按钮容器
  const aiButtonContainer = document.createElement('div');
  aiButtonContainer.className = 'twitter-compose-ai-container';
  aiButtonContainer.style.display = 'inline-flex';
  aiButtonContainer.style.alignItems = 'center';
  
  // 创建AI按钮
  const aiButton = document.createElement('button');
  aiButton.innerHTML = '🔽';
  aiButton.className = 'css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-2yi16 r-1qi8awa r-1loqt21';
  aiButton.style.color = 'rgb(29, 155, 240)';
  aiButton.style.backgroundColor = 'transparent';
  aiButton.style.border = 'none';
  aiButton.style.cursor = 'pointer';
  aiButton.style.padding = '8px';
  aiButton.style.borderRadius = '50%';
  aiButton.style.width = '34.75px';
  aiButton.style.height = '34.75px';
  aiButton.style.display = 'flex';
  aiButton.style.alignItems = 'center';
  aiButton.style.justifyContent = 'center';
  
  aiButton.onmouseover = function() {
    this.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
  };
  
  aiButton.onmouseout = function() {
    this.style.backgroundColor = 'transparent';
  };
  
  aiButton.onclick = function() {
    alert('扩写按钮被点击！这表示按钮已正确注入并响应用户操作。');
  };
  
  // 将按钮添加到容器
  aiButtonContainer.appendChild(aiButton);
  
  // 创建presentation包装器
  const presentationWrapper = document.createElement('div');
  presentationWrapper.setAttribute('role', 'presentation');
  presentationWrapper.setAttribute('class', 'css-175oi2r r-14tvyh0 r-cpa5s6');
  presentationWrapper.appendChild(aiButtonContainer);
  
  // 查找表情符号按钮的presentation包装器
  const emojiButton = findEmojiButton(scrollSnapList);
  if (emojiButton) {
    const emojiPresentation = emojiButton.closest('[role="presentation"]');
    
    if (emojiPresentation) {
      // 在表情符号按钮之前插入AI按钮
      scrollSnapList.insertBefore(presentationWrapper, emojiPresentation);
      console.log('✅ AI按钮已成功注入到表情符号按钮前');
    } else {
      // 如果找不到包装器，添加到末尾
      scrollSnapList.appendChild(presentationWrapper);
      console.log('✅ AI按钮已成功添加到工具栏末尾');
    }
  } else {
    // 如果找不到表情符号按钮，添加到末尾
    scrollSnapList.appendChild(presentationWrapper);
    console.log('✅ AI按钮已成功添加到工具栏末尾');
  }
  
  return true;
}

// 9. 主要执行函数
function main() {
  console.log('步骤 1: 检查当前页面');
  if (!checkOnHomePage()) {
    console.log('⚠️ 当前不在首页，请先导航到Twitter首页');
    return;
  }
  
  console.log('\n步骤 2: 查找发布框');
  const dialog = findComposeDialog();
  if (!dialog) {
    console.log('⚠️ 未找到发布框，请先点击"发布"按钮打开发布框');
    return;
  }
  
  console.log('\n步骤 3: 检查激活状态');
  checkActivationState(dialog);
  
  console.log('\n步骤 4: 检查是否已有AI按钮');
  if (!hasAIButton(dialog)) {
    console.log('\n步骤 5: 手动注入AI按钮');
    injectAIButton();
  }
  
  console.log('\n=== 调试完成 ===');
  console.log('如果AI按钮未显示，请检查：');
  console.log('1. 发布框是否已打开');
  console.log('2. 发布框是否处于激活状态（有内容或获得焦点）');
  console.log('3. 工具栏是否已加载完成');
}

// 运行主函数
main();

// 导出函数供外部调用
window.debugCompose = {
  checkOnHomePage,
  findComposeDialog,
  findToolbar,
  findScrollSnapList,
  findEmojiButton,
  hasAIButton,
  checkActivationState,
  injectAIButton
};