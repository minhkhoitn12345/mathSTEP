"use client";

import Link from "next/link";
import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Box, Eye, EyeOff, Search, RotateCcw, Shapes, MousePointer2, PenLine, CircleDot, CornerDownRight, Undo2, Redo2, Download, Copy, Ruler, X, Activity, Sparkles, Trash2, ScanLine, MoveRight, FileJson, FileUp, FileDown } from "lucide-react";
import { useGeometryLibraryStore, type EdgeStyle, type GeometryLibrarySnapshot, type GeometryTool, type LibraryPoint, type Point3 } from "./geometryLibraryStore";

type PolyModel = {
  vertices: { id: string; point: Point3 }[];
  faces: string[][];
  hidden: string[];
  cutFace?: string[];
};
type ModelKind = "cube" | "cuboid" | "pyramid3" | "pyramid4" | "prism3" | "cylinder" | "cone" | "sphere" | "pyramidCut";
type GeometryItem = { id: string; title: string; category: string; grade: string; kind: ModelKind; description: string; concept: string };

const ITEMS: GeometryItem[] = [
  { id: "cube", title: "Hình lập phương", category: "Khối đa diện", grade: "Lớp 11", kind: "cube", description: "Sáu mặt là các hình vuông bằng nhau; các cạnh bên vuông góc với mặt đáy.", concept: "Đường thẳng vuông góc mặt phẳng · đường chéo khối" },
  { id: "cuboid", title: "Hình hộp chữ nhật", category: "Khối đa diện", grade: "Lớp 11", kind: "cuboid", description: "Mô hình hộp chữ nhật với ba kích thước khác nhau và các đường chéo không gian.", concept: "Quan hệ song song · vuông góc · khoảng cách" },
  { id: "pyramid3", title: "Hình chóp tam giác", category: "Hình chóp", grade: "Lớp 11", kind: "pyramid3", description: "Một đỉnh nằm ngoài mặt phẳng đáy tam giác; ba mặt bên là các tam giác.", concept: "Mặt phẳng · giao tuyến · hai đường thẳng chéo nhau" },
  { id: "pyramid4", title: "Hình chóp tứ giác", category: "Hình chóp", grade: "Lớp 11", kind: "pyramid4", description: "Hình chóp S.ABCD, đáy vuông; quan sát cạnh khuất và các mặt bên.", concept: "Hình chóp · đường cao · góc và khoảng cách" },
  { id: "pyramidCut", title: "Thiết diện song song đáy", category: "Thiết diện", grade: "Lớp 11", kind: "pyramidCut", description: "Mặt phẳng song song với đáy cắt các cạnh bên theo cùng một tỉ số.", concept: "Định lí Ta-lét · đồng dạng · tỉ số diện tích và thể tích" },
  { id: "prism3", title: "Lăng trụ tam giác", category: "Khối đa diện", grade: "Lớp 11", kind: "prism3", description: "Hai đáy tam giác song song và bằng nhau; các cạnh bên song song.", concept: "Lăng trụ · mặt phẳng song song · thiết diện" },
  { id: "cylinder", title: "Hình trụ", category: "Khối tròn xoay", grade: "Lớp 12", kind: "cylinder", description: "Hai đáy là hai hình tròn bằng nhau nằm trên hai mặt phẳng song song.", concept: "Khối tròn xoay · thiết diện · diện tích" },
  { id: "cone", title: "Hình nón", category: "Khối tròn xoay", grade: "Lớp 12", kind: "cone", description: "Đáy tròn và đỉnh nón; có thể quan sát đường sinh và trục đối xứng.", concept: "Khối tròn xoay · đường sinh · thiết diện" },
  { id: "sphere", title: "Hình cầu", category: "Khối tròn xoay", grade: "Lớp 12", kind: "sphere", description: "Mô hình mặt cầu để quan sát tâm, bán kính và mặt phẳng cắt.", concept: "Mặt cầu · tâm · bán kính · giao tuyến" },
];

function makeModel(kind: ModelKind): PolyModel {
  if (kind === "cube" || kind === "cuboid") {
    const x = kind === "cube" ? 1.35 : 1.7, z = kind === "cube" ? 1.35 : 1.05, h = kind === "cube" ? 2.7 : 2.15;
    return {
      vertices: [
        { id: "A", point: [-x, 0, -z] }, { id: "B", point: [x, 0, -z] }, { id: "C", point: [x, 0, z] }, { id: "D", point: [-x, 0, z] },
        { id: "A′", point: [-x, h, -z] }, { id: "B′", point: [x, h, -z] }, { id: "C′", point: [x, h, z] }, { id: "D′", point: [-x, h, z] },
      ], faces: [["A", "B", "C", "D"], ["A′", "B′", "C′", "D′"], ["A", "B", "B′", "A′"], ["B", "C", "C′", "B′"], ["C", "D", "D′", "C′"], ["D", "A", "A′", "D′"]], hidden: ["A-B", "A-D", "A-A′"],
    };
  }
  if (kind === "pyramid3" || kind === "pyramid4" || kind === "pyramidCut") {
    const n = kind === "pyramid3" ? 3 : 4;
    const base = Array.from({ length: n }, (_, i) => {
      const angle = Math.PI / 2 + (2 * Math.PI * i) / n;
      return { id: String.fromCharCode(65 + i), point: [1.65 * Math.cos(angle), 0, 1.45 * Math.sin(angle)] as Point3 };
    });
    const apex = { id: "S", point: [0, 2.8, 0] as Point3 };
    const sideFaces = base.map((v, i) => ["S", v.id, base[(i + 1) % n].id]);
    if (kind !== "pyramidCut") return { vertices: [...base, apex], faces: [[...base.map(v => v.id)], ...sideFaces], hidden: n === 3 ? ["A-B"] : ["A-B", "A-D"] };
    const ratio = 0.52;
    const cuts = base.map(v => ({ id: `M${v.id}`, point: [apex.point[0] + ratio * (v.point[0] - apex.point[0]), apex.point[1] + ratio * (v.point[1] - apex.point[1]), apex.point[2] + ratio * (v.point[2] - apex.point[2])] as Point3 }));
    return {
      vertices: [...base, ...cuts],
      faces: [[...base.map(v => v.id)], ...base.map((v, i) => [v.id, base[(i + 1) % n].id, cuts[(i + 1) % n].id, cuts[i].id])],
      hidden: ["A-B", "A-D"],
      cutFace: cuts.map(v => v.id),
    };
  }
  if (kind === "prism3") {
    const lower = ["A", "B", "C"].map((id, i) => {
      const a = Math.PI / 2 + (i * 2 * Math.PI) / 3;
      return { id, point: [1.5 * Math.cos(a), 0, 1.35 * Math.sin(a)] as Point3 };
    });
    const upper = lower.map(v => ({ id: `${v.id}′`, point: [v.point[0], 2.2, v.point[2]] as Point3 }));
    return { vertices: [...lower, ...upper], faces: [["A", "B", "C"], ["A′", "B′", "C′"], ["A", "B", "B′", "A′"], ["B", "C", "C′", "B′"], ["C", "A", "A′", "C′"]], hidden: ["A-B", "A-A′"] };
  }
  return { vertices: [], faces: [], hidden: [] };
}

