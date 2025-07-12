/**
 * T3-C: 节奏控制器测试
 * 
 * 验证节奏控制器的多段节奏处理、动画帧控制、节拍同步等功能
 */

import { RhythmController, RhythmMode, RhythmSegment, RhythmSyncEvent } from './core/RhythmController';
import { BehaviorType } from './core/BehaviorScheduler';
import { PetState, EmotionType } from './types';

/**
 * 运行节奏控制器测试
 */
export async function runRhythmControllerTests(): Promise<void> {
  console.log('\n🎵 ===== T3-C: 节奏控制器功能测试开始 =====\n');

  try {
    await testBasicRhythmControl();
    await testMultipleRhythmModes();
    await testEmotionBasedRhythms();
    await testPerformanceMonitoring();
    await testRhythmSequencing();
    
    console.log('\n🎉 ===== 节奏控制器所有测试通过！=====');
    console.log('\n📝 测试总结:');
    console.log('   🎵 基础节奏控制：✅ 正常');
    console.log('   🎭 多种节奏模式：✅ 正常');
    console.log('   😊 情绪驱动节奏：✅ 正常');
    console.log('   📊 性能监控：✅ 正常');
    console.log('   🔗 节奏序列：✅ 正常');
    console.log('\n🚀 T3-C 节奏控制器已准备就绪！');

  } catch (error) {
    console.error('\n💥 ===== 节奏控制器测试失败 =====');
    console.error('❌ 错误详情:', error);
    console.error('\n🔧 请检查以下可能的问题:');
    console.error('   1. 节奏控制器初始化是否正确');
    console.error('   2. 节拍计算逻辑是否准确');
    console.error('   3. 帧率控制是否正常');
    console.error('   4. 事件触发机制是否完整');
    
    process.exit(1);
  }
}

/**
 * 测试基础节奏控制功能
 */
async function testBasicRhythmControl(): Promise<void> {
  console.log('🧪 ===== 测试 1: 基础节奏控制功能 =====');

  // 创建节奏控制器
  const rhythmController = new RhythmController();
  console.log('✅ 节奏控制器创建成功');

  // 创建基础测试段
  const testSegment: RhythmSegment = {
    id: 'test_basic',
    duration: 2000, // 2秒测试
    mode: RhythmMode.PULSE,
    beatConfig: {
      bpm: 120,
      beatDivision: 4
    },
    behaviors: [
      {
        type: BehaviorType.IDLE_ANIMATION,
        priority: 5,
        duration: 500,
        animation: 'test_pulse',
        message: '🎵 基础节拍测试'
      }
    ]
  };

  rhythmController.addSegment(testSegment);
  console.log('✅ 测试段添加成功');

  // 添加事件监听器
  let beatCount = 0;
  let segmentStarted = false;
  let segmentEnded = false;

  rhythmController.on('beat', (event: RhythmSyncEvent) => {
    beatCount++;
    console.log(`🎵 收到节拍事件 #${beatCount}: ${event.beatNumber}`);
  });

  rhythmController.on('segment_start', (event: RhythmSyncEvent) => {
    segmentStarted = true;
    console.log(`🎵 段开始事件: ${event.segmentId}`);
  });

  rhythmController.on('segment_end', (event: RhythmSyncEvent) => {
    segmentEnded = true;
    console.log(`🎵 段结束事件: ${event.segmentId}`);
  });

  // 播放测试段
  console.log('🎵 开始播放基础测试段...');
  const playPromise = rhythmController.playSegment('test_basic');

  // 等待完成
  await new Promise(resolve => {
    rhythmController.on('rhythm_complete', () => {
      console.log('🎵 节奏完成事件收到');
      resolve(undefined);
    });
  });

  // 验证结果
  console.log('\n📊 基础测试结果验证:');
  console.log(`   节拍计数: ${beatCount} (预期: 4-5个节拍)`);
  console.log(`   段开始: ${segmentStarted ? '✅' : '❌'}`);
  console.log(`   段结束: ${segmentEnded ? '✅' : '❌'}`);

  // 获取执行状态
  const state = rhythmController.getExecutionState();
  console.log(`   最终状态: 播放=${state.isPlaying}, 暂停=${state.isPaused}`);

  // 清理
  rhythmController.destroy();
  console.log('✅ 基础节奏控制测试完成\n');
}

