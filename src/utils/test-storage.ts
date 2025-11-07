/**
 * Storage Test Script
 * 
 * 用于测试存储功能的简单脚本
 * 可以在浏览器控制台中运行
 */

import { StorageService } from '../services/storage-service';

/**
 * 测试存储功能
 */
export async function testStorageFunction(): Promise<void> {
  console.log('🧪 开始测试存储功能...');
  
  try {
    // 1. 测试基本存储信息
    console.log('📊 获取存储信息...');
    const storageInfo = await StorageService.getStorageInfo();
    console.log('存储信息:', storageInfo);
    
    // 2. 测试存储可用性
    console.log('🔍 检查存储可用性...');
    const availabilityCheck = await StorageService.checkStorageAvailability();
    console.log('存储可用性:', availabilityCheck);
    
    if (!availabilityCheck.available) {
      console.error('❌ 存储不可用:', availabilityCheck.error);
      
      // 3. 尝试修复
      console.log('🔧 尝试修复存储问题...');
      const repairResult = await StorageService.attemptStorageRepair();
      console.log('修复结果:', repairResult);
      
      if (!repairResult.success) {
        console.error('❌ 修复失败:', repairResult.message);
        return;
      }
    }
    
    // 4. 测试读写操作
    console.log('✍️ 测试读写操作...');
    const testConfig = {
      provider: 'siliconflow' as const,
      apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
      apiToken: 'test_token_' + Date.now(),
      model: 'Qwen/Qwen2.5-7B-Instruct'
    };
    
    await StorageService.setAIConfig(testConfig);
    console.log('✅ 配置保存成功');
    
    const retrievedConfig = await StorageService.getAIConfig();
    if (retrievedConfig && retrievedConfig.apiToken === testConfig.apiToken) {
      console.log('✅ 配置读取成功，数据一致');
    } else {
      console.error('❌ 配置读取失败或数据不一致');
    }
    
    // 清理测试数据
    await StorageService.clearAIConfig();
    console.log('🧹 测试数据已清理');
    
    console.log('🎉 存储功能测试完成');
  } catch (error) {
    console.error('❌ 存储测试失败:', error);
  }
}

// 在控制台中可用的全局函数
(window as any).testStorage = testStorageFunction;

/**
 * 使用示例:
 * 1. 在浏览器控制台运行: testStorage()
 * 2. 查看测试结果
 */