function ParametricSolid({
  kind, showLabels, showHidden, examMode, points, segments, selectedVertexId, pendingVertexIds,
  edgeStyles, selectedEdgeId, selectedFaceId, vectors, objectVisibility, showPoints, showAuxiliary, lineWidth, labelSize, onFace, onEdge, onVertex,
}: {
  kind: ModelKind; showLabels: boolean; showHidden: boolean; examMode: boolean;
  points: LibraryPoint[]; segments: { id: string; from: string; to: string; dashed?: boolean; rightAngleAt?: Point3 }[];
  selectedVertexId: string | null; pendingVertexIds: string[]; edgeStyles: Record<string, EdgeStyle>;
  vectors: { id: string; from: string; to: string; label: string; color: string }[]; objectVisibility: Record<string, boolean>;
  showPoints: boolean; showAuxiliary: boolean; lineWidth: number; labelSize: number;
  selectedEdgeId: string | null; selectedFaceId: string | null;
  onFace: (id: string, point: Point3) => void; onEdge: (id: string, point: Point3) => void; onVertex: (id: string) => void;
}) {
  const model = useMemo(() => makeModel(kind), [kind]);
  const byId = useMemo(() => new Map(model.vertices.map(v => [v.id, v.point])), [model]);
  const edges = useMemo(() => {
    const set = new Set<string>();
    for (const face of model.faces) for (let i = 0; i < face.length; i++) {
      const a = face[i], b = face[(i + 1) % face.length];
      set.add([a, b].sort().join("-"));
    }
    return [...set];
  }, [model]);
  const edgeFaces = useMemo(() => {
    const index = new Map<string, string[]>();
    const allFaces = [...model.faces, ...(model.cutFace ? [model.cutFace] : [])];
    for (const face of allFaces) for (let i = 0; i < face.length; i++) {
      const key = [face[i], face[(i + 1) % face.length]].sort().join("-");
      index.set(key, [...(index.get(key) ?? []), faceId(face)]);
    }
    return index;
  }, [model]);
  const edgeLineRefs = useRef(new Map<string, THREE.Object3D>());
  const dynamicById = useMemo(() => new Map(points.map(point => [point.id, point.point])), [points]);
  const pointMap = useMemo(() => new Map([...byId, ...dynamicById]), [byId, dynamicById]);
  const { gl, scene } = useThree();
  useEffect(() => {
    const previousBackground = scene.background;
    scene.background = examMode ? new THREE.Color("#ffffff") : null;
    gl.setClearColor(examMode ? "#ffffff" : "#f6faf9", examMode ? 1 : 0);
    return () => { scene.background = previousBackground; };
  }, [examMode, gl, scene]);
  useFrame(({ camera }) => {
    if (!model.vertices.length) return;
    const center = model.vertices.reduce((sum, vertex) => sum.add(new THREE.Vector3(...vertex.point)), new THREE.Vector3()).multiplyScalar(1 / model.vertices.length);
    const cameraLocal = camera.position.clone(); cameraLocal.y += 0.7;
    const visibleFaces = new Set<string>();
    for (const face of [...model.faces, ...(model.cutFace ? [model.cutFace] : [])]) {
      const p0 = byId.get(face[0]), p1 = byId.get(face[1]), p2 = byId.get(face[2]); if (!p0 || !p1 || !p2) continue;
      const a = new THREE.Vector3(...p0), normal = new THREE.Vector3(...p1).sub(a).cross(new THREE.Vector3(...p2).sub(a)).normalize();
      const centroid = face.reduce((sum, id) => sum.add(new THREE.Vector3(...(byId.get(id) ?? [0, 0, 0]))), new THREE.Vector3()).multiplyScalar(1 / face.length);
      if (normal.dot(centroid.clone().sub(center)) < 0) normal.negate();
      if (normal.dot(cameraLocal.clone().sub(centroid)) > 0) visibleFaces.add(faceId(face));
    }
    for (const edge of edges) {
      const style = edgeStyles[edge] ?? "auto";
      const relatedFaces = edgeFaces.get(edge) ?? [];
      const hiddenByView = relatedFaces.length > 0 && relatedFaces.every(id => !visibleFaces.has(id));
      const hidden = style === "dashed" || (style === "auto" && hiddenByView);
      const solid = edgeLineRefs.current.get(`${edge}:solid`);
      const dashed = edgeLineRefs.current.get(`${edge}:dashed`);
      if (solid) solid.visible = !hidden;
      if (dashed) dashed.visible = hidden && showHidden;
    }
  });

  const faceColor = examMode ? "#ffffff" : "#b8e5df";
  const edgeBaseColor = examMode ? "#000000" : "#0f766e";
  const modelVisible = objectVisibility["$model"] !== false;
  const faceMeshes = model.faces.map((face, index) => <FaceSurface
    key={`${face.join("-")}-${index}`} face={face} byId={byId} selected={selectedFaceId === faceId(face)}
    visible={modelVisible && objectVisibility[faceId(face)] !== false} examMode={examMode} onPointerDown={(event) => { event.stopPropagation(); onFace(faceId(face), toLocal(event.point)); }}
  />);
  const curvedSurface = !modelVisible ? null : kind === "cylinder" ? <mesh position={[0, 1.15, 0]} onPointerDown={(event) => { event.stopPropagation(); onFace("Mặt xung quanh", toLocal(event.point)); }}><cylinderGeometry args={[1.35, 1.35, 2.3, 48, 1, false]} /><meshStandardMaterial color={faceColor} transparent={!examMode} opacity={examMode ? 1 : 0.2} side={THREE.DoubleSide} depthWrite={examMode} /></mesh>
    : kind === "cone" ? <mesh position={[0, 1.2, 0]} onPointerDown={(event) => { event.stopPropagation(); onFace("Mặt xung quanh", toLocal(event.point)); }}><coneGeometry args={[1.5, 2.4, 48, 1, false]} /><meshStandardMaterial color={faceColor} transparent={!examMode} opacity={examMode ? 1 : 0.2} side={THREE.DoubleSide} depthWrite={examMode} /></mesh>
    : kind === "sphere" ? <mesh position={[0, 1.4, 0]} onPointerDown={(event) => { event.stopPropagation(); onFace("Mặt cầu", toLocal(event.point)); }}><sphereGeometry args={[1.5, 40, 28]} /><meshStandardMaterial color={faceColor} transparent={!examMode} opacity={examMode ? 1 : 0.25} roughness={0.55} /></mesh>
    : null;

  const roundEdges = !modelVisible ? null : kind === "cylinder" || kind === "cone" ? [
    <mesh key="base" position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, 0.012, 8, 64]} /><meshBasicMaterial color="#0f766e" /></mesh>,
    <mesh key="top" position={[0, 2.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>{kind === "cylinder" ? <torusGeometry args={[1.35, 0.012, 8, 64]} /> : null}<meshBasicMaterial color="#0f766e" /></mesh>,
  ] : kind === "sphere" ? null : edges.map(edge => {
    if (!modelVisible) return null;
    const [a, b] = edge.split("-"); const p = byId.get(a), q = byId.get(b); if (!p || !q) return null;
    const style = edgeStyles[edge] ?? "auto";
    const hidden = style === "dashed" || (style === "auto" && model.hidden.includes(edge));
    if (hidden && !showHidden) return null;
    const active = selectedEdgeId === edge;
    const lineColor = examMode ? "#000000" : active ? "#f97316" : hidden ? "#64748b" : edgeBaseColor;
    const handlePick = (event: ThreeEvent<PointerEvent>) => { event.stopPropagation(); onEdge(edge, toLocal(event.point)); };
    const initialHidden = style === "dashed" || (style === "auto" && model.hidden.includes(edge));
    if (objectVisibility[edge] === false) return null;
    return <group key={edge}>
      <Line ref={object => { if (object) edgeLineRefs.current.set(`${edge}:solid`, object); else edgeLineRefs.current.delete(`${edge}:solid`); }} points={[p, q]} visible={!initialHidden} color={lineColor} lineWidth={active ? lineWidth + 1.5 : lineWidth} depthTest={!examMode} renderOrder={3} onPointerDown={handlePick}/>
      <Line ref={object => { if (object) edgeLineRefs.current.set(`${edge}:dashed`, object); else edgeLineRefs.current.delete(`${edge}:dashed`); }} points={[p, q]} visible={initialHidden && showHidden} color={examMode ? "#000000" : active ? "#f97316" : "#64748b"} lineWidth={active ? lineWidth + 1.5 : Math.max(1, lineWidth - 0.6)} dashed dashSize={0.1} gapSize={0.07} transparent opacity={0.82} depthTest={false} renderOrder={2} onPointerDown={handlePick}/>
    </group>;
  });

  return <group position={[0, -0.7, 0]}>
    {curvedSurface}{faceMeshes}{roundEdges}
    {model.cutFace?.length ? <CutFace ids={model.cutFace} byId={byId} examMode={examMode} visible={modelVisible && objectVisibility[faceId(model.cutFace)] !== false} selected={selectedFaceId === faceId(model.cutFace)} onPointerDown={event => { event.stopPropagation(); onFace(faceId(model.cutFace!), toLocal(event.point)); }} /> : null}
    {!examMode && <><gridHelper args={[7, 14, "#b9d8d3", "#e5efed"]} position={[0, -0.68, 0]} /><axesHelper args={[2.3]} /></>}
    {model.vertices.map(v => !modelVisible || objectVisibility[v.id] === false ? null : <group key={`node-${v.id}`}>
      <mesh position={v.point} onPointerDown={(event) => { event.stopPropagation(); onVertex(v.id); }}>
        <sphereGeometry args={[selectedVertexId === v.id || pendingVertexIds.includes(v.id) ? 0.095 : 0.06, 16, 12]} />
        <meshBasicMaterial color={examMode ? "#000000" : pendingVertexIds.includes(v.id) ? "#f97316" : "#0f766e"} transparent opacity={showPoints ? 1 : 0} depthWrite={showPoints} />
      </mesh>
      {showLabels && <Html position={v.point} center distanceFactor={10} style={{ pointerEvents: "none", fontSize: `${labelSize}px` }}><span className={`rounded px-1.5 py-0.5 text-[11px] font-bold shadow-sm ${examMode ? "bg-white text-black" : "bg-white/95 text-slate-700 ring-1 ring-slate-200"}`}>{v.id}</span></Html>}
    </group>)}
    {points.map(point => objectVisibility[point.id] === false ? null : <group key={point.id}>
      <mesh position={point.point} onPointerDown={(event) => { event.stopPropagation(); onVertex(point.id); }}><sphereGeometry args={[0.065, 14, 10]} /><meshBasicMaterial color={examMode ? "#000000" : "#f97316"} transparent opacity={showPoints ? 1 : 0} depthWrite={showPoints} /></mesh>
      {showLabels && <Html position={point.point} center distanceFactor={10} style={{ pointerEvents: "none", fontSize: `${labelSize}px` }}><span className={`rounded px-1.5 py-0.5 font-bold shadow-sm ${examMode ? "bg-white text-black" : "bg-amber-50 text-amber-900 ring-1 ring-amber-300"}`}>{point.label}</span></Html>}
    </group>)}
    {showAuxiliary && segments.map(segment => {
      if (objectVisibility[segment.id] === false) return null;
      const a = pointMap.get(segment.from), b = pointMap.get(segment.to); if (!a || !b) return null;
      return <group key={segment.id}><Line points={[a, b]} color={examMode ? "#000000" : "#7c3aed"} lineWidth={lineWidth} dashed={segment.dashed} dashSize={0.1} gapSize={0.08} renderOrder={5} />{segment.rightAngleAt && <RightAngleMark foot={segment.rightAngleAt} altitude={a} face={model.faces[0]?.map(id => byId.get(id)!).filter(Boolean) ?? []} color={examMode ? "#000000" : "#c2410c"} />}</group>;
    })}
    {showAuxiliary && vectors.map(vector => {
      if (objectVisibility[vector.id] === false) return null;
      const a = pointMap.get(vector.from), b = pointMap.get(vector.to); if (!a || !b) return null;
      return <group key={vector.id}><Line points={[a, b]} color={examMode ? "#000000" : vector.color} lineWidth={lineWidth + 0.5} renderOrder={6}/><mesh position={b} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize())}><coneGeometry args={[0.07, 0.18, 12]}/><meshBasicMaterial color={examMode ? "#000000" : vector.color}/></mesh><Html position={b} center distanceFactor={10} style={{ pointerEvents: "none", fontSize: `${labelSize}px` }}><span className="rounded bg-violet-50 px-1 text-xs font-bold text-violet-800">{vector.from}{vector.to}</span></Html></group>;
    })}
    {!examMode && showLabels && model.vertices.map(v => <Html key={`position-${v.id}`} position={v.point} center distanceFactor={10} style={{ pointerEvents: "none" }}><span className="sr-only">{v.id}</span></Html>)}
  </group>;
}