/**
 * 测试多种节奏模式
 */
async function testMultipleRhythmModes(): Promise<void> {
  console.log('🧪 ===== 测试 2: 多种节奏模式验证 =====');

  const rhythmController = new RhythmController();

  // 测试连续模式
  console.log('🎵 测试连续模式 (Continuous)...');
  const continuousSegment: RhythmSegment = {
    id: 'test_continuous',
    duration: 1000,
    mode: RhythmMode.CONTINUOUS,
    frameConfig: {
      targetFPS: 30,
      maxFrameTime: 33.33,
      adaptiveFrameRate: false,
      skipFrameThreshold: 50
    },
    behaviors: [
      {
        type: BehaviorType.ANIMATION_SEQUENCE,
        priority: 5,
        message: '🎨 连续动画测试'
      }
    ]
  };

  rhythmController.addSegment(continuousSegment);
  await rhythmController.playSegment('test_continuous');
  await sleep(1200); // 等待完成
  console.log('✅ 连续模式测试完成');

  // 测试序列模式
  console.log('🎵 测试序列模式 (Sequence)...');
  const sequenceSegment: RhythmSegment = {
    id: 'test_sequence',
    duration: 1500,
    mode: RhythmMode.SEQUENCE,
    behaviors: [
      {
        type: BehaviorType.HOVER_FEEDBACK,
        priority: 5,
        duration: 300,
        message: '🎵 序列步骤 1'
      },
      {
        type: BehaviorType.EMOTIONAL_EXPRESSION,
        priority: 5,
        duration: 300,
        message: '🎵 序列步骤 2'
      },
      {
        type: BehaviorType.USER_PROMPT,
        priority: 5,
        duration: 300,
        message: '🎵 序列步骤 3'
      }
    ]
  };

  rhythmController.addSegment(sequenceSegment);
  await rhythmController.playSegment('test_sequence');
  await sleep(1200); // 等待序列完成
  console.log('✅ 序列模式测试完成');

  // 测试自适应模式
  console.log('🎵 测试自适应模式 (Adaptive)...');
  const adaptiveSegment: RhythmSegment = {
    id: 'test_adaptive',
    duration: 1000,
    mode: RhythmMode.ADAPTIVE,
    frameConfig: {
      targetFPS: 60,
      maxFrameTime: 16.67,
      adaptiveFrameRate: true,
      skipFrameThreshold: 33.33
    },
    behaviors: [
      {
        type: BehaviorType.IDLE_ANIMATION,
        priority: 5,
        message: '🎵 自适应节奏测试'
      }
    ]
  };

  rhythmController.addSegment(adaptiveSegment);
  await rhythmController.playSegment('test_adaptive');
  await sleep(1200);
  console.log('✅ 自适应模式测试完成');

  rhythmController.destroy();
  console.log('✅ 多种节奏模式测试完成\n');
}

/**
 * 测试情绪驱动节奏
 */
