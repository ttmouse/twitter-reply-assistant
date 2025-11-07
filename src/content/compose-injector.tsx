/**
 * 首页发布框注入器
 *
 * 监听 Twitter 首页发布框的出现和激活状态变化，自动在工具栏中注入 AI 扩写按钮
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ComposeToolbarButton } from '../components/ComposeToolbarButton';
import { TwitterDOM } from '../utils/twitter-dom';
import { DOM_DEBOUNCE_DELAY } from '../types';

/**
 * 首页发布框注入器类
 */
export class ComposeInjector {
  private observer: MutationObserver | null = null;
  private processedDialogs = new Set<HTMLElement>();
  private debouncedInject: () => void;
  private homepageCheckInterval: NodeJS.Timeout | null = null;
  private activationCheckInterval: NodeJS.Timeout | null = null;
  private isDialogActive = false;
  private lastInjectTime = 0;
  private injectCooldown = 2000; // 2秒冷却时间

  constructor() {
    // 创建防抖的注入函数
    this.debouncedInject = TwitterDOM.debounce(
      () => this.injectComposeButton(),
      DOM_DEBOUNCE_DELAY
    );
  }

  /**
   * 开始监听和注入
   */
  start(): void {
    console.log('[Compose Injector] 启动发布框监听器...');

    // 检查是否在 Twitter 上
    if (!TwitterDOM.isOnTwitter()) {
      console.log('[Compose Injector] 不在 Twitter 页面，停止');
      return;
    }

    // 立即检查当前是否有发布框
    this.injectComposeButton();

    // 开始监听 DOM 变化
    this.startObserving();

    // 定期检查是否在首页（处理单页应用路由变化）
    // 降低检查频率，减少不必要的执行
    this.homepageCheckInterval = setInterval(() => {
      if (TwitterDOM.isOnHomePage()) {
        // 在首页时，检查是否有新的发布框
        this.injectComposeButton();
      }
    }, 5000); // 从2秒增加到5秒

    // 定期检查发布框的激活状态
    // 大幅降低检查频率，避免无限循环
    this.activationCheckInterval = setInterval(() => {
      this.checkActivationState();
    }, 3000); // 从1000ms增加到3000ms，减少CPU占用

    console.log('[Compose Injector] 发布框监听器已启动');
  }

  /**
   * 停止监听
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.homepageCheckInterval) {
      clearInterval(this.homepageCheckInterval);
      this.homepageCheckInterval = null;
    }

    if (this.activationCheckInterval) {
      clearInterval(this.activationCheckInterval);
      this.activationCheckInterval = null;
    }

    this.processedDialogs.clear();

    console.log('[Compose Injector] 发布框监听器已停止');
  }

  /**
   * 检查发布框的激活状态
   */
  private checkActivationState(): void {
    if (!TwitterDOM.isOnHomePage()) {
      return;
    }

    const isActive = TwitterDOM.isComposeDialogActive();
    const now = Date.now();

    // 只在状态真正变化时重新注入，避免微小变化触发重注入
    if (isActive !== this.isDialogActive) {
      this.isDialogActive = isActive;
      console.log(`[Compose Injector] 发布框激活状态变化: ${isActive ? '激活' : '未激活'}`);

      // 增加冷却时间到5秒，避免频繁重新注入
      if (now - this.lastInjectTime > 5000) {
        this.lastInjectTime = now;
        // 只在真正需要时才重新注入
        if (!TwitterDOM.hasComposeAIButton()) {
          this.reinjectAll();
        }
      } else {
        console.log(`[Compose Injector] 在冷却期内，跳过重新注入`);
      }
    }
  }

