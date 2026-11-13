"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type View = "default" | "top" | "front";
const VIEWS: Record<View, [number, number, number]> = {
  default: [6.4, 5.1, 7.2],
  top: [0, 10, 0.01],
  front: [0, 2.2, 10],
};
const DEFAULT_TARGET: [number, number, number] = [0, 1.55, 0];

function CameraRig({ view, zoom = 1 }: { view: { name: View; version: number }; zoom?: number }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const transition = useRef<{ from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; started: number } | null>(null);
  const { camera } = useThree();
  useEffect(() => {
    camera.up.set(0, view.name === "top" ? 0 : 1, view.name === "top" ? -1 : 0);
    camera.updateProjectionMatrix();
    transition.current = { from: camera.position.clone(), to: new THREE.Vector3(...VIEWS[view.name].map((coordinate) => coordinate / zoom) as [number, number, number]), fromTarget: controls.current?.target.clone() ?? new THREE.Vector3(...DEFAULT_TARGET), toTarget: new THREE.Vector3(...DEFAULT_TARGET), started: performance.now() };
  }, [camera, view, zoom]);
  useFrame(() => {
    const item = transition.current;
    if (!item || !controls.current) return;
    const t = Math.min(1, (performance.now() - item.started) / 500);
    camera.position.copy(item.from).lerp(item.to, t * t * (3 - 2 * t));
    controls.current.target.copy(item.fromTarget).lerp(item.toTarget, t * t * (3 - 2 * t));
    controls.current.update();
    if (t >= 1) transition.current = null;
  });
  return <OrbitControls ref={controls} makeDefault target={DEFAULT_TARGET} enableDamping dampingFactor={0.08} minDistance={4} maxDistance={18} />;
}

function Face({ points, color }: { points: [number, number, number][]; color: string }) {
  const geometry = useMemo(() => {
    const item = new THREE.BufferGeometry();
    item.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    item.setIndex([0, 1, 2]);
    item.computeVertexNormals();
    return item;
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh>
    <primitive object={geometry} attach="geometry" />
    <meshStandardMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} depthWrite={false} />
  </mesh>;
}

function VertexLabel({ name, position, color = "#0f172a" }: { name: string; position: [number, number, number]; color?: string }) {
  return <group position={position}>
    <mesh><sphereGeometry args={[0.055, 12, 12]} /><meshStandardMaterial color={color} /></mesh>
    <Html center distanceFactor={11} style={{ pointerEvents: "none" }}><span className="rounded bg-white/95 px-1.5 py-0.5 text-xs font-extrabold text-slate-900 shadow">{name}</span></Html>
  </group>;
}

function PyramidScene({ ratio }: { ratio: number }) {
  const A: [number, number, number] = [-2.2, 0, -1.4];
  const B: [number, number, number] = [1.8, 0, -1.4];
  const C: [number, number, number] = [2.6, 0, 1.4];
  const D: [number, number, number] = [-1.4, 0, 1.4];
  const S: [number, number, number] = [0, 4.5, 0];
  const M: [number, number, number] = [(S[0] + A[0]) / 2, (S[1] + A[1]) / 2, (S[2] + A[2]) / 2];
  const N: [number, number, number] = [S[0] + ratio * (B[0] - S[0]), S[1] + ratio * (B[1] - S[1]), S[2] + ratio * (B[2] - S[2])];
  return <>
    <gridHelper args={[12, 12, "#94a3b8", "#e2e8f0"]} position={[0, -0.02, 0]} />
    <axesHelper args={[3]} />
    <ambientLight intensity={1.25} />
    <directionalLight position={[5, 9, 6]} intensity={1.6} />
    <Face points={[A, B, S]} color="#2dd4bf" /><Face points={[B, C, S]} color="#38bdf8" />
    <Face points={[C, D, S]} color="#a78bfa" /><Face points={[D, A, S]} color="#fbbf24" />
    <Face points={[A, B, C]} color="#cbd5e1" /><Face points={[A, C, D]} color="#cbd5e1" />
    <Line points={[A, B, C, D, A]} color="#334155" lineWidth={2} />
    <Line points={[S, A]} color="#64748b" dashed dashSize={0.13} gapSize={0.09} lineWidth={1.5} />
    <Line points={[S, B]} color="#0f172a" lineWidth={2} /><Line points={[S, C]} color="#0f172a" lineWidth={2} />
    <Line points={[S, D]} color="#0f172a" lineWidth={2} />
    <Line points={[S, M]} color="#059669" lineWidth={2.5} /><Line points={[S, N]} color="#f59e0b" dashed={false} lineWidth={2} />
    <Line points={[M, N]} color={Math.abs(ratio - 0.5) < 0.005 ? "#059669" : "#7c3aed"} lineWidth={3} />
    {[["A", A], ["B", B], ["C", C], ["D", D], ["S", S], ["M", M], ["N", N]].map(([name, position]) =>
      <VertexLabel key={name as string} name={name as string} position={position as [number, number, number]} color={name === "M" ? "#059669" : name === "N" ? "#d97706" : undefined} />)}
  </>;
}

export default function LessonSpatialViewport({ ratio, zoom = 1 }: { ratio: number; zoom?: number }) {
  const [view, setView] = useState<{ name: View; version: number }>({ name: "default", version: 0 });
  const selectView = (name: View) => setView((current) => ({ name, version: current.version + 1 }));
  const ratioLabel = ratio === 0.5 ? "1:1" : `${(ratio / (1 - ratio)).toFixed(1)}:1`;
  return <section className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50" aria-label="Mô phỏng hình chóp S.ABCD">
    <div className="relative min-h-0 flex-1">
      <Canvas dpr={[1, 1.5]} camera={{ position: VIEWS.default, fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <color attach="background" args={["#f8fafc"]} />
        <PyramidScene ratio={ratio} /><CameraRig view={view} zoom={zoom} />
      </Canvas>
      <div className="absolute right-3 top-3 z-10 flex max-w-[88%] flex-wrap justify-end gap-1 rounded-xl border border-slate-200 bg-white/95 p-1 shadow-lg">
        <button type="button" onClick={() => selectView("default")} className="min-h-9 rounded-lg px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100">Đặt lại góc nhìn</button>
        <button type="button" onClick={() => selectView("top")} className="min-h-9 rounded-lg px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100">Mặt phẳng (Oxy)</button>
        <button type="button" onClick={() => selectView("front")} className="min-h-9 rounded-lg px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100">Nhìn ngang (Oxz)</button>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[10px] leading-4 text-slate-600 shadow">Kéo chuột trái để xoay · Lăn chuột để thu phóng<br />Chuột phải để di chuyển</div>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-3 py-2 text-xs">
      <span className="font-bold text-slate-700">Hình chóp S.ABCD · M là trung điểm SA</span><span className="font-semibold text-amber-700">SN:NB = {ratioLabel}</span>
    </div>
  </section>;
}
