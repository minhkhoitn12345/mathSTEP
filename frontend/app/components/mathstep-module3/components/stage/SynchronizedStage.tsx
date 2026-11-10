/**
 * MathSTEP Module 3: Lượng Giác
 * Synchronized Stage (UI05 - Center Interactive Workspace)
 * Bridges Unit Circle with Function Graph, with dynamic projection linkage,
 * responsive tab switching (Sync / Circle / Graph), and specialized activity modes
 * (Transformations, Formula Builders, Equation Intersections, and Ferris Wheel Real-World Simulation).
 * Enhanced:
 * - Direct bidirectional synchronization: Dragging M on circle or P on graph updates single state
 * - Value Bridge between M and P (sine ordinate, cosine abscissa to ordinate, tan/cot tangents)
 * - Exact mathematical coordinate display for P and M
 * - Parameterized phase φ = bx + c handling
 * - Follow P and Focus P viewport controls
 * - Principal angle comparison P_θ
 */

import React, { useState, useMemo } from 'react';
import { ActivityId, ExactAngle, FunctionParams, FunctionType, TrigValues } from '../../types/math';
import { TrigCircleStage } from './TrigCircleStage';
import { FunctionGraphStage } from './FunctionGraphStage';
import { solveTrigEquation, parseAndNormalizeAngle, getTrigValues, evaluateTrigFunction } from '../../mathCore/trigMath';

interface SynchronizedStageProps {
  activityId: ActivityId;
  angle: ExactAngle; // independent variable x
  trigValues: TrigValues;
  onAngleChange: (deg: number) => void;
  functionType: FunctionType;
  params: FunctionParams;
  onParamsChange?: (newParams: FunctionParams) => void;
  periodShiftOverlay?: number | null;
  secondaryAngle?: ExactAngle | null;
  secondaryLabel?: string;
  isAssessmentMode?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  unit?: 'deg' | 'rad';
}

