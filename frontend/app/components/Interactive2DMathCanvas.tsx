"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Magnet,
  Camera,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface BoundaryLine {
  id: string;
  name: string; // e.g. "d₁"
  equation: string; // e.g. "3x + 2y = 48"
  a: number;
  b: number;
  c: number;
  operator: "<=" | ">=" | "<" | ">";
  color?: string;
}

export interface PolygonVertex {
  label: string; // "O", "A", "B", "C"
  x: number;
  y: number;
}

export interface Interactive2DMathCanvasProps {
  lines: BoundaryLine[];
  vertices: PolygonVertex[];
  objectiveCoeffs?: { a: number; b: number }; // For F = ax + by
  objectiveValue?: number; // Current value of F
  onObjectiveValueChange?: (val: number) => void;
  objectiveRange?: { min: number; max: number; step: number };
  testPoint?: { x: number; y: number };
  onTestPointChange?: (pt: { x: number; y: number }) => void;
  isSgkMode?: boolean; // true: SGK KNTT (hatching non-feasible, white feasible), false: GeoGebra (color feasible)
  onToggleSgkMode?: () => void;
  visualCounterExample?: { x: number; y: number; text: string } | null;
  className?: string;
}

export default function Interactive2DMathCanvas({
  lines,
  vertices,
  objectiveCoeffs = { a: 3, b: 2 },
  objectiveValue = 24,
  onObjectiveValueChange,
  objectiveRange = { min: 0, max: 60, step: 1 },
  testPoint = { x: 2, y: 3 },
  onTestPointChange,
  isSgkMode = true,
  onToggleSgkMode,
  visualCounterExample = null,
  className = "",
}: Interactive2DMathCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport / Camera transform state
  // World coordinates range centered on the problem domain
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [hoveredVertex, setHoveredVertex] = useState<PolygonVertex | null>(null);
  const [isDraggingPoint, setIsDraggingPoint] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Local test point state for instant 60fps drag
  const [currentTestPt, setCurrentTestPt] = useState(testPoint);
  useEffect(() => {
    setCurrentTestPt(testPoint);
  }, [testPoint]);

  // Determine feasible status of currentTestPt
  const testPointStatus = useMemo(() => {
    if (!lines || lines.length === 0) return { isValid: true, details: [] };
    const details = lines.map((l) => {
      const val = l.a * currentTestPt.x + l.b * currentTestPt.y;
      let ok = false;
      if (l.operator === "<=") ok = val <= l.c + 1e-6;
      else if (l.operator === ">=") ok = val >= l.c - 1e-6;
      else if (l.operator === "<") ok = val < l.c;
      else if (l.operator === ">") ok = val > l.c;
      return { line: l, val, ok };
    });
    const isValid = details.every((d) => d.ok);
    return { isValid, details };
  }, [lines, currentTestPt]);

  // Calculate default bounding box of vertices to center properly
  // Optimized Viewport: Focus on Quadrant I [-1; 10] x [-1; 8]
  const initialBounds = useMemo(() => {
    return { minX: -1.2, maxX: 10.2, minY: -1.2, maxY: 8.2 };
  }, []);

  // Compute 1:1 Aspect Ratio scale and transformations
  const getTransform = useCallback(
    (w: number, h: number) => {
      const spanX = initialBounds.maxX - initialBounds.minX;
      const spanY = initialBounds.maxY - initialBounds.minY;

      // Lock 1:1 Aspect Ratio: 1 unit on Ox = 1 unit on Oy
      const baseScale = Math.min((w - 80) / spanX, (h - 80) / spanY);
      const scale = baseScale * zoom;

      // World origin in screen pixels
      const centerX = initialBounds.minX + spanX / 2;
      const centerY = initialBounds.minY + spanY / 2;

      const originScreenX = w / 2 - centerX * scale + pan.x;
      const originScreenY = h / 2 + centerY * scale + pan.y;

      const worldToScreen = (x: number, y: number): [number, number] => {
        return [originScreenX + x * scale, originScreenY - y * scale];
      };

      const screenToWorld = (sx: number, sy: number): [number, number] => {
        return [(sx - originScreenX) / scale, (originScreenY - sy) / scale];
      };

      // Visible world bounds
      const [vMinX, vMaxY] = screenToWorld(0, 0);
      const [vMaxX, vMinY] = screenToWorld(w, h);

      return {
        scale,
        originScreenX,
        originScreenY,
        worldToScreen,
        screenToWorld,
        viewport: { minX: vMinX, maxX: vMaxX, minY: vMinY, maxY: vMaxY },
      };
    },
    [initialBounds, zoom, pan]
  );

  // Compute infinite boundary line endpoints intersecting viewport bounds
  const getLineSegmentInViewport = useCallback(
    (line: BoundaryLine, vp: { minX: number; maxX: number; minY: number; maxY: number }) => {
      const { a, b, c } = line;
      const pts: [number, number][] = [];

      // Intersect with x = minX
      if (Math.abs(b) > 1e-8) {
        const y = (c - a * vp.minX) / b;
        if (y >= vp.minY - 1 && y <= vp.maxY + 1) pts.push([vp.minX, y]);
      }
      // Intersect with x = maxX
      if (Math.abs(b) > 1e-8) {
        const y = (c - a * vp.maxX) / b;
        if (y >= vp.minY - 1 && y <= vp.maxY + 1) pts.push([vp.maxX, y]);
      }
      // Intersect with y = minY
      if (Math.abs(a) > 1e-8) {
        const x = (c - b * vp.minY) / a;
        if (x >= vp.minX - 1 && x <= vp.maxX + 1) pts.push([x, vp.minY]);
      }
      // Intersect with y = maxY
      if (Math.abs(a) > 1e-8) {
        const x = (c - b * vp.maxY) / a;
        if (x >= vp.minX - 1 && x <= vp.maxX + 1) pts.push([x, vp.maxY]);
      }

      // Filter near-duplicates
      const uniquePts: [number, number][] = [];
      pts.forEach((p) => {
        const exists = uniquePts.some((u) => Math.hypot(u[0] - p[0], u[1] - p[1]) < 0.05);
        if (!exists) uniquePts.push(p);
      });

      return uniquePts.slice(0, 2);
    },
    []
  );

  // Render the entire Math 2D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Retina display support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const { scale, originScreenX, originScreenY, worldToScreen, viewport } = getTransform(w, h);

    // 1. Background
    ctx.fillStyle = "#F8FAFC"; // Ultra clean slate-50
    ctx.fillRect(0, 0, w, h);

    // 2. Dynamic LOD Grid
    if (showGrid) {
      let gridStep = 1;
      if (scale < 18) gridStep = 5;
      else if (scale < 32) gridStep = 2;
      else if (scale > 110) gridStep = 0.5;

      const firstX = Math.floor(viewport.minX / gridStep) * gridStep;
      const lastX = Math.ceil(viewport.maxX / gridStep) * gridStep;
      const firstY = Math.floor(viewport.minY / gridStep) * gridStep;
      const lastY = Math.ceil(viewport.maxY / gridStep) * gridStep;

      // Sub-grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#E2E8F0"; // Slate-200
      ctx.beginPath();
      for (let x = firstX; x <= lastX; x += gridStep) {
        const [sx] = worldToScreen(x, 0);
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, h);
      }
      for (let y = firstY; y <= lastY; y += gridStep) {
        const [, sy] = worldToScreen(0, y);
        ctx.moveTo(0, sy);
        ctx.lineTo(w, sy);
      }
      ctx.stroke();

      // Tick labels with halo
      ctx.font = "10px 'JetBrains Mono', ui-monospace, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (let x = firstX; x <= lastX; x += gridStep) {
        if (Math.abs(x) < 1e-4) continue;
        const [sx, sy] = worldToScreen(x, 0);
        if (sx < 15 || sx > w - 15) continue;
        const textY = Math.max(16, Math.min(h - 16, sy + 14));
        ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
        ctx.fillRect(sx - 10, textY - 6, 20, 12);
        ctx.fillStyle = "#64748B"; // Slate-500
        ctx.fillText(String(Math.round(x * 10) / 10), sx, textY);
      }

      for (let y = firstY; y <= lastY; y += gridStep) {
        if (Math.abs(y) < 1e-4) continue;
        const [sx, sy] = worldToScreen(0, y);
        if (sy < 15 || sy > h - 15) continue;
        const textX = Math.max(16, Math.min(w - 16, sx - 16));
        ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
        ctx.fillRect(textX - 10, sy - 6, 20, 12);
        ctx.fillStyle = "#64748B";
        ctx.fillText(String(Math.round(y * 10) / 10), textX, sy);
      }
    }

    // 3. Hatching / Miền nghiệm
    // Create diagonal hatching canvas pattern
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = 12;
    patternCanvas.height = 12;
    const pctx = patternCanvas.getContext("2d");
    if (pctx) {
      pctx.strokeStyle = "rgba(148, 163, 184, 0.4)"; // Slate-400 mờ trang nhã
      pctx.lineWidth = 1.4;
      pctx.beginPath();
      pctx.moveTo(0, 12);
      pctx.lineTo(12, 0);
      pctx.stroke();
    }
    const hatchPattern = ctx.createPattern(patternCanvas, "repeat");

    if (isSgkMode) {
      // SGK KNTT: Gạch sọc trên toàn bộ màn hình NGOẠI TRỪ miền nghiệm OABC (giữ trắng sáng)
      if (vertices.length >= 3 && hatchPattern) {
        ctx.save();
        // 1) Fill entire screen with hatching
        ctx.fillStyle = hatchPattern;
        ctx.fillRect(0, 0, w, h);

        // 2) Cut out the feasible polygon (clip & clear to pure white)
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        vertices.forEach((v, idx) => {
          const [sx, sy] = worldToScreen(v.x, v.y);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fill();

        // 3) Restore to draw clean white fill with soft glow
        ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();

        // Stroke feasible polygon boundary
        ctx.save();
        ctx.beginPath();
        vertices.forEach((v, idx) => {
          const [sx, sy] = worldToScreen(v.x, v.y);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.strokeStyle = "#0D9488"; // Emerald-600
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = "rgba(13, 148, 136, 0.06)";
        ctx.fill();
        ctx.restore();
      }
    } else {
      // GeoGebra Mode: Tô màu vùng nghiệm, giữ trắng vùng ngoài
      if (vertices.length >= 3) {
        ctx.save();
        ctx.beginPath();
        vertices.forEach((v, idx) => {
          const [sx, sy] = worldToScreen(v.x, v.y);
          if (idx === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(13, 148, 136, 0.25)"; // Teal fill
        ctx.fill();
        ctx.strokeStyle = "#0F766E";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 4. Ox & Oy Axes with Direction Arrows & Origin "O"
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#334155"; // Slate-700
    ctx.beginPath();
    // Ox Axis
    ctx.moveTo(0, originScreenY);
    ctx.lineTo(w, originScreenY);
    // Oy Axis
    ctx.moveTo(originScreenX, h);
    ctx.lineTo(originScreenX, 0);
    ctx.stroke();

    // Arrow on Ox
    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.moveTo(w - 2, originScreenY);
    ctx.lineTo(w - 12, originScreenY - 5);
    ctx.lineTo(w - 12, originScreenY + 5);
    ctx.closePath();
    ctx.fill();

    // Arrow on Oy
    ctx.beginPath();
    ctx.moveTo(originScreenX, 2);
    ctx.lineTo(originScreenX - 5, 12);
    ctx.lineTo(originScreenX + 5, 12);
    ctx.closePath();
    ctx.fill();

    // Axis Labels with Halo
    ctx.font = "bold 13px 'Computer Modern', 'KaTeX_Math', sans-serif";
    ctx.fillStyle = "#0F172A";

    // "x"
    ctx.fillText("x", w - 20, originScreenY + 16);
    // "y"
    ctx.fillText("y", originScreenX + 16, 18);
    // "O"
    ctx.fillText("O", originScreenX - 14, originScreenY + 16);

    // 5. Draw Infinite Boundary Lines
    lines.forEach((line) => {
      const seg = getLineSegmentInViewport(line, viewport);
      if (seg.length < 2) return;

      const [p1, p2] = seg;
      const [s1x, s1y] = worldToScreen(p1[0], p1[1]);
      const [s2x, s2y] = worldToScreen(p2[0], p2[1]);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s1x, s1y);
      ctx.lineTo(s2x, s2y);

      // Line style: Solid for <= / >=, Dashed for < / >
      if (line.operator === "<" || line.operator === ">") {
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2.0;
      } else {
        ctx.setLineDash([]);
        ctx.lineWidth = 2.5;
      }
      ctx.strokeStyle = line.color || "#4F46E5"; // Indigo-600
      ctx.stroke();

      // Label along the line with halo background
      const midX = (s1x + s2x) / 2;
      const midY = (s1y + s2y) / 2;
      const text = `${line.name}: ${line.equation}`;
      ctx.font = "bold 11px 'JetBrains Mono', sans-serif";
      const textWidth = ctx.measureText(text).width;

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 4;
      ctx.fillRect(midX - textWidth / 2 - 4, midY - 14, textWidth + 8, 18);
      ctx.shadowBlur = 0;

      ctx.fillStyle = line.color || "#312E81";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, midX, midY - 5);
      ctx.restore();
    });

    // 6. Objective Function Level Line: F = ax + by
    if (objectiveCoeffs && typeof objectiveValue === "number") {
      const objLine: BoundaryLine = {
        id: "obj_line",
        name: "d_F",
        equation: `${objectiveCoeffs.a}x + ${objectiveCoeffs.b}y = ${objectiveValue}`,
        a: objectiveCoeffs.a,
        b: objectiveCoeffs.b,
        c: objectiveValue,
        operator: "<=",
        color: "#F59E0B", // Amber-500
      };
      const seg = getLineSegmentInViewport(objLine, viewport);
      if (seg.length >= 2) {
        const [s1x, s1y] = worldToScreen(seg[0][0], seg[0][1]);
        const [s2x, s2y] = worldToScreen(seg[1][0], seg[1][1]);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(s1x, s1y);
        ctx.lineTo(s2x, s2y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#F59E0B";
        ctx.stroke();

        // 1) Normal vector n = (a, b) from Origin O(0, 0)
        const [oSx, oSy] = worldToScreen(0, 0);
        const [nSx, nSy] = worldToScreen(objectiveCoeffs.a, objectiveCoeffs.b);

        ctx.beginPath();
        ctx.moveTo(oSx, oSy);
        ctx.lineTo(nSx, nSy);
        ctx.strokeStyle = "#4338CA"; // Indigo-700
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Arrow head at (a, b)
        const angleO = Math.atan2(nSy - oSy, nSx - oSx);
        ctx.fillStyle = "#4338CA";
        ctx.beginPath();
        ctx.moveTo(nSx, nSy);
        ctx.lineTo(nSx - 10 * Math.cos(angleO - Math.PI / 6), nSy - 10 * Math.sin(angleO - Math.PI / 6));
        ctx.lineTo(nSx - 10 * Math.cos(angleO + Math.PI / 6), nSy - 10 * Math.sin(angleO + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Label n = (a, b) at O
        const nLabel = `n = (${objectiveCoeffs.a}; ${objectiveCoeffs.b})`;
        ctx.font = "bold 11px 'JetBrains Mono', sans-serif";
        const nW = ctx.measureText(nLabel).width;
        ctx.fillStyle = "rgba(238, 242, 255, 0.95)";
        ctx.strokeStyle = "#4338CA";
        ctx.lineWidth = 1;
        ctx.fillRect(nSx + 6, nSy - 16, nW + 8, 18);
        ctx.strokeRect(nSx + 6, nSy - 16, nW + 8, 18);
        ctx.fillStyle = "#312E81";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(nLabel, nSx + 10, nSy - 7);

        // 2) Direction arrow along d_F showing parallel translation
        const midWorldX = (seg[0][0] + seg[1][0]) / 2;
        const midWorldY = (seg[0][1] + seg[1][1]) / 2;
        const len = Math.hypot(objectiveCoeffs.a, objectiveCoeffs.b) || 1;
        const normX = (objectiveCoeffs.a / len) * 1.6;
        const normY = (objectiveCoeffs.b / len) * 1.6;

        const [midSx, midSy] = worldToScreen(midWorldX, midWorldY);
        const [normSx, normSy] = worldToScreen(midWorldX + normX, midWorldY + normY);

        ctx.beginPath();
        ctx.moveTo(midSx, midSy);
        ctx.lineTo(normSx, normSy);
        ctx.strokeStyle = "#D97706";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Normal arrow head on d_F
        ctx.fillStyle = "#D97706";
        const angle = Math.atan2(normSy - midSy, normSx - midSx);
        ctx.beginPath();
        ctx.moveTo(normSx, normSy);
        ctx.lineTo(normSx - 8 * Math.cos(angle - Math.PI / 6), normSy - 8 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(normSx - 8 * Math.cos(angle + Math.PI / 6), normSy - 8 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();

        // Label F
        const labelF = `d_F: F = ${objectiveValue}`;
        ctx.font = "bold 11px 'JetBrains Mono', sans-serif";
        const wF = ctx.measureText(labelF).width;
        ctx.fillStyle = "#FEF3C7"; // Amber-100
        ctx.strokeStyle = "#D97706";
        ctx.lineWidth = 1;
        ctx.fillRect(midSx - wF / 2 - 4, midSy - 24, wF + 8, 18);
        ctx.strokeRect(midSx - wF / 2 - 4, midSy - 24, wF + 8, 18);
        ctx.fillStyle = "#92400E";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labelF, midSx, midSy - 15);
        ctx.restore();
      }
    }

    // 7. Polygon Vertices (O, A, B, C)
    vertices.forEach((v) => {
      const [sx, sy] = worldToScreen(v.x, v.y);
      const isHov = hoveredVertex?.label === v.label;

      ctx.save();
      // Outer glow ring
      ctx.beginPath();
      ctx.arc(sx, sy, isHov ? 10 : 7, 0, Math.PI * 2);
      ctx.fillStyle = isHov ? "rgba(13, 148, 136, 0.35)" : "rgba(13, 148, 136, 0.18)";
      ctx.fill();

      // Inner solid dot
      ctx.beginPath();
      ctx.arc(sx, sy, isHov ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = "#0F766E"; // Emerald-700
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Vertex label
      ctx.font = "bold 12px 'Computer Modern', serif";
      ctx.fillStyle = "#0F172A";
      ctx.textAlign = "left";
      ctx.fillText(v.label, sx + 8, sy - 8);

      // Hover Tooltip with scale bounce
      if (isHov) {
        const tipText = `${v.label}(${v.x}; ${v.y})`;
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        const tipW = ctx.measureText(tipText).width;
        ctx.fillStyle = "#0F172A";
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 8;
        ctx.fillRect(sx - tipW / 2 - 6, sy - 36, tipW + 12, 22);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#38BDF8";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tipText, sx, sy - 25);
      }
      ctx.restore();
    });

    // 8. Mobile Test Point M₀(x₀, y₀)
    const [mSx, mSy] = worldToScreen(currentTestPt.x, currentTestPt.y);
    const isTestValid = testPointStatus.isValid;

    ctx.save();
    // Halo ring
    ctx.beginPath();
    ctx.arc(mSx, mSy, isDraggingPoint ? 14 : 10, 0, Math.PI * 2);
    ctx.fillStyle = isTestValid ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
    ctx.fill();

    // Center handle
    ctx.beginPath();
    ctx.arc(mSx, mSy, isDraggingPoint ? 7 : 5, 0, Math.PI * 2);
    ctx.fillStyle = isTestValid ? "#10B981" : "#EF4444";
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label M₀
    const mLabel = `M₀(${Math.round(currentTestPt.x * 10) / 10}; ${Math.round(currentTestPt.y * 10) / 10})`;
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    const mW = ctx.measureText(mLabel).width;

    ctx.fillStyle = isTestValid ? "#064E3B" : "#7F1D1D";
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 6;
    ctx.fillRect(mSx + 12, mSy - 18, mW + 12, 22);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(mLabel, mSx + 18, mSy - 7);

    // Mini status badge below M₀
    const statusText = isTestValid ? "✓ THỎA MÃN" : "✕ KHÔNG THỎA MÃN";
    ctx.font = "bold 9px sans-serif";
    ctx.fillStyle = isTestValid ? "#10B981" : "#EF4444";
    ctx.fillText(statusText, mSx + 18, mSy + 10);
    ctx.restore();

    // 9. Visual Counter-Example Red Pin P(1, 0)
    if (visualCounterExample) {
      const [pSx, pSy] = worldToScreen(visualCounterExample.x, visualCounterExample.y);
      ctx.save();
      // Pulsing red halo
      ctx.beginPath();
      ctx.arc(pSx, pSy, 12, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 38, 38, 0.3)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pSx, pSy, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#DC2626";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculation card
      const cText = visualCounterExample.text;
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      const cW = ctx.measureText(cText).width;
      ctx.fillStyle = "#7F1D1D";
      ctx.shadowColor = "rgba(220, 38, 38, 0.4)";
      ctx.shadowBlur = 8;
      ctx.fillRect(pSx - cW / 2 - 8, pSy - 34, cW + 16, 22);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#FCA5A5";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cText, pSx, pSy - 23);
      ctx.restore();
    }

    ctx.restore();
  }, [
    lines,
    vertices,
    objectiveCoeffs,
    objectiveValue,
    currentTestPt,
    testPointStatus,
    hoveredVertex,
    isDraggingPoint,
    isSgkMode,
    visualCounterExample,
    showGrid,
    getTransform,
    getLineSegmentInViewport,
  ]);

  // Pointer / Mouse interaction handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { worldToScreen } = getTransform(rect.width, rect.height);
    const [mSx, mSy] = worldToScreen(currentTestPt.x, currentTestPt.y);

    // Hit test M₀ point (radius 20px for mobile touch)
    if (Math.hypot(sx - mSx, sy - mSy) <= 22) {
      setIsDraggingPoint(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Otherwise initiate canvas pan
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const { worldToScreen, screenToWorld } = getTransform(rect.width, rect.height);

    if (isDraggingPoint) {
      let [wx, wy] = screenToWorld(sx, sy);
      // Snap to integer if near integer (< 0.22)
      if (snapToGrid) {
        const roundX = Math.round(wx);
        const roundY = Math.round(wy);
        if (Math.abs(wx - roundX) < 0.22) wx = roundX;
        if (Math.abs(wy - roundY) < 0.22) wy = roundY;
      }
      const newPt = { x: Math.round(wx * 10) / 10, y: Math.round(wy * 10) / 10 };
      setCurrentTestPt(newPt);
      if (onTestPointChange) onTestPointChange(newPt);
      return;
    }

    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      return;
    }

    // Hover detection for vertices
    let foundHov: PolygonVertex | null = null;
    vertices.forEach((v) => {
      const [vsx, vsy] = worldToScreen(v.x, v.y);
      if (Math.hypot(sx - vsx, sy - vsy) <= 12) foundHov = v;
    });
    setHoveredVertex(foundHov);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDraggingPoint(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.4, Math.min(4.0, z * factor)));
  };

  // Reset view to default
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Export high-res PNG image for reports
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `MathSTEP_2D_Oxy_${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-slate-900 select-none overflow-hidden rounded-xl border border-slate-700 shadow-2xl ${className}`}
    >
      {/* Top Banner Toolbar: Thông tin & Chế độ SGK */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ trục Oxy tỷ lệ 1:1</span>
          </div>

          <button
            onClick={onToggleSgkMode}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-lg ${
              isSgkMode
                ? "bg-emerald-950/70 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900/80"
                : "bg-cyan-950/70 border-cyan-500/80 text-cyan-300 hover:bg-cyan-900/80"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isSgkMode ? "Quy ước: Gạch miền loại (SGK KNTT)" : "Chế độ: Tô màu miền nghiệm (GeoGebra)"}</span>
          </button>
        </div>

        {/* Live Test Point Card */}
        <div className="pointer-events-auto px-3 py-1.5 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-mono flex items-center gap-2 text-slate-200 shadow-lg">
          {testPointStatus.isValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>
            M₀({currentTestPt.x}; {currentTestPt.y}):{" "}
            {testPointStatus.isValid ? (
              <strong className="text-emerald-400 font-bold">Thỏa mãn hệ</strong>
            ) : (
              <strong className="text-red-400 font-bold">Bị loại bỏ</strong>
            )}
          </span>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair touch-none"
      />

      {/* Level Line Slider Bar: F = ax + by */}
      {objectiveCoeffs && onObjectiveValueChange && (
        <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-amber-500/40 shadow-xl flex items-center gap-3">
          <Sliders className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-amber-300">
                Đường mức d_F: {objectiveCoeffs.a}x + {objectiveCoeffs.b}y = {objectiveValue}
              </span>
              <span className="font-mono text-amber-400 font-bold text-sm">{objectiveValue}</span>
            </div>
            <input
              type="range"
              min={objectiveRange.min}
              max={objectiveRange.max}
              step={objectiveRange.step}
              value={objectiveValue}
              onChange={(e) => onObjectiveValueChange(Number(e.target.value))}
              className="w-48 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 mt-1.5"
            />
          </div>
        </div>
      )}

      {/* Floating Glassmorphism Toolbar (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={() => setZoom((z) => Math.min(4.0, z * 1.2))}
          title="Phóng to (+)"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z / 1.2))}
          title="Thu nhỏ (-)"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset góc nhìn về tâm O"
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />
        <button
          onClick={() => setShowGrid((g) => !g)}
          title="Bật/Tắt Lưới tọa độ"
          className={`p-2 rounded-lg transition-colors ${
            showGrid ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSnapToGrid((s) => !s)}
          title="Bật/Tắt Nam châm điểm nguyên (Snap Grid)"
          className={`p-2 rounded-lg transition-colors ${
            snapToGrid ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Magnet className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-700 mx-0.5" />
        <button
          onClick={handleExportPNG}
          title="Chụp ảnh đồ thị chất lượng cao (Export PNG)"
          className="p-2 hover:bg-emerald-900/60 rounded-lg text-emerald-400 hover:text-emerald-200 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
