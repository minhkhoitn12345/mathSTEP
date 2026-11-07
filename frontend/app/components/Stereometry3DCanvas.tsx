"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Grid } from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCcw,
  Eye,
  Sparkles,
  MapPin,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import KatexMath, { formatVNFloat } from "./KatexMath";

export interface Stereometry3DCanvasProps {
  foldPercent?: number; // 0: unfolded flat, 100: fully folded 3D pyramid
  onFoldPercentChange?: (val: number) => void;
  apexHeight?: number; // Chiều cao H của chóp S.ABCD
  onApexHeightChange?: (val: number) => void;
  baseWidth?: number;
  baseDepth?: number;
  orthogonalView?: boolean;
  onToggleOrthogonalView?: () => void;
  className?: string;
}

// -------------------------------------------------------------
// Component DynamicPyramidMeshAndEdges:
// Tính toán Cạnh Thấy / Cạnh Khuất 60fps & Billboard KaTeX Labels
// -------------------------------------------------------------
interface DynamicEdgesProps {
  apex: THREE.Vector3;
  baseA: THREE.Vector3;
  baseB: THREE.Vector3;
  baseC: THREE.Vector3;
  baseD: THREE.Vector3;
  foldT: number; // 0 -> 1
  showCoordinates: boolean;
  showNormalVector: boolean;
  showPerpendicularSymbol: boolean;
  showDiagonals: boolean;
}