function toLocal(point: THREE.Vector3): Point3 { return [point.x, point.y + 0.7, point.z]; }
function faceId(face: string[]) { return `(${face.join(" ")})`; }
function escapeXml(value: string) { return value.replace(/[<>&"']/g, character => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;" })[character] ?? character); }

function FaceSurface({ face, byId, selected, visible, examMode, onPointerDown }: { face: string[]; byId: Map<string, Point3>; selected: boolean; visible: boolean; examMode: boolean; onPointerDown: (event: ThreeEvent<PointerEvent>) => void }) {
  const geometry = useMemo(() => polygonGeometry(face, byId), [byId, face]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} visible={visible} onPointerDown={onPointerDown} renderOrder={0}>
    <meshBasicMaterial color={examMode ? "#ffffff" : selected ? "#fed7aa" : "#b8e5df"} transparent={!examMode} opacity={examMode ? 1 : selected ? 0.38 : 0.2} side={THREE.DoubleSide} depthWrite={examMode} />
  </mesh>;
}

function polygonGeometry(ids: string[], byId: Map<string, Point3>) {
  const positions: number[] = [];
  for (let i = 1; i < ids.length - 1; i++) for (const id of [ids[0], ids[i], ids[i + 1]]) positions.push(...(byId.get(id) ?? [0, 0, 0]));
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3)); geometry.computeVertexNormals(); return geometry;
}

function RightAngleMark({ foot, altitude, face, color }: { foot: Point3; altitude: Point3; face: Point3[]; color: string }) {
  const points = useMemo(() => {
    if (face.length < 2) return [];
    const u = new THREE.Vector3(...face[1]).sub(new THREE.Vector3(...face[0])).normalize();
    const v = new THREE.Vector3(...altitude).sub(new THREE.Vector3(...foot)).normalize();
    const f = new THREE.Vector3(...foot), a = f.clone().addScaledVector(v, 0.22), b = a.clone().addScaledVector(u, 0.22), c = f.clone().addScaledVector(u, 0.22);
    return [f.toArray() as Point3, a.toArray() as Point3, b.toArray() as Point3, c.toArray() as Point3];
  }, [altitude, face, foot]);
  return points.length ? <Line points={points} color={color} lineWidth={2.3} renderOrder={6} /> : null;
}

function CutFace({ ids, byId, examMode, visible, selected, onPointerDown }: { ids: string[]; byId: Map<string, Point3>; examMode: boolean; visible: boolean; selected: boolean; onPointerDown: (event: ThreeEvent<PointerEvent>) => void }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 1; i < ids.length - 1; i++) for (const id of [ids[0], ids[i], ids[i + 1]]) pts.push(...(byId.get(id) ?? [0, 0, 0]));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.computeVertexNormals(); return g;
  }, [byId, ids]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <><mesh geometry={geometry} visible={visible} onPointerDown={onPointerDown} renderOrder={4}><meshBasicMaterial color={examMode ? "#ffffff" : selected ? "#fdba74" : "#f97316"} side={THREE.DoubleSide} transparent={!examMode} opacity={examMode ? 1 : selected ? 0.65 : 0.48} depthWrite={examMode} /></mesh><Line visible={visible} points={[...ids.map(id => byId.get(id)!).filter(Boolean), byId.get(ids[0])!]} color={examMode ? "#000000" : "#c2410c"} lineWidth={3} renderOrder={5} /></>;
}

