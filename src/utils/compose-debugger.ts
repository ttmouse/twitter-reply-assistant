/**
 * Compose Box Debug Tool
 * 
 * 用于调试首页发布框按钮注入问题的工具
 * 可以在浏览器控制台运行
 */

import { TwitterDOM } from './twitter-dom';

/**
 * 调试首页发布框问题
 */
export function debugComposeBox(): void {
  console.log('🔍 开始调试首页发布框...');
  
  // 1. 检查当前页面
  console.log('📍 当前页面信息:');
  console.log('  - URL:', window.location.href);
  console.log('  - 路径:', window.location.pathname);
  console.log('  - 是否在Twitter/X:', TwitterDOM.isOnTwitter());
  console.log('  - 是否在首页:', TwitterDOM.isOnHomePage());
  
  // 2. 查找发布框对话框
  console.log('\n📦 查找发布框对话框...');
  const dialog = TwitterDOM.findComposeDialog();
  if (dialog) {
    console.log('✅ 找到发布框对话框:', dialog);
    console.log('  - 元素标签:', dialog.tagName);
    console.log('  - 元素类名:', dialog.className);
    console.log('  - 元素ID:', dialog.id);
    console.log('  - 是否可见:', dialog.offsetParent !== null);
    
    // 3. 检查文本输入框
    console.log('\n✏️ 查找文本输入框...');
    const textarea = TwitterDOM.getComposeTextarea();
    if (textarea) {
      console.log('✅ 找到文本输入框:', textarea);
      console.log('  - 元素标签:', textarea.tagName);
      console.log('  - 元素类名:', textarea.className);
      console.log('  - 是否可见:', textarea.offsetParent !== null);
      console.log('  - 当前内容:', textarea.textContent || textarea.innerHTML);
      console.log('  - 是否获得焦点:', textarea === document.activeElement);
    } else {
      console.log('❌ 未找到文本输入框');
    }
    
    // 4. 检查工具栏
    console.log('\n🛠️ 查找工具栏...');
    const toolbar = TwitterDOM.getComposeToolbar();
    if (toolbar) {
      console.log('✅ 找到工具栏:', toolbar);
      console.log('  - 元素标签:', toolbar.tagName);
      console.log('  - 元素类名:', toolbar.className);
      console.log('  - 子元素数量:', toolbar.children.length);
      console.log('  - 是否可见:', toolbar.offsetParent !== null);
      
      // 5. 检查ScrollSnap-List
      const scrollSnapList = toolbar.querySelector('[data-testid="ScrollSnap-List"]');
      if (scrollSnapList) {
        console.log('✅ 找到ScrollSnap-List:', scrollSnapList);
        console.log('  - 子元素数量:', scrollSnapList.children.length);
        
        // 6. 查找表情符号按钮
        const emojiButton = scrollSnapList.querySelector('button[aria-label*="emoji"], button[aria-label*="表情"]');
        if (emojiButton) {
          console.log('✅ 找到表情符号按钮:', emojiButton);
        } else {
          console.log('❌ 未找到表情符号按钮');
          // 列出所有按钮
          const allButtons = scrollSnapList.querySelectorAll('button');
          console.log('  - 所有按钮:', Array.from(allButtons).map(btn => ({
            ariaLabel: btn.getAttribute('aria-label'),
            className: btn.className,
            innerHTML: btn.innerHTML.substring(0, 50)
          })));
        }
      } else {
        console.log('❌ 未找到ScrollSnap-List');
      }
      
      // 7. 检查是否已有AI按钮
      console.log('\n🤖 检查AI按钮...');
      const hasAIButton = TwitterDOM.hasComposeAIButton();
      console.log('  - 是否已有AI按钮:', hasAIButton);
      if (hasAIButton) {
        const aiButton = dialog.querySelector('.twitter-compose-ai-container');
        console.log('  - AI按钮元素:', aiButton);
      }
    } else {
      console.log('❌ 未找到工具栏');
      
      // 8. 尝试查找可能的工具栏元素
      console.log('\n🔍 尝试查找可能的工具栏元素...');
      const allDivs = dialog.querySelectorAll('div');
      const candidates = [];
      
      for (const div of allDivs) {
        const buttons = div.querySelectorAll('button, [role="button"]');
        if (buttons.length >= 2 && buttons.length <= 10) {
          // 检查按钮的大小
          const avgWidth = Array.from(buttons).reduce((sum, btn) => {
            const rect = (btn as HTMLElement).getBoundingClientRect();
            return sum + rect.width;
          }, 0) / buttons.length;
          
          if (avgWidth < 60) {
            candidates.push({
              element: div,
              buttonCount: buttons.length,
              avgWidth: Math.round(avgWidth),
              className: div.className
            });
          }
        }
      }
      
      if (candidates.length > 0) {
        console.log('✅ 找到可能的工具栏候选:');
        candidates.forEach((candidate, index) => {
          console.log(`  候选${index + 1}:`, candidate);
        });
      } else {
        console.log('❌ 未找到可能的工具栏候选');
      }
    }
    
    // 9. 检查激活状态
    console.log('\n⚡ 检查激活状态...');
    const isActive = TwitterDOM.isComposeDialogActive();
    console.log('  - 发布框是否激活:', isActive);
    
    // 10. 输出对话框的完整HTML结构（前1000个字符）
    console.log('\n📄 对话框HTML结构（前1000字符）:');
    console.log(dialog.outerHTML.substring(0, 1000) + '...');
    
  } else {
    console.log('❌ 未找到发布框对话框');
    
    // 尝试查找所有可能的文本框
    console.log('\n🔍 查找所有可能的文本框...');
    const allTextareas = document.querySelectorAll('[data-testid="tweetTextarea_0"], textarea, [contenteditable="true"]');
    console.log(`找到 ${allTextareas.length} 个可能的文本框:`);
    
    allTextareas.forEach((textarea, index) => {
      console.log(`  文本框${index + 1}:`, {
        element: textarea,
        tagName: textarea.tagName,
        className: textarea.className,
        isVisible: (textarea as HTMLElement).offsetParent !== null,
        parentDialog: textarea.closest('[role="dialog"]')
      });
    });
    
    // 尝试查找所有对话框
    console.log('\n🔍 查找所有对话框...');
    const allDialogs = document.querySelectorAll('[role="dialog"]');
    console.log(`找到 ${allDialogs.length} 个对话框:`);
    
    allDialogs.forEach((dialog, index) => {
      console.log(`  对话框${index + 1}:`, {
        element: dialog,
        className: dialog.className,
        isVisible: (dialog as HTMLElement).offsetParent !== null,
        hasTextarea: dialog.querySelector('[data-testid="tweetTextarea_0"]') !== null
      });
    });
  }
}

