"use client";

import React, { useState } from "react";
import { getAllStations } from "../lib/stationCatalogData";
import {
  Flame,
  Users,
  Presentation,
  Download,
  Compass,
  Send,
  Lightbulb,
  SlidersHorizontal,
  Target,
  Play,
  CheckCircle,
} from "lucide-react";

interface TeacherDashboardProps {
  onLaunchStation?: (stationId: string) => void;
  onOpenWorkbench?: () => void;
}

interface MisconceptionStat {
  code: string;
  name: string;
  category: "Đại số" | "Hình học" | "Lượng giác & Giải tích";
  count: number;
  total: number;
  severity: "high" | "medium" | "low";
  description: string;
  intervention: string;
}

const INITIAL_MISCONCEPTIONS: MisconceptionStat[] = [
  {
    code: "M1",
    name: "Nhầm chiều BPT khi nhân/chia số âm",
    category: "Đại số",
    count: 13,
    total: 30,
    severity: "medium",
    description: "Học sinh quên đổi chiều bất đẳng thức khi nhân hai vế với số âm (ví dụ: -2x ≤ 6 biến đổi thành x ≤ -3 thay vì x ≥ -3).",
    intervention: "Gói 4 bài tập phản ví dụ Oxy ghim chấm đỏ P(-4, 0).",
  },
  {
    code: "M2",
    name: "Quên điều kiện biến nguyên trong thực tế",
    category: "Đại số",
    count: 17,
    total: 30,
    severity: "high",
    description: "Trong bài toán quy hoạch đội xe, khẩu phần ăn, học sinh lấy nghiệm phân số/thập phân mà không xét x, y ∈ ℕ*.",
    intervention: "Gói bài tập Isomorphic Integer-Vertex Generator (Đỉnh nguyên ℤ²).",
  },
  {
    code: "M3",
    name: "Thế nhầm tọa độ đỉnh vào hàm mục tiêu F(x, y)",
    category: "Đại số",
    count: 9,
    total: 30,
    severity: "low",
    description: "Nhầm hoành độ x và tung độ y khi tính giá trị biểu thức chi phí/lợi nhuận F = ax + by tại các đỉnh của đa giác.",
    intervention: "Bảng tính đối chiếu tự động 4 đỉnh với KaTeX.",
  },
  {
    code: "G1",
    name: "Ngộ nhận hai đường thẳng chéo nhau là cắt nhau",
    category: "Hình học",
    count: 19,
    total: 30,
    severity: "high",
    description: "Học sinh nhìn hình biểu diễn phẳng 2D thấy hai đoạn thẳng giao nhau nên suy diễn chúng có điểm chung trong không gian.",
    intervention: "Mô hình 3D xoay mặt phẳng phụ bộc lộ khoảng cách cao độ d(d₁, d₂) > 0.",
  },
  {
    code: "G2",
    name: "Vẽ sai nét liền / nét đứt cho cạnh bị khuất",
    category: "Hình học",
    count: 11,
    total: 30,
    severity: "medium",
    description: "Không phân biệt được mặt nhìn thấy và mặt bị che lấp khi nhìn từ góc quan sát chuẩn.",
    intervention: "Chế độ Auto Hidden-Line trong WebGL 3D với nút gạt độ trong suốt.",
  },
  {
    code: "G3",
    name: "Nhầm góc giữa đường thẳng và mặt phẳng",
    category: "Hình học",
    count: 14,
    total: 30,
    severity: "medium",
    description: "Lấy góc giữa đường thẳng với một cạnh đáy bất kỳ thay vì góc với hình chiếu vuông góc lên mặt đáy.",
    intervention: "Trực quan hóa vector pháp tuyến n và hình chiếu vuông góc H.",
  },
  {
    code: "T1",
    name: "Nhầm dấu hàm lượng giác ở góc tù (90° đến 180°)",
    category: "Lượng giác & Giải tích",
    count: 12,
    total: 30,
    severity: "medium",
    description: "Cho rằng cos và sin luôn dương như trong tam giác vuông cấp 2.",
    intervention: "Đường tròn đơn vị tương tác với trục chiếu màu xanh (sin > 0) và đỏ (cos < 0).",
  },
  {
    code: "T2",
    name: "Đồng nhất f'(x₀) = 0 với điểm cực trị",
    category: "Lượng giác & Giải tích",
    count: 15,
    total: 30,
    severity: "high",
    description: "Nghĩ rằng hễ f'(x₀) = 0 thì x₀ là cực trị mà không kiểm tra điều kiện đổi dấu (ví dụ y = x³ tại x = 0).",
    intervention: "Mô phỏng tiếp tuyến nằm ngang nhưng đồ thị không đổi chiều lồi lõm.",
  },
  {
    code: "T3",
    name: "Nhầm lẫn giữa P(A|B) và P(B|A)",
    category: "Lượng giác & Giải tích",
    count: 10,
    total: 30,
    severity: "low",
    description: "Đồng nhất xác suất có bệnh khi test dương tính với xác suất test dương tính khi có bệnh (Nghịch lý công thức Bayes).",
    intervention: "Sơ đồ cây xác suất 2 tầng trực quan hóa diện tích tỷ lệ.",
  },
];

