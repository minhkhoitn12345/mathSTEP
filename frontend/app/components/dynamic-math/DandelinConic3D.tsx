"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import KatexMath from "../KatexMath";
import { FirstThreeFrame, ThreeSceneLoadingOverlay } from "../ThreeSceneLoading";
import { formatRadianToPi, snapToMilestone } from "../../lib/mathDisplay";

export default function DandelinConic3D({ beta, alpha, onBetaChange, onAlphaChange }: { beta: number; alpha: number; onBetaChange: (value: number) => void; onAlphaChange: (value: number) => void }) {
  const [showSpheres, setShowSpheres] = useState(true);
  const [webglReady, setWebglReady] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const animationRef = useRef<number | null>(null);
  useEffect(() => () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); }, []);
  const setView = (top: boolean) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    const from = controls.object.position.clone();
    const target = top ? new THREE.Vector3(0, 10, 0.01) : new THREE.Vector3(6, 4.8, 7);
    const began = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - began) / 500);
      controls.object.position.copy(from).lerp(target, t * t * (3 - 2 * t));
      controls.target.set(0, 2, 0);
      controls.update();
      animationRef.current = t < 1 ? requestAnimationFrame(frame) : null;
    };
    animationRef.current = requestAnimationFrame(frame);
  };
  const ellipse = alpha > beta && alpha < 90;
  const geometry = useMemo(() => {
    if (!ellipse) return null;
    const b = THREE.MathUtils.degToRad(beta);
    // The plane normal is complementary to the angle between plane and cone axis.
    const a = THREE.MathUtils.degToRad(90 - alpha);
    const h = 0.65;
    const points: [number, number, number][] = [];
    for (let index = 0; index <= 180; index++) {
      const theta = (index / 180) * Math.PI * 2;
      const denominator = Math.cos(a) / Math.tan(b) - Math.sin(a) * Math.cos(theta);
      const radius = h / denominator;
      points.push([radius * Math.cos(theta), 4 - radius / Math.tan(b), radius * Math.sin(theta)]);
    }
    const centers = [h / (Math.cos(a) - Math.sin(b)), h / (Math.cos(a) + Math.sin(b))].map((distance) => {
      const center: [number, number, number] = [0, 4 - distance, 0];
      const radius = distance * Math.sin(b);
      const planeNormal = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
      const planeDistance = 4 * Math.cos(a) - h;
      const signedDistance = planeNormal.dot(new THREE.Vector3(...center)) - planeDistance;
      const focus = new THREE.Vector3(...center).addScaledVector(planeNormal, -signedDistance).toArray() as [number, number, number];
      const generatorDistance = distance * Math.cos(b);
      const coneTouch = [generatorDistance * Math.sin(b), 4 - generatorDistance * Math.cos(b) ** 2, 0] as [number, number, number];
      return { position: center, radius, focus, coneTouch };
    });
    const planeNormal = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
    const planeDistance = 4 * Math.cos(a) - h;
    return {
      points,
      centers,
      planePosition: planeNormal.clone().multiplyScalar(planeDistance),
      planeQuaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), planeNormal),
      coneRadius: 4 * Math.tan(b),
    };
  }, [alpha, beta, ellipse]);
  const sectionCurves = useMemo(() => {
    const plane = THREE.MathUtils.degToRad(alpha);
    const cone = THREE.MathUtils.degToRad(beta);
    const curves: [number, number, number][][] = [];
    let current: [number, number, number][] = [];
    for (let index = 0; index <= 720; index++) {
      const theta = index * Math.PI / 360;
      const denominator = Math.sin(plane) / Math.tan(cone) - Math.cos(plane) * Math.cos(theta);
      const r = 0.65 / denominator;
      if (Math.abs(denominator) < 0.002 || Math.abs(r) > 4 * Math.tan(cone)) {
        if (current.length > 1) curves.push(current);
        current = [];
        continue;
      }
      current.push([r * Math.cos(theta), 4 - r / Math.tan(cone), r * Math.sin(theta)]);
    }
    if (current.length > 1) curves.push(current);
    return curves;
  }, [alpha, beta]);

  return <div className="w-full space-y-3">
    <div className="relative h-[420px] min-h-[55dvh] overflow-hidden rounded-2xl border border-slate-300 bg-slate-950 max-md:sticky max-md:top-0 max-md:z-20 max-md:h-[45dvh] max-md:min-h-0">
      <Canvas camera={{ position: [6, 4.8, 7], fov: 42 }} dpr={[1, 1.5]} onCreated={() => setWebglReady(true)}>
        <FirstThreeFrame onReady={() => setFrameReady(true)} />
        <color attach="background" args={["#0b1220"]} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 8, 5]} intensity={2} />
        <gridHelper args={[10, 20, "#64748b", "#334155"]} position={[0, -0.02, 0]} />
        <axesHelper args={[3]} />
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[geometry?.coneRadius ?? 1.86, 4, 64, 1, true]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 6, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[geometry?.coneRadius ?? 4 * Math.tan(THREE.MathUtils.degToRad(beta)), 4, 64, 1, true]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 4 - 0.65 / Math.sin(THREE.MathUtils.degToRad(alpha)), 0]} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.cos(THREE.MathUtils.degToRad(alpha)), Math.sin(THREE.MathUtils.degToRad(alpha)), 0))}>
          <planeGeometry args={[8, 8]} />
          <meshStandardMaterial color="#f97316" transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {sectionCurves.map((points, index) => <Line key={index} points={points} color="#fbbf24" lineWidth={3} />)}
        {geometry && showSpheres && alpha - beta >= 2 && geometry.centers.map((sphere, index) => <group key={index}>
          <group position={sphere.position}>
          <mesh><sphereGeometry args={[sphere.radius, 32, 24]} /><meshStandardMaterial color={index === 0 ? "#f472b6" : "#a78bfa"} transparent opacity={0.63} roughness={0.3} /></mesh>
          <Html center distanceFactor={9} style={{ pointerEvents: "none" }}><span className="rounded bg-slate-950/90 px-2 py-1 text-xs font-bold text-white">{index === 0 ? "D₁" : "D₂"}</span></Html>
          </group>
          <mesh position={sphere.focus}><sphereGeometry args={[0.065, 16, 12]} /><meshBasicMaterial color="#facc15" /></mesh>
          <Html position={sphere.focus} center distanceFactor={8} style={{ pointerEvents: "none" }}><span className="rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950">F{index + 1}</span></Html>
          <mesh position={sphere.coneTouch}><sphereGeometry args={[0.05, 12, 10]} /><meshBasicMaterial color="#22d3ee" /></mesh>
          <Html position={sphere.coneTouch} center distanceFactor={8} style={{ pointerEvents: "none" }}><span className="rounded bg-cyan-200 px-1 py-0.5 text-[10px] font-black text-slate-950">T{index + 1}</span></Html>
        </group>)}
        <Html position={[0, 4.25, 0]} center distanceFactor={9} style={{ pointerEvents: "none" }}><span className="rounded bg-slate-950/90 px-2 py-1 text-xs font-bold text-white">S</span></Html>
        <OrbitControls ref={controlsRef} makeDefault enableDamping target={[0, 2, 0]} />
      </Canvas>
      <ThreeSceneLoadingOverlay webglReady={webglReady} frameReady={frameReady} />
      <div className="absolute left-3 top-3 rounded-lg bg-slate-950/85 px-3 py-2 text-xs font-semibold text-white">Nón đôi · mặt phẳng cam · giao tuyến vàng{ellipse ? " · hai mặt cầu Dandelin" : ""}</div>
      {ellipse && <button type="button" aria-pressed={showSpheres} onClick={() => setShowSpheres((value) => !value)} className="absolute bottom-3 left-3 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900">{showSpheres ? "Ẩn hai mặt cầu" : "Hiện hai mặt cầu"}</button>}
      <div className="absolute bottom-3 right-3 flex gap-1 rounded-lg bg-slate-950/90 p-1"><button type="button" onClick={() => setView(false)} className="rounded bg-slate-800 px-2 py-1 text-xs text-white">Đặt lại góc nhìn</button><button type="button" onClick={() => setView(true)} className="rounded bg-slate-800 px-2 py-1 text-xs text-white">Nhìn từ trên</button></div>
      {!ellipse && <div className="absolute inset-x-3 bottom-14 rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-950">{alpha === beta ? "β = α: mặt phẳng song song với đường sinh, thiết diện là parabol." : alpha === 90 ? "β = 90°: mặt phẳng vuông góc trục nón, thiết diện là đường tròn." : "β < α: thiết diện là hypebol."}</div>}
    </div>
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-700">Góc nửa đỉnh nón α = {beta}° · <KatexMath math={formatRadianToPi(beta * Math.PI / 180)} /><input aria-label="Góc nửa đỉnh nón alpha" className="mt-2 w-full accent-sky-600" type="range" min="20" max="45" value={beta} onChange={(event) => onBetaChange(snapToMilestone(Number(event.target.value), [30, 45], 2))} /></label>
      <div className="text-xs font-semibold text-slate-700"><label>Góc giữa mặt phẳng và trục nón β = {alpha}° · <KatexMath math={formatRadianToPi(alpha * Math.PI / 180)} /><input aria-label="Góc mặt phẳng beta" className="mt-2 w-full accent-orange-600" type="range" min="10" max="90" value={alpha} onChange={(event) => onAlphaChange(snapToMilestone(Number(event.target.value), [30, 45, 60, 90, beta], 2))} /></label><div className="mt-2 flex gap-1"><button type="button" onClick={() => onAlphaChange(beta)} className="rounded-md border px-2 py-1">Parabol β=α</button><button type="button" onClick={() => onAlphaChange(Math.min(89, beta + 12))} className="rounded-md border px-2 py-1">Elip</button><button type="button" onClick={() => onAlphaChange(90)} className="rounded-md border px-2 py-1">Đường tròn</button></div></div>
      {ellipse && <div className="sm:col-span-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-semibold">Vì sao hai mặt cầu xác định hai tiêu điểm?</p>
        <p className="mt-1">Với điểm M trên elip, hai đường sinh qua M tiếp xúc với hai mặt cầu tại T₁, T₂. Tính chất hai tiếp tuyến xuất phát từ cùng một điểm cho độ dài bằng nhau:</p>
        <div className="mt-2"><KatexMath display math="MF_1=MT_1,\qquad MF_2=MT_2" /></div>
        <p className="mt-1">Vì T₁, M, T₂ cùng nằm trên một đường sinh nên tổng khoảng cách đến hai tiêu điểm không đổi:</p>
        <div className="mt-2"><KatexMath display math="MF_1+MF_2=MT_1+MT_2=T_1T_2=2a" /></div>
        <div className="mt-2"><KatexMath math="\alpha < \beta < 90^\circ,\qquad \text{thiết diện là elip}" /></div>
      </div>}
    </div>
  </div>;
}
