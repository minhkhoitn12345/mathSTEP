import type { Assignment, Classroom, InteractiveLesson, StudentSubmission, TeacherWorkspaceState } from "@/app/types/teacher";

const now = "2026-11-12T09:00:00.000Z";

export const mockClassrooms: Classroom[] = [
  {
    id: "class-11a1", name: "11A1 · Chuyên Toán", gradeLevel: "11", inviteCode: "MS-8492", teacherId: "teacher-demo", studentCount: 3, createdAt: now,
    students: [
      { studentId: "hs-001", name: "Nguyễn Minh An", completedLessons: 12, averageScore: 86, threeDInteractionRate: 92, hintsUsed: 1, spatialErrors: [], topicAccuracy: { "Hình học không gian": 90, "Lượng giác": 82, "Conic": 78, "Hàm số": 94 } },
      { studentId: "hs-002", name: "Trần Gia Huy", completedLessons: 9, averageScore: 74, threeDInteractionRate: 48, hintsUsed: 4, spatialErrors: ["Chọn sai chân đường cao SH", "Nhầm góc giữa đường thẳng và mặt phẳng"], topicAccuracy: { "Hình học không gian": 52, "Lượng giác": 82, "Conic": 70, "Hàm số": 91 } },
      { studentId: "hs-003", name: "Lê Khánh Linh", completedLessons: 14, averageScore: 93, threeDInteractionRate: 88, hintsUsed: 2, spatialErrors: [], topicAccuracy: { "Hình học không gian": 86, "Lượng giác": 96, "Conic": 91, "Hàm số": 99 } },
    ],
  },
  {
    id: "class-12a2", name: "12A2 · Ôn thi THPT", gradeLevel: "12", inviteCode: "MS-2631", teacherId: "teacher-demo", studentCount: 2, createdAt: now,
    students: [
      { studentId: "hs-004", name: "Phạm Quỳnh Anh", completedLessons: 18, averageScore: 89, threeDInteractionRate: 84, hintsUsed: 1, spatialErrors: [], topicAccuracy: { "Hình học không gian": 84, "Lượng giác": 91, "Conic": 90, "Hàm số": 92 } },
      { studentId: "hs-005", name: "Đỗ Đức Thành", completedLessons: 7, averageScore: 61, threeDInteractionRate: 35, hintsUsed: 5, spatialErrors: ["Xác định sai giao tuyến hai mặt phẳng", "Chưa nhận ra mặt phẳng song song đáy"], topicAccuracy: { "Hình học không gian": 44, "Lượng giác": 73, "Conic": 65, "Hàm số": 76 } },
    ],
  },
];

export const mockLessons: InteractiveLesson[] = [
  { id: "lesson-vector-box", title: "Quy tắc hình hộp và tổng véc-tơ", topicId: "spatial_geometry", sceneJson: { model: "cuboid", labels: ["A", "B", "C", "D", "A′", "B′", "C′", "D′"] }, visibility: "private", updatedAt: now, cameraSteps: [
    { id: "step-1", title: "Quan sát hình hộp", camera: { position: [5, 4, 6], target: [0, 1, 0] }, visibleObjects: ["faces", "edges"], narration: "Nhận diện các đỉnh và ba véc-tơ cùng gốc A." },
    { id: "step-2", title: "Tách các véc-tơ", camera: { position: [6, 3, 5], target: [0, 1, 0] }, visibleObjects: ["AB", "AD", "AA′"], narration: "Biểu diễn véc-tơ đường chéo bằng tổng ba véc-tơ cạnh." },
  ] },
  { id: "lesson-pyramid-cut", title: "Thiết diện song song với đáy", topicId: "spatial_geometry", sceneJson: { model: "pyramidCut", cutRatio: 0.52 }, visibility: "class", updatedAt: now, cameraSteps: [
    { id: "step-1", title: "Dựng điểm M", camera: { position: [5, 4, 6], target: [0, 1, 0] }, visibleObjects: ["S", "A", "B", "C", "D", "M"], narration: "Chọn M trên cạnh SA và giữ tỉ số SM/SA cố định." },
  ] },
];

export const mockAssignments: Assignment[] = [
  { id: "assignment-spatial-01", classId: "class-11a1", title: "Góc và đường vuông góc trong hình chóp", questions: [
    { id: "q1", type: "point-click", prompt: "Chọn chân đường vuông góc kẻ từ S xuống mặt phẳng đáy.", modelId: "pyramid4", answer: "H" },
    { id: "q2", type: "multiple-choice", prompt: "Góc giữa đường thẳng SA và mặt phẳng đáy được biểu diễn bởi góc nào?", modelId: "pyramid4", options: ["SAB", "SAH", "ASH", "ABC"], answer: "SAH" },
  ], aiTutorMode: "limited", dueDate: "2026-11-20", maxAttempts: 2, createdAt: now },
  { id: "assignment-cut-01", classId: "class-12a2", title: "Tỉ số và diện tích thiết diện", questions: [
    { id: "q3", type: "slider", prompt: "Điều chỉnh tỉ số k để diện tích thiết diện bằng 1/4 diện tích đáy.", modelId: "pyramidCut", sliderRange: [0.05, 0.95], targetValue: 0.5 },
  ], aiTutorMode: "disabled", dueDate: "2026-11-25", maxAttempts: 1, createdAt: now },
];

export const mockSubmissions: StudentSubmission[] = [
  { id: "submission-001", assignmentId: "assignment-spatial-01", studentId: "hs-001", score: 90, hintsUsedCount: 1, submittedAt: now, threeDActionLogs: [{ id: "log-1", action: "select-point", target: "H", correct: true, at: now }] },
  { id: "submission-002", assignmentId: "assignment-spatial-01", studentId: "hs-002", score: 60, hintsUsedCount: 4, submittedAt: now, threeDActionLogs: [{ id: "log-2", action: "select-point", target: "A", correct: false, at: now }, { id: "log-3", action: "select-angle", target: "SAB", correct: false, at: now }] },
];

export const initialTeacherWorkspace: TeacherWorkspaceState = {
  classes: mockClassrooms,
  lessons: mockLessons,
  assignments: mockAssignments,
  submissions: mockSubmissions,
  activeModel: { kind: "pyramidCut", cutRatio: 0.52, height: 2.8, radius: 1.5, edgeStyles: {} },
};
