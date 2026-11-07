"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  RotateCcw,
  RotateCw,
  Eye,
  Sparkles,
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

      {/* 6. Nhãn KaTeX 3D Billboard */}
      {/* Nhãn Ox */}
      <Html position={[size + 0.45, 0, 0]} center distanceFactor={9}>
        <div className="px-2 py-0.5 bg-red-950/90 backdrop-blur-md rounded-md border border-red-500/80 text-red-300 font-bold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="x" />
        </div>
      </Html>

      {/* Nhãn Oz (thẳng đứng lên trên) */}
      <Html position={[0, size + 0.45, 0]} center distanceFactor={9}>
        <div className="px-2 py-0.5 bg-blue-950/90 backdrop-blur-md rounded-md border border-blue-500/80 text-blue-300 font-bold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="z" />
        </div>
      </Html>

      {/* Nhãn Oy */}
      <Html position={[0, 0, -size - 0.45]} center distanceFactor={9}>
        <div className="px-2 py-0.5 bg-emerald-950/90 backdrop-blur-md rounded-md border border-emerald-500/80 text-emerald-300 font-bold text-xs shadow-lg select-none pointer-events-none whitespace-nowrap">
          <KatexMath math="y" />
        </div>
      </Html>

      {/* Nhãn Gốc O */}
      <Html position={[-0.3, -0.25, 0.3]} center distanceFactor={9}>
        <div className="px-2 py-0.5 bg-slate-900/95 backdrop-blur-md rounded-md border border-slate-500 text-slate-100 font-bold text-[11px] shadow-lg select-none pointer-events-none whitespace-nowrap">
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
      const mnMat = new THREE.LineDashedMaterial({
        color: 0x84cc16, // Lime-500
        dashSize: 0.2,
        gapSize: 0.12,
        linewidth: isTeacherMode ? 3.5 : 2,
      });
      const mnLine = new THREE.Line(mnGeo, mnMat);
      mnLine.computeLineDistances();
      group.add(mnLine);
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

      {/* 3. Vectơ Pháp Tuyến mặt phẳng đáy: n = (0; 0; 1) chuẩn Oz thẳng đứng */}
      {showNormalVector && (
        <group position={[0, 0, 0]}>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.5, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <coneGeometry args={[0.08, 0.22, 16]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
          </mesh>
          <Html position={[0, 1.82, 0]} center distanceFactor={8}>
            <div className={`px-2.5 py-1 bg-amber-950/90 backdrop-blur-md border border-amber-500/80 rounded-lg text-amber-300 font-bold shadow-xl select-none pointer-events-none whitespace-nowrap ${
              isTeacherMode ? "text-sm" : "text-xs"
            }`}>
              <KatexMath math="\vec{n}_{(ABCD)} = (0;\, 0;\, 1)" />
            </div>
          </Html>
        </group>
      )}

      {/* 4. Nhãn Ký hiệu Vuông góc SH vuông góc đáy */}
      {showPerpendicularSymbol && (
        <Html position={[apex.x + 0.42, 0.2, apex.z + 0.42]} center distanceFactor={8}>
          <div className="px-1.5 py-0.5 bg-rose-950/90 backdrop-blur-md border border-rose-500/80 rounded text-rose-300 text-[10px] font-bold shadow select-none pointer-events-none whitespace-nowrap">
            <KatexMath math="SH \perp (ABCD)" />
          </div>
        </Html>
      )}

      {/* Điểm M (Trung điểm SA) */}
      <group position={pointM}>
        <mesh>
          <sphereGeometry args={[isTeacherMode ? 0.12 : 0.08, 16, 16]} />
          <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.6} />
        </mesh>
        <Html position={[0.2, 0.2, 0]} center distanceFactor={isTeacherMode ? 10 : 8.5}>
          <div className={`px-2 py-0.5 bg-emerald-950/95 backdrop-blur-md border border-emerald-400 rounded font-bold text-emerald-300 shadow select-none pointer-events-none whitespace-nowrap ${
            isTeacherMode ? "text-xs px-2.5 py-1" : "text-[10px]"
          }`}>
            <KatexMath math="M \text{ (Trung điểm } SA)" />
          </div>
        </Html>
      </group>

      {/* Điểm N (Tỉ số 2:1 trên SB) */}
      <group position={pointN}>
        <mesh>
          <sphereGeometry args={[isTeacherMode ? 0.12 : 0.08, 16, 16]} />
          <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.6} />
        </mesh>
        <Html position={[0.2, 0.2, 0]} center distanceFactor={isTeacherMode ? 10 : 8.5}>
          <div className={`px-2 py-0.5 bg-purple-950/95 backdrop-blur-md border border-purple-400 rounded font-bold text-purple-300 shadow select-none pointer-events-none whitespace-nowrap ${
            isTeacherMode ? "text-xs px-2.5 py-1" : "text-[10px]"
          }`}>
            <KatexMath math="N \left(\frac{SN}{SB} = \frac{2}{3}\right)" />
          </div>
        </Html>
      </group>

      {/* 5. Đỉnh Billboard Labels bằng KaTeX 100% chuẩn tọa độ THPT */}
      {/* Đỉnh S */}
      <Html position={[apex.x, apex.y + 0.32, apex.z]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-slate-900/95 backdrop-blur-md rounded-lg border border-teal-400/80 text-teal-300 font-bold shadow-xl select-none pointer-events-none flex items-center gap-1.5 whitespace-nowrap ${
          isTeacherMode ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? `S(${formatVNFloat(baseWidth / 2)};\\, ${formatVNFloat(baseDepth / 2)};\\, ${formatVNFloat(apex.y)})`
                  : `S(0;\\, 0;\\, ${formatVNFloat(apex.y)})`
                : "S"
            }
          />
        </div>
      </Html>

      {/* Đỉnh A */}
      <Html position={[baseA.x - 0.25, baseA.y - 0.18, baseA.z + 0.25]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold shadow-lg select-none pointer-events-none whitespace-nowrap ${
          isTeacherMode ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? "A(0;\\, 0;\\, 0)"
                  : `A(-${formatVNFloat(baseWidth / 2)};\\, -${formatVNFloat(baseDepth / 2)};\\, 0)`
                : "A"
            }
          />
        </div>
      </Html>

      {/* Đỉnh B */}
      <Html position={[baseB.x + 0.25, baseB.y - 0.18, baseB.z + 0.25]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold shadow-lg select-none pointer-events-none whitespace-nowrap ${
          isTeacherMode ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? `B(${formatVNFloat(baseWidth)};\\, 0;\\, 0)`
                  : `B(${formatVNFloat(baseWidth / 2)};\\, -${formatVNFloat(baseDepth / 2)};\\, 0)`
                : "B"
            }
          />
        </div>
      </Html>

      {/* Đỉnh C */}
      <Html position={[baseC.x + 0.25, baseC.y - 0.18, baseC.z - 0.25]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold shadow-lg select-none pointer-events-none whitespace-nowrap ${
          isTeacherMode ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? `C(${formatVNFloat(baseWidth)};\\, ${formatVNFloat(baseDepth)};\\, 0)`
                  : `C(${formatVNFloat(baseWidth / 2)};\\, ${formatVNFloat(baseDepth / 2)};\\, 0)`
                : "C"
            }
          />
        </div>
      </Html>

      {/* Đỉnh D */}
      <Html position={[baseD.x - 0.25, baseD.y - 0.18, baseD.z - 0.25]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-600 text-slate-100 font-semibold shadow-lg select-none pointer-events-none whitespace-nowrap ${
          isTeacherMode ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? `D(0;\\, ${formatVNFloat(baseDepth)};\\, 0)`
                  : `D(-${formatVNFloat(baseWidth / 2)};\\, ${formatVNFloat(baseDepth / 2)};\\, 0)`
                : "D"
            }
          />
        </div>
      </Html>

      {/* Chân đường cao H */}
      <Html position={[apex.x, 0.12, apex.z]} center distanceFactor={isTeacherMode ? 11 : 9}>
        <div className={`bg-rose-950/95 backdrop-blur-md rounded-lg border border-rose-500/80 text-rose-300 font-bold shadow-md select-none pointer-events-none whitespace-nowrap ${
          isTeacherMode ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]"
        }`}>
          <KatexMath
            math={
              showCoordinates
                ? originAtVertexA
                  ? `H(${formatVNFloat(baseWidth / 2)};\\, ${formatVNFloat(baseDepth / 2)};\\, 0)`
                  : "H(0;\\, 0;\\, 0)"
                : "H"
            }
          />
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
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
  const [showNormalVector, setShowNormalVector] = useState<boolean>(true);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const [showFloorGrid, setShowFloorGrid] = useState<boolean>(true);
  const [showSectionPlane, setShowSectionPlane] = useState<boolean>(true);
  const [showHiddenEdges, setShowHiddenEdges] = useState<boolean>(true);
  const [originAtVertexA, setOriginAtVertexA] = useState<boolean>(false);
  const [showHudCard, setShowHudCard] = useState<boolean>(true);
  const [isFrozenView, setIsFrozenView] = useState<boolean>(false);
  const [freezeNotice, setFreezeNotice] = useState<string | null>(null);
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
  const centerH = useMemo(
    () => new THREE.Vector3().addVectors(vertexA, vertexC).multiplyScalar(0.5),
    [vertexA, vertexC]
  );

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
  const currentHeight = apexPos.y;
  const currentVolume = (1 / 3) * realBaseArea * currentHeight;
  const edgeSA = apexPos.distanceTo(vertexA);
  const slantAngle = (Math.atan2(currentHeight, vertexA.distanceTo(centerH)) * 180) / Math.PI;

  const foldT = foldPercent / 100;

  // Reset góc nhìn Camera về góc chuẩn & vị trí đỉnh ban đầu
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setVertexA(new THREE.Vector3(-halfW, 0, halfD));
    setVertexB(new THREE.Vector3(halfW, 0, halfD));
    setVertexD(new THREE.Vector3(-halfW, 0, -halfD));
    setApexPos(new THREE.Vector3(0, apexHeight, 0));
    setIsFrozenView(false);
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
      className={`relative w-full h-full flex flex-col bg-gradient-to-b from-[#0F172A] via-[#091122] to-[#020617] select-none overflow-hidden rounded-xl border border-slate-700 shadow-2xl ${className}`}
    >
      {/* Toast thông báo đóng băng cấu hình */}
      {freezeNotice && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-2xl animate-fade-in flex items-center gap-2">
          <Camera className="w-4 h-4 text-slate-950" />
          <span>{freezeNotice}</span>
        </div>
      )}

      {/* Top Banner Toolbar: Tiêu đề & Công cụ khảo sát chuẩn SGK */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          <div className="px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">Hình chóp</span>
            <KatexMath math="S.ABCD" className="font-bold text-teal-300" />
            {isTeacherMode && (
              <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase">
                GV 1.5x
              </span>
            )}
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
            <span>{orthogonalView ? "Trực giao" : "Phối cảnh 3D"}</span>
          </button>

          {/* Nút Toggle: Hiện / Ẩn Trục Oxyz */}
          <button
            onClick={() => setShowAxes((v) => !v)}
            title="Bật/Tắt hệ trục tọa độ Oxyz chuẩn RGB (Đỏ Ox, Xanh lục Oy, Xanh dương Oz)"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showAxes
                ? "bg-slate-800 border-red-500/80 text-red-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Axis3d className="w-3.5 h-3.5" />
            <span>{showAxes ? "Trục Oxyz" : "Ẩn Oxyz"}</span>
          </button>

          {/* Nút Toggle: Hiện / Ẩn Mặt sàn Oxy */}
          <button
            onClick={() => setShowFloorGrid((v) => !v)}
            title="Bật/Tắt lưới mặt sàn không gian Oxy bên dưới hình chóp"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showFloorGrid
                ? "bg-slate-800 border-cyan-500/80 text-cyan-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>{showFloorGrid ? "Mặt sàn Oxy" : "Ẩn sàn"}</span>
          </button>

          {/* Nút Toggle: Gắn gốc O vào đỉnh A */}
          <button
            onClick={() => setOriginAtVertexA((v) => !v)}
            title="Chuyển đổi vị trí gốc O giữa tâm đáy H và đỉnh A (Hỗ trợ phương pháp tọa độ hóa)"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              originAtVertexA
                ? "bg-slate-800 border-amber-500/90 text-amber-300 ring-1 ring-amber-500/40"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{originAtVertexA ? "Gốc O tại Đỉnh A" : "Gốc O tại Tâm H"}</span>
          </button>

          {/* Nút Toggle: Mặt phẳng cắt qua MN */}
          <button
            onClick={() => setShowSectionPlane((v) => !v)}
            title="Bật/Tắt hiển thị thiết diện cắt qua đoạn MN (Trung điểm SA và Tỉ số 2:1 trên SB)"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showSectionPlane
                ? "bg-slate-800 border-lime-500/80 text-lime-300"
                : "bg-slate-900/85 border-slate-700 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>{showSectionPlane ? "Mặt phẳng (MN)" : "Ẩn mặt MN"}</span>
          </button>

          {/* Nút Toggle: Nét đứt cạnh khuất */}
          <button
            onClick={() => setShowHiddenEdges((v) => !v)}
            title="Bật/Tắt hiển thị quy ước cạnh khuất nét đứt (Back-face Culling)"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showHiddenEdges
                ? "bg-slate-800 border-slate-500 text-slate-200"
                : "bg-slate-900/85 border-slate-700 text-slate-500"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{showHiddenEdges ? "Nét đứt: BẬT" : "Nét đứt: TẮT"}</span>
          </button>

          {/* Nút Toggle: Tọa độ Đỉnh */}
          <button
            onClick={() => setShowCoordinates((v) => !v)}
            title="Bật/Tắt hiển thị nhãn tọa độ số học trên các đỉnh"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showCoordinates
                ? "bg-slate-800 border-teal-500/80 text-teal-300"
                : "bg-slate-900/85 border-slate-700 text-slate-500"
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>{showCoordinates ? "Tọa độ: BẬT" : "Tọa độ: TẮT"}</span>
          </button>

          {/* Nút Toggle: Vectơ Pháp Tuyến */}
          <button
            onClick={() => setShowNormalVector((v) => !v)}
            title="Bật/Tắt hiển thị vectơ pháp tuyến n vuông góc đáy"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              showNormalVector
                ? "bg-slate-800 border-amber-500/80 text-amber-300"
                : "bg-slate-900/85 border-slate-700 text-slate-500"
            }`}
          >
            <CompassIcon className="w-3.5 h-3.5" />
            <span>{showNormalVector ? "Vectơ n" : "Ẩn vectơ"}</span>
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
            <span>Bảng SGK 11/12</span>
            {showHudCard ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating HUD Card: BẢNG ĐẠI LƯỢNG HÌNH HỌC (SGK TOÁN 11 & 12 KẾT NỐI TRI THỨC) */}
      {showHudCard && (
        <div className="absolute top-14 right-3 z-20 w-80 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 p-3 shadow-2xl text-xs text-slate-200 space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
            <span className="font-bold text-teal-300 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span>ĐẠI LƯỢNG HÌNH HỌC (SGK 11 & 12)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Chuẩn KNTT</span>
          </div>

          {/* Phương pháp Tọa độ hóa hình học không gian (Toán 12) khi gắn gốc O vào A */}
          {originAtVertexA && (
            <div className="p-2 bg-amber-950/80 border border-amber-600/70 rounded-lg space-y-1 text-[11px] text-amber-200">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>TỌA ĐỘ HÓA TẠI ĐỈNH A (SGK TOÁN 12)</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                Gốc <KatexMath math="O \equiv A(0;\,0;\,0)" />, tia <KatexMath math="AB \equiv Ox" />, tia <KatexMath math="AD \equiv Oy" />, tia <KatexMath math="Az \parallel SH" />.
              </p>
              <div className="pt-0.5 space-y-0.5 text-[10px]">
                <div>• <KatexMath math={`\\vec{AB} = (${formatVNFloat(edgeAB)};\\, 0;\\, 0)`} /></div>
                <div>• <KatexMath math={`\\vec{AD} = (0;\\, ${formatVNFloat(edgeAD)};\\, 0)`} /></div>
                <div>• <KatexMath math={`\\vec{AS} = (${formatVNFloat(edgeAB / 2)};\\, ${formatVNFloat(edgeAD / 2)};\\, ${formatVNFloat(currentHeight)})`} /></div>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Chiều cao chóp:</span>
              <KatexMath math={`h = SH = ${formatVNFloat(currentHeight)}\\text{ m}`} className="text-emerald-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Cạnh đáy AB & AD:</span>
              <KatexMath math={`a \\approx ${formatVNFloat(edgeAB)}\\text{ m}`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Diện tích đáy S(ABCD):</span>
              <KatexMath math={`S_{ABCD} \\approx ${formatVNFloat(realBaseArea)}\\text{ m}^2`} className="text-cyan-300 font-semibold" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Thể tích khối chóp:</span>
              <KatexMath
                math={`V = \\frac{1}{3} S_{ABCD} \\cdot h \\approx ${formatVNFloat(currentVolume)}\\text{ m}^3`}
                className="text-amber-300 font-bold"
              />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Độ dài cạnh bên SA:</span>
              <KatexMath math={`SA \\approx ${formatVNFloat(edgeSA)}\\text{ m}`} className="text-slate-200" />
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 p-1.5 rounded border border-slate-700/50">
              <span className="text-slate-400">Góc cạnh bên & đáy:</span>
              <KatexMath math={`\\varphi \\approx ${formatVNFloat(slantAngle)}^\\circ`} className="text-purple-300 font-semibold" />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-700 text-[10px] space-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">•</span>
              <span>Kéo thả trực tiếp: Click & kéo đỉnh <strong className="text-amber-300">S</strong>, <strong className="text-cyan-300">A, B, D</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lime-400 font-bold">•</span>
              <span>Điểm tỉ số: <strong className="text-lime-300">M</strong> (Trung điểm SA), <strong className="text-purple-300">N</strong> (2/3 SB)</span>
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
                <Move3d className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chiều cao <KatexMath math={`h = SH = ${formatVNFloat(currentHeight)}`} />:</span>
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
              className="w-56 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Teacher Presentation & Studio Quick Toolbar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl flex-wrap">
        <button
          onClick={handleRotate45}
          title="Xoay camera 45° mượt mà (Hỗ trợ trình chiếu lớp học)"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RotateCw className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline">Xoay 45°</span>
        </button>

        <button
          onClick={handleSnapshotFreeze}
          title={isFrozenView ? "Mở lại góc nhìn xoay tự do" : "Đóng băng cấu hình góc nhìn bài giảng"}
          className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
            isFrozenView ? "bg-amber-500 text-slate-950 font-bold" : "hover:bg-slate-800 text-slate-300 hover:text-white"
          }`}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden md:inline">{isFrozenView ? "Đã ghim" : "Ghim góc nhìn"}</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset góc nhìn Camera và hoàn nguyên các đỉnh về chuẩn"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">Chuẩn tâm</span>
        </button>
      </div>
    </div>
  );
}
