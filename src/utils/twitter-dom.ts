/**
 * Twitter DOM 工具函数
 *
 * 提供与 Twitter DOM 交互的工具方法
 */

import { TWITTER_SELECTORS } from '../types';

/**
 * Twitter DOM 工具类
 */
export class TwitterDOM {
  /**
   * 获取页面上所有的推文元素
   */
  static getAllTweets(): HTMLElement[] {
    return Array.from(document.querySelectorAll(TWITTER_SELECTORS.TWEET));
  }

  /**
   * 从推文元素中提取文本内容
   */
  static async getTweetText(tweetElement: HTMLElement): Promise<string | null> {
    const textElement = tweetElement.querySelector(TWITTER_SELECTORS.TWEET_TEXT);
    if (!textElement) return null;

    // 检查是否是引用推文（通过检查是否在特定容器内来判断）
    // 引用推文通常位于带有特定类名的容器内
    const isQuotedTweet = tweetElement.closest('[data-testid="quotedTweet"], [aria-label*="引用"], [aria-label*="Quote"]') ||
                           // 检查是否有父元素包含"Quote"文本，这是引用推文的另一个标识
                           tweetElement.closest('[aria-labelledby*="4fae7aj9x5i"]');
    
    // 如果是引用推文，不点击"Show more"按钮，直接返回当前文本
    if (isQuotedTweet) {
      console.log('[TwitterDOM] 检测到引用推文，不自动展开 Show more');
      return textElement.textContent?.trim() || null;
    }

    // 对于原始推文，检查是否有"Show more"按钮
    // Show more 按钮可能在推文元素内部或相邻位置
    let showMoreButton = tweetElement.querySelector(TWITTER_SELECTORS.SHOW_MORE_BUTTON) as HTMLElement;
    
    // 如果在推文元素内没有找到，尝试在同级或父级元素中查找
    if (!showMoreButton && tweetElement.parentElement) {
      showMoreButton = tweetElement.parentElement.querySelector(TWITTER_SELECTORS.SHOW_MORE_BUTTON) as HTMLElement;
    }
    
    // 如果还没有找到，尝试在推文元素的下一个兄弟元素中查找
    if (!showMoreButton && tweetElement.nextElementSibling) {
      showMoreButton = tweetElement.nextElementSibling.querySelector(TWITTER_SELECTORS.SHOW_MORE_BUTTON) as HTMLElement;
    }

    // 额外检查：确保 Show more 按钮是可见的并且确实是一个有效的按钮
    if (showMoreButton && 
        showMoreButton.offsetParent !== null && // 检查元素是否可见
        showMoreButton.tagName === 'BUTTON' && // 确保是按钮元素
        showMoreButton.textContent?.toLowerCase().includes('show')) { // 确保按钮文本包含"show"
      console.log('[TwitterDOM] 发现原始推文有有效的 Show more 按钮，点击展开...');
      try {
        // 点击 Show more 按钮
        showMoreButton.click();

        // 等待内容展开
        await this.waitForContentExpanded(tweetElement, 2000);

        // 重新获取展开后的文本
        const expandedText = tweetElement.querySelector(TWITTER_SELECTORS.TWEET_TEXT)?.textContent?.trim();
        console.log('[TwitterDOM] 推文展开后文本:', expandedText?.substring(0, 100) + '...');
        return expandedText || null;
      } catch (error) {
        console.warn('[TwitterDOM] 点击推文 Show more 按钮失败:', error);
        // 如果点击失败，返回当前文本
        return textElement.textContent?.trim() || null;
      }
    } else if (showMoreButton) {
      console.log('[TwitterDOM] 找到 Show more 按钮，但它可能是无效的，跳过点击');
      console.log('[TwitterDOM] 按钮信息:', {
        tagName: showMoreButton.tagName,
        visible: showMoreButton.offsetParent !== null,
        textContent: showMoreButton.textContent
      });
    }

    return textElement.textContent?.trim() || null;
  }

  /**
   * 获取推文的回复按钮
   */
  static getReplyButton(tweetElement: HTMLElement): HTMLElement | null {
    return tweetElement.querySelector(TWITTER_SELECTORS.REPLY_BUTTON);
  }

