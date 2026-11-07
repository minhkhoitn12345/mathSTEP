"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Magnet,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";
import KatexMath, { formatVNFloat } from "./KatexMath";

export interface TrigonometricCircleCanvasProps {
  angleDeg?: number; // Góc quay alpha (độ): 0 đến 360
  onAngleChange?: (angle: number) => void;
  showTanCot?: boolean;
  onToggleTanCot?: () => void;
  className?: string;
}

// Bảng giá trị đặc biệt chuẩn SGK Toán 11
interface SpecialAngleData {
  deg: number;
  radLatex: string;
  cosLatex: string;
  cosVal: number;
  sinLatex: string;
  sinVal: number;
  tanLatex: string;
  cotLatex: string;
}

export const SPECIAL_ANGLES: Record<number, SpecialAngleData> = {
  0: { deg: 0, radLatex: "0", cosLatex: "1", cosVal: 1, sinLatex: "0", sinVal: 0, tanLatex: "0", cotLatex: "\\text{kxđ}" },
  30: { deg: 30, radLatex: "\\frac{\\pi}{6}", cosLatex: "\\frac{\\sqrt{3}}{2}", cosVal: Math.sqrt(3) / 2, sinLatex: "\\frac{1}{2}", sinVal: 0.5, tanLatex: "\\frac{\\sqrt{3}}{3}", cotLatex: "\\sqrt{3}" },
  45: { deg: 45, radLatex: "\\frac{\\pi}{4}", cosLatex: "\\frac{\\sqrt{2}}{2}", cosVal: Math.SQRT2 / 2, sinLatex: "\\frac{\\sqrt{2}}{2}", sinVal: Math.SQRT2 / 2, tanLatex: "1", cotLatex: "1" },
  60: { deg: 60, radLatex: "\\frac{\\pi}{3}", cosLatex: "\\frac{1}{2}", cosVal: 0.5, sinLatex: "\\frac{\\sqrt{3}}{2}", sinVal: Math.sqrt(3) / 2, tanLatex: "\\sqrt{3}", cotLatex: "\\frac{\\sqrt{3}}{3}" },
  90: { deg: 90, radLatex: "\\frac{\\pi}{2}", cosLatex: "0", cosVal: 0, sinLatex: "1", sinVal: 1, tanLatex: "\\text{kxđ}", cotLatex: "0" },
  120: { deg: 120, radLatex: "\\frac{2\\pi}{3}", cosLatex: "-\\frac{1}{2}", cosVal: -0.5, sinLatex: "\\frac{\\sqrt{3}}{2}", sinVal: Math.sqrt(3) / 2, tanLatex: "-\\sqrt{3}", cotLatex: "-\\frac{\\sqrt{3}}{3}" },
  135: { deg: 135, radLatex: "\\frac{3\\pi}{4}", cosLatex: "-\\frac{\\sqrt{2}}{2}", cosVal: -Math.SQRT2 / 2, sinLatex: "\\frac{\\sqrt{2}}{2}", sinVal: Math.SQRT2 / 2, tanLatex: "-1", cotLatex: "-1" },
  150: { deg: 150, radLatex: "\\frac{5\\pi}{6}", cosLatex: "-\\frac{\\sqrt{3}}{2}", cosVal: -Math.sqrt(3) / 2, sinLatex: "\\frac{1}{2}", sinVal: 0.5, tanLatex: "-\\frac{\\sqrt{3}}{3}", cotLatex: "-\\sqrt{3}" },
  180: { deg: 180, radLatex: "\\pi", cosLatex: "-1", cosVal: -1, sinLatex: "0", sinVal: 0, tanLatex: "0", cotLatex: "\\text{kxđ}" },
  210: { deg: 210, radLatex: "\\frac{7\\pi}{6}", cosLatex: "-\\frac{\\sqrt{3}}{2}", cosVal: -Math.sqrt(3) / 2, sinLatex: "-\\frac{1}{2}", sinVal: -0.5, tanLatex: "\\frac{\\sqrt{3}}{3}", cotLatex: "\\sqrt{3}" },
  225: { deg: 225, radLatex: "\\frac{5\\pi}{4}", cosLatex: "-\\frac{\\sqrt{2}}{2}", cosVal: -Math.SQRT2 / 2, sinLatex: "-\\frac{\\sqrt{2}}{2}", sinVal: -Math.SQRT2 / 2, tanLatex: "1", cotLatex: "1" },
  240: { deg: 240, radLatex: "\\frac{4\\pi}{3}", cosLatex: "-\\frac{1}{2}", cosVal: -0.5, sinLatex: "-\\frac{\\sqrt{3}}{2}", sinVal: -Math.sqrt(3) / 2, tanLatex: "\\sqrt{3}", cotLatex: "\\frac{\\sqrt{3}}{3}" },
  270: { deg: 270, radLatex: "\\frac{3\\pi}{2}", cosLatex: "0", cosVal: 0, sinLatex: "-1", sinVal: -1, tanLatex: "\\text{kxđ}", cotLatex: "0" },
  300: { deg: 300, radLatex: "\\frac{5\\pi}{3}", cosLatex: "\\frac{1}{2}", cosVal: 0.5, sinLatex: "-\\frac{\\sqrt{3}}{2}", sinVal: -Math.sqrt(3) / 2, tanLatex: "-\\sqrt{3}", cotLatex: "-\\frac{\\sqrt{3}}{3}" },
  315: { deg: 315, radLatex: "\\frac{7\\pi}{4}", cosLatex: "\\frac{\\sqrt{2}}{2}", cosVal: Math.SQRT2 / 2, sinLatex: "-\\frac{\\sqrt{2}}{2}", sinVal: -Math.SQRT2 / 2, tanLatex: "-1", cotLatex: "-1" },
  330: { deg: 330, radLatex: "\\frac{11\\pi}{6}", cosLatex: "\\frac{\\sqrt{3}}{2}", cosVal: Math.sqrt(3) / 2, sinLatex: "-\\frac{1}{2}", sinVal: -0.5, tanLatex: "-\\frac{\\sqrt{3}}{3}", cotLatex: "-\\sqrt{3}" },
  360: { deg: 360, radLatex: "2\\pi", cosLatex: "1", cosVal: 1, sinLatex: "0", sinVal: 0, tanLatex: "0", cotLatex: "\\text{kxđ}" },
};

