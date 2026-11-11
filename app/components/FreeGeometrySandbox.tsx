"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, ThreeEvent, useThree } from "@react-three/fiber";
import { Grid, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type Point = { name: string; x: number; y: number; z: number };
type Segment = [string, string];
type PlaneSpec = { kind: "points"; names: [string, string, string] } | { kind: "equation"; coefficients: [number, number, number, number] };

const STORAGE_KEY = "mathstep:free-geometry:v1";
const INITIAL_POINTS: Point[] = [
  { name: "A", x: -2, y: 0, z: -1 },
  { name: "B", x: 2, y: 0, z: -1 },
  { name: "C", x: 0, y: 2, z: 1 },
];

function nextPointName(points: Point[]) {
  const used = new Set(points.map((point) => point.name));
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").find((name) => !used.has(name)) || `P${points.length + 1}`;
}

function parsePlaneEquation(input: string): [number, number, number, number] | null {
  const compact = input.replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".");
  const parts = compact.split("=");
  if (parts.length !== 2 || parts[1] !== "0") return null;
  const terms = parts[0].replace(/-/g, "+-").split("+").filter(Boolean);
  const coefficients: [number, number, number, number] = [0, 0, 0, 0];
  for (const term of terms) {
    const match = term.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+)?)([xyz]?)$/);
    if (!match) return null;
    const [, raw, variable] = match;
    if (!variable && (!raw || raw === "+" || raw === "-")) return null;
    const value = raw === "" || raw === "+" ? 1 : raw === "-" ? -1 : Number(raw);
    if (!Number.isFinite(value)) return null;
    const index = variable === "x" ? 0 : variable === "y" ? 1 : variable === "z" ? 2 : 3;
    coefficients[index] += value;
  }
  return Math.hypot(...coefficients.slice(0, 3)) > 0.001 ? coefficients : null;
}

function CameraControls({ view }: { view: "perspective" | "top" | "front" | "side" }) {
  const { camera, controls } = useThree();
  useEffect(() => {
    const positions = { perspective: [6, 5, 6], top: [0, 9, 0.001], front: [0, 2, 9], side: [9, 2, 0] };
    camera.position.set(...(positions[view] as [number, number, number]));
    camera.lookAt(0, 0, 0);
    if (controls && "target" in controls) {
      (controls.target as THREE.Vector3).set(0, 0, 0);
      (controls as unknown as { update: () => void }).update();
    }
  }, [camera, controls, view]);
  return <OrbitControls makeDefault enableDamping />;
}

function SandboxScene({ points, segments, plane, addPoint, view }: {
  points: Point[];
  segments: Segment[];
  plane: PlaneSpec | null;
  addPoint: (x: number, y: number, z: number) => void;
  view: "perspective" | "top" | "front" | "side";
}) {
  const planeGeometry = useMemo(() => {
    if (!plane) return null;
    let normal: THREE.Vector3;
    let center: THREE.Vector3;
    if (plane.kind === "equation") {
      const [a, b, c, d] = plane.coefficients;
      normal = new THREE.Vector3(a, b, c);
      center = normal.clone().multiplyScalar(-d / normal.lengthSq());
    } else {
      const selected = plane.names.map((name) => points.find((point) => point.name === name));
      if (selected.some((point) => !point)) return null;
      const [a, b, c] = selected as Point[];
      const A = new THREE.Vector3(a.x, a.y, a.z);
      const B = new THREE.Vector3(b.x, b.y, b.z);
      const C = new THREE.Vector3(c.x, c.y, c.z);
      normal = new THREE.Vector3().crossVectors(B.clone().sub(A), C.clone().sub(A));
      center = A.clone().add(B).add(C).divideScalar(3);
    }
    if (normal.lengthSq() < 0.0001) return null;
    return { position: center, quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal.normalize()) };
  }, [plane, points]);

  const pointMap = new Map(points.map((point) => [point.name, point]));
  const onGroundClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    addPoint(Math.round(event.point.x * 10) / 10, 0, Math.round(event.point.z * 10) / 10);
  };

  return <>
    <color attach="background" args={["#f8fafc"]} />
    <ambientLight intensity={1.7} />
    <directionalLight position={[5, 8, 5]} intensity={1.2} />
    <Grid args={[12, 12]} cellSize={1} cellThickness={0.6} cellColor="#a3b2c3" sectionSize={5} sectionThickness={1.1} sectionColor="#53677e" infiniteGrid fadeDistance={30} />
    <axesHelper args={[3.5]} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]} onClick={onGroundClick}>
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
    {planeGeometry && <mesh position={planeGeometry.position} quaternion={planeGeometry.quaternion}>
      <planeGeometry args={[5, 5]} />
      <meshBasicMaterial color="#0d9488" transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>}
    {segments.map(([first, second]) => {
      const A = pointMap.get(first);
      const B = pointMap.get(second);
      return A && B ? <Line key={`${first}-${second}`} points={[[A.x, A.y, A.z], [B.x, B.y, B.z]]} color="#1e40af" lineWidth={3} /> : null;
    })}
    {points.map((point) => <group key={point.name} position={[point.x, point.y, point.z]}>
      <mesh><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="#dc2626" /></mesh>
      <Html position={[0.15, 0.16, 0]} center style={{ pointerEvents: "none" }}><span className="rounded bg-white/95 px-1.5 py-0.5 text-xs font-bold text-slate-900 shadow-sm">{point.name}</span></Html>
    </group>)}
    <CameraControls view={view} />
  </>;
}

