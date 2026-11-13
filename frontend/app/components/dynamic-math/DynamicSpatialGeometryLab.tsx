"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  RotateCcw,
  SlidersHorizontal,
  Scissors,
  PenTool,
  Layers,
  Compass,
} from "lucide-react";
import KatexMath, { formatVNFloat } from "../KatexMath";
import { useDynamicMathStore } from "./useDynamicMathStore";
import ModelMiniChallenge from "./ModelMiniChallenge";
import { formatExactLength, snapToMilestone } from "../../lib/mathDisplay";
import { useMathContext } from "../../lib/mathModelContext";

type SolidType = "pyramid_quad" | "pyramid_tri" | "prism_tri";
type ToolMode = "view" | "add_point" | "add_segment" | "add_midpoint" | "add_plane";

export default function DynamicSpatialGeometryLab() {
  const { params, setParamVal } = useDynamicMathStore();

  const [solidType, setSolidType] = useState<SolidType>("pyramid_quad");
  const [activeTool, setActiveTool] = useState<ToolMode>("view");
  const [showSectionPlane, setShowSectionPlane] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  // Rotation angles for 3D projection
  const [rotX, setRotX] = useState<number>(22);
  const [rotY, setRotY] = useState<number>(-35);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D parameters from store
  const h = params.h?.val ?? 3.5;
  const tiltX = params.tiltX?.val ?? 0;
  const tiltY = params.tiltY?.val ?? 0;
  const planeZ = params.planeZ?.val ?? 1.8;
  const baseW = params.baseWidth?.val ?? 4;
  useEffect(() => {
    useMathContext.getState().setCurrent({ moduleName: "spatial_geometry", modelTitle: "Hình chóp và thiết diện song song đáy", parameters: { h, tiltX, tiltY, planeZ, baseWidth: baseW }, keyProperties: ["Mặt phẳng cắt song song đáy tạo đa giác đồng dạng với đáy", "Tỷ số đồng dạng k = (h-z_p)/h"] });
  }, [h, tiltX, tiltY, planeZ, baseW]);
  useEffect(() => () => useMathContext.getState().clear("spatial_geometry"), []);

  // Custom added geometric objects
  const [customPoints, setCustomPoints] = useState<{ name: string; x: number; y: number; z: number }[]>([]);
  const [customSegments, setCustomSegments] = useState<{ p1: string; p2: string; color: string }[]>([]);

  // 3D Coordinates definitions: [x, y, z]
  // In our 3D math space: Oxy is the ground plane (z = 0), Oz is vertical up
  const solidModel = useMemo(() => {
    if (solidType === "pyramid_quad") {
      // S.ABCD (Chóp tứ giác)
      const apex: [number, number, number] = [tiltX, tiltY, h];
      const base: { name: string; coord: [number, number, number] }[] = [
        { name: "A", coord: [-baseW / 2, -baseW / 2, 0] },
        { name: "B", coord: [baseW / 2, -baseW / 2, 0] },
        { name: "C", coord: [baseW / 2, baseW / 2, 0] },
        { name: "D", coord: [-baseW / 2, baseW / 2, 0] },
      ];
      const edges: { from: string; to: string; isHidden?: boolean; isAltitude?: boolean }[] = [
        // Base edges: AB, BC, CD visible, DA hidden (traditional SGK)
        { from: "A", to: "B", isHidden: true },
        { from: "B", to: "C", isHidden: false },
        { from: "C", to: "D", isHidden: false },
        { from: "D", to: "A", isHidden: true },
        // Lateral edges
        { from: "S", to: "A", isHidden: true },
        { from: "S", to: "B", isHidden: false },
        { from: "S", to: "C", isHidden: false },
        { from: "S", to: "D", isHidden: false },
      ];
      // Altitude line SH: from S down to H(tiltX, tiltY, 0)
      const altitude = { from: "S", to: "H", start: apex, end: [tiltX, tiltY, 0] as [number, number, number] };
      return { apex, base, edges, altitude, title: "Hình chóp tứ giác S.ABCD" };
    } else if (solidType === "pyramid_tri") {
      // S.ABC (Chóp tam giác)
      const apex: [number, number, number] = [tiltX, tiltY, h];
      const base: { name: string; coord: [number, number, number] }[] = [
        { name: "A", coord: [0, -baseW * 0.5, 0] },
        { name: "B", coord: [baseW * 0.7, baseW * 0.4, 0] },
        { name: "C", coord: [-baseW * 0.7, baseW * 0.4, 0] },
      ];
      const edges = [
        { from: "A", to: "B", isHidden: true },
        { from: "B", to: "C", isHidden: false },
        { from: "C", to: "A", isHidden: false },
        { from: "S", to: "A", isHidden: true },
        { from: "S", to: "B", isHidden: false },
        { from: "S", to: "C", isHidden: false },
      ];
      const altitude = { from: "S", to: "H", start: apex, end: [tiltX, tiltY, 0] as [number, number, number] };
      return { apex, base, edges, altitude, title: "Hình chóp tam giác S.ABC" };
    } else {
      // ABC.A'B'C' (Lăng trụ tam giác)
      const base1: { name: string; coord: [number, number, number] }[] = [
        { name: "A", coord: [-baseW * 0.5, -baseW * 0.3, 0] },
        { name: "B", coord: [baseW * 0.6, -baseW * 0.3, 0] },
        { name: "C", coord: [0, baseW * 0.6, 0] },
      ];
      const base2: { name: string; coord: [number, number, number] }[] = [
        { name: "A'", coord: [-baseW * 0.5 + tiltX, -baseW * 0.3 + tiltY, h] },
        { name: "B'", coord: [baseW * 0.6 + tiltX, -baseW * 0.3 + tiltY, h] },
        { name: "C'", coord: [tiltX, baseW * 0.6 + tiltY, h] },
      ];
      const edges = [
        // Base 1
        { from: "A", to: "B", isHidden: false },
        { from: "B", to: "C", isHidden: false },
        { from: "C", to: "A", isHidden: true },
        // Base 2
        { from: "A'", to: "B'", isHidden: false },
        { from: "B'", to: "C'", isHidden: false },
        { from: "C'", to: "A'", isHidden: false },
        // Lateral
        { from: "A", to: "A'", isHidden: false },
        { from: "B", to: "B'", isHidden: false },
        { from: "C", to: "C'", isHidden: true },
      ];
      return {
        apex: [tiltX, tiltY, h] as [number, number, number],
        base: [...base1, ...base2],
        edges,
        altitude: null,
        title: "Hình lăng trụ tam giác ABC.A'B'C'",
      };
    }
  }, [solidType, h, tiltX, tiltY, baseW]);

  // Dynamic cross-section polygon (Mặt phẳng cắt z = planeZ)
  // For pyramid: section cuts each lateral edge SA, SB, SC, SD at z = planeZ
  const sectionVertices = useMemo(() => {
    if (solidType === "prism_tri" || planeZ >= h || planeZ <= 0) return [];
    // Tỉ lệ cắt dọc theo chiều cao: ratio = (h - planeZ) / h
    const ratio = (h - planeZ) / h;
    return solidModel.base.map((bPt) => {
      // Intersection on lateral edge S - B
      const ix = solidModel.apex[0] + (bPt.coord[0] - solidModel.apex[0]) * ratio;
      const iy = solidModel.apex[1] + (bPt.coord[1] - solidModel.apex[1]) * ratio;
      return {
        name: `${bPt.name}_p`,
        coord: [ix, iy, planeZ] as [number, number, number],
      };
    });
  }, [solidModel, planeZ, h, solidType]);

  // 3D to 2D Isometric / Perspective Projection
  const project3D = (coord: [number, number, number]): { x: number; y: number } => {
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // Rotate around Y axis
    const x1 = coord[0] * Math.cos(radY) + coord[1] * Math.sin(radY);
    const y1 = -coord[0] * Math.sin(radY) + coord[1] * Math.cos(radY);
    const z1 = coord[2];

    // Rotate around X axis
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    // Canvas mapping (Center at (260, 240), scale = 36)
    const scale = 36;
    const screenX = 260 + x1 * scale;
    const screenY = 240 - z2 * scale; // Note: z2 vertical up maps to negative screen Y
    return { x: screenX, y: screenY };
  };

  // Mouse rotation handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isRotating) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotY((prev) => (prev + dx * 0.7) % 360);
    setRotX((prev) => Math.max(-60, Math.min(80, prev + dy * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => setIsRotating(false);

  // Map all points for easy lookup
  const pointMap = useMemo(() => {
    const map = new Map<string, [number, number, number]>();
    map.set("S", solidModel.apex);
    map.set("H", [tiltX, tiltY, 0]);
    solidModel.base.forEach((b) => map.set(b.name, b.coord));
    customPoints.forEach((p) => map.set(p.name, [p.x, p.y, p.z]));
    return map;
  }, [solidModel, tiltX, tiltY, customPoints]);

  // Section polygon points string
  const sectionPointsStr = sectionVertices
    .map((v) => {
      const p = project3D(v.coord);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  // Dựng trung điểm nhanh (Midpoint tool action)
  const handleCreateMidpoint = () => {
    if (solidModel.base.length > 0) {
      const b = solidModel.base[0];
      const s = solidModel.apex;
      const midCoord = {
        name: `M_${customPoints.length + 1}`,
        x: (s[0] + b.coord[0]) / 2,
        y: (s[1] + b.coord[1]) / 2,
        z: (s[2] + b.coord[2]) / 2,
      };
      setCustomPoints((prev) => [...prev, midCoord]);
      setCustomSegments((prev) => [
        ...prev,
        { p1: midCoord.name, p2: solidModel.base[1]?.name || "B", color: "#0ea5e9" },
      ]);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Cột trái: Khung 3D tương tác đa chiều */}
      <div className="lg:col-span-8 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        {/* Header điều khiển mô hình & góc nhìn */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">{solidModel.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-semibold">
              KNTT Bài 10-12
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bộ công cụ dựng hình SGK */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTool("view")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  activeTool === "view" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600"
                }`}
                title="Chế độ xoay 3D tự do"
              >
                Xoay 3D
              </button>
              <button
                type="button"
                onClick={handleCreateMidpoint}
                className="px-2 py-1 rounded text-[11px] font-bold text-slate-700 hover:text-emerald-800 flex items-center gap-1"
                title="Dựng trung điểm cạnh bên"
              >
                <PenTool className="w-3 h-3 text-emerald-600" />
                <span>+ Trung điểm M</span>
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setShowSectionPlane((v) => !v)}
                className={`p-1 rounded text-xs transition-all ${
                  showSectionPlane ? "bg-rose-100 text-rose-800" : "text-slate-500"
                }`}
                title="Bật/Tắt Mặt phẳng thiết diện (P)"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowAxes((v) => !v)}
                className={`p-1 rounded text-xs transition-all ${
                  showAxes ? "bg-blue-100 text-blue-800" : "text-slate-500"
                }`}
                title="Bật/Tắt Trục tọa độ Oxyz"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRotX(22);
                setRotY(-35);
              }}
              title="Đặt lại góc nhìn phối cảnh chuẩn"
              className="p-1 rounded hover:bg-slate-100 text-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3D SVG Projection Canvas */}
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-[#f9fbfa] to-[#edf3f1]">
          <svg
            viewBox="0 0 520 440"
            className="w-full h-auto cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Lưới sàn Oxy 3D */}
            {showAxes && (
              <g opacity="0.6">
                {Array.from({ length: 9 }, (_, i) => i - 4).map((i) => {
                  const p1 = project3D([i, -4, 0]);
                  const p2 = project3D([i, 4, 0]);
                  const p3 = project3D([-4, i, 0]);
                  const p4 = project3D([4, i, 0]);
                  return (
                    <g key={`grid-3d-${i}`}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#d1d5db" strokeWidth="0.8" />
                      <line x1={p3.x} y1={p3.y} x2={p4.x} y2={p4.y} stroke="#d1d5db" strokeWidth="0.8" />
                    </g>
                  );
                })}
              </g>
            )}

            {/* Hệ trục tọa độ Oxyz */}
            {showAxes && (
              <g>
                {/* Ox (Đỏ) */}
                {(() => {
                  const o = project3D([0, 0, 0]);
                  const xEnd = project3D([4.5, 0, 0]);
                  const yEnd = project3D([0, 4.5, 0]);
                  const zEnd = project3D([0, 0, 4.5]);
                  return (
                    <>
                      <line x1={o.x} y1={o.y} x2={xEnd.x} y2={xEnd.y} stroke="#dc2626" strokeWidth="1.5" />
                      <text x={xEnd.x + 4} y={xEnd.y + 4} fontSize="10" fill="#dc2626" fontWeight="bold">
                        x
                      </text>
                      <line x1={o.x} y1={o.y} x2={yEnd.x} y2={yEnd.y} stroke="#16a34a" strokeWidth="1.5" />
                      <text x={yEnd.x + 4} y={yEnd.y + 4} fontSize="10" fill="#16a34a" fontWeight="bold">
                        y
                      </text>
                      <line x1={o.x} y1={o.y} x2={zEnd.x} y2={zEnd.y} stroke="#2563eb" strokeWidth="1.5" />
                      <text x={zEnd.x - 12} y={zEnd.y - 4} fontSize="10" fill="#2563eb" fontWeight="bold">
                        z
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* 1. Mặt phẳng thiết diện (P) cắt qua khối */}
            {showSectionPlane && sectionVertices.length >= 3 && (
              <polygon
                points={sectionPointsStr}
                fill="#f43f5e"
                fillOpacity="0.35"
                stroke="#e11d48"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}

            {/* 2. Đường cao SH hạ vuông góc xuống đáy */}
            {solidModel.altitude && (
              <g>
                {(() => {
                  const s = project3D(solidModel.altitude.start);
                  const hPt = project3D(solidModel.altitude.end);
                  return (
                    <>
                      <line
                        x1={s.x}
                        y1={s.y}
                        x2={hPt.x}
                        y2={hPt.y}
                        stroke="#dc2626"
                        strokeWidth="2.2"
                        strokeDasharray="3 3"
                      />
                      <circle cx={hPt.x} cy={hPt.y} r="3" fill="#dc2626" />
                      <text x={hPt.x + 6} y={hPt.y + 12} fontSize="10" fill="#dc2626" fontWeight="bold">
                        H
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* 3. Render các cạnh (Edges) của khối đa diện */}
            {solidModel.edges.map((e, idx) => {
              const p1Coord = pointMap.get(e.from);
              const p2Coord = pointMap.get(e.to);
              if (!p1Coord || !p2Coord) return null;
              const sp1 = project3D(p1Coord);
              const sp2 = project3D(p2Coord);

              return (
                <line
                  key={`edge-${idx}-${e.from}-${e.to}`}
                  x1={sp1.x}
                  y1={sp1.y}
                  x2={sp2.x}
                  y2={sp2.y}
                  stroke="#1e293b"
                  strokeWidth={e.isHidden ? "1.4" : "2"}
                  strokeDasharray={e.isHidden ? "4 3" : undefined}
                  strokeOpacity={e.isHidden ? "0.6" : "0.95"}
                />
              );
            })}

            {/* 4. Đoạn thẳng tự dựng (Custom Segments) */}
            {customSegments.map((seg, idx) => {
              const c1 = pointMap.get(seg.p1);
              const c2 = pointMap.get(seg.p2);
              if (!c1 || !c2) return null;
              const sp1 = project3D(c1);
              const sp2 = project3D(c2);
              return (
                <line
                  key={`custom-seg-${idx}`}
                  x1={sp1.x}
                  y1={sp1.y}
                  x2={sp2.x}
                  y2={sp2.y}
                  stroke={seg.color}
                  strokeWidth="2.2"
                />
              );
            })}

            {/* 5. Render các Đỉnh Đáy và Đỉnh S */}
            {/* Đỉnh S */}
            {(() => {
              const sp = project3D(solidModel.apex);
              return (
                <g>
                  <circle cx={sp.x} cy={sp.y} r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                  <text x={sp.x - 4} y={sp.y - 8} fontSize="12" fill="#dc2626" fontWeight="bold">
                    S
                  </text>
                </g>
              );
            })()}

            {/* Các đỉnh đáy */}
            {solidModel.base.map((b) => {
              const sp = project3D(b.coord);
              return (
                <g key={`pt-${b.name}`}>
                  <circle cx={sp.x} cy={sp.y} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={sp.x + 6} y={sp.y + 12} fontSize="11" fill="#1e40af" fontWeight="bold">
                    {b.name}
                  </text>
                </g>
              );
            })}

            {/* Điểm tự tạo M */}
            {customPoints.map((cp) => {
              const sp = project3D([cp.x, cp.y, cp.z]);
              return (
                <g key={`cp-${cp.name}`}>
                  <circle cx={sp.x} cy={sp.y} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={sp.x + 6} y={sp.y - 6} fontSize="11" fill="#0284c7" fontWeight="bold">
                    {cp.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Thanh trượt mặt phẳng cắt (P) */}
        <div className="w-full mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-rose-600" />
              <span>Mặt phẳng cắt (P): Tịnh tiến độ cao z_p để biến đổi thiết diện:</span>
            </span>
            <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
              z_p = {formatVNFloat(planeZ)} m
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={h - 0.2}
            step={0.1}
            value={planeZ}
            onChange={(e) => setParamVal("planeZ", snapToMilestone(parseFloat(e.target.value), [0.5, 1, 1.5, 2, 3, 4], 0.11))}
            className="w-full accent-rose-600 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>z = 0 (Trùng đáy)</span>
            <span className="text-slate-500">Thiết diện: Đa giác đồng dạng đáy tỉ lệ k = (h - z_p)/h</span>
            <span>z = {formatVNFloat(h)} (Đỉnh S)</span>
          </div>
        </div>
      </div>

      {/* Cột phải: Chọn khối đa diện & Điều khiển hình học */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Chọn mô hình đa diện chuẩn SGK */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">Chọn mô hình Đa diện SGK:</span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSolidType("pyramid_quad")}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                solidType === "pyramid_quad"
                  ? "bg-teal-50 border-teal-500 text-teal-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Chóp S.ABCD
            </button>
            <button
              type="button"
              onClick={() => setSolidType("pyramid_tri")}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                solidType === "pyramid_tri"
                  ? "bg-teal-50 border-teal-500 text-teal-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Chóp S.ABC
            </button>
            <button
              type="button"
              onClick={() => setSolidType("prism_tri")}
              className={`p-2 rounded-xl border text-center font-bold transition-all ${
                solidType === "prism_tri"
                  ? "bg-teal-50 border-teal-500 text-teal-800 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Lăng trụ 3D
            </button>
          </div>
        </div>

        {/* Bảng tinh chỉnh kích thước hình chóp */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
            <span>Kích thước & Độ nghiêng đỉnh S:</span>
          </span>

          {/* Chiều cao h */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Chiều cao SH (h):</span>
              <span className="font-mono font-bold text-teal-800">{formatVNFloat(h)} m</span>
              <span className="text-[10px] text-teal-800"><KatexMath math={`h=${formatExactLength(h)}\\,\\mathrm m`} /></span>
            </div>
            <input
              type="range"
              min={1.5}
              max={6.0}
              step={0.1}
              value={h}
              onChange={(e) => setParamVal("h", snapToMilestone(parseFloat(e.target.value), [1.5, 2, 3, 4, 5, 6], 0.11))}
              className="w-full accent-teal-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>

          {/* Độ nghiêng tiltX */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Độ xiên đỉnh S (Ox):</span>
              <span className="font-mono font-bold text-slate-800">{formatVNFloat(tiltX)}</span>
            </div>
            <input
              type="range"
              min={-2}
              max={2}
              step={0.1}
              value={tiltX}
              onChange={(e) => setParamVal("tiltX", snapToMilestone(parseFloat(e.target.value), [-2, -1.5, -1, 0, 1, 1.5, 2], 0.11))}
              className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>

          {/* Kích thước đáy a */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Cạnh đáy a:</span>
              <span className="font-mono font-bold text-slate-800">{formatVNFloat(baseW)} m</span>
              <span className="text-[10px] text-slate-800"><KatexMath math={`a=${formatExactLength(baseW)}\\,\\mathrm m`} /></span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={0.2}
              value={baseW}
              onChange={(e) => setParamVal("baseWidth", snapToMilestone(parseFloat(e.target.value), [2, 3, 4, 5, 6], 0.11))}
              className="w-full accent-slate-600 cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>
        </div>

        {/* Quy tắc quan sát hình không gian SGK */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5 text-xs text-slate-600">
          <span className="font-bold text-slate-800 block">Quy tắc vẽ hình không gian (SGK Toán 11):</span>
          <p>• <strong>Cạnh nhìn thấy:</strong> Vẽ bằng nét liền đậm (—).</p>
          <p>• <strong>Cạnh bị che khuất:</strong> Vẽ bằng nét đứt đoạn (- - -).</p>
          <p>• <strong>Thiết diện cắt:</strong> Mặt phẳng (P) // (Đáy) thì thiết diện là đa giác đồng dạng với đáy với tỉ số k = (h - z_p)/h.</p>
        </div>
        <ModelMiniChallenge title="Thiết diện hình chóp" instruction="Đặt chiều cao h = 4 m." value={h} target={4} epsilon={0.11} sliderExplanation="h=4\\,\\mathrm m" question="Nếu mặt phẳng cắt song song với đáy, thiết diện có tính chất nào?" answers={[{ label: "Đồng dạng với đáy", correct: true }, { label: "Luôn bằng đáy", correct: false }, { label: "Luôn là đường tròn", correct: false }]} answerExplanation="k=\\frac{h-z_p}{h}" onIncorrectAnswer={() => { setParamVal("h", 4); setParamVal("planeZ", 2); }} />
      </div>
    </div>
  );
}
