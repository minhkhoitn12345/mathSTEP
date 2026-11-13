"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Check, CircleHelp, LoaderCircle, RotateCcw, Rotate3D, Sparkles, ZoomIn, ZoomOut } from "lucide-react";
import { MathFormattedText } from "@/app/components/KatexMath";
import { FirstThreeFrame, ThreeSceneLoadingOverlay } from "@/app/components/ThreeSceneLoading";
import problemData from "@/app/data/spatial-geometry/exercises.json";
import { parseSpatialGeometryProblem, type SpatialGeometryProblem } from "@/app/lib/spatialGeometryProblemParser";
import type { CustomAiConfig } from "@/app/components/AccountSettingsModal";

type Vec3 = [number, number, number];
type ProblemGeometry = SpatialGeometryProblem["geometry"];
type InteractiveNode = { id: string; label: string; coord?: Vec3; edge?: [string, string]; t?: number };
type SpatialExercise = {
  id: string;
  level: 1 | 2 | 3;
  interactionType: "identify_point" | "construct_section" | "parameter_slider";
  title: string;
  question: string;
  sceneConfig: { cameraPosition: Vec3; target: Vec3 };
  geometry: ProblemGeometry;
  interactiveNodes?: InteractiveNode[];
  correctNodeId?: string;
  requiredNodeIds?: string[];
  expectedNodeIds?: string[];
  expectedPolygonType?: string;
  cutPlaneEquation?: string;
  slider?: { param: "k"; min: number; max: number; step: number; defaultValue: number; label: string };
  targetCondition?: { type: "area_ratio"; targetValue: number; tolerance: number };
  explanationFormula?: string;
  feedback: { correct: string; incorrect: string };
};

type Solid = {
  vertices: Map<string, Vec3>;
  faces: string[][];
  edges: Array<{ ids: [string, string]; hidden: boolean }>;
  base: Vec3[];
  apex: Vec3;
  baseNames: string[];
  apexName: string;
  center: Vec3;
  centerName?: string;
  heightLine?: ProblemGeometry["heightLine"];
  angleMarker?: ProblemGeometry["angleMarker"];
};

function createExercises(PROBLEM: SpatialGeometryProblem): SpatialExercise[] {
  const targetPercent = Math.round((PROBLEM.pedagogy.level3_ParametricSlider?.targetRatio ?? 0.25) * 100);
  return [
  {
    id: "hhkg_11_goc_sc_mat_phang_day", level: 1, interactionType: "identify_point",
    title: PROBLEM.problemMetadata.title, question: PROBLEM.pedagogy.level1_Identify.question,
    sceneConfig: PROBLEM.sceneConfig, geometry: PROBLEM.geometry,
    interactiveNodes: PROBLEM.geometry.vertices.map(({ id, label, coords }) => ({ id, label, coord: coords })),
    correctNodeId: PROBLEM.pedagogy.level1_Identify.targetNodeId,
    feedback: { correct: PROBLEM.pedagogy.level1_Identify.successExplanation, incorrect: "Hãy tìm hình chiếu vuông góc của đường thẳng lên mặt phẳng đáy từ giả thiết vuông góc, rồi xác định điểm cần chọn." },
  },
  ...(PROBLEM.pedagogy.level2_Construction ? [{
    id: "hhkg_11_thiet_dien_song_song_day", level: 2 as const, interactionType: "construct_section" as const,
    title: "Dựng thiết diện song song với đáy", question: PROBLEM.pedagogy.level2_Construction.question,
    sceneConfig: PROBLEM.sceneConfig, geometry: PROBLEM.geometry,
    interactiveNodes: PROBLEM.pedagogy.level2_Construction.crossSectionVertices.map((id) => {
      const vertex = PROBLEM.geometry.vertices.find((item) => item.id === id)!;
      return { id, label: vertex.label, coord: vertex.coords };
    }),
    requiredNodeIds: PROBLEM.pedagogy.level2_Construction.requiredNodeIds ?? [],
    expectedNodeIds: PROBLEM.pedagogy.level2_Construction.crossSectionVertices,
    expectedPolygonType: PROBLEM.pedagogy.level2_Construction.expectedPolygonType,
    cutPlaneEquation: PROBLEM.pedagogy.level2_Construction.cutPlaneEquation,
    feedback: { correct: `Đúng. Mặt phẳng cắt có phương trình ${PROBLEM.pedagogy.level2_Construction.cutPlaneEquation}; thiết diện là ${PROBLEM.pedagogy.level2_Construction.expectedPolygonType}.`, incorrect: "Kiểm tra các điểm đã chọn có thuộc cùng mặt phẳng và không thẳng hàng hay chưa. Hãy đọc lại điều kiện của mặt phẳng cắt." },
  }] : []),
  ...(PROBLEM.pedagogy.level3_ParametricSlider ? [{
    id: "hhkg_11_ti_so_thiet_dien", level: 3 as const, interactionType: "parameter_slider" as const,
    title: "Kiểm chứng tỉ số diện tích và thể tích",
    question: `Điều chỉnh ${PROBLEM.pedagogy.level3_ParametricSlider.parameter} để thiết diện song song với đáy có diện tích bằng ${targetPercent}% diện tích đáy.`,
    sceneConfig: PROBLEM.sceneConfig, geometry: PROBLEM.geometry,
    slider: { param: "k" as const, min: PROBLEM.pedagogy.level3_ParametricSlider.min, max: PROBLEM.pedagogy.level3_ParametricSlider.max, step: PROBLEM.pedagogy.level3_ParametricSlider.step, defaultValue: 0.8, label: "Tỉ số SM / SB" },
    targetCondition: { type: "area_ratio" as const, targetValue: PROBLEM.pedagogy.level3_ParametricSlider.targetRatio, tolerance: 0.01 },
    explanationFormula: PROBLEM.pedagogy.level3_ParametricSlider.formulaLatex,
    feedback: { correct: "Chính xác. Thiết diện song song với đáy đồng dạng với đáy; tỉ số diện tích bằng bình phương tỉ số đồng dạng.", incorrect: `Diện tích biến đổi theo bình phương tỉ số đồng dạng. Hãy tìm k sao cho k² = ${(PROBLEM.pedagogy.level3_ParametricSlider.targetRatio).toFixed(2)}.` },
  }] : []),
  ];
}
const AXIS_SIZE = 3.5;
const EPSILON = 1e-5;

