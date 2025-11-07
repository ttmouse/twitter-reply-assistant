/**
 * 性能测试工具
 * 
 * 用于测试扩展性能和优化效果
 * 可以在浏览器控制台运行
 */

/**
 * 监控扩展的日志输出频率
 */
export function monitorLogFrequency(): void {
  console.log('📊 开始监控日志输出频率...');
  
  // 保存原始console.log
  const originalLog = console.log;
  
  let logCount = 0;
  let composeInjectorLogs = 0;
  let twitterDOMLogs = 0;
  let startTime = Date.now();
  
  // 重写console.log
  console.log = function(...args: any[]) {
    const message = args.join(' ');
    
    // 统计总体日志数
    logCount++;
    
    // 统计特定模块的日志
    if (message.includes('[Compose Injector]')) {
      composeInjectorLogs++;
    }
    if (message.includes('[TwitterDOM]')) {
      twitterDOMLogs++;
    }
    
    // 调用原始log
    originalLog.apply(console, args);
  };
  
  // 每5秒输出一次统计
  const reportInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    const logRate = (logCount / elapsed).toFixed(2);
    const composeRate = (composeInjectorLogs / elapsed).toFixed(2);
    const domRate = (twitterDOMLogs / elapsed).toFixed(2);
    
    console.log(`📈 日志频率统计 (${elapsed.toFixed(1)}秒):`);
    console.log(`  - 总日志: ${logCount} (${logRate}/秒)`);
    console.log(`  - Compose Injector: ${composeInjectorLogs} (${composeRate}/秒)`);
    console.log(`  - TwitterDOM: ${twitterDOMLogs} (${domRate}/秒)`);
    
    // 如果频率过高，给出警告
    if (parseFloat(logRate) > 5) {
      console.warn('⚠️ 日志输出频率过高，可能存在性能问题');
    }
    
    if (parseFloat(composeRate) > 2) {
      console.warn('⚠️ Compose Injector日志频率过高，建议优化');
    }
  }, 5000);
  
  // 30秒后停止监控
  setTimeout(() => {
    clearInterval(reportInterval);
    console.log('🛑 停止监控，恢复原始console.log');
    console.log = originalLog;
    
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`📊 最终统计 (${elapsed.toFixed(1)}秒):`);
    console.log(`  - 总日志: ${logCount}`);
    console.log(`  - Compose Injector: ${composeInjectorLogs}`);
    console.log(`  - TwitterDOM: ${twitterDOMLogs}`);
  }, 30000);
}

/**
 * 测试注入器冷却机制
 */
export function testInjectorCooldown(): void {
  console.log('🧪 测试注入器冷却机制...');
  
  const injector = (window as any).twitterAIReply?.composeInjector;
  if (!injector) {
    console.error('❌ 注入器未找到');
    return;
  }
  
  // 模拟快速连续的状态变化
  console.log('⚡ 模拟快速状态变化...');
  
  let triggerCount = 0;
  const triggerInterval = setInterval(() => {
    triggerCount++;
    console.log(`触发状态变化 #${triggerCount}`);
    
    // 手动触发检查
    injector.checkActivationState?.();
    
    if (triggerCount >= 10) {
      clearInterval(triggerInterval);
      console.log('✅ 状态变化测试完成');
    }
  }, 100);
}

/**
 * 检查内存使用情况
 */
export function checkMemoryUsage(): void {
  console.log('💾 检查内存使用情况...');
  
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const used = memory.usedJSHeapSize / 1024 / 1024;
    const total = memory.totalJSHeapSize / 1024 / 1024;
    const limit = memory.jsHeapSizeLimit / 1024 / 1024;
    
    console.log(`📊 内存使用情况:`);
    console.log(`  - 已使用: ${used.toFixed(2)} MB`);
    console.log(`  - 总计: ${total.toFixed(2)} MB`);
    console.log(`  - 限制: ${limit.toFixed(2)} MB`);
    console.log(`  - 使用率: ${((used / total) * 100).toFixed(2)}%`);
    
    if (used > 50) {
      console.warn('⚠️ 内存使用量较高，可能存在内存泄漏');
    }
  } else {
    console.log('❌ 当前浏览器不支持内存监控');
  }
}

/**
 * 测试DOM变化监听效率
 */
export function testDOMObserverEfficiency(): void {
  console.log('👀 测试DOM变化监听效率...');
  
  let mutationCount = 0;
  let startTime = Date.now();
  
  // 创建测试观察器
  const observer = new MutationObserver((mutations) => {
    mutationCount += mutations.length;
    
    if (mutationCount % 50 === 0) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = (mutationCount / elapsed).toFixed(2);
      console.log(`📈 DOM变化: ${mutationCount} 次 (${rate}/秒)`);
    }
  });
  
  // 开始观察
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
  
  // 10秒后停止
  setTimeout(() => {
    observer.disconnect();
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (mutationCount / elapsed).toFixed(2);
    
    console.log(`👀 DOM变化监听测试完成 (${elapsed.toFixed(1)}秒):`);
    console.log(`  - 总变化次数: ${mutationCount}`);
    console.log(`  - 平均频率: ${rate}/秒`);
    
    if (parseFloat(rate) > 10) {
      console.warn('⚠️ DOM变化频率过高，建议优化监听器');
    } else {
      console.log('✅ DOM变化监听效率正常');
    }
  }, 10000);
}

// 暴露到全局
(window as any).monitorLogFrequency = monitorLogFrequency;
(window as any).testInjectorCooldown = testInjectorCooldown;
(window as any).checkMemoryUsage = checkMemoryUsage;
(window as any).testDOMObserverEfficiency = testDOMObserverEfficiency;

/**
 * 使用说明:
 * 1. 打开浏览器控制台(F12)
 * 2. 运行 monitorLogFrequency() 监控日志频率
 * 3. 运行 testInjectorCooldown() 测试冷却机制
 * 4. 运行 checkMemoryUsage() 检查内存使用
 * 5. 运行 testDOMObserverEfficiency() 测试DOM监听效率
 */