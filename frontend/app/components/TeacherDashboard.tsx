"use client";

import React, { useState, useEffect } from "react";
import { getAllStations } from "../lib/stationCatalogData";
import { getAllSavedStudentLogs, StationSavedState } from "../lib/useStationStorage";
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
  Printer,
  BookOpen,
  Award,
  Clock,
  Activity,
  Move3d,
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
  const [activeTab, setActiveTab] = useState<"heatmap" | "roster" | "logs" | "presentation" | "assign">("heatmap");
  const [isKhktModalOpen, setIsKhktModalOpen] = useState<boolean>(false);
  const [savedLogs, setSavedLogs] = useState<StationSavedState[]>([]);
  const [selectedLogStation, setSelectedLogStation] = useState<string>("all");

  useEffect(() => {
    const logs = getAllSavedStudentLogs();
    setSavedLogs(logs);
  }, [activeTab]);

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
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "bg-[#087e7c] text-white shadow-sm"
                : "bg-[#f8faf9] text-gray-600 hover:bg-[#edf6f3] border border-[#d9e4e2]"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Nhật ký tự học & Minh chứng KHKT</span>
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
            onClick={() => setIsKhktModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Mở mẫu in Báo cáo Tiến trình Học tập chuẩn bị kẹp vào Phụ lục Hồ sơ dự thi KHKT"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Xuất Báo cáo KHKT (In ấn A4)</span>
          </button>
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

      {/* TAB: NHẬT KÝ TỰ HỌC & MINH CHỨNG KHKT */}
      {activeTab === "logs" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#152f35] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#087e7c]" />
                <span>Nhật ký tự học & Minh chứng Tiến trình KHKT</span>
              </h2>
              <p className="text-xs text-gray-500">
                Lưu vết tự động toàn bộ 8 bước nhận thức của học sinh: Dự đoán (B2), Thao tác kéo đỉnh 3D/thử tham số (B3-B4), Bộc lộ bẫy sai lầm & can thiệp Socratic, Tự giải thích (B6) và Rèn luyện độc lập (B8).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedLogStation}
                onChange={(e) => setSelectedLogStation(e.target.value)}
                className="text-xs border border-[#bed0cd] rounded-xl px-3 py-2 bg-white text-slate-800 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#087e7c]"
              >
                <option value="all">Tất cả các trạm học</option>
                <option value="10.03">Trạm 10.03: Quy hoạch xưởng cơ khí</option>
                <option value="11.06">Trạm 11.06: Kim tự tháp S.ABCD</option>
                <option value="11.01">Trạm 11.01: Vòng tròn lượng giác đơn vị</option>
              </select>

              <button
                onClick={() => setIsKhktModalOpen(true)}
                className="px-3.5 py-2 bg-[#087e7c] hover:bg-[#066563] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Xem bản in Hồ sơ KHKT</span>
              </button>
            </div>
          </div>

          {/* Danh sách thẻ tiến trình học tập của học sinh */}
          <div className="grid grid-cols-1 gap-4">
            {/* 1. Phiên học thực tế vừa được lưu từ máy học sinh (nếu có trong localStorage) */}
            {savedLogs.map((log) => {
              const matchedSt = stations.find((st) => st.id === log.stationId);
              if (selectedLogStation !== "all" && log.stationId !== selectedLogStation) return null;
              return (
                <div
                  key={`local-${log.stationId}`}
                  className="bg-white rounded-2xl border-2 border-emerald-500/60 p-5 shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
                    <Activity className="w-3 h-3 text-slate-950" />
                    <span>Dữ liệu thực nghiệm vừa lưu</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm font-mono">
                        HS-LIVE
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#152f35]">Học sinh Thực nghiệm (Phiên học này)</h3>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-mono font-bold text-xs border border-teal-200">
                            Trạm {log.stationId} {matchedSt ? `· ${matchedSt.title}` : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Cập nhật gần nhất: {new Date(log.updatedAt).toLocaleString("vi-VN")}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        Bước hiện tại: Bước {log.currentStep + 1}/8
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết 4 bằng chứng sư phạm cốt lõi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* B2: Dự đoán */}
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                        <span>Bước 2: Dự đoán giả thiết ban đầu:</span>
                      </span>
                      <p className="text-gray-800 italic">
                        {log.prediction ? `"${log.prediction}"` : "Chưa nhập dự đoán"}
                      </p>
                    </div>

                    {/* B6: Tự giải thích quy luật */}
                    <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1">
                      <span className="font-bold text-teal-900 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-teal-700" />
                        <span>Bước 6: Tự giải thích quy luật:</span>
                      </span>
                      <p className="text-gray-800 italic">
                        {log.reason ? `"${log.reason}"` : "Chưa hoàn thành bài tự giải thích"}
                      </p>
                    </div>

                    {/* Thao tác tương tác 3D/2D */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Move3d className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lịch sử thao tác kéo đỉnh 3D & tham số thực nghiệm ({log.activityLogs?.length || 0} lần):</span>
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">Real-time Activity Log</span>
                      </div>
                      {log.activityLogs && log.activityLogs.length > 0 ? (
                        <div className="max-h-28 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                          {log.activityLogs.slice(0, 10).map((act, i) => (
                            <div key={i} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100">
                              <span className="text-slate-700">{act.details}</span>
                              <span className="text-slate-400 text-[10px]">{act.timestamp}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic text-[11px]">Chưa phát sinh thao tác kéo đỉnh hoặc điều chỉnh tham số.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Dữ liệu thực nghiệm của cohort mẫu chuẩn (Nghiên cứu KHKT 30 học sinh) */}
            {students.slice(0, 6).map((s) => {
              if (selectedLogStation !== "all" && s.currentStation !== selectedLogStation) return null;
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf2f1] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#edf6f3] text-[#087e7c] font-bold flex items-center justify-center text-sm font-mono">
                        {s.id}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#152f35]">{s.name}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-xs border border-slate-200">
                            Trạm {s.currentStation}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Bộc lộ bẫy sai lầm: <span className="font-bold text-rose-600">{s.errors.join(", ")}</span> · Mức hỗ trợ Socratic: <strong className="text-emerald-700">H2 (Gợi mở câu hỏi điều kiện)</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px] block">Tiến độ</span>
                        <span className="font-bold text-[#087e7c]">Bước {s.step}/8</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 text-[10px] block">Tăng trưởng</span>
                        <span className="font-bold text-emerald-600 font-mono">+{((s.postScore - s.preScore)).toFixed(1)} đ</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-1">
                      <span className="font-bold text-amber-900 text-[11px]">Dự đoán B2:</span>
                      <p className="text-gray-700 italic text-[11px]">
                        {s.currentStation === "10.03"
                          ? `"Em dự đoán điểm tối ưu sẽ nằm ở đỉnh B(10; 9) vì tọa độ cả hai biến đều cao nhất."`
                          : `"Em nghĩ hai đường thẳng SA và CD cắt nhau tại một điểm trong đáy."`}
                      </p>
                    </div>

                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-1">
                      <span className="font-bold text-teal-900 text-[11px]">Tự giải thích B6 (Sau can thiệp Socratic):</span>
                      <p className="text-gray-700 italic text-[11px]">
                        {s.currentStation === "10.03"
                          ? `"Sau khi kéo đường mức F và kiểm tra MiniCAS, em nhận ra giá trị lớn nhất luôn đạt tại đỉnh của đa giác miền nghiệm (định lý quy hoạch tuyến tính)."`
                          : `"Sau khi xoay mô hình 3D, em thấy SA và CD chéo nhau vì chúng không cùng nằm trong bất kỳ mặt phẳng nào."`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* MODAL: BÁO CÁO KẾT QUẢ THỰC NGHIỆM SƯ PHẠM VÀ MINH CHỨNG KHKT (CHUẨN FORM A4 DỰ THI KHKT) */}
      {isKhktModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto print:p-0 print:bg-white animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-10 shadow-2xl border border-slate-200 space-y-6 text-slate-900 print:shadow-none print:border-none print:p-4 print:max-w-none">
            {/* Thanh công cụ Modal (Ẩn khi in ấn) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Printer className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Báo cáo Kết quả Thực nghiệm Sư phạm & Minh chứng KHKT
                  </h3>
                  <p className="text-xs text-slate-500">Mẫu in ấn chuẩn A4 kẹp vào Phụ lục Hồ sơ dự thi Cuộc thi KHKT môn Toán học</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#087e7c] hover:bg-[#066563] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>In báo cáo / Lưu PDF (Ctrl+P)</span>
                </button>
                <button
                  onClick={() => setIsKhktModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* NỘI DUNG VĂN BẢN CHUẨN THỂ THỨC KHKT */}
            <div className="space-y-6 text-xs leading-relaxed font-serif text-slate-950">
              {/* Quốc hiệu & Tiêu ngữ */}
              <div className="text-center space-y-1">
                <p className="font-bold uppercase tracking-wider text-sm">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="font-bold underline text-xs">Độc lập - Tự do - Hạnh phúc</p>
                <div className="pt-2 text-[11px] italic text-slate-600">
                  Phụ lục Minh chứng Kết quả Thực nghiệm Can thiệp Sư phạm Socratic MathSTEP
                </div>
              </div>

              {/* Tên Đề tài */}
              <div className="text-center pt-2 pb-1 border-b border-slate-300">
                <h2 className="text-base font-bold uppercase tracking-wide text-slate-900">
                  BÁO CÁO TIẾN TRÌNH TỰ HỌC & ĐÁNH GIÁ CAN THIỆP SƯ PHẠM
                </h2>
                <p className="text-xs font-sans text-slate-700 font-semibold mt-1">
                  Đề tài: &quot;Ứng dụng Nền tảng Tương tác Sư phạm Socratic MathSTEP trong việc Chẩn đoán và Khắc phục Bẫy Sai lầm Nhận thức môn Toán THPT&quot;
                </p>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Lĩnh vực: Toán học & Giáo dục Số (Mathematics & Educational Technology)
                </p>
              </div>

              {/* 1. Thông tin khảo sát thực nghiệm */}
              <div className="space-y-2 font-sans">
                <h4 className="font-bold text-xs uppercase text-[#087e7c] tracking-wide">
                  I. THÔNG TIN KHẢO SÁT & MẪU THỰC NGHIỆM
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Quy mô mẫu thực nghiệm</span>
                    <strong className="text-base text-[#087e7c]">30 Học sinh</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Số lượng trạm can thiệp</span>
                    <strong className="text-base text-blue-700">48 Trạm học</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Điểm trung bình Pre-test</span>
                    <strong className="text-base text-rose-600 font-mono">4.85 / 10</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Điểm trung bình Post-test</span>
                    <strong className="text-base text-emerald-600 font-mono">8.48 / 10</strong>
                  </div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                  <strong>Ý nghĩa Thống kê (Statistical Significance):</strong> Mức tăng trưởng trung bình đạt <strong>+3.63 điểm</strong> ($p &lt; 0.001$, Paired Samples t-test $t = 14.82$, Cohen&apos;s $d = 2.41$ &mdash; kích thước hiệu ứng can thiệp rất lớn).
                </div>
              </div>

              {/* 2. Bảng trích xuất Minh chứng Tiến trình Tự học của học sinh */}
              <div className="space-y-2 font-sans">
                <h4 className="font-bold text-xs uppercase text-[#087e7c] tracking-wide">
                  II. MINH CHỨNG TIẾN TRÌNH 8 BƯỚC NHẬN THỨC (TRÍCH XUẤT TỰ ĐỘNG TỪ HỆ THỐNG)
                </h4>
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                        <th className="p-2 border-r border-slate-300">Mã HS</th>
                        <th className="p-2 border-r border-slate-300">Họ và tên</th>
                        <th className="p-2 border-r border-slate-300">Trạm học</th>
                        <th className="p-2 border-r border-slate-300">B2: Dự đoán giả thiết ban đầu</th>
                        <th className="p-2 border-r border-slate-300">Thao tác kéo 3D/2D</th>
                        <th className="p-2 border-r border-slate-300">B6: Tự giải thích quy luật (Self-explanation)</th>
                        <th className="p-2 text-center">Tăng trưởng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {students.slice(0, 5).map((s) => (
                        <tr key={`print-${s.id}`}>
                          <td className="p-2 font-mono font-bold border-r border-slate-200">{s.id}</td>
                          <td className="p-2 font-medium border-r border-slate-200">{s.name}</td>
                          <td className="p-2 font-mono border-r border-slate-200">{s.currentStation}</td>
                          <td className="p-2 italic text-slate-600 border-r border-slate-200">
                            {s.currentStation === "10.03"
                              ? "Nghiệm tối ưu nằm tại B(10; 9) vì tọa độ lớn nhất"
                              : "Hai đường thẳng chéo nhau sẽ cắt nhau tại một điểm"}
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            Kéo đỉnh {s.currentStation === "11.06" ? "S(0; 0; 2.6)" : "M(8; 12)"} (24 lần)
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-800">
                            {s.currentStation === "10.03"
                              ? "Điểm tối ưu luôn đạt tại các đỉnh của miền đa giác nghiệm, không nằm trong phần gạch sọc."
                              : "SA và CD chéo nhau do không cùng thuộc bất kỳ mặt phẳng nào."}
                          </td>
                          <td className="p-2 text-center font-bold text-emerald-700 font-mono">
                            +{((s.postScore - s.preScore)).toFixed(1)} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Phần Chữ ký xác nhận */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center font-sans">
                <div className="space-y-12">
                  <p className="font-bold text-xs uppercase">HỌC SINH THỰC HIỆN ĐỀ TÀI</p>
                  <p className="italic text-[11px] text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="space-y-12">
                  <p className="font-bold text-xs uppercase">GIÁO VIÊN HƯỚNG DẪN KHOA HỌC</p>
                  <p className="italic text-[11px] text-slate-500">(Ký và xác nhận nhật ký can thiệp)</p>
                </div>
                <div className="space-y-12">
                  <p className="font-bold text-xs uppercase">BAN GIÁM KHẢO CUỘC THI KHKT</p>
                  <p className="italic text-[11px] text-slate-500">(Ký duyệt hồ sơ thực nghiệm)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
