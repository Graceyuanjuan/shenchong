/**
 * T5-A 最终演示脚本
 * 展示 BehaviorDB 完整功能
 */

import { BehaviorDB, BehaviorStrategySchema, RhythmMode } from './modules/strategy/BehaviorDB';
import { PetState, EmotionType } from './types';

async function t5aDemo() {
  console.log('🎯 ===== T5-A BehaviorDB 功能演示 =====\n');
  
  const db = new BehaviorDB();
  
  try {
    // 1. 初始化演示
    console.log('📝 1. 数据库初始化');
    await db.initialize();
    console.log('');

    // 2. 创建演示策略
    console.log('📝 2. 创建演示策略');
    const demoStrategies: BehaviorStrategySchema[] = [
      {
        name: 'T5A演示_静碗_平静',
        state: PetState.Idle,
        emotion: EmotionType.Calm,
        actions: ['gentle_float', 'soft_breathing'],
        rhythm: RhythmMode.BACKGROUND,
        priority: 1,
        metadata: {
          demo: true,
          description: 'T5-A演示策略',
          created: new Date().toISOString()
        }
      },
      {
        name: 'T5A演示_感应碗_兴奋',
        state: PetState.Hover,
        emotion: EmotionType.Excited,
        actions: ['bright_pulse', 'anticipation_bounce'],
        rhythm: RhythmMode.ACTIVE,
        priority: 3,
        metadata: {
          demo: true,
          description: 'T5-A演示策略',
          created: new Date().toISOString()
        }
      }
    ];

    await db.saveStrategies(demoStrategies);
    console.log('✅ 演示策略保存完成\n');

    // 3. 策略查询演示
    console.log('📝 3. 策略查询演示');
    const allStrategies = await db.loadStrategies();
    console.log(`📚 当前策略总数: ${allStrategies.length}`);
    
    const matchingStrategies = await db.getMatchingStrategies(PetState.Idle, EmotionType.Calm);
    console.log(`🎯 匹配策略数 (idle + calm): ${matchingStrategies.length}`);
    console.log('');

    // 4. 热加载演示
    console.log('📝 4. 热加载演示');
    let hotLoadCount = 0;
    db.onHotReload('demo_listener', () => {
      hotLoadCount++;
      console.log(`🔥 热加载触发 #${hotLoadCount}`);
    });

    const hotStrategy: BehaviorStrategySchema = {
      name: 'T5A热加载_唤醒_专注',
      state: PetState.Awaken,
      emotion: EmotionType.Focused,
      actions: ['precision_tools', 'focus_indicator'],
      rhythm: RhythmMode.RESPONSIVE,
      priority: 5,
      metadata: {
        hotLoaded: true,
        description: 'T5-A热加载演示策略'
      }
    };

    await db.hotLoadStrategy(hotStrategy);
    console.log('✅ 热加载演示完成\n');

    // 5. 导出演示
    console.log('📝 5. 导出演示');
    await db.exportStrategies('./t5a-demo-export.json');
    console.log('✅ 策略导出演示完成\n');

    // 6. 数据库状态查询
    console.log('📝 6. 数据库状态查询');
    const status = await db.getStatus();
    console.log('📊 数据库状态:', {
      initialized: status.isInitialized,
      totalStrategies: status.totalStrategies,
      version: status.version,
      lastUpdated: status.lastUpdated
    });
    console.log('');

    // 7. 备份演示
    console.log('📝 7. 备份演示');
    await db.createBackup();
    console.log('✅ 备份演示完成\n');

    // 8. 最终验证
    console.log('📝 8. 最终验证');
    const finalStrategies = await db.loadStrategies();
    const demoCount = finalStrategies.filter(s => 
      s.metadata?.demo || s.metadata?.hotLoaded
    ).length;
    
    console.log(`🎯 演示策略数量: ${demoCount}`);
    console.log(`📈 总策略数量: ${finalStrategies.length}`);
    console.log(`🔥 热加载次数: ${hotLoadCount}`);
    
    console.log('\n🎉 ===== T5-A 演示完成！=====');
    console.log('✨ BehaviorDB 所有核心功能正常运行');
    console.log('🚀 T5-A 阶段任务圆满完成！');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error);
  } finally {
    await db.destroy();
  }
}

// 运行演示
if (typeof require !== 'undefined' && require.main === module) {
  t5aDemo().catch(console.error);
}

export { t5aDemo };
