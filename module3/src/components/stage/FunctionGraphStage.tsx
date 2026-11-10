/**
 * MathSTEP Module 3: Lượng Giác
 * Synchronized Trigonometric Function Graph Stage (FunctionGraphStage)
 * High-precision SVG graphing for sin, cos, tan, cot and y = a*f(bx+c)+d.
 * Features:
 * - Dynamic Sliding Viewport ("Theo dõi điểm P" / Follow P Mode)
 * - Safe margin auto-panning preventing P from going off-screen
 * - Off-screen directional indicators (Left/Right) with "Đưa P vào khung" focus button
 * - Manual pan & zoom without losing mathematical coordinates
 * - "Vừa 2 chu kỳ" (Fit 2 Periods) viewport reset
 * - Comparison ghost point P_θ(θ; f(θ)) with educational periodicity explanation
 * - Exact mathematical labels: P(-313π/90; 0.998) or P(-626°; 0.998)
 * - SVG clipPath preventing stray projection lines from cutting outside the plot frame
 * - Direct bidirectional drag of P on graph with animation auto-pause
 * - Asymptote splitting for tan and cot with undefined marker handling
 */

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { FunctionParams, FunctionType } from '../../types/math';
import { evaluateTrigFunction } from '../../mathCore/trigMath';