export function GeometryLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState(ITEMS[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showAuxiliary, setShowAuxiliary] = useState(true);
  const [showHidden, setShowHidden] = useState(true);
  const [lineWidth, setLineWidth] = useState(2.4);
  const [labelSize, setLabelSize] = useState(12);
  const [examMode, setExamMode] = useState(false);
  const [cameraReset, setCameraReset] = useState(0);
  const [ratio, setRatio] = useState(0.5);
  const [hint, setHint] = useState("");
  const [pendingTranslationIds, setPendingTranslationIds] = useState<string[]>([]);
  const [face2dOpen, setFace2dOpen] = useState(false);
  const [exportWidth, setExportWidth] = useState<1600 | 2400 | 3200 | 4000>(2400);
  const [exportDpr, setExportDpr] = useState<number | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [exportNotice, setExportNotice] = useState("");
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawing = useGeometryLibraryStore();
  const categories = ["Tất cả", ...new Set(ITEMS.map(item => item.category))];
  const filtered = ITEMS.filter(item => (category === "Tất cả" || item.category === category) && `${item.title} ${item.concept} ${item.grade}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
  const selected = ITEMS.find(item => item.id === selectedId) ?? ITEMS[0];
  const selectedEdgeId = drawing.selectedEdgeId;
  const model = useMemo(() => makeModel(selected.kind), [selected.kind]);
  const selectedFace = model.faces.find(face => faceId(face) === drawing.selectedFaceId) ?? (model.cutFace && faceId(model.cutFace) === drawing.selectedFaceId ? model.cutFace : undefined);
  const selectedFaceData = selectedFace ? { id: faceId(selectedFace), vertices: selectedFace.map(id => ({ id, point: model.vertices.find(vertex => vertex.id === id)?.point })).filter((item): item is { id: string; point: Point3 } => Boolean(item.point)) } : null;

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("mathstep-geometry-library-favorites") || "[]"); if (Array.isArray(saved)) setFavorites(saved.filter((id): id is string => typeof id === "string" && ITEMS.some(item => item.id === id))); } catch { /* Browser storage is optional. */ }
  }, []);
  useEffect(() => { const store = useGeometryLibraryStore.getState(); store.clear(); store.addLog("system", `Đã mở mô hình ${selected.title}.`); }, [selected.id, selected.title]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); drawing.undo(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); drawing.redo(); }
      if (event.key === "Escape") { setFace2dOpen(false); drawing.setTool("select"); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawing]);
  const toggleFavorite = (id: string) => setFavorites(current => {
    const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
    localStorage.setItem("mathstep-geometry-library-favorites", JSON.stringify(next)); return next;
  });
  const nextLabel = () => {
    const names = ["M", "N", "P", "Q", "H", "K", "L", "R", "T"];
    return names.find(name => !model.vertices.some(vertex => vertex.id === name) && !drawing.points.some(point => point.label.replace(/[′']/g, "") === name)) ?? `P${drawing.points.length + 1}`;
  };
  const createPoint = (point: Point3, source: LibraryPoint["source"], faceIdValue?: string, edgeId?: string, t?: number) => {
    const label = nextLabel();
    drawing.addPoint({ id: `aux-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label, point, source, faceId: faceIdValue, edgeId, t }, `Đặt điểm ${label}${edgeId ? ` trên cạnh ${edgeId.replace("-", "")}` : faceIdValue ? ` trên mặt ${faceIdValue}` : ""}. Em hãy kiểm tra điểm có thỏa dữ kiện của bài toán không.`);
  };
  const edgeEndpoints = (edgeId: string) => {
    const [a, b] = edgeId.split("-"); return [model.vertices.find(vertex => vertex.id === a)?.point, model.vertices.find(vertex => vertex.id === b)?.point] as const;
  };
  const handleEdge = (edgeId: string, _hit: Point3) => {
    if (drawing.tool === "edge-point") {
      const [a, b] = edgeEndpoints(edgeId); if (!a || !b) return;
      const t = THREE.MathUtils.clamp(ratio, 0.01, 0.99);
      const point: Point3 = [0, 1, 2].map(axis => a[axis] + (b[axis] - a[axis]) * t) as Point3;
      createPoint(point, "edge", undefined, edgeId, t);
      return;
    }
    drawing.selectEdge(edgeId);
    drawing.addLog("edge", `Đã chọn cạnh ${edgeId.replace("-", "")}. Chọn cách thể hiện cạnh ở bảng thuộc tính.`);
  };
  const handleFace = (faceIdValue: string, point: Point3) => {
    if (drawing.tool === "face-point") { createPoint(point, "face", faceIdValue); return; }
    if (drawing.tool === "perpendicular" && drawing.selectedVertexId) {
      const face = model.faces.find(value => faceId(value) === faceIdValue) ?? (model.cutFace && faceId(model.cutFace) === faceIdValue ? model.cutFace : undefined);
      const facePoints = face?.map(id => model.vertices.find(vertex => vertex.id === id)?.point).filter((value): value is Point3 => Boolean(value)) ?? [];
      const source = model.vertices.find(vertex => vertex.id === drawing.selectedVertexId)?.point ?? drawing.points.find(value => value.id === drawing.selectedVertexId)?.point;
      if (!source || facePoints.length < 3) return;
      const plane = new THREE.Plane().setFromCoplanarPoints(new THREE.Vector3(...facePoints[0]), new THREE.Vector3(...facePoints[1]), new THREE.Vector3(...facePoints[2]));
      const foot = plane.projectPoint(new THREE.Vector3(...source), new THREE.Vector3()).toArray() as Point3;
      const label = nextLabel();
      drawing.addPerpendicular({ id: `aux-${Date.now()}`, label, point: foot, source: "foot", faceId: faceIdValue }, drawing.selectedVertexId, `Đã hạ ${drawing.selectedVertexId}${label} vuông góc với mặt ${faceIdValue}. Hãy kiểm tra hình chiếu có nằm trong mặt phẳng đáy theo giả thiết không.`);
      drawing.setTool("select");
      return;
    }
    drawing.selectFace(faceIdValue);
    if (drawing.tool === "select") drawing.addLog("system", `Đã chọn mặt ${faceIdValue}. Có thể mở công cụ xem mặt phẳng 2D.`);
  };
  const handleVertex = (id: string) => {
    if (drawing.tool === "segment") { drawing.toggleSegmentVertex(id); return; }
    if (drawing.tool === "vector") { drawing.toggleVectorVertex(id); return; }
    if (drawing.tool === "translation") {
      const ids = [...pendingTranslationIds, id];
      if (ids.length < 3) { setPendingTranslationIds(ids); return; }
      const coordinate = (pointId: string) => model.vertices.find(vertex => vertex.id === pointId)?.point ?? drawing.points.find(point => point.id === pointId)?.point;
      const [sourceId, vectorStartId, vectorEndId] = ids;
      const source = coordinate(sourceId), vectorStart = coordinate(vectorStartId), vectorEnd = coordinate(vectorEndId);
      setPendingTranslationIds([]);
      if (!source || !vectorStart || !vectorEnd) return;
      const translated: Point3 = [0, 1, 2].map(axis => source[axis] + vectorEnd[axis] - vectorStart[axis]) as Point3;
      const label = `${nextLabel()}′`, pointId = `aux-${Date.now()}`;
      drawing.addPoint({ id: pointId, label, point: translated, source: "translation", dependsOn: ids }, `Tịnh tiến điểm ${sourceId} theo véc-tơ ${vectorStartId}${vectorEndId}; điểm ảnh có liên kết tới ba điểm gốc.`);
      drawing.setTool("select"); return;
    }
    drawing.selectVertex(id);
  };
  const hintForLatest = () => {
    const latest = drawing.logs.at(-1);
    if (!latest) { setHint("Trước tiên hãy chọn một hình mẫu hoặc thực hiện một phép dựng. Sau đó TES sẽ đặt câu hỏi dựa trên thao tác vừa làm."); return; }
    if (latest.kind === "segment") setHint("Em hãy chỉ ra hai điểm đầu mút đang thuộc những mặt phẳng nào. Có thể tìm một mặt phẳng chứa cả đoạn vừa dựng và đối tượng em muốn xét không?");
    else if (latest.kind === "foot") setHint("Hình chiếu vuông góc cần thỏa hai điều kiện nào: điểm chân nằm trên mặt phẳng và đoạn nối có quan hệ gì với mặt phẳng ấy?");
    else if (latest.kind === "point") setHint("Điểm vừa đặt có thuộc đúng cạnh hoặc mặt theo giả thiết không? Nếu điểm nằm trên cạnh, tỉ số chia được tính theo thứ tự đầu mút nào?");
    else if (latest.kind === "edge") setHint("Nét liền hay nét đứt phụ thuộc vào góc nhìn và phần bị che khuất. Em thử xoay hình để kiểm tra cạnh này trước khi cố định kiểu nét.");
    else setHint("Em hãy nêu giả thiết đã dùng cho phép dựng gần nhất. Quan hệ đó được bảo đảm bởi định nghĩa, định lí hay chỉ do hình vẽ trông có vẻ đúng?");
  };
  const captureImage = async (copyToClipboard: boolean) => {
    if (!canvasElement || exportBusy) return;
    setExportBusy(true); setExportNotice("");
    const dpr = Math.min(8, Math.max(1, exportWidth / Math.max(320, canvasElement.clientWidth)));
    setExportDpr(dpr);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const blob = await new Promise<Blob | null>(resolve => canvasElement.toBlob(resolve, "image/png"));
    setExportDpr(null);
    if (!blob) { setExportNotice("Chưa tạo được ảnh. Hãy thử lại sau khi mô hình tải xong."); setExportBusy(false); return; }
    try {
      if (copyToClipboard) {
        if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") throw new Error("Trình duyệt chưa hỗ trợ sao chép ảnh. Hãy tải PNG rồi chèn vào Word.");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setExportNotice("Đã sao chép ảnh PNG. Em có thể dán trực tiếp vào Word.");
      } else {
        const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${selected.id}-${exportWidth}px.png`; anchor.click(); URL.revokeObjectURL(url);
        setExportNotice(`Đã xuất PNG ${canvasElement.width} × ${canvasElement.height}px.`);
      }
    } catch (error) { setExportNotice(error instanceof Error ? error.message : "Không thể xuất ảnh."); }
    setExportBusy(false);
  };
  const downloadText = (name: string, content: string, type = "application/json") => {
    const url = URL.createObjectURL(new Blob([content], { type })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const saveScene = () => {
    const payload = { schemaVersion: 1, modelId: selected.id, modelTitle: selected.title, scene: { points: drawing.points, segments: drawing.segments, vectors: drawing.vectors, edgeStyles: drawing.edgeStyles, objectVisibility: drawing.objectVisibility } };
    downloadText(`${selected.id}-mathstep.json`, JSON.stringify(payload, null, 2));
  };
  const openScene = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { schemaVersion?: number; scene?: Partial<GeometryLibrarySnapshot> };
      const scene = data.scene;
      if (data.schemaVersion !== 1 || !scene || !Array.isArray(scene.points) || !Array.isArray(scene.segments) || !Array.isArray(scene.vectors) || !scene.edgeStyles || !scene.objectVisibility) throw new Error("Tệp không đúng định dạng bản vẽ MathSTEP.");
      const validPointIds = new Set(scene.points.map(point => point.id));
      if (scene.points.some(point => typeof point.id !== "string" || typeof point.label !== "string" || !Array.isArray(point.point) || point.point.length !== 3 || point.point.some(value => !Number.isFinite(value)))) throw new Error("Tệp có điểm tọa độ không hợp lệ.");
      if (scene.segments.some(segment => !validPointIds.has(segment.from) && !model.vertices.some(vertex => vertex.id === segment.from) || !validPointIds.has(segment.to) && !model.vertices.some(vertex => vertex.id === segment.to))) throw new Error("Tệp có đoạn nối tới điểm không tồn tại trong mô hình đang chọn.");
      drawing.replaceScene(scene as GeometryLibrarySnapshot); setExportNotice("Đã mở tệp bản vẽ và khôi phục các phép dựng.");
    } catch (error) { setExportNotice(error instanceof Error ? error.message : "Không đọc được tệp bản vẽ."); }
  };
  const exportAiSpec = () => {
    const spec = { application: "MathSTEP · Thư viện Hình học", model: { id: selected.id, title: selected.title, type: selected.kind, vertices: model.vertices.map(vertex => ({ id: vertex.id, coordinates: vertex.point })), faces: model.faces, edges: model.faces.flatMap(face => face.map((id, i) => [id, face[(i + 1) % face.length]] as const)).filter((edge, i, all) => all.findIndex(other => other.slice().sort().join("-") === edge.slice().sort().join("-")) === i), hiddenEdgesForDefaultView: model.hidden }, constructions: { points: drawing.points, segments: drawing.segments, vectors: drawing.vectors, edgeStyles: drawing.edgeStyles }, instructions: "Giải bài theo tọa độ 3D. Phân biệt dữ kiện và hình minh họa; nêu từng bước lập luận và không suy ra vuông góc/chia đôi chỉ từ hình vẽ." };
    downloadText(`${selected.id}-ai-spec.json`, JSON.stringify(spec, null, 2));
  };
  const exportSvg = () => {
    const allPoints = [...model.vertices.map(vertex => ({ id: vertex.id, point: vertex.point })), ...drawing.points.map(point => ({ id: point.label, point: point.point }))];
    if (!allPoints.length) {
      const shape = selected.kind === "sphere" ? `<circle cx="600" cy="400" r="190"/>` : selected.kind === "cone" ? `<path d="M600 160 L360 620 Q600 720 840 620 Z M360 620 A240 70 0 0 0 840 620"/>` : `<path d="M360 230 L840 230 L840 590 Q600 700 360 590 Z M360 230 A240 70 0 0 1 840 230 M360 590 A240 70 0 0 0 840 590 M360 230 L360 590 M840 230 L840 590"/>`;
      downloadText(`${selected.id}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#111" stroke-width="3">${shape}</g><text x="600" y="100" text-anchor="middle" font-family="Arial,sans-serif" font-size="28">${escapeXml(selected.title)}</text></svg>`, "image/svg+xml");
      return;
    }
    const project = (point: Point3) => ({ x: point[0] - point[2] * 0.55, y: -point[1] + point[2] * 0.28 });
    const projected = allPoints.map(item => ({ ...item, p: project(item.point) }));
    const minX = Math.min(...projected.map(item => item.p.x)), maxX = Math.max(...projected.map(item => item.p.x)), minY = Math.min(...projected.map(item => item.p.y)), maxY = Math.max(...projected.map(item => item.p.y));
    const w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY), margin = 48, scale = Math.min((1200 - margin * 2) / w, (800 - margin * 2) / h), byId = new Map(allPoints.map(item => [item.id, item.point]));
    const xy = (point: Point3) => { const p = project(point); return `${((1200 - w * scale) / 2 + (p.x - minX) * scale).toFixed(2)},${((800 - h * scale) / 2 + (p.y - minY) * scale).toFixed(2)}`; };
    const edgePairs = [...new Set([...model.faces, ...(model.cutFace ? [model.cutFace] : [])].flatMap(face => face.map((id, i) => [id, face[(i + 1) % face.length]].sort().join("-"))))];
    const edgesSvg = edgePairs.map(edge => { const [a, b] = edge.split("-"); const p = xy(byId.get(a)!).split(","), q = xy(byId.get(b)!).split(","); const hidden = (drawing.edgeStyles[edge] ?? "auto") === "dashed" || (drawing.edgeStyles[edge] ?? "auto") === "auto" && model.hidden.includes(edge); return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" ${hidden ? 'stroke-dasharray="8 6"' : ""}/>`; }).join("");
    const constructionSvg = drawing.segments.filter(segment => drawing.objectVisibility[segment.id] !== false).map(segment => { const a = byId.get(segment.from) ?? drawing.points.find(point => point.id === segment.from)?.point, b = byId.get(segment.to) ?? drawing.points.find(point => point.id === segment.to)?.point; if (!a || !b) return ""; const p = xy(a).split(","), q = xy(b).split(","); return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#7c3aed"/>`; }).join("");
    const labels = projected.filter(item => drawing.objectVisibility[item.id] !== false && (showPoints || showLabels)).map(item => { const p = xy(item.point).split(","); return `${showPoints ? `<circle cx="${p[0]}" cy="${p[1]}" r="4"/>` : ""}${showLabels ? `<text x="${Number(p[0]) + 7}" y="${Number(p[1]) - 7}">${escapeXml(item.id)}</text>` : ""}`; }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="100%" height="100%" fill="white"/><g fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round">${edgesSvg}</g><g fill="none" stroke="#7c3aed" stroke-width="2.5">${constructionSvg}</g><g font-family="Arial,sans-serif" font-size="18" fill="#111" stroke="none">${labels}</g></svg>`;
    downloadText(`${selected.id}.svg`, svg, "image/svg+xml");
  };
  const toolButton = (tool: GeometryTool, icon: React.ReactNode, label: string) => <button key={tool} type="button" onClick={() => { drawing.setTool(tool); setPendingTranslationIds([]); }} aria-pressed={drawing.tool === tool} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold transition ${drawing.tool === tool ? "bg-teal-700 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>{icon}{label}</button>;

  return <main className={`min-h-screen text-slate-900 ${examMode ? "bg-white" : "bg-[#f5f8f7]"}`}>
    <header className={`border-b ${examMode ? "border-black bg-white" : "border-slate-200/80 bg-white"}`}><div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-7"><div className="flex items-center gap-3"><Link href="/" aria-label="Về trang chủ MathSTEP" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white"><Shapes size={20} /></Link><div><p className="text-xs font-bold uppercase tracking-[.17em] text-teal-700">MathSTEP · Chuyên đề 2</p><h1 className="text-lg font-bold leading-tight sm:text-xl">Không gian dựng hình</h1></div></div><Link href="/learn/spatial_geometry/sg-lesson-1" className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-flex"><BookOpen size={16} /> Vào bài học</Link></div></header>
    <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Dựng điểm, đoạn và hình chiếu trên mô hình; xoay để kiểm tra quan hệ trong không gian.</p><div className="flex items-center gap-2"><label className="sr-only" htmlFor="library-search">Tìm hình mẫu</label><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input id="library-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm hình mẫu…" className="h-10 w-44 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-600 sm:w-60"/></div><Link href="/learn/spatial_geometry/sg-lesson-1" className="rounded-xl bg-slate-900 px-3 py-2.5 text-xs font-bold text-white sm:hidden">Bài học</Link></div></div>
      <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_280px]">
        <aside className="order-2 flex max-h-[640px] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-1"><div className="border-b border-slate-100 p-3"><div className="flex gap-1.5 overflow-x-auto">{categories.map(value => <button key={value} type="button" onClick={() => setCategory(value)} className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${category === value ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}>{value}</button>)}</div></div><div className="flex-1 space-y-1 overflow-y-auto p-2">{filtered.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition ${selectedId === item.id ? "bg-teal-50 ring-1 ring-teal-200" : "hover:bg-slate-50"}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${selectedId === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}><Box size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{item.title}</span><span className="block text-[11px] text-slate-500">{item.category} · {item.grade}</span></span><span onClick={event => { event.stopPropagation(); toggleFavorite(item.id); }} role="button" tabIndex={0} aria-label="Lưu hình yêu thích" className={favorites.includes(item.id) ? "text-amber-500" : "text-slate-300"}>★</span></button>)}</div><div className="border-t border-slate-100 p-3 text-[11px] text-slate-500">{ITEMS.length} mô hình · hình yêu thích lưu trên thiết bị</div></aside>

        <section className="order-1 min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 sm:px-4"><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-teal-700">{selected.category} · {selected.grade}</span><h2 className="text-lg font-bold">{selected.title}</h2></div><div className="flex flex-wrap items-center gap-1.5"><button type="button" onClick={() => setExamMode(value => !value)} aria-pressed={examMode} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${examMode ? "bg-black text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>Nét đen đề thi</button><button type="button" onClick={() => setShowLabels(value => !value)} aria-pressed={showLabels} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50">{showLabels ? "Ẩn nhãn" : "Hiện nhãn"}</button><button type="button" onClick={() => setShowHidden(value => !value)} aria-pressed={showHidden} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50">{showHidden ? "Ẩn nét khuất" : "Nét khuất"}</button><button type="button" onClick={() => setCameraReset(value => value + 1)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Đặt lại góc nhìn"><RotateCcw size={16}/></button></div></div>
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2.5 sm:px-4">
            {toolButton("select", <MousePointer2 size={15}/>, "Chọn")}{toolButton("edge-point", <CircleDot size={15}/>, "Điểm trên cạnh")}{toolButton("face-point", <PenLine size={15}/>, "Điểm trên mặt")}{toolButton("segment", <ScanLine size={15}/>, "Nối hai điểm")}{toolButton("vector", <MoveRight size={15}/>, "Véc-tơ")}{toolButton("translation", <MoveRight size={15}/>, "Tịnh tiến")}{toolButton("perpendicular", <CornerDownRight size={15}/>, "Hạ vuông góc")}
            {drawing.tool === "edge-point" && <label className="ml-auto flex min-w-[180px] items-center gap-2 text-xs font-semibold text-slate-600">Tỉ số <input aria-label="Tỉ số điểm trên cạnh" type="range" min="0.05" max="0.95" step="0.01" value={ratio} onChange={event => setRatio(Number(event.target.value))} className="w-24 accent-teal-700"/><span className="tabular-nums">{ratio.toFixed(2)}</span></label>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-100 px-3 py-2.5 text-xs text-slate-600 sm:px-4">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={showPoints} onChange={event => setShowPoints(event.target.checked)} className="accent-teal-700"/> Chấm điểm</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={showLabels} onChange={event => setShowLabels(event.target.checked)} className="accent-teal-700"/> Tên điểm</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={showAuxiliary} onChange={event => setShowAuxiliary(event.target.checked)} className="accent-teal-700"/> Phép dựng phụ</label>
            <label className="flex items-center gap-2">Độ dày <select value={lineWidth} onChange={event => setLineWidth(Number(event.target.value))} className="h-8 rounded-lg border border-slate-200 bg-white px-1.5"><option value="1.2">Mảnh · 1,2</option><option value="1.8">Vừa · 1,8</option><option value="2.2">Rõ · 2,2</option><option value="2.8">Đậm · 2,8</option></select></label>
            <label className="flex items-center gap-2">Cỡ nhãn <input type="range" min="10" max="20" step="1" value={labelSize} onChange={event => setLabelSize(Number(event.target.value))} className="w-20 accent-teal-700"/><span className="w-6 tabular-nums">{labelSize}</span></label>
          </div>
          <div className={`relative h-[min(62vh,640px)] min-h-[380px] touch-none ${examMode ? "bg-white" : "bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f2f8f7_72%,#edf4f3_100%)]"}`}><Canvas key={`${selected.id}-${cameraReset}`} camera={{ position: [5, 4.1, 6], fov: 42 }} dpr={exportDpr ?? [1, 1.7]} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: "high-performance" }} onCreated={({ gl }) => setCanvasElement(gl.domElement)}><ambientLight intensity={1.8}/><directionalLight position={[4, 8, 5]} intensity={1.6}/><ParametricSolid kind={selected.kind} showLabels={showLabels} showPoints={showPoints} showAuxiliary={showAuxiliary} lineWidth={lineWidth} labelSize={labelSize} showHidden={showHidden} examMode={examMode} points={drawing.points} segments={drawing.segments} vectors={drawing.vectors} objectVisibility={drawing.objectVisibility} selectedVertexId={drawing.selectedVertexId} pendingVertexIds={drawing.pendingVertexIds} edgeStyles={drawing.edgeStyles} selectedEdgeId={drawing.selectedEdgeId} selectedFaceId={drawing.selectedFaceId} onFace={handleFace} onEdge={handleEdge} onVertex={handleVertex}/><OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.4} maxDistance={14} maxPolarAngle={Math.PI / 2 + 0.2}/></Canvas><span className={`pointer-events-none absolute bottom-3 left-3 rounded-lg px-2.5 py-1.5 text-[11px] font-medium shadow-sm ${examMode ? "bg-white text-black ring-1 ring-black" : "bg-white/90 text-slate-500"}`}>{drawing.tool === "edge-point" ? "Chọn cạnh để đặt điểm theo tỉ số" : drawing.tool === "face-point" ? "Chọn mặt để đặt điểm thuộc mặt" : drawing.tool === "segment" ? "Chọn lần lượt hai đỉnh hoặc điểm" : drawing.tool === "vector" ? "Chọn điểm đầu và điểm cuối để dựng véc-tơ" : drawing.tool === "translation" ? `Chọn điểm cần tịnh tiến rồi hai đầu mút véc-tơ (${pendingTranslationIds.length}/3)` : drawing.tool === "perpendicular" ? "Chọn đỉnh, sau đó chọn mặt phẳng" : "Kéo để xoay · cuộn hoặc chụm để thu phóng"}</span></div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 sm:px-4"><p className="max-w-2xl text-sm leading-6 text-slate-600">{selected.description}<span className="ml-2 text-xs font-semibold text-teal-800">{selected.concept}</span></p><button type="button" onClick={() => toggleFavorite(selected.id)} className={`min-h-10 rounded-lg px-3 text-xs font-bold ${favorites.includes(selected.id) ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{favorites.includes(selected.id) ? "★ Đã lưu" : "☆ Lưu hình"}</button></div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-white px-3 py-2.5 sm:px-4"><button type="button" onClick={drawing.undo} disabled={!drawing.undoStack.length} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Hoàn tác Ctrl+Z" title="Hoàn tác (Ctrl+Z)"><Undo2 size={16}/></button><button type="button" onClick={drawing.redo} disabled={!drawing.redoStack.length} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 disabled:opacity-40" aria-label="Làm lại Ctrl+Y" title="Làm lại (Ctrl+Y)"><Redo2 size={16}/></button><button type="button" onClick={drawing.clear} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><Trash2 size={14}/> Xóa phép dựng</button><input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void openScene(file); event.currentTarget.value = ""; }}/><button type="button" onClick={saveScene} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><FileDown size={14}/> Lưu JSON</button><button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><FileUp size={14}/> Mở JSON</button><button type="button" onClick={exportAiSpec} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><FileJson size={14}/> Tệp cho AI</button><span className="ml-auto flex items-center gap-2"><select aria-label="Độ phân giải ảnh" value={exportWidth} onChange={event => setExportWidth(Number(event.target.value) as 1600 | 2400 | 3200 | 4000)} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"><option value={1600}>1600 px</option><option value={2400}>2400 px</option><option value={3200}>3200 px</option><option value={4000}>4000 px</option></select><button type="button" onClick={() => void captureImage(false)} disabled={exportBusy} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold disabled:opacity-50"><Download size={14}/>{exportBusy ? "Đang xuất…" : "Xuất PNG"}</button><button type="button" onClick={exportSvg} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold"><FileJson size={14}/> SVG</button><button type="button" onClick={() => void captureImage(true)} disabled={exportBusy} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-700 px-3 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50"><Copy size={14}/> Sao chép vào Word</button></span>{exportNotice && <p role="status" className="basis-full text-xs text-teal-800">{exportNotice}</p>}</div>
        </section>

        <aside className="order-3 space-y-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-teal-700">Bảng thuộc tính</p><h3 className="font-bold">Đối tượng đang chọn</h3></div><Ruler size={18} className="text-teal-700"/></div>
            {selectedEdgeId ? <><p className="mb-3 text-sm text-slate-600">Cạnh <strong>{selectedEdgeId.replace("-", "")}</strong></p><div className="space-y-2">{(["auto", "solid", "dashed"] as EdgeStyle[]).map(style => <button key={style} type="button" onClick={() => drawing.setEdgeStyle(selectedEdgeId, style)} aria-pressed={(drawing.edgeStyles[selectedEdgeId] ?? "auto") === style} className={`flex min-h-10 w-full items-center justify-between rounded-lg border px-3 text-xs font-semibold ${(drawing.edgeStyles[selectedEdgeId] ?? "auto") === style ? "border-teal-500 bg-teal-50 text-teal-900" : "border-slate-200 text-slate-600"}`}><span>{style === "auto" ? "Tự động tính toán" : style === "solid" ? "Cố định nét liền" : "Cố định nét đứt"}</span><span className={`w-12 border-t-2 ${style === "dashed" ? "border-dashed" : ""}`}/></button>)}</div><p className="mt-3 text-xs text-slate-500">Tự động dùng phân loại của mô hình; nét đứt chỉ là quy ước biểu diễn phần khuất.</p></>
              : drawing.selectedFaceId ? <><p className="mb-3 text-sm font-semibold text-slate-700">Mặt {drawing.selectedFaceId}</p><button type="button" onClick={() => setFace2dOpen(true)} disabled={!selectedFaceData} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-40"><ScanLine size={16}/> Xem mặt phẳng 2D</button><p className="mt-2 text-xs text-slate-500">Bản 2D giữ đúng tỉ lệ trong chính mặt phẳng.</p></>
              : drawing.selectedVertexId ? <><p className="text-sm text-slate-600">Đỉnh/điểm <strong>{drawing.points.find(point => point.id === drawing.selectedVertexId)?.label ?? drawing.selectedVertexId}</strong> đang được chọn.</p><p className="mt-2 text-xs text-slate-500">Chọn công cụ Nối hai điểm rồi chọn điểm thứ hai; hoặc chọn Hạ vuông góc và chọn mặt phẳng.</p></>
              : <p className="text-sm leading-6 text-slate-500">Chọn một cạnh, mặt hoặc điểm trên mô hình để xem thuộc tính và thao tác tiếp.</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-teal-700">Scene graph</p><h3 className="font-bold">Đối tượng trong hình</h3></div><Box size={17} className="text-teal-700"/></div><div className="max-h-72 space-y-3 overflow-y-auto text-xs">
            <ObjectGroup title="Đỉnh và điểm" items={model.vertices.map(vertex => ({ id: vertex.id, label: vertex.id, selected: drawing.selectedVertexId === vertex.id, select: () => drawing.selectVertex(vertex.id) })).concat(drawing.points.map(point => ({ id: point.id, label: `${point.label} · điểm phụ`, selected: drawing.selectedVertexId === point.id, select: () => drawing.selectVertex(point.id) })))} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>
            <ObjectGroup title="Khối gốc" items={[{ id: "$model", label: selected.title, selected: false, select: () => undefined }]} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>
            <ObjectGroup title="Mặt phẳng" items={model.faces.map(face => ({ id: faceId(face), label: faceId(face), selected: drawing.selectedFaceId === faceId(face), select: () => drawing.selectFace(faceId(face)) }))} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>
            <ObjectGroup title="Cạnh" items={[...new Set(model.faces.flatMap(face => face.map((id, i) => [id, face[(i + 1) % face.length]].sort().join("-"))))].map(id => ({ id, label: id.replace("-", "–"), selected: drawing.selectedEdgeId === id, select: () => drawing.selectEdge(id) }))} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>
            <ObjectGroup title="Đoạn dựng và véc-tơ" items={[...drawing.segments.map(segment => ({ id: segment.id, label: `Đoạn ${segment.from}–${segment.to}`, selected: false, select: () => drawing.selectVertex(segment.from) })), ...drawing.vectors.map(vector => ({ id: vector.id, label: `Véc-tơ ${vector.from}${vector.to}`, selected: false, select: () => drawing.selectVertex(vector.from) }))]} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>
            {selected.kind === "pyramidCut" && <ObjectGroup title="Thiết diện" items={[{ id: faceId(model.cutFace ?? []), label: "Mặt cắt song song đáy", selected: drawing.selectedFaceId === faceId(model.cutFace ?? []), select: () => drawing.selectFace(faceId(model.cutFace ?? [])) }]} visibility={drawing.objectVisibility} toggle={drawing.toggleObjectVisibility}/>}
          </div></section>
          <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-violet-900"><Sparkles size={17}/><div><p className="text-[10px] font-bold uppercase tracking-[.15em]">TES · Gợi mở Socratic</p><h3 className="font-bold">Suy luận từ thao tác</h3></div></div><p className="mt-3 min-h-16 text-sm leading-6 text-slate-700">{hint || "TES sẽ đặt câu hỏi từ điểm, đoạn hoặc nét cạnh em vừa thao tác; không hiện đáp án thay em."}</p><button type="button" onClick={hintForLatest} className="mt-2 min-h-10 w-full rounded-lg bg-violet-700 px-3 text-xs font-bold text-white hover:bg-violet-800">Gợi ý theo nhật ký</button></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Nhật ký dựng hình</h3><Activity size={16} className="text-slate-400"/></div>{drawing.logs.length ? <ol className="max-h-52 space-y-2 overflow-y-auto">{[...drawing.logs].reverse().map(entry => <li key={entry.id} className="border-l-2 border-teal-200 pl-2.5 text-xs leading-5 text-slate-600">{entry.text}</li>)}</ol> : <p className="text-xs text-slate-500">Các thao tác sẽ được ghi tại đây.</p>}</section>
          {drawing.tool === "perpendicular" && drawing.selectedVertexId && <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Đã chọn {drawing.points.find(point => point.id === drawing.selectedVertexId)?.label ?? drawing.selectedVertexId}. Chạm vào mặt phẳng đích trên hình để dựng hình chiếu.</p>}
        </aside>
      </div>
    </div>
    {face2dOpen && selectedFaceData && <FaceInspectorDialog face={selectedFaceData} dynamicPoints={drawing.points} segments={drawing.segments} onClose={() => setFace2dOpen(false)} onAddPoint={(point, tool, previousId) => { const label = nextLabel(); const id = `aux-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; drawing.addPoint({ id, label, point, source: "face", faceId: selectedFaceData.id }, `Thêm điểm ${label} trên bản 2D của mặt ${selectedFaceData.id}; tọa độ đã ánh xạ về mô hình 3D.`); if (tool === "segment" && previousId) drawing.addSegment(previousId, id, `Dựng đoạn trong mặt ${selectedFaceData.id}; đoạn đã ánh xạ ngược về mô hình 3D.`); return id; }} />}
  </main>;
}

function ObjectGroup({ title, items, visibility, toggle }: { title: string; items: { id: string; label: string; selected: boolean; select: () => void }[]; visibility: Record<string, boolean>; toggle: (id: string) => void }) {
  if (!items.length) return null;
  return <div><h4 className="mb-1 font-bold text-slate-500">{title} <span className="font-normal">({items.length})</span></h4><ul className="space-y-0.5">{items.map(item => <li key={item.id} className={`flex items-center gap-1 rounded-lg ${item.selected ? "bg-teal-50 text-teal-900" : "text-slate-700 hover:bg-slate-50"}`}><button type="button" onClick={item.select} className="min-w-0 flex-1 truncate px-2 py-1.5 text-left" title={item.label}>{item.label}</button><button type="button" onClick={() => toggle(item.id)} className="grid h-7 w-8 shrink-0 place-items-center rounded-md hover:bg-white" aria-label={`${visibility[item.id] === false ? "Hiện" : "Ẩn"} ${item.label}`} title={visibility[item.id] === false ? "Hiện" : "Ẩn"}>{visibility[item.id] === false ? <EyeOff size={14}/> : <Eye size={14}/>}</button></li>)}</ul></div>;
}

function FaceInspectorDialog({ face, dynamicPoints, segments, onClose, onAddPoint }: { face: { id: string; vertices: { id: string; point: Point3 }[] }; dynamicPoints: LibraryPoint[]; segments: { from: string; to: string }[]; onClose: () => void; onAddPoint: (point: Point3, tool: "point" | "segment", previousId?: string) => string }) {
  const [tool, setTool] = useState<"point" | "segment" | "measure">("point");
  const [previousId, setPreviousId] = useState<string | undefined>();
  const basis = useMemo(() => flattenFace(face.vertices.map(vertex => vertex.point)), [face]);
  if (!basis) return null;
  const width = 620, height = 420, pad = 58;
  const xs = basis.flat.map(point => point.x), ys = basis.flat.map(point => point.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const scale = Math.min((width - pad * 2) / Math.max(0.001, maxX - minX), (height - pad * 2) / Math.max(0.001, maxY - minY));
  const map = (xy: { x: number; y: number }) => ({ x: pad + (xy.x - minX) * scale, y: height - pad - (xy.y - minY) * scale });
  const polygon = basis.flat.map(point => { const p = map(point); return `${p.x},${p.y}`; }).join(" ");
  const sideLengths = face.vertices.map((vertex, i) => new THREE.Vector3(...vertex.point).distanceTo(new THREE.Vector3(...face.vertices[(i + 1) % face.vertices.length].point)));
  const area = Math.abs(basis.flat.reduce((sum, point, i) => { const next = basis.flat[(i + 1) % basis.flat.length]; return sum + point.x * next.y - next.x * point.y; }, 0)) / 2;
  const angles = basis.flat.map((point, i) => {
    const prev = basis.flat[(i - 1 + basis.flat.length) % basis.flat.length], next = basis.flat[(i + 1) % basis.flat.length];
    const a = new THREE.Vector2(prev.x - point.x, prev.y - point.y), b = new THREE.Vector2(next.x - point.x, next.y - point.y);
    return `${face.vertices[i].id}: ${THREE.MathUtils.radToDeg(a.angleTo(b)).toFixed(1)}°`;
  });
  const facePointMap = new Map(dynamicPoints.map(point => [point.id, point.point]));
  const inFace = dynamicPoints.filter(point => Math.abs(basis.normal.dot(new THREE.Vector3(...point.point).sub(basis.origin))) < 0.025);
  const toScreen = (point: Point3) => map(basis.project(point));
  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (tool === "measure") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) * width / rect.width, y = (event.clientY - rect.top) * height / rect.height;
    const xy = { x: minX + (x - pad) / scale, y: minY + (height - pad - y) / scale };
    const point = basis.unproject(xy);
    const createdId = onAddPoint(point, tool, tool === "segment" ? previousId : undefined);
    if (tool === "segment") setPreviousId(previousId ? undefined : createdId);
  };
  return <div role="presentation" className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-3" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="face2d-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-teal-700">Mặt phẳng 2D · giữ tỉ lệ Euclid</p><h2 id="face2d-title" className="text-lg font-bold">{face.id}</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-slate-100" aria-label="Đóng"><X/></button></header><div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_240px] sm:p-6"><div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2">{(["point", "segment", "measure"] as const).map(value => <button key={value} type="button" onClick={() => { setTool(value); setPreviousId(undefined); }} aria-pressed={tool === value} className={`min-h-9 rounded-lg px-3 text-xs font-bold ${tool === value ? "bg-teal-700 text-white" : "border border-slate-200 text-slate-700"}`}>{value === "point" ? "Điểm" : value === "segment" ? "Đoạn thẳng" : "Đo và xem số đo"}</button>)}</div><svg viewBox={`0 0 ${width} ${height}`} onClick={handleSvgClick} role="img" aria-label={`Mặt 2D ${face.id}; chạm để dựng điểm`} className={`h-auto max-h-[62vh] w-full rounded-xl border border-slate-200 bg-[#fbfefd] ${tool === "measure" ? "cursor-default" : "cursor-crosshair"}`}><polygon points={polygon} fill="#c8eee8" fillOpacity=".56" stroke="#0f766e" strokeWidth="2.5"/>{face.vertices.map((vertex, i) => { const p = map(basis.flat[i]); return <g key={vertex.id}><circle cx={p.x} cy={p.y} r="4" fill="#0f766e"/><text x={p.x + 7} y={p.y - 7} fontSize="13" fontWeight="700" fill="#0f172a">{vertex.id}</text><text x={(p.x + map(basis.flat[(i + 1) % basis.flat.length]).x) / 2} y={(p.y + map(basis.flat[(i + 1) % basis.flat.length]).y) / 2 - 5} fontSize="11" fill="#475569">{sideLengths[i].toFixed(2)}</text></g>; })}{segments.map((segment, i) => { const a = facePointMap.get(segment.from), b = facePointMap.get(segment.to); if (!a || !b || Math.abs(basis.normal.dot(new THREE.Vector3(...a).sub(basis.origin))) > .025 || Math.abs(basis.normal.dot(new THREE.Vector3(...b).sub(basis.origin))) > .025) return null; const pa = toScreen(a), pb = toScreen(b); return <line key={`${segment.from}-${segment.to}-${i}`} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#7c3aed" strokeWidth="3"/>; })}{inFace.map(point => { const p = toScreen(point.point); return <g key={point.id}><circle cx={p.x} cy={p.y} r="4.5" fill="#f97316"/><text x={p.x + 8} y={p.y - 8} fontSize="13" fontWeight="700" fill="#9a3412">{point.label}</text></g>; })}</svg><p className="mt-2 text-xs text-slate-500">Bản 2D được dựng từ tọa độ thật của mặt. Điểm và đoạn tạo ở đây được ánh xạ lại lên mô hình 3D.</p></div><aside className="space-y-3 rounded-xl bg-slate-50 p-3"><h3 className="text-sm font-bold">Số đo mặt</h3><div className="space-y-2 text-xs text-slate-700"><p>Diện tích: <strong>{area.toFixed(3)} đv²</strong></p><p>Chu vi: <strong>{sideLengths.reduce((a, b) => a + b, 0).toFixed(3)} đv</strong></p><div><p className="font-semibold">Độ dài cạnh</p><ul className="mt-1 space-y-1">{sideLengths.map((length, i) => <li key={i}>{face.vertices[i].id}{face.vertices[(i + 1) % face.vertices.length].id}: {length.toFixed(3)} đv</li>)}</ul></div><div><p className="font-semibold">Góc trong</p><ul className="mt-1 space-y-1">{angles.map(angle => <li key={angle}>{angle}</li>)}</ul></div></div><p className="border-t border-slate-200 pt-2 text-[11px] leading-5 text-slate-500">Góc và độ dài được tính trong mặt phẳng; chúng không suy ra từ độ dài hiển thị trên hình chiếu 3D.</p></aside></div></section></div>;
}

function flattenFace(points: Point3[]) {
  if (points.length < 3) return null;
  const origin = new THREE.Vector3(...points[0]);
  const u = new THREE.Vector3(...points[1]).sub(origin).normalize();
  const normal = new THREE.Vector3(...points[1]).sub(origin).cross(new THREE.Vector3(...points[2]).sub(origin)).normalize();
  if (normal.lengthSq() < 1e-8) return null;
  const v = normal.clone().cross(u).normalize();
  const flat = points.map(point => { const delta = new THREE.Vector3(...point).sub(origin); return { x: delta.dot(u), y: delta.dot(v) }; });
  return { origin, u, v, normal, flat, project: (point: Point3) => { const delta = new THREE.Vector3(...point).sub(origin); return { x: delta.dot(u), y: delta.dot(v) }; }, unproject: (xy: { x: number; y: number }): Point3 => origin.clone().addScaledVector(u, xy.x).addScaledVector(v, xy.y).toArray() as Point3 };
}
