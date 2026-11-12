export type Visibility = "private" | "class" | "public";
export type AITutorMode = "full" | "limited" | "disabled";
export type Question3DType = "point-click" | "slider" | "multiple-choice" | "written";

export interface CameraStep {
  id: string;
  title: string;
  camera: { position: [number, number, number]; target: [number, number, number] };
  visibleObjects: string[];
  narration: string;
}

export interface StudentProgress {
  studentId: string;
  name: string;
  completedLessons: number;
  averageScore: number;
  threeDInteractionRate: number;
  hintsUsed: number;
  spatialErrors: string[];
  topicAccuracy: Record<string, number>;
}

export interface Classroom {
  id: string;
  name: string;
  gradeLevel: string;
  inviteCode: string;
  teacherId: string;
  studentCount: number;
  createdAt: string;
  students: StudentProgress[];
}

export interface InteractiveLesson {
  id: string;
  title: string;
  topicId: string;
  sceneJson: Record<string, unknown>;
  cameraSteps: CameraStep[];
  visibility: Visibility;
  updatedAt: string;
}

export interface Question3D {
  id: string;
  type: Question3DType;
  prompt: string;
  modelId: string;
  options?: string[];
  answer?: string;
  sliderRange?: [number, number];
  targetValue?: number;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  questions: Question3D[];
  aiTutorMode: AITutorMode;
  dueDate: string;
  maxAttempts: number;
  createdAt: string;
}

export interface ActionLog {
  id: string;
  action: string;
  target: string;
  correct: boolean;
  at: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  score: number;
  threeDActionLogs: ActionLog[];
  hintsUsedCount: number;
  submittedAt: string;
}

export interface TeacherWorkspaceState {
  classes: Classroom[];
  lessons: InteractiveLesson[];
  assignments: Assignment[];
  submissions: StudentSubmission[];
  activeModel: { kind: string; cutRatio: number; height: number; radius: number; edgeStyles: Record<string, string> };
}
