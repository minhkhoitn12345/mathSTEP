"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  Grid3X3,
  Layers,
  Scissors,
  Lightbulb,
  Play,
  Pause,
  Compass,
  Download,
} from "lucide-react";
import { ResolvedGeometryScene } from "../lib/geometrySolver";

interface Geometry3DViewerProps {
  scene: ResolvedGeometryScene;
  onAskTutor?: (question: string) => void;
  className?: string;
}

// Chuyển đổi tọa độ Toán Oxyz (Z thẳng đứng lên trên) sang Three.js (Y thẳng đứng lên trên)
// Math: [x, y, z] -> Three.js: [x, z, -y]
function mathToThree(coord: [number, number, number]): [number, number, number] {
  return [coord[0], coord[2], -coord[1]];
}

// -------------------------------------------------------------
// Component Oxyz System Helper (Chuẩn Toán THPT Việt Nam)
// -------------------------------------------------------------
function MathOxyzAxes({ size = 5 }: { size?: number }) {
  const lineR = 0.02;
  const coneR = 0.08;
  const coneH = 0.25;

  return (
    <group position={[0, 0, 0]}>
      {/* Trục Ox (Đỏ #EF4444) -> Hướng Three.js +X */}
      <mesh position={[size / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <mesh position={[size, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#ef4444" roughness={0.3} />
      </mesh>
      <Html position={[size + 0.3, 0, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <span className="text-[10px] font-bold text-red-600 bg-white/90 px-1 rounded shadow-sm">x</span>
      </Html>

      {/* Trục Oz (Xanh dương #3B82F6 - Thẳng đứng lên trên) -> Hướng Three.js +Y */}
      <mesh position={[0, size / 2, 0]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>
      <mesh position={[0, size, 0]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} />
      </mesh>
      <Html position={[0, size + 0.3, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <span className="text-[10px] font-bold text-blue-600 bg-white/90 px-1 rounded shadow-sm">z</span>
      </Html>

      {/* Trục Oy (Xanh lục #10B981) -> Hướng Three.js -Z */}
      <mesh position={[0, 0, -size / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -size]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.3} />
      </mesh>
      <Html position={[0, 0, -size - 0.3]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <span className="text-[10px] font-bold text-emerald-600 bg-white/90 px-1 rounded shadow-sm">y</span>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Component vẽ Cạnh Cylinder 3D mượt mà
// -------------------------------------------------------------
function CylinderEdge({
  start,
  end,
  color = "#1e293b",
  radius = 0.024,
  dashed = false,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  radius?: number;
  dashed?: boolean;
}) {
  const [sx, sy, sz] = start;
  const [ex, ey, ez] = end;

  const { distance, position, orientation, dashedLine } = useMemo(() => {
    const p1 = new THREE.Vector3(...mathToThree([sx, sy, sz]));
    const p2 = new THREE.Vector3(...mathToThree([ex, ey, ez]));
    const dist = p1.distanceTo(p2);
    const pos = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const rot = new THREE.Euler().setFromQuaternion(quat);

    let dLine: THREE.Line | null = null;
    if (dashed) {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const mat = new THREE.LineDashedMaterial({
        color: color || "#94a3b8",
        dashSize: 0.16,
        gapSize: 0.12,
        linewidth: 2,
      });
      dLine = new THREE.Line(geo, mat);
      dLine.computeLineDistances();
    }

    return {
      distance: dist,
      position: pos,
      orientation: rot,
      dashedLine: dLine,
    };
  }, [sx, sy, sz, ex, ey, ez, dashed, color]);

  if (dashed && dashedLine) {
    return <primitive object={dashedLine} />;
  }

  return (
    <mesh position={position} rotation={orientation}>
      <cylinderGeometry args={[radius, radius, distance, 12]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
    </mesh>
  );
}

// -------------------------------------------------------------
// Component vẽ Mặt phẳng Polygon 3D (Faces & Section Planes)
// -------------------------------------------------------------
function PolygonFace({
  vertices,
  indices,
  color,
  opacity,
}: {
  vertices: [number, number, number][];
  indices: number[];
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (const v of vertices) {
      const p = mathToThree(v);
      positions.push(p[0], p[1], p[2]);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        roughness={0.4}
      />
    </mesh>
  );
}

// -------------------------------------------------------------
// Ký hiệu góc vuông tại chân đường cao (Right Angle Symbol)
// -------------------------------------------------------------
function RightAngleSymbol({
  foot,
  size = 0.28,
}: {
  foot: [number, number, number];
  apex?: [number, number, number];
  size?: number;
}) {
  const [fx, fy, fz] = foot;
  const lineObj = useMemo(() => {
    const f = mathToThree([fx, fy, fz]);
    const pts = [
      new THREE.Vector3(f[0] + size, f[1], f[2]),
      new THREE.Vector3(f[0] + size, f[1] + size, f[2]),
      new THREE.Vector3(f[0], f[1] + size, f[2]),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: "#dc2626", linewidth: 2 });
    return new THREE.Line(geo, mat);
  }, [fx, fy, fz, size]);

  return <primitive object={lineObj} />;
}

// -------------------------------------------------------------
// Scene Controller (Auto-rotation & Camera views)
// -------------------------------------------------------------
function SceneController({ autoRotate }: { autoRotate: boolean }) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  useFrame(() => {
    if (autoRotate && controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 1.8;
      controlsRef.current.update();
    } else if (controlsRef.current) {
      controlsRef.current.autoRotate = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={3}
      maxDistance={22}
      target={[0, 1.4, 0]}
    />
  );
}

// -------------------------------------------------------------
// COMPONENT CHÍNH: Geometry3DViewer
// -------------------------------------------------------------
export default function Geometry3DViewer({ scene, onAskTutor, className = "" }: Geometry3DViewerProps) {
  const [showAxes, setShowAxes] = useState(true);
  const [showFaces, setShowFaces] = useState(true);
  const [showSection, setShowSection] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Snapshot PNG Export
  const handleSnapshot = () => {
    const canvas = containerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `MathSTEP_3D_${scene.solidType}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[480px] bg-gradient-to-b from-[#f8fafc] to-[#edf3f2] rounded-2xl overflow-hidden flex flex-col border border-slate-200 shadow-sm ${className}`}
    >
      {/* 1. Header Toolbar trên Canvas */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-sm pointer-events-auto flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 truncate max-w-[220px] sm:max-w-md">
            {scene.title}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase font-semibold">
            {scene.solidType}
          </span>
        </div>

        {/* Nút thao tác nhanh */}
        <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200/80 shadow-sm pointer-events-auto">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            title={autoRotate ? "Dừng xoay" : "Tự động xoay 360°"}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              autoRotate ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowAxes((v) => !v)}
            title="Bật/Tắt Hệ trục tọa độ Oxyz"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              showAxes ? "bg-blue-100 text-blue-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFaces((v) => !v)}
            title="Bật/Tắt Mặt mờ 3D"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              showFaces ? "bg-amber-100 text-amber-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          {scene.sectionPlanes.length > 0 && (
            <button
              onClick={() => setShowSection((v) => !v)}
              title="Bật/Tắt Thiết diện cắt"
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                showSection ? "bg-rose-100 text-rose-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Scissors className="w-4 h-4 text-rose-600" />
            </button>
          )}
          <button
            onClick={() => setShowGrid((v) => !v)}
            title="Bật/Tắt Lưới mặt đáy"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              showGrid ? "bg-slate-200 text-slate-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleSnapshot}
            title="Chụp ảnh mô hình PNG"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. WebGL 3D Canvas */}
      <div className="flex-1 w-full h-full">
        <Canvas
          frameloop={autoRotate ? "always" : "demand"}
          dpr={[1, 1.5]}
          camera={{ position: [5.2, 4.5, 6.2], fov: 45 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#f8fafc"]} />
          <SceneController autoRotate={autoRotate} />

          {/* Ánh sáng Studio 3 điểm */}
          <ambientLight intensity={0.75} />
          <directionalLight position={[6, 10, 6]} intensity={1.1} castShadow />
          <directionalLight position={[-6, 6, -6]} intensity={0.4} />

          {/* Lưới sàn Oxy */}
          {showGrid && (
            <gridHelper
              args={[10, 10, "#94a3b8", "#e2e8f0"]}
              position={[0, -0.01, 0]}
            />
          )}

          {/* Trục tọa độ Oxyz */}
          {showAxes && <MathOxyzAxes size={4.8} />}

          {/* 3. Render Các Cạnh (Edges) */}
          {scene.edges.map((e, idx) => (
            <CylinderEdge
              key={`edge-${idx}-${e.from}-${e.to}`}
              start={e.start}
              end={e.end}
              color={
                e.style === "altitude"
                  ? "#dc2626"
                  : e.style === "special"
                  ? e.color || "#0ea5e9"
                  : e.style === "dashed"
                  ? "#64748b"
                  : "#1e293b"
              }
              radius={e.style === "altitude" ? 0.034 : e.style === "special" ? 0.026 : 0.02}
              dashed={e.style === "dashed"}
            />
          ))}

          {/* Ký hiệu góc vuông tại chân đường cao */}
          {scene.altitudeFoot && (
            <RightAngleSymbol
              foot={scene.altitudeFoot.foot}
              apex={scene.altitudeFoot.apex}
              size={0.28}
            />
          )}

          {/* 4. Render Các Mặt (Faces) */}
          {showFaces &&
            scene.faces.map((f, idx) => (
              <PolygonFace
                key={`face-${idx}`}
                vertices={f.vertices}
                indices={f.indices}
                color={f.color}
                opacity={f.opacity}
              />
            ))}

          {/* 5. Render Thiết diện / Mặt phẳng cắt (Section Planes) */}
          {showSection &&
            scene.sectionPlanes.map((sp, idx) => (
              <PolygonFace
                key={`section-${idx}`}
                vertices={sp.vertices}
                indices={sp.indices}
                color={sp.color}
                opacity={sp.opacity}
              />
            ))}

          {/* 6. Render Khối tròn xoay đặc biệt (Nón / Trụ / Cầu) */}
          {scene.curvedMesh?.type === "cone" && (
            <group position={[0, scene.curvedMesh.height / 2, 0]}>
              <mesh>
                <coneGeometry args={[scene.curvedMesh.radius, scene.curvedMesh.height, 32, 1, true]} />
                <meshStandardMaterial color="#0284c7" transparent opacity={0.16} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}

          {scene.curvedMesh?.type === "cylinder" && (
            <group position={[0, scene.curvedMesh.height / 2, 0]}>
              <mesh>
                <cylinderGeometry args={[scene.curvedMesh.radius, scene.curvedMesh.radius, scene.curvedMesh.height, 32, 1, true]} />
                <meshStandardMaterial color="#059669" transparent opacity={0.16} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )}

          {/* 7. Render Các Đỉnh (Vertices & Labels) */}
          {scene.points.map((p) => {
            const threePos = mathToThree(p.coord);
            return (
              <group key={`point-${p.name}`} position={threePos}>
                {/* Quả cầu đỉnh */}
                <mesh>
                  <sphereGeometry args={[p.isApex ? 0.075 : p.isSpecial ? 0.065 : 0.055, 16, 16]} />
                  <meshStandardMaterial
                    color={p.color || "#1e293b"}
                    roughness={0.2}
                    metalness={0.4}
                  />
                </mesh>

                {/* Nhãn Billboard luôn quay về camera */}
                <Html position={[0, 0.18, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
                  <div
                    className={`px-1.5 py-0.5 rounded-md font-bold text-xs select-none shadow-sm flex items-center gap-1 ${
                      p.isApex
                        ? "bg-red-500 text-white"
                        : p.isSpecial
                        ? "bg-amber-500 text-slate-950 font-black"
                        : p.isFoot
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-white/95 text-slate-800 border border-slate-200"
                    }`}
                  >
                    <span>{p.name}</span>
                  </div>
                </Html>
              </group>
            );
          })}
        </Canvas>
      </div>

      {/* 3. Footer Thống kê hình học & Gợi ý câu hỏi Socratic */}
      <div className="p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-800">Quan hệ hình học:</span>
          {scene.relations.slice(0, 3).map((r, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-mono text-slate-700"
            >
              {r.replace(/_/g, " ")}
            </span>
          ))}
          {scene.sectionPlanes.length > 0 && (
            <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-md text-[11px] font-semibold">
              Thiết diện: {scene.sectionPlanes.map((s) => s.name).join(", ")}
            </span>
          )}
        </div>

        {/* Gợi ý hỏi trợ lý Socratic */}
        {scene.suggestedQuestions.length > 0 && onAskTutor && (
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="text-[11px] text-slate-500 hidden md:inline">Gợi ý học tập:</span>
            <button
              onClick={() => onAskTutor(scene.suggestedQuestions[0])}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#087e7c] hover:bg-[#076a68] text-white rounded-lg text-xs font-medium shadow-sm transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{scene.suggestedQuestions[0]}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