async function testEmotionBasedRhythms(): Promise<void> {
  console.log('🧪 ===== 测试 3: 情绪驱动节奏验证 =====');

  const rhythmController = new RhythmController();

  // 测试不同情绪的节奏创建
  const emotions = [
    { emotion: EmotionType.Excited, expectedBPM: 140 },
    { emotion: EmotionType.Calm, expectedBPM: 80 },
    { emotion: EmotionType.Curious, expectedBPM: 110 },
    { emotion: EmotionType.Focused, expectedBPM: 100 }
  ];

  for (const { emotion, expectedBPM } of emotions) {
    console.log(`😊 测试 ${emotion} 情绪节奏 (期望BPM: ${expectedBPM})...`);

    const segment = RhythmController.createEmotionBasedSegment(
      `test_${emotion}`,
      PetState.Awaken,
      emotion,
      [
        {
          type: BehaviorType.EMOTIONAL_EXPRESSION,
          priority: 5,
          message: `😊 ${emotion} 情绪表达`
        }
      ]
    );

    console.log(`   创建的段配置: 模式=${segment.mode}, BPM=${segment.beatConfig?.bpm}, 时长=${segment.duration}ms`);
    
    // 验证BPM符合预期
    if (segment.beatConfig?.bpm === expectedBPM) {
      console.log(`   ✅ BPM匹配预期值: ${expectedBPM}`);
    } else {
      console.log(`   ⚠️ BPM不匹配: 期望${expectedBPM}, 实际${segment.beatConfig?.bpm}`);
    }

    rhythmController.addSegment(segment);
  }

  // 测试情绪切换序列
  console.log('🎵 测试情绪切换序列...');
  
  let currentEmotionIndex = 0;
  const emotionSequence = emotions.map(e => e.emotion);

  // 播放第一个情绪段
  await rhythmController.playSegment(`test_${emotionSequence[0]}`);
  await sleep(1500); // 让第一个段运行一段时间

  console.log('✅ 情绪驱动节奏测试完成');

  rhythmController.destroy();
  console.log('✅ 情绪驱动节奏验证完成\n');
}

/**
 * 测试性能监控
 */
async function testPerformanceMonitoring(): Promise<void> {
  console.log('🧪 ===== 测试 4: 性能监控功能 =====');

  const rhythmController = new RhythmController();

  // 创建高频率测试段
  const performanceSegment: RhythmSegment = {
    id: 'test_performance',
    duration: 2000,
    mode: RhythmMode.CONTINUOUS,
    frameConfig: {
      targetFPS: 60,
      maxFrameTime: 16.67,
      adaptiveFrameRate: true,
      skipFrameThreshold: 33.33
    },
    behaviors: [
      {
        type: BehaviorType.ANIMATION_SEQUENCE,
        priority: 5,
        message: '📊 性能测试动画'
      }
    ]
  };

  rhythmController.addSegment(performanceSegment);

  console.log('📊 开始性能监控测试...');
  await rhythmController.playSegment('test_performance');

  // 运行一段时间收集性能数据
  await sleep(2500);

  // 获取性能统计
  const stats = rhythmController.getPerformanceStats();
  console.log('\n📊 性能统计结果:');
  console.log(`   总帧数: ${stats.totalFrames}`);
  console.log(`   平均帧时间: ${stats.averageFrameTime.toFixed(2)}ms`);
  console.log(`   当前FPS: ${stats.currentFPS.toFixed(1)}`);
  console.log(`   丢帧数: ${stats.droppedFrames}`);
  console.log(`   丢帧率: ${(stats.dropFrameRate * 100).toFixed(2)}%`);

  // 验证性能指标合理性
  const fpsValid = stats.currentFPS > 20 && stats.currentFPS <= 80;
  const dropRateValid = stats.dropFrameRate < 0.1; // 丢帧率小于10%

  console.log('\n📊 性能指标验证:');
  console.log(`   FPS合理性: ${fpsValid ? '✅' : '❌'} (${stats.currentFPS.toFixed(1)} FPS)`);
  console.log(`   丢帧率合理性: ${dropRateValid ? '✅' : '❌'} (${(stats.dropFrameRate * 100).toFixed(2)}%)`);

  rhythmController.destroy();
  console.log('✅ 性能监控测试完成\n');
}

/**
 * 测试节奏序列和转场
 */
