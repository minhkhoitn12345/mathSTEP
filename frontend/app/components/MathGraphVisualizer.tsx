"use client";

import React, { useState, useMemo } from "react";

type ModuleId = "linear_programming" | "spatial_geometry" | "trigonometry";

interface MathGraphVisualizerProps {
  moduleId: ModuleId;
  onClose: () => void;
}

export default function MathGraphVisualizer({ moduleId, onClose }: MathGraphVisualizerProps) {
  const [activeTab, setActiveTab] = useState<ModuleId>(moduleId);

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
        <div className="flex border-b border-[#e5ebe4] bg-[#f4f7f2] px-4 gap-2 text-xs font-semibold">
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
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "spatial_geometry"
                ? "border-[#146e52] text-[#146e52] bg-white rounded-t-lg"
                : "border-transparent text-[#75807a] hover:text-[#17211f]"
            }`}
          >
            <span>🔺</span> Hình học không gian (Hình chóp SA ⊥ đáy)
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