export default function FreeGeometrySandbox() {
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [plane, setPlane] = useState<PlaneSpec | null>(null);
  const [coordinates, setCoordinates] = useState<[string, string, string]>(["0", "1", "0"]);
  const [lineEnds, setLineEnds] = useState<[string, string]>(["A", "B"]);
  const [planePoints, setPlanePoints] = useState<[string, string, string]>(["A", "B", "C"]);
  const [equation, setEquation] = useState("x+y+z-2=0");
  const [feedback, setFeedback] = useState("");
  const [view, setView] = useState<"perspective" | "top" | "front" | "side">("perspective");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.points) && Array.isArray(saved.segments)) {
        const validPoints = saved.points.filter((point: Point) => point && typeof point.name === "string" && [point.x, point.y, point.z].every(Number.isFinite)).slice(0, 26);
        if (validPoints.length) setPoints(validPoints);
        setSegments(saved.segments.filter((segment: unknown) => Array.isArray(segment) && segment.length === 2 && segment.every((name) => typeof name === "string")).slice(0, 40));
        if (saved.plane?.kind === "points" && Array.isArray(saved.plane.names) && saved.plane.names.length === 3) setPlane(saved.plane);
        if (saved.plane?.kind === "equation" && Array.isArray(saved.plane.coefficients) && saved.plane.coefficients.length === 4 && saved.plane.coefficients.every(Number.isFinite)) setPlane(saved.plane);
      }
    } catch { /* Ignore invalid local data. */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ points, segments, plane }));
  }, [loaded, points, segments, plane]);

  const addPoint = (x: number, y: number, z: number) => {
    if (![x, y, z].every(Number.isFinite) || Math.max(Math.abs(x), Math.abs(y), Math.abs(z)) > 20) { setFeedback("Nhập tọa độ hữu hạn trong khoảng −20 đến 20."); return; }
    if (points.length >= 26) { setFeedback("Bản dựng đã có đủ 26 điểm."); return; }
    const name = nextPointName(points);
    setPoints((current) => [...current, { name, x, y, z }]);
    setFeedback(`Đã tạo điểm ${name}(${x}; ${y}; ${z}).`);
  };
  const addSegment = () => {
    const [a, b] = lineEnds;
    if (a === b || !points.some((point) => point.name === a) || !points.some((point) => point.name === b)) { setFeedback("Chọn hai điểm khác nhau."); return; }
    if (!segments.some(([first, second]) => first === a && second === b || first === b && second === a)) setSegments((current) => [...current, [a, b]]);
    setFeedback(`Đã nối đoạn ${a}${b}.`);
  };
  const addPlaneFromPoints = () => {
    const selected = planePoints.map((name) => points.find((point) => point.name === name));
    if (new Set(planePoints).size !== 3 || selected.some((point) => !point)) { setFeedback("Chọn ba điểm phân biệt."); return; }
    const [a, b, c] = selected as Point[];
    const normal = new THREE.Vector3().crossVectors(new THREE.Vector3(b.x-a.x, b.y-a.y, b.z-a.z), new THREE.Vector3(c.x-a.x, c.y-a.y, c.z-a.z));
    if (normal.lengthSq() < 0.0001) { setFeedback("Ba điểm thẳng hàng nên không xác định một mặt phẳng duy nhất."); return; }
    setPlane({ kind: "points", names: planePoints });
    setFeedback(`Đã dựng mặt phẳng (${planePoints.join("")}).`);
  };
  const addPlaneFromEquation = () => {
    const coefficients = parsePlaneEquation(equation);
    if (!coefficients) { setFeedback("Viết dạng ax + by + cz + d = 0, ví dụ: 2x-y+z-3=0."); return; }
    setPlane({ kind: "equation", coefficients });
    setFeedback(`Đã dựng mặt phẳng ${equation}.`);
  };
  const inputClass = "h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900";
  const buttonClass = "min-h-9 rounded-lg bg-emerald-700 px-3 text-sm font-semibold text-white hover:bg-emerald-800";

  return <section aria-label="Tự do dựng hình không gian" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px]">
    <div className="relative h-[420px] min-h-[55dvh] overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 touch-none">
      <Canvas camera={{ position: [6, 5, 6], fov: 48 }} dpr={[1, 1.5]}>
        <SandboxScene points={points} segments={segments} plane={plane} addPoint={addPoint} view={view} />
      </Canvas>
      <div className="absolute left-3 top-3 rounded-lg bg-white/95 p-2 text-xs font-semibold text-slate-800 shadow-sm">Chạm mặt lưới để thêm điểm · X đỏ · Y xanh lục · Z xanh lam</div>
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 rounded-xl bg-white/95 p-1 shadow-sm">
        {([ ["perspective", "3D"], ["top", "Trên"], ["front", "Trước"], ["side", "Bên"] ] as const).map(([value, label]) =>
          <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${view === value ? "bg-emerald-700 text-white" : "text-slate-800 hover:bg-slate-100"}`}>{label}</button>)}
      </div>
    </div>
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800">
      <div><h3 className="font-bold">Tự dựng hình</h3><p className="mt-1 text-xs text-slate-600">Chấm điểm trên lưới hoặc nhập tọa độ để dựng hình trong không gian Oxyz.</p></div>
      <div><label className="text-xs font-semibold">Điểm {nextPointName(points)}(x; y; z)</label><div className="mt-1 grid grid-cols-3 gap-1">{coordinates.map((value, index) => <input key={index} aria-label={["Hoành độ x", "Tung độ y", "Cao độ z"][index]} type="number" step="0.1" value={value} onChange={(event) => setCoordinates((current) => current.map((item, i) => i === index ? event.target.value : item) as [string, string, string])} className={inputClass} />)}</div><button type="button" className={`${buttonClass} mt-2 w-full`} onClick={() => addPoint(...coordinates.map(Number) as [number, number, number])}>Thêm điểm</button></div>
      <div><label className="text-xs font-semibold">Nối hai điểm</label><div className="mt-1 grid grid-cols-2 gap-1">{lineEnds.map((value, index) => <select key={index} aria-label={`Đầu mút ${index+1}`} className={inputClass} value={value} onChange={(event) => setLineEnds((current) => current.map((item, i) => i === index ? event.target.value : item) as [string, string])}>{points.map((point) => <option key={point.name}>{point.name}</option>)}</select>)}</div><button type="button" className={`${buttonClass} mt-2 w-full`} onClick={addSegment}>Nối đoạn thẳng</button></div>
      <div><label className="text-xs font-semibold">Mặt phẳng qua ba điểm</label><div className="mt-1 grid grid-cols-3 gap-1">{planePoints.map((value, index) => <select key={index} aria-label={`Điểm thứ ${index+1}`} className={inputClass} value={value} onChange={(event) => setPlanePoints((current) => current.map((item, i) => i === index ? event.target.value : item) as [string, string, string])}>{points.map((point) => <option key={point.name}>{point.name}</option>)}</select>)}</div><button type="button" className={`${buttonClass} mt-2 w-full`} onClick={addPlaneFromPoints}>Dựng mặt phẳng</button></div>
      <div><label htmlFor="sandbox-plane-equation" className="text-xs font-semibold">Hoặc nhập phương trình mặt phẳng</label><input id="sandbox-plane-equation" className={`${inputClass} mt-1`} value={equation} onChange={(event) => setEquation(event.target.value)} placeholder="2x-y+z-3=0" /><button type="button" className={`${buttonClass} mt-2 w-full`} onClick={addPlaneFromEquation}>Vẽ từ phương trình</button></div>
      {feedback && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">{feedback}</p>}
      <button type="button" className="text-xs font-semibold text-rose-700 underline" onClick={() => { setPoints(INITIAL_POINTS); setSegments([]); setPlane(null); setFeedback("Đã đặt lại bản dựng."); }}>Đặt lại bản dựng</button>
    </div>
  </section>;
}
