"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Edges, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, Box, ChevronRight, ClipboardList, Download, FileJson, GraduationCap, LoaderCircle, LogOut, Plus, Presentation, Printer, Save, Settings2, Users } from "lucide-react";
import { MathFormattedText } from "@/app/components/KatexMath";
import { initialTeacherWorkspace } from "@/app/data/teacherMockData";
import type { AITutorMode, Assignment, CameraStep, Classroom, InteractiveLesson, Question3D, TeacherWorkspaceState, Visibility } from "@/app/types/teacher";

type Section = "lop-hoc" | "soan-bai" | "bai-tap" | "xuat-de" | "cai-dat";
const STORAGE_KEY = "mathstep.teacher.workspace.v1";
const sections: { id: Section; label: string; icon: typeof Users }[] = [
  { id: "lop-hoc", label: "Lớp học", icon: Users },
  { id: "soan-bai", label: "Soạn học liệu 3D", icon: Box },
  { id: "bai-tap", label: "Bài tập", icon: ClipboardList },
  { id: "xuat-de", label: "Xuất đề", icon: Printer },
  { id: "cai-dat", label: "Cài đặt", icon: Settings2 },
];
const topicNames = ["Hàm số", "Hình học không gian", "Lượng giác", "Conic"];

function newId(prefix: string) { return `${prefix}-${crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`; }