export const SynchronizedStage: React.FC<SynchronizedStageProps> = ({
  activityId,
  angle,
  trigValues,
  onAngleChange,
  functionType,
  params,
  periodShiftOverlay = null,
  secondaryAngle = null,
  secondaryLabel = 'N(β)',
  isAssessmentMode = false,
  onInteractionStart,
  onInteractionEnd,
  unit = 'rad',
}) => {
  const [viewTab, setViewTab] = useState<'sync' | 'circle' | 'graph'>('sync');
  const [showPrincipalComparison, setShowPrincipalComparison] = useState(false);

  // Specialized view for Ferris Wheel in LG13
  const isFerrisWheel = activityId === 'LG13';
  const isEquationActivity = activityId === 'LG11' || activityId === 'LG12';

  // Equation solution if in LG11/LG12
  const eqSolution = isEquationActivity
    ? activityId === 'LG12'
      ? solveTrigEquation('sin_eq_cos', 0, 0, 2 * Math.PI, true, false)
      : solveTrigEquation('sin_m', -0.5, 0, 2 * Math.PI, true, false)
    : null;

  // Compute phase φ = b*x + c
  const isParameterized = params.b !== 1 || params.c !== 0;
  const phaseAngle = useMemo(() => {
    if (!isParameterized) return angle;
    const phaseRad = params.b * angle.radDecimal + params.c;
    const phaseDeg = (phaseRad * 180) / Math.PI;
    return parseAndNormalizeAngle(`${phaseDeg}deg`, 'deg');
  }, [isParameterized, params.b, params.c, angle.radDecimal, angle]);

  const phaseTrigValues = useMemo(() => {
    if (!isParameterized) return trigValues;
    return getTrigValues(phaseAngle);
  }, [isParameterized, phaseAngle, trigValues]);

  // Current evaluation for P on graph
  const evalP = useMemo(() => {
    return evaluateTrigFunction(functionType, angle.radDecimal, params);
  }, [functionType, angle.radDecimal, params]);

  // Handle graph P drag
  const handleGraphXChange = (newXRad: number) => {
    const newXDeg = (newXRad * 180) / Math.PI;
    onAngleChange(Math.round(newXDeg * 10) / 10);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Top stage header with view selector and coordinate telemetry */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Không gian tương tác</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              x = {angle.degDecimal.toFixed(1)}°
            </span>
            <span className="text-slate-500">
              ({(angle.radDecimal / Math.PI).toFixed(2)}π rad)
            </span>
            {isParameterized && (
              <span className="text-purple-600 dark:text-purple-400 font-semibold ml-1">
                · Pha φ = {phaseAngle.degDecimal.toFixed(1)}° ({(phaseAngle.radDecimal / Math.PI).toFixed(2)}π)
              </span>
            )}
          </div>
        </div>

        {/* Segmented controls: Sync / Circle / Graph */}
        <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewTab('sync')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewTab === 'sync'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Đồng bộ hóa (M & P)
          </button>
          <button
            onClick={() => setViewTab('circle')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewTab === 'circle'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Đường tròn (M)
          </button>
          <button
            onClick={() => setViewTab('graph')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              viewTab === 'graph'
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Đồ thị (P)
          </button>
        </div>
      </div>

      {/* Synchronized Value Bridge between Unit Circle and Graph (In Sync Mode) */}
      {viewTab === 'sync' && !isFerrisWheel && (
        <div className="px-4 py-1.5 bg-gradient-to-r from-blue-50/80 via-slate-50 to-orange-50/80 dark:from-blue-950/30 dark:via-slate-900 dark:to-orange-950/30 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11.5px] font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-slate-100">Liên kết đồng bộ:</span>
            {functionType === 'sin' && (
              <span>
                Tung độ điểm <strong className="text-orange-600">M(y_M = {phaseTrigValues.sin.exact})</strong>
                {' ➔ '}
                Tung độ điểm <strong className="text-orange-600">P(y_P = {evalP.y?.toFixed(3) ?? '?'})</strong>
              </span>
            )}
            {functionType === 'cos' && (
              <span>
                Hoành độ điểm <strong className="text-blue-600">M(x_M = {phaseTrigValues.cos.exact})</strong>
                {' ➔ Ánh xạ sang ➔ '}
                Tung độ điểm <strong className="text-blue-600">P(y_P = {evalP.y?.toFixed(3) ?? '?'})</strong>
              </span>
            )}
            {functionType === 'tan' && (
              <span>
                Điểm cắt trên trục tan <strong className="text-purple-600">T(1; {phaseTrigValues.tan.exact})</strong>
                {' ➔ '}
                Tung độ điểm <strong className="text-purple-600">P(y_P = {evalP.y !== null ? evalP.y.toFixed(3) : 'Không xác định'})</strong>
              </span>
            )}
            {functionType === 'cot' && (
              <span>
                Điểm cắt trên trục cot <strong className="text-emerald-600">S({phaseTrigValues.cot.exact}; 1)</strong>
                {' ➔ '}
                Tung độ điểm <strong className="text-emerald-600">P(y_P = {evalP.y !== null ? evalP.y.toFixed(3) : 'Không xác định'})</strong>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-sans">
            Kéo điểm <strong>M</strong> trên đường tròn hoặc kéo điểm <strong>P</strong> trên đồ thị
          </div>
        </div>
      )}

      {/* Main Interactive Stage Body */}
      <div className="flex-1 w-full h-full relative p-2 overflow-auto">
        {/* FERRIS WHEEL SPECIALIZED SIMULATION IN LG13 */}
        {isFerrisWheel ? (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Ferris wheel visual */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Mô hình đu quay thực tế: h(t) = 3 + 2 sin(πt/6)
              </div>
              <svg viewBox="0 0 340 340" className="w-full max-w-[320px] h-auto">
                <line x1="20" y1="300" x2="320" y2="300" stroke="#64748B" strokeWidth="3" />
                <text x="30" y="320" fill="#64748B" fontSize="11" fontWeight="600">Mặt đất (h = 0m)</text>

                <line x1="170" y1="180" x2="110" y2="300" stroke="#94A3B8" strokeWidth="4" />
                <line x1="170" y1="180" x2="230" y2="300" stroke="#94A3B8" strokeWidth="4" />

                <circle cx="170" cy="180" r="80" fill="none" stroke="#3B82F6" strokeWidth="3" />
                <circle cx="170" cy="180" r="7" fill="#1E293B" />
                <line x1="20" y1="180" x2="320" y2="180" stroke="#94A3B8" strokeWidth="1" strokeDasharray="3,3" />
                <text x="250" y="174" fill="#64748B" fontSize="10">Trục tâm (h = 3m)</text>

                <line x1="20" y1="140" x2="320" y2="140" stroke="#EA580C" strokeWidth="1.5" strokeDasharray="4,4" />
                <text x="250" y="134" fill="#EA580C" fontSize="10" fontWeight="600">Độ cao h = 4m</text>

                {(() => {
                  const t = (angle.degDecimal / 360) * 12;
                  const wheelRad = (Math.PI * t) / 6;
                  const cabX = 170 + 80 * Math.cos(wheelRad);
                  const cabY = 180 - 80 * Math.sin(wheelRad);
                  const currentHeight = (3 + 2 * Math.sin(wheelRad)).toFixed(2);
                  return (
                    <g>
                      <line x1="170" y1="180" x2={cabX} y2={cabY} stroke="#3B82F6" strokeWidth="2" />
                      <circle cx={cabX} cy={cabY} r="10" fill="#EA580C" stroke="#FFFFFF" strokeWidth="2" />
                      <text x={cabX + 12} y={cabY + 4} fill="#0F172A" fontSize="11" fontWeight="700">
                        h = {currentHeight}m
                      </text>
                    </g>
                  );
                })()}
              </svg>
              <div className="text-[11px] text-slate-500 mt-2 text-center">
                Thời gian t = {(((angle.degDecimal % 360) + 360) % 360 / 30).toFixed(1)} giây · Chu kỳ T = 12s
              </div>
            </div>

            {/* Accompanying Graph */}
            <div className="w-full h-full flex flex-col justify-center">
              <FunctionGraphStage
                functionType="sin"
                params={{ a: 2, b: Math.PI / 6, c: 0, d: 3 }}
                currentXRad={(angle.degDecimal * Math.PI) / 180}
                onXChange={handleGraphXChange}
                onInteractionStart={onInteractionStart}
                onInteractionEnd={onInteractionEnd}
                xRange={[0, 12]}
                yRange={[0, 6]}
                unit={unit}
              />
            </div>
          </div>
        ) : (
          /* STANDARD STAGE: SPLIT OR FOCUSED */
          <div
            className={`w-full h-full ${
              viewTab === 'sync'
                ? 'grid grid-cols-1 lg:grid-cols-2 gap-4 items-center'
                : 'flex items-center justify-center'
            }`}
          >
            {/* Unit Circle View */}
            {(viewTab === 'sync' || viewTab === 'circle') && (
              <div className="w-full h-full flex items-center justify-center min-h-[360px]">
                <TrigCircleStage
                  angle={angle}
                  trigValues={phaseTrigValues}
                  onAngleChange={onAngleChange}
                  onInteractionStart={onInteractionStart}
                  onInteractionEnd={onInteractionEnd}
                  paramB={params.b}
                  paramC={params.c}
                  phaseAngle={isParameterized ? phaseAngle : null}
                  secondaryAngle={secondaryAngle}
                  secondaryLabel={secondaryLabel}
                  showSpecialTriangle={activityId === 'LG03'}
                  isAssessmentMode={isAssessmentMode}
                />
              </div>
            )}

            {/* Function Graph View */}
            {(viewTab === 'sync' || viewTab === 'graph') && (
              <div className="w-full h-full flex items-center justify-center min-h-[340px]">
                <FunctionGraphStage
                  functionType={functionType}
                  params={params}
                  currentXRad={angle.radDecimal}
                  onXChange={handleGraphXChange}
                  onInteractionStart={onInteractionStart}
                  onInteractionEnd={onInteractionEnd}
                  periodShiftOverlay={periodShiftOverlay}
                  showPrincipalComparison={showPrincipalComparison}
                  onTogglePrincipalComparison={() => setShowPrincipalComparison(!showPrincipalComparison)}
                  representativeAngleRad={angle.representativeRad}
                  degDecimal={angle.degDecimal}
                  unit={unit}
                  isAssessmentMode={isAssessmentMode}
                />
              </div>
            )}
          </div>
        )}

        {/* Equation Roots Overlay in LG11/LG12 */}
        {isEquationActivity && eqSolution && (
          <div className="absolute bottom-3 left-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 shadow-lg text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5 font-bold text-slate-800 dark:text-slate-100">
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {eqSolution.equationText}
              </span>
              <span className="text-slate-500 font-sans">
                {eqSolution.intervalRoots.length} nghiệm trên {eqSolution.intervalDesc}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {eqSolution.intervalRoots.map((root, i) => (
                <button
                  key={i}
                  onClick={() => onAngleChange(root.xDeg)}
                  className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono font-medium border border-blue-200 dark:border-blue-700 transition-colors"
                >
                  x{i + 1} = {root.formattedPi} ({root.xDeg.toFixed(0)}°)
                </button>
              ))}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 leading-tight">
              {eqSolution.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
