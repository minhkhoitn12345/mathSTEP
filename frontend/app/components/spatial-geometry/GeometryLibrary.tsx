"use client";

import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Box, Check, Eye, EyeOff, Search, RotateCcw, Shapes } from "lucide-react";

type Point3 = [number, number, number];
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

function ParametricSolid({ kind, showLabels, showHidden }: { kind: ModelKind; showLabels: boolean; showHidden: boolean }) {
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
  const surface = useMemo(() => {
    if (kind === "cylinder" || kind === "cone" || kind === "sphere") return null;
    const positions: number[] = [];
    for (const face of model.faces) {
      for (let i = 1; i < face.length - 1; i++) {
        for (const id of [face[0], face[i], face[i + 1]]) positions.push(...(byId.get(id) ?? [0, 0, 0]));
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, [byId, kind, model.faces]);

  const shape = kind === "cylinder" ? <mesh position={[0, 1.15, 0]}><cylinderGeometry args={[1.35, 1.35, 2.3, 48, 1, false]} /><meshStandardMaterial color="#0f766e" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    : kind === "cone" ? <mesh position={[0, 1.2, 0]}><coneGeometry args={[1.5, 2.4, 48, 1, false]} /><meshStandardMaterial color="#0f766e" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} /></mesh>
    : kind === "sphere" ? <mesh position={[0, 1.4, 0]}><sphereGeometry args={[1.5, 40, 28]} /><meshStandardMaterial color="#0f766e" transparent opacity={0.25} roughness={0.55} /></mesh>
    : <mesh geometry={surface ?? undefined}><meshStandardMaterial color="#14b8a6" transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} /></mesh>;

  const roundEdges = kind === "cylinder" || kind === "cone" ? [
    <mesh key="base" position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.35, 0.012, 8, 64]} /><meshBasicMaterial color="#0f766e" /></mesh>,
    <mesh key="top" position={[0, 2.27, 0]} rotation={[-Math.PI / 2, 0, 0]}>{kind === "cylinder" ? <torusGeometry args={[1.35, 0.012, 8, 64]} /> : null}<meshBasicMaterial color="#0f766e" /></mesh>,
  ] : kind === "sphere" ? null : edges.map(edge => {
    const [a, b] = edge.split("-"); const p = byId.get(a), q = byId.get(b); if (!p || !q) return null;
    const hidden = model.hidden.includes(edge);
    if (hidden && !showHidden) return null;
    return <Line key={edge} points={[p, q]} color={hidden ? "#64748b" : "#0f766e"} lineWidth={hidden ? 1.5 : 2.3} dashed={hidden} dashSize={0.1} gapSize={0.07} transparent opacity={hidden ? 0.75 : 1} depthTest={!hidden} renderOrder={hidden ? 2 : 3} />;
  });

  return <group position={[0, -0.7, 0]}>
    {shape}{roundEdges}
    {kind !== "cylinder" && kind !== "cone" && kind !== "sphere" && model.cutFace?.length ? <CutFace ids={model.cutFace} byId={byId} /> : null}
    {showLabels && model.vertices.map(v => <Html key={v.id} position={v.point} center distanceFactor={8} style={{ pointerEvents: "none" }}><span className="rounded bg-white/95 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">{v.id}</span></Html>)}
    <gridHelper args={[7, 14, "#b9d8d3", "#e5efed"]} position={[0, -0.68, 0]} />
    <axesHelper args={[2.3]} />
  </group>;
}

function CutFace({ ids, byId }: { ids: string[]; byId: Map<string, Point3> }) {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    for (let i = 1; i < ids.length - 1; i++) for (const id of [ids[0], ids[i], ids[i + 1]]) pts.push(...(byId.get(id) ?? [0, 0, 0]));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.computeVertexNormals(); return g;
  }, [byId, ids]);
  return <><mesh geometry={geometry} renderOrder={4}><meshBasicMaterial color="#f97316" side={THREE.DoubleSide} transparent opacity={0.58} depthWrite={false} /></mesh><Line points={[...ids.map(id => byId.get(id)!).filter(Boolean), byId.get(ids[0])!]} color="#c2410c" lineWidth={3} renderOrder={5} /></>;
}

