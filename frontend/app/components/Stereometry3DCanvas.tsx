"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCcw,
  RotateCw,
  Eye,
  MapPin,
  Compass,
  FileText,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Axis3d,
  Camera,
  Scissors,
  Layers,
  Move3d,
  Hash,
  Compass as CompassIcon,
  SlidersHorizontal,
  X,
  Download,
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
  isTeacherMode?: boolean; // Chế độ Trình chiếu Giáo viên (phóng to 1.5x, toolbar bài giảng)
  onVertexManipulated?: (log: { vertex: string; oldPos: THREE.Vector3; newPos: THREE.Vector3 }) => void;
  className?: string;
}

// -------------------------------------------------------------
// Component OxyzAxesHelper:
// Hệ trục tọa độ Oxyz chuẩn Sư phạm Toán học THPT (SGK Kết nối tri thức)
// Trục Ox: Đỏ (#EF4444) | Trục Oy: Xanh lục (#10B981) | Trục Oz: Xanh dương (#3B82F6) hướng thẳng đứng
// -------------------------------------------------------------
interface OxyzAxesHelperProps {
  size?: number;
  position?: THREE.Vector3;
  isAtVertexA?: boolean;
}

function OxyzAxesHelper({
  size = 7,
  position = new THREE.Vector3(0, 0, 0),
  isAtVertexA = false,
}: OxyzAxesHelperProps) {
  // Three.js AxesHelper chuẩn RGB Toán học
  const axes = useMemo(() => {
    const helper = new THREE.AxesHelper(size);
    helper.setColors(
      new THREE.Color("#EF4444"), // Ox: Đỏ
      new THREE.Color("#3B82F6"), // Oz: Xanh dương (thẳng đứng lên trên)
      new THREE.Color("#10B981")  // Oy: Xanh lục
    );
    // Định hướng trục Oy theo phương -Z (cùng chiều vectơ AD của đáy chóp)
    const posAttr = helper.geometry.attributes.position;
    if (posAttr) {
      posAttr.setZ(5, -size);
      posAttr.needsUpdate = true;
    }
    return helper;
  }, [size]);

  const lineR = 0.022;
  const coneR = 0.085;
  const coneH = 0.28;

  return (
    <group position={position}>
      {/* 1. Three.js Native AxesHelper */}
      <primitive object={axes} />

      {/* 2. Trục Ox (Đỏ #EF4444) */}
      <mesh position={[size / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#EF4444" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[size, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#EF4444" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 3. Trục Oz (Xanh dương #3B82F6) - Hướng thẳng đứng lên trên */}
      <mesh position={[0, size / 2, 0]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, size, 0]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#3B82F6" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 4. Trục Oy (Xanh lục #10B981) - Nằm ngang trên mặt phẳng Oxy */}
      <mesh position={[0, 0, -size / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[lineR, lineR, size, 16]} />
        <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, -size]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[coneR, coneH, 16]} />
        <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* 5. Gốc tọa độ O: Quả cầu tâm chuẩn */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* 6. Nhãn KaTeX 3D Billboard - Giữ tỉ lệ chuẩn, không phóng to mất kiểm soát */}
      {/* Nhãn Ox */}
      <Html position={[size + 0.45, 0, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className="px-1.5 py-0.5 bg-red-950/90 backdrop-blur-md rounded border border-red-500/80 text-red-300 font-bold text-[10px] shadow-sm select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="x" />
        </div>
      </Html>

      {/* Nhãn Oz (thẳng đứng lên trên) */}
      <Html position={[0, size + 0.45, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className="px-1.5 py-0.5 bg-blue-950/90 backdrop-blur-md rounded border border-blue-500/80 text-blue-300 font-bold text-[10px] shadow-sm select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="z" />
        </div>
      </Html>

      {/* Nhãn Oy */}
      <Html position={[0, 0, -size - 0.45]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className="px-1.5 py-0.5 bg-emerald-950/90 backdrop-blur-md rounded border border-emerald-500/80 text-emerald-300 font-bold text-[10px] shadow-sm select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="y" />
        </div>
      </Html>

      {/* Nhãn Gốc O */}
      <Html position={[-0.3, -0.25, 0.3]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className="px-1.5 py-0.5 bg-slate-900/95 backdrop-blur-md rounded border border-slate-600 text-slate-200 font-bold text-[10px] shadow-sm select-none pointer-events-none whitespace-nowrap">
          <KatexMath math={isAtVertexA ? "O \\equiv A(0;\\,0;\\,0)" : "O(0;\\,0;\\,0)"} />
        </div>
      </Html>
    </group>
  );
}

// -------------------------------------------------------------
// Component DraggableHandle:
// Tay nắm tương tác kéo đỉnh 3D trực tiếp bằng chuột/cảm ứng (Raycasting Drag Controls)
// -------------------------------------------------------------
interface DraggableHandleProps {
  id: "S" | "A" | "B" | "D";
  label: string;
  position: THREE.Vector3;
  color: string;
  glowColor: string;
  constraint: "floor" | "vertical" | "free";
  onDrag: (newPos: THREE.Vector3) => void;
  onDragEnd?: () => void;
  setOrbitEnabled: (enabled: boolean) => void;
  isTeacherMode?: boolean;
}

function DraggableHandle({
  id,
  label,
  position,
  color,
  glowColor,
  constraint,
  onDrag,
  onDragEnd,
  setOrbitEnabled,
  isTeacherMode = false,
}: DraggableHandleProps) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { camera, raycaster, gl } = useThree();
  const planeRef = useRef(new THREE.Plane());

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setDragging(true);
    setOrbitEnabled(false);
    gl.domElement.style.cursor = "grabbing";

    // Thiết lập mặt phẳng ràng buộc kéo
    if (constraint === "floor") {
      // Mặt phẳng đáy sàn y = 0
      planeRef.current.set(new THREE.Vector3(0, 1, 0), 0);
    } else {
      // Mặt phẳng song song camera đi qua vị trí đỉnh
      const camDir = new THREE.Vector3();
      camera.getWorldDirection(camDir).negate();
      planeRef.current.setFromNormalAndCoplanarPoint(camDir, position);
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((moveEv.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((moveEv.clientY - rect.top) / rect.height) * 2 + 1;

      const pointerVec = new THREE.Vector2(x, y);
      raycaster.setFromCamera(pointerVec, camera);

      const intersection = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(planeRef.current, intersection)) {
        if (constraint === "floor") {
          const clampedX = Math.max(-4.5, Math.min(4.5, intersection.x));
          const clampedZ = Math.max(-4.5, Math.min(4.5, intersection.z));
          onDrag(new THREE.Vector3(clampedX, 0, clampedZ));
        } else if (constraint === "vertical") {
          const clampedY = Math.max(0.8, Math.min(6.0, intersection.y));
          onDrag(new THREE.Vector3(position.x, clampedY, position.z));
        } else {
          const clampedY = Math.max(0.8, Math.min(6.0, intersection.y));
          onDrag(new THREE.Vector3(intersection.x, clampedY, intersection.z));
        }
      }
    };

    const onPointerUp = () => {
      setDragging(false);
      setOrbitEnabled(true);
      gl.domElement.style.cursor = "auto";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      if (onDragEnd) onDragEnd();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const sphereRadius = isTeacherMode ? 0.22 : 0.16;

  return (
    <group position={position} name={`handle-${id}`} userData={{ label }}>
      {/* Vòng hào quang phát sáng khi rê chuột hoặc kéo */}
      {(hovered || dragging) && (
        <mesh>
          <sphereGeometry args={[sphereRadius * 1.6, 16, 16]} />
          <meshBasicMaterial
            color={glowColor}
            transparent={true}
            opacity={0.4}
            wireframe={true}
          />
        </mesh>
      )}

      {/* Quả cầu tương tác bắt chuột/chạm cảm ứng */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          gl.domElement.style.cursor = "grab";
        }}
        onPointerOut={() => {
          setHovered(false);
          if (!dragging) gl.domElement.style.cursor = "auto";
        }}
        onPointerDown={handlePointerDown}
      >
        <sphereGeometry args={[sphereRadius, 24, 24]} />
        <meshStandardMaterial
          color={hovered || dragging ? "#ffffff" : color}
          roughness={0.2}
          metalness={0.5}
          emissive={color}
          emissiveIntensity={hovered || dragging ? 0.9 : 0.3}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// Component DynamicPyramidMeshAndEdges:
// Tính toán Cạnh Thấy / Cạnh Khuất 60fps, Điểm tỉ số M, N & Billboard KaTeX Labels
// -------------------------------------------------------------
interface DynamicEdgesProps {
  apex: THREE.Vector3;
  baseA: THREE.Vector3;
  baseB: THREE.Vector3;
  baseC: THREE.Vector3;
  baseD: THREE.Vector3;
  pointM: THREE.Vector3;
  pointN: THREE.Vector3;
  baseWidth: number;
  baseDepth: number;
  foldT: number; // 0 -> 1
  showCoordinates: boolean;
  showNormalVector: boolean;
  showPerpendicularSymbol: boolean;
  showDiagonals: boolean;
  showSectionPlane?: boolean;
  showHiddenEdges?: boolean;
  originAtVertexA: boolean;
  isTeacherMode?: boolean;
}

function formatCompactVN(val: number): string {
  const rounded = Math.round(val * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1).replace(".", ",");
}

function DynamicPyramidMeshAndEdges({
  apex,
  baseA,
  baseB,
  baseC,
  baseD,
  pointM,
  pointN,
  baseWidth,
  baseDepth,
  foldT,
  showCoordinates,
  showNormalVector,
  showPerpendicularSymbol,
  showDiagonals,
  showSectionPlane = true,
  showHiddenEdges = true,
  originAtVertexA,
  isTeacherMode = false,
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

  const altitudeMat = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: 0xf43f5e, // Rose-500
        dashSize: 0.15,
        gapSize: 0.12,
      }),
    []
  );

  const mnMat = useMemo(
    () =>
      new THREE.LineDashedMaterial({
        color: 0x84cc16, // Lime-500
        dashSize: 0.2,
        gapSize: 0.12,
        linewidth: isTeacherMode ? 3.5 : 2,
      }),
    [isTeacherMode]
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

  // Giải phóng bộ nhớ GPU khi unmount hoặc đổi hình
  useEffect(() => {
    const group = linesGroupRef.current;
    return () => {
      if (group) {
        group.traverse((obj) => {
          if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
          }
        });
        group.clear();
      }
      Object.values(faceGeometries).forEach((geo) => geo.dispose());
    };
  }, [faceGeometries]);

  const lastCamPosRef = useRef(new THREE.Vector3());
  const lastUpdateRef = useRef<number>(0);

  // Cập nhật Cạnh Thấy / Cạnh Khuất và Ký hiệu góc vuông có kiểm soát bộ nhớ chống đơ/văng
  useFrame(() => {
    if (!linesGroupRef.current) return;
    const group = linesGroupRef.current;
    const camPos = camera.position;

    // Giảm tải render: Nếu camera không di chuyển và chưa đủ 150ms thì bỏ qua
    const distSq = camPos.distanceToSquared(lastCamPosRef.current);
    const now = performance.now();
    if (distSq < 0.0002 && now - lastUpdateRef.current < 150 && group.children.length > 0) {
      return;
    }
    lastCamPosRef.current.copy(camPos);
    lastUpdateRef.current = now;

    // THU HỒI BỘ NHỚ VRAM TRIỆT ĐỂ: Giải phóng geometry cũ trước khi vẽ mới
    group.traverse((obj) => {
      if (obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
      }
    });
    group.clear();

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
      } else if (showHiddenEdges) {
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
    const altLine = new THREE.Line(altitudeGeo, altitudeMat);
    altLine.computeLineDistances();
    group.add(altLine);

    // Ký hiệu góc vuông SH vuông góc đáy tại H
    if (showPerpendicularSymbol) {
      const sqSize = 0.22;
      const cornerVerts = [
        new THREE.Vector3(foot.x, sqSize, foot.z),
        new THREE.Vector3(foot.x + sqSize, sqSize, foot.z),
        new THREE.Vector3(foot.x + sqSize, 0, foot.z),
      ];
      const cornerGeo = new THREE.BufferGeometry().setFromPoints(cornerVerts);
      const cornerLine = new THREE.Line(cornerGeo, rightAngleMat);
      group.add(cornerLine);
    }

    // Thiết diện cắt qua đoạn MN (Trung điểm SA và Điểm tỉ số 2:1 trên SB)
    if (showSectionPlane && pointM && pointN) {
      const mnGeo = new THREE.BufferGeometry().setFromPoints([pointM, pointN]);
      const mnLine = new THREE.Line(mnGeo, mnMat);
      mnLine.computeLineDistances();
      group.add(mnLine);
    }
  });

  return (
    <group>
      {/* Matte faces keep the pyramid readable while the edge layer explains visibility. */}
      <mesh geometry={faceGeometries.baseGeo}>
        <meshPhysicalMaterial
          transmission={0}
          roughness={0.82}
          opacity={0.3}
          transparent={true}
          color="#67e8f9"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sabGeo}>
        <meshPhysicalMaterial
          transmission={0}
          roughness={0.82}
          opacity={0.38}
          transparent={true}
          color="#6ee7b7"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sbcGeo}>
        <meshPhysicalMaterial
          transmission={0}
          roughness={0.82}
          opacity={0.38}
          transparent={true}
          color="#7dd3fc"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.scdGeo}>
        <meshPhysicalMaterial
          transmission={0}
          roughness={0.82}
          opacity={0.38}
          transparent={true}
          color="#c4b5fd"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={faceGeometries.sdaGeo}>
        <meshPhysicalMaterial
          transmission={0}
          roughness={0.82}
          opacity={0.38}
          transparent={true}
          color="#fde68a"
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Mặt phẳng cắt thiết diện (MN) mờ nếu kích hoạt */}
      {showSectionPlane && pointM && pointN && (
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  pointM.x, pointM.y, pointM.z,
                  pointN.x, pointN.y, pointN.z,
                  baseB.x, baseB.y, baseB.z,
                  pointM.x, pointM.y, pointM.z,
                  baseB.x, baseB.y, baseB.z,
                  baseA.x, baseA.y, baseA.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <meshStandardMaterial
            color="#84cc16"
            transparent={true}
            opacity={0.25}
            side={THREE.DoubleSide}
            roughness={0.3}
          />
        </mesh>
      )}

      {/* 2. Group chứa các cạnh động Thấy & Khuất */}
      <group ref={linesGroupRef} />

      {/* 3. Vectơ Pháp Tuyến đáy */}
      {showNormalVector && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 1.5, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <coneGeometry args={[0.065, 0.2, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          <Html position={[0, 1.75, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
            <div className="px-1.5 py-0.5 bg-slate-950/90 border border-amber-500/60 rounded text-amber-300 font-mono text-[9px] font-bold select-none whitespace-nowrap shadow-xs">
              n(0; 1; 0)
            </div>
          </Html>
        </group>
      )}

      {/* Điểm M (Trung điểm SA) */}
      <group position={pointM}>
        <mesh>
          <sphereGeometry args={[isTeacherMode ? 0.08 : 0.05, 16, 16]} />
          <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.6} />
        </mesh>
        <Html position={[0.1, 0.1, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
          <div className="w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-emerald-500/60 font-mono text-[9.5px] font-bold text-emerald-300 select-none flex items-center justify-center shadow-xs">
            M
          </div>
        </Html>
      </group>

      {/* Điểm N (Tỉ số 2:1 trên SB) */}
      <group position={pointN}>
        <mesh>
          <sphereGeometry args={[isTeacherMode ? 0.08 : 0.05, 16, 16]} />
          <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.6} />
        </mesh>
        <Html position={[0.1, 0.1, 0]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
          <div className="w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-purple-500/60 font-mono text-[9.5px] font-bold text-purple-300 select-none flex items-center justify-center shadow-xs">
            N
          </div>
        </Html>
      </group>

      {/* 5. Đỉnh Billboard Labels chuẩn gọn gàng, thoáng đãng không che khuất */}
      {/* Đỉnh S */}
      <Html position={[apex.x, apex.y + 0.16, apex.z]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-blue-300 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-blue-500/60 text-blue-300 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? `S(${formatCompactVN(baseWidth / 2)}; ${formatCompactVN(baseDepth / 2)}; ${formatCompactVN(apex.y)})`
              : `S(0; 0; ${formatCompactVN(apex.y)})`
            : "S"}
        </div>
      </Html>

      {/* Đỉnh A */}
      <Html position={[baseA.x - 0.1, baseA.y - 0.06, baseA.z + 0.1]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-slate-200 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-slate-700 text-slate-200 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? "A(0; 0; 0)"
              : `A(-${formatCompactVN(baseWidth / 2)}; -${formatCompactVN(baseDepth / 2)}; 0)`
            : "A"}
        </div>
      </Html>

      {/* Đỉnh B */}
      <Html position={[baseB.x + 0.1, baseB.y - 0.06, baseB.z + 0.1]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-slate-200 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-slate-700 text-slate-200 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? `B(${formatCompactVN(baseWidth)}; 0; 0)`
              : `B(${formatCompactVN(baseWidth / 2)}; -${formatCompactVN(baseDepth / 2)}; 0)`
            : "B"}
        </div>
      </Html>

      {/* Đỉnh C */}
      <Html position={[baseC.x + 0.1, baseC.y - 0.06, baseC.z - 0.1]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-slate-200 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-slate-700 text-slate-200 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? `C(${formatCompactVN(baseWidth)}; ${formatCompactVN(baseDepth)}; 0)`
              : `C(${formatCompactVN(baseWidth / 2)}; ${formatCompactVN(baseDepth / 2)}; 0)`
            : "C"}
        </div>
      </Html>

      {/* Đỉnh D */}
      <Html position={[baseD.x - 0.1, baseD.y - 0.06, baseD.z - 0.1]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 text-slate-200 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-slate-700 text-slate-200 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? `D(0; ${formatCompactVN(baseDepth)}; 0)`
              : `D(-${formatCompactVN(baseWidth / 2)}; ${formatCompactVN(baseDepth / 2)}; 0)`
            : "D"}
        </div>
      </Html>

      {/* Chân đường cao H */}
      <Html position={[apex.x, 0.06, apex.z]} center zIndexRange={[0, 5]} style={{ pointerEvents: "none" }}>
        <div className={`select-none whitespace-nowrap font-mono transition-all ${
          showCoordinates
            ? "px-1.5 py-0.5 bg-slate-950/85 backdrop-blur-xs border border-rose-500/60 text-rose-300 text-[8.5px] rounded-md shadow-xs"
            : "w-[18px] h-[18px] rounded-full bg-slate-950/85 backdrop-blur-xs border border-rose-500/60 text-rose-300 text-[9.5px] font-bold flex items-center justify-center shadow-xs"
        }`}>
          {showCoordinates
            ? originAtVertexA
              ? `H(${formatCompactVN(baseWidth / 2)}; ${formatCompactVN(baseDepth / 2)}; 0)`
              : "H(0; 0; 0)"
            : "H"}
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
  isTeacherMode = false,
  onVertexManipulated,
  className = "",
}: Stereometry3DCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState<boolean>(false);
  const [showNormalVector, setShowNormalVector] = useState<boolean>(false);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showSectionPlane, setShowSectionPlane] = useState<boolean>(false);
  const [showHiddenEdges, setShowHiddenEdges] = useState<boolean>(true);
  const [originAtVertexA, setOriginAtVertexA] = useState<boolean>(false);
  const [showHudCard, setShowHudCard] = useState<boolean>(false);
  const [showSliders, setShowSliders] = useState<boolean>(false);
  const [lowGraphics, setLowGraphics] = useState<boolean>(false);
  const [isFrozenView, setIsFrozenView] = useState<boolean>(false);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try { setLowGraphics(localStorage.getItem("mathstep:fast-graphics") === "true"); } catch {}
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
  const cameraStorageKey = "mathstep:stereometry-camera:v1";

  useEffect(() => {
    if (!mounted || !controlsRef.current) return;
    try {
      const saved = JSON.parse(localStorage.getItem(cameraStorageKey) || "null") as { position?: number[]; target?: number[] } | null;
      if (saved?.position?.length !== 3 || saved.target?.length !== 3 ||
          ![...saved.position, ...saved.target].every(Number.isFinite)) return;
      const distance = Math.hypot(...saved.position.map((value, index) => value - saved.target![index]));
      if (distance < 2.5 || distance > 15) return;
      controlsRef.current.object.position.set(saved.position[0], saved.position[1], saved.position[2]);
      controlsRef.current.target.set(saved.target[0], saved.target[1], saved.target[2]);
      controlsRef.current.update();
    } catch { /* Keep the default view if browser storage is unavailable. */ }
  }, [mounted, lowGraphics]);

  const setCameraView = (view: "default" | "top" | "front" | "side") => {
    const controls = controlsRef.current;
    if (!controls) return;
    const positions = { default: [4.5, 3.5, 5], top: [0, 9, 0.01], front: [0, 2, 9], side: [9, 2, 0] };
    const position = positions[view];
    controls.object.position.set(position[0], position[1], position[2]);
    controls.target.set(0, 1, 0);
    controls.update();
    setIsFrozenView(false);
    controls.enabled = true;
    try { localStorage.setItem(cameraStorageKey, JSON.stringify({ position, target: [0, 1, 0] })); } catch {}
  };

  // Vị trí các đỉnh cơ bản của hình chóp tứ giác đều (Cho phép Kéo thả trực tiếp 3D Direct Manipulation)
  const halfW = baseWidth / 2;
  const halfD = baseDepth / 2;

  const [vertexA, setVertexA] = useState<THREE.Vector3>(() => new THREE.Vector3(-halfW, 0, halfD));
  const [vertexB, setVertexB] = useState<THREE.Vector3>(() => new THREE.Vector3(halfW, 0, halfD));
  const [vertexD, setVertexD] = useState<THREE.Vector3>(() => new THREE.Vector3(-halfW, 0, -halfD));
  const [apexPos, setApexPos] = useState<THREE.Vector3>(() => new THREE.Vector3(0, apexHeight, 0));

  // Đồng bộ khi tham số ngoài thay đổi
  useEffect(() => {
    setApexPos((prev) => new THREE.Vector3(prev.x, apexHeight, prev.z));
  }, [apexHeight]);

  // Reactive Dependency Graph:
  // Đỉnh C tự động tính theo quy tắc hình bình hành: C = B + (D - A)
  const vertexC = useMemo(
    () => new THREE.Vector3().addVectors(vertexB, new THREE.Vector3().subVectors(vertexD, vertexA)),
    [vertexA, vertexB, vertexD]
  );

  // Tâm đáy H / O: Giao điểm hai đường chéo AC và BD
  // Trung điểm M của cạnh bên SA: M = (S + A) / 2
  const pointM = useMemo(
    () => new THREE.Vector3().addVectors(apexPos, vertexA).multiplyScalar(0.5),
    [apexPos, vertexA]
  );

  // Điểm tỉ số N trên cạnh bên SB (tỉ số 2:1 tức SN/SB = 2/3)
  const pointN = useMemo(
    () =>
      new THREE.Vector3().addVectors(
        apexPos,
        new THREE.Vector3().subVectors(vertexB, apexPos).multiplyScalar(2 / 3)
      ),
    [apexPos, vertexB]
  );

  // Các đại lượng giải tích toán học chuẩn mực SGK Toán 11 & 12 (tính động 60fps)
  const edgeAB = vertexA.distanceTo(vertexB);
  const edgeAD = vertexA.distanceTo(vertexD);
  const vecAB = new THREE.Vector3().subVectors(vertexB, vertexA);
  const vecAD = new THREE.Vector3().subVectors(vertexD, vertexA);
  const crossBase = new THREE.Vector3().crossVectors(vecAB, vecAD);
  const realBaseArea = crossBase.length();
  const currentHeight = Math.abs(apexPos.y - vertexA.y);
  const currentVolume = (1 / 3) * realBaseArea * currentHeight;
  const edgeSA = apexPos.distanceTo(vertexA);
  const slantAngle = (Math.atan2(currentHeight, Math.hypot(apexPos.x - vertexA.x, apexPos.z - vertexA.z)) * 180) / Math.PI;
  const sideNormal = new THREE.Vector3().crossVectors(vecAB, new THREE.Vector3().subVectors(apexPos, vertexA));
  const dihedralAngle = crossBase.lengthSq() > 1e-8 && sideNormal.lengthSq() > 1e-8
    ? Math.acos(Math.min(1, Math.abs(crossBase.clone().normalize().dot(sideNormal.normalize())))) * 180 / Math.PI
    : null;

  const foldT = foldPercent / 100;

  // Reset góc nhìn Camera về góc chuẩn & vị trí đỉnh ban đầu
  const handleResetCamera = () => {
    setCameraView("default");
  };

  const handleSnapshot = () => {
    const source = containerRef.current?.querySelector("canvas");
    if (!source) return;
    const image = document.createElement("canvas");
    image.width = source.width;
    image.height = source.height + 72;
    const context = image.getContext("2d");
    if (!context) return;
    context.fillStyle = "#0B0F17";
    context.fillRect(0, 0, image.width, image.height);
    context.drawImage(source, 0, 0);
    context.fillStyle = "#e2e8f0";
    context.font = "bold 24px Arial, sans-serif";
    context.fillText("MathSTEP • Hình chóp S.ABCD", 24, source.height + 43);
    const link = document.createElement("a");
    link.href = image.toDataURL("image/png");
    link.download = "mathstep-hinh-chop.png";
    link.click();
  };

  // Xoay 45 độ theo phương ngang (hỗ trợ trình chiếu lớp học)
  const handleRotate45 = () => {
    if (controlsRef.current) {
      const az = controlsRef.current.getAzimuthalAngle();
      controlsRef.current.setAzimuthalAngle(az + Math.PI / 4);
      controlsRef.current.update();
    }
  };

  // Đóng băng cấu hình / Snapshot góc nhìn phục vụ bài giảng
  const handleSnapshotFreeze = () => {
    setIsFrozenView((v) => !v);
    setFreezeNotice(!isFrozenView ? "Đã đóng băng góc nhìn cấu hình cho bài giảng." : "Đã mở lại chế độ xoay tự do.");
    setTimeout(() => setFreezeNotice(null), 3000);
  };

  const setOrbitEnabled = (enabled: boolean) => {
    if (controlsRef.current) {
      controlsRef.current.enabled = enabled && !isFrozenView;
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
      style={{ touchAction: "none" }}
      className={`relative w-full h-full flex flex-col bg-[#0B0F17] select-none overflow-hidden rounded-xl border border-slate-800 ${className}`}
    >
      {/* Toast thông báo đóng băng cấu hình */}
      {freezeNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-950" />
          <span>{freezeNotice}</span>
        </div>
      )}

      {/* Top Docked Icon Toolbar: Tiêu chuẩn GeoGebra/Blender (Dùng Icon gọn gàng, tránh rối mắt) */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1 p-1 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl pointer-events-auto overflow-x-auto no-scrollbar max-w-[calc(100vw-64px)] sm:max-w-none">
          {/* Nhãn hình chóp gọn gàng */}
          <div className="px-2.5 py-1 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border-r border-slate-800 pr-2.5 mr-0.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-mono font-bold text-slate-100">S.ABCD</span>
            {isTeacherMode && (
              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                GV 1.5x
              </span>
            )}
          </div>

          {/* 1. Trực giao / Phối cảnh */}
          <button
            type="button"
            onClick={onToggleOrthogonalView}
            title={orthogonalView ? "Chế độ: Trực giao (Bấm đổi sang Phối cảnh 3D)" : "Chế độ: Phối cảnh 3D (Bấm đổi sang Trực giao)"}
            className={`p-1.5 rounded-lg transition-colors ${
              orthogonalView
                ? "bg-blue-600/30 text-blue-400 border border-blue-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* 2. Hệ trục Oxyz */}
          <button
            type="button"
            onClick={() => setShowAxes((v) => !v)}
            title={showAxes ? "Ẩn hệ trục tọa độ Oxyz" : "Hiện hệ trục tọa độ Oxyz (Đỏ Ox, Lục Oy, Lam Oz)"}
            className={`p-1.5 rounded-lg transition-colors ${
              showAxes
                ? "bg-rose-600/30 text-rose-400 border border-rose-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Axis3d className="w-4 h-4" />
          </button>

          {/* 3. Lưới mặt sàn Oxy */}
          <button
            type="button"
            onClick={() => setShowFloorGrid((v) => !v)}
            title={showFloorGrid ? "Ẩn mặt sàn không gian Oxy" : "Hiện mặt sàn không gian Oxy"}
            className={`p-1.5 rounded-lg transition-colors ${
              showFloorGrid
                ? "bg-cyan-600/30 text-cyan-400 border border-cyan-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>

          {/* 4. Gốc O tại Đỉnh A vs Tâm H */}
          <button
            type="button"
            onClick={() => setOriginAtVertexA((v) => !v)}
            title={originAtVertexA ? "Gốc O tại Đỉnh A (Bấm chuyển về Tâm H)" : "Gốc O tại Tâm đáy H (Bấm chuyển sang Đỉnh A)"}
            className={`p-1.5 rounded-lg transition-colors ${
              originAtVertexA
                ? "bg-amber-600/30 text-amber-400 border border-amber-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>

          {/* 5. Mặt phẳng thiết diện qua MN */}
          <button
            type="button"
            onClick={() => setShowSectionPlane((v) => !v)}
            title={showSectionPlane ? "Ẩn mặt phẳng thiết diện (MN)" : "Hiện mặt phẳng thiết diện (MN)"}
            className={`p-1.5 rounded-lg transition-colors ${
              showSectionPlane
                ? "bg-lime-600/30 text-lime-400 border border-lime-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Scissors className="w-4 h-4" />
          </button>

          {/* 6. Nét đứt cạnh khuất */}
          <button
            type="button"
            onClick={() => setShowHiddenEdges((v) => !v)}
            title={showHiddenEdges ? "Tắt hiển thị nét đứt cạnh khuất" : "Bật hiển thị nét đứt cạnh khuất"}
            className={`p-1.5 rounded-lg transition-colors ${
              showHiddenEdges
                ? "bg-slate-800 text-slate-200 border border-slate-700"
                : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* 7. Tọa độ số học */}
          <button
            type="button"
            onClick={() => setShowCoordinates((v) => !v)}
            title={showCoordinates ? "Ẩn nhãn tọa độ số học trên đỉnh" : "Hiện nhãn tọa độ số học trên đỉnh"}
            className={`p-1.5 rounded-lg transition-colors ${
              showCoordinates
                ? "bg-blue-600/30 text-blue-400 border border-blue-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Hash className="w-4 h-4" />
          </button>

          {/* 8. Vectơ pháp tuyến n */}
          <button
            type="button"
            onClick={() => setShowNormalVector((v) => !v)}
            title={showNormalVector ? "Ẩn vectơ pháp tuyến n đáy" : "Hiện vectơ pháp tuyến n đáy"}
            className={`p-1.5 rounded-lg transition-colors ${
              showNormalVector
                ? "bg-amber-600/30 text-amber-400 border border-amber-500/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <CompassIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Right Toggle Button for Analytical HUD (Icon + Tooltip) */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowHudCard((v) => !v)}
            title={showHudCard ? "Thu gọn bảng số liệu SGK 11/12" : "Mở bảng số liệu hình học SGK 11/12"}
            className={`p-1.5 rounded-xl border transition-colors flex items-center gap-1 shadow-xl ${
              showHudCard
                ? "bg-slate-800 border-slate-700 text-blue-400"
                : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline text-[10px] font-semibold">Đo</span>
            {showHudCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating HUD Card: BẢNG ĐẠI LƯỢNG HÌNH HỌC (SGK TOÁN 11 & 12 KẾT NỐI TRI THỨC) */}
      {showHudCard && (
        <div className="absolute top-12 right-2 sm:right-3 z-20 w-[calc(100vw-24px)] max-w-[290px] sm:w-72 max-h-[55vh] overflow-y-auto no-scrollbar bg-slate-950/92 backdrop-blur-md rounded-xl border border-slate-800 p-2.5 sm:p-3 shadow-2xl text-[10.5px] text-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-blue-400 text-[10px] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Đại lượng hình học SGK</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-500 font-mono">KNTT</span>
              <button
                type="button"
                onClick={() => setShowHudCard(false)}
                className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer text-xs"
                title="Đóng bảng số liệu"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Phương pháp Tọa độ hóa hình học không gian (Toán 12) khi gắn gốc O vào A */}
          {originAtVertexA && (
            <div className="p-2 bg-amber-950/50 border border-amber-600/50 rounded-lg space-y-1 text-[10px] text-amber-200">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>TỌA ĐỘ HÓA TẠI ĐỈNH A (SGK TOÁN 12)</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Gốc tại <KatexMath math={"A(0;\\,0;\\,0)"} />; các vectơ dưới đây lấy theo hệ trục Oxyz đang hiển thị và cập nhật khi kéo đỉnh.
              </p>
              <div className="pt-0.5 space-y-0.5 text-[10px]">
                <div>• <KatexMath math={`\\vec{AB} = (${formatVNFloat(vertexB.x - vertexA.x)};\\, ${formatVNFloat(vertexA.z - vertexB.z)};\\, ${formatVNFloat(vertexB.y - vertexA.y)})`} /></div>
                <div>• <KatexMath math={`\\vec{AD} = (${formatVNFloat(vertexD.x - vertexA.x)};\\, ${formatVNFloat(vertexA.z - vertexD.z)};\\, ${formatVNFloat(vertexD.y - vertexA.y)})`} /></div>
                <div>• <KatexMath math={`\\vec{AS} = (${formatVNFloat(apexPos.x - vertexA.x)};\\, ${formatVNFloat(vertexA.z - apexPos.z)};\\, ${formatVNFloat(apexPos.y - vertexA.y)})`} /></div>
              </div>
            </div>
          )}

          <div className="space-y-1 text-[10.5px]">
            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Khoảng cách từ S đến đáy:</span>
              <KatexMath math={`d(S,(ABCD)) = ${formatVNFloat(currentHeight)}\\text{ m}`} className="text-emerald-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Cạnh đáy AB và AD:</span>
              <KatexMath math={`AB \\approx ${formatVNFloat(edgeAB)},\\; AD \\approx ${formatVNFloat(edgeAD)}\\text{ m}`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Diện tích đáy S(ABCD):</span>
              <KatexMath math={`S_{ABCD} \\approx ${formatVNFloat(realBaseArea)}\\text{ m}^2`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Thể tích khối chóp:</span>
              <KatexMath
                math={`V = \\frac{1}{3} S_{ABCD} \\cdot h \\approx ${formatVNFloat(currentVolume)}\\text{ m}^3`}
                className="text-amber-300 font-bold"
              />
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Độ dài cạnh bên SA:</span>
              <KatexMath math={`SA \\approx ${formatVNFloat(edgeSA)}\\text{ m}`} className="text-slate-200" />
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Góc cạnh bên & đáy:</span>
              <KatexMath math={`\\varphi \\approx ${formatVNFloat(slantAngle)}^\\circ`} className="text-purple-300 font-semibold" />
            </div>
            {dihedralAngle !== null && <div className="flex justify-between items-center bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
              <span className="text-slate-400">Góc giữa (SAB) và đáy:</span>
              <KatexMath math={`\\theta \\approx ${formatVNFloat(dihedralAngle)}^\\circ`} className="text-amber-300 font-semibold" />
            </div>}
          </div>

          <div className="pt-1.5 border-t border-slate-800 text-[9.5px] space-y-0.5 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Kéo thả trực tiếp: Click & kéo đỉnh <strong className="text-amber-300">S</strong>, <strong className="text-cyan-300">A, B, D</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-bold">•</span>
              <span>Điểm tỉ số: <strong className="text-emerald-300">M</strong> (Trung điểm SA), <strong className="text-purple-300">N</strong> (2/3 SB)</span>
            </div>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[9px] text-slate-500">Chạm xoay 3D</span>
              <button
                type="button"
                onClick={() => setShowHudCard(false)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition-colors cursor-pointer"
              >
                Thu gọn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WebGL 3D Canvas */}
      <Canvas
        key={lowGraphics ? "fast" : "quality"}
        camera={{ position: [4.5, 3.5, 5.0], fov: 45 }}
        frameloop={lowGraphics ? "demand" : "always"}
        dpr={lowGraphics ? 1 : [1, 1.5]}
        gl={{ antialias: !lowGraphics, alpha: true, preserveDrawingBuffer: true, powerPreference: lowGraphics ? "low-power" : "high-performance" }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        {/* Studio Three-Point Lighting */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[7, 10, 6]} intensity={1.3} castShadow />
        <directionalLight position={[-7, 5, -5]} intensity={0.6} />
        <directionalLight position={[0, -3, -7]} intensity={0.8} color="#38bdf8" />

        {/* 1. Sàn lưới không gian Infinite Floor */}
        {showFloorGrid && (
          <gridHelper
            args={[20, 20, "#475569", "#1e293b"]}
            position={[0, -0.01, 0]}
          />
        )}

        {/* 2. Hệ trục tọa độ Oxyz chuẩn RGB (Đỏ Ox, Xanh lục Oy, Xanh dương Oz) */}
        {showAxes && (
          <OxyzAxesHelper
            size={7}
            position={originAtVertexA ? vertexA : new THREE.Vector3(0, 0, 0)}
            isAtVertexA={originAtVertexA}
          />
        )}

        {/* 3. Trọng tâm mô hình: Khối đa diện + Cạnh động thấy/khuất + Billboard KaTeX */}
        <DynamicPyramidMeshAndEdges
          apex={apexPos}
          baseA={vertexA}
          baseB={vertexB}
          baseC={vertexC}
          baseD={vertexD}
          pointM={pointM}
          pointN={pointN}
          baseWidth={edgeAB}
          baseDepth={edgeAD}
          foldT={foldT}
          showCoordinates={showCoordinates}
          showNormalVector={showNormalVector}
          showPerpendicularSymbol={true}
          showDiagonals={true}
          showSectionPlane={showSectionPlane}
          showHiddenEdges={showHiddenEdges}
          originAtVertexA={originAtVertexA}
          isTeacherMode={isTeacherMode}
        />

        {/* 4. Tay nắm tương tác 3D Direct Manipulation Handles */}
        {/* Đỉnh S (Kéo thay đổi chiều cao h trên trục Oz) */}
        <DraggableHandle
          id="S"
          label="S"
          position={apexPos}
          color="#f59e0b"
          glowColor="#fbbf24"
          constraint="vertical"
          onDrag={(newPos) => {
            setApexPos(newPos);
            if (onApexHeightChange) onApexHeightChange(Number(newPos.y.toFixed(2)));
          }}
          onDragEnd={() => {
            if (onVertexManipulated) {
              onVertexManipulated({
                vertex: "S",
                oldPos: new THREE.Vector3(0, apexHeight, 0),
                newPos: apexPos.clone(),
              });
            }
          }}
          setOrbitEnabled={setOrbitEnabled}
          isTeacherMode={isTeacherMode}
        />

        {/* Đỉnh A (Kéo trên mặt phẳng đáy y = 0) */}
        <DraggableHandle
          id="A"
          label="A"
          position={vertexA}
          color="#06b6d4"
          glowColor="#22d3ee"
          constraint="floor"
          onDrag={(newPos) => setVertexA(newPos)}
          onDragEnd={() => {
            if (onVertexManipulated) {
              onVertexManipulated({
                vertex: "A",
                oldPos: new THREE.Vector3(-halfW, 0, halfD),
                newPos: vertexA.clone(),
              });
            }
          }}
          setOrbitEnabled={setOrbitEnabled}
          isTeacherMode={isTeacherMode}
        />

        {/* Đỉnh B (Kéo trên mặt phẳng đáy y = 0) */}
        <DraggableHandle
          id="B"
          label="B"
          position={vertexB}
          color="#06b6d4"
          glowColor="#22d3ee"
          constraint="floor"
          onDrag={(newPos) => setVertexB(newPos)}
          onDragEnd={() => {
            if (onVertexManipulated) {
              onVertexManipulated({
                vertex: "B",
                oldPos: new THREE.Vector3(halfW, 0, halfD),
                newPos: vertexB.clone(),
              });
            }
          }}
          setOrbitEnabled={setOrbitEnabled}
          isTeacherMode={isTeacherMode}
        />

        {/* Đỉnh D (Kéo trên mặt phẳng đáy y = 0) */}
        <DraggableHandle
          id="D"
          label="D"
          position={vertexD}
          color="#06b6d4"
          glowColor="#22d3ee"
          constraint="floor"
          onDrag={(newPos) => setVertexD(newPos)}
          onDragEnd={() => {
            if (onVertexManipulated) {
              onVertexManipulated({
                vertex: "D",
                oldPos: new THREE.Vector3(-halfW, 0, -halfD),
                newPos: vertexD.clone(),
              });
            }
          }}
          setOrbitEnabled={setOrbitEnabled}
          isTeacherMode={isTeacherMode}
        />

        {/* Camera OrbitControls có Damping mượt mà */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minDistance={2.5}
          maxDistance={15}
          onEnd={() => {
            const controls = controlsRef.current;
            if (!controls) return;
            try { localStorage.setItem(cameraStorageKey, JSON.stringify({
              position: controls.object.position.toArray(), target: controls.target.toArray(),
            })); } catch {}
          }}
        />
      </Canvas>

      {/* Floating Control Sliders (Bottom Left): Khai triển phẳng & Chiều cao H (Mặc định thu gọn để màn hình thoáng) */}
      <div className="absolute bottom-3 left-3 z-10">
        {!showSliders ? (
          <button
            type="button"
            onClick={() => setShowSliders(true)}
            title="Mở thanh trượt điều chỉnh thông số hình chóp"
            className="p-2 sm:px-2.5 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-slate-100 rounded-xl border border-slate-800 shadow-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-[11px] font-medium text-slate-300">Thông số</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2 p-2.5 bg-slate-950/95 backdrop-blur-md rounded-xl border border-slate-800 shadow-2xl w-[200px] sm:w-[230px] animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-emerald-400" />
                <span>Thông số hình học</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSliders(false)}
                className="w-5 h-5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                title="Đóng thanh trượt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {onFoldPercentChange && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gấp / Mở hình:</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{foldPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={foldPercent}
                  onChange={(e) => onFoldPercentChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            )}

            {onApexHeightChange && (
              <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Move3d className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chiều cao h (SH):</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{formatVNFloat(currentHeight)} m</span>
                </div>
                <input
                  type="range"
                  min={1.2}
                  max={5.0}
                  step={0.1}
                  value={currentHeight}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setApexPos((prev) => new THREE.Vector3(prev.x, val, prev.z));
                    onApexHeightChange(val);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Camera Controls Toolbar (Bottom Right) - Dùng icon gọn gàng */}
      <div className={`absolute right-3 z-20 flex items-center gap-1 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl ${showSliders ? "bottom-16 sm:bottom-3" : "bottom-3"}`}>
        <button type="button" onClick={() => {
          const controls = controlsRef.current;
          if (controls) try { localStorage.setItem(cameraStorageKey, JSON.stringify({ position: controls.object.position.toArray(), target: controls.target.toArray() })); } catch {}
          setLowGraphics((current) => { try { localStorage.setItem("mathstep:fast-graphics", String(!current)); } catch {} return !current; });
        }} title={lowGraphics ? "Chế độ nhanh, giảm tải GPU; bấm để tăng chất lượng" : "Chất lượng cao; bấm để tiết kiệm GPU"}
          className="min-h-9 rounded-lg border border-slate-700 px-2 text-[11px] font-semibold text-slate-100 hover:bg-slate-800">
          {lowGraphics ? "Nhanh" : "Đẹp"}
        </button>
        <select aria-label="Chọn góc nhìn chuẩn" defaultValue="" onChange={(event) => { setCameraView(event.target.value as "default" | "top" | "front" | "side"); event.currentTarget.value = ""; }}
          className="min-h-9 max-w-[96px] rounded-lg border border-slate-700 bg-slate-900 px-1 text-[11px] font-semibold text-slate-100">
          <option value="" disabled>Góc nhìn</option>
          <option value="top">Từ trên</option>
          <option value="front">Chính diện</option>
          <option value="side">Bên cạnh</option>
        </select>
        <button
          type="button"
          onClick={handleRotate45}
          title="Xoay góc nhìn 45°"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleSnapshotFreeze}
          title={isFrozenView ? "Mở khóa xoay tự do" : "Khóa / Ghim góc nhìn"}
          className={`p-1.5 rounded-lg transition-colors ${
            isFrozenView ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Camera className="w-4 h-4" />
        </button>

        <button type="button" onClick={handleSnapshot} title="Lưu ảnh mô hình và chú thích" aria-label="Lưu ảnh mô hình và chú thích"
          className="min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800">
          <Download className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleResetCamera}
          title="Đặt lại góc nhìn mặc định (Chuẩn tâm)"
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
