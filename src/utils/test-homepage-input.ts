/**
 * 首页输入框测试工具
 * 
 * 用于测试Twitter首页直接激活的输入框检测
 * 可以在浏览器控制台运行
 */

import { TwitterDOM } from './twitter-dom';

/**
 * 测试首页输入框检测
 */
export function testHomepageInput(): void {
  console.log('🔍 开始测试首页输入框检测...');
  
  // 1. 检查当前页面
  console.log('📍 当前页面信息:');
  console.log('  - URL:', window.location.href);
  console.log('  - 路径:', window.location.pathname);
  console.log('  - 是否在Twitter/X:', TwitterDOM.isOnTwitter());
  console.log('  - 是否在首页:', TwitterDOM.isOnHomePage());
  
  // 2. 查找所有可能的文本框
  console.log('\n📝 查找所有文本输入框...');
  const allTextareas = document.querySelectorAll('[data-testid="tweetTextarea_0"]');
  console.log(`找到 ${allTextareas.length} 个文本输入框:`);
  
  allTextareas.forEach((textarea, index) => {
    console.log(`\n文本框 ${index + 1}:`, {
      element: textarea,
      tagName: textarea.tagName,
      className: textarea.className,
      isVisible: (textarea as HTMLElement).offsetParent !== null,
      hasContent: !!((textarea as HTMLElement).textContent?.trim()),
      isFocused: textarea === document.activeElement,
      isInDialog: !!textarea.closest('[role="dialog"]'),
      parentElement: textarea.parentElement?.tagName,
      nextElementSibling: textarea.nextElementSibling?.tagName,
    });
    
    // 检查相邻元素中是否有工具栏
    const nextElement = textarea.nextElementSibling as HTMLElement;
    if (nextElement) {
      const toolbar = nextElement.querySelector('[data-testid="toolBar"]');
      if (toolbar) {
        console.log(`  ✅ 找到相邻工具栏:`, toolbar);
      } else {
        console.log(`  ❌ 相邻元素中没有工具栏`);
      }
    }
  });
  
  // 3. 使用TwitterDOM方法查找发布框
  console.log('\n🔧 使用TwitterDOM方法查找发布框...');
  const dialog = TwitterDOM.findComposeDialog();
  if (dialog) {
    console.log('✅ 找到发布框容器:', dialog);
    console.log('  - 元素标签:', dialog.tagName);
    console.log('  - 元素类名:', dialog.className);
    console.log('  - 是否可见:', dialog.offsetParent !== null);
    
    // 检查是否有工具栏
    const toolbar = TwitterDOM.getComposeToolbar();
    if (toolbar) {
      console.log('✅ 找到工具栏:', toolbar);
    } else {
      console.log('❌ 未找到工具栏');
    }
    
    // 检查输入框
    const composeTextarea = TwitterDOM.getComposeTextarea();
    if (composeTextarea) {
      console.log('✅ 找到输入框:', composeTextarea);
      console.log('  - 是否激活:', TwitterDOM.isComposeDialogActive());
    } else {
      console.log('❌ 未找到输入框');
    }
  } else {
    console.log('❌ 未找到发布框容器');
  }
  
  // 4. 检查整个页面结构
  console.log('\n🌐 检查页面结构...');
  const mainElement = document.querySelector('main');
  if (mainElement) {
    console.log('✅ 找到主内容区域:', mainElement);
    
    // 查找主内容区域中的输入框
    const mainTextareas = mainElement.querySelectorAll('[data-testid="tweetTextarea_0"]');
    console.log(`主内容区域中有 ${mainTextareas.length} 个输入框`);
    
    if (mainTextareas.length > 0) {
      // 查看输入框的周围结构
      const firstTextarea = mainTextareas[0] as HTMLElement;
      let parent = firstTextarea.parentElement;
      let level = 0;
      
      console.log('\n🏗️ 输入框的DOM层级结构:');
      while (parent && level < 5) {
        console.log(`  层级 ${level}:`, {
          tagName: parent.tagName,
          className: parent.className,
          childCount: parent.children.length,
          hasToolbar: !!parent.querySelector('[data-testid="toolBar"]'),
          hasScrollSnapList: !!parent.querySelector('[data-testid="ScrollSnap-List"]'),
          hasMediaButton: !!parent.querySelector('input[data-testid="fileInput"]'),
        });
        
        parent = parent.parentElement;
        level++;
      }
    }
  } else {
    console.log('❌ 未找到主内容区域');
  }
}

/**
 * 尝试手动注入AI按钮到首页输入框
 */
export function manuallyInjectToHomepage(): void {
  console.log('🔧 尝试手动注入AI按钮到首页输入框...');
  
  const composeBox = TwitterDOM.getComposeTextarea();
  if (!composeBox) {
    console.error('❌ 未找到输入框，无法注入');
    return;
  }
  
  // 创建简单的测试按钮
  const testButton = document.createElement('button');
  testButton.textContent = '🤖 AI扩写';
  testButton.style.cssText = `
    background-color: #1DA1F2;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    margin: 8px 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
  `;
  
  testButton.addEventListener('click', () => {
    alert('AI扩写按钮点击成功！输入框内容：' + (composeBox.textContent || '(空)'));
  });
  
  // 尝试多种位置注入
  let injected = false;
  
  // 方法1：注入到输入框后面
  if (composeBox.nextElementSibling) {
    composeBox.nextElementSibling.appendChild(testButton);
    injected = true;
    console.log('✅ AI按钮已注入到输入框后面');
  }
  
  // 方法2：注入到输入框父容器的末尾
  if (!injected && composeBox.parentElement) {
    composeBox.parentElement.appendChild(testButton);
    injected = true;
    console.log('✅ AI按钮已注入到输入框父容器');
  }
  
  // 方法3：注入到输入框前面
  if (!injected) {
    composeBox.parentElement?.insertBefore(testButton, composeBox);
    injected = true;
    console.log('✅ AI按钮已注入到输入框前面');
  }
  
  if (injected) {
    console.log('🎉 AI按钮注入成功！');
    
    // 5秒后自动移除
    setTimeout(() => {
      testButton.remove();
      console.log('🗑️ 测试按钮已自动移除');
    }, 5000);
  } else {
    console.error('❌ AI按钮注入失败');
  }
}

// 暴露到全局
(window as any).testHomepageInput = testHomepageInput;
(window as any).manuallyInjectToHomepage = manuallyInjectToHomepage;

/**
 * 使用说明:
 * 1. 打开Twitter首页
 * 2. 打开浏览器控制台(F12)
 * 3. 点击首页的输入框激活它
 * 4. 运行 testHomepageInput() 查看详细信息
 * 5. 如果需要，运行 manuallyInjectToHomepage() 尝试手动注入
 */