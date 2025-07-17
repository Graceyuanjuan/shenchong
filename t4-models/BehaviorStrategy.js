/**
 * SaintGrid 神宠系统 - 行为策略模式
 * 策略模式封装，支持可扩展的行为决策逻辑
 */
import { PetState, EmotionType } from '../types';
import { BehaviorType } from './BehaviorScheduler';
// 基础行为策略抽象类
export class BaseBehaviorStrategy {
    log(message) {
        console.log(`[策略-${this.name}] ${message}`);
    }
}
// 空闲状态策略
export class IdleStateStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'IdleState';
        this.description = '空闲状态下的行为策略';
        this.priority = 3;
    }
    canApply(context) {
        return context.state === PetState.Idle;
    }
    generateBehaviors(context) {
        const behaviors = [];
        switch (context.emotion) {
            case EmotionType.Happy:
                behaviors.push({
                    type: BehaviorType.IDLE_ANIMATION,
                    priority: 3,
                    duration: 2000,
                    animation: 'happy_idle',
                    message: '😊 神宠正在开心地等待...'
                });
                behaviors.push({
                    type: BehaviorType.EMOTIONAL_EXPRESSION,
                    priority: 2,
                    duration: 1500,
                    message: '✨ 散发着愉悦的光芒'
                });
                break;
            case EmotionType.Excited:
                behaviors.push({
                    type: BehaviorType.IDLE_ANIMATION,
                    priority: 4,
                    duration: 1000,
                    animation: 'excited_idle',
                    message: '🎉 神宠兴奋地期待着互动！'
                });
                behaviors.push({
                    type: BehaviorType.USER_PROMPT,
                    priority: 3,
                    delay: 2000,
                    message: '💫 看起来有什么有趣的事情要发生了！'
                });
                break;
            case EmotionType.Curious:
                behaviors.push({
                    type: BehaviorType.IDLE_ANIMATION,
                    priority: 3,
                    duration: 2500,
                    animation: 'curious_idle',
                    message: '🔍 神宠好奇地观察着周围...'
                });
                break;
            case EmotionType.Sleepy:
                behaviors.push({
                    type: BehaviorType.IDLE_ANIMATION,
                    priority: 2,
                    duration: 4000,
                    animation: 'sleepy_idle',
                    message: '😴 神宠正在打瞌睡...'
                });
                break;
            case EmotionType.Calm:
            default:
                behaviors.push({
                    type: BehaviorType.IDLE_ANIMATION,
                    priority: 2,
                    duration: 3000,
                    animation: 'calm_idle',
                    message: '😌 神宠正在静静地冥想...'
                });
                break;
        }
        return behaviors;
    }
}
// 悬停状态策略
export class HoverStateStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'HoverState';
        this.description = '悬停状态下的交互反馈策略';
        this.priority = 5;
    }
    canApply(context) {
        return context.state === PetState.Hover;
    }
    generateBehaviors(context) {
        const behaviors = [];
        switch (context.emotion) {
            case EmotionType.Happy:
                behaviors.push({
                    type: BehaviorType.HOVER_FEEDBACK,
                    priority: 5,
                    duration: 800,
                    animation: 'happy_hover',
                    message: '😊 神宠感受到了你的关注！'
                });
                break;
            case EmotionType.Excited:
                behaviors.push({
                    type: BehaviorType.HOVER_FEEDBACK,
                    priority: 6,
                    duration: 600,
                    animation: 'excited_hover',
                    message: '🎉 神宠兴奋地迎接你的互动！'
                });
                behaviors.push({
                    type: BehaviorType.USER_PROMPT,
                    priority: 4,
                    delay: 1000,
                    message: '✨ 点击我来开始对话吧！'
                });
                break;
            case EmotionType.Curious:
                behaviors.push({
                    type: BehaviorType.HOVER_FEEDBACK,
                    priority: 4,
                    duration: 1000,
                    animation: 'curious_hover',
                    message: '🔍 神宠好奇地看着你...'
                });
                break;
            case EmotionType.Sleepy:
                behaviors.push({
                    type: BehaviorType.HOVER_FEEDBACK,
                    priority: 2,
                    duration: 1500,
                    animation: 'sleepy_hover',
                    message: '😴 神宠迷迷糊糊地注意到了你'
                });
                break;
            case EmotionType.Calm:
            default:
                behaviors.push({
                    type: BehaviorType.HOVER_FEEDBACK,
                    priority: 3,
                    duration: 1200,
                    animation: 'calm_hover',
                    message: '😌 神宠平静地回应你的注视'
                });
                break;
        }
        return behaviors;
    }
}
// 唤醒状态策略
export class AwakenStateStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'AwakenState';
        this.description = '唤醒状态下的激活响应策略';
        this.priority = 7;
    }
    canApply(context) {
        return context.state === PetState.Awaken;
    }
    generateBehaviors(context) {
        const behaviors = [];
        switch (context.emotion) {
            case EmotionType.Happy:
                behaviors.push({
                    type: BehaviorType.AWAKEN_RESPONSE,
                    priority: 7,
                    duration: 1000,
                    animation: 'happy_awaken',
                    message: '😊 神宠开心地醒来了！'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 6,
                    delay: 500,
                    message: '🔌 启动互动插件...',
                    metadata: { triggerType: 'happy_awaken' }
                });
                break;
            case EmotionType.Excited:
                behaviors.push({
                    type: BehaviorType.AWAKEN_RESPONSE,
                    priority: 8,
                    duration: 800,
                    animation: 'excited_awaken',
                    message: '🎉 神宠兴奋地跳起来！'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 7,
                    delay: 200,
                    message: '⚡ 快速启动所有功能！',
                    metadata: { triggerType: 'excited_awaken' }
                });
                break;
            case EmotionType.Curious:
                behaviors.push({
                    type: BehaviorType.AWAKEN_RESPONSE,
                    priority: 6,
                    duration: 1200,
                    animation: 'curious_awaken',
                    message: '🔍 神宠好奇地被唤醒'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 5,
                    delay: 800,
                    message: '🔍 启动探索插件...',
                    pluginId: 'screenshot',
                    metadata: { triggerType: 'curious_awaken' }
                });
                break;
            case EmotionType.Sleepy:
                behaviors.push({
                    type: BehaviorType.AWAKEN_RESPONSE,
                    priority: 3,
                    duration: 2000,
                    animation: 'sleepy_awaken',
                    message: '😴 神宠慢慢地醒来...'
                });
                break;
            case EmotionType.Calm:
            default:
                behaviors.push({
                    type: BehaviorType.AWAKEN_RESPONSE,
                    priority: 5,
                    duration: 1500,
                    animation: 'calm_awaken',
                    message: '😌 神宠平静地被唤醒'
                });
                break;
        }
        return behaviors;
    }
}
// 控制状态策略
export class ControlStateStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'ControlState';
        this.description = '控制状态下的功能激活策略';
        this.priority = 8;
    }
    canApply(context) {
        return context.state === PetState.Control;
    }
    generateBehaviors(context) {
        const behaviors = [];
        switch (context.emotion) {
            case EmotionType.Happy:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 8,
                    duration: 1200,
                    animation: 'happy_control',
                    message: '😊 神宠开心地进入控制模式！'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 7,
                    delay: 300,
                    message: '🎮 启动控制面板...',
                    metadata: { triggerType: 'happy_control' }
                });
                break;
            case EmotionType.Excited:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 9,
                    duration: 1000,
                    animation: 'excited_control',
                    message: '🎉 神宠兴奋地进入超级控制模式！'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 8,
                    delay: 100,
                    message: '🚀 所有系统全速启动！',
                    metadata: { triggerType: 'excited_control' }
                });
                break;
            case EmotionType.Curious:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 7,
                    duration: 1300,
                    animation: 'curious_control',
                    message: '🔍 神宠好奇地探索控制选项'
                });
                break;
            case EmotionType.Focused:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 8,
                    duration: 1000,
                    animation: 'focused_control',
                    message: '🎯 神宠专注地进入工作模式'
                });
                behaviors.push({
                    type: BehaviorType.PLUGIN_TRIGGER,
                    priority: 7,
                    delay: 200,
                    message: '⚡ 启动专业工具...',
                    metadata: { triggerType: 'focused_control' }
                });
                break;
            case EmotionType.Sleepy:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 4,
                    duration: 2000,
                    animation: 'sleepy_control',
                    message: '😴 神宠困倦地进入控制模式...'
                });
                break;
            case EmotionType.Calm:
            default:
                behaviors.push({
                    type: BehaviorType.CONTROL_ACTIVATION,
                    priority: 6,
                    duration: 1500,
                    animation: 'calm_control',
                    message: '😌 神宠平静地进入控制模式'
                });
                break;
        }
        return behaviors;
    }
}
// 情绪驱动策略
export class EmotionDrivenStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'EmotionDriven';
        this.description = '基于情绪强度的补充行为策略';
        this.priority = 2;
    }
    canApply(context) {
        // 当情绪强度较高时触发
        return context.emotionContext?.intensity !== undefined && context.emotionContext.intensity > 0.7;
    }
    generateBehaviors(context) {
        const behaviors = [];
        const intensity = context.emotionContext?.intensity || 0.5;
        if (intensity > 0.8) {
            // 高强度情绪表达
            behaviors.push({
                type: BehaviorType.EMOTIONAL_EXPRESSION,
                priority: 9,
                duration: Math.floor(intensity * 2000),
                message: `💫 神宠的${context.emotion}情绪非常强烈！`,
                metadata: {
                    emotionIntensity: intensity,
                    expressionLevel: 'intense'
                }
            });
        }
        // 根据情绪类型添加特殊行为
        if (context.emotion === EmotionType.Excited && intensity > 0.7) {
            behaviors.push({
                type: BehaviorType.ANIMATION_SEQUENCE,
                priority: 6,
                duration: 3000,
                animation: 'excitement_burst',
                message: '🎆 神宠兴奋得快要飞起来了！'
            });
        }
        return behaviors;
    }
}
// 时间感知策略
export class TimeAwareStrategy extends BaseBehaviorStrategy {
    constructor() {
        super(...arguments);
        this.name = 'TimeAware';
        this.description = '基于时间和用户活动的适应性策略';
        this.priority = 1;
    }
    canApply(context) {
        return context.environmentFactors?.timeOfDay !== undefined;
    }
    generateBehaviors(context) {
        const behaviors = [];
        const timeOfDay = context.environmentFactors?.timeOfDay;
        // 根据时间段调整行为
        switch (timeOfDay) {
            case 'morning':
                if (context.state === PetState.Idle) {
                    behaviors.push({
                        type: BehaviorType.USER_PROMPT,
                        priority: 4,
                        delay: 5000,
                        message: '🌅 早上好！准备开始新的一天了吗？'
                    });
                }
                break;
            case 'night':
                if (context.emotion !== EmotionType.Sleepy) {
                    behaviors.push({
                        type: BehaviorType.MOOD_TRANSITION,
                        priority: 3,
                        duration: 2000,
                        message: '🌙 夜深了，神宠开始感到困倦...',
                        metadata: { targetEmotion: EmotionType.Sleepy }
                    });
                }
                break;
        }
        return behaviors;
    }
}
// 策略管理器
export class StrategyManager {
    constructor() {
        this.strategies = [];
        this.initializeDefaultStrategies();
    }
    initializeDefaultStrategies() {
        this.strategies = [
            new IdleStateStrategy(),
            new HoverStateStrategy(),
            new AwakenStateStrategy(),
            new ControlStateStrategy(),
            new EmotionDrivenStrategy(),
            new TimeAwareStrategy()
        ];
        // 按优先级排序
        this.strategies.sort((a, b) => b.priority - a.priority);
        console.log('🎯 策略管理器初始化完成，加载策略：', this.strategies.map(s => s.name));
    }
    /**
     * 注册新策略
     */
    registerStrategy(strategy) {
        this.strategies.push(strategy);
        this.strategies.sort((a, b) => b.priority - a.priority);
        console.log(`🎯 注册新策略: ${strategy.name} (优先级: ${strategy.priority})`);
    }
    /**
     * 移除策略
     */
    removeStrategy(name) {
        const index = this.strategies.findIndex(s => s.name === name);
        if (index !== -1) {
            this.strategies.splice(index, 1);
            console.log(`🎯 移除策略: ${name}`);
        }
    }
    /**
     * 获取适用的策略并生成行为
     */
    generateBehaviors(context) {
        const allBehaviors = [];
        const appliedStrategies = [];
        for (const strategy of this.strategies) {
            if (strategy.canApply(context)) {
                const behaviors = strategy.generateBehaviors(context);
                allBehaviors.push(...behaviors);
                appliedStrategies.push(strategy.name);
            }
        }
        console.log(`🎯 应用策略: [${appliedStrategies.join(', ')}]，生成行为数量: ${allBehaviors.length}`);
        // 按优先级排序并去重
        return this.prioritizeAndDeduplicateBehaviors(allBehaviors);
    }
    /**
     * 行为优先级排序和去重
     */
    prioritizeAndDeduplicateBehaviors(behaviors) {
        // 按优先级排序
        behaviors.sort((a, b) => b.priority - a.priority);
        // 去重：相同类型的行为只保留优先级最高的
        const uniqueBehaviors = new Map();
        for (const behavior of behaviors) {
            if (!uniqueBehaviors.has(behavior.type) ||
                uniqueBehaviors.get(behavior.type).priority < behavior.priority) {
                uniqueBehaviors.set(behavior.type, behavior);
            }
        }
        return Array.from(uniqueBehaviors.values());
    }
    /**
     * 获取所有策略信息
     */
    getStrategies() {
        return this.strategies.map(s => ({
            name: s.name,
            description: s.description,
            priority: s.priority
        }));
    }
}
//# sourceMappingURL=BehaviorStrategy.js.map