export function GeometryLibrary() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [selectedId, setSelectedId] = useState(ITEMS[0].id);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [showHidden, setShowHidden] = useState(true);
  const [cameraReset, setCameraReset] = useState(0);
  const categories = ["Tất cả", ...new Set(ITEMS.map(item => item.category))];
  const filtered = ITEMS.filter(item => (category === "Tất cả" || item.category === category) && `${item.title} ${item.concept} ${item.grade}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
  const selected = ITEMS.find(item => item.id === selectedId) ?? ITEMS[0];

  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("mathstep-geometry-library-favorites") || "[]"); if (Array.isArray(saved)) setFavorites(saved.filter((id): id is string => typeof id === "string" && ITEMS.some(item => item.id === id))); } catch { /* Ignore invalid local data. */ }
  }, []);
  const toggleFavorite = (id: string) => setFavorites(current => {
    const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
    localStorage.setItem("mathstep-geometry-library-favorites", JSON.stringify(next)); return next;
  });

  return <main className="min-h-screen bg-[#f5f8f7] text-slate-900">
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
        <div className="flex items-center gap-3"><Link href="/" aria-label="Về trang chủ MathSTEP" className="grid h-10 w-10 place-items-center rounded-xl bg-teal-700 text-white"><Shapes size={20} /></Link><div><p className="text-xs font-bold uppercase tracking-[.17em] text-teal-700">MathSTEP · Chuyên đề 2</p><h1 className="text-lg font-bold leading-tight sm:text-xl">Thư viện hình học không gian</h1></div></div>
        <Link href="/learn/spatial_geometry/sg-lesson-1" className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 sm:inline-flex"><BookOpen size={16} /> Vào bài học</Link>
      </div>
    </header>
    <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-7 sm:py-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-600">Chọn một mô hình để xoay, đổi góc nhìn và ôn lại các quan hệ hình học.</p><p className="mt-1 text-xs text-slate-500">{ITEMS.length} hình mẫu · tương tác trực tiếp · lưu mục yêu thích trên thiết bị này</p></div><Link href="/learn/spatial_geometry/sg-lesson-1" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-800 hover:text-teal-950 sm:hidden"><ArrowLeft size={15} /> Bài học Chuyên đề 2</Link></div>
      <div className="grid min-h-[calc(100vh-190px)] gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm hình, kiến thức…" aria-label="Tìm hình mẫu" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" /></div><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{categories.map(value => <button key={value} type="button" onClick={() => setCategory(value)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === value ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{value}</button>)}</div></div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">{filtered.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selectedId === item.id ? "bg-teal-50 ring-1 ring-teal-200" : "hover:bg-slate-50"}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selectedId === item.id ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}><Box size={19} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{item.title}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{item.category} · {item.grade}</span></span><span className={`text-lg leading-none ${favorites.includes(item.id) ? "text-amber-500" : "text-slate-300 group-hover:text-slate-400"}`} aria-hidden="true">{favorites.includes(item.id) ? "★" : "☆"}</span></button>)}{filtered.length === 0 && <p className="p-6 text-center text-sm text-slate-500">Không tìm thấy hình phù hợp.</p>}</div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Thư viện mô hình dùng trong nội dung Toán phổ thông.</div>
        </aside>
        <section className="flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5"><div><span className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">{selected.category} · {selected.grade}</span><h2 className="mt-0.5 text-lg font-bold">{selected.title}</h2></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setShowLabels(v => !v)} aria-pressed={showLabels} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">{showLabels ? <Eye size={15} /> : <EyeOff size={15} />} Nhãn điểm</button><button type="button" onClick={() => setShowHidden(v => !v)} aria-pressed={showHidden} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">{showHidden ? <Eye size={15} /> : <EyeOff size={15} />} Nét khuất</button><button type="button" onClick={() => setCameraReset(v => v + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"><RotateCcw size={15} /> Đặt lại góc</button></div></div>
          <div className="relative min-h-[390px] flex-1 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#f2f8f7_72%,#edf4f3_100%)] sm:min-h-[480px]"><Canvas key={cameraReset} camera={{ position: [5, 4.1, 6], fov: 42 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }}><color attach="background" args={["#f6faf9"]} /><ambientLight intensity={1.8} /><directionalLight position={[4, 8, 5]} intensity={1.6} /><ParametricSolid kind={selected.kind} showLabels={showLabels} showHidden={showHidden} /><OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={3.4} maxDistance={14} maxPolarAngle={Math.PI / 2 + 0.2} /></Canvas><span className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/85 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 shadow-sm">Kéo để xoay · cuộn hoặc chụm để thu phóng</span></div>
          <div className="grid gap-4 border-t border-slate-100 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:px-5"><div><p className="text-sm leading-6 text-slate-700">{selected.description}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800">{selected.concept}</span></div></div><button type="button" onClick={() => toggleFavorite(selected.id)} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${favorites.includes(selected.id) ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}><Check size={16} />{favorites.includes(selected.id) ? "Đã lưu yêu thích" : "Lưu hình này"}</button></div>
        </section>
      </div>
    </div>
  </main>;
}