function DynamicPyramidMeshAndEdges({
  apex,
  baseA,
  baseB,
  baseC,
  baseD,
  foldT,
  showCoordinates,
  showNormalVector,
  showPerpendicularSymbol,
  showDiagonals,
}: DynamicEdgesProps) {
  const { camera } = useThree();

  // Tính toán vị trí các đỉnh mặt bên khi khai triển bản lề (Hinge rotation)
  const currentFaces = useMemo(() => {
    const getHingeApex = (
      edgeStart: THREE.Vector3,
      edgeEnd: THREE.Vector3,
      apexOriginal: THREE.Vector3,
      t: number
    ) => {
      if (t >= 0.999) return apexOriginal.clone();

      const edge = new THREE.Vector3().subVectors(edgeEnd, edgeStart).normalize();
      const mid = new THREE.Vector3().addVectors(edgeStart, edgeEnd).multiplyScalar(0.5);
      const hFace = mid.distanceTo(apexOriginal);

      const outward = new THREE.Vector3().crossVectors(edge, new THREE.Vector3(0, 1, 0)).normalize();
      const flatS = new THREE.Vector3().addVectors(mid, outward.clone().multiplyScalar(hFace));

      return new THREE.Vector3().lerpVectors(flatS, apexOriginal, t);
    };

    const sAB = getHingeApex(baseA, baseB, apex, foldT);
    const sBC = getHingeApex(baseB, baseC, apex, foldT);
    const sCD = getHingeApex(baseC, baseD, apex, foldT);
    const sDA = getHingeApex(baseD, baseA, apex, foldT);

    return { sAB, sBC, sCD, sDA };
  }, [apex, baseA, baseB, baseC, baseD, foldT]);

  const linesGroupRef = useRef<THREE.Group | null>(null);

  // Materials: Nét liền (Thấy) & Nét đứt (Khuất)
  const solidMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xf8fafc, // Trắng ngọc Slate-50
        linewidth: 2.5,
      }),
    []
  );

  const dashedMaterial = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: 0x94a3b8, // Xám bạc Slate-400
        dashSize: 0.22,
        gapSize: 0.16,
      }),
    []
  );

  const diagonalDashedMat = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: 0x64748b, // Slate-500
        dashSize: 0.15,
        gapSize: 0.15,
      }),
    []
  );

  const rightAngleMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0xf43f5e, // Rose-500
        linewidth: 2,
      }),
    []
  );

  // Tạo BufferGeometries cho các mặt để phủ chất liệu Kính Mờ Frosted Glass
  const faceGeometries = useMemo(() => {
    const baseGeo = new THREE.BufferGeometry();
    const baseVerts = new Float32Array([
      baseA.x, baseA.y, baseA.z,
      baseB.x, baseB.y, baseB.z,
      baseC.x, baseC.y, baseC.z,
      baseA.x, baseA.y, baseA.z,
      baseC.x, baseC.y, baseC.z,
      baseD.x, baseD.y, baseD.z,
    ]);
    baseGeo.setAttribute("position", new THREE.BufferAttribute(baseVerts, 3));
    baseGeo.computeVertexNormals();

    const sabGeo = new THREE.BufferGeometry();
    const sabVerts = new Float32Array([
      baseA.x, baseA.y, baseA.z,
      baseB.x, baseB.y, baseB.z,
      currentFaces.sAB.x, currentFaces.sAB.y, currentFaces.sAB.z,
    ]);
    sabGeo.setAttribute("position", new THREE.BufferAttribute(sabVerts, 3));
    sabGeo.computeVertexNormals();

    const sbcGeo = new THREE.BufferGeometry();
    const sbcVerts = new Float32Array([
      baseB.x, baseB.y, baseB.z,
      baseC.x, baseC.y, baseC.z,
      currentFaces.sBC.x, currentFaces.sBC.y, currentFaces.sBC.z,
    ]);
    sbcGeo.setAttribute("position", new THREE.BufferAttribute(sbcVerts, 3));
    sbcGeo.computeVertexNormals();

    const scdGeo = new THREE.BufferGeometry();
    const scdVerts = new Float32Array([
      baseC.x, baseC.y, baseC.z,
      baseD.x, baseD.y, baseD.z,
      currentFaces.sCD.x, currentFaces.sCD.y, currentFaces.sCD.z,
    ]);
    scdGeo.setAttribute("position", new THREE.BufferAttribute(scdVerts, 3));
    scdGeo.computeVertexNormals();

    const sdaGeo = new THREE.BufferGeometry();
    const sdaVerts = new Float32Array([
      baseD.x, baseD.y, baseD.z,
      baseA.x, baseA.y, baseA.z,
      currentFaces.sDA.x, currentFaces.sDA.y, currentFaces.sDA.z,
    ]);
    sdaGeo.setAttribute("position", new THREE.BufferAttribute(sdaVerts, 3));
    sdaGeo.computeVertexNormals();

    return { baseGeo, sabGeo, sbcGeo, scdGeo, sdaGeo };
  }, [baseA, baseB, baseC, baseD, currentFaces]);

  // Cập nhật Cạnh Thấy / Cạnh Khuất và Ký hiệu góc vuông mỗi khung hình (60fps)
  useFrame(() => {
    if (!linesGroupRef.current) return;
    const group = linesGroupRef.current;
    group.clear();

    const camPos = camera.position;

    const computeNormal = (p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3) => {
      const v1 = new THREE.Vector3().subVectors(p2, p1);
      const v2 = new THREE.Vector3().subVectors(p3, p1);
      return new THREE.Vector3().crossVectors(v1, v2).normalize();
    };

    const nBase = new THREE.Vector3(0, -1, 0);
    const cBase = new THREE.Vector3(0, 0, 0);

    const nSAB = computeNormal(baseA, baseB, currentFaces.sAB);
    const cSAB = new THREE.Vector3().add(baseA).add(baseB).add(currentFaces.sAB).multiplyScalar(1 / 3);

    const nSBC = computeNormal(baseB, baseC, currentFaces.sBC);
    const cSBC = new THREE.Vector3().add(baseB).add(baseC).add(currentFaces.sBC).multiplyScalar(1 / 3);

    const nSCD = computeNormal(baseC, baseD, currentFaces.sCD);
    const cSCD = new THREE.Vector3().add(baseC).add(baseD).add(currentFaces.sCD).multiplyScalar(1 / 3);

    const nSDA = computeNormal(baseD, baseA, currentFaces.sDA);
    const cSDA = new THREE.Vector3().add(baseD).add(baseA).add(currentFaces.sDA).multiplyScalar(1 / 3);

    const isFrontFacing = (n: THREE.Vector3, c: THREE.Vector3) => {
      const viewDir = new THREE.Vector3().subVectors(camPos, c);
      return n.dot(viewDir) > 0;
    };

    const frontBase = isFrontFacing(nBase, cBase);
    const frontSAB = isFrontFacing(nSAB, cSAB);
    const frontSBC = isFrontFacing(nSBC, cSBC);
    const frontSCD = isFrontFacing(nSCD, cSCD);
    const frontSDA = isFrontFacing(nSDA, cSDA);

    const edgesDef = [
      // 4 cạnh đáy
      { p1: baseA, p2: baseB, isVisible: frontBase || frontSAB },
      { p1: baseB, p2: baseC, isVisible: frontBase || frontSBC },
      { p1: baseC, p2: baseD, isVisible: frontBase || frontSCD },
      { p1: baseD, p2: baseA, isVisible: frontBase || frontSDA },

      // 4 cạnh bên
      { p1: baseA, p2: currentFaces.sAB, isVisible: frontSAB || frontSDA },
      { p1: baseB, p2: currentFaces.sBC, isVisible: frontSAB || frontSBC },
      { p1: baseC, p2: currentFaces.sCD, isVisible: frontSBC || frontSCD },
      { p1: baseD, p2: currentFaces.sDA, isVisible: frontSCD || frontSDA },
    ];

    if (foldT < 0.99) {
      edgesDef.push(
        { p1: baseB, p2: currentFaces.sAB, isVisible: true },
        { p1: baseC, p2: currentFaces.sBC, isVisible: true },
        { p1: baseD, p2: currentFaces.sCD, isVisible: true },
        { p1: baseA, p2: currentFaces.sDA, isVisible: true }
      );
    }

    edgesDef.forEach(({ p1, p2, isVisible }) => {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      if (isVisible) {
        const line = new THREE.Line(geo, solidMaterial);
        group.add(line);
      } else {
        const line = new THREE.Line(geo, dashedMaterial);
        line.computeLineDistances();
        group.add(line);
      }
    });

    // Đường chéo đáy AC và BD (nét đứt)
    if (showDiagonals) {
      const diagAC = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([baseA, baseC]),
        diagonalDashedMat
      );
      diagAC.computeLineDistances();
      group.add(diagAC);

      const diagBD = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([baseB, baseD]),
        diagonalDashedMat
      );
      diagBD.computeLineDistances();
      group.add(diagBD);
    }

    // Đường cao SH vuông góc đáy: Nét đứt màu đỏ cam
    const foot = new THREE.Vector3(apex.x, 0, apex.z);
    const altitudeGeo = new THREE.BufferGeometry().setFromPoints([apex, foot]);
    const altitudeMat = new THREE.LineDashedMaterial({
      color: 0xf43f5e, // Rose-500
      dashSize: 0.15,
      gapSize: 0.12,
    });
    const altLine = new THREE.Line(altitudeGeo, altitudeMat);
    altLine.computeLineDistances();
    group.add(altLine);

    // Ký hiệu góc vuông SH vuông góc đáy tại H
    if (showPerpendicularSymbol) {
      const sqSize = 0.22;
      const cornerVerts = [
        new THREE.Vector3(0, sqSize, 0),
        new THREE.Vector3(sqSize, sqSize, 0),
        new THREE.Vector3(sqSize, 0, 0),
      ];
      const cornerGeo = new THREE.BufferGeometry().setFromPoints(cornerVerts);
      const cornerLine = new THREE.Line(cornerGeo, rightAngleMat);
      group.add(cornerLine);
    }
  });

  return (
    <group>
      {/* 1. Các mặt kính mờ Frosted Glassmorphism */}
      <mesh geometry={faceGeometries.baseGeo}>
        <meshPhysicalMaterial
          transmission={0.65}
          roughness={0.2}
          opacity={0.35}
          transparent={true}
          color="#0d9488"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sabGeo}>
        <meshPhysicalMaterial
          transmission={0.6}
          roughness={0.2}
          opacity={0.4}
          transparent={true}
          color="#06b6d4"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sbcGeo}>
        <meshPhysicalMaterial
          transmission={0.6}
          roughness={0.2}
          opacity={0.4}
          transparent={true}
          color="#14b8a6"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.scdGeo}>
        <meshPhysicalMaterial
          transmission={0.6}
          roughness={0.2}
          opacity={0.4}
          transparent={true}
          color="#0284c7"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sdaGeo}>
        <meshPhysicalMaterial
          transmission={0.6}
          roughness={0.2}
          opacity={0.4}
          transparent={true}
          color="#0d9488"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Group chứa các cạnh động Thấy & Khuất */}
      <group ref={linesGroupRef} />

      {/* 3. Vectơ Pháp Tuyến mặt phẳng đáy: n = (0; 1; 0) */}
      {showNormalVector && (
        <group position={[0, 0, 0]}>
          {/* Thân mũi tên */}
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.5, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Đầu chóp nhọn */}
          <mesh position={[0, 1.55, 0]}>
            <coneGeometry args={[0.08, 0.22, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Nhãn KaTeX Vectơ pháp tuyến */}
          <Html position={[0, 1.82, 0]} center distanceFactor={8}>
            <div className="px-2.5 py-1 bg-amber-950/90 backdrop-blur-md border border-amber-500/80 rounded-lg text-amber-300 text-xs font-bold shadow-xl select-none pointer-events-none whitespace-nowrap">
              <KatexMath math="\vec{n}_{(ABCD)} = (0;\, 1;\, 0)" />
            </div>
          </Html>
        </group>
      )}

      {/* 4. Nhãn Ký hiệu Vuông góc SH vuông góc đáy */}
      {showPerpendicularSymbol && (
        <Html position={[0.42, 0.2, 0.42]} center distanceFactor={8}>
          <div className="px-1.5 py-0.5 bg-rose-950/90 backdrop-blur-md border border-rose-500/80 rounded text-rose-300 text-[10px] font-bold shadow select-none pointer-events-none whitespace-nowrap">
            <KatexMath math="SH \perp (ABCD)" />
          </div>
        </Html>
      )}

      {/* 5. Đỉnh Billboard Labels bằng KaTeX 100% */}
      {/* Đỉnh S */}
      <Html position={[apex.x, apex.y + 0.28, apex.z]} center distanceFactor={9}>
        <div className="px-2.5 py-1 bg-slate-900/95 backdrop-blur-md rounded-lg border border-teal-400/80 text-teal-300 font-bold text-xs shadow-xl select-none pointer-events-none flex items-center gap-1.5 whitespace-nowrap">
          <KatexMath
            math={showCoordinates ? `S(0;\\, ${formatVNFloat(apex.y)};\\, 0)` : "S"}
          />
        </div>
      </Html>

      {/* Đỉnh A */}
      <Html position={[baseA.x - 0.25, baseA.y - 0.18, baseA.z + 0.25]} center distanceFactor={9}>
        <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath
            math={showCoordinates ? `A(${formatVNFloat(baseA.x)};\\, 0;\\, ${formatVNFloat(baseA.z)})` : "A"}
          />
        </div>
      </Html>

      {/* Đỉnh B */}
      <Html position={[baseB.x + 0.25, baseB.y - 0.18, baseB.z + 0.25]} center distanceFactor={9}>
        <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath
            math={showCoordinates ? `B(${formatVNFloat(baseB.x)};\\, 0;\\, ${formatVNFloat(baseB.z)})` : "B"}
          />
        </div>
      </Html>

      {/* Đỉnh C */}
      <Html position={[baseC.x + 0.25, baseC.y - 0.18, baseC.z - 0.25]} center distanceFactor={9}>
        <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath
            math={showCoordinates ? `C(${formatVNFloat(baseC.x)};\\, 0;\\, ${formatVNFloat(baseC.z)})` : "C"}
          />
        </div>
      </Html>

      {/* Đỉnh D */}
      <Html position={[baseD.x - 0.25, baseD.y - 0.18, baseD.z - 0.25]} center distanceFactor={9}>
        <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath
            math={showCoordinates ? `D(${formatVNFloat(baseD.x)};\\, 0;\\, ${formatVNFloat(baseD.z)})` : "D"}
          />
        </div>
      </Html>

      {/* Chân đường cao H */}
      <Html position={[apex.x, 0.12, apex.z]} center distanceFactor={9}>
        <div className="px-2 py-0.5 bg-rose-950/95 backdrop-blur-md rounded-lg border border-rose-500/80 text-rose-300 font-bold text-[11px] shadow-md select-none pointer-events-none whitespace-nowrap">
          <KatexMath math={showCoordinates ? "H(0;\\, 0;\\, 0)" : "H"} />
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Component chính: Stereometry3DCanvas
// -------------------------------------------------------------
export default function Stereometry3DCanvas({
  foldPercent = 100,
  onFoldPercentChange,
  apexHeight = 2.6,
  onApexHeightChange,
  baseWidth = 3.0,
  baseDepth = 3.0,
  orthogonalView = false,
  onToggleOrthogonalView,
  className = "",
}: Stereometry3DCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showNormalVector, setShowNormalVector] = useState<boolean>(true);
  const [showHudCard, setShowHudCard] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ResizeObserver tự động tính toán lại kích thước khung hình khi chuyển đổi bước học hoặc thay đổi layout, chống sập WebGL context
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      window.dispatchEvent(new Event("resize"));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mounted]);

  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);

  // Vị trí các đỉnh cơ bản của hình chóp tứ giác đều
  const halfW = baseWidth / 2;
  const halfD = baseDepth / 2;

  const baseA = useMemo(() => new THREE.Vector3(-halfW, 0, halfD), [halfW, halfD]);
  const baseB = useMemo(() => new THREE.Vector3(halfW, 0, halfD), [halfW, halfD]);
  const baseC = useMemo(() => new THREE.Vector3(halfW, 0, -halfD), [halfW, halfD]);
  const baseD = useMemo(() => new THREE.Vector3(-halfW, 0, -halfD), [halfW, halfD]);
  const apex = useMemo(() => new THREE.Vector3(0, apexHeight, 0), [apexHeight]);

  // Các đại lượng giải tích toán học chuẩn mực SGK Toán 11
  const baseArea = baseWidth * baseDepth;
  const volume = (1 / 3) * baseArea * apexHeight;
  const diagonal = Math.sqrt(baseWidth * baseWidth + baseDepth * baseDepth);
  const halfDiagonal = diagonal / 2;
  const edgeLength = Math.sqrt(apexHeight * apexHeight + halfDiagonal * halfDiagonal);
  const slantAngle = (Math.atan2(apexHeight, halfDiagonal) * 180) / Math.PI;

  const foldT = foldPercent / 100;

  // Reset góc nhìn Camera về góc chuẩn
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  if (!mounted) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-slate-950 text-slate-400 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Đang khởi tạo WebGL 3D Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-gradient-to-b from-[#0F172A] to-[#020617] select-none overflow-hidden rounded-xl border border-slate-700 shadow-2xl ${className}`}
    >
      {/* Top Banner Toolbar: Tiêu đề & Công cụ khảo sát chuẩn SGK */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Hình chóp tứ giác</span>
            <KatexMath math="S.ABCD" className="font-bold text-teal-300" />
          </div>

          <button
            onClick={onToggleOrthogonalView}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              orthogonalView
                ? "bg-slate-800 border-amber-500/80 text-amber-300"
                : "bg-slate-900/85 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{orthogonalView ? "Trực giao (2 đường chéo)" : "Phối cảnh 3D"}</span>
          </button>

          <button
            onClick={() => setShowCoordinates((v) => !v)}
            title="Bật/Tắt hiển thị tọa độ điểm trong không gian Oxyz"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showCoordinates
                ? "bg-slate-800 border-teal-500/80 text-teal-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Tọa độ Oxyz</span>
          </button>

          <button
            onClick={() => setShowNormalVector((v) => !v)}
            title="Bật/Tắt hiển thị vectơ pháp tuyến mặt đáy"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showNormalVector
                ? "bg-slate-800 border-amber-500/80 text-amber-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vectơ <KatexMath math="\vec{n}" /></span>
          </button>
        </div>

        {/* Right Toggle Button for Analytical HUD */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowHudCard((v) => !v)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showHudCard
                ? "bg-slate-800 border-slate-600 text-teal-300"
                : "bg-slate-900/85 border-slate-700 text-slate-300 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bảng SGK 11</span>
            {showHudCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating HUD Card: BẢNG ĐẠI LƯỢNG HÌNH HỌC (SGK TOÁN 11 KẾT NỐI TRI THỨC) */}
      {showHudCard && (
        <div className="absolute top-14 right-3 z-20 w-72 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 p-3 shadow-2xl text-xs text-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
            <span className="font-bold text-teal-300 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>ĐẠI LƯỢNG HÌNH HỌC (SGK 11)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Chuẩn KNTT</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Chiều cao chóp:</span>
              <KatexMath math={`h = SH = ${formatVNFloat(apexHeight)}\\text{ m}`} className="text-emerald-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Cạnh đáy hình vuông:</span>
              <KatexMath math={`a = AB = ${formatVNFloat(baseWidth)}\\text{ m}`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Diện tích đáy:</span>
              <KatexMath math={`S_{ABCD} = a^2 = ${formatVNFloat(baseArea)}\\text{ m}^2`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Thể tích khối chóp:</span>
              <KatexMath
                math={`V = \\frac{1}{3} S_{ABCD} \\cdot h = ${formatVNFloat(volume)}\\text{ m}^3`}
                className="text-amber-300 font-bold"
              />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Độ dài cạnh bên:</span>
              <KatexMath math={`SA = \\sqrt{h^2 + AH^2} \\approx ${formatVNFloat(edgeLength)}\\text{ m}`} className="text-slate-200" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Góc cạnh bên & đáy:</span>
              <KatexMath math={`\\varphi = \\widehat{(SA, (ABCD))} \\approx ${formatVNFloat(slantAngle)}^\\circ`} className="text-purple-300 font-semibold" />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-700 text-[10px] space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-bold">•</span>
              <span>Quan hệ: <KatexMath math="SH \perp (ABCD)" /></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">•</span>
              <span>Mặt phẳng đáy: <KatexMath math="(ABCD): y = 0" /></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>Vectơ pháp tuyến: <KatexMath math="\vec{n} = (0;\, 1;\, 0)" /></span>
            </div>
          </div>
        </div>
      )}

      {/* WebGL 3D Canvas */}
      <Canvas
        camera={{ position: [4.5, 3.5, 5.0], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Studio Three-Point Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-6, 4, -4]} intensity={0.5} />
        <directionalLight position={[0, -2, -6]} intensity={0.7} color="#38bdf8" />

        {/* Sàn lưới không gian Infinite Floor */}
        <Grid
          position={[0, -0.01, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.8}
          cellColor="#334155"
          sectionSize={5}
          sectionThickness={1.2}
          sectionColor="#64748b"
          fadeDistance={18}
          fadeStrength={1.5}
        />

        {/* Trọng tâm mô hình: Khối đa diện + Cạnh động thấy/khuất + Billboard KaTeX */}
        <DynamicPyramidMeshAndEdges
          apex={apex}
          baseA={baseA}
          baseB={baseB}
          baseC={baseC}
          baseD={baseD}
          foldT={foldT}
          showCoordinates={showCoordinates}
          showNormalVector={showNormalVector}
          showPerpendicularSymbol={true}
          showDiagonals={true}
        />

        {/* Camera OrbitControls có Damping mượt mà */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2.5}
          maxDistance={15}
        />
      </Canvas>

      {/* Floating Control Sliders (Bottom Left): Khai triển phẳng & Chiều cao H */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
        {onFoldPercentChange && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gấp khối <KatexMath math="\leftrightarrow" /> Khai triển:</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{foldPercent}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={foldPercent}
              onChange={(e) => onFoldPercentChange(Number(e.target.value))}
              className="w-56 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        )}

        {onApexHeightChange && (
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                <span>Chiều cao:</span>
                <KatexMath math={`h = SH = ${formatVNFloat(apexHeight)}`} />
              </span>
              <span className="font-mono text-emerald-400 font-bold">{formatVNFloat(apexHeight)} m</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={4.5}
              step={0.1}
              value={apexHeight}
              onChange={(e) => onApexHeightChange(Number(e.target.value))}
              className="w-56 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Floating Toolbar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={handleResetCamera}
          title="Reset góc nhìn Camera về chuẩn"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
