"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export function FirstThreeFrame({ onReady }: { onReady: () => void }) {
  const reported = useRef(false);
  useFrame(() => {
    if (!reported.current) { reported.current = true; onReady(); }
  });
  return null;
}

export function ThreeSceneLoadingOverlay({ webglReady, frameReady }: { webglReady: boolean; frameReady: boolean }) {
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => { if (active) setFontReady(true); });
    return () => { active = false; };
  }, []);
  const percent = (webglReady ? 40 : 0) + (frameReady ? 40 : 0) + (fontReady ? 20 : 0);
  if (percent === 100) return null;
  return <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 text-white" role="status" aria-live="polite">
    <div className="w-56 space-y-2 text-center"><p className="text-xs font-semibold">Đang dựng mô hình 3D · {percent}%</p><div className="h-2 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${percent}%` }} /></div><p className="text-[10px] text-slate-300">WebGL · hình học · phông chữ</p></div>
  </div>;
}