function buildSolid(config: ProblemGeometry): Solid {
  const vertices = new Map(config.vertices.map(({ id, coords }) => [id, coords]));
  const baseFace = config.faces.find((face) => face.every((id) => Math.abs(vertices.get(id)?.[1] ?? Infinity) < EPSILON)) ?? config.faces[0];
  const apexEntry = config.vertices.reduce((highest, item) => item.coords[1] > highest.coords[1] ? item : highest, config.vertices[0]);
  const base = baseFace.map((id) => vertices.get(id)!).filter(Boolean);
  const center = base.reduce<Vec3>((sum, p) => [sum[0] + p[0] / base.length, sum[1] + p[1] / base.length, sum[2] + p[2] / base.length], [0, 0, 0]);
  return {
    vertices, faces: config.faces,
    edges: [...config.solidEdges.map((ids) => ({ ids: [ids[0], ids[1]] as [string, string], hidden: false })), ...config.dashedEdges.map((ids) => ({ ids: [ids[0], ids[1]] as [string, string], hidden: true }))],
    base, apex: apexEntry.coords, baseNames: baseFace, apexName: apexEntry.id, center,
    heightLine: config.heightLine, angleMarker: config.angleMarker,
  };
}

function getLabeledVertices(solid: Solid): Map<string, Vec3> {
  return solid.vertices;
}

function getNodeCoordinate(node: InteractiveNode, vertices: Map<string, Vec3>): Vec3 | null {
  if (node.coord) return node.coord;
  if (!node.edge || typeof node.t !== "number") return null;
  const start = vertices.get(node.edge[0]);
  const end = vertices.get(node.edge[1]);
  if (!start || !end) return null;
  return [0, 1, 2].map((axis) => start[axis] + (end[axis] - start[axis]) * node.t!) as Vec3;
}

function getSolidEdges(solid: Solid): Array<[Vec3, Vec3]> {
  return solid.edges.flatMap(({ ids }) => {
    const start = solid.vertices.get(ids[0]); const end = solid.vertices.get(ids[1]);
    return start && end ? [[start, end] as [Vec3, Vec3]] : [];
  });
}

/** k is the ratio from S along each lateral edge; the cut height is h(1-k). */
function buildParametricCrossSection(apex: Vec3, base: Vec3[], k: number): Vec3[] {
  const ratio = THREE.MathUtils.clamp(k, 0, 1);
  return base.map((basePoint) => [
    apex[0] + (basePoint[0] - apex[0]) * ratio,
    apex[1] + (basePoint[1] - apex[1]) * ratio,
    apex[2] + (basePoint[2] - apex[2]) * ratio,
  ] as Vec3);
}

function getSectionFromPlane(solid: Solid, planePoints: Vec3[]): Vec3[] {
  if (planePoints.length < 3) return [];
  const a = new THREE.Vector3(...planePoints[0]);
  const b = new THREE.Vector3(...planePoints[1]);
  const c = new THREE.Vector3(...planePoints[2]);
  const normal = new THREE.Vector3().crossVectors(b.clone().sub(a), c.clone().sub(a));
  if (normal.lengthSq() < EPSILON) return [];
  normal.normalize();
  const offset = -normal.dot(a);
  const signedDistance = (p: Vec3) => normal.x * p[0] + normal.y * p[1] + normal.z * p[2] + offset;
  const intersections: THREE.Vector3[] = [];
  const addUnique = (point: THREE.Vector3) => {
    if (!intersections.some((existing) => existing.distanceToSquared(point) < EPSILON * EPSILON)) intersections.push(point);
  };

  for (const [start, end] of getSolidEdges(solid)) {
    const ds = signedDistance(start);
    const de = signedDistance(end);
    if (Math.abs(ds) < EPSILON) addUnique(new THREE.Vector3(...start));
    if (Math.abs(de) < EPSILON) addUnique(new THREE.Vector3(...end));
    if (ds * de < -EPSILON * EPSILON) {
      const t = ds / (ds - de);
      addUnique(new THREE.Vector3(...start).lerp(new THREE.Vector3(...end), t));
    }
  }
  if (intersections.length < 3) return [];

  const centroid = intersections.reduce((sum, p) => sum.add(p), new THREE.Vector3()).multiplyScalar(1 / intersections.length);
  const u = intersections[0].clone().sub(centroid).normalize();
  const v = new THREE.Vector3().crossVectors(normal, u).normalize();
  intersections.sort((p, q) => {
    const p0 = p.clone().sub(centroid);
    const q0 = q.clone().sub(centroid);
    return Math.atan2(p0.dot(v), p0.dot(u)) - Math.atan2(q0.dot(v), q0.dot(u));
  });
  return intersections.map((point) => [point.x, point.y, point.z]);
}

