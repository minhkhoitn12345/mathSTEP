/**
 * MathSTEP Module 3: Lượng Giác
 * Type Definitions & Data Contracts
 */

export type AngleUnit = 'deg' | 'rad';

export type AppMode = 'presentation' | 'guided' | 'assessment';

export type CognitiveStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type FunctionType = 'sin' | 'cos' | 'tan' | 'cot';

export type QuadrantType = 'I' | 'II' | 'III' | 'IV' | 'axis';

export type ExactnessType = 'exact' | 'approximate' | 'undefined' | 'indeterminate' | 'unsupported';

export interface ExactFraction {
  num: bigint;
  den: bigint;
}

export interface ExactAngle {
  rawInput: string;
  unit: AngleUnit;
  // In degrees: value = num/den degrees
  degFraction: ExactFraction;
  // In radians: value = (num/den) * PI radians
  radPiFraction: ExactFraction;
  // Decimal approx
  degDecimal: number;
  radDecimal: number;
  // Accumulated angle (total with multi-turns)
  accumulatedDeg: number;
  accumulatedRad: number;
  // Turn count: trunc(alpha / 360) or trunc(alpha / 2pi)
  turnCount: number;
  // Signed remainder: alpha - 360*n or alpha - 2pi*n
  signedRemainderDeg: number;
  signedRemainderRad: number;
  // Representative angle in [0, 360) or [0, 2pi)
  representativeDeg: number;
  representativeRad: number;
  // Quadrant or axis
  quadrant: QuadrantType;
  axisName?: '+Ox' | '+Oy' | '-Ox' | '-Oy';
}

export interface TrigValueResult {
  exact: string; // e.g. "√3/2", "-1/2", "0", "Không xác định"
  approx: number | null;
  exactness: ExactnessType;
  isUndefined: boolean;
  explanation: string;
}

export interface TrigValues {
  sin: TrigValueResult;
  cos: TrigValueResult;
  tan: TrigValueResult;
  cot: TrigValueResult;
}

export interface FunctionParams {
  a: number; // Amplitude / vertical scale
  b: number; // Frequency
  c: number; // Phase shift in radians
  d: number; // Vertical shift
}

export interface TableRow {
  id: string;
  x: number; // in radians
  xFormatted: string;
  fx: number | null;
  fxFormatted: string;
  isUndefined?: boolean;
}

export type ActivityId =
  | 'LG01'
  | 'LG02'
  | 'LG03'
  | 'LG04'
  | 'LG05'
  | 'LG06'
  | 'LG07'
  | 'LG08'
  | 'LG09'
  | 'LG10'
  | 'LG11'
  | 'LG12'
  | 'LG13';

export type ErrorCode =
  | 'E01'
  | 'E02'
  | 'E03'
  | 'E04'
  | 'E05'
  | 'E06'
  | 'E07'
  | 'E08'
  | 'E09'
  | 'E10'
  | 'E11'
  | 'E12'
  | 'E13'
  | 'E14'
  | 'E15'
  | 'E16';

export type HintLevel = 'H0' | 'H1' | 'H2' | 'H3' | 'H4';

export interface HintSpec {
  level: HintLevel;
  title: string;
  content: string;
  subTaskQuestion?: string;
}

export interface ActivityMeta {
  id: ActivityId;
  title: string;
  cluster: string;
  targetCompetency: string;
  description: string;
  defaultAngle: number; // degrees
  formulaAnchor: string;
  suggestedErrors: ErrorCode[];
}

export interface UserProfile {
  id: string;
  name: string;
  studentCode: string;
  className: string;
  role: 'student' | 'teacher';
  avatarSeed?: string;
  isDemo?: boolean;
}

export interface ClassGroup {
  id: string;
  name: string;
  school: string;
  academicYear: string;
}

export interface AttemptLog {
  id: string;
  profileId: string;
  activityId: ActivityId;
  taskId?: string;
  mode: AppMode;
  step: CognitiveStep;
  prediction: string;
  observation: string;
  explanation: string;
  checkResult?: {
    status: 'correct' | 'incorrect' | 'partial' | 'unverified';
    feedback: string;
    identifiedErrors: ErrorCode[];
  };
  revisionNotes?: string;
  hintsUsed: HintLevel[];
  timestamp: number;
  submitted: boolean;
}

export interface QuestionItem {
  id: string;
  version: number;
  activityId: ActivityId;
  title: string;
  statement: string;
  type: 'multiple_choice' | 'exact_input' | 'point_selection' | 'pairing' | 'step_selection' | 'essay';
  parameters?: Record<string, any>;
  domain?: string;
  options?: { id: string; label: string; isCorrect?: boolean; explanation?: string }[];
  answerSpec?: any;
  solution: string;
  rubric?: string;
  errorCodes: ErrorCode[];
  hints: HintSpec[];
  transferTaskId?: string;
  source: string;
  reviewStatus: 'approved' | 'draft' | 'needs_review';
}

export interface TestCaseResult {
  id: string;
  category: 'math' | 'functional';
  title: string;
  inputDesc: string;
  expected: string;
  actual: string;
  passed: boolean;
  durationMs: number;
  notes?: string;
}