function ModelPreview({ kind, height, radius, cutRatio, examMode, slide, onCanvas }: { kind: string; height: number; radius: number; cutRatio: number; examMode?: boolean; slide?: CameraStep; onCanvas?: (canvas: HTMLCanvasElement) => void }) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (group.current && !slide) group.current.rotation.y += delta * 0.1; });
  const black = Boolean(examMode);
  const cameraPosition = slide?.camera.position ?? [5, 4, 6];
  const facesColor = black ? "#ffffff" : "#70c7c0";
  const bodyGeometry = useMemo(() => kind === "cuboid" || kind === "cube" ? new THREE.BoxGeometry(radius * 1.7, height, radius * 1.4) : new THREE.ConeGeometry(radius, height, 4), [height, kind, radius]);
  useEffect(() => () => bodyGeometry.dispose(), [bodyGeometry]);
  return <Canvas camera={{ position: cameraPosition, fov: 42 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} onCreated={({ gl }) => onCanvas?.(gl.domElement)}>
    <color attach="background" args={[black ? "#ffffff" : "#101a2d"]}/>
    <ambientLight intensity={1.7}/><directionalLight position={[4, 7, 5]} intensity={1.6}/>
    <group ref={group} position={[0, -0.25, 0]}>
      <mesh geometry={bodyGeometry} position={[0, height / 2, 0]} renderOrder={1}><meshBasicMaterial color={facesColor} transparent opacity={black ? 0 : 0.18} depthTest depthWrite={false} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/><Edges color={black ? "#000000" : "#a5f3fc"} linewidth={2}/></mesh>
      <mesh geometry={bodyGeometry} position={[0, height / 2, 0]} renderOrder={0}><meshBasicMaterial colorWrite={false} depthTest depthWrite side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={1} polygonOffsetUnits={1}/></mesh>
      {!(kind === "cuboid" || kind === "cube") && <>
        {kind === "pyramidCut" && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, height * (1 - cutRatio), 0]}><circleGeometry args={[radius * cutRatio * 1.15, 4]}/><meshBasicMaterial color={black ? "#ffffff" : "#fb7185"} transparent opacity={black ? 0 : 0.5} side={THREE.DoubleSide} depthWrite={false}/><Edges color={black ? "#000000" : "#fb7185"} linewidth={2}/></mesh>}
      </>}
      {[[0, 0, 0], [radius, 0, 0], [0, 0, radius], [-radius, 0, 0], [0, 0, -radius], [0, height, 0]].map((point, i) => <mesh key={i} position={point as [number, number, number]}><sphereGeometry args={[0.045, 12, 8]}/><meshBasicMaterial color={black ? "#000000" : "#fbbf24"}/></mesh>)}
    </group>
    <OrbitControls makeDefault enableDamping dampingFactor={0.08}/>
  </Canvas>;
}

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function TeacherWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const requested = pathname.split("/")[2] as Section | undefined;
  const section: Section = sections.some(item => item.id === requested) ? requested! : "lop-hoc";
  const [workspace, setWorkspace] = useState<TeacherWorkspaceState>(initialTeacherWorkspace);
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [teacherName, setTeacherName] = useState("Giáo viên MathSTEP");
  const [cloudStatus, setCloudStatus] = useState("Đang tải dữ liệu");
  const [selectedClassId, setSelectedClassId] = useState(initialTeacherWorkspace.classes[0]?.id ?? "");
  const [className, setClassName] = useState("");
  const [grade, setGrade] = useState("11");
  const [prompt, setPrompt] = useState("");
  const [parseMessage, setParseMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [presenter, setPresenter] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [lessonTitle, setLessonTitle] = useState("Học liệu hình học không gian mới");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [questionType, setQuestionType] = useState<Question3D["type"]>("point-click");
  const [questionPrompt, setQuestionPrompt] = useState("");
  const [answerTarget, setAnswerTarget] = useState("H");
  const [choiceOptions, setChoiceOptions] = useState("Phương án A | Phương án B | Phương án C | Phương án D");
  const [choiceAnswer, setChoiceAnswer] = useState("Phương án A");
  const [sliderTarget, setSliderTarget] = useState(0.5);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [aiMode, setAiMode] = useState<AITutorMode>("full");
  const [dueDate, setDueDate] = useState("2026-11-30");
  const [examMode, setExamMode] = useState(true);
  const [labelSize, setLabelSize] = useState(18);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const dirtyRef = useRef(false);
  const updateWorkspace = useCallback((update: (state: TeacherWorkspaceState) => TeacherWorkspaceState) => {
    dirtyRef.current = true;
    setCloudStatus("Có thay đổi chưa đồng bộ");
    setWorkspace(update);
  }, []);

  useEffect(() => {
    let active = true;
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try { const parsed = JSON.parse(cached) as TeacherWorkspaceState; if (parsed.classes && parsed.lessons && parsed.assignments) setWorkspace(parsed); } catch { localStorage.removeItem(STORAGE_KEY); }
    }
    void (async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionResponse.json() as { authenticated?: boolean; role?: string; name?: string | null };
        if (!active) return;
        const isTeacher = session.authenticated && (session.role === "teacher" || session.role === "admin");
        setAuthorized(Boolean(isTeacher));
        if (session.name) setTeacherName(session.name);
        if (isTeacher) {
          const response = await fetch("/api/teacher/workspace", { cache: "no-store" });
          const payload = await response.json() as { workspace?: TeacherWorkspaceState | null };
          if (response.ok && payload.workspace && active) { setWorkspace(payload.workspace); setCloudStatus("Đã tải dữ liệu đồng bộ"); }
          else if (active) setCloudStatus("Bản nháp đang lưu trên thiết bị");
        }
      } catch { if (active) { setAuthorized(false); setCloudStatus("Chưa kết nối được máy chủ"); } }
      finally { if (active) setReady(true); }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    if (!dirtyRef.current || !authorized) return;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/teacher/workspace", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workspace }) });
        if (!response.ok) throw new Error("sync failed");
        dirtyRef.current = false; setCloudStatus("Đã đồng bộ với máy chủ");
      } catch { setCloudStatus("Đã lưu trên thiết bị, chưa đồng bộ máy chủ"); }
    }, 900);
    return () => window.clearTimeout(timer);
  }, [workspace, ready, authorized]);

  const currentClass = workspace.classes.find(item => item.id === selectedClassId) ?? workspace.classes[0];
  const activeLesson = workspace.lessons[0];
  const activeSlide = activeLesson?.cameraSteps[Math.min(slideIndex, Math.max(0, activeLesson.cameraSteps.length - 1))];
  const allStudents = workspace.classes.flatMap(item => item.students);
  const blindSpots = allStudents.filter(student => student.spatialErrors.length || student.hintsUsed > 3);
  const questionCount = workspace.assignments.reduce((sum, item) => sum + item.questions.length, 0);

  const createClassroom = () => {
    if (!className.trim()) return;
    const code = `MS-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const classroom: Classroom = { id: newId("class"), name: className.trim(), gradeLevel: grade, inviteCode: code, teacherId: "current-teacher", studentCount: 0, createdAt: new Date().toISOString(), students: [] };
    updateWorkspace(state => ({ ...state, classes: [classroom, ...state.classes] })); setSelectedClassId(classroom.id); setClassName("");
  };

  const analyzePrompt = async () => {
    if (!prompt.trim()) { setParseMessage("Nhập đề bài để bắt đầu dựng hình."); return; }
    setBusy(true); setParseMessage("");
    try {
      const response = await fetch("/api/spatial-geometry/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const result = await response.json() as { problem?: { problemMetadata?: { title?: string; topic?: string }; geometry?: { type?: string }; sceneConfig?: unknown }; detail?: { message?: string } };
      if (!response.ok || !result.problem) throw new Error(result.detail?.message || "Chưa phân tích được đề. Hãy kiểm tra cấu hình Gemini.");
      const title = result.problem.problemMetadata?.title || prompt.slice(0, 72);
      const lesson: InteractiveLesson = { id: newId("lesson"), title, topicId: "spatial_geometry", sceneJson: result.problem as unknown as Record<string, unknown>, cameraSteps: [{ id: newId("step"), title: "Quan sát mô hình", camera: { position: [5, 4, 6], target: [0, 1, 0] }, visibleObjects: ["vertices", "edges", "faces"], narration: result.problem.problemMetadata?.topic || "Nhận diện đỉnh, cạnh, mặt và các quan hệ hình học." }], visibility, updatedAt: new Date().toISOString() };
      updateWorkspace(state => ({ ...state, lessons: [lesson, ...state.lessons] }));
      if (result.problem.geometry?.type) updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, kind: result.problem!.geometry!.type! } }));
      setLessonTitle(title); setSlideIndex(0); setParseMessage("Đã dựng bản nháp hình học. Kiểm tra giả thiết và các đỉnh trước khi dùng trên lớp.");
    } catch (error) { setParseMessage(error instanceof Error ? error.message : "Không phân tích được đề bài."); }
    finally { setBusy(false); }
  };

  const saveLesson = () => {
    const lesson: InteractiveLesson = { id: newId("lesson"), title: lessonTitle.trim() || "Học liệu hình học", topicId: "spatial_geometry", sceneJson: { ...workspace.activeModel }, cameraSteps: activeLesson?.cameraSteps ?? [], visibility, updatedAt: new Date().toISOString() };
    updateWorkspace(state => ({ ...state, lessons: [lesson, ...state.lessons] })); setParseMessage("Đã lưu học liệu và các bước trình chiếu.");
  };
  const addSlide = () => {
    const step: CameraStep = { id: newId("step"), title: `Bước ${(activeLesson?.cameraSteps.length ?? 0) + 1}`, camera: { position: [5, 4, 6], target: [0, 1, 0] }, visibleObjects: ["vertices", "edges", "faces"], narration: "Thêm lời dẫn cho bước dựng hình này." };
    const lesson: InteractiveLesson = { id: activeLesson?.id ?? newId("lesson"), title: lessonTitle, topicId: "spatial_geometry", sceneJson: { ...workspace.activeModel }, cameraSteps: [...(activeLesson?.cameraSteps ?? []), step], visibility, updatedAt: new Date().toISOString() };
    updateWorkspace(state => ({ ...state, lessons: [lesson, ...state.lessons.filter(item => item.id !== lesson.id)] })); setSlideIndex(lesson.cameraSteps.length - 1);
  };
  const addAssignment = () => {
    if (!assignmentTitle.trim() || !questionPrompt.trim() || !currentClass) return;
    const question: Question3D = { id: newId("question"), type: questionType, prompt: questionPrompt.trim(), modelId: workspace.activeModel.kind, ...(questionType === "point-click" ? { answer: answerTarget } : {}), ...(questionType === "multiple-choice" ? { options: choiceOptions.split("|").map(option => option.trim()).filter(Boolean).slice(0, 4), answer: choiceAnswer } : {}), ...(questionType === "slider" ? { sliderRange: [0.05, 0.95] as [number, number], targetValue: sliderTarget } : {}) };
    const assignment: Assignment = { id: newId("assignment"), classId: currentClass.id, title: assignmentTitle.trim(), questions: [question], aiTutorMode: aiMode, dueDate, maxAttempts, createdAt: new Date().toISOString() };
    updateWorkspace(state => ({ ...state, assignments: [assignment, ...state.assignments] })); setAssignmentTitle(""); setQuestionPrompt("");
  };

  const exportRoster = () => {
    const rows = [["Họ tên", "Mã học sinh", "Bài hoàn thành", "Điểm trung bình", "Tương tác 3D (%)"], ...allStudents.map(student => [student.name, student.studentId, String(student.completedLessons), String(student.averageScore), String(student.threeDInteractionRate)])];
    const csv = "\uFEFF" + rows.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    downloadFile("bao-cao-lop-hoc.csv", csv, "text/csv;charset=utf-8");
  };
  const exportWorkspace = () => downloadFile("mathstep-teacher-workspace.json", JSON.stringify(workspace, null, 2), "application/json");
  const exportSvg = () => {
    const stroke = examMode ? "#000" : "#0f766e";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="${examMode ? "white" : "#101a2d"}"/><g fill="none" stroke="${stroke}" stroke-width="${workspace.activeModel.edgeStyles.width || 2}"><path d="M600 110 840 600 360 600Z M600 110 600 450 M360 600 600 450 840 600"/><path d="M450 500 750 500" stroke-dasharray="10 8"/></g><g fill="${stroke}" font-family="Arial" font-size="${labelSize}"><text x="590" y="95">S</text><text x="342" y="624">A</text><text x="844" y="624">B</text><text x="588" y="470">H</text></g></svg>`;
    downloadFile("hinh-hoc-de-kiem-tra.svg", svg, "image/svg+xml");
  };
  const exportPng = () => { if (!canvasElement) return; const anchor = document.createElement("a"); anchor.download = "hinh-hoc-mathstep.png"; anchor.href = canvasElement.toDataURL("image/png"); anchor.click(); };
  const copyToWord = async () => {
    if (!canvasElement || !navigator.clipboard?.write || typeof ClipboardItem === "undefined") return;
    const blob = await new Promise<Blob | null>(resolve => canvasElement.toBlob(resolve, "image/png"));
    if (blob) { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); setCloudStatus("Đã chép hình vào bộ nhớ tạm"); }
  };
  const printSheet = () => {
    const image = canvasElement?.toDataURL("image/png") ?? "";
    const content = `<!doctype html><html lang="vi"><meta charset="utf-8"><title>Phiếu bài tập MathSTEP</title><style>body{font:15px Arial;color:#111;margin:24mm}h1{font-size:20px}li{margin:14px 0}.figure{display:block;width:150mm;margin:10mm auto}footer{margin-top:20mm;border-top:1px solid #aaa;padding-top:5mm}</style><h1>${escapeHtml(assignmentTitle || "Phiếu bài tập hình học")}</h1><p>Họ tên: .................................................... Lớp: .................</p>${image ? `<img class="figure" src="${image}">` : ""}<ol>${workspace.assignments.flatMap(item => item.questions).map(question => `<li>${escapeHtml(question.prompt)}<p>..................................................................................................</p></li>`).join("")}</ol><footer>MathSTEP · Phiếu bài tập hình học không gian</footer><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></html>`;
    const popup = window.open("", "_blank");
    if (!popup) { setPrintOpen(true); return; }
    popup.document.write(content); popup.document.close();
  };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); };

  if (!ready) return <div className="grid min-h-screen place-items-center bg-[#09111f] text-sm text-slate-300"><LoaderCircle className="mr-2 inline animate-spin"/> Đang mở không gian giáo viên</div>;
  if (!authorized) return <main className="grid min-h-screen place-items-center bg-[#09111f] p-5 text-slate-100"><section className="max-w-md rounded-2xl border border-white/10 bg-[#111d30] p-7 text-center"><GraduationCap className="mx-auto mb-4 h-9 w-9 text-amber-300"/><h1 className="text-xl font-bold">Cần quyền giáo viên</h1><p className="mt-2 text-sm leading-6 text-slate-400">Đăng nhập và kích hoạt vai trò giáo viên để mở khu vực này.</p><Link href="/" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">Về Trạm học</Link></section></main>;

  return <div className={`min-h-screen bg-[#09111f] text-slate-100 ${presenter ? "fixed inset-0 z-[100] overflow-auto" : ""}`}>
    {!presenter && <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0b1525]/95 px-3 backdrop-blur-md sm:px-6">
      <Link href="/" className="text-sm font-black tracking-wide text-white">MathSTEP</Link>
      <nav className="flex items-center gap-1 sm:gap-3 text-xs font-semibold"><Link href="/" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10">Trạm học</Link><Link href="/giao-vien/lop-hoc" className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-300">Giáo viên</Link><Link href="/?view=knowledge" className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/10">Cơ sở KHKT</Link></nav>
      <div className="flex items-center gap-2 text-xs"><span className="hidden text-slate-400 sm:inline">{teacherName}</span><button type="button" onClick={() => void logout()} title="Đăng xuất" className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10"><LogOut size={15}/></button></div>
    </header>}
    <div className="mx-auto flex max-w-[1600px]">
      {!presenter && <aside className="hidden min-h-[calc(100vh-56px)] w-60 shrink-0 border-r border-white/10 bg-[#0b1525] p-4 md:block"><p className="px-2 pb-4 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Không gian giáo viên</p><nav className="space-y-1">{sections.map(item => { const Icon = item.icon; return <Link key={item.id} href={`/giao-vien/${item.id}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${section === item.id ? "bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><Icon size={17}/>{item.label}</Link>; })}</nav><div className="mt-8 rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="text-xs font-semibold">Lưu dữ liệu</p><p className="mt-1 text-[11px] leading-5 text-slate-500">{cloudStatus}</p></div></aside>}
      <main className={`${presenter ? "w-full" : "min-w-0 flex-1 p-4 sm:p-6 lg:p-8"}`}>
        {!presenter && <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">MathSTEP · Giáo viên</p><h1 className="mt-1 text-2xl font-black tracking-tight">{sections.find(item => item.id === section)?.label}</h1><p className="mt-1 text-xs text-slate-500">Quản lý lớp, học liệu và đánh giá trên cùng một không gian.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-[11px] text-slate-400"><span className={`h-2 w-2 rounded-full ${cloudStatus.includes("đồng bộ") ? "bg-emerald-400" : "bg-amber-400"}`}/>{cloudStatus}</div></div>}

        {section === "lop-hoc" && <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Lớp đang quản lý" value={workspace.classes.length} icon={<Users size={16}/>} /><Metric label="Học sinh" value={allStudents.length} icon={<GraduationCap size={16}/>} /><Metric label="Bài đã giao" value={workspace.assignments.length} icon={<ClipboardList size={16}/>} /><Metric label="Điểm trung bình" value={`${Math.round(allStudents.reduce((sum, student) => sum + student.averageScore, 0) / Math.max(1, allStudents.length))}%`} icon={<Activity size={16}/>} /></div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,.8fr)]">
            <Panel title="Lớp học" action={<button onClick={exportRoster} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/5"><Download size={14}/> Xuất bảng điểm</button>}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row"><input value={className} onChange={event => setClassName(event.target.value)} placeholder="Tên lớp, ví dụ 11A1 · Chuyên Toán" className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm outline-none focus:border-blue-400/50"/><select value={grade} onChange={event => setGrade(event.target.value)} className="rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm"><option value="10">Lớp 10</option><option value="11">Lớp 11</option><option value="12">Lớp 12</option></select><button onClick={createClassroom} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold hover:bg-blue-500"><Plus size={15}/> Tạo lớp học</button></div>
              <div className="flex flex-wrap gap-2">{workspace.classes.map(item => <button key={item.id} onClick={() => setSelectedClassId(item.id)} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${currentClass?.id === item.id ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-200" : "border-white/10 text-slate-400 hover:bg-white/5"}`}>{item.name}</button>)}</div>
              {currentClass && <><div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-400/15 bg-blue-500/[.06] p-3"><div><p className="text-sm font-bold">{currentClass.name}</p><p className="mt-1 text-[11px] text-slate-500">Lớp {currentClass.gradeLevel} · {currentClass.students.length} học sinh</p></div><button onClick={() => void navigator.clipboard?.writeText(currentClass.inviteCode)} className="rounded-lg border border-white/10 px-3 py-2 font-mono text-xs font-bold tracking-widest text-cyan-200">Mã tham gia {currentClass.inviteCode}</button></div>
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead className="text-[10px] uppercase tracking-wider text-slate-500"><tr><th className="py-3">Học sinh</th><th>Mã học sinh</th><th>Bài hoàn thành</th><th>Điểm TB</th><th>Tương tác 3D</th></tr></thead><tbody>{currentClass.students.map(student => <tr key={student.studentId} className="border-t border-white/[.06]"><td className="py-3 font-semibold text-slate-200">{student.name}</td><td className="font-mono text-slate-500">{student.studentId}</td><td>{student.completedLessons}</td><td>{student.averageScore}%</td><td><div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${student.threeDInteractionRate}%` }}/></div>{student.threeDInteractionRate}%</div></td></tr>)}</tbody></table></div></>}
            </Panel>
            <Panel title="Tỉ lệ trả lời đúng theo chuyên đề"><div className="space-y-4">{topicNames.map(topic => { const values = allStudents.map(student => student.topicAccuracy[topic] ?? 0); const average = Math.round(values.reduce((a, b) => a + b, 0) / Math.max(1, values.length)); return <div key={topic}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-300">{topic}</span><span className="font-mono text-slate-400">{average}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-300" style={{ width: `${average}%` }}/></div></div>; })}</div></Panel>
          </div>
          <Panel title="Cảnh báo điểm mù không gian" action={<span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold text-amber-300">{blindSpots.length} cần hỗ trợ</span>}>
            {blindSpots.length ? <div className="grid gap-3 lg:grid-cols-2">{blindSpots.map(student => <div key={student.studentId} className="rounded-xl border border-amber-400/15 bg-amber-400/[.04] p-3"><div className="flex items-start gap-3"><AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-300"/><div className="min-w-0"><p className="text-sm font-bold">{student.name}</p><p className="mt-1 text-[11px] text-slate-400">Đã dùng {student.hintsUsed} gợi ý TES</p><ul className="mt-2 space-y-1 text-xs text-amber-100/80">{student.spatialErrors.map(error => <li key={error}>• {error}</li>)}</ul></div></div></div>)}</div> : <p className="text-sm text-slate-500">Chưa ghi nhận học sinh cần hỗ trợ thêm.</p>}
          </Panel>
        </div>}

        {section === "soan-bai" && <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,.8fr)]">
          <div className="space-y-5"><Panel title="Trình dựng hình từ đề bài" action={<span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">Phân tích có kiểm tra</span>}><textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={4} placeholder="Dán đề hình học không gian vào đây…" className="w-full resize-y rounded-xl border border-white/10 bg-[#0a1423] p-3 text-sm leading-6 outline-none focus:border-cyan-400/40"/><div className="mt-3 flex flex-wrap items-center gap-2"><button disabled={busy} onClick={() => void analyzePrompt()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-600 px-4 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={15}/> : <Activity size={15}/>} Phân tích đề</button><label className="flex items-center gap-2 text-xs text-slate-400">Quyền xem<select value={visibility} onChange={event => setVisibility(event.target.value as Visibility)} className="rounded-lg border border-white/10 bg-[#0a1423] px-2 py-2"><option value="private">Riêng tư</option><option value="class">Lớp học</option><option value="public">Công khai</option></select></label></div>{parseMessage && <p role="status" className="mt-3 text-xs leading-5 text-cyan-100">{parseMessage}</p>}</Panel>
          <Panel title="Tham số mô hình"><div className="space-y-4"><label className="block text-xs text-slate-300">Dạng hình<select value={workspace.activeModel.kind} onChange={event => updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, kind: event.target.value } }))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3"><option value="pyramidCut">Hình chóp có thiết diện</option><option value="pyramid">Hình chóp</option><option value="prism">Lăng trụ</option><option value="cuboid">Hình hộp</option><option value="cone">Mặt nón</option></select></label><Range label="Chiều cao h" min={1} max={5} value={workspace.activeModel.height} onChange={height => updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, height } }))}/><Range label="Bán kính đáy R" min={0.5} max={3} value={workspace.activeModel.radius} onChange={radius => updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, radius } }))}/><Range label="Tỉ số cắt k = SM/SA" min={0.05} max={0.95} value={workspace.activeModel.cutRatio} onChange={cutRatio => updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, cutRatio } }))}/><div className="rounded-lg bg-white/[.04] p-3 text-xs text-slate-300"><MathFormattedText text={`Tỉ số hiện tại: $k=${workspace.activeModel.cutRatio.toFixed(2)}$ · chiều cao $h=${workspace.activeModel.height.toFixed(1)}$`} /></div></div></Panel>
          <Panel title="Cạnh và đối tượng phụ"><div className="grid gap-2 sm:grid-cols-2">{["Tự động tính nét khuất", "Cố định nét liền", "Cố định nét đứt", "Mặt phẳng phụ (α)", "Đường cao SH", "Vectơ AB, AC′"].map((label, index) => <label key={label} className="flex items-center gap-2 rounded-lg border border-white/[.07] bg-white/[.02] p-2.5 text-xs text-slate-300"><input type="checkbox" defaultChecked={index === 0 || index === 3} className="accent-cyan-400"/>{label}</label>)}</div></Panel>
          <Panel title="Kịch bản trình chiếu" action={<button onClick={addSlide} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold"><Plus size={13}/> Thêm bước</button>}><div className="space-y-2">{(activeLesson?.cameraSteps ?? []).map((step, index) => <button key={step.id} onClick={() => setSlideIndex(index)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs ${slideIndex === index ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-100" : "border-white/10 text-slate-400"}`}><span>Bước {index + 1} · {step.title}</span><ChevronRight size={14}/></button>)}</div><div className="mt-3 flex flex-wrap gap-2"><input value={lessonTitle} onChange={event => setLessonTitle(event.target.value)} aria-label="Tên học liệu" className="min-h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0a1423] px-3 text-xs"/><button onClick={saveLesson} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 text-xs font-bold"><Save size={14}/> Lưu học liệu</button><button onClick={() => setPresenter(true)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-bold"><Presentation size={14}/> Trình chiếu</button></div></Panel></div>
          <Panel title={presenter ? "Trình chiếu bài giảng" : "Bản xem trước 3D"} className={presenter ? "fixed inset-0 z-[110] flex flex-col rounded-none border-0 bg-[#050b14] p-5" : "xl:sticky xl:top-20 xl:self-start"} action={presenter ? <button onClick={() => setPresenter(false)} className="rounded-lg border border-white/15 px-3 py-2 text-xs">Thoát trình chiếu</button> : undefined}><div className={presenter ? "flex-1" : "h-[420px] overflow-hidden rounded-xl border border-white/[.06] bg-[#101a2d]"}><ModelPreview kind={workspace.activeModel.kind} height={workspace.activeModel.height} radius={workspace.activeModel.radius} cutRatio={workspace.activeModel.cutRatio} slide={activeSlide} onCanvas={setCanvasElement}/></div>{activeSlide && <div className="mt-3 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{activeSlide.title}</p><p className="mt-1 text-xs text-slate-400">{activeSlide.narration}</p></div><div className="flex gap-2"><button disabled={slideIndex <= 0} onClick={() => setSlideIndex(index => Math.max(0, index - 1))} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">Trước</button><button disabled={slideIndex >= (activeLesson?.cameraSteps.length ?? 1) - 1} onClick={() => setSlideIndex(index => index + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">Tiếp</button></div></div>}{presenter && <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-400">Bước {slideIndex + 1} / {activeLesson?.cameraSteps.length ?? 1}</p><Image unoptimized width={96} height={96} alt="Mã QR mở thư viện hình học" className="h-24 w-24 rounded-lg bg-white p-1" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${window.location.origin}/thu-vien-hinh-hoc`)}`}/></div>}</Panel>
        </div>}

        {section === "bai-tap" && <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,.7fr)]"><Panel title="Tạo bài tập tương tác"><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-400">Tên bài tập<input value={assignmentTitle} onChange={event => setAssignmentTitle(event.target.value)} placeholder="Ví dụ: Góc và đường vuông góc" className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm text-white"/></label><label className="text-xs text-slate-400">Lớp nhận bài<select value={selectedClassId} onChange={event => setSelectedClassId(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm text-white">{workspace.classes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><label className="mt-3 block text-xs text-slate-400">Câu hỏi<textarea value={questionPrompt} onChange={event => setQuestionPrompt(event.target.value)} placeholder="Nhập câu hỏi; công thức viết trong $...$ sẽ được hiển thị bằng KaTeX." rows={3} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0a1423] p-3 text-sm text-white"/></label><div className="mt-2 rounded-lg border border-white/[.06] bg-[#0a1423] p-3 text-sm"><MathFormattedText text={questionPrompt}/></div><div className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-xs text-slate-400">Dạng bài<select value={questionType} onChange={event => setQuestionType(event.target.value as Question3D["type"])} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-2 text-white"><option value="point-click">Chọn điểm 3D</option><option value="slider">Kiểm chứng thanh trượt</option><option value="multiple-choice">Trắc nghiệm</option><option value="written">Tự luận</option></select></label><label className="text-xs text-slate-400">Hạn nộp<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-2 text-white"/></label><label className="text-xs text-slate-400">Trợ lý TES<select value={aiMode} onChange={event => setAiMode(event.target.value as AITutorMode)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-2 text-white"><option value="full">Luyện tập · đầy đủ</option><option value="limited">Hạn chế · tối đa 2 gợi ý</option><option value="disabled">Kiểm tra · tắt trợ lý</option></select></label></div>
          {questionType === "point-click" && <label className="mt-3 block text-xs text-slate-400">Đối tượng đúng<select value={answerTarget} onChange={event => setAnswerTarget(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm text-white">{["S", "A", "B", "C", "D", "H", "M", "N", "SA", "AB", "SH", "(SAB)"].map(target => <option key={target}>{target}</option>)}</select></label>}
          {questionType === "multiple-choice" && <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs text-slate-400">Bốn phương án, ngăn cách bằng dấu |<input value={choiceOptions} onChange={event => setChoiceOptions(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-xs text-white"/></label><label className="text-xs text-slate-400">Đáp án đúng<input value={choiceAnswer} onChange={event => setChoiceAnswer(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-xs text-white"/></label></div>}
          {questionType === "slider" && <label className="mt-3 block text-xs text-slate-400">Giá trị đích k = {sliderTarget.toFixed(2)}<input type="range" min="0.05" max="0.95" step="0.01" value={sliderTarget} onChange={event => setSliderTarget(Number(event.target.value))} className="mt-2 w-full accent-cyan-400"/></label>}
          <label className="mt-3 block max-w-xs text-xs text-slate-400">Số lần làm lại<input type="number" min="1" max="10" value={maxAttempts} onChange={event => setMaxAttempts(Math.min(10, Math.max(1, Number(event.target.value))))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-sm text-white"/></label>
          <button onClick={addAssignment} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-bold"><Plus size={14}/> Tạo và giao bài</button></Panel><div className="space-y-5"><Panel title="Danh sách bài tập" action={<span className="text-[11px] text-slate-500">{questionCount} câu</span>}>{workspace.assignments.map(item => <div key={item.id} className="mb-2 rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-sm font-bold">{item.title}</p><p className="mt-1 text-[11px] text-slate-500">{workspace.classes.find(group => group.id === item.classId)?.name ?? "Lớp học"} · {item.questions.length} câu · hạn {item.dueDate}</p><div className="mt-2 space-y-2">{item.questions.map(question => <div key={question.id} className="rounded-lg bg-[#0a1423] p-2 text-xs"><MathFormattedText text={question.prompt}/><span className="mt-1 block text-[10px] text-slate-500">{question.type} · mô hình {question.modelId}</span></div>)}</div></div>)}</Panel><Panel title="Trợ lý Socratic TES"><div className="space-y-2 text-xs leading-5 text-slate-400"><p><strong className="text-emerald-300">Luyện tập:</strong> gợi mở theo từng bước, không đưa ngay đáp án.</p><p><strong className="text-amber-300">Hạn chế:</strong> tối đa hai gợi ý cho mỗi câu.</p><p><strong className="text-slate-200">Kiểm tra:</strong> tắt trợ lý trong thời gian làm bài.</p></div></Panel></div></div>}

        {section === "xuat-de" && <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)]"><Panel title="Chế độ nét đen đề thi" action={<button aria-pressed={examMode} onClick={() => setExamMode(value => !value)} className={`rounded-lg px-3 py-2 text-xs font-bold ${examMode ? "bg-white text-black" : "border border-white/10 text-slate-300"}`}>{examMode ? "Nét đen đang bật" : "Bật nét đen"}</button>}><p className="text-xs leading-5 text-slate-400">Nền trắng, cạnh đơn sắc, mặt trong suốt để hình phù hợp tài liệu in.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs text-slate-400">Độ dày nét<select value={workspace.activeModel.edgeStyles.width ?? "2.2"} onChange={event => updateWorkspace(state => ({ ...state, activeModel: { ...state.activeModel, edgeStyles: { ...state.activeModel.edgeStyles, width: event.target.value } } }))} className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-[#0a1423] px-3 text-white"><option value="1.2">Mảnh · 1,2 px</option><option value="1.8">Vừa · 1,8 px</option><option value="2.2">Rõ · 2,2 px</option><option value="2.8">Đậm · 2,8 px</option></select></label><label className="text-xs text-slate-400">Cỡ chữ nhãn · {labelSize}px<input type="range" min="12" max="32" value={labelSize} onChange={event => setLabelSize(Number(event.target.value))} className="mt-3 w-full accent-cyan-400"/></label></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={exportSvg} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Tải SVG</button><button onClick={exportPng} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Tải PNG</button><button onClick={() => void copyToWord()} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold">Chép hình vào Word</button><button onClick={printSheet} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Tạo phiếu PDF</button></div></Panel><Panel title="Xem trước hình in"><div className="h-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white"><ModelPreview kind={workspace.activeModel.kind} height={workspace.activeModel.height} radius={workspace.activeModel.radius} cutRatio={workspace.activeModel.cutRatio} examMode={examMode} onCanvas={setCanvasElement}/></div><p className="mt-2 text-[11px] text-slate-500">Tỉ lệ xuất PNG phụ thuộc độ phân giải thiết bị. Khi tạo PDF, chọn khổ A4 trong hộp thoại in.</p></Panel>{printOpen && <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-100">Cho phép cửa sổ bật lên để mở phiếu in. Trong hộp thoại trình duyệt, chọn khổ giấy A4 và lưu dưới dạng PDF.<button className="ml-2 underline" onClick={() => setPrintOpen(false)}>Đóng</button></div>}</div>}

        {section === "cai-dat" && <div className="grid gap-5 xl:grid-cols-2"><Panel title="Lưu trữ và đồng bộ"><p className="text-sm text-slate-300">Bản nháp tự lưu trên trình duyệt và đồng bộ vào Supabase khi tài khoản giáo viên hoạt động.</p><p className="mt-2 text-xs text-slate-500">Trạng thái: {cloudStatus}</p><div className="mt-4 flex flex-wrap gap-2"><button onClick={exportWorkspace} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold"><FileJson size={14}/> Tải bản sao JSON</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold"><Download size={14}/> Mở bản sao JSON<input type="file" accept="application/json" className="hidden" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { const imported = JSON.parse(await file.text()) as TeacherWorkspaceState; if (imported.classes && imported.lessons && imported.assignments && imported.submissions && imported.activeModel) updateWorkspace(() => imported); } catch { setCloudStatus("Tệp JSON không đúng cấu trúc"); } event.target.value = ""; }}/></label></div></Panel><Panel title="Thông tin giáo viên"><p className="text-sm font-bold">{teacherName}</p><p className="mt-1 text-xs text-slate-500">Quyền truy cập dựa trên phiên giáo viên đã xác thực.</p><Link href="/thu-vien-hinh-hoc" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Mở thư viện mô hình 3D <ChevronRight size={14}/></Link></Panel><Panel title="Dữ liệu lớp học"><p className="text-xs leading-5 text-slate-400">Mã mời chỉ dùng để tham gia lớp. Báo cáo tiến độ trong bản dựng này dựa trên các lượt nộp bài và dữ liệu mẫu hiện có.</p><p className="mt-3 text-[11px] text-slate-500">Lớp: {workspace.classes.length} · Học liệu: {workspace.lessons.length} · Bài tập: {workspace.assignments.length} · Bài nộp: {workspace.submissions.length}</p></Panel></div>}
      </main>
    </div>
  </div>;
}

function Panel({ title, children, action, className = "" }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/[.08] bg-[#101b2c] p-4 shadow-xl shadow-black/10 sm:p-5 ${className}`}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-slate-100">{title}</h2>{action}</div>{children}</section>;
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/[.08] bg-[#101b2c] p-4"><div className="flex items-center justify-between"><p className="text-[11px] text-slate-500">{label}</p><span className="text-cyan-300">{icon}</span></div><p className="mt-3 text-2xl font-black tracking-tight">{value}</p></div>;
}

function Range({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return <label className="block text-xs text-slate-300">{label}<div className="mt-2 flex items-center gap-3"><input type="range" min={min} max={max} step="0.05" value={value} onChange={event => onChange(Number(event.target.value))} className="min-w-0 flex-1 accent-cyan-400"/><span className="w-10 text-right font-mono text-slate-400">{value.toFixed(2)}</span></div></label>;
}

function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