function classifySection(count: number): string {
  if (count === 3) return "tam giác";
  if (count === 4) return "tứ giác";
  if (count === 5) return "ngũ giác";
  if (count === 6) return "lục giác";
  return `${count}-giác`;
}

function distance(a: Vec3, b: Vec3): number {
  return new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));
}

function angleDegrees(vertex: Vec3, first: Vec3, second: Vec3): number {
  const u = new THREE.Vector3(...first).sub(new THREE.Vector3(...vertex)).normalize();
  const v = new THREE.Vector3(...second).sub(new THREE.Vector3(...vertex)).normalize();
  return THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(u.dot(v), -1, 1)));
}

function FaceMesh({ points, material, faceRefs }: {
  points: Vec3[];
  material: THREE.Material;
  faceRefs?: React.MutableRefObject<THREE.Mesh[]>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    points.forEach(([x, y, z]) => positions.push(x, y, z));
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const indices: number[] = [];
    for (let i = 1; i < points.length - 1; i += 1) indices.push(0, i, i + 1);
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [points]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !faceRefs) return;
    faceRefs.current.push(mesh);
    return () => {
      faceRefs.current = faceRefs.current.filter((item) => item !== mesh);
      geometry.dispose();
    };
  }, [faceRefs, geometry]);

  return <mesh ref={meshRef} geometry={geometry} material={material} />;
}

