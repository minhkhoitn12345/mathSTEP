"use client";

import { useRef } from "react";
import * as THREE from "three";

export type ARDisplayMode = "transparent" | "solid" | "wireframe";

type Props = {
  active: boolean;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  placementRef: React.RefObject<THREE.Group | null>;
  displayMode: ARDisplayMode;
  onDisplayModeChange: (mode: ARDisplayMode) => void;
  sectionRatio: number;
  onSectionRatioChange: (ratio: number) => void;
  showSectionControl: boolean;
  notice: string;
  onPlaceAhead: () => void;
  onExit: () => void;
};

const modes: { id: ARDisplayMode; label: string }[] = [
  { id: "transparent", label: "Trong suốt" },
  { id: "solid", label: "Khối kín" },
  { id: "wireframe", label: "Khung nét" },
];

export function AROverlay({ active, overlayRef, placementRef, displayMode, onDisplayModeChange, sectionRatio, onSectionRatioChange, showSectionControl, notice, onPlaceAhead, onExit }: Props) {
  const gesture = useRef<{ distance: number; scale: number; x: number } | null>(null);
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    const placement = placementRef.current;
    if (!placement || !touch) return;
    const distance = event.touches.length > 1
      ? Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY)
      : 0;
    gesture.current = { distance, scale: placement.scale.x, x: touch.clientX };
  };
  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const placement = placementRef.current;
    const start = gesture.current;
    if (!active || !placement || !start) return;
    event.preventDefault();
    if (event.touches.length > 1) {
      const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
      if (start.distance > 0) placement.scale.setScalar(THREE.MathUtils.clamp(start.scale * distance / start.distance, 0.03, 0.25));
    } else {
      placement.rotation.y += (event.touches[0].clientX - start.x) * 0.01;
      gesture.current = { ...start, x: event.touches[0].clientX };
    }
  };

  return <div
    ref={overlayRef}
    id="ar-dom-overlay"
    className={`fixed inset-0 z-[90] ${active ? "pointer-events-auto" : "pointer-events-none"}`}
    aria-label="Điều khiển thực tế tăng cường"
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={() => { gesture.current = null; }}
  >
    {active && <>
      <div className="pointer-events-none absolute inset-x-3 top-3 flex justify-end sm:inset-x-5 sm:top-5">
        <button type="button" onClick={onExit} className="pointer-events-auto min-h-11 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-xl">Thoát AR</button>
      </div>
      <section className="pointer-events-auto absolute inset-x-3 bottom-3 rounded-2xl border border-white/20 bg-slate-950/75 p-3 text-white shadow-2xl backdrop-blur-md sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[min(440px,calc(100vw-2.5rem))]">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1">
          {modes.map(mode => <button key={mode.id} type="button" aria-pressed={displayMode === mode.id} onClick={() => onDisplayModeChange(mode.id)} className={`min-h-10 rounded-lg px-2 text-xs font-bold ${displayMode === mode.id ? "bg-white text-slate-950" : "text-white/85"}`}>{mode.label}</button>)}
        </div>
        {showSectionControl && <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
          Thiết diện k
          <input aria-label="Tỉ số thiết diện k trong AR" type="range" min="0.05" max="0.95" step="0.01" value={sectionRatio} onChange={event => onSectionRatioChange(Number(event.target.value))} className="min-w-0 flex-1 accent-cyan-400"/>
          <span className="w-9 text-right tabular-nums">{sectionRatio.toFixed(2)}</span>
        </label>}
        <div className="mt-3 flex items-center justify-between gap-2">
          <p role="status" className="min-w-0 flex-1 text-[11px] leading-4 text-white/85">{notice || "Hướng camera vào mặt bàn để tìm vị trí đặt khối."}</p>
          <button type="button" onClick={onPlaceAhead} className="min-h-10 shrink-0 rounded-lg bg-white px-3 text-xs font-extrabold text-slate-950">Đặt 80cm</button>
        </div>
      </section>
    </>}
  </div>;
}