export default function TrigonometricCircleCanvas({
  angleDeg = 60,
  onAngleChange,
  showTanCot: initialShowTanCot = false,
  onToggleTanCot,
  className = "",
}: TrigonometricCircleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [currentAngle, setCurrentAngle] = useState<number>(angleDeg);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [snapToSpecial, setSnapToSpecial] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showTanCotInternal, setShowTanCotInternal] = useState<boolean>(initialShowTanCot);

  const showTanCot = onToggleTanCot ? initialShowTanCot : showTanCotInternal;

  useEffect(() => {
    setCurrentAngle(angleDeg);
  }, [angleDeg]);

  // Xác định góc phần tư
  const quadrantInfo = useMemo(() => {
    const a = ((currentAngle % 360) + 360) % 360;
    if (a > 0 && a < 90) {
      return { num: 1, label: "Góc phần tư I", cosSign: "+", sinSign: "+", desc: "cos α > 0, sin α > 0" };
    }
    if (a > 90 && a < 180) {
      return { num: 2, label: "Góc phần tư II", cosSign: "-", sinSign: "+", desc: "cos α < 0, sin α > 0" };
    }
    if (a > 180 && a < 270) {
      return { num: 3, label: "Góc phần tư III", cosSign: "-", sinSign: "-", desc: "cos α < 0, sin α < 0" };
    }
    if (a > 270 && a < 360) {
      return { num: 4, label: "Góc phần tư IV", cosSign: "+", sinSign: "-", desc: "cos α > 0, sin α < 0" };
    }
    return { num: 0, label: "Nằm trên trục tọa độ", cosSign: "", sinSign: "", desc: "Điểm biên đặc biệt" };
  }, [currentAngle]);

  // Giá trị lượng giác thời gian thực
  const rad = useMemo(() => (currentAngle * Math.PI) / 180, [currentAngle]);
  const cosVal = useMemo(() => Math.cos(rad), [rad]);
  const sinVal = useMemo(() => Math.sin(rad), [rad]);

  // Kiểm tra góc đặc biệt gần nhất
  const nearestSpecial = useMemo(() => {
    const a = Math.round(currentAngle);
    return SPECIAL_ANGLES[a] || null;
  }, [currentAngle]);

  // Vẽ Canvas 60fps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina HD Canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Bán kính cơ bản của đường tròn đơn vị R = 1 (World scale)
    const baseRadius = Math.min(w, h) * 0.32;
    const R = baseRadius * zoom;

    // Tâm O trên màn hình
    const ox = w / 2 + pan.x;
    const oy = h / 2 + pan.y;

    // 1. Vẽ Lưới tọa độ phụ (Grid) nếu bật
    if (showGrid) {
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      const step = R * 0.5; // mỗi 0.5 đơn vị
      const startX = ((ox % step) + step) % step;
      for (let x = startX; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      const startY = ((oy % step) + step) % step;
      for (let y = startY; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // 2. Highlight vùng Góc Phần Tư hiện tại (Soft Glow)
    if (quadrantInfo.num > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(13, 148, 136, 0.05)";
      if (quadrantInfo.num === 1) ctx.fillRect(ox, 0, w - ox, oy);
      else if (quadrantInfo.num === 2) ctx.fillRect(0, 0, ox, oy);
      else if (quadrantInfo.num === 3) ctx.fillRect(0, oy, ox, h - oy);
      else if (quadrantInfo.num === 4) ctx.fillRect(ox, oy, w - ox, h - oy);
      ctx.restore();
    }

    // 3. Đường tròn đơn vị R = 1
    ctx.save();
    ctx.beginPath();
    ctx.arc(ox, oy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "#0d9488"; // Teal-600
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vùng trong đường tròn sáng nhẹ
    ctx.fillStyle = "rgba(13, 148, 136, 0.03)";
    ctx.fill();
    ctx.restore();

    // 4. Trục hoành Ox: TRỤC COSIN (cos α)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mũi tên trục Ox
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(w - 2, oy);
    ctx.lineTo(w - 12, oy - 5);
    ctx.lineTo(w - 12, oy + 5);
    ctx.closePath();
    ctx.fill();

    // Nhãn Trục Cosin (Ox)
    ctx.font = "bold 13px 'Computer Modern', serif";
    ctx.fillStyle = "#38bdf8"; // Sky-400
    ctx.fillText("Trục Cosin (x)", w - 95, oy + 20);
    ctx.restore();

    // 5. Trục tung Oy: TRỤC SIN (sin α)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, h);
    ctx.lineTo(ox, 0);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mũi tên trục Oy
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.moveTo(ox, 2);
    ctx.lineTo(ox - 5, 12);
    ctx.lineTo(ox + 5, 12);
    ctx.closePath();
    ctx.fill();

    // Nhãn Trục Sin (Oy)
    ctx.font = "bold 13px 'Computer Modern', serif";
    ctx.fillStyle = "#f43f5e"; // Rose-500
    ctx.fillText("Trục Sin (y)", ox + 14, 20);
    ctx.restore();

    // 6. Gốc tọa độ O và các điểm mút biên 1, -1
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText("O", ox - 14, oy + 14);

    // Điểm mút 1 và -1 trên Ox
    ctx.fillText("1", ox + R - 4, oy + 16);
    ctx.fillText("-1", ox - R - 14, oy + 16);

    // Điểm mút 1 và -1 trên Oy
    ctx.fillText("1", ox + 8, oy - R + 4);
    ctx.fillText("-1", ox + 8, oy + R + 4);

    // Điểm gốc A(1; 0)
    ctx.beginPath();
    ctx.arc(ox + R, oy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#10b981";
    ctx.fill();
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#34d399";
    ctx.fillText("A(1; 0) [Gốc]", ox + R + 8, oy - 6);

    // 7. Cung góc quay alpha (Chiều dương ngược chiều kim đồng hồ)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.arc(ox, oy, Math.min(R * 0.32, 50), 0, -rad, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
    ctx.fill();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Mũi tên định hướng trên cung góc
    const midAngle = -rad / 2;
    const arcR = Math.min(R * 0.32, 50);
    const arrowX = ox + arcR * Math.cos(midAngle);
    const arrowY = oy + arcR * Math.sin(midAngle);
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(arrowX, arrowY, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Tọa độ điểm M(x, y) trên màn hình
    const mx = ox + R * cosVal;
    const my = oy - R * sinVal;

    // Tọa độ hình chiếu H(cos, 0) và K(0, sin)
    const hx = mx;
    const hy = oy;
    const kx = ox;
    const ky = my;

    // 9. ĐOẠN COS TRÊN TRỤC HOÀNH (MÀU CYAN NỔI BẬT)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = "#38bdf8"; // Sky-400
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Vệt sáng Glow cho đoạn Cos
    ctx.shadowColor = "rgba(56, 189, 248, 0.6)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 10. ĐOẠN SIN TRÊN TRỤC TUNG (MÀU ROSE NỔI BẬT)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(kx, ky);
    ctx.strokeStyle = "#f43f5e"; // Rose-500
    ctx.lineWidth = 5.5;
    ctx.lineCap = "round";
    ctx.stroke();

    // Vệt sáng Glow cho đoạn Sin
    ctx.shadowColor = "rgba(244, 63, 94, 0.6)";
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 11. Các đường dóng vuông góc nét đứt từ M đến H và K
    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;

    // Dóng từ M xuống H (cos)
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    // Dóng từ M sang K (sin)
    ctx.strokeStyle = "#f43f5e";
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(kx, ky);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 12. Ký hiệu góc vuông tại điểm H và K
    ctx.save();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    const sq = 8;
    // Góc vuông tại H
    const signY = sinVal >= 0 ? -1 : 1;
    const signX = cosVal >= 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy + signY * sq);
    ctx.lineTo(hx + signX * sq, hy + signY * sq);
    ctx.lineTo(hx + signX * sq, hy);
    ctx.stroke();

    // Góc vuông tại K
    ctx.beginPath();
    ctx.moveTo(kx + (-signX) * sq, ky);
    ctx.lineTo(kx + (-signX) * sq, ky + (-signY) * sq);
    ctx.lineTo(kx, ky + (-signY) * sq);
    ctx.stroke();
    ctx.restore();

    // 13. Đoạn bán kính OM (Màu hổ phách Amber)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // 14. Điểm hình chiếu H và K
    // Điểm H(cos, 0)
    ctx.beginPath();
    ctx.arc(hx, hy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Điểm K(0, sin)
    ctx.beginPath();
    ctx.arc(kx, ky, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#f43f5e";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Nhãn điểm H và K
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`H(cos α)`, hx - 22, hy + (sinVal >= 0 ? 18 : -10));

    ctx.fillStyle = "#f43f5e";
    ctx.fillText(`K(sin α)`, kx + (cosVal >= 0 ? -60 : 12), ky + 4);

    // 15. Trục Tan & Cot (Nếu bật)
    if (showTanCot) {
      // Trục Tan: x = 1 (tiếp tuyến tại A)
      const tanLineX = ox + R;
      ctx.save();
      ctx.strokeStyle = "#a855f7"; // Purple-500
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tanLineX, 0);
      ctx.lineTo(tanLineX, h);
      ctx.stroke();

      // Điểm cắt T(1, tan α)
      if (Math.abs(cosVal) > 0.05) {
        const tanVal = sinVal / cosVal;
        const ty = oy - R * tanVal;
        if (ty >= 0 && ty <= h) {
          // Đoạn Tan từ A đến T
          ctx.strokeStyle = "#c084fc";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(tanLineX, oy);
          ctx.lineTo(tanLineX, ty);
          ctx.stroke();

          // Tia OM kéo dài cắt T
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(tanLineX, ty);
          ctx.stroke();
          ctx.setLineDash([]);

          // Điểm T
          ctx.beginPath();
          ctx.arc(tanLineX, ty, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#a855f7";
          ctx.fill();
          ctx.fillStyle = "#e9d5ff";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(`T(tan α = ${tanVal.toFixed(2)})`, tanLineX + 8, ty);
        }
      }
      ctx.restore();
    }

    // 16. Điểm chuyển động M(cos α; sin α)
    ctx.save();
    // Halo phát sáng quanh M
    ctx.beginPath();
    ctx.arc(mx, my, isDragging ? 14 : 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    ctx.fill();

    // Điểm M chính
    ctx.beginPath();
    ctx.arc(mx, my, isDragging ? 7 : 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "#f59e0b";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nhãn điểm M
    const mLabel = `M(cos α; sin α)`;
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 4;
    ctx.fillText(mLabel, mx + (cosVal >= 0 ? 10 : -100), my + (sinVal >= 0 ? -12 : 20));
    ctx.shadowBlur = 0;
    ctx.restore();

    ctx.restore();
  }, [
    currentAngle,
    rad,
    cosVal,
    sinVal,
    zoom,
    pan,
    showGrid,
    showTanCot,
    isDragging,
    quadrantInfo,
  ]);

  // Pointer drag trên điểm M để xoay góc
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const baseRadius = Math.min(rect.width, rect.height) * 0.32;
    const R = baseRadius * zoom;
    const ox = rect.width / 2 + pan.x;
    const oy = rect.height / 2 + pan.y;

    const mx = ox + R * cosVal;
    const my = oy - R * sinVal;

    // Hit test M (bán kính 24px)
    if (Math.hypot(sx - mx, sy - my) <= 28 || Math.abs(Math.hypot(sx - ox, sy - oy) - R) <= 24) {
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);
      updateAngleFromPoint(sx, sy, ox, oy);
      return;
    }

    // Canvas panning
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    canvas.setPointerCapture(e.pointerId);
  };

  const updateAngleFromPoint = (sx: number, sy: number, ox: number, oy: number) => {
    const dx = sx - ox;
    const dy = oy - sy; // Oy hướng lên
    let angleRad = Math.atan2(dy, dx);
    if (angleRad < 0) angleRad += 2 * Math.PI;
    let deg = (angleRad * 180) / Math.PI;

    // Nam châm hút vào góc đặc biệt nếu cách < 3 độ
    if (snapToSpecial) {
      const specialKeys = Object.keys(SPECIAL_ANGLES).map(Number);
      for (const sp of specialKeys) {
        if (Math.abs(deg - sp) <= 3) {
          deg = sp;
          break;
        }
      }
    }

    const roundedDeg = Math.round(deg * 10) / 10;
    setCurrentAngle(roundedDeg);
    if (onAngleChange) onAngleChange(roundedDeg);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const ox = rect.width / 2 + pan.x;
    const oy = rect.height / 2 + pan.y;

    if (isDragging) {
      updateAngleFromPoint(sx, sy, ox, oy);
      return;
    }

    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((z) => Math.max(0.5, Math.min(3.0, z * factor)));
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setCurrentAngle(60);
    if (onAngleChange) onAngleChange(60);
  };

  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `DuongTronLuongGiac_MathSTEP_${Date.now()}.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex flex-col bg-slate-900 select-none overflow-hidden rounded-xl border border-slate-700 shadow-2xl ${className}`}
    >
      {/* Top Banner Toolbar: Trực quan cốt lõi COS & SIN */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        {/* Left: Bản chất hình học của Cosin & Sin */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Đường tròn đơn vị</span>
            <KatexMath math="R = 1" className="font-bold text-teal-300 font-mono" />
          </div>

          {/* Huy hiệu Góc phần tư */}
          <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-teal-500/50 text-xs text-teal-300 font-bold flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{quadrantInfo.label}</span>
            {quadrantInfo.num > 0 && (
              <span className="text-[10px] text-slate-300 font-mono">({quadrantInfo.desc})</span>
            )}
          </div>
        </div>

        {/* Right: Toolbar mini */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/85 backdrop-blur-md rounded-lg border border-slate-700/80 shadow-md pointer-events-auto">
          <button
            onClick={() => {
              if (onToggleTanCot) onToggleTanCot();
              else setShowTanCotInternal((v) => !v);
            }}
            title="Bật/Tắt hiển thị Trục Tangent và Cotangent"
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
              showTanCot
                ? "bg-purple-950/80 text-purple-300 border border-purple-500/50"
                : "bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Trục Tan/Cot</span>
          </button>

          <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

          <button
            onClick={() => setZoom((z) => Math.min(3.0, z * 1.2))}
            title="Phóng to (+)"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z / 1.2))}
            title="Thu nhỏ (-)"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetView}
            title="Khôi phục góc nhìn chuẩn tâm O"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

          <button
            onClick={() => setShowGrid((g) => !g)}
            title="Bật/Tắt Lưới tọa độ"
            className={`p-1 rounded transition-colors ${
              showGrid ? "bg-slate-800 text-teal-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSnapToSpecial((s) => !s)}
            title="Bật/Tắt Nam châm hút vào góc đặc biệt (30°, 45°, 60°...)"
            className={`p-1 rounded transition-colors ${
              snapToSpecial ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-3.5 bg-slate-700 mx-0.5" />

          <button
            onClick={handleExportPNG}
            title="Chụp ảnh đồ thị PNG chất lượng cao"
            className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400 hover:text-emerald-200 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Measurement HUD (Bottom Left): Giúp học sinh thấy rõ COS Ở ĐÂU, SIN Ở ĐÂU */}
      <div className="absolute bottom-4 left-4 z-10 p-3 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl space-y-2 pointer-events-auto max-w-xs">
        <div className="flex items-center justify-between text-xs font-bold border-b border-slate-700 pb-1">
          <span className="text-amber-400 flex items-center gap-1">
            <span>📐</span> Góc quay: <KatexMath math={`\\alpha = ${Math.round(currentAngle)}^\\circ`} />
          </span>
          {nearestSpecial && (
            <span className="text-[10px] text-teal-300 font-mono">
              (<KatexMath math={`\\alpha = ${nearestSpecial.radLatex}\\text{ rad}`} />)
            </span>
          )}
        </div>

        {/* 2 Đại lượng cốt lõi: Đoạn Cos (hoành độ) & Đoạn Sin (tung độ) */}
        <div className="space-y-1.5 text-xs font-mono">
          {/* Trục Cos: Hoành độ H */}
          <div className="p-1.5 bg-sky-950/70 border border-sky-500/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm" />
              <span className="text-sky-200 font-bold">Đoạn Cos (Ox):</span>
            </div>
            <div className="text-right">
              {nearestSpecial ? (
                <KatexMath math={`\\cos \\alpha = ${nearestSpecial.cosLatex} \\approx ${formatVNFloat(cosVal)}`} className="text-sky-300 font-bold text-xs" />
              ) : (
                <KatexMath math={`\\cos \\alpha = ${formatVNFloat(cosVal)}`} className="text-sky-300 font-bold text-xs" />
              )}
            </div>
          </div>

          {/* Trục Sin: Tung độ K */}
          <div className="p-1.5 bg-rose-950/70 border border-rose-500/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
              <span className="text-rose-200 font-bold">Đoạn Sin (Oy):</span>
            </div>
            <div className="text-right">
              {nearestSpecial ? (
                <KatexMath math={`\\sin \\alpha = ${nearestSpecial.sinLatex} \\approx ${formatVNFloat(sinVal)}`} className="text-rose-300 font-bold text-xs" />
              ) : (
                <KatexMath math={`\\sin \\alpha = ${formatVNFloat(sinVal)}`} className="text-rose-300 font-bold text-xs" />
              )}
            </div>
          </div>

          {/* Tọa độ điểm M */}
          <div className="pt-1 border-t border-slate-700/60 flex justify-between items-center text-[11px] text-slate-300">
            <span>Tọa độ:</span>
            <KatexMath math={`M(${formatVNFloat(cosVal)};\\, ${formatVNFloat(sinVal)})`} className="text-amber-300 font-bold" />
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas: Mặt phẳng sạch 100% */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
}