  /**
   * 开始监听 DOM 变化
   */
  private startObserving(): void {
    // 使用更精确的观察配置，减少不必要的触发
    this.observer = new MutationObserver((mutations) => {
      // 检查是否有新的对话框元素
      let hasNewDialog = false;

      for (const mutation of mutations) {
        // 只处理添加节点，忽略属性变化
        if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) {
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            // 更精确的检查，只关注可能是发布框的元素
            if (
              element.getAttribute('role') === 'dialog' ||
              element.querySelector('[role="dialog"]') ||
              element.querySelector('[data-testid="tweetTextarea_0"]')
            ) {
              hasNewDialog = true;
              break;
            }
          }
        }
        if (hasNewDialog) break;
      }

      if (hasNewDialog) {
        // 使用防抖避免频繁调用
        this.debouncedInject();
      }
    });

    // 更精确的观察配置，只观察特定类型的变化
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      // 忽略属性变化和字符数据变化
      attributes: false,
      characterData: false,
    });
  }

  /**
   * 在发布框工具栏中注入 AI 按钮
   */
  private async injectComposeButton(): Promise<void> {
    // 只在首页处理
    if (!TwitterDOM.isOnHomePage()) {
      return;
    }

    // 查找发布弹窗
    const dialog = TwitterDOM.findComposeDialog();
    if (!dialog) {
      return;
    }

    // 检查是否已经处理过这个弹窗
    if (this.processedDialogs.has(dialog)) {
      return;
    }

    // 检查是否已经注入过按钮
    if (TwitterDOM.hasComposeAIButton()) {
      console.log('[Compose Injector] 已有AI按钮，标记为已处理');
      this.processedDialogs.add(dialog);
      return;
    }

    console.log('[Compose Injector] 发现发布弹窗，准备注入 AI 扩写按钮...');

    // 获取发布框
    const composeBox = TwitterDOM.getComposeTextarea();
    if (!composeBox) {
      console.warn('[Compose Injector] 未找到发布输入框');
      return;
    }

    // 等待一小段时间让工具栏渲染
    setTimeout(() => {
      this.injectButton(dialog, composeBox);
    }, 500);
  }

  /**
   * 执行注入
   */
  private injectButton(
    dialog: HTMLElement,
    composeBox: HTMLElement
  ): void {
    // 再次检查是否已经注入过
    if (TwitterDOM.hasComposeAIButton()) {
      this.processedDialogs.add(dialog);
      return;
    }

    try {
      // 获取工具栏
      const toolbar = TwitterDOM.getComposeToolbar();
      const aiButtonContainer = document.createElement('div');
      aiButtonContainer.className = 'twitter-compose-ai-container';
      Object.assign(aiButtonContainer.style, {
        display: 'inline-flex',
        alignItems: 'center',
      });

      if (toolbar) {
        // 标准注入：查找滚动列表并插入到合适位置
        console.log('[Compose Injector] 找到工具栏，开始注入 AI 扩写按钮');

        // 查找 ScrollSnap-List 容器（Twitter 的工具栏按钮列表）
        const scrollSnapList = toolbar.querySelector('[data-testid="ScrollSnap-List"]');
        
        if (scrollSnapList) {
          // 创建新的 presentation 包装器
          const presentationWrapper = document.createElement('div');
          presentationWrapper.setAttribute('role', 'presentation');
          presentationWrapper.setAttribute('class', 'css-175oi2r r-14tvyh0 r-cpa5s6');
          presentationWrapper.appendChild(aiButtonContainer);

          // 查找表情符号按钮（通常是最后一个有效按钮）
          const emojiButton = scrollSnapList.querySelector('button[aria-label*="emoji"], button[aria-label*="表情"]');
          
          if (emojiButton) {
            // 获取表情符号按钮的presentation包装器
            const emojiPresentation = emojiButton.closest('[role="presentation"]');
            
            if (emojiPresentation) {
              // 在表情符号按钮之前插入AI按钮
              scrollSnapList.insertBefore(presentationWrapper, emojiPresentation);
              console.log('[Compose Injector] ✅ AI 扩写按钮已注入到表情符号按钮前');
            } else {
              // 如果找不到表情符号按钮的包装器，直接添加到末尾
              scrollSnapList.appendChild(presentationWrapper);
              console.log('[Compose Injector] ✅ AI 扩写按钮已添加到工具栏列表末尾（备用方案1）');
            }
          } else {
            // 如果没找到表情符号按钮，查找最后一个按钮
            const allButtons = scrollSnapList.querySelectorAll('button');
            if (allButtons.length > 0) {
              const lastButton = allButtons[allButtons.length - 1];
              const lastPresentation = lastButton.closest('[role="presentation"]');
              
              if (lastPresentation) {
                scrollSnapList.insertBefore(presentationWrapper, lastPresentation.nextSibling);
                console.log('[Compose Injector] ✅ AI 扩写按钮已添加到最后按钮后');
              } else {
                scrollSnapList.appendChild(presentationWrapper);
                console.log('[Compose Injector] ✅ AI 扩写按钮已添加到工具栏列表末尾（备用方案2）');
              }
            } else {
              // 如果没有按钮，直接添加到末尾
              scrollSnapList.appendChild(presentationWrapper);
              console.log('[Compose Injector] ✅ AI 扩写按钮已添加到工具栏列表末尾（备用方案3）');
            }
          }
        } else {
          // 如果没有找到ScrollSnap-List，直接添加到工具栏
          toolbar.appendChild(aiButtonContainer);
          console.log('[Compose Injector] ✅ AI 扩写按钮已添加到工具栏（无ScrollSnap-List方案）');
        }
      } else {
        // 备用方案：在发布框附近注入
        console.warn('[Compose Injector] 未找到工具栏，尝试备用注入方案');

        // 查找发布框的父容器
        let parent = composeBox.parentElement;
        while (parent && parent !== dialog) {
          // 查找包含发布框的较大容器
          if (parent.offsetHeight > 50 && parent.offsetHeight < 300) {
            // 创建一个浮动容器
            Object.assign(aiButtonContainer.style, {
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: '100',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              padding: '2px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            });

            // 设置父容器为相对定位
            if (getComputedStyle(parent).position === 'static') {
              parent.style.position = 'relative';
            }

            parent.appendChild(aiButtonContainer);
            console.log('[Compose Injector] 使用备用方案注入 AI 扩写按钮');
            break;
          }
          parent = parent.parentElement;
        }

        // 如果还是找不到合适的位置，直接插入到对话框底部
        if (!aiButtonContainer.parentElement) {
          Object.assign(aiButtonContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '10000',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '2px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          });
          dialog.appendChild(aiButtonContainer);
          console.log('[Compose Injector] 使用固定定位注入 AI 扩写按钮');
        }
      }

      // 使用 React 渲染 AI 按钮
      const root = ReactDOM.createRoot(aiButtonContainer);
      root.render(
        <ComposeToolbarButton composeBox={composeBox} />
      );

      // 标记为已处理
      this.processedDialogs.add(dialog);

      console.log('[Compose Injector] ✅ AI 扩写按钮已成功注入');
    } catch (error) {
      console.error('[Compose Injector] 注入失败:', error);
    }
  }

  /**
   * 重新注入所有发布框（用于调试）
   */
  async reinjectAll(): Promise<void> {
    console.log('[Compose Injector] 重新注入发布框...');
    this.processedDialogs.clear();

    // 移除所有已注入的按钮
    const existingButtons = document.querySelectorAll('.twitter-compose-ai-container');
    existingButtons.forEach((button) => button.remove());

    // 重新注入
    await this.injectComposeButton();
  }
}

// 导出单例实例
export const composeInjector = new ComposeInjector();