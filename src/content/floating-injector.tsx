/**
 * 悬浮按钮注入器
 * 
 * 在页面右侧添加一个悬浮按钮，作为扩展功能的备选入口
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { FloatingButton } from '../components/FloatingButton';
import { TwitterDOM } from '../utils/twitter-dom';

/**
 * 悬浮按钮注入器类
 */
export class FloatingInjector {
  private container: HTMLElement | null = null;
  private root: ReactDOM.Root | null = null;
  private isInjected = false;

  /**
   * 开始注入悬浮按钮
   */
  start(): void {
    console.log('[Floating Injector] 启动悬浮按钮注入器...');
    
    // 检查是否在 Twitter 上
    if (!TwitterDOM.isOnTwitter()) {
      console.log('[Floating Injector] 不在 Twitter 页面，停止');
      return;
    }

    // 立即尝试注入
    this.injectFloatingButton();

    // 监听DOM变化，确保在页面导航后也能注入
    const observer = new MutationObserver(() => {
      if (!this.isInjected || !this.container || !document.body.contains(this.container)) {
        this.injectFloatingButton();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    console.log('[Floating Injector] 悬浮按钮注入器已启动');
  }

  /**
   * 停止注入
   */
  stop(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.root) {
      this.root.unmount();
      this.root = null;
    }

    this.isInjected = false;
    console.log('[Floating Injector] 悬浮按钮注入器已停止');
  }

  /**
   * 注入悬浮按钮
   */
  private injectFloatingButton(): void {
    // 如果已经注入，先移除旧的
    if (this.container) {
      this.container.remove();
    }

    // 创建容器
    this.container = document.createElement('div');
    this.container.id = 'twitter-ai-floating-button-container';
    this.container.style.cssText = `
      all: initial;
      position: fixed;
      top: 0;
      left: 0;
      width: 0;
      height: 0;
      z-index: 2147483647;
      pointer-events: none;
    `;

    // 添加到body
    document.body.appendChild(this.container);

    // 渲染悬浮按钮
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <div style={{ pointerEvents: 'auto' }}>
        <FloatingButton />
      </div>
    );

    this.isInjected = true;
    console.log('[Floating Injector] ✅ 悬浮按钮已注入');
  }

  /**
   * 重新注入悬浮按钮
   */
  reinject(): void {
    console.log('[Floating Injector] 重新注入悬浮按钮...');
    this.stop();
    this.injectFloatingButton();
  }
}

// 导出单例实例
export const floatingInjector = new FloatingInjector();