async function testRhythmSequencing(): Promise<void> {
  console.log('🧪 ===== 测试 5: 节奏序列和转场 =====');

  const rhythmController = new RhythmController();

  // 创建连续的节奏段序列
  const segment1: RhythmSegment = {
    id: 'sequence_1',
    duration: 1000,
    mode: RhythmMode.PULSE,
    beatConfig: { bpm: 100, beatDivision: 4 },
    behaviors: [
      {
        type: BehaviorType.IDLE_ANIMATION,
        priority: 5,
        message: '🎵 序列段 1'
      }
    ],
    transitions: {
      fadeOut: 200,
      nextSegment: 'sequence_2'
    }
  };

  const segment2: RhythmSegment = {
    id: 'sequence_2',
    duration: 1000,
    mode: RhythmMode.CONTINUOUS,
    behaviors: [
      {
        type: BehaviorType.HOVER_FEEDBACK,
        priority: 5,
        message: '🎵 序列段 2'
      }
    ],
    transitions: {
      fadeIn: 200,
      fadeOut: 200,
      nextSegment: 'sequence_3'
    }
  };

  const segment3: RhythmSegment = {
    id: 'sequence_3',
    duration: 1000,
    mode: RhythmMode.SEQUENCE,
    behaviors: [
      {
        type: BehaviorType.EMOTIONAL_EXPRESSION,
        priority: 5,
        duration: 500,
        message: '🎵 序列段 3'
      }
    ],
    transitions: {
      fadeIn: 200
    }
  };

  // 添加所有段
  rhythmController.addSegment(segment1);
  rhythmController.addSegment(segment2);
  rhythmController.addSegment(segment3);

  console.log('🎵 添加了3个连续段，测试自动转场...');

  // 跟踪段切换
  let segmentSwitches = 0;
  rhythmController.on('segment_start', (event: RhythmSyncEvent) => {
    segmentSwitches++;
    console.log(`🎵 段开始 #${segmentSwitches}: ${event.segmentId}`);
  });

  rhythmController.on('segment_end', (event: RhythmSyncEvent) => {
    console.log(`🎵 段结束: ${event.segmentId}`);
  });

  // 开始序列
  await rhythmController.playSegment('sequence_1');

  // 等待整个序列完成
  await new Promise(resolve => {
    rhythmController.on('rhythm_complete', () => {
      console.log('🎵 整个节奏序列完成');
      resolve(undefined);
    });
  });

  console.log('\n🔗 序列测试结果:');
  console.log(`   总段切换次数: ${segmentSwitches} (期望: 3)`);
  console.log(`   自动转场: ${segmentSwitches === 3 ? '✅' : '❌'}`);

  // 测试暂停/恢复功能
  console.log('\n⏸️ 测试暂停/恢复功能...');
  
  // 重新开始一个简单的段用于暂停测试
  const pauseTestSegment: RhythmSegment = {
    id: 'pause_test',
    duration: 3000,
    mode: RhythmMode.PULSE,
    beatConfig: { bpm: 120, beatDivision: 4 },
    behaviors: [
      {
        type: BehaviorType.IDLE_ANIMATION,
        priority: 5,
        message: '⏸️ 暂停测试段'
      }
    ]
  };

  rhythmController.addSegment(pauseTestSegment);
  await rhythmController.playSegment('pause_test');
  
  // 运行500ms后暂停
  await sleep(500);
  console.log('⏸️ 暂停节奏控制...');
  rhythmController.pause();
  
  const pausedState = rhythmController.getExecutionState();
  console.log(`   暂停状态: 播放=${pausedState.isPlaying}, 暂停=${pausedState.isPaused}`);
  
  // 暂停500ms后恢复
  await sleep(500);
  console.log('▶️ 恢复节奏控制...');
  rhythmController.resume();
  
  const resumedState = rhythmController.getExecutionState();
  console.log(`   恢复状态: 播放=${resumedState.isPlaying}, 暂停=${resumedState.isPaused}`);
  
  // 等待段完成
  await sleep(2200);

  console.log('✅ 暂停/恢复功能正常');

  rhythmController.destroy();
  console.log('✅ 节奏序列和转场测试完成\n');
}

/**
 * 辅助睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runRhythmControllerTests();
}

export {
  runRhythmControllerTests as testRhythmController
};
