"use client";

import React, { useState } from "react";
import { CORE_3_MODULES, LessonUnit } from "@/app/types/curriculum";
import {
  RotateCcw,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  Box,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { OptiMascot } from "@/app/components/optimath/mascot/OptiMascot";
import { MathFormattedText } from "@/app/components/KatexMath";

type DiscoveryPrompt = { prompt: string; choices: string[]; answer: number; explanation: string };

const DISCOVERY_PROMPTS: DiscoveryPrompt[] = [
  { prompt: "Trong hình bình hành ABCD, hai đường chéo AC và BD cắt nhau tại O. Điều nào luôn đúng?", choices: ["O là trung điểm của cả AC và BD", "AC vuông góc với BD", "O là trung điểm của một cạnh đáy"], answer: 0, explanation: "Hai đường chéo của hình bình hành cắt nhau tại trung điểm mỗi đường. Hình vẽ minh họa quan hệ đó; không suy ra hai đường chéo vuông góc." },
  { prompt: "M là trung điểm SA. N nằm trên SB và hiện có SN:NB = 2:1. Đoạn MN có song song với AB không?", choices: ["Có, vì M và N cùng là trung điểm", "Không, vì SM:SA = 1:2 còn SN:SB = 2:3", "Không thể xác định dù đã biết các tỉ số"], answer: 1, explanation: "Trong tam giác SAB, MN song song AB khi SM/SA = SN/SB. Ở đây hai tỉ số lần lượt là 1/2 và 2/3 nên MN không song song AB. Hãy kéo tỉ số N về 1:1 để kiểm chứng trường hợp song song." },
  { prompt: "Trong hình chóp S.ABCD, AB thuộc mặt phẳng đáy còn SD đi qua S và D. Hai đường thẳng AB và SD có quan hệ gì?", choices: ["Cắt nhau tại một điểm trên hình chiếu", "Song song", "Chéo nhau"], answer: 2, explanation: "AB nằm trong mặt phẳng đáy; SD cắt mặt phẳng đáy tại D, mà D không thuộc AB. Hai đường thẳng không đồng phẳng nên chéo nhau. Hình chiếu 2D có thể làm chúng trông như cắt nhau." },
  { prompt: "Mặt phẳng cắt song song đáy tại tỉ lệ k tính từ S. Tỉ số diện tích thiết diện so với đáy được tính thế nào?", choices: ["k", "k²", "2k"], answer: 1, explanation: "Thiết diện song song với đáy đồng dạng với đáy theo tỉ số độ dài k. Tỉ số diện tích là $\\frac{S_{MPQR}}{S_{ABCD}}=k^2$." },
  { prompt: "Khi trải phẳng các mặt bên của hình chóp, đại lượng nào được bảo toàn trên từng mặt?", choices: ["Độ dài các cạnh và diện tích của mặt", "Góc nhị diện giữa hai mặt kề nhau", "Khoảng cách từ mọi điểm đến đỉnh S"], answer: 0, explanation: "Mỗi mặt được quay quanh cạnh chung như một vật rắn nên độ dài và diện tích của mặt không đổi. Góc giữa các mặt thay đổi khi mở hình." },
];

interface SpatialGeometryLabProps {
  onBackToHome?: () => void;
  onOpenSocraticDrawer?: (contextMessage?: string) => void;
  initialLessonIndex?: number;
  embedded?: boolean;
}

export function SpatialGeometryLab({
  onBackToHome,
  onOpenSocraticDrawer,
  initialLessonIndex = 0,
  embedded = false,
}: SpatialGeometryLabProps) {
  const moduleConfig = CORE_3_MODULES[1]; // Module 2
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(initialLessonIndex);

  React.useEffect(() => {
    if (typeof initialLessonIndex === "number" && initialLessonIndex >= 0) {
      setSelectedLessonIndex(initialLessonIndex);
    }
  }, [initialLessonIndex]);

  const currentLesson: LessonUnit = moduleConfig.lessons[selectedLessonIndex] || moduleConfig.lessons[0];

  // 3D Apex Parameters (S.ABCD)
  const [apexX, setApexX] = useState<number>(0);
  const apexY = 0;
  const [apexZ, setApexZ] = useState<number>(4.5);

  // Lesson 2: Point N division ratio along SB (default 2/3 for SN:NB = 2:1)
  const [ratioN, setRatioN] = useState<number>(2 / 3);

  // Lesson 4: Section plane height ratio along SA (k = 0.5 for midpoint M)
  const [cutK, setCutK] = useState<number>(0.5);

  // Lesson 5: Unfolding angle (0 deg = 3D pyramid, 90 deg = fully unfolded 2D net)
  const [unfoldAngle, setUnfoldAngle] = useState<number>(0);

  // 3D View Controls
  const [rotX, setRotX] = useState<number>(24);
  const [rotY, setRotY] = useState<number>(-38);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Toggles for visual explorations
  const [showSectionPlane, setShowSectionPlane] = useState<boolean>(true);
  const showCenterO = true;
  const showPointsMN = true;
  const [transparentMode, setTransparentMode] = useState<boolean>(false);
  const [illusionSnapActive, setIllusionSnapActive] = useState<boolean>(false);
  const [discoveryAnswer, setDiscoveryAnswer] = useState<number | null>(null);
  const [discoveryChecked, setDiscoveryChecked] = useState(false);

  // SVG viewport dimensions
  const svgW = 540;
  const svgH = 460;
  const originX = svgW / 2;
  const originY = svgH / 2 + 30;
  const scale = 42 * zoom;

  // Parallelogram base points: A(-2.2, -1.4, 0), B(1.8, -1.4, 0), C(2.6, 1.4, 0)
  // D = A + C - B = (-1.4, 1.4, 0)
  const baseA = [-2.2, -1.4, 0] as [number, number, number];
  const baseB = [1.8, -1.4, 0] as [number, number, number];
  const baseC = [2.6, 1.4, 0] as [number, number, number];
  const baseD = [-1.4, 1.4, 0] as [number, number, number];

  // Center O = midpoint of AC and BD = (0.2, 0, 0)
  const centerO = [
    (baseA[0] + baseC[0]) / 2,
    (baseA[1] + baseC[1]) / 2,
    0,
  ] as [number, number, number];

  // Apex S
  const apexS = [apexX, apexY, apexZ] as [number, number, number];

  // Midpoint M of SA: M = (S + A) / 2
  const pointM = [
    (apexS[0] + baseA[0]) / 2,
    (apexS[1] + baseA[1]) / 2,
    (apexS[2] + baseA[2]) / 2,
  ] as [number, number, number];

  // Point N on SB with SN = ratioN * SB (SN:NB = 2:1 when ratioN = 2/3)
  const pointN = [
    apexS[0] + ratioN * (baseB[0] - apexS[0]),
    apexS[1] + ratioN * (baseB[1] - apexS[1]),
    apexS[2] + ratioN * (baseB[2] - apexS[2]),
  ] as [number, number, number];

  // Section plane parallel to base at height ratio cutK along SA, SB, SC, SD
  const cutM = [
    apexS[0] + cutK * (baseA[0] - apexS[0]),
    apexS[1] + cutK * (baseA[1] - apexS[1]),
    apexS[2] + cutK * (baseA[2] - apexS[2]),
  ] as [number, number, number];

  const cutP = [
    apexS[0] + cutK * (baseB[0] - apexS[0]),
    apexS[1] + cutK * (baseB[1] - apexS[1]),
    apexS[2] + cutK * (baseB[2] - apexS[2]),
  ] as [number, number, number];

  const cutQ = [
    apexS[0] + cutK * (baseC[0] - apexS[0]),
    apexS[1] + cutK * (baseC[1] - apexS[1]),
    apexS[2] + cutK * (baseC[2] - apexS[2]),
  ] as [number, number, number];

  const cutR = [
    apexS[0] + cutK * (baseD[0] - apexS[0]),
    apexS[1] + cutK * (baseD[1] - apexS[1]),
    apexS[2] + cutK * (baseD[2] - apexS[2]),
  ] as [number, number, number];

  // 3D Projection math: Rotate around X and Y axes
  const project3D = (coord: [number, number, number]): { x: number; y: number; zDepth: number } => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    const [x, y, z] = coord;
    // Rotate around Y
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const y1 = y;
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate around X
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Screen projection (Isometric)
    const sx = originX + x2 * scale;
    const sy = originY - y2 * scale;
    return { x: sx, y: sy, zDepth: z2 };
  };

  // Screen projected coordinates
  const pS = project3D(apexS);
  const pA = project3D(baseA);
  const pB = project3D(baseB);
  const pC = project3D(baseC);
  const pD = project3D(baseD);
  const pO = project3D(centerO);
  const pM = project3D(pointM);
  const pN = project3D(pointN);

  const pCutM = project3D(cutM);
  const pCutP = project3D(cutP);
  const pCutQ = project3D(cutQ);
  const pCutR = project3D(cutR);

  const discoveryPrompt = selectedLessonIndex === 1
    ? {
        ...DISCOVERY_PROMPTS[1],
        prompt: `M là trung điểm SA. Với vị trí N đang chọn, SN:NB = ${(ratioN / (1 - ratioN)).toFixed(2)}:1. Đoạn MN có song song với AB không?`,
        choices: ["Có, vì SM/SA = SN/SB", "Không, vì SM/SA khác SN/SB", "Không thể xác định từ hình"],
        answer: Math.abs(ratioN - 0.5) < 0.001 ? 0 : 1,
        explanation: Math.abs(ratioN - 0.5) < 0.001
          ? "Khi N là trung điểm SB, ta có SM/SA = SN/SB = 1/2. Theo định lí Ta-lét đảo trong tam giác SAB, MN song song AB."
          : "M là trung điểm SA nên SM/SA = 1/2. N chỉ là trung điểm SB khi SN/SB = 1/2, tương đương SN:NB = 1:1. Hiện hai tỉ số chưa bằng nhau nên MN không song song AB.",
      }
    : selectedLessonIndex === 3
      ? {
          ...DISCOVERY_PROMPTS[3],
          prompt: `Mặt phẳng song song đáy cắt các cạnh bên tại cùng tỉ lệ k = ${cutK.toFixed(2)} tính từ S. Tỉ số diện tích thiết diện so với đáy được tính thế nào?`,
          explanation: `Thiết diện đồng dạng với đáy theo tỉ số độ dài k. Vì vậy tỉ số diện tích là k²; với k = ${cutK.toFixed(2)}, tỉ số hiện tại xấp xỉ ${(cutK * cutK).toFixed(3)}.`,
        }
      : DISCOVERY_PROMPTS[selectedLessonIndex] ?? DISCOVERY_PROMPTS[0];

  React.useEffect(() => {
    setDiscoveryAnswer(null);
    setDiscoveryChecked(false);
  }, [selectedLessonIndex, ratioN, cutK]);

  // Classify a face by its outward normal after applying the same rotations as the drawing.
  // The SVG camera looks toward the object along +z after projection.
  const isFaceVisible = (p1: number[], p2: number[], p3: number[], faceCenter: number[]) => {
    const cross = (u: number[], v: number[]) => [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const sub = (u: number[], v: number[]) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
    let normal = cross(sub(p2, p1), sub(p3, p1));
    const solidCenter = [(baseA[0] + baseB[0] + baseC[0] + baseD[0] + apexS[0]) / 5,
      (baseA[1] + baseB[1] + baseC[1] + baseD[1] + apexS[1]) / 5,
      apexS[2] / 5];
    if (normal[0] * (faceCenter[0] - solidCenter[0]) + normal[1] * (faceCenter[1] - solidCenter[1]) + normal[2] * (faceCenter[2] - solidCenter[2]) < 0) {
      normal = normal.map((value) => -value);
    }
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const y1 = normal[1];
    const z1 = -normal[0] * Math.sin(radY) + normal[2] * Math.cos(radY);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);
    return z2 > 1e-7;
  };

  const midpoint3D = (p: number[], q: number[], r: number[]) => [
    (p[0] + q[0] + r[0]) / 3,
    (p[1] + q[1] + r[1]) / 3,
    (p[2] + q[2] + r[2]) / 3,
  ];
  const faceVisibility = {
    base: isFaceVisible(baseA, baseB, baseC, centerO),
    SAB: isFaceVisible(baseA, baseB, apexS, midpoint3D(baseA, baseB, apexS)),
    SBC: isFaceVisible(baseB, baseC, apexS, midpoint3D(baseB, baseC, apexS)),
    SCD: isFaceVisible(baseC, baseD, apexS, midpoint3D(baseC, baseD, apexS)),
    SDA: isFaceVisible(baseD, baseA, apexS, midpoint3D(baseD, baseA, apexS)),
  };

  // An edge is hidden only when both faces meeting at it face away from the learner.
  const isHiddenEdge = (name1: string, name2: string) => {
    if (transparentMode) return false;
    const key = [name1, name2].sort().join("");
    const adjacentFaces: Record<string, boolean[]> = {
      AB: [faceVisibility.base, faceVisibility.SAB],
      BC: [faceVisibility.base, faceVisibility.SBC],
      CD: [faceVisibility.base, faceVisibility.SCD],
      AD: [faceVisibility.base, faceVisibility.SDA],
      SA: [faceVisibility.SAB, faceVisibility.SDA],
      SB: [faceVisibility.SAB, faceVisibility.SBC],
      SC: [faceVisibility.SBC, faceVisibility.SCD],
      SD: [faceVisibility.SCD, faceVisibility.SDA],
    };
    return (adjacentFaces[key] || []).every((visible) => !visible);
  };

  // Lesson 5 Unfolded vertices (Revolving lateral faces around base edges onto z=0)
  const unfoldFactor = unfoldAngle / 90; // 0 -> 1

  // Face SAB revolves around AB (y = -1.4)
  const hSAB = Math.sqrt(Math.pow(apexY - baseA[1], 2) + Math.pow(apexZ, 2));
  const sUnfoldAB: [number, number, number] = [
    apexX,
    baseA[1] - (apexY - baseA[1]) * (1 - unfoldFactor) - hSAB * unfoldFactor,
    apexZ * (1 - unfoldFactor),
  ];
  const pSUnfoldAB = project3D(sUnfoldAB);

  // Face SBC revolves around BC
  const hSBC = Math.sqrt(Math.pow(apexX - baseB[0], 2) + Math.pow(apexZ, 2));
  const sUnfoldBC: [number, number, number] = [
    baseB[0] + (apexX - baseB[0]) * (1 - unfoldFactor) + hSBC * unfoldFactor,
    apexY,
    apexZ * (1 - unfoldFactor),
  ];
  const pSUnfoldBC = project3D(sUnfoldBC);

  // Face SCD revolves around CD (y = 1.4)
  const hSCD = Math.sqrt(Math.pow(apexY - baseC[1], 2) + Math.pow(apexZ, 2));
  const sUnfoldCD: [number, number, number] = [
    apexX,
    baseC[1] + (apexY - baseC[1]) * (1 - unfoldFactor) + hSCD * unfoldFactor,
    apexZ * (1 - unfoldFactor),
  ];
  const pSUnfoldCD = project3D(sUnfoldCD);

  // Face SDA revolves around DA
  const hSDA = Math.sqrt(Math.pow(apexX - baseA[0], 2) + Math.pow(apexZ, 2));
  const sUnfoldDA: [number, number, number] = [
    baseA[0] - (apexX - baseA[0]) * (1 - unfoldFactor) - hSDA * unfoldFactor,
    apexY,
    apexZ * (1 - unfoldFactor),
  ];
  const pSUnfoldDA = project3D(sUnfoldDA);

  // Drag handlers for mouse/touch 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isRotating) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => prev + dx * 0.6);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.6)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => setIsRotating(false);

  // Snap to Illusion angle for Lesson 3 (AB & SD projection intersection)
  const handleSnapIllusionAngle = () => {
    setRotX(15);
    setRotY(-62);
    setZoom(1.05);
    setIllusionSnapActive(true);
  };

  // Reset view
  const handleResetView = () => {
    setRotX(24);
    setRotY(-38);
    setZoom(1.0);
    setIllusionSnapActive(false);
  };

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-6 ${embedded ? "py-3 sm:py-4 space-y-4" : "py-4 sm:py-6 space-y-6"}`}>
      {/* 1. TOP HEADER & BREADCRUMB */}
      {!embedded && <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer shadow-xs"
              title="Quay lại trang chủ"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                CHUYÊN ĐỀ 2
              </span>
              <span className="text-xs text-slate-500 font-medium">Toán 11 · GDPT 2018</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dựng Hình & Khảo Sát Quan Hệ Không Gian 3D (S.ABCD)
            </h1>
          </div>
        </div>

        {/* Action: Hỏi Socratic AI */}
        {onOpenSocraticDrawer && (
          <button
            type="button"
            onClick={() =>
              onOpenSocraticDrawer(
                `Em đang thực hành ${currentLesson.code}: ${currentLesson.title} thuộc Chuyên đề 2 Hình học không gian. Thầy Opti hướng dẫn giúp em với ạ!`
              )
            }
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <OptiMascot expression="thinking" size={20} animate={false} />
            <span>Hỏi Opti về hình này</span>
          </button>
        )}
      </div>}

      {/* 2. PROGRESSIVE LESSON SELECTOR TABS */}
      {!embedded && <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {moduleConfig.lessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => {
              setSelectedLessonIndex(idx);
              setIllusionSnapActive(false);
              if (idx === 3) {
                setShowSectionPlane(true);
                setCutK(0.5);
              }
              if (idx === 4) {
                setUnfoldAngle(45);
              } else {
                setUnfoldAngle(0);
              }
            }}
            className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedLessonIndex === idx
                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/25"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                  selectedLessonIndex === idx ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {lesson.code}
              </span>
              <span
                className={`text-[9px] font-semibold ${
                  selectedLessonIndex === idx ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {lesson.difficulty}
              </span>
            </div>
            <div className="font-bold text-xs truncate">{lesson.title.split(":")[0]}</div>
            <div
              className={`text-[10px] truncate ${
                selectedLessonIndex === idx ? "text-emerald-100" : "text-slate-500"
              }`}
            >
              {lesson.subtitle}
            </div>
          </button>
        ))}
      </div>}

      {embedded && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
          <span className="mt-0.5 rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">QUAN SÁT</span>
          <div><p className="font-bold text-emerald-950"><MathFormattedText text={currentLesson.title} /></p><p className="mt-0.5 text-xs leading-relaxed text-emerald-900"><MathFormattedText text={`${currentLesson.steps[0]?.instruction || currentLesson.description} Kéo hình để đổi góc nhìn và theo dõi cạnh nào đang bị mặt khác che.`} /></p></div>
        </div>
      )}

      {/* 3. MAIN WORKBENCH: 3D CANVAS & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive 3D SVG Projection Screen (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col items-center">
          {/* Canvas Toolbar Header */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-800">
                {selectedLessonIndex === 0 && "Bài 1: Đáy ABCD hình bình hành & Điểm S"}
                {selectedLessonIndex === 1 && "Bài 2: Trung điểm M (SA) & Điểm N (SB, tỉ số 2:1)"}
                {selectedLessonIndex === 2 && "Bài 3: Xoay 360°, Nét khuất & Hai đường chéo nhau AB, SD"}
                {selectedLessonIndex === 3 && "Bài 4: Thiết diện MPQR song song với đáy"}
                {selectedLessonIndex === 4 && "Bài 5: Trải phẳng (Unfolding) 4 mặt bên ra mặt đáy"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <button type="button" onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(1))))} aria-label="Thu nhỏ hình" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" title="Thu nhỏ hình">
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center font-mono text-[10px] font-bold text-slate-600">{zoom.toFixed(1)}×</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))))} aria-label="Phóng to hình" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600" title="Phóng to hình">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
                title="Đặt lại góc nhìn và độ phóng"
                aria-label="Đặt lại góc nhìn và độ phóng"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTransparentMode((prev) => !prev)}
                className={`p-1.5 rounded-lg transition-colors ${
                  transparentMode ? "bg-emerald-100 text-emerald-800 font-bold" : "hover:bg-slate-100"
                }`}
                title="Bật hoặc tắt chế độ nhìn xuyên khối"
                aria-label="Bật hoặc tắt chế độ nhìn xuyên khối"
              >
                {transparentMode ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Interactive SVG Projection Canvas */}
          <div
            className="w-full relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1e293b_0%,_#0f172a_58%,_#020617_100%)] rounded-2xl my-3 cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400/90 bg-slate-900/75 px-2.5 py-1 rounded-md border border-emerald-500/20 pointer-events-none z-10 flex items-center gap-2">
              <span>X={rotX.toFixed(0)}°, Y={rotY.toFixed(0)}°</span>
              <span className="text-slate-400">| Kéo chuột xoay 360°</span>
            </div>

            {illusionSnapActive && selectedLessonIndex === 2 && (
              <div className="absolute top-2 right-3 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-500/40 pointer-events-none z-10 animate-pulse">
                Góc nhìn ảo ảnh: AB & SD trông như cắt nhau!
              </div>
            )}

            <svg
              viewBox={`0 0 ${svgW} ${svgH}`}
              className="w-full h-[370px] sm:h-[430px]"
            >
              <defs>
                <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.20" />
                </linearGradient>
                <linearGradient id="baseGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="unfoldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.30" />
                  <stop offset="100%" stopColor="#D97706" stopOpacity="0.10" />
                </linearGradient>
              </defs>

              {/* LESSON 5: Unfolded Lateral Faces when unfoldAngle > 0 */}
              {selectedLessonIndex === 4 && unfoldAngle > 0 && (
                <>
                  {/* Face SAB unfolded */}
                  <polygon
                    points={`${pSUnfoldAB.x},${pSUnfoldAB.y} ${pA.x},${pA.y} ${pB.x},${pB.y}`}
                    fill="url(#unfoldGrad)"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <circle cx={pSUnfoldAB.x} cy={pSUnfoldAB.y} r="4" fill="#F59E0B" />
                  <text x={pSUnfoldAB.x} y={pSUnfoldAB.y + 12} fill="#FCD34D" fontSize="10" fontWeight="bold" textAnchor="middle">
                    S (mặt AB)
                  </text>

                  {/* Face SBC unfolded */}
                  <polygon
                    points={`${pSUnfoldBC.x},${pSUnfoldBC.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
                    fill="url(#unfoldGrad)"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <circle cx={pSUnfoldBC.x} cy={pSUnfoldBC.y} r="4" fill="#F59E0B" />
                  <text x={pSUnfoldBC.x + 8} y={pSUnfoldBC.y} fill="#FCD34D" fontSize="10" fontWeight="bold">
                    S (mặt BC)
                  </text>

                  {/* Face SCD unfolded */}
                  <polygon
                    points={`${pSUnfoldCD.x},${pSUnfoldCD.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                    fill="url(#unfoldGrad)"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <circle cx={pSUnfoldCD.x} cy={pSUnfoldCD.y} r="4" fill="#F59E0B" />
                  <text x={pSUnfoldCD.x} y={pSUnfoldCD.y - 6} fill="#FCD34D" fontSize="10" fontWeight="bold" textAnchor="middle">
                    S (mặt CD)
                  </text>

                  {/* Face SDA unfolded */}
                  <polygon
                    points={`${pSUnfoldDA.x},${pSUnfoldDA.y} ${pD.x},${pD.y} ${pA.x},${pA.y}`}
                    fill="url(#unfoldGrad)"
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4,3"
                  />
                  <circle cx={pSUnfoldDA.x} cy={pSUnfoldDA.y} r="4" fill="#F59E0B" />
                  <text x={pSUnfoldDA.x - 12} y={pSUnfoldDA.y} fill="#FCD34D" fontSize="10" fontWeight="bold" textAnchor="end">
                    S (mặt DA)
                  </text>

                  {/* Shortest path line on unfolded net from A to S(mặt BC) */}
                  {unfoldAngle >= 80 && (
                    <line
                      x1={pA.x}
                      y1={pA.y}
                      x2={pSUnfoldBC.x}
                      y2={pSUnfoldBC.y}
                      stroke="#EF4444"
                      strokeWidth="2.5"
                      strokeDasharray="5,3"
                    />
                  )}
                </>
              )}

              {/* Parallelogram Base Surface ABCD */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                fill="url(#baseGrad)"
                stroke="none"
              />

              {/* Subtle face fills make the pyramid read as a connected solid, not loose segments. */}
              <polygon points={`${pS.x},${pS.y} ${pA.x},${pA.y} ${pB.x},${pB.y}`} fill="#34D399" fillOpacity={faceVisibility.SAB ? 0.13 : 0.035} />
              <polygon points={`${pS.x},${pS.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`} fill="#38BDF8" fillOpacity={faceVisibility.SBC ? 0.13 : 0.035} />
              <polygon points={`${pS.x},${pS.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`} fill="#A78BFA" fillOpacity={faceVisibility.SCD ? 0.13 : 0.035} />
              <polygon points={`${pS.x},${pS.y} ${pD.x},${pD.y} ${pA.x},${pA.y}`} fill="#FBBF24" fillOpacity={faceVisibility.SDA ? 0.13 : 0.035} />

              {/* Diagonal lines AC and BD meeting at center O */}
              {showCenterO && (
                <>
                  <line
                    x1={pA.x}
                    y1={pA.y}
                    x2={pC.x}
                    y2={pC.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={pB.x}
                    y1={pB.y}
                    x2={pD.x}
                    y2={pD.y}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                </>
              )}

              {/* LESSON 4: Section Plane Polygon (P) parallel to base through cutK */}
              {showSectionPlane && selectedLessonIndex >= 3 && (
                <>
                  <polygon
                    points={`${pCutM.x},${pCutM.y} ${pCutP.x},${pCutP.y} ${pCutQ.x},${pCutQ.y} ${pCutR.x},${pCutR.y}`}
                    fill="url(#planeGrad)"
                    stroke="#34D399"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                  />
                  <line x1={pCutM.x} y1={pCutM.y} x2={pCutP.x} y2={pCutP.y} stroke="#10B981" strokeWidth="2" />
                  <line x1={pCutP.x} y1={pCutP.y} x2={pCutQ.x} y2={pCutQ.y} stroke="#10B981" strokeWidth="2" />
                  <line x1={pCutQ.x} y1={pCutQ.y} x2={pCutR.x} y2={pCutR.y} stroke="#10B981" strokeWidth="2" />
                  <line x1={pCutR.x} y1={pCutR.y} x2={pCutM.x} y2={pCutM.y} stroke="#10B981" strokeWidth="2" />
                </>
              )}

              {/* Lateral Edges from Apex S to Base */}
              {/* SA */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pA.x}
                y2={pA.y}
                stroke={selectedLessonIndex === 1 ? "#34D399" : "#E2E8F0"}
                strokeWidth={selectedLessonIndex === 1 ? "2.5" : isHiddenEdge("S", "A") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "A") ? "8 5" : undefined}
              />
              {/* SB */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pB.x}
                y2={pB.y}
                stroke={selectedLessonIndex === 1 ? "#F59E0B" : "#E2E8F0"}
                strokeWidth={selectedLessonIndex === 1 ? "2.5" : isHiddenEdge("S", "B") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "B") ? "8 5" : undefined}
              />
              {/* SC */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pC.x}
                y2={pC.y}
                stroke="#E2E8F0"
                strokeWidth={isHiddenEdge("S", "C") ? "1.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "C") ? "8 5" : undefined}
              />
              {/* SD: In Lesson 3, SD is highlighted in gold to analyze skew relationship with AB */}
              <line
                x1={pS.x}
                y1={pS.y}
                x2={pD.x}
                y2={pD.y}
                stroke={selectedLessonIndex === 2 ? "#F59E0B" : "#E2E8F0"}
                strokeWidth={isHiddenEdge("S", "D") ? "1.8" : selectedLessonIndex === 2 ? "3.5" : "2"}
                strokeDasharray={isHiddenEdge("S", "D") ? "8 5" : undefined}
              />

              {selectedLessonIndex >= 1 && (
                <line
                  x1={pM.x}
                  y1={pM.y}
                  x2={pN.x}
                  y2={pN.y}
                  stroke="#22D3EE"
                  strokeWidth="2.5"
                  strokeDasharray={!faceVisibility.SAB && !transparentMode ? "7 5" : undefined}
                />
              )}

              {/* Base edges */}
              {/* AB: In Lesson 3, AB is highlighted in bright cyan to analyze skew relationship with SD */}
              <line
                x1={pA.x}
                y1={pA.y}
                x2={pB.x}
                y2={pB.y}
                stroke={selectedLessonIndex === 2 ? "#38BDF8" : "#93C5FD"}
                strokeWidth={isHiddenEdge("A", "B") ? "1.8" : selectedLessonIndex === 2 ? "3.5" : "1.5"}
                strokeDasharray={isHiddenEdge("A", "B") ? "8 5" : undefined}
              />
              <line
                x1={pB.x}
                y1={pB.y}
                x2={pC.x}
                y2={pC.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("B", "C") ? "8 5" : undefined}
              />
              <line
                x1={pC.x}
                y1={pC.y}
                x2={pD.x}
                y2={pD.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("C", "D") ? "8 5" : undefined}
              />
              <line
                x1={pD.x}
                y1={pD.y}
                x2={pA.x}
                y2={pA.y}
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray={isHiddenEdge("D", "A") ? "8 5" : undefined}
              />

              {/* Point Markers & Labels */}
              {/* S */}
              <circle cx={pS.x} cy={pS.y} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={pS.x} y={pS.y - 8} fill="#FCA5A5" fontSize="13" fontWeight="bold" textAnchor="middle">
                S({apexX.toFixed(1)}, {apexY.toFixed(1)}, {apexZ.toFixed(1)})
              </text>

              {/* A */}
              <circle cx={pA.x} cy={pA.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pA.x - 10} y={pA.y + 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                A
              </text>

              {/* B */}
              <circle cx={pB.x} cy={pB.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pB.x + 8} y={pB.y + 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                B
              </text>

              {/* C */}
              <circle cx={pC.x} cy={pC.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pC.x + 8} y={pC.y} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                C
              </text>

              {/* D */}
              <circle cx={pD.x} cy={pD.y} r="4" fill="#60A5FA" stroke="#FFFFFF" strokeWidth="1" />
              <text x={pD.x - 12} y={pD.y - 4} fill="#BFDBFE" fontSize="12" fontWeight="bold">
                D
              </text>

              {/* Center O */}
              {showCenterO && (
                <>
                  <circle cx={pO.x} cy={pO.y} r="3.5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1" />
                  <text x={pO.x} y={pO.y + 12} fill="#FDE68A" fontSize="11" fontWeight="bold" textAnchor="middle">
                    O (Tâm đáy)
                  </text>
                </>
              )}

              {/* Lesson 2 & general: Midpoint M on SA */}
              {showPointsMN && selectedLessonIndex >= 1 && (
                <>
                  <circle cx={pM.x} cy={pM.y} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={pM.x - 14} y={pM.y - 2} fill="#6EE7B7" fontSize="12" fontWeight="bold">
                    M (1/2 SA)
                  </text>
                </>
              )}

              {/* Lesson 2 & general: Point N on SB (ratioN) */}
              {showPointsMN && selectedLessonIndex >= 1 && (
                <>
                  <circle cx={pN.x} cy={pN.y} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={pN.x + 8} y={pN.y} fill="#FCD34D" fontSize="12" fontWeight="bold">
                    N ({ratioN === 2 / 3 ? "2/3 SB" : `${(ratioN * 100).toFixed(0)}% SB`})
                  </text>
                </>
              )}

              {/* Lesson 4: Section Points M, P, Q, R */}
              {showSectionPlane && selectedLessonIndex >= 3 && (
                <>
                  <circle cx={pCutM.x} cy={pCutM.y} r="4" fill="#34D399" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx={pCutP.x} cy={pCutP.y} r="4" fill="#34D399" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx={pCutQ.x} cy={pCutQ.y} r="4" fill="#34D399" stroke="#FFFFFF" strokeWidth="1" />
                  <circle cx={pCutR.x} cy={pCutR.y} r="4" fill="#34D399" stroke="#FFFFFF" strokeWidth="1" />
                  <text x={pCutM.x - 12} y={pCutM.y - 4} fill="#A7F3D0" fontSize="10" fontWeight="bold">M</text>
                  <text x={pCutP.x + 8} y={pCutP.y - 4} fill="#A7F3D0" fontSize="10" fontWeight="bold">P</text>
                  <text x={pCutQ.x + 8} y={pCutQ.y} fill="#A7F3D0" fontSize="10" fontWeight="bold">Q</text>
                  <text x={pCutR.x - 12} y={pCutR.y} fill="#A7F3D0" fontSize="10" fontWeight="bold">R</text>
                </>
              )}
            </svg>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]">
            <span className="inline-flex items-center gap-2 font-semibold text-slate-700"><span className="inline-block w-8 border-t-2 border-slate-700" />Nét liền: nhìn thấy</span>
            <span className="inline-flex items-center gap-2 font-semibold text-slate-700"><span className="inline-block w-8 border-t-2 border-dashed border-slate-500" />Nét đứt: bị mặt khác che</span>
            <span className="text-slate-500">Xoay hình: kéo trực tiếp trên hình</span>
          </div>

          {/* Quick Sliders below 3D canvas */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Cao độ S (z):</span>
                <span className="font-mono font-bold text-emerald-700">{apexZ.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="2.5"
                max="7.0"
                step="0.2"
                value={apexZ}
                onChange={(e) => setApexZ(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Lệch đỉnh S (x):</span>
                <span className="font-mono font-bold text-emerald-700">{apexX.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="-2.0"
                max="2.0"
                step="0.2"
                value={apexX}
                onChange={(e) => setApexX(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Thu phóng (Zoom):</span>
                <span className="font-mono font-bold text-emerald-700">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Lesson-Specific Interactive Control Bar */}
          <div className="w-full mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            {selectedLessonIndex === 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kiểm tra: <strong>D = A + C - B</strong> = (-1.4; 1.4; 0) · Tâm O(0.2; 0; 0)</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Bảo toàn hình bình hành SG02
                </span>
              </div>
            )}

            {selectedLessonIndex === 1 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>Thanh trượt tỉ số điểm N trên SB:</span>
                    <span className="font-mono text-emerald-700">
                      SN = {(ratioN * 100).toFixed(0)}% SB ({ratioN === 2 / 3 ? "2:1 chuẩn" : "tùy chỉnh"})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setRatioN(2 / 3)}
                    className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] font-bold"
                  >
                    Về chuẩn 2:1 (2/3)
                  </button>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={ratioN}
                  onChange={(e) => setRatioN(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  {ratioN === 2 / 3
                    ? "✓ Tỉ số SN:NB = 2:1 đồng nghĩa SN lấy 2 phần, NB lấy 1 phần, N nằm gần B hơn S!"
                    : "Đang tùy chỉnh vị trí điểm N trên cạnh bên SB."}
                </p>
              </div>
            )}

            {selectedLessonIndex === 2 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span>
                  <span className="font-bold text-sky-800">Đường AB</span>
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block ml-2"></span>
                  <span className="font-bold text-amber-800">Đường SD</span>
                </div>
                <button
                  type="button"
                  onClick={handleSnapIllusionAngle}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Góc nhìn ảo ảnh SG16 (Cắt nhau trên 2D)</span>
                </button>
              </div>
            )}

            {selectedLessonIndex === 3 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vị trí mặt cắt k (dọc theo SA):</span>
                    <span className="font-mono text-emerald-700">{cutK.toFixed(2)}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    Tỉ số diện tích k² = {(cutK * cutK).toFixed(3)} Sđáy
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={cutK}
                  onChange={(e) => setCutK(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>k = 0.5: Đi qua trung điểm M (diện tích thiết diện = 1/4 diện tích đáy)</span>
                  <button
                    type="button"
                    onClick={() => setCutK(0.5)}
                    className="underline text-emerald-700 font-semibold"
                  >
                    Đặt k = 0.5
                  </button>
                </div>
              </div>
            )}

            {selectedLessonIndex === 4 && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Góc mở trải phẳng các mặt bên:</span>
                    <span className="font-mono text-amber-700">{unfoldAngle}° / 90°</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setUnfoldAngle(0)}
                      className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold text-[10px]"
                    >
                      Gập lại (0°)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnfoldAngle(90)}
                      className="px-2 py-0.5 rounded bg-amber-500 text-white hover:bg-amber-600 font-bold text-[10px]"
                    >
                      Mở phẳng (90°)
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={unfoldAngle}
                  onChange={(e) => setUnfoldAngle(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Khi mở 90°, 4 mặt bên trải phẳng hoàn toàn ra mặt đáy, đường đỏ nối hai đỉnh là đường trắc địa ngắn nhất!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Step-by-Step Pedagogical Instructions & Diagnostic Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card: Current Lesson Guide */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800">
                {currentLesson.code}
              </span>
              <h2 className="font-bold text-sm text-slate-900"><MathFormattedText text={currentLesson.title} /></h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed"><MathFormattedText text={currentLesson.description} /></p>

            <section className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 space-y-3" aria-labelledby="geometry-discovery-title">
              <div className="flex items-center gap-2 text-cyan-950">
                <HelpCircle className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                <h3 id="geometry-discovery-title" className="text-sm font-extrabold">Quan sát hình rồi trả lời</h3>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-slate-800"><MathFormattedText text={discoveryPrompt.prompt} /></p>
              {selectedLessonIndex === 1 && <p className="text-xs text-cyan-900">Đoạn MN được tô màu xanh trên hình. Thử kéo thanh tỉ số của N đến 1:1 để xem đoạn MN đổi hướng thế nào.</p>}
              {selectedLessonIndex === 2 && <p className="text-xs text-cyan-900">Quan sát AB màu xanh và SD màu vàng. Xoay khối để nhận ra giao điểm trên hình chiếu không phải giao điểm trong không gian.</p>}
              <div className="grid gap-2">
                {discoveryPrompt.choices.map((choice, index) => (
                  <button key={choice} type="button" disabled={discoveryChecked} onClick={() => setDiscoveryAnswer(index)} aria-pressed={discoveryAnswer === index} className={`rounded-xl border px-3 py-2.5 text-left text-xs leading-relaxed transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-700 disabled:cursor-default ${discoveryAnswer === index ? "border-cyan-600 bg-white ring-1 ring-cyan-500" : "border-slate-200 bg-white hover:border-cyan-400"}`}>
                    <MathFormattedText text={choice} />
                  </button>
                ))}
              </div>
              {!discoveryChecked ? (
                <button type="button" disabled={discoveryAnswer === null} onClick={() => setDiscoveryChecked(true)} className="rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-45">Kiểm tra câu trả lời</button>
              ) : (
                <div className={`rounded-xl border p-3 text-xs leading-relaxed ${discoveryAnswer === discoveryPrompt.answer ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-amber-300 bg-amber-50 text-amber-950"}`} role="status">
                  <strong>{discoveryAnswer === discoveryPrompt.answer ? "Chính xác." : "Mình cùng xem lại hình nhé."}</strong> <MathFormattedText text={discoveryPrompt.explanation} />
                  <button type="button" onClick={() => { setDiscoveryAnswer(null); setDiscoveryChecked(false); }} className="ml-2 font-bold underline">Thử lại</button>
                </div>
              )}
            </section>

            {/* Steps in this lesson */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {currentLesson.steps.map((st) => (
                <div key={st.stepNumber} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {st.stepNumber}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800">{st.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-7"><MathFormattedText text={st.instruction} /></p>

                  {/* Socratic Questions */}
                  {st.socraticQuestions && st.socraticQuestions.length > 0 && (
                    <div className="mt-2 pl-7 pt-1.5 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3 h-3 text-emerald-600" />
                        <span>Câu hỏi Socratic gợi mở:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                        {st.socraticQuestions.map((q, qIdx) => (
                          <li key={qIdx} className="leading-snug">
                            <MathFormattedText text={q} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Box: Lesson-Specific Misconception Checks */}
          <div className="bg-emerald-50/60 rounded-3xl p-4 sm:p-5 border border-emerald-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-900">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs">
                Chẩn đoán sai lầm nhận thức ({currentLesson.errorCodes.join(", ")})
              </h3>
            </div>
            <div className="text-[11px] text-emerald-800 leading-relaxed space-y-2">
              {selectedLessonIndex === 0 && (
                <>
                  <p>
                    <strong>[SG02] Tự thêm tính chất vuông góc:</strong> <MathFormattedText text="Không được vẽ đáy thành hình chữ nhật hay tự cho $SA \\perp (ABCD)$ nếu đề bài chỉ cho hình chóp tổng quát đáy hình bình hành." />
                  </p>
                  <p>
                    <strong>[SG03] Đỉnh suy biến:</strong> <MathFormattedText text="Đỉnh $S$ bắt buộc có cao độ $z \\ne 0$ để không bị rơi vào mặt phẳng đáy." />
                  </p>
                </>
              )}

              {selectedLessonIndex === 1 && (
                <>
                  <p>
                    <strong>[SG04] Nhầm tỉ số:</strong> <MathFormattedText text="Tỉ số $SN : NB = 2 : 1$ nghĩa là $SN = \\frac{2}{3}SB$ (chia 3 phần), không phải $\\frac{1}{2}SB$." />
                  </p>
                  <p>
                    <strong>[SG05] Điểm ngoài đoạn:</strong> <MathFormattedText text="Điểm $N$ nằm trong đoạn $SB$, gần đỉnh $B$ hơn đỉnh $S$." />
                  </p>
                </>
              )}

              {selectedLessonIndex === 2 && (
                <>
                  <p>
                    <strong>[SG16] Ảo ảnh giao điểm trên hình chiếu 2D:</strong> <MathFormattedText text="Hai đường thẳng $AB$ và $SD$ chéo nhau ($AB \\cap SD = \\emptyset$), nhưng khi xoay đến góc nhìn chiếu phẳng chúng nhìn như cắt nhau. Hãy xoay hình để thấy rõ quan hệ trong không gian!" />
                  </p>
                  <p>
                    <strong>[SG08] Nét khuất:</strong> Nét đứt bị che bởi các mặt bên phía trước, thay đổi trạng thái khi đổi góc nhìn.
                  </p>
                </>
              )}

              {selectedLessonIndex === 3 && (
                <>
                  <p>
                    <strong>[SG10] Điểm ngoài cạnh:</strong> <MathFormattedText text="Thiết diện là đa giác lồi khép kín $MPQR$, 4 đỉnh bắt buộc nằm trên các cạnh của hình chóp." />
                  </p>
                  <p>
                    <strong>[SG11] Tỉ số diện tích:</strong> <MathFormattedText text="Với mặt phẳng song song qua trung điểm $k = 1/2$, tỉ số diện tích là $k^2 = (1/2)^2 = 1/4$ diện tích đáy, không phải $1/2$." />
                  </p>
                </>
              )}

              {selectedLessonIndex === 4 && (
                <>
                  <p>
                    <strong>[SG13] Méo mó kích thước:</strong> Trải phẳng là phép biến hình cứng, bảo toàn 100% độ dài các cạnh và các góc của từng tam giác bên.
                  </p>
                  <p>
                    <strong>[SG14] Chồng lấn mặt:</strong> Các mặt bên được mở xoay quanh từng cạnh đáy tương ứng, không được đè lên nhau.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
