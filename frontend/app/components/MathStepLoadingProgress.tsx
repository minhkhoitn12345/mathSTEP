"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

export default function MathStepLoadingProgress() {
  const [assets, setAssets] = useState({ loaded: 0, total: 0 });
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    let active = true;
    const manager = THREE.DefaultLoadingManager;
    const previous = { onStart: manager.onStart, onProgress: manager.onProgress, onLoad: manager.onLoad, onError: manager.onError };
    manager.onStart = (url, loaded, total) => { previous.onStart?.(url, loaded, total); if (active) setAssets({ loaded, total }); };
    manager.onProgress = (url, loaded, total) => { previous.onProgress?.(url, loaded, total); if (active) setAssets({ loaded, total }); };
    manager.onLoad = () => { previous.onLoad?.(); if (active) setAssets((current) => ({ loaded: current.total, total: current.total })); };
    void document.fonts.ready.then(() => { if (active) setFontReady(true); });
    return () => { active = false; Object.assign(manager, previous); };
  }, []);
  const percent = assets.total > 0 ? Math.round(100 * assets.loaded / assets.total) : null;
  return <div className="min-h-screen flex items-center justify-center bg-slate-50" role="status" aria-live="polite">
    <div className="w-64 space-y-2 text-center">
      <p className="text-sm font-semibold text-slate-700">Đang chuẩn bị MathSTEP</p>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Tải tài nguyên mô hình" aria-valuenow={percent ?? undefined} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full bg-blue-600 transition-all ${percent === null ? "w-1/3 animate-pulse" : ""}`} style={percent === null ? undefined : { width: `${percent}%` }} />
      </div>
      <p className="text-xs text-slate-500">{percent === null ? "Đang khởi tạo hình học và WebGL…" : `Đã tải ${percent}% tài nguyên 3D`}{fontReady ? " · Phông chữ đã sẵn sàng" : " · Đang tải phông chữ"}</p>
    </div>
  </div>;
}