const INITIAL_STUDENTS = [
  { id: "HS01", name: "Nguyễn Văn An", currentStation: "10.03", step: 6, errors: ["M1", "M3"], preScore: 4.5, postScore: 8.5, status: "Đã khắc phục" },
  { id: "HS02", name: "Trần Thị Bình", currentStation: "10.03", step: 8, errors: ["M2"], preScore: 5.0, postScore: 9.0, status: "Đã hoàn thành" },
  { id: "HS03", name: "Lê Hoàng Cường", currentStation: "11.06", step: 4, errors: ["G1", "G2"], preScore: 3.5, postScore: 7.5, status: "Đang can thiệp" },
  { id: "HS04", name: "Phạm Thùy Dung", currentStation: "11.06", step: 7, errors: ["G1"], preScore: 6.0, postScore: 9.5, status: "Đã hoàn thành" },
  { id: "HS05", name: "Đỗ Minh Đức", currentStation: "11.01", step: 5, errors: ["T1"], preScore: 4.0, postScore: 8.0, status: "Đã khắc phục" },
  { id: "HS06", name: "Vũ Hải Yến", currentStation: "10.06", step: 3, errors: ["T2"], preScore: 5.5, postScore: 8.5, status: "Đang can thiệp" },
  { id: "HS07", name: "Hoàng Gia Bảo", currentStation: "10.03", step: 8, errors: ["M2"], preScore: 4.5, postScore: 8.5, status: "Đã hoàn thành" },
  { id: "HS08", name: "Ngô Khánh Linh", currentStation: "11.06", step: 6, errors: ["G1", "G3"], preScore: 6.5, postScore: 10.0, status: "Đã hoàn thành" },
  { id: "HS09", name: "Bùi Tuấn Kiệt", currentStation: "10.03", step: 2, errors: ["M1", "M2"], preScore: 3.0, postScore: 7.0, status: "Cần hỗ trợ 1:1" },
  { id: "HS10", name: "Đặng Mai Phương", currentStation: "11.01", step: 7, errors: ["T1"], preScore: 5.0, postScore: 8.5, status: "Đã khắc phục" },
  { id: "HS11", name: "Phan Quốc Huy", currentStation: "10.03", step: 5, errors: ["M2"], preScore: 5.0, postScore: 8.0, status: "Đang can thiệp" },
  { id: "HS12", name: "Trịnh Thảo My", currentStation: "11.06", step: 8, errors: ["G2"], preScore: 6.0, postScore: 9.0, status: "Đã hoàn thành" },
];

