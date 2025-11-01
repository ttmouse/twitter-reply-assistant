/**
 * Content Script - Twitter Reply Assistant
 *
 * 注入到 Twitter/X.com 页面，提供 AI 智能回复功能
 */

// 导入样式
import './styles.css';

// 导入注入器
import { twitterInjector } from './twitter-injector.tsx';
import { StorageService } from '../services/storage-service';

console.log('[Twitter Reply Assistant] Content script 已加载');

/**
 * 初始化扩展
 */
async function initialize() {
  try {
    // 检查是否有配置
    const hasConfig = await StorageService.hasAIConfig();

    if (!hasConfig) {
      console.warn('[Twitter Reply Assistant] 未找到 API 配置');
      console.log('[Twitter Reply Assistant] 💡 请点击浏览器工具栏中的扩展图标进行配置');
      return; // 不启动注入器
    }

    console.log('[Twitter Reply Assistant] 配置已找到，延迟启动注入器...');

    // 添加随机延迟，避免被检测（2-5秒）
    const delay = 2000 + Math.random() * 3000;

    setTimeout(() => {
      // 等待页面完全加载
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          // 再次延迟启动
          setTimeout(() => {
            twitterInjector.start();
          }, 1000);
        });
      } else {
        // 页面已加载，延迟后启动
        twitterInjector.start();
      }
    }, delay);

    // 监听配置变化
    StorageService.onConfigChange((config) => {
      if (config) {
        console.log('[Twitter Reply Assistant] 配置已更新');
        // 延迟重新注入
        setTimeout(() => {
          twitterInjector.reinjectAll();
        }, 1000);
      } else {
        console.log('[Twitter Reply Assistant] 配置已清除，停止注入器');
        twitterInjector.stop();
      }
    });

    console.log('[Twitter Reply Assistant] 初始化完成！');
  } catch (error) {
    console.error('[Twitter Reply Assistant] 初始化失败:', error);
  }
}

// 延迟启动，避免被检测
setTimeout(() => {
  initialize();
}, 1000);

// 暴露到 window 对象，方便调试
if (typeof window !== 'undefined') {
  (window as any).twitterAIReply = {
    injector: twitterInjector,
    reinject: () => twitterInjector.reinjectAll(),
    stop: () => twitterInjector.stop(),
    start: () => twitterInjector.start(),
  };

  console.log('[Twitter Reply Assistant] 调试工具已挂载到 window.twitterAIReply');
}
