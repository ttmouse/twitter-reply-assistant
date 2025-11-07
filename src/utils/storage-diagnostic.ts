/**
 * Storage Diagnostic Tool
 * 
 * 用于诊断和修复存储操作问题的工具
 * 可以通过控制台运行或集成到popup中
 */

import { StorageService } from '../services/storage-service';

/**
 * 运行完整的存储诊断
 */
export async function runStorageDiagnostic(): Promise<{
  success: boolean;
  results: {
    contextValid: boolean;
    storageAvailable: boolean;
    storageInfo?: any;
    error?: string;
    recommendations: string[];
  };
}> {
  console.log('🔍 开始存储诊断...');
  
  const results: any = {
    contextValid: false,
    storageAvailable: false,
    recommendations: [] as string[],
  };
  
  try {
    // 1. 检查扩展上下文
    results.contextValid = checkExtensionContext();
    console.log(`扩展上下文: ${results.contextValid ? '✅ 有效' : '❌ 无效'}`);
    
    if (!results.contextValid) {
      results.recommendations.push('刷新页面或重启浏览器');
      return { success: false, results };
    }
    
    // 2. 检查存储可用性
    const storageCheck = await StorageService.checkStorageAvailability();
    results.storageAvailable = storageCheck.available;
    results.storageInfo = storageCheck.info;
    
    console.log(`存储可用性: ${results.storageAvailable ? '✅ 可用' : '❌ 不可用'}`);
    
    if (!storageCheck.available) {
      results.error = storageCheck.error;
      console.error(`存储错误: ${storageCheck.error}`);
      
      // 根据错误类型添加建议
      if (storageCheck.error?.includes('quota')) {
        results.recommendations.push('存储空间不足，请清除扩展数据');
      } else if (storageCheck.error?.includes('permission')) {
        results.recommendations.push('检查扩展权限设置');
      } else if (storageCheck.error?.includes('context')) {
        results.recommendations.push('刷新页面或重启浏览器');
      }
    } else {
      // 3. 显示存储信息
      if (storageCheck.info) {
        console.log('存储信息:', storageCheck.info);
        
        const { bytesInUse, quota, percentUsed } = storageCheck.info;
        console.log(`已使用: ${formatBytes(bytesInUse)} / ${formatBytes(quota)} (${percentUsed}%)`);
        
        // 如果使用率过高，给出警告
        if (percentUsed > 80) {
          results.recommendations.push(`存储使用率过高 (${percentUsed}%)，建议清理数据`);
        }
      }
    }
    
    // 4. 尝试修复存储问题
    if (!results.storageAvailable) {
      console.log('🔧 尝试修复存储问题...');
      const repairResult = await StorageService.attemptStorageRepair();
      
      if (repairResult.success) {
        console.log('✅ 存储问题已修复');
        results.storageAvailable = true;
      } else {
        console.log(`❌ 修复失败: ${repairResult.message}`);
        results.recommendations.push(repairResult.message);
      }
    }
    
    return { success: results.storageAvailable, results };
    
  } catch (error) {
    console.error('诊断过程中出错:', error);
    results.error = error instanceof Error ? error.message : '未知错误';
    results.recommendations.push('重试或重新安装扩展');
    return { success: false, results };
  }
}

/**
 * 清理存储数据
 */
export async function clearStorageData(options: {
  clearConfig?: boolean;
  clearCustomStyles?: boolean;
  clearAll?: boolean;
} = {}): Promise<{ success: boolean; message: string }> {
  try {
    if (options.clearAll) {
      await StorageService.clearAll();
      return { success: true, message: '所有存储数据已清除' };
    }
    
    if (options.clearConfig) {
      await StorageService.clearAIConfig();
      console.log('AI配置已清除');
    }
    
    if (options.clearCustomStyles) {
      const customStyles = await StorageService.getCustomStyles();
      if (customStyles.length > 0) {
        await StorageService.clearCustomStyles();
        console.log('自定义风格已清除');
      }
    }
    
    return { 
      success: true, 
      message: '选定的存储数据已清除' 
    };
    
  } catch (error) {
    console.error('清除存储数据失败:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : '清除失败' 
    };
  }
}

/**
 * 检查扩展上下文是否有效
 */
function checkExtensionContext(): boolean {
  try {
    return !!(chrome && chrome.storage && chrome.runtime && chrome.runtime.id);
  } catch {
    return false;
  }
}

/**
 * 格式化字节数为可读格式
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 在控制台中运行诊断的全局函数
 */
(window as any).runStorageDiagnostic = runStorageDiagnostic;
(window as any).clearStorageData = clearStorageData;

/**
 * 使用示例:
 * 1. 在控制台运行: runStorageDiagnostic()
 * 2. 查看诊断结果和建议
 * 3. 如果需要，运行: clearStorageData({clearAll: true}) 清除所有数据
 */