export default function TeacherDashboard({ onLaunchStation, onOpenWorkbench }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<"heatmap" | "roster" | "presentation" | "assign">("heatmap");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [misconceptions] = useState<MisconceptionStat[]>(INITIAL_MISCONCEPTIONS);
  const [students] = useState(INITIAL_STUDENTS);
  const [assignedNotice, setAssignedNotice] = useState<string | null>(null);
  const [presentationTopic, setPresentationTopic] = useState<string>("10.03");

  const stations = getAllStations();

  const filteredMisconceptions = misconceptions.filter((m) => {
    if (selectedCategory === "all") return true;
    return m.category === selectedCategory;
  });

  const handleAssignIntervention = (code: string) => {
    const item = misconceptions.find((m) => m.code === code);
    if (!item) return;
    setAssignedNotice(`Đã tự động gửi "${item.intervention}" tới ${item.count} học sinh đang mắc lỗi [${code}]!`);
    setTimeout(() => setAssignedNotice(null), 4500);
  };

  const handleExportCSV = () => {
    let csv = "Mã HS,Họ và tên,Trạm học,Bước hiện tại,Mã lỗi ban đầu,Pre-test,Post-test,Tăng trưởng,Trạng thái\n";
    students.forEach((s) => {
      const growth = (s.postScore - s.preScore).toFixed(1);
      csv += `${s.id},"${s.name}",${s.currentStation},${s.step},"${s.errors.join("; ")}",${s.preScore},${s.postScore},+${growth},"${s.status}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MathSTEP_Bao_Cao_Lop_Hoc_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 md:px-6 space-y-6 text-[#152f35]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#14532d] via-[#087e7c] to-[#0f766e] text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold uppercase tracking-widest text-[#a7f3d0]">
              Phân hệ Giáo viên & Trình chiếu Lớp học
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-[11px] font-bold text-white border border-emerald-300/40">
              KNTT & GDPT 2018
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Teacher Dashboard & Classroom Presentation
          </h1>
          <p className="text-xs md:text-sm text-gray-100 leading-relaxed">
            Theo dõi ma trận nhiệt lỗi sai nhận thức (M1–M3, G1–G3, T1–T3), giao bài can thiệp thích ứng và khởi chạy chế độ trình chiếu tương tác toàn màn hình không có thanh công cụ phụ.
          </p>
        </div>
        <div className="absolute right-4 bottom-2 text-8xl text-white/5 font-serif select-none pointer-events-none">
        </div>
      </div>

      {/* Quick Action Topbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#d9e4e2] shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "heatmap"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "bg-[#f8faf9] text-gray-600 hover:bg-[#edf6f3] border border-[#d9e4e2]"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Ma trận lỗi sai (Heatmap)</span>
          </button>
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "roster"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "bg-[#f8faf9] text-gray-600 hover:bg-[#edf6f3] border border-[#d9e4e2]"
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Tiến độ học sinh ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("presentation")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "presentation"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "bg-[#f8faf9] text-gray-600 hover:bg-[#edf6f3] border border-[#d9e4e2]"
            }`}
          >
            <Presentation className="w-4 h-4 text-purple-500" />
            <span>Trình chiếu bài giảng</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-gray-50 border border-[#bed0cd] rounded-xl text-xs font-bold text-[#152f35] flex items-center gap-1.5 shadow-sm transition-all"
            title="Xuất bảng dữ liệu thực nghiệm Pre/Post-test của lớp"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Xuất báo cáo CSV</span>
          </button>
          {onOpenWorkbench && (
            <button
              onClick={onOpenWorkbench}
              className="px-3.5 py-2 bg-[#146e52] hover:bg-[#0f573f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Vào phòng thực hành</span>
            </button>
          )}
        </div>
      </div>

      {assignedNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignedNotice}</span>
        </div>
      )}

      {/* TAB 1: MA TRẬN LỖI SAI (HEATMAP) */}
      {activeTab === "heatmap" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#152f35]">
                Ma trận tần suất lỗi tư duy toán học (Misconception Heatmap)
              </h2>
              <p className="text-xs text-gray-500">
                Phân loại theo nghiên cứu lỗi Newman & SGK Kết nối tri thức. Giúp giáo viên phát hiện ngay &ldquo;điểm nghẽn&rdquo; của lớp học.
              </p>
            </div>
            <div className="flex gap-1.5 bg-[#f0f4f3] p-1 rounded-xl text-xs font-bold">
              {[
                { id: "all", label: "Tất cả" },
                { id: "Đại số", label: "Đại số (M)" },
                { id: "Hình học", label: "Hình học (G)" },
                { id: "Lượng giác & Giải tích", label: "Lượng giác & Giải tích (T)" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    selectedCategory === c.id
                      ? "bg-white text-[#087e7c] shadow-xs font-extrabold"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMisconceptions.map((m) => {
              const percent = Math.round((m.count / m.total) * 100);
              const isHigh = percent >= 50;
              const isMed = percent >= 35 && percent < 50;

              return (
                <div
                  key={m.code}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                    isHigh
                      ? "bg-rose-50/60 border-rose-200"
                      : isMed
                      ? "bg-amber-50/60 border-amber-200"
                      : "bg-emerald-50/50 border-emerald-200"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-black px-2 py-0.5 rounded-lg bg-white border border-gray-200 text-[#152f35] shadow-xs">
                        Mã {m.code}
                      </span>
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? "bg-rose-200 text-rose-800"
                            : isMed
                            ? "bg-amber-200 text-amber-800"
                            : "bg-emerald-200 text-emerald-800"
                        }`}
                      >
                        {percent}% học sinh ({m.count}/{m.total})
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-[#152f35] leading-snug">
                      {m.name}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isHigh ? "bg-rose-600" : isMed ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {m.description}
                    </p>

                    <div className="p-2.5 rounded-xl bg-white/80 border border-gray-200/80 text-[10px] space-y-1">
                      <span className="font-bold text-[#087e7c] flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-[#087e7c]" />
                        <span>Kế hoạch can thiệp gợi ý:</span>
                      </span>
                      <span className="text-gray-700">{m.intervention}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAssignIntervention(m.code)}
                      className="flex-1 py-1.5 px-2 bg-[#087e7c] hover:bg-[#066563] text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Giao bài can thiệp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#d9e4e2] flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
              <div>
                <strong>Quy trình can thiệp tuần hoàn:</strong>
                <p className="text-gray-600 text-[11px]">
                  1. Học sinh thao tác mô hình → 2. Phát hiện lỗi qua bộ quy tắc tất định → 3. Phản ví dụ trực quan → 4. Giáo viên ấn nút giao bài luyện đỉnh nguyên.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                misconceptions.forEach((m) => {
                  if (m.count >= 14) handleAssignIntervention(m.code);
                });
              }}
              className="px-4 py-2 bg-[#152f35] hover:bg-black text-white font-bold rounded-xl shrink-0 transition-colors"
            >
              Giao toàn bộ gói bài tập báo động đỏ
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TIẾN ĐỘ HỌC SINH (ROSTER) */}
      {activeTab === "roster" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#152f35]">
                Danh sách học sinh & Nhật ký tiến độ 8 bước
              </h2>
              <p className="text-xs text-gray-500">
                Minh chứng thực nghiệm khách quan: điểm Pre-test, Post-test và các mã lỗi đang được can thiệp.
              </p>
            </div>
            <span className="text-xs font-bold text-[#087e7c] bg-[#edf6f3] px-3 py-1.5 rounded-xl border border-[#bed0cd]">
              Hiệu quả can thiệp lớp: Effect Size d = 0.88 (Rất cao)
            </span>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-[#d9e4e2] shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f0f4f3] border-b border-[#d9e4e2] text-[#152f35]">
                  <th className="p-3 font-bold">Mã HS</th>
                  <th className="p-3 font-bold">Họ và tên</th>
                  <th className="p-3 font-bold">Trạm học</th>
                  <th className="p-3 font-bold">Bước nhận thức</th>
                  <th className="p-3 font-bold">Mã lỗi đã bộc lộ</th>
                  <th className="p-3 font-bold text-center">Pre-test</th>
                  <th className="p-3 font-bold text-center">Post-test</th>
                  <th className="p-3 font-bold text-center">Tăng trưởng</th>
                  <th className="p-3 font-bold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f1]">
                {students.map((s) => {
                  const growth = (s.postScore - s.preScore).toFixed(1);
                  return (
                    <tr key={s.id} className="hover:bg-[#f9fbfb] transition-colors">
                      <td className="p-3 font-mono font-bold text-[#087e7c]">{s.id}</td>
                      <td className="p-3 font-medium text-[#152f35]">{s.name}</td>
                      <td className="p-3 font-mono text-gray-600">{s.currentStation}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-[#edf6f3] text-[#087e7c] font-bold text-[11px] border border-[#a3e2cf]">
                          Bước {s.step}/8
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {s.errors.map((err) => (
                            <span
                              key={err}
                              className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-mono text-[10px] font-bold"
                            >
                              {err}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-gray-500">{s.preScore}</td>
                      <td className="p-3 text-center font-bold text-[#087e7c]">{s.postScore}</td>
                      <td className="p-3 text-center font-black text-emerald-600">+{growth}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "Đã hoàn thành"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.status === "Đã khắc phục"
                              ? "bg-teal-100 text-teal-800"
                              : s.status === "Đang can thiệp"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRÌNH CHIẾU BÀI GIẢNG (PRESENTATION) */}
      {activeTab === "presentation" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#152f35]">
                Chế độ Trình chiếu Lớp học (Classroom Presentation Mode)
              </h2>
              <p className="text-xs text-gray-500">
                Hiển thị mô hình tương tác 2D/3D phóng lớn, ẩn công cụ phụ, tối ưu cho màn hình tương tác và máy chiếu lớp học.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-3">
              <label className="text-xs font-bold text-[#152f35] block">
                Chọn trạm học để trình chiếu:
              </label>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {stations.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setPresentationTopic(st.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      presentationTopic === st.id
                        ? "bg-[#edf6f3] border-[#087e7c] text-[#087e7c] font-bold shadow-xs"
                        : "bg-white border-[#d9e4e2] text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                        Trạm {st.id}
                      </span>
                      <span className="text-[10px] text-gray-400">Lớp {st.grade}</span>
                    </div>
                    <div className="line-clamp-1">{st.title}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-[#d9e4e2] flex flex-col justify-between space-y-4">
              {(() => {
                const currentSt = stations.find((s) => s.id === presentationTopic) || stations[0];
                return (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#edf2f1] pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#087e7c] uppercase tracking-wider">
                            Trạm học được chọn
                          </span>
                          <h3 className="text-base font-bold text-[#152f35] mt-0.5">
                            {currentSt.id} · {currentSt.title}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#eff8f4] text-[#087e7c] text-xs font-bold border border-[#a3e2cf]">
                          {currentSt.is3D ? "Không gian 3D" : "Hình học 2D"}
                        </span>
                      </div>

                      <div className="p-3 bg-[#f8faf9] rounded-xl border border-[#d9e4e2] space-y-2 text-xs">
                        <div>
                          <strong className="text-[#087e7c]">Mục tiêu sư phạm:</strong>
                          <p className="text-gray-700 mt-0.5">{currentSt.goal}</p>
                        </div>
                        <div>
                          <strong className="text-[#087e7c]">Căn cứ SGK:</strong>
                          <p className="text-gray-700 mt-0.5">{currentSt.source}</p>
                        </div>
                        <div>
                          <strong className="text-[#087e7c]">Nhiệm vụ trực quan:</strong>
                          <p className="text-gray-700 mt-0.5">{currentSt.simulation}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200">
                          <span className="font-bold text-[#087e7c] flex items-center gap-1 mb-1">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-[#087e7c]" />
                            <span>Tùy chọn hiển thị SGK KNTT:</span>
                          </span>
                          <ul className="list-disc list-inside text-gray-600 text-[11px] space-y-0.5">
                            <li>Gạch sọc phần sai, giữ trắng miền đúng</li>
                            <li>Đường biên nét liền (≤, ≥) / nét đứt (&lt;, &gt;)</li>
                            <li>Ghim chấm phản ví dụ màu đỏ trực quan</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200">
                          <span className="font-bold text-indigo-800 flex items-center gap-1 mb-1">
                            <Users className="w-3.5 h-3.5 text-indigo-700" />
                            <span>Tương tác lớp học:</span>
                          </span>
                          <ul className="list-disc list-inside text-gray-600 text-[11px] space-y-0.5">
                            <li>Kéo thả tham số mượt mà theo thời gian thực</li>
                            <li>Tự động bộc lộ mâu thuẫn để cả lớp phản biện</li>
                            <li>Font công thức KaTeX cỡ lớn dễ nhìn từ xa</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-[#edf2f1]">
                      <button
                        onClick={() => {
                          if (onLaunchStation) onLaunchStation(currentSt.id);
                        }}
                        className="flex-1 py-3 bg-[#087e7c] hover:bg-[#066563] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Bắt đầu trình chiếu Trạm {currentSt.id}</span>
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
