// Re-export all types from BehaviorRhythm.d.ts
export * from './BehaviorRhythm.d';

// 提供常量的实际实现
export const RhythmMode = {
  STEADY: 'steady' as const,
  PULSE: 'pulse' as const,
  SEQUENCE: 'sequence' as const,
  ADAPTIVE: 'adaptive' as const,
  SYNC: 'sync' as const
} as const;

export const RhythmIntensity = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  BURST: 'burst' as const
} as const;
