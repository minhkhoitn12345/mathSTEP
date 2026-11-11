/**
 * MathSTEP Module 3: Lượng Giác - Phần mở rộng "Tự kiến tạo" (ConstructLab)
 * TypeScript Type Definitions
 */

import { AngleUnit, AppMode, CognitiveStep, UserProfile } from './math';

export type StationId = 'KT01' | 'KT02' | 'KT03' | 'KT04' | 'KT05' | 'KT06';
export type ToolId = 'HT01' | 'HT02' | 'HT03';
export type ConstructLabTab = StationId | ToolId;

export type AssistanceLevel = 'scaffolded' | 'independent' | 'assessment';

export type TaskDifficulty = 'scaffolded' | 'independent' | 'transfer' | 'error_detect' | 'boundary';

export interface ExplanationCard {
  id: string;
  type: 'given' | 'condition' | 'prediction' | 'theorem' | 'calculation' | 'conclusion';
  title: string;
  content: string;
  isObservationOnly?: boolean; // flags observational heuristic vs rigorous deductive theorem
  isScaffolded?: boolean;
}

export interface ConstructLabTask {
  id: string;
  stationId: StationId;
  version: number;
  category: TaskDifficulty;
  title: string;
  targetDescription: string;
  curriculumSource: string; // e.g. "SGK KNTT Toán 11 Chuyên đề 1", "Tự biên soạn"
  gradeLevel: '10_review' | '11_core';
  statement: string;
  givenData: Record<string, any>;
  expectedResult: Record<string, any>;
  rubric: {
    criteria: string[];
    maxScore: number;
  };
  socraticHints: {
    H0: string;
    H1: string;
    H2: string;
    H3: string;
    H4: string;
  };
}

export interface StudentConstructionState {
  // KT01
  kt01?: {
    lineType: 'y_level' | 'x_level' | 'origin_slope';
    levelM: number;
    predictedCount: number;
    selectedPoints: { x: number; y: number; angleDeg: number; id: string }[];
    domainCondition?: string;
    remainingValues: {
      cos?: string;
      sin?: string;
      tan?: string;
      cot?: string;
      cosSign?: '+' | '-' | '0' | '±';
      sinSign?: '+' | '-' | '0' | '±';
    };
  };

  // KT02
  kt02?: {
    funcType: 'sin' | 'cos' | 'tan' | 'cot';
    points: { xRad: number; xLabel: string; y: number; predictedY?: number }[];
    symmetryType?: 'none' | 'origin' | 'y_axis';
    periodShift?: number;
    excludedPoints?: number[];
    isComparisonVisible?: boolean;
  };

  // KT03
  kt03?: {
    yMax?: number;
    yMin?: number;
    midlineD?: number;
    amplitudeA?: number;
    periodT?: number;
    frequencyB?: number;
    phaseC?: number;
    chosenFamily?: 'sin' | 'cos';
    proposedFormula?: string;
  };

  // KT04
  kt04?: {
    independentVar: string; // t
    dependentVar: string;   // h
    unitTime: string;       // phút / s
    unitLength: string;     // m / cm
    midlineD: number;
    amplitudeA: number;
    periodT: number;
    omega: number;
    initialH0: number;
    assumptionsList: string[];
    proposedFormula: string;
    verificationPoints: { t: number; expectedH: number; actualH: number; passed: boolean }[];
  };

  // KT05
  kt05?: {
    selectedConditionType: 'denominator_nonzero' | 'radical_nonnegative' | 'tan_argument' | 'cot_argument';
    rawCondition: string;
    excludedAnglesDeg: number[];
    excludedLabels: string[];
    factoringBranches?: string[];
  };

  // KT06
  kt06?: {
    wave1: { a: number; b: number; c: number };
    wave2: { a: number; b: number; c: number };
    probeX: number;
    predictedAmplitude?: number;
    predictedPeriod?: number;
    proposedFormula?: string;
    identityCards?: string[];
  };
}

export interface ConstructLabAttemptRecord {
  schemaVersion: '1.0';
  id: string;
  taskId: string;
  taskVersion: number;
  stationId: StationId;
  profileRef?: string;
  mode: AppMode;
  assistanceLevel: AssistanceLevel;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  prediction: string;
  construction: StudentConstructionState;
  explanationCards: ExplanationCard[];
  studentFreeExplanation: string;
  checks: {
    status: 'correct' | 'partially_correct' | 'incorrect' | 'unverified';
    feedback: string;
    criteriaPassed: string[];
    criteriaFailed: string[];
    timestamp: string;
  };
  assistanceLog: {
    hintsOpened: number; // 0..4
    revealedAnswer: boolean;
    scaffoldingUsed: boolean;
  };
  revisions: Array<{
    revisionId: number;
    timestamp: string;
    construction: StudentConstructionState;
    feedback: string;
  }>;
  status: 'exploring' | 'completed_with_support' | 'mastered_independent' | 'needs_review';
}

export interface ReviewQueueItem {
  id: string;
  taskId: string;
  stationId: StationId;
  taskTitle: string;
  flaggedDate: string;
  scheduledReviewDate: string; // 'next_session' | 'tomorrow' | specific date
  reason: string;
}

export interface AppSnapshot {
  activityId: string;
  step: CognitiveStep;
  mode: AppMode;
  unit: AngleUnit;
  angleDeg: number;
  functionType: string;
  params: { a: number; b: number; c: number; d: number };
  isTaskCollapsed: boolean;
  isControlCollapsed: boolean;
}