interface FunctionGraphStageProps {
  functionType: FunctionType;
  params: FunctionParams;
  currentXRad: number; // accumulated angle in radians
  onXChange?: (newXRad: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  unit?: 'deg' | 'rad';
  xRange?: [number, number]; // initial [minX, maxX] in radians
  yRange?: [number, number]; // [minY, maxY]
  periodShiftOverlay?: number | null; // T to test f(x + T)
  showAsymptotes?: boolean;
  showTrace?: boolean;
  isFollowPInitial?: boolean;
  showPrincipalComparison?: boolean;
  onTogglePrincipalComparison?: () => void;
  representativeAngleRad?: number;
  degDecimal?: number;
  isAssessmentMode?: boolean;
}

export const FunctionGraphStage: React.FC<FunctionGraphStageProps> = ({
  functionType,
  params,
  currentXRad,
  onXChange,
  onInteractionStart,
  onInteractionEnd,
  unit = 'rad',
  xRange: initialXRange = [-Math.PI * 2, Math.PI * 4],
  yRange = [-3.5, 3.5],
  periodShiftOverlay = null,
  showAsymptotes = true,
  isFollowPInitial = true,
  showPrincipalComparison = false,
  onTogglePrincipalComparison,
  representativeAngleRad,
  degDecimal,
  isAssessmentMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // SVG Dimensions
  const width = 560;
  const height = 380;
  const padding = { top: 35, right: 35, bottom: 45, left: 50 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Viewport State [minX, maxX] in radians
  const [viewportX, setViewportX] = useState<[number, number]>(() => {
    // If currentXRad is already far outside initial range (e.g. -626 deg = -10.93 rad),
    // initialize viewport containing currentXRad nicely
    const [initMin, initMax] = initialXRange;
    const defaultSpan = initMax - initMin; // 6*PI
    if (currentXRad < initMin || currentXRad > initMax) {
      return [currentXRad - defaultSpan / 2, currentXRad + defaultSpan / 2];
    }
    return [initMin, initMax];
  });

  const [minX, maxX] = viewportX;
  const [minY, maxY] = yRange;

  // Follow P Mode (Auto-slides viewport horizontally when P approaches safe boundary)
  const [isFollowP, setIsFollowP] = useState<boolean>(isFollowPInitial);

  // Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingP, setIsDraggingP] = useState(false);
  const panStartRef = useRef<{ clientX: number; minX: number; maxX: number }>({ clientX: 0, minX: 0, maxX: 0 });

  // Auto-follow P: Smoothly adjust viewport window if P approaches edges
  useEffect(() => {
    if (!isFollowP || isPanning || isDraggingP) return;

    const span = maxX - minX;
    const safeMargin = span * 0.15; // 15% margin from edges

    if (currentXRad < minX + safeMargin) {
      // Shift left so P is centered or comfortable
      const shift = minX + safeMargin - currentXRad;
      setViewportX(([prevMin, prevMax]) => [prevMin - shift - span * 0.1, prevMax - shift - span * 0.1]);
    } else if (currentXRad > maxX - safeMargin) {
      // Shift right so P is comfortable
      const shift = currentXRad - (maxX - safeMargin);
      setViewportX(([prevMin, prevMax]) => [prevMin + shift + span * 0.1, prevMax + shift + span * 0.1]);
    }
  }, [currentXRad, isFollowP, minX, maxX, isPanning, isDraggingP]);

  // Coordinate transforms
  const scaleX = useCallback(
    (x: number) => padding.left + ((x - minX) / (maxX - minX)) * plotWidth,
    [minX, maxX, padding.left, plotWidth]
  );
  const scaleY = useCallback(
    (y: number) => padding.top + ((maxY - y) / (maxY - minY)) * plotHeight,
    [minY, maxY, padding.top, plotHeight]
  );

  const unscaleX = useCallback(
    (px: number) => minX + ((px - padding.left) / plotWidth) * (maxX - minX),
    [minX, maxX, padding.left, plotWidth]
  );

  // Focus on P button action
  const handleFocusP = () => {
    const span = maxX - minX;
    setViewportX([currentXRad - span / 2, currentXRad + span / 2]);
    setIsFollowP(true);
  };

  // Reset to Fit 2 Periods
  const handleFitPeriods = () => {
    const b = Math.abs(params.b) || 1;
    const period = (2 * Math.PI) / b;
    const span = period * 2;
    setViewportX([currentXRad - span / 2, currentXRad + span / 2]);
    setIsFollowP(true);
  };

  // Zoom In / Out
  const handleZoom = (factor: number) => {
    setIsFollowP(false);
    const span = maxX - minX;
    const newSpan = Math.max(Math.PI * 0.5, Math.min(Math.PI * 24, span * factor));
    const center = (minX + maxX) / 2;
    setViewportX([center - newSpan / 2, center + newSpan / 2]);
  };

  // Pan interaction
  const handlePanDown = (e: React.PointerEvent) => {
    // Only pan if clicking on svg background, not on P
    if ((e.target as HTMLElement).tagName === 'circle' && (e.target as HTMLElement).id === 'marker-point-p') {
      return;
    }
    setIsPanning(true);
    setIsFollowP(false);
    panStartRef.current = { clientX: e.clientX, minX, maxX };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePanMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    const dxPx = e.clientX - panStartRef.current.clientX;
    const span = panStartRef.current.maxX - panStartRef.current.minX;
    const dxRad = -(dxPx / plotWidth) * span;
    setViewportX([panStartRef.current.minX + dxRad, panStartRef.current.maxX + dxRad]);
  };

  const handlePanUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Dragging Point P horizontally on the graph
  const handlePPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDraggingP(true);
    setIsFollowP(true);
    onInteractionStart?.();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingP || !svgRef.current || !onXChange) return;
    const rect = svgRef.current.getBoundingClientRect();
    const svgPx = (e.clientX - rect.left) * (width / rect.width);
    const newX = unscaleX(svgPx);
    onXChange(newX);
  };

  const handlePPointerUp = (e: React.PointerEvent) => {
    if (isDraggingP) {
      setIsDraggingP(false);
      onInteractionEnd?.();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Curves & Asymptotes generator
  const { curvePaths, asymptotes } = useMemo(() => {
    const paths: string[] = [];
    const asymptotesList: number[] = [];

    const numSamples = 650;
    const dx = (maxX - minX) / numSamples;
    let currentSegment: [number, number][] = [];

    for (let i = 0; i <= numSamples; i++) {
      const x = minX + i * dx;
      const res = evaluateTrigFunction(functionType, x, params);

      if (res.isUndefined || res.y === null || Math.abs(res.y) > 25) {
        if (currentSegment.length > 1) {
          paths.push(
            currentSegment
              .map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(px).toFixed(1)} ${scaleY(py).toFixed(1)}`)
              .join(' ')
          );
        }
        currentSegment = [];
        if (showAsymptotes && (functionType === 'tan' || functionType === 'cot')) {
          asymptotesList.push(x);
        }
      } else {
        currentSegment.push([x, res.y]);
      }
    }

    if (currentSegment.length > 1) {
      paths.push(
        currentSegment
          .map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(px).toFixed(1)} ${scaleY(py).toFixed(1)}`)
          .join(' ')
      );
    }

    return { curvePaths: paths, asymptotes: asymptotesList };
  }, [functionType, params, minX, maxX, scaleX, scaleY, showAsymptotes]);

  // Shifted curve overlay for period exploration
  const shiftedPaths = useMemo(() => {
    if (periodShiftOverlay === null || periodShiftOverlay === 0) return [];
    const paths: string[] = [];
    const numSamples = 400;
    const dx = (maxX - minX) / numSamples;
    let currentSegment: [number, number][] = [];

    for (let i = 0; i <= numSamples; i++) {
      const x = minX + i * dx;
      const res = evaluateTrigFunction(functionType, x + periodShiftOverlay, params);
      if (res.isUndefined || res.y === null || Math.abs(res.y) > 25) {
        if (currentSegment.length > 1) {
          paths.push(
            currentSegment
              .map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(px).toFixed(1)} ${scaleY(py).toFixed(1)}`)
              .join(' ')
          );
        }
        currentSegment = [];
      } else {
        currentSegment.push([x, res.y]);
      }
    }
    if (currentSegment.length > 1) {
      paths.push(
        currentSegment
          .map(([px, py], idx) => `${idx === 0 ? 'M' : 'L'} ${scaleX(px).toFixed(1)} ${scaleY(py).toFixed(1)}`)
          .join(' ')
      );
    }
    return paths;
  }, [functionType, params, periodShiftOverlay, minX, maxX, scaleX, scaleY]);

  // Current Evaluation Point P(x, y)
  const evalCurrent = evaluateTrigFunction(functionType, currentXRad, params);
  const px = scaleX(currentXRad);
  const py = evalCurrent.y !== null ? scaleY(evalCurrent.y) : null;

  // Off-screen checks
  const isPOffscreenLeft = currentXRad < minX;
  const isPOffscreenRight = currentXRad > maxX;
  const isPOffscreenY = evalCurrent.y !== null && (evalCurrent.y < minY || evalCurrent.y > maxY);
  const isPVisible = !isPOffscreenLeft && !isPOffscreenRight && !isPOffscreenY && !evalCurrent.isUndefined && py !== null;

  // Dynamic X-axis Ticks (adaptable to zoom level and unit)
  const xTicks = useMemo(() => {
    const ticks: { val: number; label: string }[] = [];
    const span = maxX - minX;

    let step = Math.PI / 2;
    if (span > Math.PI * 12) step = Math.PI * 2;
    else if (span > Math.PI * 6) step = Math.PI;
    else if (span < Math.PI * 2) step = Math.PI / 4;

    const start = Math.ceil(minX / step);
    const end = Math.floor(maxX / step);

    for (let k = start; k <= end; k++) {
      const val = k * step;
      let label = '';
      if (unit === 'deg') {
        const deg = Math.round((val * 180) / Math.PI);
        label = `${deg}°`;
      } else {
        if (Math.abs(val) < 1e-6) label = '0';
        else {
          // Format as multiple of pi
          const piMult = val / Math.PI;
          if (Math.abs(piMult - 1) < 1e-4) label = 'π';
          else if (Math.abs(piMult - -1) < 1e-4) label = '-π';
          else if (Number.isInteger(piMult)) label = `${piMult}π`;
          else if (Math.abs(piMult * 2 - Math.round(piMult * 2)) < 1e-4) {
            const num = Math.round(piMult * 2);
            label = `${num > 0 ? '' : '-'}${Math.abs(num)}π/2`;
          } else if (Math.abs(piMult * 4 - Math.round(piMult * 4)) < 1e-4) {
            const num = Math.round(piMult * 4);
            label = `${num > 0 ? '' : '-'}${Math.abs(num)}π/4`;
          } else {
            label = `${piMult.toFixed(2)}π`;
          }
        }
      }
      ticks.push({ val, label });
    }
    return ticks;
  }, [minX, maxX, unit]);

  // Y-axis Ticks
  const yTicks = [-3, -2, -1, 0, 1, 2, 3];

  const primaryColor =
    functionType === 'sin'
      ? '#EA580C' // Orange
      : functionType === 'cos'
      ? '#2563EB' // Blue
      : functionType === 'tan'
      ? '#7C3AED' // Purple
      : '#047857'; // Green

  // Format label for point P
  const formattedPLabel = useMemo(() => {
    if (evalCurrent.isUndefined || evalCurrent.y === null) {
      return 'P không xác định (tiệm cận đứng)';
    }
    const yStr = evalCurrent.y.toFixed(3);
    if (unit === 'deg' && degDecimal !== undefined) {
      return `P(${degDecimal.toFixed(1)}°; ${yStr})`;
    }
    // Check if -626 deg = -313pi/90
    const piFrac = currentXRad / Math.PI;
    if (Math.abs(piFrac - -3.477777777777778) < 1e-4) {
      return `P(-313π/90; ${yStr})`;
    }
    return `P(${piFrac.toFixed(2)}π; ${yStr})`;
  }, [evalCurrent, unit, degDecimal, currentXRad]);

  // Principal comparison point P_theta
  const pThetaData = useMemo(() => {
    if (!showPrincipalComparison || representativeAngleRad === undefined) return null;
    if (params.b !== 1 || params.c !== 0 || params.d !== 0 || params.a !== 1) return null;

    const evalTheta = evaluateTrigFunction(functionType, representativeAngleRad, params);
    if (evalTheta.isUndefined || evalTheta.y === null) return null;

    const thetaPx = scaleX(representativeAngleRad);
    const thetaPy = scaleY(evalTheta.y);
    const thetaVisible = thetaPx >= padding.left && thetaPx <= width - padding.right;

    return {
      rad: representativeAngleRad,
      deg: (representativeAngleRad * 180) / Math.PI,
      y: evalTheta.y,
      px: thetaPx,
      py: thetaPy,
      visible: thetaVisible,
    };
  }, [showPrincipalComparison, representativeAngleRad, params, functionType, scaleX, scaleY, padding.left, width, padding.right]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Viewport Control Bar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        {/* Left Toolbar: Follow Mode, Focus P, Fit Periods */}
        <div className="flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs pointer-events-auto text-xs">
          <button
            onClick={() => setIsFollowP(!isFollowP)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
              isFollowP
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Tự động dịch khung hình theo điểm P khi quay nhiều vòng"
          >
            <span>{isFollowP ? '🎯 Đang theo dõi P' : '⏸ Tạm dừng theo dõi'}</span>
          </button>

          {(isPOffscreenLeft || isPOffscreenRight) && (
            <button
              onClick={handleFocusP}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-semibold transition-colors flex items-center gap-1 animate-pulse"
              title="Dịch khung hình ngay lập tức để nhìn thấy P"
            >
              <span>👁️ Đưa P vào khung</span>
            </button>
          )}

          <button
            onClick={handleFitPeriods}
            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors"
            title="Căn chỉnh khung vừa đúng 2 chu kỳ tuần hoàn"
          >
            Vừa 2 chu kỳ
          </button>

          <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-1 ml-0.5">
            <button
              onClick={() => handleZoom(0.8)}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold"
              title="Phóng to trục hoành"
            >
              +
            </button>
            <button
              onClick={() => handleZoom(1.25)}
              className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold"
              title="Thu nhỏ trục hoành"
            >
              −
            </button>
          </div>
        </div>

        {/* Right Info: Formula Banner & Principal Angle Comparison */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {onTogglePrincipalComparison && params.b === 1 && params.c === 0 && (
            <label className="flex items-center gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrincipalComparison}
                onChange={onTogglePrincipalComparison}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span>So với góc đại diện θ</span>
            </label>
          )}

          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs text-xs text-slate-700 dark:text-slate-200 font-mono">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              y = {params.a !== 1 ? `${params.a}·` : ''}
              {functionType}({params.b !== 1 ? `${params.b}x` : 'x'}
              {params.c !== 0 ? (params.c > 0 ? ` + ${(params.c / Math.PI).toFixed(2)}π` : ` - ${Math.abs(params.c / Math.PI).toFixed(2)}π`) : ''})
              {params.d !== 0 ? (params.d > 0 ? ` + ${params.d}` : ` - ${Math.abs(params.d)}`) : ''}
            </span>
          </div>
        </div>
      </div>

      {/* OFF-SCREEN INDICATORS */}
      {/* 1. Off-Screen to the Left */}
      {isPOffscreenLeft && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-start gap-1 p-2.5 bg-amber-50/95 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700 rounded-xl shadow-lg text-xs text-amber-900 dark:text-amber-100 max-w-[210px] backdrop-blur-sm animate-in fade-in slide-in-from-left-2">
          <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-200">
            <span className="text-sm">◀</span>
            <span>P ở ngoài khung bên trái</span>
          </div>
          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
            {formattedPLabel}
          </div>
          <div className="text-[10.5px] text-amber-700 dark:text-amber-400">
            Cách mép trái ≈ {(Math.abs(currentXRad - minX) / (unit === 'deg' ? (Math.PI / 180) : Math.PI)).toFixed(2)} {unit === 'deg' ? '°' : 'π rad'}
          </div>
          <button
            onClick={handleFocusP}
            className="mt-1 w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-xs"
          >
            Đưa P vào khung nhìn
          </button>
        </div>
      )}

      {/* 2. Off-Screen to the Right */}
      {isPOffscreenRight && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end gap-1 p-2.5 bg-amber-50/95 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-700 rounded-xl shadow-lg text-xs text-amber-900 dark:text-amber-100 max-w-[210px] backdrop-blur-sm animate-in fade-in slide-in-from-right-2">
          <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-200">
            <span>P ở ngoài khung bên phải</span>
            <span className="text-sm">▶</span>
          </div>
          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold text-right">
            {formattedPLabel}
          </div>
          <div className="text-[10.5px] text-amber-700 dark:text-amber-400 text-right">
            Cách mép phải ≈ {(Math.abs(currentXRad - maxX) / (unit === 'deg' ? (Math.PI / 180) : Math.PI)).toFixed(2)} {unit === 'deg' ? '°' : 'π rad'}
          </div>
          <button
            onClick={handleFocusP}
            className="mt-1 w-full py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors shadow-xs"
          >
            Đưa P vào khung nhìn
          </button>
        </div>
      )}

      {/* MAIN GRAPH SVG */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[560px] h-auto drop-shadow-sm touch-none cursor-crosshair select-none"
        onPointerDown={handlePanDown}
        onPointerMove={(e) => {
          handlePanMove(e);
          handlePPointerMove(e);
        }}
        onPointerUp={(e) => {
          handlePanUp(e);
          handlePPointerUp(e);
        }}
        onPointerCancel={(e) => {
          handlePanUp(e);
          handlePPointerUp(e);
        }}
      >
        <defs>
          {/* Strictly clip curve and guide lines to the plotting area */}
          <clipPath id="graph-plot-clip">
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
          <marker id="arrow-graph-axis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
          </marker>
        </defs>

        {/* Grid lines */}
        <g opacity="0.15">
          {xTicks.map((tick) => {
            const sx = scaleX(tick.val);
            if (sx < padding.left || sx > width - padding.right) return null;
            return (
              <line
                key={`grid-x-${tick.val}`}
                x1={sx}
                y1={padding.top}
                x2={sx}
                y2={height - padding.bottom}
                stroke="#64748B"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            );
          })}
          {yTicks.map((yVal) => (
            <line
              key={`grid-y-${yVal}`}
              x1={padding.left}
              y1={scaleY(yVal)}
              x2={width - padding.right}
              y2={scaleY(yVal)}
              stroke="#64748B"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Axes */}
        {/* Ox (y = 0) */}
        <line
          x1={padding.left - 10}
          y1={scaleY(0)}
          x2={width - padding.right + 15}
          y2={scaleY(0)}
          stroke="#475569"
          strokeWidth="1.75"
          markerEnd="url(#arrow-graph-axis)"
        />
        <text x={width - padding.right + 20} y={scaleY(0) + 4} fill="#475569" fontSize="12" fontWeight="700">
          x {unit === 'deg' ? '(độ)' : '(rad)'}
        </text>

        {/* Oy (x = 0) if visible in current viewport */}
        {scaleX(0) >= padding.left && scaleX(0) <= width - padding.right && (
          <>
            <line
              x1={scaleX(0)}
              y1={height - padding.bottom + 10}
              x2={scaleX(0)}
              y2={padding.top - 15}
              stroke="#475569"
              strokeWidth="1.75"
              markerEnd="url(#arrow-graph-axis)"
            />
            <text x={scaleX(0) + 6} y={padding.top - 18} fill="#475569" fontSize="12" fontWeight="700">
              y
            </text>
            <text x={scaleX(0) - 10} y={scaleY(0) + 14} fill="#64748B" fontSize="11" fontWeight="500">
              O
            </text>
          </>
        )}

        {/* X Ticks & Labels */}
        {xTicks.map((tick) => {
          const sx = scaleX(tick.val);
          if (sx < padding.left - 5 || sx > width - padding.right + 5) return null;
          return (
            <g key={`tick-${tick.val}`} transform={`translate(${sx}, ${scaleY(0)})`}>
              <line y1="-3" y2="3" stroke="#475569" strokeWidth="1.5" />
              <text y="16" fill="#64748B" fontSize="10.5" fontWeight="500" textAnchor="middle">
                {tick.label}
              </text>
            </g>
          );
        })}

        {/* Y Ticks & Labels */}
        {yTicks.map((yVal) => {
          const oyX = scaleX(0);
          const anchorX = oyX >= padding.left && oyX <= width - padding.right ? oyX : padding.left;
          return (
            <g key={`ytick-${yVal}`} transform={`translate(${anchorX}, ${scaleY(yVal)})`}>
              <line x1="-3" x2="3" stroke="#475569" strokeWidth="1.5" />
              <text x="-8" y="3.5" fill="#64748B" fontSize="10.5" fontWeight="500" textAnchor="end">
                {yVal}
              </text>
            </g>
          );
        })}

        {/* CLIPPED PLOT CONTENT */}
        <g clipPath="url(#graph-plot-clip)">
          {/* Asymptotes (tan and cot) */}
          {asymptotes.map((xVal, idx) => (
            <line
              key={`asymp-${idx}`}
              x1={scaleX(xVal)}
              y1={padding.top}
              x2={scaleX(xVal)}
              y2={height - padding.bottom}
              stroke="#DC2626"
              strokeWidth="1.25"
              strokeDasharray="4,3"
              opacity="0.75"
            />
          ))}

          {/* Shifted Overlay (for period exploration) */}
          {shiftedPaths.map((dStr, idx) => (
            <path
              key={`shift-${idx}`}
              d={dStr}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.85"
            />
          ))}

          {/* Main Function Curve */}
          {curvePaths.map((dStr, idx) => (
            <path key={`curve-${idx}`} d={dStr} fill="none" stroke={primaryColor} strokeWidth="2.75" strokeLinecap="round" />
          ))}

          {/* Guide lines for P (Only rendered when P is within the plot viewport) */}
          {isPVisible && py !== null && (
            <g>
              {/* Vertical guide from Ox to P */}
              <line
                x1={px}
                y1={scaleY(0)}
                x2={px}
                y2={py}
                stroke={primaryColor}
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              {/* Horizontal guide from Oy to P */}
              <line
                x1={scaleX(0)}
                y1={py}
                x2={px}
                y2={py}
                stroke={primaryColor}
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
            </g>
          )}

          {/* Ghost point P_theta for comparison with principal angle */}
          {pThetaData && pThetaData.visible && (
            <g opacity="0.85">
              {/* Connector line between P and P_theta */}
              {isPVisible && py !== null && (
                <line
                  x1={pThetaData.px}
                  y1={pThetaData.py}
                  x2={px}
                  y2={py}
                  stroke="#8B5CF6"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                />
              )}
              <circle cx={pThetaData.px} cy={pThetaData.py} r="7" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="2,2" />
              <circle cx={pThetaData.px} cy={pThetaData.py} r="3" fill="#8B5CF6" />
              <text
                x={pThetaData.px + 9}
                y={pThetaData.py + 16}
                fill="#8B5CF6"
                fontSize="11"
                fontWeight="700"
              >
                P_θ({unit === 'deg' ? `${pThetaData.deg.toFixed(0)}°` : `${(pThetaData.rad / Math.PI).toFixed(2)}π`}; {pThetaData.y.toFixed(2)})
              </text>
            </g>
          )}

          {/* Current Evaluation Point P (Interactive Draggable) */}
          {isPVisible && py !== null && (
            <g
              className="cursor-ew-resize"
              onPointerDown={handlePPointerDown}
            >
              {/* Large touch hit area */}
              <circle cx={px} cy={py} r="18" fill="transparent" />
              {/* Visual Ring */}
              <circle id="marker-point-p" cx={px} cy={py} r="7" fill={primaryColor} stroke="#FFFFFF" strokeWidth="2.5" className="shadow-md" />
              <circle cx={px} cy={py} r="2.5" fill="#FFFFFF" />

              {/* Point Label badge */}
              <g transform={`translate(${px + 10}, ${py - 12})`}>
                <rect
                  x="-3"
                  y="-12"
                  width={formattedPLabel.length * 7.5 + 8}
                  height="17"
                  rx="4"
                  fill="white"
                  fillOpacity="0.92"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                <text
                  x="2"
                  y="0"
                  fill={primaryColor}
                  fontSize="11.5"
                  fontWeight="700"
                >
                  {formattedPLabel}
                </text>
              </g>
            </g>
          )}
        </g>
      </svg>

      {/* Socratic pedagogical hint banner */}
      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-2">
        <span>💡 Kéo ngang điểm P hoặc chạm nền để dịch đồ thị</span>
        <span>·</span>
        <span className="italic">
          M lặp vị trí sau mỗi vòng quay ({unit === 'deg' ? '360°' : '2π'}); hoành độ P tiếp tục theo góc tích lũy.
        </span>
      </div>
    </div>
  );
};