  /**
   * 点击推文的回复按钮
   */
  static clickReplyButton(tweetElement: HTMLElement): boolean {
    const replyButton = this.getReplyButton(tweetElement);
    if (!replyButton) return false;

    replyButton.click();
    return true;
  }

  /**
   * 等待回复框出现
   */
  static async waitForReplyBox(timeout = 3000): Promise<HTMLElement | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const replyBox = document.querySelector(TWITTER_SELECTORS.REPLY_TEXTAREA) as HTMLElement;
      if (replyBox) {
        return replyBox;
      }

      // 等待 100ms 再检查
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * 填充回复文本到输入框
   * Twitter 使用 Draft.js 编辑器（contenteditable div），不是传统的 textarea
   */
  static fillReplyText(element: HTMLElement, text: string): void {
    try {
      console.log('[TwitterDOM] 开始填充文本，元素类型:', element.tagName);
      console.log('[TwitterDOM] contenteditable:', element.getAttribute('contenteditable'));
      console.log('[TwitterDOM] 元素是否在文档中:', element.isConnected);

      // 检查元素是否仍然存在于文档中
      if (!element.isConnected) {
        throw new Error('元素已脱离文档，无法进行操作');
      }

      // 聚焦元素
      element.focus();
      console.log('[TwitterDOM] 元素已聚焦');

      // 等待焦点生效后再操作
      setTimeout(() => {
        try {
          // 再次检查元素是否仍然存在于文档中
          if (!element.isConnected) {
            console.warn('[TwitterDOM] 元素已脱离文档，停止填充操作');
            return;
          }

          console.log('[TwitterDOM] setTimeout 开始实际填充操作，元素仍在文档中');

          // 新策略：模拟真实的键盘输入
          // 先清空现有内容（如果有）
          const currentText = element.textContent || '';
          if (currentText.length > 0) {
            // 如果有内容，先全选
            try {
              const selection = window.getSelection();
              if (selection && element.isConnected) {
                const range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                console.log('[TwitterDOM] 已选中现有内容');
              }
            } catch (rangeError) {
              console.warn('[TwitterDOM] 选中内容时出错，跳过此步骤:', rangeError);
              // 如果创建range失败，继续执行但不选中内容
            }
          }

          // 使用 DataTransfer 模拟粘贴操作
          const dataTransfer = new DataTransfer();
          dataTransfer.setData('text/plain', text);

          // 触发 paste 事件
          const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: dataTransfer
          });

          const handled = element.dispatchEvent(pasteEvent);
          console.log('[TwitterDOM] paste 事件已触发，handled:', handled);

          // 如果 paste 事件没有被处理，使用备用方案
          if (!pasteEvent.defaultPrevented) {
            console.log('[TwitterDOM] paste 事件未被处理，使用直接设置方案');

            // 清空并设置新内容
            element.innerHTML = '';
            const textNode = document.createTextNode(text);
            element.appendChild(textNode);

            // 移动光标到末尾
            try {
              const range = document.createRange();
              const sel = window.getSelection();
              if (sel && element.isConnected && textNode.isConnected) {
                range.setStart(textNode, text.length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            } catch (rangeError) {
              console.warn('[TwitterDOM] 设置光标位置时出错，跳过此步骤:', rangeError);
              // 如果设置光标失败，继续执行
            }

            // 触发 beforeinput 和 input 事件
            element.dispatchEvent(new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              data: text,
              inputType: 'insertText'
            }));

            element.dispatchEvent(new InputEvent('input', {
              bubbles: true,
              cancelable: true,
              data: text,
              inputType: 'insertText'
            }));
          }

          console.log('[TwitterDOM] ✅ 文本填充成功:', text.substring(0, 50) + '...');

        } catch (innerError) {
          console.error('[TwitterDOM] 填充过程出错:', innerError);
          element.textContent = text;
        }
      }, 100);

    } catch (error) {
      console.error('[TwitterDOM] fillReplyText 失败:', error);
      throw error;
    }
  }

  /**
   * 检查推文是否已经注入了 AI 按钮
   */
  static hasAIButton(tweetElement: HTMLElement): boolean {
    return tweetElement.querySelector('.twitter-ai-reply-button') !== null;
  }

  /**
   * 获取推文的唯一标识符
   * 用于防止重复注入
   */
  static getTweetId(tweetElement: HTMLElement): string | null {
    // 尝试从多个属性获取唯一 ID
    const id =
      tweetElement.getAttribute('data-tweet-id') ||
      tweetElement.getAttribute('id') ||
      null;

    return id;
  }

  /**
   * 标记推文已处理
   */
  static markAsProcessed(tweetElement: HTMLElement): void {
    tweetElement.setAttribute('data-ai-reply-processed', 'true');
  }

  /**
   * 检查推文是否已处理
   */
  static isProcessed(tweetElement: HTMLElement): boolean {
    return tweetElement.hasAttribute('data-ai-reply-processed');
  }

  /**
   * 获取回复按钮的容器（用于插入 AI 按钮）
   */
  static getReplyButtonContainer(tweetElement: HTMLElement): HTMLElement | null {
    const replyButton = this.getReplyButton(tweetElement);
    if (!replyButton) return null;

    // Twitter 的回复按钮通常在一个 group 容器中
    // 我们需要找到这个容器的父元素
    let container = replyButton.closest('[role="group"]');

    if (!container) {
      // 如果找不到 role="group"，尝试找父元素
      container = replyButton.parentElement;
    }

    return container as HTMLElement;
  }

  /**
   * 检查当前是否在 Twitter/X.com 上
   */
  static isOnTwitter(): boolean {
    const hostname = window.location.hostname;
    return hostname.includes('twitter.com') || hostname.includes('x.com');
  }

  /**
   * 等待元素出现
   */
  static async waitForElement(
    selector: string,
    timeout = 5000
  ): Promise<HTMLElement | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        return element;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * 防抖函数
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return (...args: Parameters<T>) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        func(...args);
      }, wait);
    };
  }

  /**
   * 节流函数
   */
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * 查找 Twitter 回复弹窗
   */
  static findReplyDialog(): HTMLElement | null {
    // Twitter 回复弹窗的选择器
    const dialogSelectors = [
      '[role="dialog"]',
      '[data-testid="tweetTextarea_0"]',
    ];

    for (const selector of dialogSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        // 如果是 textarea，返回它的对话框容器
        if (selector === '[data-testid="tweetTextarea_0"]') {
          return element.closest('[role="dialog"]') as HTMLElement;
        }
        // 验证这是回复弹窗（包含 textarea）
        const textarea = element.querySelector('[data-testid="tweetTextarea_0"]');
        if (textarea) {
          return element as HTMLElement;
        }
      }
    }

    return null;
  }

  /**
   * 从回复弹窗中获取原推文文本
   * 策略：
   * 1. 在弹窗中查找引用的推文内容，处理截断情况
   * 2. 从 URL 中提取推文 ID，然后在页面中查找对应推文
   */
  static async getTweetTextFromReplyDialog(dialog: HTMLElement): Promise<string | null> {
    // 首先检查弹窗中是否有引用推文的标识
    // 在整个弹窗中查找引用推文的容器，而不仅仅是在 tweetText 元素的父级中
    const hasQuotedTweet = dialog.querySelector('[data-testid="quotedTweet"]') ||
                           dialog.querySelector('[aria-labelledby*="4fae7aj9x5i"]') ||
                           dialog.querySelector('[aria-label*="引用"]') ||
                           dialog.querySelector('[aria-label*="Quote"]');
    
    if (hasQuotedTweet) {
      console.log('[TwitterDOM] 弹窗中检测到引用推文，跳过所有 Show more 按钮的点击');
      // 只获取文本内容，不展开任何 Show more
      const quotedTweet = dialog.querySelector(TWITTER_SELECTORS.TWEET_TEXT);
      return quotedTweet?.textContent?.trim() || null;
    }
    
    // 策略 1: 在弹窗内部查找引用的推文
    const quotedTweet = dialog.querySelector(TWITTER_SELECTORS.TWEET_TEXT);
    if (quotedTweet) {
      // 如果不是引用推文，则检查是否需要展开
      // Show more 按钮不是 quotedTweet 的子元素，而是独立按钮
      const showMoreButton = dialog.querySelector(TWITTER_SELECTORS.SHOW_MORE_BUTTON) as HTMLElement;
      
      // 额外检查：确保 Show more 按钮是有效的
      if (showMoreButton && 
          showMoreButton.offsetParent !== null && // 检查元素是否可见
          showMoreButton.tagName === 'BUTTON' && // 确保是按钮元素
          showMoreButton.textContent?.toLowerCase().includes('show')) { // 确保按钮文本包含"show"
        console.log('[TwitterDOM] 发现原始推文有有效的 Show more 按钮，点击展开...');
        try {
          showMoreButton.click();
          
          // 等待内容展开
          await this.waitForContentExpanded(dialog, 2000);
          
          // 重新获取展开后的文本
          const expandedText = quotedTweet.textContent?.trim();
          console.log('[TwitterDOM] 推文展开后文本:', expandedText?.substring(0, 100) + '...');
          return expandedText || null;
        } catch (error) {
          console.warn('[TwitterDOM] 点击 Show more 按钮失败:', error);
          return quotedTweet.textContent?.trim() || null;
        }
      } else if (showMoreButton) {
        console.log('[TwitterDOM] 找到 Show more 按钮，但它可能是无效的，跳过点击');
      }
      
      return quotedTweet.textContent?.trim() || null;
    }

    // 策略 2: 从 URL 获取推文 ID，然后在页面中查找
    const urlMatch = window.location.pathname.match(/\/status\/(\d+)/);
    if (urlMatch) {
      const tweetId = urlMatch[1];
      // 在页面中查找包含此 ID 的推文
      const tweets = this.getAllTweets();
      for (const tweet of tweets) {
        const link = tweet.querySelector(`a[href*="/status/${tweetId}"]`);
        if (link) {
          return await this.getTweetText(tweet);
        }
      }
    }

    // 策略 3: 查找弹窗上方最近的推文
    const allTweets = this.getAllTweets();
    if (allTweets.length > 0) {
      // 返回第一条推文（通常是正在回复的推文）
      return await this.getTweetText(allTweets[0]);
    }

    return null;
  }

  /**
   * 从回复弹窗中获取工具栏元素
   */
  static getToolbarFromReplyDialog(dialog: HTMLElement): HTMLElement | null {
    // 更新的工具栏选择器策略
    // 1. 先尝试找到回复按钮组
    const replyButtonSelector = '[data-testid="tweetButtonInline"]';
    const replyButton = dialog.querySelector(replyButtonSelector);

    if (replyButton) {
      // 获取回复按钮的父容器，通常这里是操作栏
      const buttonContainer = replyButton.parentElement?.parentElement;
      if (buttonContainer) {
        // 查找包含多个图标按钮的同级容器（工具栏）
        const siblings = Array.from(buttonContainer.parentElement?.children || []);
        for (const sibling of siblings) {
          const iconButtons = sibling.querySelectorAll('[role="button"]');
          if (iconButtons.length >= 2) {
            console.log('[TwitterDOM] 找到工具栏容器（策略1）');
            return sibling as HTMLElement;
          }
        }
      }
    }

    // 2. 使用 data-testid 选择器
    const toolbarSelectors = [
      '[data-testid="toolBar"]',
      '[data-testid="tweetToolbar"]',
      '[data-testid="replyToolbar"]',
    ];

    for (const selector of toolbarSelectors) {
      const toolbar = dialog.querySelector(selector) as HTMLElement;
      if (toolbar) {
        console.log(`[TwitterDOM] 找到工具栏容器（策略2: ${selector}）`);
        return toolbar;
      }
    }

    // 3. 查找包含 emoji 或 gif 按钮的容器
    const emojiButton = dialog.querySelector('[data-testid="emoji"]');
    const gifButton = dialog.querySelector('[data-testid="gif"]');

    if (emojiButton || gifButton) {
      const button = emojiButton || gifButton;
      // 获取按钮的父容器
      let parent = button?.parentElement;
      while (parent && parent !== dialog) {
        const buttons = parent.querySelectorAll('[role="button"], button');
        if (buttons.length >= 2 && buttons.length <= 10) {
          console.log('[TwitterDOM] 找到工具栏容器（策略3: emoji/gif父容器）');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // 4. 查找包含文件输入的容器
    const fileInput = dialog.querySelector('[data-testid="fileInput"]');
    if (fileInput) {
      let parent = fileInput.parentElement;
      while (parent && parent !== dialog) {
        const buttons = parent.querySelectorAll('[role="button"], button');
        if (buttons.length >= 2 && buttons.length <= 10) {
          console.log('[TwitterDOM] 找到工具栏容器（策略4: 文件输入父容器）');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // 5. 最后的备用策略：查找包含多个小按钮的 div
    const allDivs = dialog.querySelectorAll('div');
    for (const div of allDivs) {
      const buttons = div.querySelectorAll('[role="button"], button');
      const directButtons = Array.from(buttons).filter(btn => btn.parentElement === div);
      // 查找直接子元素中有 3-6 个按钮的容器
      if (directButtons.length >= 3 && directButtons.length <= 6) {
        // 验证这些按钮都比较小（工具栏按钮通常较小）
        const avgWidth = directButtons.reduce((sum, btn) => {
          const rect = (btn as HTMLElement).getBoundingClientRect();
          return sum + rect.width;
        }, 0) / directButtons.length;

        if (avgWidth < 60) { // 工具栏按钮通常宽度小于60px
          console.log('[TwitterDOM] 找到工具栏容器（策略5: 小按钮容器）');
          return div as HTMLElement;
        }
      }
    }

    console.warn('[TwitterDOM] 未能找到工具栏容器');
    return null;
  }

  /**
   * 等待内容展开完成
   */
  static async waitForContentExpanded(container: HTMLElement, timeout = 2000): Promise<void> {
    const startTime = Date.now();
    const initialText = container.querySelector(TWITTER_SELECTORS.TWEET_TEXT)?.textContent?.length || 0;

    while (Date.now() - startTime < timeout) {
      // 检查 Show more 按钮是否消失了
      const showMoreButton = container.querySelector(TWITTER_SELECTORS.SHOW_MORE_BUTTON);
      if (!showMoreButton) {
        // 检查文本长度是否发生了变化
        const currentText = container.querySelector(TWITTER_SELECTORS.TWEET_TEXT)?.textContent?.length || 0;
        if (currentText > initialText) {
          console.log('[TwitterDOM] 内容已展开完成');
          return;
        }
      }

      // 等待 100ms 再检查
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('[TwitterDOM] 等待内容展开超时');
  }

  /**
   * 获取回复框中的当前文本内容
   */
  static getCurrentReplyText(replyBox: HTMLElement): string {
    // 检查元素是否仍然存在于文档中
    if (!replyBox.isConnected) {
      return '';
    }

    // 对于Twitter的Draft.js编辑器（contenteditable div），直接返回textContent
    const text = replyBox.textContent || '';
    return text.trim();
  }

  /**
   * 清空并替换回复框内容
   * 基于fillReplyText方法，但先清空现有内容
   * 保持与普通填充行为一致，确保内容可编辑
   */
  static replaceReplyText(element: HTMLElement, text: string): void {
    try {
      console.log('[TwitterDOM] 开始替换文本，元素类型:', element.tagName);
      console.log('[TwitterDOM] contenteditable:', element.getAttribute('contenteditable'));
      console.log('[TwitterDOM] 元素是否在文档中:', element.isConnected);

      // 检查元素是否仍然存在于文档中
      if (!element.isConnected) {
        throw new Error('元素已脱离文档，无法进行操作');
      }

      // 聚焦元素
      element.focus();
      console.log('[TwitterDOM] 元素已聚焦');

      // 等待焦点生效后再操作
      setTimeout(() => {
        try {
          // 再次检查元素是否仍然存在于文档中
          if (!element.isConnected) {
            console.warn('[TwitterDOM] 元素已脱离文档，停止替换操作');
            return;
          }

          console.log('[TwitterDOM] setTimeout 开始实际替换操作，元素仍在文档中');

          // 1. 先全选所有内容
          const currentText = element.textContent || '';
          if (currentText.length > 0) {
            try {
              const selection = window.getSelection();
              if (selection && element.isConnected) {
                const range = document.createRange();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                console.log('[TwitterDOM] 已选中现有内容');
              }
            } catch (rangeError) {
              console.warn('[TwitterDOM] 选中内容时出错，跳过此步骤:', rangeError);
            }
          }

          // 2. 模拟键盘删除操作，而不是直接清空innerHTML
          // 这样可以保持Twitter编辑器的内部状态
          const deleteEvent = new KeyboardEvent('keydown', {
            key: 'Backspace',
            code: 'Backspace',
            keyCode: 8,
            bubbles: true,
            cancelable: true,
            ctrlKey: true, // 使用Ctrl+Backspace或Cmd+Backspace来删除全部内容
            metaKey: navigator.userAgent.includes('Mac') // Mac上使用Cmd键
          });

          element.dispatchEvent(deleteEvent);

          // 等待删除操作完成
          setTimeout(() => {
            try {
              // 3. 使用与fillReplyText相同的方式填充新内容
              // 使用 DataTransfer 模拟粘贴操作
              const dataTransfer = new DataTransfer();
              dataTransfer.setData('text/plain', text);

              // 触发 paste 事件
              const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer
              });

              const handled = element.dispatchEvent(pasteEvent);
              console.log('[TwitterDOM] paste 事件已触发，handled:', handled);

              // 如果 paste 事件没有被处理，使用备用方案
              if (!pasteEvent.defaultPrevented) {
                console.log('[TwitterDOM] paste 事件未被处理，使用直接设置方案');

                // 谨慎地清空内容
                while (element.firstChild) {
                  element.removeChild(element.firstChild);
                }

                // 添加新内容
                const textNode = document.createTextNode(text);
                element.appendChild(textNode);

                // 移动光标到末尾
                try {
                  const range = document.createRange();
                  const sel = window.getSelection();
                  if (sel && element.isConnected && textNode.isConnected) {
                    range.setStart(textNode, text.length);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                  }
                } catch (rangeError) {
                  console.warn('[TwitterDOM] 设置光标位置时出错，跳过此步骤:', rangeError);
                }

                // 触发 beforeinput 和 input 事件
                element.dispatchEvent(new InputEvent('beforeinput', {
                  bubbles: true,
                  cancelable: true,
                  data: text,
                  inputType: 'insertText'
                }));

                element.dispatchEvent(new InputEvent('input', {
                  bubbles: true,
                  cancelable: true,
                  data: text,
                  inputType: 'insertText'
                }));
              }

              console.log('[TwitterDOM] ✅ 文本替换成功:', text.substring(0, 50) + '...');
            } catch (innerError) {
              console.error('[TwitterDOM] 替换过程出错:', innerError);
              // 回退到简单的文本填充
              try {
                // 谨慎地清空内容
                while (element.firstChild) {
                  element.removeChild(element.firstChild);
                }
                element.appendChild(document.createTextNode(text));
              } catch (fallbackError) {
                console.error('[TwitterDOM] 回退方案也失败:', fallbackError);
              }
            }
          }, 50);
        } catch (innerError) {
          console.error('[TwitterDOM] 替换过程出错:', innerError);
          // 回退到简单的文本填充
          try {
            element.textContent = text;
          } catch (fallbackError) {
            console.error('[TwitterDOM] 回退方案也失败:', fallbackError);
          }
        }
      }, 100);
    } catch (error) {
      console.error('[TwitterDOM] replaceReplyText 失败:', error);
      throw error;
    }
  }

  /**
   * 检查回复框是否已经注入了 AI 按钮
   */
  static hasToolbarAIButton(dialog: HTMLElement): boolean {
    return dialog.querySelector('.twitter-ai-toolbar-container') !== null;
  }

  /**
   * 查找首页发布框对话框（带缓存优化）
   */
  static findComposeDialog(): HTMLElement | null {
    // 先快速检查是否已有缓存的激活对话框
    const existingDialog = document.querySelector('[data-ai-compose-dialog="active"]') as HTMLElement;
    if (existingDialog && this.isComposeDialogActive()) {
      return existingDialog;
    }

    // 首页发布框的特征：包含发布文本框但没有引用推文
    const textareas = document.querySelectorAll('[data-testid="tweetTextarea_0"]');

    for (const textarea of textareas) {
      // 查找最近的对话框或容器
      const dialog = textarea.closest('[role="dialog"]') as HTMLElement;

      if (dialog) {
        // 通过检查对话框是否没有引用推文来区分首页发布框和回复框
        const hasQuotedTweet = dialog.querySelector('[data-testid="quotedTweet"]');

        if (!hasQuotedTweet) {
          // 额外检查：确保这是发布框而不是回复框
          // 发布框通常包含"Post"按钮而不是"Reply"按钮
          const postButton = dialog.querySelector('[data-testid="tweetButtonInline"]');

          if (postButton) {
            // 缓存这个对话框，避免重复查找
            dialog.setAttribute('data-ai-compose-dialog', 'active');
            return dialog;
          }
        }
      }
    }

    // 新方案：查找首页的输入框，不一定在对话框中
    // 新版Twitter首页可能使用直接激活的输入框，而不是对话框

    for (const textarea of textareas) {
      // 检查是否在首页（非对话框）
      if (!textarea.closest('[role="dialog"]')) {
        // 检查是否在主页内容区域
        const homeContainer = textarea.closest('main');
        if (homeContainer) {
          // 返回输入框的父容器作为"对话框"的替代
          const parentContainer = textarea.closest('div[role="group"], div[style*="border"]');
          if (parentContainer) {
            parentContainer.setAttribute('data-ai-compose-dialog', 'active');
            return parentContainer as HTMLElement;
          } else {
            // 如果找不到合适的容器，返回输入框本身
            // 我们需要确保返回的是可以添加按钮的容器
            const nextElement = textarea.nextElementSibling;
            if (nextElement && nextElement.querySelector('[data-testid="toolBar"]')) {
              nextElement.setAttribute('data-ai-compose-dialog', 'active');
              return nextElement as HTMLElement;
            }
            // 最后的备用方案：返回输入框的父元素
            const parent = textarea.parentElement as HTMLElement;
            if (parent) {
              parent.setAttribute('data-ai-compose-dialog', 'active');
              return parent;
            }
          }
        }
      }
    }

    // 备用方案：查找任何包含发布文本框和发布按钮的容器
    for (const textarea of textareas) {
      const parent = textarea.closest('div[role="dialog"]') as HTMLElement;
      if (parent) {
        const postButton = parent.querySelector('[data-testid="tweetButtonInline"]');
        if (postButton) {
          parent.setAttribute('data-ai-compose-dialog', 'active');
          return parent;
        }
      }
    }

    return null;
  }

  /**
   * 检查发布框是否处于激活状态（输入框获得焦点或有内容）
   * 带缓存机制，避免重复检查
   */
  private static composeDialogActiveCache: boolean | null = null;
  private static lastCheckTime = 0;
  private static readonly CHECK_CACHE_DURATION = 1000; // 缓存1秒

  static isComposeDialogActive(): boolean {
    const now = Date.now();

    // 如果在缓存有效期内，直接返回缓存结果
    if (this.composeDialogActiveCache !== null &&
        now - this.lastCheckTime < this.CHECK_CACHE_DURATION) {
      return this.composeDialogActiveCache;
    }

    const dialog = this.findComposeDialog();
    if (!dialog) {
      this.composeDialogActiveCache = false;
      this.lastCheckTime = now;
      return false;
    }

    // 检查是否有内容
    const editor = this.getComposeTextarea();
    let isActive = false;

    if (editor && editor.textContent && editor.textContent.trim().length > 0) {
      isActive = true;
    }
    // 检查是否获得焦点
    else if (editor && editor === document.activeElement) {
      isActive = true;
    }
    // 检查发布按钮是否可用（有内容时变为可用）
    else if (editor && editor.offsetParent !== null) {
      isActive = true;
    }

    // 缓存结果
    this.composeDialogActiveCache = isActive;
    this.lastCheckTime = now;

    return isActive;
  }

  /**
   * 获取首页发布框的文本输入区域
   */
  static getComposeTextarea(): HTMLElement | null {
    const dialog = this.findComposeDialog();
    if (!dialog) {
      return null;
    }
    
    // 首先尝试找到实际的编辑区域
    const editor = dialog.querySelector('.public-DraftEditor-content') as HTMLElement;
    if (editor) {
      return editor;
    }
    
    // 备用方案：返回tweetTextarea_0元素
    return dialog.querySelector('[data-testid="tweetTextarea_0"]') as HTMLElement;
  }

  /**
   * 检查是否在Twitter首页
   */
  static isOnHomePage(): boolean {
    const pathname = window.location.pathname;
    // 首页路径通常是 "/" 或 "/home"
    return pathname === '/' || pathname === '/home';
  }

  /**
   * 获取首页发布框的工具栏
   */
  static getComposeToolbar(): HTMLElement | null {
    const dialog = this.findComposeDialog();
    if (!dialog) {
      return null;
    }

    // 尝试查找工具栏 - 使用实际HTML中的选择器
    const toolbar = dialog.querySelector('[data-testid="toolBar"]') as HTMLElement;
    if (toolbar) {
      return toolbar;
    }

    // 备用方案：查找包含ScrollSnap-List的导航容器
    const scrollSnapList = dialog.querySelector('[data-testid="ScrollSnap-List"]') as HTMLElement;
    if (scrollSnapList) {
      return scrollSnapList.parentElement as HTMLElement;
    }

    // 备用方案2：查找包含媒体按钮、表情符号按钮等的容器
    const mediaButton = dialog.querySelector('input[data-testid="fileInput"]') as HTMLElement;
    if (mediaButton) {
      let parent = mediaButton.parentElement;
      while (parent && parent !== dialog) {
        // 查找包含多个按钮的容器
        const buttons = parent.querySelectorAll('[role="button"]');
        if (buttons.length >= 2) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    // 新方案：对于直接激活的输入框，可能在相邻元素中有工具栏
    const textarea = this.getComposeTextarea();
    if (textarea) {
      // 查找输入框的下一个兄弟元素
      let nextElement = textarea.nextElementSibling as HTMLElement;
      while (nextElement) {
        const childToolbar = nextElement.querySelector('[data-testid="toolBar"]') as HTMLElement;
        if (childToolbar) {
          return childToolbar;
        }
        
        // 检查当前元素是否是工具栏（包含多个按钮）
        const buttons = nextElement.querySelectorAll('[role="button"]');
        if (buttons.length >= 2 && buttons.length <= 10) {
          return nextElement;
        }
        
        nextElement = nextElement.nextElementSibling as HTMLElement;
      }
      
      // 向上查找父元素中的工具栏
      let parent = textarea.parentElement;
      while (parent) {
        const parentToolbar = parent.querySelector('[data-testid="toolBar"]') as HTMLElement;
        if (parentToolbar) {
          return parentToolbar;
        }
        
        // 检查当前父元素是否是工具栏
        const parentButtons = parent.querySelectorAll('[role="button"]');
        if (parentButtons.length >= 2 && parentButtons.length <= 10) {
          return parent as HTMLElement;
        }
        
        parent = parent.parentElement;
      }
    }

    return null;
  }

  /**
   * 检查首页发布框是否已经注入了AI按钮
   */
  static hasComposeAIButton(): boolean {
    const dialog = this.findComposeDialog();
    if (!dialog) {
      return false;
    }
    
    return dialog.querySelector('.twitter-compose-ai-container') !== null;
  }

  /**
   * 获取当前在首页发布框中输入的文本内容
   */
  static getComposeText(): string {
    const editor = this.getComposeTextarea();
    if (!editor) {
      return '';
    }

    // 对于Draft.js编辑器，textContent可能包含额外的元素
    // 尝试从编辑器中获取纯文本
    const draftContent = editor.querySelector('[data-contents="true"]');
    if (draftContent) {
      return draftContent.textContent?.trim() || '';
    }

    return editor.textContent?.trim() || '';
  }
}