function PyramidModel({ solid, section, nodes, selectedNodeIds, onSelectNode }: {
  solid: Solid;
  section: Vec3[];
  nodes: Array<InteractiveNode & { position: Vec3 }>;
  selectedNodeIds: string[];
  onSelectNode: (id: string) => void;
}) {
  const faceRefs = useRef<THREE.Mesh[]>([]);
  const vertices = useMemo(() => getLabeledVertices(solid), [solid]);
  const baseMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }), []);
  const sideMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }), []);
  const sectionMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false }), []);
  const labelEntries = useMemo(() => Array.from(vertices.entries()), [vertices]);
  useEffect(() => () => {
    baseMaterial.dispose();
    sideMaterial.dispose();
    sectionMaterial.dispose();
  }, [baseMaterial, sideMaterial, sectionMaterial]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 8, 5]} intensity={1.4} />
      <gridHelper args={[6, 12, 0x94a3b8, 0xe2e8f0]} position={[0, -0.012, 0]} />
      <axesHelper args={[AXIS_SIZE]} />
      <Html position={[AXIS_SIZE + 0.2, 0, 0]} center style={{ pointerEvents: "none" }}><span className="rounded bg-white/90 px-1 text-[11px] font-bold text-red-600">x</span></Html>
      <Html position={[0, AXIS_SIZE + 0.2, 0]} center style={{ pointerEvents: "none" }}><span className="rounded bg-white/90 px-1 text-[11px] font-bold text-emerald-600">y</span></Html>
      <Html position={[0, 0, AXIS_SIZE + 0.2]} center style={{ pointerEvents: "none" }}><span className="rounded bg-white/90 px-1 text-[11px] font-bold text-blue-600">z</span></Html>

      <GeometryMarkers solid={solid} />
      {solid.faces.map((face, index) => {
        const points = face.map((id) => vertices.get(id)).filter((point): point is Vec3 => Boolean(point));
        const isBase = face.every((id) => Math.abs(vertices.get(id)?.[1] ?? Infinity) < EPSILON);
        return <FaceMesh key={`face-${index}`} points={points} material={isBase ? baseMaterial : sideMaterial} faceRefs={faceRefs} />;
      })}
      {solid.edges.map(({ ids, hidden }, index) => {
        const start = vertices.get(ids[0]); const end = vertices.get(ids[1]);
        return start && end ? <VisibleOrHiddenEdge key={`edge-${index}`} start={start} end={end} faceRefs={faceRefs} initiallyHidden={hidden} /> : null;
      })}
      {section.length >= 3 && (
        <>
          <FaceMesh points={section} material={sectionMaterial} />
          <SectionOutline points={section} />
        </>
      )}

      {labelEntries.map(([name, position]) => (
        <Html key={`label-${name}`} position={position} center distanceFactor={10} style={{ pointerEvents: "none" }}>
          <span className="inline-block rounded-sm bg-white/80 px-1 py-0 text-[9px] font-bold leading-3 text-slate-800 shadow-sm" style={{ transform: "translate(5px, -9px)" }}>{name}</span>
        </Html>
      ))}
      {nodes.map((node) => {
        const selected = selectedNodeIds.includes(node.id);
        return (
          <group key={node.id} position={node.position}>
            <mesh
              onClick={(event) => { event.stopPropagation(); onSelectNode(node.id); }}
              onPointerOver={(event) => { event.stopPropagation(); document.body.style.cursor = "pointer"; }}
              onPointerOut={() => { document.body.style.cursor = "auto"; }}
              scale={selected ? 1.35 : 1}
            >
              <sphereGeometry args={[0.095, 16, 16]} />
              <meshBasicMaterial color={selected ? 0x16a34a : 0xf97316} />
            </mesh>
            {!vertices.has(node.id) && (
              <Html position={[0, 0.18, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold shadow-sm ${selected ? "bg-emerald-600 text-white" : "bg-orange-100 text-orange-900"}`}>{node.id}</span>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}

function GeometryMarkers({ solid }: { solid: Solid }) {
  const footCoord = solid.heightLine ? solid.vertices.get(solid.heightLine.end) : solid.center;
  const startCoord = solid.heightLine ? solid.vertices.get(solid.heightLine.start) : solid.apex;
  const foot = new THREE.Vector3(...(footCoord ?? solid.center));
  const vertical = new THREE.Vector3(...(startCoord ?? solid.apex)).sub(foot).normalize();
  const basePoint = solid.base.find((point) => new THREE.Vector3(...point).distanceTo(foot) > EPSILON) ?? solid.base[0];
  const baseDirection = new THREE.Vector3(...basePoint).sub(foot).normalize();
  const markerSize = 0.22;
  const rightAnglePoints = [foot.clone().addScaledVector(vertical, markerSize), foot.clone().addScaledVector(vertical, markerSize).addScaledVector(baseDirection, markerSize), foot.clone().addScaledVector(baseDirection, markerSize)];
  const angleMarker = solid.angleMarker;
  const vertex = new THREE.Vector3(...(angleMarker ? solid.vertices.get(angleMarker.vertex)! : solid.base[0]));
  const directionA = new THREE.Vector3(...(angleMarker ? solid.vertices.get(angleMarker.firstRay)! : solid.apex)).sub(vertex).normalize();
  const directionB = new THREE.Vector3(...(angleMarker ? solid.vertices.get(angleMarker.secondRay)! : solid.base[1])).sub(vertex).normalize();
  const normal = new THREE.Vector3().crossVectors(directionA, directionB).normalize();
  const angle = Math.acos(THREE.MathUtils.clamp(directionA.dot(directionB), -1, 1));
  const anglePoints = Array.from({ length: 18 }, (_, index) => {
    const rotation = new THREE.Quaternion().setFromAxisAngle(normal, angle * (index / 17));
    return vertex.clone().add(directionA.clone().applyQuaternion(rotation).multiplyScalar(0.46));
  });

  return (
    <>
      {solid.heightLine?.hasRightAngleMark && <Line points={rightAnglePoints} color="#d97706" lineWidth={2} />}
      {angleMarker && <><Line points={anglePoints} color="#d97706" lineWidth={2} /><Html position={vertex.clone().addScaledVector(directionA.clone().add(directionB).normalize(), 0.55).toArray()} center style={{ pointerEvents: "none" }}><span className="rounded bg-white/90 px-1 text-[10px] font-bold text-amber-700">{angleMarker.label}</span></Html></>}
    </>
  );
}

function SolidEdge({ start, end, color = 0x0284c7, faceRefs, initiallyHidden = false }: {
  start: Vec3;
  end: Vec3;
  color?: THREE.ColorRepresentation;
  faceRefs?: React.MutableRefObject<THREE.Mesh[]>;
  initiallyHidden?: boolean;
}) {
  const solidRef = useRef<THREE.Line>(null);
  const dashedRef = useRef<THREE.Line>(null);
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const dashGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const solidMaterial = useMemo(() => new THREE.LineBasicMaterial({ color, linewidth: 2, depthTest: true }), [color]);
  const dashedMaterial = useMemo(() => new THREE.LineDashedMaterial({ color: 0x94a3b8, dashSize: 0.15, gapSize: 0.1, depthTest: false }), []);
  const solidLine = useMemo(() => new THREE.Line(geometry, solidMaterial), [geometry, solidMaterial]);
  const dashedLine = useMemo(() => {
    const line = new THREE.Line(dashGeometry, dashedMaterial);
    line.computeLineDistances();
    return line;
  }, [dashGeometry, dashedMaterial]);
  const midpoint = useMemo(() => new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5), [points]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useEffect(() => () => {
    geometry.dispose();
    dashGeometry.dispose();
    solidMaterial.dispose();
    dashedMaterial.dispose();
  }, [geometry, dashGeometry, solidMaterial, dashedMaterial]);

  useFrame(({ camera }) => {
    if (!faceRefs || !solidRef.current || !dashedRef.current) return;
    const direction = midpoint.clone().sub(camera.position);
    const distance = direction.length();
    direction.normalize();
    raycaster.set(camera.position, direction);
    raycaster.far = Math.max(0, distance - 0.025);
    const hidden = raycaster.intersectObjects(faceRefs.current, false).length > 0;
    solidRef.current.visible = hidden ? false : !initiallyHidden;
    dashedRef.current.visible = hidden || initiallyHidden;
  });

  return (
    <>
      <primitive object={solidLine} ref={solidRef} renderOrder={2} />
      {faceRefs && <primitive object={dashedLine} ref={dashedRef} renderOrder={3} />}
    </>
  );
}

function SectionOutline({ points }: { points: Vec3[] }) {
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points.map((point) => new THREE.Vector3(...point))), [points]);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: 0xc2410c, linewidth: 2, depthTest: true }), []);
  const loop = useMemo(() => new THREE.LineLoop(geometry, material), [geometry, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <primitive object={loop} renderOrder={4} />;
}

const VisibleOrHiddenEdge = SolidEdge;

function SceneAccessibility({ title }: { title: string }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.domElement.setAttribute("role", "img");
    gl.domElement.setAttribute("aria-label", `Mô hình hình học không gian 3D: ${title}. Kéo để xoay, cuộn hoặc dùng nút để thu phóng.`);
    gl.domElement.style.touchAction = "none";
  }, [gl, title]);
  return null;
}

type CameraView = "isometric" | "top" | "front" | "reset";
type CameraPose = { position: Vec3; target: Vec3 };
type CameraTransition = { startedAt: number; fromPosition: THREE.Vector3; toPosition: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3 };

function getCameraPose(exercise: SpatialExercise, view: CameraView): CameraPose {
  if (view === "isometric") return { position: [6, 5, 7], target: [0, 1.2, 0] };
  if (view === "top") return { position: [0, 10, 0.001], target: [0, 0, 0] };
  if (view === "front") return { position: [0, 1.5, 9], target: [0, 1.2, 0] };
  return { position: exercise.sceneConfig.cameraPosition, target: exercise.sceneConfig.target };
}

function SmoothCameraControls({ position, target }: CameraPose) {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const transitionRef = useRef<CameraTransition | null>(null);
  const poseKeyRef = useRef("");
  const { camera } = useThree();

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const poseKey = `${position.join(",")}|${target.join(",")}`;
    if (poseKeyRef.current !== poseKey) {
      poseKeyRef.current = poseKey;
      transitionRef.current = {
        startedAt: performance.now(),
        fromPosition: camera.position.clone(),
        toPosition: new THREE.Vector3(...position),
        fromTarget: controls.target.clone(),
        toTarget: new THREE.Vector3(...target),
      };
    }
    const transition = transitionRef.current;
    if (!transition || !controls) return;
    const raw = THREE.MathUtils.clamp((performance.now() - transition.startedAt) / 800, 0, 1);
    const eased = raw * raw * (3 - 2 * raw);
    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
    controls.target.lerpVectors(transition.fromTarget, transition.toTarget, eased);
    controls.update();
    if (raw >= 1) transitionRef.current = null;
  });

  return <OrbitControls ref={controlsRef} makeDefault target={target} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={18} maxPolarAngle={Math.PI / 2 + 0.1} />;
}

function getSceneSolid(exercise: SpatialExercise): Solid {
  return buildSolid(exercise.geometry);
}

export function SpatialGeometryPractice({ initialExerciseId, problemPayload = problemData, customAiConfig }: { initialExerciseId?: string; problemPayload?: unknown; customAiConfig?: CustomAiConfig | null }) {
  const [activeProblemPayload, setActiveProblemPayload] = useState<unknown>(problemPayload);
  const [showProblemLoader, setShowProblemLoader] = useState(false);
  const [problemPrompt, setProblemPrompt] = useState("");
  const [problemLoading, setProblemLoading] = useState(false);
  const [problemError, setProblemError] = useState<string | null>(null);
  useEffect(() => { setActiveProblemPayload(problemPayload); }, [problemPayload]);
  const PROBLEM = useMemo(() => parseSpatialGeometryProblem(activeProblemPayload), [activeProblemPayload]);
  const EXERCISES = useMemo(() => createExercises(PROBLEM), [PROBLEM]);
  const firstExerciseId = EXERCISES.some((item) => item.id === initialExerciseId) ? initialExerciseId! : EXERCISES[0].id;
  const [selectedExerciseId, setSelectedExerciseId] = useState(firstExerciseId);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [constructedSection, setConstructedSection] = useState<Vec3[]>([]);
  const [sliderValue, setSliderValue] = useState(EXERCISES.find((item) => item.interactionType === "parameter_slider")?.slider?.defaultValue ?? 0.5);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [cameraView, setCameraView] = useState<CameraView>("isometric");
  const [webglReady, setWebglReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [completed, setCompleted] = useState<string[]>([]);
  const [hintIndex, setHintIndex] = useState(-1);

  useEffect(() => {
    if (!EXERCISES.some((item) => item.id === selectedExerciseId)) setSelectedExerciseId(firstExerciseId);
    setSliderValue(EXERCISES.find((item) => item.interactionType === "parameter_slider")?.slider?.defaultValue ?? 0.5);
  }, [EXERCISES, firstExerciseId, selectedExerciseId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("mathstep_spatial_practice_completed_v1");
      if (saved) setCompleted(JSON.parse(saved));
    } catch {
      setCompleted([]);
    }
  }, []);

  const exercise = EXERCISES.find((item) => item.id === selectedExerciseId) ?? EXERCISES[0];
  const solid = useMemo(() => getSceneSolid(exercise), [exercise]);
  const vertices = useMemo(() => getLabeledVertices(solid), [solid]);
  const availableNodes = useMemo(() => (exercise.interactiveNodes ?? []).flatMap((node) => {
    const position = getNodeCoordinate(node, vertices);
    return position ? [{ ...node, position }] : [];
  }), [exercise, vertices]);
  const nodeById = useMemo(() => new Map(availableNodes.map((node) => [node.id, node])), [availableNodes]);
  const parameterSection = useMemo(() => {
    if (exercise.interactionType !== "parameter_slider") return [];
    return buildParametricCrossSection(solid.apex, solid.base, sliderValue);
  }, [exercise, sliderValue, solid]);

  const section = exercise.interactionType === "construct_section" ? constructedSection : parameterSection;
  const areaRatio = sliderValue * sliderValue;
  const volumeRatio = sliderValue * sliderValue * sliderValue;

  const markCompleted = (id: string) => {
    setCompleted((previous) => {
      const next = previous.includes(id) ? previous : [...previous, id];
      try { localStorage.setItem("mathstep_spatial_practice_completed_v1", JSON.stringify(next)); } catch { /* Local progress is optional. */ }
      return next;
    });
  };

  const handleLoadGeminiProblem = async () => {
    if (!problemPrompt.trim() || problemLoading) return;
    setProblemLoading(true);
    setProblemError(null);
    try {
      const response = await fetch("/api/spatial-geometry/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: problemPrompt.trim(), custom_ai: customAiConfig ?? undefined }),
      });
      const result = await response.json();
      if (!response.ok || !result?.problem) throw new Error(result?.detail?.message || "Chưa thể nạp đề từ Gemini.");
      const parsedProblem = parseSpatialGeometryProblem(result.problem);
      setActiveProblemPayload(parsedProblem);
      setSelectedExerciseId("hhkg_11_goc_sc_mat_phang_day");
      setSelectedNodeIds([]);
      setActiveNodeId(null);
      setConstructedSection([]);
      setFeedback(null);
      setHintIndex(-1);
      setCameraView("reset");
      setZoom(1);
      setShowProblemLoader(false);
    } catch (error) {
      setProblemError(error instanceof Error ? error.message : "Chưa thể nạp đề từ Gemini.");
    } finally {
      setProblemLoading(false);
    }
  };

  const selectExercise = (id: string) => {
    const nextExercise = EXERCISES.find((item) => item.id === id);
    if (!nextExercise) return;
    setSelectedExerciseId(id);
    setSelectedNodeIds([]);
    setActiveNodeId(null);
    setConstructedSection([]);
    setFeedback(null);
    setHintIndex(-1);
    setSliderValue(nextExercise.slider?.defaultValue ?? 0.5);
    setCameraView("reset");
    setZoom(1);
  };

  const handleSelectNode = (id: string) => {
    if (exercise.interactionType === "identify_point") {
      setActiveNodeId(id);
      const correct = id === exercise.correctNodeId;
      setFeedback({ correct, message: correct ? exercise.feedback.correct : exercise.feedback.incorrect });
      if (correct) markCompleted(exercise.id);
      return;
    }
    if (exercise.interactionType !== "construct_section") return;
    setFeedback(null);
    setConstructedSection([]);
    const next = selectedNodeIds.includes(id)
      ? selectedNodeIds.filter((current) => current !== id)
      : selectedNodeIds.length < 3
        ? [...selectedNodeIds, id]
        : [id];
    setSelectedNodeIds(next);
    if (next.length !== 3) return;
    const points = next.map((nodeId) => nodeById.get(nodeId)?.position).filter((point): point is Vec3 => Boolean(point));
    const sectionPoints = getSectionFromPlane(solid, points);
    setConstructedSection(sectionPoints);
    const selectedRequiredNodes = (exercise.requiredNodeIds ?? []).every((nodeId) => next.includes(nodeId));
    const sectionMatchesExpected = !exercise.expectedNodeIds || exercise.expectedNodeIds.every((nodeId) => {
      const expected = nodeById.get(nodeId)?.position;
      return expected && sectionPoints.some((point) => distance(point, expected) < 1e-3);
    });
    if (sectionPoints.length >= 3 && selectedRequiredNodes && sectionMatchesExpected) {
      setFeedback({ correct: true, message: exercise.feedback.correct + " Thiết diện là " + (exercise.expectedPolygonType ?? classifySection(sectionPoints.length)) + "." });
      markCompleted(exercise.id);
    } else {
      setFeedback({ correct: false, message: selectedRequiredNodes ? exercise.feedback.incorrect : "Mặt phẳng cần đi qua M. Hãy chọn M cùng hai điểm khác trong Q, N, P để xác định đúng mặt phẳng song song với đáy." });
    }
  };

  const checkSlider = () => {
    if (!exercise.targetCondition) return;
    const correct = Math.abs(areaRatio - exercise.targetCondition.targetValue) <= exercise.targetCondition.tolerance;
    setFeedback({ correct, message: correct ? exercise.feedback.correct : exercise.feedback.incorrect });
    if (correct) markCompleted(exercise.id);
  };

  const resetView = (view: CameraView = "reset") => {
    setCameraView(view);
    setZoom(1);
  };

  const completedInLevel = (level: 1 | 2 | 3) => EXERCISES.filter((item) => item.level === level && completed.includes(item.id)).length;
  const exercisesByLevel = [1, 2, 3].map((level) => ({ level: level as 1 | 2 | 3, exercises: EXERCISES.filter((item) => item.level === level) }));
  const baseCameraPose = getCameraPose(exercise, cameraView);
  const cameraPosition = baseCameraPose.position.map((value, axis) => baseCameraPose.target[axis] + (value - baseCameraPose.target[axis]) * zoom) as Vec3;
  const cameraPose = { position: cameraPosition, target: baseCameraPose.target };
  const angleSpec = solid.angleMarker;
  const angleVertex = angleSpec ? solid.vertices.get(angleSpec.vertex) : solid.base[0];
  const angleFirst = angleSpec ? solid.vertices.get(angleSpec.firstRay) : solid.apex;
  const angleSecond = angleSpec ? solid.vertices.get(angleSpec.secondRay) : solid.base[1];
  const angleValue = angleVertex && angleFirst && angleSecond ? angleDegrees(angleVertex, angleFirst, angleSecond) : 0;
  const baseLength = solid.vertices.has("A") && solid.vertices.has("B") ? distance(solid.vertices.get("A")!, solid.vertices.get("B")!) : distance(solid.base[0], solid.base[1]);
  const projectionLength = solid.vertices.has("A") && solid.vertices.has("C") ? distance(solid.vertices.get("A")!, solid.vertices.get("C")!) : distance(solid.base[0], solid.base[1]);
  const heightLength = solid.heightLine ? distance(solid.vertices.get(solid.heightLine.start)!, solid.vertices.get(solid.heightLine.end)!) : distance(solid.apex, solid.center);

  return (
    <section className="overflow-hidden rounded-[1.75rem] bg-slate-50 text-slate-900" aria-label="Phòng thực hành hình học không gian 3D">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Chuyên đề 2 · Hình học không gian</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Thực hành với mô hình 3D</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Xoay khối hình, chọn điểm hoặc điều chỉnh tham số. Quan sát giao tuyến và kiểm chứng kết quả bằng công thức.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Tiến độ các cấp độ">
          {exercisesByLevel.map(({ level, exercises }) => (
            <div key={level} className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-sm">
              <span className="font-bold text-slate-900">Cấp {level}</span><span className="mx-1.5 text-slate-300">·</span>
              {completedInLevel(level)}/{exercises.length} xong
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-h-[650px] grid-cols-1 gap-4 px-3 pb-4 sm:px-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.9fr)]">
        <div className="relative min-h-[420px] overflow-hidden rounded-[1.5rem] bg-[#f8fafc] shadow-inner lg:min-h-[650px] max-md:sticky max-md:top-0 max-md:z-20 max-md:h-[45dvh] max-md:min-h-0">
          <Canvas camera={{ position: cameraPosition, fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: false }} onCreated={() => setWebglReady(true)}>
            <FirstThreeFrame onReady={() => setFrameReady(true)} />
            <color attach="background" args={["#f8fafc"]} />
            <SceneAccessibility title={exercise.title} />
            <PyramidModel solid={solid} section={section} nodes={availableNodes} selectedNodeIds={selectedNodeIds} onSelectNode={handleSelectNode} />
            <SmoothCameraControls {...cameraPose} />
          </Canvas>
          <ThreeSceneLoadingOverlay webglReady={webglReady} frameReady={frameReady} />
          <div className="absolute right-3 bottom-3 z-20 flex flex-wrap gap-1.5" aria-label="Góc nhìn nhanh">
            {(["isometric", "top", "front", "reset"] as CameraView[]).map((view) => (
              <button key={view} type="button" onClick={() => resetView(view)} className={`rounded-lg px-2.5 py-2 text-[11px] font-bold shadow-sm transition ${cameraView === view ? "bg-slate-900 text-white" : "bg-white/95 text-slate-700 hover:bg-white"}`}>
                {view === "reset" ? <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" />Đặt lại</span> : view === "isometric" ? "SGK" : view === "top" ? "Trên" : "Trước"}
              </button>
            ))}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-[10px] font-semibold text-slate-600 shadow-sm">
            <span className="h-2 w-5 rounded-full bg-sky-600" /> Cạnh thấy
            <span className="ml-1 h-0 w-5 border-t-2 border-dashed border-slate-500" /> Cạnh khuất
            {section.length >= 3 && <><span className="ml-1 h-2 w-5 rounded-sm bg-orange-500" /> Thiết diện: {classifySection(section.length)}</>}
          </div>
          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button type="button" onClick={() => setZoom((value) => Math.max(0.55, Number((value - 0.12).toFixed(2))))} aria-label="Phóng to mô hình" className="rounded-lg bg-white/95 p-2 text-slate-700 shadow-sm hover:bg-white"><ZoomIn className="h-4 w-4" /></button>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.8, Number((value + 0.12).toFixed(2))))} aria-label="Thu nhỏ mô hình" className="rounded-lg bg-white/95 p-2 text-slate-700 shadow-sm hover:bg-white"><ZoomOut className="h-4 w-4" /></button>
          </div>
        </div>

        <aside className="flex min-h-[520px] flex-col rounded-[1.5rem] bg-white px-4 py-4 shadow-sm sm:px-5" aria-label="Bảng điều khiển bài tập">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Chọn nhiệm vụ</p>
              <h3 className="mt-1 text-lg font-extrabold text-slate-900">Bài tập tương tác</h3>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button type="button" onClick={() => { setShowProblemLoader((value) => !value); setProblemPrompt((value) => value || PROBLEM.problemMetadata.originalText); }} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-violet-50 px-2.5 text-[11px] font-bold text-violet-800 hover:bg-violet-100" aria-expanded={showProblemLoader}>
                <Sparkles className="h-3.5 w-3.5" /> Đề Gemini
              </button>
              <button type="button" onClick={() => setHintIndex((value) => (value + 1) % PROBLEM.pedagogy.socraticHints.length)} className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100" aria-label="Xem gợi ý tiếp theo">
                <CircleHelp className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showProblemLoader && <div className="mb-4 space-y-2 rounded-2xl border border-violet-200 bg-violet-50/70 p-3">
            <label htmlFor="gemini-spatial-problem" className="text-xs font-bold text-violet-950">Tạo mô hình từ đề toán</label>
            <textarea id="gemini-spatial-problem" value={problemPrompt} onChange={(event) => setProblemPrompt(event.target.value)} rows={3} maxLength={8000} placeholder="Dán đề hình học không gian cần phân tích…" className="w-full resize-y rounded-xl border border-violet-200 bg-white p-2.5 text-xs leading-5 text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200" />
            <p className="text-[10px] leading-4 text-violet-900">Gemini sẽ tạo tọa độ, cạnh, mặt và câu hỏi theo schema MathSTEP. Nếu chưa cấu hình khóa Gemini, hãy thêm khóa trong Cài đặt AI.</p>
            {problemError && <p role="alert" className="rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] font-semibold text-rose-800">{problemError}</p>}
            <button type="button" onClick={handleLoadGeminiProblem} disabled={problemLoading || !problemPrompt.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">
              {problemLoading ? <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Đang phân tích và kiểm tra dữ liệu…</> : <><Sparkles className="h-3.5 w-3.5" /> Tạo mô hình 3D</>}
            </button>
          </div>}

          <div className="mb-4 space-y-3">
            {exercisesByLevel.map(({ level, exercises }) => (
              <div key={level}>
                <div className="mb-1.5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Cấp {level} · {level === 1 ? "Nhận diện" : level === 2 ? "Dựng hình" : "Tham số & kiểm chứng"}</span>
                  <span>{completedInLevel(level)}/{exercises.length}</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {exercises.map((item, index) => (
                    <button key={item.id} type="button" onClick={() => selectExercise(item.id)} className={`min-w-10 rounded-lg px-3 py-2 text-xs font-bold transition ${item.id === exercise.id ? "bg-blue-700 text-white" : completed.includes(item.id) ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`} title={item.title} aria-label={`Cấp ${level}, bài ${index + 1}: ${item.title}`}>
                      {completed.includes(item.id) ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">
              <Rotate3D className="h-3.5 w-3.5" /> Cấp {exercise.level}
            </div>
            <h4 className="mt-2 text-base font-extrabold leading-snug text-slate-900">{exercise.title}</h4>
            <div className="mt-2 text-sm leading-6 text-slate-600"><MathFormattedText text={exercise.question} /></div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium text-slate-500" aria-label="Số đo trên hình">
              <span>SA/a = {(heightLength / baseLength).toFixed(2)}</span>
              <span>AC/a = {(projectionLength / baseLength).toFixed(2)}</span>
              <span>∠SCA = {angleValue.toFixed(1)}°</span>
            </div>
            {hintIndex >= 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-950">
                <strong>Gợi ý {hintIndex + 1}/{PROBLEM.pedagogy.socraticHints.length}: </strong>{PROBLEM.pedagogy.socraticHints[hintIndex]}
              </p>
            )}
          </div>

          {exercise.interactionType === "identify_point" && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">Chạm vào một điểm trên mô hình:</p>
              <div className="flex flex-wrap gap-2">
                {availableNodes.map((node) => (
                  <button key={node.id} type="button" onClick={() => handleSelectNode(node.id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${activeNodeId === node.id ? "bg-sky-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{node.label}</button>
                ))}
              </div>
            </div>
          )}

          {exercise.interactionType === "construct_section" && (
            <div className="mt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {availableNodes.map((node) => (
                  <button key={node.id} type="button" onClick={() => handleSelectNode(node.id)} aria-pressed={selectedNodeIds.includes(node.id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${selectedNodeIds.includes(node.id) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>{node.label}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">Đã chọn {selectedNodeIds.length}/3 điểm.</p>
              {constructedSection.length >= 3 && <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-900">Thiết diện có {constructedSection.length} đỉnh · {classifySection(constructedSection.length)}.</p>}
            </div>
          )}

          {exercise.interactionType === "parameter_slider" && exercise.slider && (
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-bold text-slate-700" htmlFor="section-ratio-slider">{exercise.slider.label}<span className="float-right font-mono text-blue-800">k = {sliderValue.toFixed(2)}</span></label>
              <input id="section-ratio-slider" type="range" min={exercise.slider.min} max={exercise.slider.max} step={exercise.slider.step} value={sliderValue} onChange={(event) => { setSliderValue(Number(event.target.value)); setFeedback(null); }} className="w-full accent-blue-700" />
              <div className="space-y-2 rounded-2xl bg-slate-50 px-3 py-3 text-xs">
                <div className="flex items-center justify-between gap-3"><span className="text-slate-600">Diện tích thiết diện / diện tích đáy</span><strong className="font-mono text-slate-900">k² = {areaRatio.toFixed(3)}</strong></div>
                <div className="flex items-center justify-between gap-3"><span className="text-slate-600">Thể tích khối chóp nhỏ / khối chóp ban đầu</span><strong className="font-mono text-slate-900">k³ = {volumeRatio.toFixed(3)}</strong></div>
                {exercise.explanationFormula && <div className="border-t border-slate-200 pt-2 text-center text-blue-900"><MathFormattedText text={`$${exercise.explanationFormula}$`} /></div>}
              </div>
              <button type="button" onClick={checkSlider} className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800">Kiểm tra thiết diện</button>
            </div>
          )}

          {feedback && (
            <div role="status" className={`mt-4 rounded-2xl px-3.5 py-3 text-xs leading-5 ${feedback.correct ? "bg-emerald-50 text-emerald-950" : "bg-amber-50 text-amber-950"}`}>
              <p className="font-extrabold">{feedback.correct ? "Chính xác!" : "Thử suy luận thêm nhé"}</p>
              <p className="mt-1"><MathFormattedText text={feedback.message} /></p>
            </div>
          )}

          <div className="mt-auto pt-5 text-[10px] leading-4 text-slate-400">
            Dùng chuột hoặc chạm để xoay · cuộn hoặc kẹp hai ngón để phóng to · các nhãn và cạnh được cập nhật theo góc nhìn.
          </div>
        </aside>
      </div>
    </section>
  );
}