/**
 * 强制注入AI按钮（用于测试）
 */
export function forceInjectAIButton(): void {
  console.log('🔧 强制注入AI按钮...');
  
  const dialog = TwitterDOM.findComposeDialog();
  if (!dialog) {
    console.error('❌ 未找到发布框对话框，无法注入');
    return;
  }
  
  const composeBox = TwitterDOM.getComposeTextarea();
  if (!composeBox) {
    console.error('❌ 未找到文本输入框，无法注入');
    return;
  }
  
  console.log('✅ 找到发布框和输入框，准备注入...');
  
  // 移除已存在的AI按钮
  const existingButtons = document.querySelectorAll('.twitter-compose-ai-container');
  existingButtons.forEach(button => button.remove());
  
  // 创建简单的测试按钮
  const testButton = document.createElement('button');
  testButton.textContent = '🤖 AI扩写';
  testButton.style.cssText = `
    background-color: #1DA1F2;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    margin: 0 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
  `;
  
  testButton.addEventListener('click', () => {
    alert('AI扩写按钮点击成功！');
  });
  
  // 尝试多种位置注入
  let injected = false;
  
  // 方法1：注入到工具栏
  const toolbar = TwitterDOM.getComposeToolbar();
  if (toolbar) {
    const scrollSnapList = toolbar.querySelector('[data-testid="ScrollSnap-List"]');
    if (scrollSnapList) {
      scrollSnapList.appendChild(testButton);
      injected = true;
      console.log('✅ AI按钮已注入到ScrollSnap-List');
    } else {
      toolbar.appendChild(testButton);
      injected = true;
      console.log('✅ AI按钮已注入到工具栏');
    }
  }
  
  // 方法2：如果工具栏注入失败，注入到对话框底部
  if (!injected) {
    dialog.appendChild(testButton);
    injected = true;
    console.log('✅ AI按钮已注入到对话框底部');
  }
  
  if (injected) {
    console.log('🎉 AI按钮注入成功！');
  } else {
    console.error('❌ AI按钮注入失败');
  }
}

// 暴露到全局
(window as any).debugComposeBox = debugComposeBox;
(window as any).forceInjectAIButton = forceInjectAIButton;

/**
 * 使用说明:
 * 1. 打开Twitter首页
 * 2. 打开浏览器控制台(F12)
 * 3. 运行 debugComposeBox() 查看详细信息
 * 4. 如果需要，运行 forceInjectAIButton() 尝试强制注入
 */