"use client";

import React, { useState, useMemo } from "react";

type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

interface MathGraphVisualizerProps {
  moduleId: ModuleId;
  onClose: () => void;
}

export default function MathGraphVisualizer({ moduleId, onClose }: MathGraphVisualizerProps) {
  const [activeTab, setActiveTab] = useState<ModuleId>(moduleId);

  // --- State cho Module 4: Functions (Hàm số) ---
  const [funcPreset, setFuncPreset] = useState<number>(0);
  const [funcX0, setFuncX0] = useState<number>(0.5);

  // Helper tính toán hàm số
  const funcCalculations = useMemo(() => {
    if (funcPreset === 0) {
      // y = x^3 - 3x
      const x = Math.max(-2.5, Math.min(2.5, funcX0));
      const y = x * x * x - 3 * x;
      const slope = 3 * x * x - 3;
      return { x, y, slope, label: "y = x³ - 3x" };
    } else {
      // y = (2x + 1)/(x - 1)
      let x = funcX0;
      if (Math.abs(x - 1) < 0.15) {
        x = x >= 1 ? 1.15 : 0.85;
      }
      const y = (2 * x + 1) / (x - 1);
      const slope = -3 / Math.pow(x - 1, 2);
      return { x, y, slope, label: "y = (2x + 1)/(x - 1)" };
    }
  }, [funcPreset, funcX0]);

  // --- State cho Module 5: Calculus (Giải tích) ---
  const [calcTab, setCalcTab] = useState<"secant" | "riemann" | "solid3d">("secant");
  const [calcDeltaT, setCalcDeltaT] = useState<number>(1.0);
  const [calcRiemannN, setCalcRiemannN] = useState<number>(6);
  const [calcSliceX, setCalcSliceX] = useState<number>(2.5);

  // --- State cho Module 6: Probability (Xác suất) ---
  const [probTab, setProbTab] = useState<"bayes" | "dice">("bayes");
  const [diceHistory, setDiceHistory] = useState<number[]>([3, 5, 2, 6, 1, 4, 3, 2, 6, 5]);
  const [lastDice, setLastDice] = useState<number>(6);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  // --- State cho Module 7: Conics & Solids (Hình khối & Conic) ---
  const [conicTab, setConicTab] = useState<"coneCut" | "ellipseFocus">("coneCut");
  const [coneBeta, setConeBeta] = useState<number>(55); // Góc mặt phẳng cắt
  const [ellipseTheta, setEllipseTheta] = useState<number>(45); // Góc tham số M


  // --- State cho Linear Programming (Quy hoạch tuyến tính) ---
  const [presetIndex, setPresetIndex] = useState(0);
  const [levelC, setLevelC] = useState<number>(8);
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 2, y: 2 });
  const [customPointInput, setCustomPointInput] = useState<string>("2, 2");

  const lpPresets = useMemo(
    () => [
      {
        name: "Bài toán xưởng mộc (Cơ bản)",
        fExpr: "F(x, y) = 3x + 2y",
        a: 3,
        b: 2,
        lines: [
          { a: 1, b: 1, c: 6, op: "<=", label: "x + y ≤ 6", color: "#2563eb" },
          { a: 2, b: -1, c: 4, op: "<=", label: "2x - y ≤ 4", color: "#dc2626" },
          { a: 1, b: 0, c: 0, op: ">=", label: "x ≥ 0", color: "#059669" },
          { a: 0, b: 1, c: 0, op: ">=", label: "y ≥ 0", color: "#d97706" },
        ],
        vertices: [
          { name: "O", x: 0, y: 0, f: 0 },
          { name: "A", x: 2, y: 0, f: 6 },
          { name: "B", x: 3.33, y: 2.67, f: 15.33 },
          { name: "C", x: 0, y: 6, f: 12 },
        ],
        polygonPoints: "0,0 2,0 3.33,2.67 0,6",
        xRange: [-1, 7],
        yRange: [-1, 7],
      },
      {
        name: "Miền tam giác giới hạn",
        fExpr: "F(x, y) = 2x + 5y",
        a: 2,
        b: 5,
        lines: [
          { a: 2, b: 3, c: 12, op: "<=", label: "2x + 3y ≤ 12", color: "#2563eb" },
          { a: 1, b: 0, c: 0, op: ">=", label: "x ≥ 0", color: "#059669" },
          { a: 0, b: 1, c: 0, op: ">=", label: "y ≥ 0", color: "#d97706" },
        ],
        vertices: [
          { name: "O", x: 0, y: 0, f: 0 },
          { name: "A", x: 6, y: 0, f: 12 },
          { name: "B", x: 0, y: 4, f: 20 },
        ],
        polygonPoints: "0,0 6,0 0,4",
        xRange: [-1, 8],
        yRange: [-1, 6],
      },
    ],
    []
  );

  const currentLP = lpPresets[presetIndex];

  // Helper tọa độ đồ họa phẳng Oxy
  const svgWidth = 400;
  const svgHeight = 360;
  const pad = 40;
  const xMin = currentLP.xRange[0];
  const xMax = currentLP.xRange[1];
  const yMin = currentLP.yRange[0];
  const yMax = currentLP.yRange[1];

  const scaleX = (x: number) => pad + ((x - xMin) / (xMax - xMin)) * (svgWidth - 2 * pad);
  const scaleY = (y: number) => svgHeight - pad - ((y - yMin) / (yMax - yMin)) * (svgHeight - 2 * pad);

  // Chuyển polygonPoints sang SVG
  const svgPolygon = useMemo(() => {
    return currentLP.polygonPoints
      .split(" ")
      .map((pair) => {
        const [px, py] = pair.split(",").map(Number);
        const sx = pad + ((px - xMin) / (xMax - xMin)) * (svgWidth - 2 * pad);
        const sy = svgHeight - pad - ((py - yMin) / (yMax - yMin)) * (svgHeight - 2 * pad);
        return `${sx},${sy}`;
      })
      .join(" ");
  }, [currentLP, xMin, xMax, yMin, yMax, pad, svgWidth, svgHeight]);

  // Kiểm tra điểm thử có nằm trong miền nghiệm không
  const isTestPointFeasible = useMemo(() => {
    const { x, y } = testPoint;
    for (const l of currentLP.lines) {
      const val = l.a * x + l.b * y;
      if (l.op === "<=" && val > l.c + 1e-6) return false;
      if (l.op === ">=" && val < l.c - 1e-6) return false;
    }
    return true;
  }, [testPoint, currentLP]);

  // --- State cho Lượng giác (Trigonometry) ---
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const angleRad = (angleDeg * Math.PI) / 180;
  const cosVal = Math.cos(angleRad);
  const sinVal = Math.sin(angleRad);
  const tanVal = Math.abs(cosVal) > 1e-4 ? Math.tan(angleRad) : null;
  const cotVal = Math.abs(sinVal) > 1e-4 ? 1 / Math.tan(angleRad) : null;

  const trigR = 120;
  const trigCx = 180;
  const trigCy = 180;
  const pointX = trigCx + trigR * cosVal;
  const pointY = trigCy - trigR * sinVal;

  // Góc phần tư
  const quadrant = useMemo(() => {
    const deg = ((angleDeg % 360) + 360) % 360;
    if (deg > 0 && deg < 90) return "Góc phần tư I (cos > 0, sin > 0)";
    if (deg > 90 && deg < 180) return "Góc phần tư II (cos < 0, sin > 0)";
    if (deg > 180 && deg < 270) return "Góc phần tư III (cos < 0, sin < 0)";
    if (deg > 270 && deg < 360) return "Góc phần tư IV (cos > 0, sin < 0)";
    return "Nằm trên trục tọa độ";
  }, [angleDeg]);

  // --- State cho Hình học không gian (Spatial Geometry) ---
  const [showBasePlane, setShowBasePlane] = useState(true);
  const [showAltitude, setShowAltitude] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fbfcf8] border border-[#dce4dc] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-[#17211f]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#e5ebe4] bg-white/80">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#eaf4ee] text-[#146e52] flex items-center justify-center font-bold text-sm">
              📐
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#17211f] leading-none">Mô hình Toán học Tương tác MathSTEP</h2>
              <p className="text-[11px] text-[#75807a] mt-0.5">Trực quan hóa hình học, đường tròn và miền nghiệm tối ưu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
            title="Đóng bảng vẽ"
          >
            ✕
          </button>
        </div>

        {/* Tab chuyển module */}
        <div className="flex border-b border-[#e5ebe4] bg-[#f4f7f2] px-4 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("linear_programming")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "linear_programming"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>📊</span> Quy hoạch tuyến tính (Miền nghiệm & Đường mức)
          </button>
          <button
            onClick={() => setActiveTab("trigonometry")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "trigonometry"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>⚪</span> Đường tròn lượng giác
          </button>
          <button
            onClick={() => setActiveTab("spatial_geometry")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "spatial_geometry"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>🔺</span> M2: Hình học không gian
          </button>
          <button
            onClick={() => setActiveTab("functions")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "functions"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>📈</span> M4: Hàm số & BBT
          </button>
          <button
            onClick={() => setActiveTab("calculus")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "calculus"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>🔄</span> M5: Giải tích & Khối xoay
          </button>
          <button
            onClick={() => setActiveTab("probability")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "probability"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>🎲</span> M6: Xác suất & Bayes
          </button>
          <button
            onClick={() => setActiveTab("conics_and_solids")}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "conics_and_solids"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>📐</span> M7: Hình khối & Conic
          </button>
        </div>

        {/* Body hiển thị theo Tab */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-xs">
          {activeTab === "linear_programming" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cột trái: Đồ thị phẳng SVG */}
              <div className="md:col-span-7 bg-white p-3 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <div className="w-full flex justify-between items-center text-[11px] mb-2 px-1">
                  <span className="font-bold text-[#146e52]">Mặt phẳng tọa độ Oxy & Miền nghiệm</span>
                  <span className="text-gray-500">Miền đa giác tô màu xanh ngọc</span>
                </div>

                <svg
                  width={svgWidth}
                  height={svgHeight}
                  className="bg-[#fafbf9] border border-gray-100 rounded-lg max-w-full"
                >
                  {/* Lưới tọa độ */}
                  {Array.from({ length: 9 }).map((_, i) => {
                    const gx = scaleX(i);
                    const gy = scaleY(i);
                    return (
                      <React.Fragment key={i}>
                        <line x1={gx} y1={pad} x2={gx} y2={svgHeight - pad} stroke="#f0f2ee" strokeWidth="1" />
                        <line x1={pad} y1={gy} x2={svgWidth - pad} y2={gy} stroke="#f0f2ee" strokeWidth="1" />
                        {i > 0 && (
                          <>
                            <text x={gx} y={scaleY(0) + 14} fontSize="9" fill="#9ca3af" textAnchor="middle">
                              {i}
                            </text>
                            <text x={scaleX(0) - 8} y={gy + 3} fontSize="9" fill="#9ca3af" textAnchor="end">
                              {i}
                            </text>
                          </>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Trục Ox và Oy */}
                  <line
                    x1={pad}
                    y1={scaleY(0)}
                    x2={svgWidth - pad + 15}
                    y2={scaleY(0)}
                    stroke="#374151"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={scaleX(0)}
                    y1={svgHeight - pad}
                    x2={scaleX(0)}
                    y2={pad - 15}
                    stroke="#374151"
                    strokeWidth="1.5"
                  />
                  <text x={svgWidth - pad + 12} y={scaleY(0) - 5} fontSize="11" fontWeight="bold" fill="#374151">
                    x
                  </text>
                  <text x={scaleX(0) + 8} y={pad - 8} fontSize="11" fontWeight="bold" fill="#374151">
                    y
                  </text>
                  <text x={scaleX(0) - 8} y={scaleY(0) + 12} fontSize="10" fill="#374151">
                    O
                  </text>

                  {/* Tô đa giác miền nghiệm (Feasible Region) */}
                  <polygon points={svgPolygon} fill="#146e52" fillOpacity="0.22" stroke="#146e52" strokeWidth="1.5" />

                  {/* Các đường biên */}
                  {currentLP.lines.map((l, idx) => {
                    if (l.a === 1 && l.b === 0) return null; // x >= 0
                    if (l.a === 0 && l.b === 1) return null; // y >= 0
                    // Tìm 2 điểm cắt trục để vẽ đường biên
                    const p1 = { x: -1, y: (l.c - l.a * -1) / l.b };
                    const p2 = { x: 7, y: (l.c - l.a * 7) / l.b };
                    return (
                      <line
                        key={idx}
                        x1={scaleX(p1.x)}
                        y1={scaleY(p1.y)}
                        x2={scaleX(p2.x)}
                        y2={scaleY(p2.y)}
                        stroke={l.color}
                        strokeWidth="1.75"
                        strokeDasharray={l.op.includes("=") ? "" : "4 2"}
                      />
                    );
                  })}

                  {/* Đường mức hàm mục tiêu F(x, y) = ax + by = levelC */}
                  {currentLP.b !== 0 && (
                    <line
                      x1={scaleX(-1)}
                      y1={scaleY((levelC - currentLP.a * -1) / currentLP.b)}
                      x2={scaleX(7)}
                      y2={scaleY((levelC - currentLP.a * 7) / currentLP.b)}
                      stroke="#8b5cf6"
                      strokeWidth="2.5"
                      strokeDasharray="6 3"
                    />
                  )}

                  {/* Các đỉnh đa giác */}
                  {currentLP.vertices.map((v, i) => (
                    <g key={i}>
                      <circle cx={scaleX(v.x)} cy={scaleY(v.y)} r="4.5" fill="#146e52" stroke="#fff" strokeWidth="1.5" />
                      <text
                        x={scaleX(v.x) + 7}
                        y={scaleY(v.y) - 6}
                        fontSize="10"
                        fontWeight="bold"
                        fill="#065f46"
                      >
                        {v.name}({v.x}; {v.y})
                      </text>
                    </g>
                  ))}

                  {/* Điểm thử của học sinh */}
                  <circle
                    cx={scaleX(testPoint.x)}
                    cy={scaleY(testPoint.y)}
                    r="5"
                    fill={isTestPointFeasible ? "#059669" : "#dc2626"}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={scaleX(testPoint.x) + 8}
                    y={scaleY(testPoint.y) + 4}
                    fontSize="10"
                    fontWeight="bold"
                    fill={isTestPointFeasible ? "#059669" : "#dc2626"}
                  >
                    M({testPoint.x}; {testPoint.y})
                  </text>
                </svg>

                <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-[#8b5cf6] inline-block"></span> Đường mức F = c
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669] inline-block"></span> Điểm thỏa mãn
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] inline-block"></span> Không thỏa mãn
                  </span>
                </div>
              </div>

              {/* Cột phải: Bảng điều khiển & Tương tác học tập */}
              <div className="md:col-span-5 flex flex-col gap-3">
                {/* Chọn bài toán mẫu */}
                <div className="bg-white p-3 rounded-xl border border-[#e1e7e0]">
                  <label className="font-bold text-[#17211f] block mb-1.5">Chọn ví dụ hệ bất phương trình:</label>
                  <select
                    className="w-full p-2 border border-[#dce4dc] rounded-lg bg-gray-50 text-xs font-medium"
                    value={presetIndex}
                    onChange={(e) => {
                      setPresetIndex(Number(e.target.value));
                      setLevelC(8);
                    }}
                  >
                    {lpPresets.map((p, i) => (
                      <option key={i} value={i}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Thanh trượt đường mức hàm mục tiêu (Sliding level curve) */}
                <div className="bg-white p-3 rounded-xl border border-[#e1e7e0]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[#8b5cf6]">Đường mức: {currentLP.fExpr}</span>
                    <span className="font-mono font-bold bg-[#f3e8ff] text-[#7e22ce] px-2 py-0.5 rounded">
                      c = {levelC}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="22"
                    step="0.5"
                    value={levelC}
                    onChange={(e) => setLevelC(Number(e.target.value))}
                    className="w-full accent-[#8b5cf6] cursor-pointer mt-1"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    💡 <em>Kéo thanh trượt để quan sát đường thẳng trượt qua miền nghiệm. Đỉnh đầu tiên chạm là GTNN, đỉnh rời sau cùng là GTLN!</em>
                  </p>
                </div>

                {/* Bảng giá trị F tại các đỉnh đa giác */}
                <div className="bg-white p-3 rounded-xl border border-[#e1e7e0]">
                  <span className="font-bold text-[#146e52] block mb-1">Giá trị F(x, y) tại các đỉnh:</span>
                  <div className="space-y-1">
                    {currentLP.vertices.map((v, i) => (
                      <div
                        key={i}
                        className="flex justify-between py-1 px-2 rounded bg-gray-50 text-[11px] items-center"
                      >
                        <span className="font-semibold text-gray-700">
                          Đỉnh {v.name}({v.x}; {v.y}):
                        </span>
                        <span className="font-mono font-bold text-[#146e52]">F = {v.f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kiểm tra điểm thử (Test point) */}
                <div className="bg-white p-3 rounded-xl border border-[#e1e7e0]">
                  <span className="font-bold text-gray-800 block mb-1">Kiểm tra tọa độ điểm M(x; y):</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-1.5 border border-[#dce4dc] rounded-lg text-xs font-mono"
                      value={customPointInput}
                      onChange={(e) => setCustomPointInput(e.target.value)}
                      placeholder="Ví dụ: 2, 3"
                    />
                    <button
                      className="px-3 py-1.5 bg-[#146e52] text-white rounded-lg font-semibold hover:bg-[#0f573f]"
                      onClick={() => {
                        const parts = customPointInput.split(",").map((s) => parseFloat(s.trim()));
                        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                          setTestPoint({ x: parts[0], y: parts[1] });
                        }
                      }}
                    >
                      Kiểm tra
                    </button>
                  </div>
                  <div
                    className={`mt-2 p-1.5 rounded text-[11px] font-medium flex items-center gap-1.5 ${
                      isTestPointFeasible ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    <span>{isTestPointFeasible ? "✓" : "✕"}</span>
                    <span>
                      Điểm M({testPoint.x}; {testPoint.y}){" "}
                      <strong>{isTestPointFeasible ? "THUỘC" : "KHÔNG THUỘC"}</strong> miền nghiệm.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "trigonometry" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Đồ thị đường tròn lượng giác SVG */}
              <div className="md:col-span-7 bg-white p-4 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <span className="text-[11px] font-bold text-[#146e52] mb-1">
                  Đường tròn lượng giác đơn vị R = 1 (Tâm O)
                </span>

                <svg width="360" height="360" className="bg-[#fafbf9] border border-gray-100 rounded-lg">
                  {/* Trục Ox và Oy */}
                  <line x1="20" y1={trigCy} x2="340" y2={trigCy} stroke="#6b7280" strokeWidth="1.5" />
                  <line x1={trigCx} y1="340" x2={trigCx} y2="20" stroke="#6b7280" strokeWidth="1.5" />
                  <text x="342" y={trigCy - 5} fontSize="11" fontWeight="bold" fill="#374151">
                    cos (x)
                  </text>
                  <text x={trigCx + 6} y="18" fontSize="11" fontWeight="bold" fill="#374151">
                    sin (y)
                  </text>
                  <text x={trigCx - 12} y={trigCy + 14} fontSize="10" fill="#6b7280">
                    O
                  </text>

                  {/* Đường tròn đơn vị */}
                  <circle cx={trigCx} cy={trigCy} r={trigR} fill="none" stroke="#2563eb" strokeWidth="2" />

                  {/* Đoạn thẳng hình chiếu cos (trên trục hoành - xanh lam) */}
                  <line
                    x1={trigCx}
                    y1={trigCy}
                    x2={pointX}
                    y2={trigCy}
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Đoạn thẳng hình chiếu sin (trên trục tung - đỏ cam) */}
                  <line
                    x1={trigCx}
                    y1={trigCy}
                    x2={trigCx}
                    y2={pointY}
                    stroke="#dc2626"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Đường nét đứt gióng tọa độ */}
                  <line x1={pointX} y1={trigCy} x2={pointX} y2={pointY} stroke="#9ca3af" strokeDasharray="3 3" />
                  <line x1={trigCx} y1={pointY} x2={pointX} y2={pointY} stroke="#9ca3af" strokeDasharray="3 3" />

                  {/* Bán kính OM */}
                  <line x1={trigCx} y1={trigCy} x2={pointX} y2={pointY} stroke="#059669" strokeWidth="2" />

                  {/* Điểm M */}
                  <circle cx={pointX} cy={pointY} r="5" fill="#059669" stroke="#fff" strokeWidth="2" />
                  <text x={pointX + 7} y={pointY - 6} fontSize="10" fontWeight="bold" fill="#059669">
                    M({cosVal.toFixed(2)}; {sinVal.toFixed(2)})
                  </text>

                  {/* Cung góc alpha */}
                  <path
                    d={`M ${trigCx + 24} ${trigCy} A 24 24 0 ${angleDeg > 180 ? 1 : 0} 0 ${
                      trigCx + 24 * Math.cos(angleRad)
                    } ${trigCy - 24 * Math.sin(angleRad)}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  <text x={trigCx + 28} y={trigCy - 8} fontSize="10" fontWeight="bold" fill="#d97706">
                    {angleDeg}°
                  </text>
                </svg>

                <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-[#2563eb] inline-block"></span> cos α (hoành độ)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-[#dc2626] inline-block"></span> sin α (tung độ)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-[#059669] inline-block"></span> Bán kính R = 1
                  </span>
                </div>
              </div>

              {/* Bảng điều khiển góc & thông số lượng giác */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-800">Điều chỉnh góc α:</span>
                    <span className="font-mono font-bold text-sm bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      α = {angleDeg}° ({((angleRad / Math.PI).toFixed(2))}π rad)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angleDeg}
                    onChange={(e) => setAngleDeg(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mt-1"
                  />
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[0, 30, 45, 60, 90, 120, 150, 180].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setAngleDeg(deg)}
                        className={`py-1 text-[10px] font-medium rounded border ${
                          angleDeg === deg
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2">
                  <span className="font-bold text-gray-800 block">Giá trị 4 hàm lượng giác cơ bản:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-blue-50 border border-blue-100">
                      <span className="text-blue-700 font-semibold block">cos α (trục hoành):</span>
                      <span className="font-mono text-sm font-bold text-blue-900">{cosVal.toFixed(4)}</span>
                    </div>
                    <div className="p-2 rounded bg-red-50 border border-red-100">
                      <span className="text-red-700 font-semibold block">sin α (trục tung):</span>
                      <span className="font-mono text-sm font-bold text-red-900">{sinVal.toFixed(4)}</span>
                    </div>
                    <div className="p-2 rounded bg-purple-50 border border-purple-100">
                      <span className="text-purple-700 font-semibold block">tan α = sin/cos:</span>
                      <span className="font-mono text-sm font-bold text-purple-900">
                        {tanVal !== null ? tanVal.toFixed(4) : "Không xác định"}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                      <span className="text-emerald-700 font-semibold block">cot α = cos/sin:</span>
                      <span className="font-mono text-sm font-bold text-emerald-900">
                        {cotVal !== null ? cotVal.toFixed(4) : "Không xác định"}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-gray-50 rounded text-[11px] text-gray-700 border border-gray-200">
                    <strong>Vị trí:</strong> {quadrant}
                  </div>
                </div>

                <div className="bg-[#f0f8f1] p-3 rounded-xl border border-[#cfe2d2] text-[#285e43]">
                  <strong className="block mb-1">Đẳng thức vàng:</strong>
                  <p className="font-mono text-xs">
                    sin²({angleDeg}°) + cos²({angleDeg}°) = {(sinVal ** 2 + cosVal ** 2).toFixed(4)} = 1
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "spatial_geometry" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Mô hình hình học không gian chiếu phối cảnh */}
              <div className="md:col-span-7 bg-white p-4 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <span className="text-[11px] font-bold text-[#146e52] mb-1">
                  Hình chóp S.ABC với SA ⊥ mặt phẳng đáy (ABC)
                </span>

                <svg width="360" height="320" className="bg-[#fafbf9] border border-gray-100 rounded-lg">
                  {/* Mặt phẳng đáy (ABC) */}
                  {showBasePlane && (
                    <polygon
                      points="80,220 280,240 180,290"
                      fill="#eaf4ee"
                      fillOpacity="0.6"
                      stroke="#83aa90"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Đỉnh S, A, B, C */}
                  {/* S(180, 50), A(180, 230), B(80, 220), C(280, 240) */}
                  {/* Đường cao SA (vuông góc đáy) */}
                  <line
                    x1="180"
                    y1="60"
                    x2="180"
                    y2="230"
                    stroke={showAltitude ? "#dc2626" : "#4b5563"}
                    strokeWidth="2.5"
                    strokeDasharray={showAltitude ? "" : "3 3"}
                  />

                  {/* Cạnh bên SB, SC */}
                  <line x1="180" y1="60" x2="80" y2="220" stroke="#1f2937" strokeWidth="2" />
                  <line x1="180" y1="60" x2="280" y2="240" stroke="#1f2937" strokeWidth="2" />

                  {/* Cạnh đáy: AB nét đứt (khuất), BC nét liền, CA nét đứt (khuất) */}
                  <line x1="80" y1="220" x2="180" y2="230" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="180" y1="230" x2="280" y2="240" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="80" y1="220" x2="280" y2="240" stroke="#1f2937" strokeWidth="2" />

                  {/* Ký hiệu góc vuông SA ⊥ AB và SA ⊥ AC tại chân đường cao A */}
                  <path d="M 170 230 L 170 218 L 180 218" fill="none" stroke="#dc2626" strokeWidth="1.5" />
                  <path d="M 190 230 L 190 218 L 180 218" fill="none" stroke="#dc2626" strokeWidth="1.5" />

                  {/* Điểm và Nhãn */}
                  <circle cx="180" cy="60" r="4.5" fill="#dc2626" />
                  <text x="175" y="48" fontSize="12" fontWeight="bold" fill="#dc2626">
                    S
                  </text>

                  <circle cx="180" cy="230" r="4" fill="#374151" />
                  <text x="184" y="244" fontSize="11" fontWeight="bold" fill="#374151">
                    A (Chân đường cao)
                  </text>

                  <circle cx="80" cy="220" r="4" fill="#374151" />
                  <text x="65" y="224" fontSize="11" fontWeight="bold" fill="#374151">
                    B
                  </text>

                  <circle cx="280" cy="240" r="4" fill="#374151" />
                  <text x="288" y="244" fontSize="11" fontWeight="bold" fill="#374151">
                    C
                  </text>
                </svg>

                <div className="flex gap-4 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-[#dc2626] inline-block"></span> Đường cao SA ⊥ (ABC)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-gray-400 border-dashed inline-block"></span> Cạnh khuất nét đứt
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-[#146e52] inline-block"></span> Mặt phẳng đáy (ABC)
                  </span>
                </div>
              </div>

              {/* Bảng điều khiển quan sát hình học */}
              <div className="md:col-span-5 flex flex-col gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-3">
                  <span className="font-bold text-gray-800 block">Tùy chọn hiển thị mô hình:</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={showBasePlane}
                      onChange={(e) => setShowBasePlane(e.target.checked)}
                      className="accent-[#146e52]"
                    />
                    <span>Tô màu mặt đáy (ABC)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={showAltitude}
                      onChange={(e) => setShowAltitude(e.target.checked)}
                      className="accent-[#dc2626]"
                    />
                    <span>Nhấn mạnh đường cao SA (đỏ)</span>
                  </label>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2">
                  <span className="font-bold text-gray-800 block">Nguyên lý quan sát hình không gian:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-600">
                    <li>
                      <strong>Cạnh thấy vs Cạnh khuất:</strong> Cạnh AB, AC nằm trong đáy bị các mặt bên che khuất nên phải vẽ bằng nét đứt.
                    </li>
                    <li>
                      <strong>Quan hệ vuông góc:</strong> SA ⊥ (ABC) nghĩa là SA vuông góc với <em>mọi</em> đường thẳng trong đáy (ABC), bao gồm cả AB, AC, BC!
                    </li>
                    <li>
                      <strong>Không suy đoán theo mắt nhìn:</strong> Trên hình vẽ phẳng, góc SAB có thể vẽ xiên, nhưng trong không gian nó là góc vuông 90°.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: HÀM SỐ (Module 4) - ĐỒ THỊ & BẢNG BIẾN THIÊN 2 CHIỀU */}
          {/* ======================================================== */}
          {activeTab === "functions" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cột trái: Đồ thị hàm số & Tiếp tuyến */}
              <div className="md:col-span-7 bg-white p-3 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <div className="w-full flex justify-between items-center text-[11px] mb-2 px-1">
                  <span className="font-bold text-[#146e52]">{funcCalculations.label}</span>
                  <span className="text-gray-500">Tiếp điểm M(x₀; y₀) màu đỏ</span>
                </div>

                <div className="w-full flex justify-center bg-[#fafbf9] rounded-lg border border-[#edf1ec] p-2">
                  <svg viewBox="0 0 400 340" className="w-full max-w-[420px] h-auto select-none">
                    {/* Grid */}
                    <defs>
                      <pattern id="gridFunc" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#edf1ec" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="400" height="340" fill="url(#gridFunc)" />

                    {/* Trục Oxy (Gốc O tại 200, 170) */}
                    <line x1="20" y1="170" x2="380" y2="170" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="200" y1="20" x2="200" y2="320" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x="385" y="174" fontSize="11" fill="#64748b" fontWeight="bold">x</text>
                    <text x="204" y="25" fontSize="11" fill="#64748b" fontWeight="bold">y</text>
                    <text x="188" y="184" fontSize="10" fill="#94a3b8">O</text>

                    {/* Tiệm cận đứng & ngang nếu là hàm phân thức (funcPreset === 1) */}
                    {funcPreset === 1 && (
                      <>
                        {/* TC đứng x = 1 -> pixel X = 200 + 1 * 40 = 240 */}
                        <line x1="240" y1="20" x2="240" y2="320" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
                        <text x="245" y="40" fontSize="10" fill="#ef4444" fontWeight="bold">TCĐ: x = 1</text>
                        {/* TC ngang y = 2 -> pixel Y = 170 - 2 * 40 = 90 */}
                        <line x1="20" y1="90" x2="380" y2="90" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
                        <text x="25" y="85" fontSize="10" fill="#3b82f6" fontWeight="bold">TCN: y = 2</text>
                      </>
                    )}

                    {/* Đồ thị hàm số */}
                    {funcPreset === 0 ? (
                      // y = x^3 - 3x (Scale: 1 đơn vị = 45px trên x, 30px trên y)
                      <path
                        d={(() => {
                          let p = "";
                          for (let px = 30; px <= 370; px += 2) {
                            const mathX = (px - 200) / 45;
                            const mathY = mathX * mathX * mathX - 3 * mathX;
                            const py = 170 - mathY * 30;
                            if (py >= 15 && py <= 325) {
                              p += p === "" ? `M ${px} ${py}` : ` L ${px} ${py}`;
                            }
                          }
                          return p;
                        })()}
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="2.5"
                      />
                    ) : (
                      // y = (2x+1)/(x-1) (Scale: 1 đơn vị = 40px)
                      <>
                        <path
                          d={(() => {
                            let p = "";
                            for (let px = 30; px <= 230; px += 2) {
                              const mathX = (px - 200) / 40;
                              if (Math.abs(mathX - 1) < 0.1) continue;
                              const mathY = (2 * mathX + 1) / (mathX - 1);
                              const py = 170 - mathY * 30;
                              if (py >= 15 && py <= 325) {
                                p += p === "" ? `M ${px} ${py}` : ` L ${px} ${py}`;
                              }
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#0f766e"
                          strokeWidth="2.5"
                        />
                        <path
                          d={(() => {
                            let p = "";
                            for (let px = 250; px <= 370; px += 2) {
                              const mathX = (px - 200) / 40;
                              if (Math.abs(mathX - 1) < 0.1) continue;
                              const mathY = (2 * mathX + 1) / (mathX - 1);
                              const py = 170 - mathY * 30;
                              if (py >= 15 && py <= 325) {
                                p += p === "" ? `M ${px} ${py}` : ` L ${px} ${py}`;
                              }
                            }
                            return p;
                          })()}
                          fill="none"
                          stroke="#0f766e"
                          strokeWidth="2.5"
                        />
                      </>
                    )}

                    {/* Điểm cực trị (Hàm bậc 3) */}
                    {funcPreset === 0 && (
                      <>
                        {/* Cực đại (-1, 2) */}
                        <circle cx={200 - 45} cy={170 - 2 * 30} r="4" fill="#d97706" />
                        <text x={200 - 80} y={170 - 2 * 30 - 8} fontSize="10" fill="#d97706" fontWeight="bold">CĐ(-1; 2)</text>
                        {/* Cực tiểu (1, -2) */}
                        <circle cx={200 + 45} cy={170 + 2 * 30} r="4" fill="#2563eb" />
                        <text x={200 + 50} y={170 + 2 * 30 + 14} fontSize="10" fill="#2563eb" fontWeight="bold">CT(1; -2)</text>
                      </>
                    )}

                    {/* Đường tiếp tuyến di động (Đỏ) */}
                    {(() => {
                      const curX = funcCalculations.x;
                      const curY = funcCalculations.y;
                      const k = funcCalculations.slope;
                      const scaleX = funcPreset === 0 ? 45 : 40;
                      const scaleY = 30;
                      const cx = 200 + curX * scaleX;
                      const cy = 170 - curY * scaleY;

                      // 2 đầu mút của tiếp tuyến quanh cx, cy
                      const dx = 100;
                      const dy = -k * (dx / scaleX) * scaleY;

                      return (
                        <>
                          <line
                            x1={cx - dx}
                            y1={cy + dy}
                            x2={cx + dx}
                            y2={cy - dy}
                            stroke="#dc2626"
                            strokeWidth="2"
                            strokeDasharray={Math.abs(k) < 0.05 ? "none" : "none"}
                          />
                          <circle cx={cx} cy={cy} r="5" fill="#dc2626" stroke="#ffffff" strokeWidth="2" />
                          <text x={cx + 8} y={cy - 8} fontSize="11" fill="#dc2626" fontWeight="bold">
                            M({curX.toFixed(1)}; {curY.toFixed(1)})
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Box thông số tiếp tuyến */}
                <div className="mt-3 text-[11px] text-gray-700 bg-[#f4f7f2] p-2.5 rounded-lg w-full">
                  <div className="flex justify-between items-center font-medium">
                    <span>Tiếp điểm M: <strong>({funcCalculations.x.toFixed(2)}; {funcCalculations.y.toFixed(2)})</strong></span>
                    <span>Hệ số góc: <strong>k = f&apos;({funcCalculations.x.toFixed(2)}) = {funcCalculations.slope.toFixed(2)}</strong></span>
                  </div>
                  <div className="mt-1 text-center font-mono text-[#0f573f] text-xs">
                    y = {funcCalculations.slope.toFixed(2)}(x - {funcCalculations.x.toFixed(2)}) + ({funcCalculations.y.toFixed(2)})
                  </div>
                </div>
              </div>

              {/* Cột phải: Bảng biến thiên 2 chiều liên kết & Điều khiển */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-3 shadow-sm">
                  <span className="font-bold text-[#146e52] block">Chọn dạng hàm số khảo sát:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setFuncPreset(0); setFuncX0(0.5); }}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        funcPreset === 0
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Hàm bậc ba</div>
                      <div className="text-[10px] text-gray-500 font-mono">y = x³ - 3x</div>
                    </button>
                    <button
                      onClick={() => { setFuncPreset(1); setFuncX0(2.0); }}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        funcPreset === 1
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Hàm phân thức</div>
                      <div className="text-[10px] text-gray-500 font-mono">y = (2x + 1)/(x - 1)</div>
                    </button>
                  </div>

                  {/* Thanh trượt tiếp điểm x0 */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-gray-700">Tọa độ tiếp điểm x₀:</span>
                      <span className="font-mono font-bold text-[#dc2626] bg-red-50 px-2 py-0.5 rounded">
                        {funcCalculations.x.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={funcPreset === 0 ? -2.2 : -1.5}
                      max={funcPreset === 0 ? 2.2 : 3.5}
                      step="0.05"
                      value={funcX0}
                      onChange={(e) => setFuncX0(parseFloat(e.target.value))}
                      className="w-full accent-[#dc2626] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>{funcPreset === 0 ? "-2.2" : "-1.5"}</span>
                      <span>Kéo để di chuyển tiếp tuyến và quan sát hệ số góc k</span>
                      <span>{funcPreset === 0 ? "+2.2" : "+3.5"}</span>
                    </div>
                  </div>
                </div>

                {/* BẢNG BIẾN THIÊN 2 CHIỀU LIÊN KẾT */}
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2.5 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#146e52]">Bảng biến thiên liên kết 2 chiều</span>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">Đồng bộ với đồ thị</span>
                  </div>

                  {funcPreset === 0 ? (
                    // BBT Hàm bậc 3
                    <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px]">
                      <table className="w-full text-center border-collapse">
                        <tbody>
                          <tr className="border-b border-gray-200 bg-gray-50 font-mono font-semibold">
                            <td className="w-12 py-1.5 border-r border-gray-200 text-gray-600">x</td>
                            <td className="py-1.5 text-gray-500">-∞</td>
                            <td className={`py-1.5 px-2 ${Math.abs(funcCalculations.x - (-1)) < 0.2 ? "bg-amber-100 font-bold text-amber-800" : ""}`}>-1</td>
                            <td className="py-1.5 text-gray-500"></td>
                            <td className={`py-1.5 px-2 ${Math.abs(funcCalculations.x - 1) < 0.2 ? "bg-blue-100 font-bold text-blue-800" : ""}`}>1</td>
                            <td className="py-1.5 text-gray-500">+∞</td>
                          </tr>
                          <tr className="border-b border-gray-200 font-mono">
                            <td className="py-1.5 border-r border-gray-200 bg-gray-50 font-semibold text-gray-600">y&apos;</td>
                            <td className="text-green-600 font-bold">+</td>
                            <td className="font-bold text-gray-700">0</td>
                            <td className="text-red-500 font-bold">-</td>
                            <td className="font-bold text-gray-700">0</td>
                            <td className="text-green-600 font-bold">+</td>
                          </tr>
                          <tr className="font-mono bg-white">
                            <td className="py-3 border-r border-gray-200 bg-gray-50 font-semibold text-gray-600">y</td>
                            <td className="text-gray-400 text-[10px] align-bottom pb-1">-∞</td>
                            <td className="font-bold text-amber-700 align-top pt-1">↗ 2 (CĐ)</td>
                            <td className="text-gray-400 align-middle">↘</td>
                            <td className="font-bold text-blue-700 align-bottom pb-1">-2 (CT) ↗</td>
                            <td className="text-gray-400 text-[10px] align-top pt-1">+∞</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    // BBT Hàm phân thức
                    <div className="border border-gray-200 rounded-lg overflow-hidden text-[11px]">
                      <table className="w-full text-center border-collapse">
                        <tbody>
                          <tr className="border-b border-gray-200 bg-gray-50 font-mono font-semibold">
                            <td className="w-12 py-1.5 border-r border-gray-200 text-gray-600">x</td>
                            <td className="py-1.5 text-gray-500">-∞</td>
                            <td className="py-1.5 px-2"></td>
                            <td className="py-1.5 px-2 bg-red-50 text-red-700 font-bold border-x border-red-200">1 (TCĐ)</td>
                            <td className="py-1.5 px-2"></td>
                            <td className="py-1.5 text-gray-500">+∞</td>
                          </tr>
                          <tr className="border-b border-gray-200 font-mono">
                            <td className="py-1.5 border-r border-gray-200 bg-gray-50 font-semibold text-gray-600">y&apos;</td>
                            <td className="text-red-500 font-bold">-</td>
                            <td></td>
                            <td className="text-red-500 font-bold border-x border-red-200">||</td>
                            <td></td>
                            <td className="text-red-500 font-bold">-</td>
                          </tr>
                          <tr className="font-mono bg-white">
                            <td className="py-3 border-r border-gray-200 bg-gray-50 font-semibold text-gray-600">y</td>
                            <td className="text-blue-700 text-[10px] align-top pt-1">2</td>
                            <td className="text-gray-400 text-[10px] align-bottom pb-1">↘ -∞</td>
                            <td className="border-x border-red-200 text-red-500 font-bold">||</td>
                            <td className="text-gray-400 text-[10px] align-top pt-1">+∞ ↘</td>
                            <td className="text-blue-700 text-[10px] align-bottom pb-1">2</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="p-2.5 bg-[#fbfcf8] rounded-lg border border-[#e5ebe4] text-[11px] text-gray-600 space-y-1">
                    <span className="font-semibold text-gray-800 block">Quy tắc sư phạm cốt lõi:</span>
                    <p>• Khi đồ thị đi lên ($y&apos; &gt; 0$): Tiếp tuyến tạo với Ox góc nhọn, hệ số góc $k &gt; 0$.</p>
                    <p>• Tại điểm cực trị: $y&apos; = 0$, tiếp tuyến nằm ngang ($k = 0$).</p>
                    <p>• Khi đồ thị đi xuống ($y&apos; &lt; 0$): Tiếp tuyến tạo với Ox góc tù, hệ số góc $k &lt; 0$.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: GIẢI TÍCH (Module 5) - CÁT TUYẾN, RIEMANN & KHỐI 3D */}
          {/* ======================================================== */}
          {activeTab === "calculus" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cột trái: Đồ thị tương tác Giải tích */}
              <div className="md:col-span-7 bg-white p-3 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <div className="w-full flex justify-between items-center text-[11px] mb-2 px-1">
                  <span className="font-bold text-[#146e52]">
                    {calcTab === "secant" && "Cát tuyến tiến dần tới Tiếp tuyến (Δt → 0)"}
                    {calcTab === "riemann" && `Tổng Riemann xấp xỉ Diện tích tích phân (N = ${calcRiemannN} hình chữ nhật)`}
                    {calcTab === "solid3d" && `Khối tròn xoay 3D quanh trục Ox (Lát cắt tại x = ${calcSliceX.toFixed(1)})`}
                  </span>
                  <span className="text-gray-500">Mô phỏng động học</span>
                </div>

                <div className="w-full flex justify-center bg-[#fafbf9] rounded-lg border border-[#edf1ec] p-2">
                  {calcTab === "secant" && (
                    <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto select-none">
                      {/* Trục Oxy: Parabol s(t) = t^2 */}
                      <line x1="40" y1="280" x2="380" y2="280" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="60" y1="30" x2="60" y2="290" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="382" y="284" fontSize="11" fill="#64748b" fontWeight="bold">t</text>
                      <text x="64" y="35" fontSize="11" fill="#64748b" fontWeight="bold">s(t)</text>

                      {/* Parabol s = t^2 (Scale: t*70, s*20) */}
                      <path
                        d={(() => {
                          let p = "M 60 280";
                          for (let t = 0; t <= 3.5; t += 0.1) {
                            const px = 60 + t * 70;
                            const py = 280 - (t * t) * 20;
                            p += ` L ${px} ${py}`;
                          }
                          return p;
                        })()}
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="2.5"
                      />

                      {/* Điểm cố định A(1; 1) */}
                      {/* Điểm di động B(1 + Δt; (1+Δt)^2) */}
                      {(() => {
                        const tA = 1;
                        const sA = 1;
                        const ax = 60 + tA * 70;
                        const ay = 280 - sA * 20;

                        const tB = 1 + calcDeltaT;
                        const sB = tB * tB;
                        const bx = 60 + tB * 70;
                        const by = 280 - sB * 20;

                        // Hệ số góc cát tuyến k = (sB - sA) / (tB - tA) = 2 + calcDeltaT
                        const slope = 2 + calcDeltaT;

                        return (
                          <>
                            {/* Đường cát tuyến nối AB kéo dài */}
                            <line
                              x1={ax - 50}
                              y1={ay + (slope * 50 / 70) * 20}
                              x2={bx + 50}
                              y2={by - (slope * 50 / 70) * 20}
                              stroke="#dc2626"
                              strokeWidth="2"
                              strokeDasharray={calcDeltaT < 0.15 ? "none" : "none"}
                            />
                            {/* Điểm A */}
                            <circle cx={ax} cy={ay} r="5" fill="#146e52" stroke="#fff" strokeWidth="2" />
                            <text x={ax - 35} y={ay - 8} fontSize="11" fill="#146e52" fontWeight="bold">A(1; 1)</text>

                            {/* Điểm B */}
                            <circle cx={bx} cy={by} r="5" fill="#dc2626" stroke="#fff" strokeWidth="2" />
                            <text x={bx + 8} y={by - 5} fontSize="11" fill="#dc2626" fontWeight="bold">
                              B({tB.toFixed(2)}; {sB.toFixed(2)})
                            </text>

                            {/* Tam giác độ dời Δt, Δs */}
                            <line x1={ax} y1={ay} x2={bx} y2={ay} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1={bx} y1={ay} x2={bx} y2={by} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
                            <text x={(ax + bx) / 2 - 10} y={ay + 14} fontSize="10" fill="#2563eb" fontWeight="bold">Δt={calcDeltaT.toFixed(2)}</text>
                            <text x={bx + 5} y={(ay + by) / 2} fontSize="10" fill="#2563eb" fontWeight="bold">Δs</text>
                          </>
                        );
                      })()}
                    </svg>
                  )}

                  {calcTab === "riemann" && (
                    <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto select-none">
                      {/* Trục Oxy: y = 4 - x^2 trên [0, 2] */}
                      <line x1="40" y1="260" x2="380" y2="260" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="70" y1="30" x2="70" y2="280" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="382" y="264" fontSize="11" fill="#64748b" fontWeight="bold">x</text>
                      <text x="74" y="35" fontSize="11" fill="#64748b" fontWeight="bold">y</text>
                      <text x="60" y="275" fontSize="10" fill="#94a3b8">0</text>
                      <text x="70 + 260" y="275" fontSize="10" fill="#94a3b8">2</text>

                      {/* Các hình chữ nhật Riemann */}
                      {(() => {
                        const n = calcRiemannN;
                        const dx = 2 / n;
                        const scaleX = 130; // 2 * 130 = 260px
                        const scaleY = 50;  // 4 * 50 = 200px
                        const rects = [];
                        for (let i = 0; i < n; i++) {
                          const midX = (i + 0.5) * dx;
                          const height = Math.max(0, 4 - midX * midX);
                          const rx = 70 + i * dx * scaleX;
                          const rw = dx * scaleX;
                          const rh = height * scaleY;
                          const ry = 260 - rh;
                          rects.push(
                            <rect
                              key={i}
                              x={rx}
                              y={ry}
                              width={rw}
                              height={rh}
                              fill="#99f6e4"
                              stroke="#0f766e"
                              strokeWidth="1"
                              opacity="0.75"
                            />
                          );
                        }
                        return rects;
                      })()}

                      {/* Đường cong y = 4 - x^2 */}
                      <path
                        d={(() => {
                          let p = "M 70 60";
                          for (let x = 0; x <= 2.1; x += 0.05) {
                            const y = Math.max(0, 4 - x * x);
                            const px = 70 + x * 130;
                            const py = 260 - y * 50;
                            p += ` L ${px} ${py}`;
                          }
                          return p;
                        })()}
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="3"
                      />
                    </svg>
                  )}

                  {calcTab === "solid3d" && (
                    <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto select-none">
                      {/* Trục Ox nằm ngang trong 3D */}
                      <line x1="40" y1="160" x2="360" y2="160" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="60" y1="30" x2="60" y2="290" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="365" y="164" fontSize="11" fill="#64748b" fontWeight="bold">Ox</text>

                      {/* Biên của khối tròn xoay: y = ±sqrt(x) quanh Ox từ x=0 đến 4 */}
                      <path
                        d={(() => {
                          let top = "M 60 160";
                          let bot = "";
                          for (let x = 0; x <= 3.8; x += 0.1) {
                            const r = Math.sqrt(x) * 45;
                            const px = 60 + x * 75;
                            top += ` L ${px} ${160 - r}`;
                            bot = ` L ${px} ${160 + r}` + bot;
                          }
                          return top + bot + " Z";
                        })()}
                        fill="#ccfbf1"
                        stroke="#0d9488"
                        strokeWidth="2"
                        opacity="0.6"
                      />

                      {/* Lát cắt tròn tại calcSliceX */}
                      {(() => {
                        const sx = 60 + calcSliceX * 75;
                        const r = Math.sqrt(calcSliceX) * 45;
                        return (
                          <>
                            <ellipse cx={sx} cy="160" rx="14" ry={r} fill="#14b8a6" fillOpacity="0.5" stroke="#0f766e" strokeWidth="2" />
                            <line x1={sx} y1="160" x2={sx} y2={160 - r} stroke="#dc2626" strokeWidth="2" />
                            <text x={sx + 8} y={160 - r / 2} fontSize="10" fill="#dc2626" fontWeight="bold">
                              R = √x = {Math.sqrt(calcSliceX).toFixed(2)}
                            </text>
                            <circle cx={sx} cy="160" r="3" fill="#1e293b" />
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>

                {/* Box tính toán Giải tích */}
                <div className="mt-3 text-[11px] text-gray-700 bg-[#f4f7f2] p-2.5 rounded-lg w-full">
                  {calcTab === "secant" && (
                    <div className="flex justify-between items-center font-mono">
                      <span>Vận tốc trung bình: k_cát = <strong>{(2 + calcDeltaT).toFixed(3)}</strong></span>
                      <span className="text-[#0f573f] font-bold">Vận tốc tức thời: v(1) = s&apos;(1) = lim(Δt→0) k = 2.000</span>
                    </div>
                  )}
                  {calcTab === "riemann" && (
                    <div className="flex justify-between items-center font-mono">
                      <span>Tổng Riemann: S_xấp xỉ ≈ <strong>{(16/3 - 1/(calcRiemannN * 1.5)).toFixed(3)}</strong></span>
                      <span className="text-[#0f573f] font-bold">Tích phân chuẩn: ∫₀² (4 - x²)dx = 16/3 ≈ 5.333</span>
                    </div>
                  )}
                  {calcTab === "solid3d" && (
                    <div className="flex justify-between items-center font-mono">
                      <span>Diện tích lát cắt A(x) = π·(√x)² = <strong>{(Math.PI * calcSliceX).toFixed(2)}</strong></span>
                      <span className="text-[#0f573f] font-bold">Thể tích: V = π ∫₀⁴ x dx = 8π ≈ 25.13</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Bộ điều khiển Giải tích */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-3 shadow-sm">
                  <span className="font-bold text-[#146e52] block">Chọn bài toán tương tác Giải tích:</span>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setCalcTab("secant")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        calcTab === "secant"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">1. Cát tuyến tiến tới Tiếp tuyến</div>
                      <div className="text-[10px] text-gray-500">Ý nghĩa hình học & vật lý của đạo hàm s&apos;(t)</div>
                    </button>
                    <button
                      onClick={() => setCalcTab("riemann")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        calcTab === "riemann"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">2. Tổng Riemann tính Diện tích</div>
                      <div className="text-[10px] text-gray-500">Ý nghĩa hình học của tích phân xác định</div>
                    </button>
                    <button
                      onClick={() => setCalcTab("solid3d")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        calcTab === "solid3d"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">3. Khối tròn xoay 3D quanh Ox</div>
                      <div className="text-[10px] text-gray-500">Lát cắt hình tròn và công thức V = π ∫ [f(x)]² dx</div>
                    </button>
                  </div>

                  {/* Thanh trượt tương ứng */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    {calcTab === "secant" && (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Độ dời thời gian Δt:</span>
                          <span className="font-mono font-bold text-[#dc2626] bg-red-50 px-2 py-0.5 rounded">
                            {calcDeltaT.toFixed(2)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="2.0"
                          step="0.05"
                          value={calcDeltaT}
                          onChange={(e) => setCalcDeltaT(parseFloat(e.target.value))}
                          className="w-full accent-[#dc2626] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>0.05 (Hội tụ)</span>
                          <span>Kéo giảm Δt để cát tuyến trở thành tiếp tuyến</span>
                          <span>2.00</span>
                        </div>
                      </>
                    )}

                    {calcTab === "riemann" && (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Số dải hình chữ nhật N:</span>
                          <span className="font-mono font-bold text-[#0f766e] bg-teal-50 px-2 py-0.5 rounded">
                            {calcRiemannN}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="24"
                          step="2"
                          value={calcRiemannN}
                          onChange={(e) => setCalcRiemannN(parseInt(e.target.value))}
                          className="w-full accent-[#0f766e] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>2 dải</span>
                          <span>Tăng N để tổng Riemann tiến tới tích phân chính xác</span>
                          <span>24 dải</span>
                        </div>
                      </>
                    )}

                    {calcTab === "solid3d" && (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Vị trí lát cắt vuông góc x:</span>
                          <span className="font-mono font-bold text-[#14b8a6] bg-teal-50 px-2 py-0.5 rounded">
                            {calcSliceX.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.5"
                          step="0.1"
                          value={calcSliceX}
                          onChange={(e) => setCalcSliceX(parseFloat(e.target.value))}
                          className="w-full accent-[#14b8a6] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>0.5</span>
                          <span>Di chuyển lát cắt để thấy bán kính R(x) = √x thay đổi</span>
                          <span>3.5</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2 shadow-sm text-[11px] text-gray-600">
                  <span className="font-bold text-gray-800 block">Khắc phục sai lầm thường gặp:</span>
                  <p>• <strong>Diện tích âm:</strong> Tích phân có thể âm nếu đồ thị nằm dưới trục Ox. Tính diện tích luôn phải lấy trị tuyệt đối |f(x)|.</p>
                  <p>• <strong>Quên nhân số π:</strong> Thể tích khối tròn xoay là tổng diện tích các hình tròn π·R², không được quên số π.</p>
                  <p>• <strong>Đạo hàm vs Vận tốc:</strong> Vận tốc v(t) là đạo hàm của quãng đường s&apos;(t); gia tốc a(t) là đạo hàm của vận tốc v&apos;(t).</p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: XÁC SUẤT (Module 6) - SƠ ĐỒ CÂY & CÔNG THỨC BAYES */}
          {/* ======================================================== */}
          {activeTab === "probability" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cột trái: Sơ đồ cây xác suất SVG */}
              <div className="md:col-span-7 bg-white p-3 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <div className="w-full flex justify-between items-center text-[11px] mb-2 px-1">
                  <span className="font-bold text-[#146e52]">
                    {probTab === "bayes" ? "Sơ đồ cây xác suất 2 giai đoạn (Bài toán 2 hộp bi)" : "Mô phỏng gieo xúc xắc 3D ngẫu nhiên"}
                  </span>
                  <span className="text-gray-500">Trực quan hóa công thức Bayes</span>
                </div>

                <div className="w-full flex justify-center bg-[#fafbf9] rounded-lg border border-[#edf1ec] p-2">
                  {probTab === "bayes" ? (
                    <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto select-none">
                      {/* Gốc O (30, 160) */}
                      <circle cx="40" cy="160" r="8" fill="#1e293b" />
                      <text x="32" y="164" fontSize="10" fill="#fff" fontWeight="bold">Ω</text>

                      {/* Giai đoạn 1: Chọn Hộp 1 (40, 160 -> 160, 90) & Chọn Hộp 2 (40, 160 -> 160, 230) */}
                      <line x1="48" y1="160" x2="160" y2="90" stroke="#0f766e" strokeWidth="2.5" />
                      <text x="80" y="115" fontSize="11" fill="#0f766e" fontWeight="bold">P(H₁)=0.5</text>

                      <line x1="48" y1="160" x2="160" y2="230" stroke="#0f766e" strokeWidth="2.5" />
                      <text x="80" y="215" fontSize="11" fill="#0f766e" fontWeight="bold">P(H₂)=0.5</text>

                      {/* Node Hộp 1 & Hộp 2 */}
                      <rect x="160" y="70" width="70" height="40" rx="6" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
                      <text x="172" y="88" fontSize="11" fill="#166534" fontWeight="bold">Hộp 1</text>
                      <text x="168" y="102" fontSize="9" fill="#15803d">3 Đỏ, 2 Xanh</text>

                      <rect x="160" y="210" width="70" height="40" rx="6" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
                      <text x="172" y="228" fontSize="11" fill="#1e40af" fontWeight="bold">Hộp 2</text>
                      <text x="168" y="242" fontSize="9" fill="#1d4ed8">4 Đỏ, 1 Xanh</text>

                      {/* Giai đoạn 2: Từ Hộp 1 rút bi */}
                      <line x1="230" y1="80" x2="310" y2="50" stroke="#dc2626" strokeWidth="2.5" />
                      <text x="245" y="60" fontSize="10" fill="#dc2626" fontWeight="bold">Đỏ (3/5)</text>
                      <circle cx="320" cy="50" r="10" fill="#ef4444" />
                      <text x="340" y="54" fontSize="10" fill="#991b1b" fontWeight="bold">P=0.30</text>

                      <line x1="230" y1="100" x2="310" y2="120" stroke="#059669" strokeWidth="2" />
                      <text x="245" y="125" fontSize="10" fill="#059669" fontWeight="bold">Xanh (2/5)</text>
                      <circle cx="320" cy="120" r="10" fill="#10b981" />
                      <text x="340" y="124" fontSize="10" fill="#065f46">P=0.20</text>

                      {/* Giai đoạn 2: Từ Hộp 2 rút bi */}
                      <line x1="230" y1="220" x2="310" y2="190" stroke="#dc2626" strokeWidth="2.5" />
                      <text x="245" y="200" fontSize="10" fill="#dc2626" fontWeight="bold">Đỏ (4/5)</text>
                      <circle cx="320" cy="190" r="10" fill="#ef4444" />
                      <text x="340" y="194" fontSize="10" fill="#991b1b" fontWeight="bold">P=0.40</text>

                      <line x1="230" y1="240" x2="310" y2="270" stroke="#059669" strokeWidth="2" />
                      <text x="245" y="270" fontSize="10" fill="#059669" fontWeight="bold">Xanh (1/5)</text>
                      <circle cx="320" cy="270" r="10" fill="#10b981" />
                      <text x="340" y="274" fontSize="10" fill="#065f46">P=0.10</text>
                    </svg>
                  ) : (
                    // Gieo xúc xắc 3D
                    <div className="flex flex-col items-center justify-center p-6 space-y-4">
                      <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-2xl shadow-lg flex items-center justify-center text-4xl font-extrabold text-[#146e52]">
                        {lastDice}
                      </div>
                      <button
                        onClick={() => {
                          setIsRolling(true);
                          setTimeout(() => {
                            const roll = Math.floor(Math.random() * 6) + 1;
                            setLastDice(roll);
                            setDiceHistory((prev) => [roll, ...prev.slice(0, 19)]);
                            setIsRolling(false);
                          }, 250);
                        }}
                        disabled={isRolling}
                        className="px-5 py-2 bg-[#146e52] text-white rounded-lg font-bold hover:bg-[#0f573f] transition-all shadow-md active:scale-95"
                      >
                        {isRolling ? "Đang gieo..." : "🎲 Gieo xúc xắc ngẫu nhiên"}
                      </button>
                      <div className="text-xs text-gray-500 font-mono">
                        Lịch sử gieo gần nhất: {diceHistory.slice(0, 8).join(", ")}...
                      </div>
                    </div>
                  )}
                </div>

                {/* Box tính toán Bayes */}
                <div className="mt-3 text-[11px] text-gray-700 bg-[#f4f7f2] p-2.5 rounded-lg w-full">
                  <div className="flex justify-between items-center font-mono">
                    <span>Xác suất toàn phần: P(Đỏ) = 0.5×0.6 + 0.5×0.8 = <strong>0.70</strong></span>
                    <span className="text-[#dc2626] font-bold">Bayes: P(H₁|Đỏ) = 0.30/0.70 ≈ 42.86%</span>
                  </div>
                </div>
              </div>

              {/* Cột phải: Thao tác & Kiểm chứng Xác suất */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-3 shadow-sm">
                  <span className="font-bold text-[#146e52] block">Chế độ khảo sát Xác suất:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setProbTab("bayes")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        probTab === "bayes"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Sơ đồ cây & Bayes</div>
                      <div className="text-[10px] text-gray-500">Bài toán hai hộp bi mẫu</div>
                    </button>
                    <button
                      onClick={() => setProbTab("dice")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        probTab === "dice"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Gieo xúc xắc 3D</div>
                      <div className="text-[10px] text-gray-500">Tần suất thực nghiệm</div>
                    </button>
                  </div>
                </div>

                {/* Diễn giải chi tiết công thức Bayes */}
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2.5 shadow-sm text-[11px] text-gray-700">
                  <span className="font-bold text-[#146e52] block">Quy tắc nhân và cộng trên cây:</span>
                  <p>1. <strong>Nhân trên từng nhánh:</strong></p>
                  <p className="font-mono pl-3 text-gray-600">P(H₁ ∩ Đỏ) = P(H₁) · P(Đỏ|H₁) = 0.5 · 0.6 = 0.30</p>
                  <p className="font-mono pl-3 text-gray-600">P(H₂ ∩ Đỏ) = P(H₂) · P(Đỏ|H₂) = 0.5 · 0.8 = 0.40</p>

                  <p>2. <strong>Cộng các nhánh thuận lợi (Xác suất toàn phần):</strong></p>
                  <p className="font-mono pl-3 text-green-700 font-bold">P(Đỏ) = 0.30 + 0.40 = 0.70</p>

                  <p>3. <strong>Công thức Bayes (Cập nhật niềm tin khi có biến cố Đỏ):</strong></p>
                  <div className="p-2 bg-red-50 rounded text-red-800 font-mono text-center font-bold">
                    P(H₁ | Đỏ) = P(H₁ ∩ Đỏ) / P(Đỏ) = 0.30 / 0.70 = 3/7 ≈ 42.86%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: HÌNH KHỐI & CONIC (Module 7) - CẮT MẶT NÓN 3D & ELIP */}
          {/* ======================================================== */}
          {activeTab === "conics_and_solids" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Cột trái: Trực quan 3D Mặt nón & Conic */}
              <div className="md:col-span-7 bg-white p-3 rounded-xl border border-[#e1e7e0] flex flex-col items-center shadow-sm">
                <div className="w-full flex justify-between items-center text-[11px] mb-2 px-1">
                  <span className="font-bold text-[#146e52]">
                    {conicTab === "coneCut" ? "Mặt phẳng cắt mặt nón tròn xoay hai tầng 3D" : "Đường Elip & Hai tiêu điểm F₁, F₂"}
                  </span>
                  <span className="text-gray-500">
                    {conicTab === "coneCut"
                      ? coneBeta === 90
                        ? "Tiết diện: Đường tròn (e = 0)"
                        : coneBeta > 30
                        ? "Tiết diện: Đường Elip (0 < e < 1)"
                        : coneBeta === 30
                        ? "Tiết diện: Đường Parabol (e = 1)"
                        : "Tiết diện: Đường Hypebol 2 nhánh (e > 1)"
                      : "Tổng khoảng cách d₁ + d₂ = 2a không đổi"}
                  </span>
                </div>

                <div className="w-full flex justify-center bg-[#fafbf9] rounded-lg border border-[#edf1ec] p-2">
                  {conicTab === "coneCut" ? (
                    <svg viewBox="0 0 400 340" className="w-full max-w-[420px] h-auto select-none">
                      {/* Trục đối xứng mặt nón */}
                      <line x1="200" y1="20" x2="200" y2="320" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" />

                      {/* Nón trên (Đỉnh O tại 200, 170) */}
                      <polygon points="200,170 110,40 290,40" fill="#ccfbf1" fillOpacity="0.4" stroke="#0d9488" strokeWidth="1.5" />
                      <ellipse cx="200" cy="40" rx="90" ry="20" fill="#99f6e4" fillOpacity="0.5" stroke="#0d9488" strokeWidth="1.5" />

                      {/* Nón dưới */}
                      <polygon points="200,170 110,300 290,300" fill="#ccfbf1" fillOpacity="0.4" stroke="#0d9488" strokeWidth="1.5" />
                      <ellipse cx="200" cy="300" rx="90" ry="20" fill="#99f6e4" fillOpacity="0.5" stroke="#0d9488" strokeWidth="1.5" />

                      {/* Đỉnh nón O */}
                      <circle cx="200" cy="170" r="4" fill="#1e293b" />
                      <text x="206" y="174" fontSize="10" fill="#1e293b" fontWeight="bold">O (Đỉnh nón)</text>

                      {/* Mặt phẳng cắt nghiêng góc coneBeta so với trục nón */}
                      {(() => {
                        const rad = (coneBeta * Math.PI) / 180;
                        const len = 120;
                        const dx = len * Math.sin(rad);
                        const dy = len * Math.cos(rad);
                        const cx = 200;
                        const cy = 110; // Cắt ở tầng nón trên

                        return (
                          <>
                            {/* Mặt phẳng cắt */}
                            <line
                              x1={cx - dx}
                              y1={cy + dy}
                              x2={cx + dx}
                              y2={cy - dy}
                              stroke="#dc2626"
                              strokeWidth="3"
                            />
                            {/* Tiết diện conic */}
                            {coneBeta > 30 ? (
                              <ellipse
                                cx={cx}
                                cy={cy}
                                rx="35"
                                ry={15 + (coneBeta - 30) * 0.4}
                                fill="#fca5a5"
                                fillOpacity="0.6"
                                stroke="#b91c1c"
                                strokeWidth="2"
                                transform={`rotate(${90 - coneBeta} ${cx} ${cy})`}
                              />
                            ) : (
                              <path
                                d={`M ${cx - 30} ${cy + 50} Q ${cx} ${cy - 10} ${cx + 30} ${cy + 50}`}
                                fill="none"
                                stroke="#b91c1c"
                                strokeWidth="2.5"
                              />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    // 2D Ellipse với tiêu điểm
                    <svg viewBox="0 0 400 320" className="w-full max-w-[420px] h-auto select-none">
                      {/* Trục Oxy */}
                      <line x1="30" y1="160" x2="370" y2="160" stroke="#94a3b8" strokeWidth="1.5" />
                      <line x1="200" y1="30" x2="200" y2="290" stroke="#94a3b8" strokeWidth="1.5" />
                      <text x="375" y="164" fontSize="11" fill="#64748b" fontWeight="bold">x</text>
                      <text x="204" y="35" fontSize="11" fill="#64748b" fontWeight="bold">y</text>

                      {/* Elip: a = 120px (4 đơn vị), b = 80px (2.67 đơn vị) -> c = sqrt(120^2 - 80^2) = sqrt(8000) = 89.4px */}
                      <ellipse cx="200" cy="160" rx="120" ry="80" fill="#ccfbf1" fillOpacity="0.3" stroke="#0f766e" strokeWidth="2.5" />

                      {/* Tiêu điểm F1(-c; 0), F2(c; 0) */}
                      <circle cx={200 - 89.4} cy="160" r="5" fill="#2563eb" />
                      <text x={200 - 95} y="180" fontSize="10" fill="#2563eb" fontWeight="bold">F₁(-c; 0)</text>

                      <circle cx={200 + 89.4} cy="160" r="5" fill="#2563eb" />
                      <text x={200 + 85} y="180" fontSize="10" fill="#2563eb" fontWeight="bold">F₂(c; 0)</text>

                      {/* Điểm M trên Elip */}
                      {(() => {
                        const rad = (ellipseTheta * Math.PI) / 180;
                        const mx = 200 + 120 * Math.cos(rad);
                        const my = 160 - 80 * Math.sin(rad);

                        return (
                          <>
                            {/* Bán kính qua tiêu MF1, MF2 */}
                            <line x1={200 - 89.4} y1="160" x2={mx} y2={my} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
                            <line x1={200 + 89.4} y1="160" x2={mx} y2={my} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />

                            <circle cx={mx} cy={my} r="6" fill="#dc2626" stroke="#fff" strokeWidth="2" />
                            <text x={mx + 8} y={my - 8} fontSize="11" fill="#dc2626" fontWeight="bold">
                              M(x; y)
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>

                {/* Banner phân loại Conic */}
                <div className="mt-3 text-[11px] text-gray-700 bg-[#f4f7f2] p-2.5 rounded-lg w-full">
                  {conicTab === "coneCut" ? (
                    <div className="flex justify-between items-center font-mono">
                      <span>Góc nghiêng mặt phẳng β = <strong>{coneBeta}°</strong> (Góc đường sinh α = 30°)</span>
                      <span className="font-bold text-[#0f573f]">
                        {coneBeta === 90 && "Đường tròn (β = 90°, e = 0)"}
                        {coneBeta > 30 && coneBeta < 90 && "Đường Elip (β > α, 0 < e < 1)"}
                        {coneBeta === 30 && "Đường Parabol (β = α, e = 1)"}
                        {coneBeta < 30 && "Đường Hypebol 2 nhánh (β < α, e > 1)"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center font-mono">
                      <span>Tiêu cự: 2c ≈ 5.96 · Bán trục: a = 4, b = 2.67</span>
                      <span className="font-bold text-[#dc2626]">Định nghĩa: MF₁ + MF₂ = 2a = 8.00 (Không đổi)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột phải: Điều khiển & Phân tích Conic */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-3 shadow-sm">
                  <span className="font-bold text-[#146e52] block">Chọn bài toán tương tác:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setConicTab("coneCut")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        conicTab === "coneCut"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Cắt mặt nón 3D</div>
                      <div className="text-[10px] text-gray-500">Sinh 3 đường Conic</div>
                    </button>
                    <button
                      onClick={() => setConicTab("ellipseFocus")}
                      className={`p-2 rounded-lg border text-left font-medium transition-all ${
                        conicTab === "ellipseFocus"
                          ? "border-[#146e52] bg-[#f0fdf4] text-[#146e52] shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="font-bold">Elip & Tiêu điểm</div>
                      <div className="text-[10px] text-gray-500">MF₁ + MF₂ = 2a</div>
                    </button>
                  </div>

                  {/* Thanh trượt */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    {conicTab === "coneCut" ? (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Góc nghiêng mặt phẳng β:</span>
                          <span className="font-mono font-bold text-[#0f573f] bg-teal-50 px-2 py-0.5 rounded">
                            {coneBeta}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="90"
                          step="1"
                          value={coneBeta}
                          onChange={(e) => setConeBeta(parseInt(e.target.value))}
                          className="w-full accent-[#0f573f] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>10° (Hypebol)</span>
                          <span>30° (Parabol)</span>
                          <span>90° (Đường tròn)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">Vị trí điểm M (Góc θ):</span>
                          <span className="font-mono font-bold text-[#dc2626] bg-red-50 px-2 py-0.5 rounded">
                            {ellipseTheta}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          step="5"
                          value={ellipseTheta}
                          onChange={(e) => setEllipseTheta(parseInt(e.target.value))}
                          className="w-full accent-[#dc2626] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>0°</span>
                          <span>Kéo để điểm M chạy dọc theo đường cong Elip</span>
                          <span>360°</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#e1e7e0] space-y-2 shadow-sm text-[11px] text-gray-600">
                  <span className="font-bold text-gray-800 block">Quy chuẩn Sách giáo khoa & Conic:</span>
                  <p>• <strong>Định nghĩa Elip:</strong> Tập hợp điểm M sao cho $MF_1 + MF_2 = 2a$ (với $2a &gt; 2c$). Tâm sai $e = c/a &lt; 1$.</p>
                  <p>• <strong>Định nghĩa Hypebol:</strong> Tập hợp điểm M sao cho $|MF_1 - MF_2| = 2a$ (với $2a &lt; 2c$). Tâm sai $e = c/a &gt; 1$.</p>
                  <p>• <strong>Định nghĩa Parabol:</strong> Tập hợp điểm M cách đều tiêu điểm F và đường chuẩn $\Delta$. Tâm sai $e = 1$.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e5ebe4] bg-[#fbfcf8] flex justify-between items-center text-[11px] text-gray-500">
          <span>Hệ thống trực quan hóa MathSTEP · Hỗ trợ tư duy trực quan Toán THPT</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#146e52] text-white rounded-lg font-semibold hover:bg-[#0f573f] transition-colors"
          >
            Quay lại phòng học
          </button>
        </div>
      </div>
    </div>
  );
}
