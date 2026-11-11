/**
 * MathSTEP Module 3: Lượng Giác
 * Interactive Unit Circle Stage (TrigCircleStage)
 * High-precision SVG rendering, continuous pointer capture with atan2 unwrap,
 * multi-turn spiral trace, signed projections (cos blue, sin orange, tan purple, cot green),
 * special geometric triangle overlays, and second point N(β) support.
 * Enhanced:
 * - Incremental atan2 unwrap starting from existing accumulated angle (no snaps on click)
 * - Parameterized phase angle φ = bx + c support with Δx = Δφ / b continuous mapping
 * - Lock indicator when b = 0
 * - Interaction callbacks to smoothly pause/resume animation loop
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ExactAngle, TrigValues } from '../../types/math';

interface TrigCircleStageProps {
  angle: ExactAngle; // independent variable x
  trigValues: TrigValues;
  onAngleChange: (newDeg: number) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  paramB?: number; // frequency b
  paramC?: number; // phase shift c (radians)
  phaseAngle?: ExactAngle | null; // phase angle φ = b*x + c
  showProjections?: boolean;
  showTangentAxis?: boolean;
  showCotangentAxis?: boolean;
  showSpecialTriangle?: boolean;
  showQuadrants?: boolean;
  showSpiral?: boolean;
  secondaryAngle?: ExactAngle | null;
  secondaryLabel?: string;
  isAssessmentMode?: boolean;
  readonly?: boolean;
}

export const TrigCircleStage: React.FC<TrigCircleStageProps> = ({
  angle,
  trigValues,
  onAngleChange,
  onInteractionStart,
  onInteractionEnd,
  paramB = 1,
  paramC = 0,
  phaseAngle = null,
  showProjections = true,
  showTangentAxis = true,
  showCotangentAxis = true,
  showSpecialTriangle = false,
  showQuadrants = true,
  showSpiral = true,
  secondaryAngle = null,
  secondaryLabel = 'N(β)',
  isAssessmentMode = false,
  readonly = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Active angle driving the circle: either phaseAngle if provided or base angle
  const activeAngle = phaseAngle || angle;
  const isParameterized = paramB !== 1 || paramC !== 0;

  // Incremental tracking refs to prevent snap jumps
  const accumulatedDegRef = useRef<number>(angle.degDecimal);
  const prevPointerAtan2Ref = useRef<number | null>(null);

  // Keep accumulatedDegRef synchronized when not dragging
  useEffect(() => {
    if (!isDragging) {
      accumulatedDegRef.current = angle.degDecimal;
      prevPointerAtan2Ref.current = null;
    }
  }, [angle.degDecimal, isDragging]);

  const cx = 230;
  const cy = 230;
  const radius = 150;

  // Primary point M coordinates based on active driving angle (phase φ)
  const rad = (activeAngle.degDecimal * Math.PI) / 180;
  const mx = cx + radius * Math.cos(rad);
  const my = cy - radius * Math.sin(rad); // SVG y is inverted

  // Secondary point N coordinates
  let nx = 0;
  let ny = 0;
  if (secondaryAngle) {
    const secRad = (secondaryAngle.degDecimal * Math.PI) / 180;
    nx = cx + radius * Math.cos(secRad);
    ny = cy - radius * Math.sin(secRad);
  }

  // Pointer dragging handler with incremental delta atan2 unwrap
  const handlePointerDown = (e: React.PointerEvent) => {
    if (readonly || paramB === 0) return;
    setIsDragging(true);
    onInteractionStart?.();

    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const px = e.clientX - centerX;
      const py = -(e.clientY - centerY);
      prevPointerAtan2Ref.current = Math.atan2(py, px);
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const updateAngleFromEvent = useCallback(
    (e: React.PointerEvent) => {
      if (!svgRef.current || prevPointerAtan2Ref.current === null) return;
      const rect = svgRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const px = e.clientX - centerX;
      const py = -(e.clientY - centerY);

      const currentAtan2 = Math.atan2(py, px); // [-pi, pi]
      let delta = currentAtan2 - prevPointerAtan2Ref.current;

      // Unwrap delta to [-pi, pi]
      if (delta > Math.PI) delta -= 2 * Math.PI;
      else if (delta < -Math.PI) delta += 2 * Math.PI;

      prevPointerAtan2Ref.current = currentAtan2;

      const deltaDeg = (delta * 180) / Math.PI;

      // If parameterized: delta x = delta phi / b
      const effectiveB = paramB !== 0 ? paramB : 1;
      const deltaXDeg = deltaDeg / effectiveB;

      accumulatedDegRef.current += deltaXDeg;
      onAngleChange(Math.round(accumulatedDegRef.current * 10) / 10);
    },
    [onAngleChange, paramB]
  );

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || readonly || paramB === 0) return;
    updateAngleFromEvent(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      prevPointerAtan2Ref.current = null;
      onInteractionEnd?.();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      prevPointerAtan2Ref.current = null;
      onInteractionEnd?.();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Generate angle arc or multi-turn spiral path
  const generateAngleArc = () => {
    const deg = activeAngle.degDecimal;
    const absDeg = Math.abs(deg);
    const isNegative = deg < 0;

    if (absDeg <= 360 || !showSpiral) {
      const displayAngleDeg = deg % 360;
      const arcRadius = 40;
      const startX = cx + arcRadius;
      const startY = cy;
      const targetRad = (displayAngleDeg * Math.PI) / 180;
      const endX = cx + arcRadius * Math.cos(targetRad);
      const endY = cy - arcRadius * Math.sin(targetRad);

      const largeArc = Math.abs(displayAngleDeg) > 180 ? 1 : 0;
      const sweepFlag = isNegative ? 1 : 0;

      return (
        <path
          d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${endX} ${endY}`}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    } else {
      // Multi-turn spiral
      const points: string[] = [];
      const steps = Math.min(Math.floor(absDeg / 5), 200);
      const maxR = 50;
      const minR = 20;

      for (let i = 0; i <= steps; i++) {
        const curDeg = (i / steps) * deg;
        const curR = minR + (maxR - minR) * (i / steps);
        const curRad = (curDeg * Math.PI) / 180;
        const x = cx + curR * Math.cos(curRad);
        const y = cy - curR * Math.sin(curRad);
        points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      return <path d={points.join(' ')} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3,3" />;
    }
  };

  // Tangent and Cotangent projection points
  const cosVal = Math.cos(rad);
  const sinVal = Math.sin(rad);
  const isCosNearZero = Math.abs(cosVal) < 1e-4;
  const isSinNearZero = Math.abs(sinVal) < 1e-4;

  const tanX = cx + radius; // x = 1 line
  const tanY = isCosNearZero ? null : cy - radius * (sinVal / cosVal);

  const cotX = isSinNearZero ? null : cx + radius * (cosVal / sinVal);
  const cotY = cy - radius; // y = 1 line

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden">
      <svg
        ref={svgRef}
        viewBox="0 0 460 460"
        className={`w-full max-w-[460px] h-auto drop-shadow-sm touch-none select-none ${
          paramB === 0 ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <defs>
          <marker id="arrow-axis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
          </marker>
        </defs>

        {/* Quadrant background zones */}
        {showQuadrants && (
          <g opacity="0.35">
            <rect x={cx} y={cy - radius} width={radius} height={radius} fill="#EFF6FF" />
            <rect x={cx - radius} y={cy - radius} width={radius} height={radius} fill="#FEF3C7" />
            <rect x={cx - radius} y={cy} width={radius} height={radius} fill="#F1F5F9" />
            <rect x={cx} y={cy} width={radius} height={radius} fill="#FDF2F8" />
            <text x={cx + radius * 0.55} y={cy - radius * 0.55} fill="#3B82F6" fontSize="14" fontWeight="600" textAnchor="middle">I (+; +)</text>
            <text x={cx - radius * 0.55} y={cy - radius * 0.55} fill="#D97706" fontSize="14" fontWeight="600" textAnchor="middle">II (-; +)</text>
            <text x={cx - radius * 0.55} y={cy + radius * 0.65} fill="#64748B" fontSize="14" fontWeight="600" textAnchor="middle">III (-; -)</text>
            <text x={cx + radius * 0.55} y={cy + radius * 0.65} fill="#DB2777" fontSize="14" fontWeight="600" textAnchor="middle">IV (+; -)</text>
          </g>
        )}

        {/* Unit Circle */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#94A3B8" strokeWidth="2" />

        {/* Coordinate Axes */}
        <line x1={30} y1={cy} x2={430} y2={cy} stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow-axis)" />
        <line x1={cx} y1={430} x2={cx} y2={30} stroke="#64748B" strokeWidth="1.5" markerEnd="url(#arrow-axis)" />
        <text x={435} y={cy + 4} fill="#64748B" fontSize="12" fontWeight="600">x</text>
        <text x={cx + 6} y={25} fill="#64748B" fontSize="12" fontWeight="600">y</text>
        <text x={cx - 14} y={cy + 16} fill="#64748B" fontSize="12" fontWeight="500">O</text>

        {/* Axis tick marks and key values */}
        <text x={cx + radius + 4} y={cy + 16} fill="#64748B" fontSize="11" fontWeight="500">1 (A)</text>
        <text x={cx - radius - 16} y={cy + 16} fill="#64748B" fontSize="11" fontWeight="500">-1</text>
        <text x={cx + 8} y={cy - radius - 4} fill="#64748B" fontSize="11" fontWeight="500">1 (B)</text>
        <text x={cx + 8} y={cy + radius + 14} fill="#64748B" fontSize="11" fontWeight="500">-1</text>

        {/* Tangent Axis (x = 1) */}
        {showTangentAxis && (
          <g>
            <line x1={tanX} y1={30} x2={tanX} y2={430} stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x={tanX + 5} y={45} fill="#7C3AED" fontSize="11" fontWeight="600">Trục tan (x=1)</text>
            {tanY !== null && tanY >= 30 && tanY <= 430 && (
              <>
                <line x1={cx} y1={cy} x2={tanX} y2={tanY} stroke="#A855F7" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx={tanX} cy={tanY} r="4.5" fill="#7C3AED" />
                <text x={tanX + 8} y={tanY + 4} fill="#7C3AED" fontSize="11" fontWeight="600">T</text>
              </>
            )}
          </g>
        )}

        {/* Cotangent Axis (y = 1) */}
        {showCotangentAxis && (
          <g>
            <line x1={30} y1={cotY} x2={430} y2={cotY} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x={45} y={cotY - 6} fill="#047857" fontSize="11" fontWeight="600">Trục cot (y=1)</text>
            {cotX !== null && cotX >= 30 && cotX <= 430 && (
              <>
                <line x1={cx} y1={cy} x2={cotX} y2={cotY} stroke="#10B981" strokeWidth="1" strokeDasharray="3,3" />
                <circle cx={cotX} cy={cotY} r="4.5" fill="#047857" />
                <text x={cotX - 4} y={cotY - 8} fill="#047857" fontSize="11" fontWeight="600">S</text>
              </>
            )}
          </g>
        )}

        {/* Special Triangles Overlay */}
        {showSpecialTriangle && (
          <g>
            <polygon
              points={`${cx},${cy} ${mx},${cy} ${mx},${my}`}
              fill="rgba(37, 99, 235, 0.08)"
              stroke="#2563EB"
              strokeWidth="1.5"
              strokeDasharray="3,2"
            />
            <rect
              x={mx > cx ? mx - 10 : mx}
              y={my < cy ? cy - 10 : cy}
              width="10"
              height="10"
              fill="none"
              stroke="#2563EB"
              strokeWidth="1"
            />
          </g>
        )}

        {/* Angle Arc / Spiral */}
        {generateAngleArc()}

        {/* Ray OA (initial ray) */}
        <line x1={cx} y1={cy} x2={cx + radius} y2={cy} stroke="#0F172A" strokeWidth="2.5" />

        {/* Ray OM (terminal ray) */}
        <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#1E293B" strokeWidth="2.5" />

        {/* Projections H(cos φ, 0) and K(0, sin φ) */}
        {showProjections && (
          <g>
            <line x1={mx} y1={my} x2={mx} y2={cy} stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1={mx} y1={my} x2={cx} y2={my} stroke="#EA580C" strokeWidth="1.5" strokeDasharray="3,3" />

            {/* Projection vector on Ox (Cosine - Blue) */}
            <line x1={cx} y1={cy} x2={mx} y2={cy} stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
            <circle cx={mx} cy={cy} r="3.5" fill="#2563EB" />
            <text x={mx} y={cy + (my < cy ? 18 : -8)} fill="#2563EB" fontSize="11" fontWeight="700" textAnchor="middle">
              cos = {isAssessmentMode ? '?' : trigValues.cos.exact}
            </text>

            {/* Projection vector on Oy (Sine - Orange) */}
            <line x1={cx} y1={cy} x2={cx} y2={my} stroke="#EA580C" strokeWidth="4" strokeLinecap="round" />
            <circle cx={cx} cy={my} r="3.5" fill="#EA580C" />
            <text x={cx + (mx < cx ? 12 : -12)} y={my + 4} fill="#EA580C" fontSize="11" fontWeight="700" textAnchor={mx < cx ? 'start' : 'end'}>
              sin = {isAssessmentMode ? '?' : trigValues.sin.exact}
            </text>
          </g>
        )}

        {/* Secondary point N */}
        {secondaryAngle && (
          <g>
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#9333EA" strokeWidth="2" strokeDasharray="4,3" />
            <circle cx={nx} cy={ny} r="6" fill="#9333EA" stroke="#FFFFFF" strokeWidth="2" />
            <text x={nx + (nx > cx ? 10 : -20)} y={ny + (ny > cy ? 15 : -8)} fill="#9333EA" fontSize="12" fontWeight="700">
              {secondaryLabel}
            </text>
          </g>
        )}

        {/* Point M (Main Draggable Point) */}
        <g>
          <circle cx={mx} cy={my} r="24" fill="transparent" />
          <circle cx={mx} cy={my} r="9" fill="#EA580C" stroke="#FFFFFF" strokeWidth="3" className="shadow-md" />
          <circle cx={mx} cy={my} r="3.5" fill="#FFFFFF" />

          {/* Label M with background to avoid collision */}
          <g transform={`translate(${mx + (mx >= cx ? 14 : -14)}, ${my + (my >= cy ? 18 : -10)})`}>
            <text
              fill="#0F172A"
              fontSize="12.5"
              fontWeight="700"
              textAnchor={mx >= cx ? 'start' : 'end'}
              className="filter drop-shadow-sm"
            >
              M {isParameterized ? `(φ = ${activeAngle.degDecimal.toFixed(1)}°)` : `(α = ${activeAngle.degDecimal.toFixed(1)}°)`}
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Info Pill */}
      <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-mono tabular-nums text-slate-700 dark:text-slate-200">
        <span className="font-semibold text-blue-600 dark:text-blue-400">cos: {trigValues.cos.exact}</span>
        <span className="mx-2 text-slate-400">·</span>
        <span className="font-semibold text-orange-600 dark:text-orange-400">sin: {trigValues.sin.exact}</span>
        {activeAngle.quadrant !== 'axis' ? (
          <>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-slate-500 font-sans">Góc phần tư {activeAngle.quadrant}</span>
          </>
        ) : (
          <>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-amber-600 font-sans font-medium">Trên trục ({activeAngle.axisName})</span>
          </>
        )}
      </div>

      {/* Parameterized mapping notice */}
      {isParameterized && (
        <div className="absolute top-2 right-2 bg-purple-50/95 dark:bg-purple-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 font-mono">
          <span>Pha φ = {paramB}x {paramC !== 0 ? `+ ${(paramC / Math.PI).toFixed(2)}π` : ''}</span>
          {paramB === 0 && <span className="text-rose-600 font-bold ml-1">(b=0: pha cố định)</span>}
        </div>
      )}

      {/* Drag helper prompt */}
      {!readonly && !isDragging && (
        <div className="absolute bottom-2 text-[11px] text-slate-600 bg-white/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 pointer-events-none">
          {paramB === 0
            ? 'Khi b = 0, pha là hằng số c: điều khiển biến x trên đồ thị'
            : 'Chạm và kéo điểm M trên đường tròn để thay đổi góc liên tục'}
        </div>
      )}
    </div>
  );
};
