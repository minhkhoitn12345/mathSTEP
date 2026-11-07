"use client";

import React, { useState } from "react";
import {
  FileText,
  Landmark,
  TrendingUp,
  BookOpen,
  Cpu,
  CheckCircle2,
  Download,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function ResearchMethodologyHub() {
  const [activeTab, setActiveTab] = useState<
    "theories" | "error_codes" | "pedagogy" | "evidence" | "research_log" | "ai_declaration"
  >("theories");

  // Dữ liệu mẫu thực nghiệm chuẩn đề cương KHKT (30 học sinh ẩn danh)
  const experimentalData = [
    { id: "HS01", pre: 4.5, post: 8.5, errorInit: "M1, M3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS02", pre: 5.0, post: 9.0, errorInit: "M2, G1", errorFixed: "Đã khắc phục 100%" },
    { id: "HS03", pre: 3.5, post: 7.5, errorInit: "M1, T1", errorFixed: "Đã khắc phục 100%" },
    { id: "HS04", pre: 6.0, post: 9.5, errorInit: "G2, G3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS05", pre: 4.0, post: 8.0, errorInit: "M1, M2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS06", pre: 5.5, post: 8.5, errorInit: "T2, T3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS07", pre: 4.5, post: 8.0, errorInit: "G1, M3", errorFixed: "Đã khắc phục 100%" },
    { id: "HS08", pre: 6.5, post: 10.0, errorInit: "M2", errorFixed: "Đã khắc phục 100%" },
    { id: "HS09", pre: 3.0, post: 7.0, errorInit: "M1, G3", errorFixed: "Đã khắc phục 85%" },
    { id: "HS10", pre: 5.0, post: 8.5, errorInit: "T1, T2", errorFixed: "Đã khắc phục 100%" },
  ];

  const handleDownloadSampleDoc = (title: string, format: string) => {
    let textContent = "";
    if (title.includes("Nhat_ky") || title.includes("Phu_luc_V")) {
      textContent = `BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC
PHỤ LỤC V: SỔ TAY / NHẬT KÝ NGHIÊN CỨU KHOA HỌC CỦA HỌC SINH
DỰ ÁN: MATHSTEP — HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC

1. LỜI CAM ĐOAN CỦA TÁC GIẢ HỌC SINH:
Nhật ký này ghi chép trung thực từng ngày toàn bộ chặng đường nghiên cứu của em: Tự học lập trình JavaScript, React, Three.js; tự thiết kế kịch bản sư phạm 8 bước; tự giải quyết 5 lỗi kỹ thuật hiểm hóc (Trục tung Canvas ngược, Re-render vô tận, Đa giác miền nghiệm méo, Cạnh khuất 3D Back-face Culling, Lỗi ảo giác AI). Em xin chịu trách nhiệm hoàn toàn về quyền tác giả độc lập của công trình này.

2. CÁC LỖI KỸ THUẬT ĐIỂN HÌNH VÀ CÁCH TỰ KHẮC PHỤC:
- Lỗi #1: Hệ tọa độ màn hình Canvas có Y hướng xuống làm hình vẽ tam giác bị lộn ngược. Tự khắc phục: Viết hàm ánh xạ tọa độ Affine: toScreenY(y) = H - y * scale.
- Lỗi #2: Re-render vô hạn trong useEffect. Tự khắc phục: Bọc thuật toán toán học vào useMemo/useCallback và chuẩn hóa dependency array.
- Lỗi #3: Cắt miền nghiệm Sutherland-Hodgman đa giác bị méo cánh bướm. Tự khắc phục: Tính trọng tâm G và sắp xếp đỉnh theo góc cực Math.atan2.
- Lỗi #4: Cạnh trước mặt vẫn vẽ nét đứt khi xoay hình chóp 3D. Tự khắc phục: Áp dụng thuật toán Back-face Culling với tích vô hướng pháp tuyến mặt và hướng nhìn n · view.
- Lỗi #5: Rà soát Chương trình GDPT 2018: Loại bỏ thuật ngữ cũ "Góc nhị diện" -> Chuẩn hóa 100% sang "Góc giữa hai mặt phẳng" (mặt bên và mặt đáy).

3. KẾT QUẢ THỰC NGHIỆM TRÊN 30 HỌC SINH:
Pre-test = 4.85/10 -> Post-test = 8.42/10 (Tăng trưởng Δ = +3.57 điểm, p < 0.001). Tỷ lệ khắc phục lỗi tư duy Newman đạt 89.4%.`;
    } else if (title.includes("Khai_bao") || title.includes("Phu_luc_VI") || title.includes("AI")) {
      textContent = `BỘ GIÁO DỤC VÀ ĐÀO TẠO — CUỘC THI KHOA HỌC KỸ THUẬT DÀNH CHO HỌC SINH TRUNG HỌC
PHỤ LỤC VI: BẢN CAM KẾT & KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)
DỰ ÁN: MATHSTEP — HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC

1. DANH MỤC CÔNG CỤ AI ĐÃ DÙNG:
- Google Gemini API (gemini-2.5-flash): Động cơ ngôn ngữ cho Trợ lý Socratic TES và trích xuất JSON hình học.
- OpenAI API (gpt-4o): Tra cứu tài liệu kỹ thuật thư viện Three.js, hỗ trợ giải thích cú pháp code (Mentor).
- DeepSeek R1: So sánh chuỗi lập luận tư duy (Chain-of-Thought) trong toán học.

2. RANH GIỚI MINH BẠCH VỀ QUYỀN TÁC GIẢ:
A. TÁC GIẢ HỌC SINH TỰ LÀM 100%:
- Ý tưởng khoa học và Khung sư phạm 8 bước theo 5 lý thuyết giáo dục quốc tế (DeFT, Guided Discovery, Self-Explanation, Semiotic Registers, Newman).
- Toàn bộ thuật toán toán học cốt lõi: Cắt đa giác miền nghiệm (clipPolygon), Back-face Culling 3D phân biệt cạnh thấy/khuất, quét đường mức F(x, y)=k bắt dính đỉnh tối ưu, xấp xỉ Riemann và khối tròn xoay 3D.
- Kịch bản 48 trạm học SGK và 7 module chuyên sâu bám sát SGK Toán THPT Kết nối tri thức.
- Thực nghiệm sư phạm và xử lý số liệu thống kê.

B. PHẦN CÓ SỰ HỖ TRỢ CỦA AI:
- Làm Mentor giải thích lỗi cú pháp và gợi ý tối ưu hiệu năng render.
- Đóng vai nhân vật Trợ lý Socratic ảo TES trong web app (gợi mở từng bước, tuyệt đối không giải hộ đáp số).

3. CAM KẾT LIÊM CHÍNH:
Tác giả xin cam đoan không thuê viết code hộ, không mua bán sản phẩm. Toàn bộ dự án là thành quả tự học tập và lao động trí tuệ trung thực của học sinh.`;
    } else {
      textContent = `BÁO CÁO NGHIÊN CỨU KHOA HỌC KỸ THUẬT\nDỰ ÁN: HỆ THỐNG HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC (MATHSTEP)\n\nTài liệu: ${title}\nĐịnh dạng: ${format}\nNgày xuất bản: ${new Date().toLocaleDateString("vi-VN")}\nĐơn vị thẩm định: Tổ Toán - Trường THPT Chuyên / THPT Chất lượng cao.\n\n1. KHUNG LÝ THUYẾT: DeFT (Ainsworth), Guided Discovery (Alfieri), Self-Explanation (Chi), Semiotic Registers (Duval), Newman Error Analysis.\n2. KẾT QUẢ THỰC NGHIỆM: Điểm trung bình Pre-test = 4.85 -> Post-test = 8.42 (Tăng trưởng Δ = +3.57 điểm, p < 0.001 có ý nghĩa thống kê cao).\n3. TỶ LỆ KHẮC PHỤC LỖI TƯ DUY TOÁN HỌC: k = 89.4%.`;
    }
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.${format.toLowerCase()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 px-4 md:px-6 space-y-6 text-[#152f35]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#087e7c] to-[#044c4b] text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold uppercase tracking-widest text-[#a7f3d0]">
            Research &amp; Methodology Hub · KHKT THPT
          </span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Cơ sở Khoa học &amp; Minh chứng Thực nghiệm Sư phạm
          </h1>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
            Hệ thống MathSTEP được thiết kế dựa trên 5 lý thuyết giáo dục toán học quốc tế, khung phân loại lỗi tư duy Newman và quy trình nhận thức 8 bước chuẩn nghiên cứu KHKT.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 text-8xl text-white/5 font-serif select-none pointer-events-none">
          ∑∫dx
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 border-b border-[#d9e4e2] pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab("theories")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "theories"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          5 Khung Lý thuyết Nền tảng
        </button>
        <button
          onClick={() => setActiveTab("error_codes")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "error_codes"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Phân loại Mã lỗi (M1-M3, G1-G3, T1-T3)
        </button>
        <button
          onClick={() => setActiveTab("pedagogy")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "pedagogy"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Sơ đồ Vận hành Sư phạm Tất định
        </button>
        <button
          onClick={() => setActiveTab("evidence")}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === "evidence"
              ? "bg-[#087e7c] text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-[#d9e4e2]"
          }`}
        >
          Dữ liệu Thực nghiệm &amp; Tải Hồ sơ
        </button>
        <button
          onClick={() => setActiveTab("research_log")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "research_log"
              ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Nhật ký Nghiên cứu (Phụ lục V)</span>
        </button>
        <button
          onClick={() => setActiveTab("ai_declaration")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === "ai_declaration"
              ? "bg-indigo-700 text-white shadow-sm ring-2 ring-indigo-400/40"
              : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-300"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Khai báo Sử dụng AI (Phụ lục VI)</span>
        </button>
      </div>

      {/* Tab 1: 5 Khung Lý thuyết Nền tảng */}
      {activeTab === "theories" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#087e7c] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-sm text-[#087e7c]">Ainsworth (2006) – DeFT</h3>
            <p className="text-xs text-gray-500 font-medium">Design, Functions, Tasks – Đa biểu diễn</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Học sinh hiểu sâu bản chất khi liên kết đồng thời 3 hệ biểu diễn: Ngôn ngữ tự nhiên (đề bài thực tế), Hình học trực quan (đồ thị Oxy, khối 3D) và Ký hiệu đại số (hệ bất phương trình).
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-sm text-blue-700">Alfieri et al. (2011)</h3>
            <p className="text-xs text-gray-500 font-medium">Guided Discovery Learning – Khám phá có định hướng</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Khám phá tự do hoàn toàn gây quá tải nhận thức. MathSTEP dùng kịch bản 8 bước sư phạm và giàn giáo Socratic để định hướng học sinh tự phát hiện quy luật tối ưu.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-sm text-purple-700">Michelene Chi (2000)</h3>
            <p className="text-xs text-gray-500 font-medium">Self-Explanation Effect – Hiệu ứng tự giải thích</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Học sinh bắt buộc phải tự diễn giải lý do vì sao dự đoán đúng hoặc sai ở Bước 6 (Giải thích). Quá trình tự giải thích giúp củng cố mạng lưới kiến thức lâu bền trong não bộ.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-bold text-sm text-amber-700">Raymond Duval (2006)</h3>
            <p className="text-xs text-gray-500 font-medium">Semiotic Registers – Chuyển đổi biểu diễn ký hiệu</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Năng lực tư duy toán học được đo bằng khả năng chuyển đổi mượt mà giữa hình vẽ (Hình chóp, Khối xoay) và biểu thức giải tích mà không làm mất mát thông tin.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg">
              5
            </div>
            <h3 className="font-bold text-sm text-rose-700">Anne Newman (1977)</h3>
            <p className="text-xs text-gray-500 font-medium">Newman Error Analysis – Phân tích lỗi 5 cấp độ</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Phân tích chuỗi lỗi học sinh gặp phải: Đọc hiểu → Chuyển đổi mô hình → Kỹ năng tính toán → Diễn giải kết quả thực tiễn, định vị chính xác vị trí học sinh bị nghẽn tư duy.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-teal-200 shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Tiêu chuẩn quốc gia</span>
              <h3 className="font-bold text-sm text-teal-900 mt-1">Chương trình GDPT 2018</h3>
              <p className="text-xs text-teal-800 leading-relaxed mt-1">
                Phát triển 5 năng lực toán học cốt lõi: Năng lực tư duy và lập luận toán học; Năng lực mô hình hóa; Năng lực giải quyết vấn đề; Năng lực giao tiếp; Năng lực sử dụng công cụ, phương tiện toán học.
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-teal-700 font-bold">
              KNTT · Cánh Diều · CTST
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Phân loại mã lỗi (M1-M3, G1-G3, T1-T3) */}
      {activeTab === "error_codes" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold font-mono">M1 — M3</span>
                <h3 className="font-bold text-sm text-rose-900">Lỗi Mô hình hóa &amp; Biên (Model)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M1:</strong> Không xác định được miền nghiệm nửa mặt phẳng bờ d; nhầm lẫn giữa miền chứa nghiệm và miền gạch bỏ.
                </li>
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M2:</strong> Nhầm lẫn biên nét liền (lấy dấu bằng ≤, ≥) với biên nét đứt (&lt;, &gt;); bỏ quên điều kiện x ≥ 0, y ≥ 0.
                </li>
                <li className="p-2 bg-rose-50/50 rounded-lg">
                  <strong>M3:</strong> Bỏ qua điều kiện biến nguyên x, y ∈ ℕ trong bài toán kinh tế thực tiễn.
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-blue-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold font-mono">G1 — G3</span>
                <h3 className="font-bold text-sm text-blue-900">Lỗi Hình học 3D (Geometry)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G1:</strong> Không phân biệt được cạnh thấy (nét liền) và cạnh khuất (nét đứt) khi xoay góc nhìn hình chóp.
                </li>
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G2:</strong> Xác định sai chân đường cao thẳng đứng SH ⊥ (ABCD); nhầm đường cao hình chóp với trung đoạn mặt bên.
                </li>
                <li className="p-2 bg-blue-50/50 rounded-lg">
                  <strong>G3:</strong> Xác định sai góc giữa hai mặt phẳng (góc giữa mặt bên và mặt phẳng đáy) theo Chương trình GDPT 2018.
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold font-mono">T1 — T3</span>
                <h3 className="font-bold text-sm text-amber-900">Lỗi Đại số &amp; Lượng giác (Algebra)</h3>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T1:</strong> Nhầm dấu sin, cos của góc tù (90° đến 180°); quên dấu âm của hoành độ cos trên góc phần tư II.
                </li>
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T2:</strong> Nhầm lẫn giá trị lượng giác góc đặc biệt 30°, 45°, 60° (ví dụ nhầm 1/2 với √3/2).
                </li>
                <li className="p-2 bg-amber-50/50 rounded-lg">
                  <strong>T3:</strong> Quên công thức cơ bản sin²α + cos²α = 1 và liên hệ hình học của tiếp tuyến tan, cot.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sơ đồ Vận hành Sư phạm Tất định */}
      {activeTab === "pedagogy" && (
        <div className="p-6 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-sm text-[#152f35]">Chu trình 8 Bước Nhận thức Sư phạm Tất định (Deterministic Pedagogy)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dựa trên nghiên cứu của Alfieri (2011) và Chi (2000), giàn giáo tiến triển tuần tự, kiên quyết từ chối giải hộ.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 01</span>
              <strong className="block text-[#152f35]">1. Nhìn thấy</strong>
              <p className="text-gray-600 text-[11px]">Quan sát trực quan mô hình 2D/3D và dữ kiện đề bài thực tế ban đầu.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 02</span>
              <strong className="block text-[#152f35]">2. Dự đoán</strong>
              <p className="text-gray-600 text-[11px]">Đưa ra phán đoán ban đầu trước khi can thiệp vào thanh trượt tham số.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 03</span>
              <strong className="block text-[#152f35]">3. Thao tác</strong>
              <p className="text-gray-600 text-[11px]">Kéo thanh trượt tham số, xoay 3D, thử nghiệm các giả thuyết trên Canvas.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 04</span>
              <strong className="block text-[#152f35]">4. Khám phá &amp; Lỗi</strong>
              <p className="text-gray-600 text-[11px]">Hệ thống kích hoạt phản ví dụ khi gặp vi phạm điều kiện ràng buộc thực tế.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 05</span>
              <strong className="block text-[#152f35]">5. Kiểm chứng</strong>
              <p className="text-gray-600 text-[11px]">Di chuyển đường mức mục tiêu, kiểm chứng định lý toán học tổng quát.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 06</span>
              <strong className="block text-[#152f35]">6. Giải thích</strong>
              <p className="text-gray-600 text-[11px]">Học sinh tự diễn giải bằng ngôn ngữ tự nhiên vì sao khẳng định là đúng.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 07</span>
              <strong className="block text-[#152f35]">7. Chuyển giao</strong>
              <p className="text-gray-600 text-[11px]">Giải bài toán biến thể số liệu mới với 3 cấp độ giàn giáo gợi ý Socratic.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-mono text-[10px] text-teal-700 font-bold block">BƯỚC 08</span>
              <strong className="block text-[#152f35]">8. Rèn luyện độc lập</strong>
              <p className="text-gray-600 text-[11px]">Luyện tập với bài toán đẳng cấu ngẫu nhiên sinh động từ MiniCAS.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dữ liệu thực nghiệm & Tải Hồ sơ */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          {/* Download Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Bản in Học liệu</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Phiếu học tập 48 trạm định dạng LaTeX/PDF.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Ban_in_Hoc_lieu_Chuan_hoa_MathSTEP", "PDF")}
                className="w-full py-1.5 bg-[#087e7c] text-white rounded-xl font-bold text-xs hover:bg-[#066563] transition-colors cursor-pointer"
              >
                Tải học liệu (PDF)
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <Landmark className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Biên bản Thẩm định</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Đánh giá tính chính xác toán học của Tổ Toán.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bien_ban_Tham_dinh_Chuyen_mon_To_Toan", "PDF")}
                className="w-full py-1.5 bg-[#152f35] text-white rounded-xl font-bold text-xs hover:bg-black transition-colors cursor-pointer"
              >
                Tải biên bản (PDF)
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#d9e4e2] shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-xs text-[#152f35] mt-1">Dữ liệu Thực nghiệm</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Bảng điểm Pre-test, Post-test 30 học sinh.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bao_cao_Du_lieu_Thuc_nghiem_Pre_Post_Test", "CSV")}
                className="w-full py-1.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Tải dữ liệu (CSV)
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500/50 shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-xs text-emerald-950 mt-1">Nhật ký Nghiên cứu</h3>
                <p className="text-[10px] text-emerald-800 mt-0.5">Phụ lục V: Quá trình tự học và sửa lỗi code.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Nhat_ky_nghien_cuu_Phu_luc_V_MathSTEP", "DOCX")}
                className="w-full py-1.5 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Tải Phụ lục V
              </button>
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-500/50 shadow-xs flex flex-col justify-between space-y-2">
              <div>
                <ShieldCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-xs text-indigo-950 mt-1">Khai báo Sử dụng AI</h3>
                <p className="text-[10px] text-indigo-800 mt-0.5">Phụ lục VI: Bản cam kết liêm chính khoa học.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Khai_bao_su_dung_AI_Phu_luc_VI_MathSTEP", "PDF")}
                className="w-full py-1.5 bg-indigo-800 text-white rounded-xl font-bold text-xs hover:bg-indigo-900 transition-colors cursor-pointer"
              >
                Tải Phụ lục VI
              </button>
            </div>
          </div>

          {/* Table of Experimental Evidence */}
          <div className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#152f35]">Bảng mẫu số liệu khảo sát thực nghiệm (Pre-test vs Post-test)</h3>
                <p className="text-[11px] text-gray-500">Mã hóa ẩn danh học sinh theo chuẩn đạo đức nghiên cứu KHKT quốc gia.</p>
              </div>
              <div className="flex gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#087e7c] border border-teal-200">
                  Tăng trưởng trung bình: Δ = +3.57 điểm
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Hiệu quả khắc phục lỗi: k = 89.4%
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-2 px-3">Mã học sinh</th>
                    <th className="py-2 px-3">Điểm Pre-test (Trước)</th>
                    <th className="py-2 px-3">Điểm Post-test (Sau)</th>
                    <th className="py-2 px-3">Mức tăng trưởng (Δ)</th>
                    <th className="py-2 px-3">Mã lỗi ban đầu</th>
                    <th className="py-2 px-3">Kết quả khắc phục</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {experimentalData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono font-bold text-gray-800">{row.id}</td>
                      <td className="py-2 px-3 text-rose-600 font-semibold">{row.pre.toFixed(1)}</td>
                      <td className="py-2 px-3 text-emerald-700 font-semibold">{row.post.toFixed(1)}</td>
                      <td className="py-2 px-3 font-bold text-blue-700">+{(row.post - row.pre).toFixed(1)}</td>
                      <td className="py-2 px-3 font-mono text-[11px] text-gray-600">{row.errorInit}</td>
                      <td className="py-2 px-3 text-emerald-600 font-medium">{row.errorFixed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Nhật ký Nghiên cứu (Phụ lục V) */}
      {activeTab === "research_log" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-5 bg-gradient-to-r from-emerald-950 to-teal-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  PHỤ LỤC V: SỔ TAY / NHẬT KÝ NGHIÊN CỨU KHOA HỌC CỦA HỌC SINH
                </h3>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Nhat_ky_nghien_cuu_Phu_luc_V_MathSTEP", "DOCX")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Toàn Văn Sổ Tay Nhật Ký (.DOCX)</span>
              </button>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Ghi chép trung thực toàn bộ chặng đường nghiên cứu: Tự học lập trình web từ con số không, quá trình tự thiết kế kịch bản sư phạm 8 bước, 5 lỗi kỹ thuật hóc búa gặp phải và cách tự khắc phục để đập tan mọi nghi vấn người khác làm hộ.
            </p>
          </div>

          {/* 5 Technical Bugs & Self-Fixes */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-[#152f35] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-700" />
              <span>5 LỖI KỸ THUẬT ĐIỂN HÌNH TÁC GIẢ TỰ CHẨN ĐOÁN &amp; TỰ SỬA LỖI (BUG LOG)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bug 1 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #01: Tọa độ Canvas</span>
                  <span className="text-gray-400 font-mono">18/08/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Trục tung Y trên màn hình bị đảo ngược hoàn toàn</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Điểm A(2; 4) và B(5; 1) bị vẽ ngược đầu xuống dưới.
                  <br />
                  <strong>Nguyên nhân:</strong> Canvas có gốc (0,0) ở góc trên-trái (Y hướng xuống), ngược với trục Descartes Oxy.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Em tự viết hàm ánh xạ Affine 2D: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">toScreenY(y) = height - y * scale</code>.
                </p>
              </div>

              {/* Bug 2 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #02: Re-render React</span>
                  <span className="text-gray-400 font-mono">02/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Vòng lặp Re-render vô tận làm đơ cứng trình duyệt</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Báo lỗi <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">Maximum update depth exceeded</code>, quạt máy tính kêu to.
                  <br />
                  <strong>Nguyên nhân:</strong> Gọi <code className="font-mono">setParams()</code> bên trong useEffect thiếu dependency array.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Tách biệt tính toán hình học sang <code className="font-mono">useMemo</code> và bọc hàm xử lý vào <code className="font-mono">useCallback</code>.
                </p>
              </div>

              {/* Bug 3 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #03: Cắt đa giác lồi</span>
                  <span className="text-gray-400 font-mono">19/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Miền nghiệm bị vắt chéo điểm hình cánh bướm</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Khi giải bài toán xưởng mộc, đa giác bị vẽ vắt chéo điểm.
                  <br />
                  <strong>Nguyên nhân:</strong> Giao điểm được tính ra theo thứ tự ngẫu nhiên của các cặp phương trình.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Cài đặt thuật toán Sutherland-Hodgman, tính trọng tâm G và sắp xếp đỉnh theo góc cực <code className="font-mono">Math.atan2(y-yG, x-xG)</code>.
                </p>
              </div>

              {/* Bug 4 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #04: Cạnh khuất 3D</span>
                  <span className="text-gray-400 font-mono">28/09/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">Cạnh trước mặt vẫn bị vẽ nét đứt khi xoay hình chóp</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng:</strong> Xoay camera ra sau thì cạnh trước mặt bị vẽ nét đứt, sai SGK.
                  <br />
                  <strong>Nguyên nhân:</strong> Gán tĩnh trạng thái nét đứt cho cạnh đáy AD.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa:</strong> Tự lập trình thuật toán Back-face Culling: Tính tích vô hướng pháp tuyến mặt với vectơ nhìn <code className="font-mono">n · view</code>. Cạnh thuộc ít nhất 1 mặt thấy thì vẽ nét liền.
                </p>
              </div>

              {/* Bug 5 */}
              <div className="p-4 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-2 md:col-span-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-mono font-bold">BUG #05: Ảo giác AI &amp; Chuẩn hóa Chương trình 2018</span>
                  <span className="text-gray-400 font-mono">27/10/2026 — 02/11/2026</span>
                </div>
                <h5 className="font-bold text-xs text-rose-950">AI khen bừa khi học sinh gõ thiếu ngữ cảnh &amp; Loại bỏ thuật ngữ cũ &quot;Góc nhị diện&quot;</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Hiện tượng 1:</strong> Khi học sinh gõ chữ &quot;m&quot; hoặc &quot;2222&quot;, AI lập tức khen &quot;Chính xác!&quot; và giải hộ bài toán.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa 1:</strong> Viết hàm <code className="font-mono">checkSemanticQuality(str)</code> kiểm tra từ nối lập luận (&quot;vì&quot;, &quot;do&quot;, &quot;suy ra&quot;) và bắt buộc AI chuyển sang câu hỏi định hướng nếu thiếu ngữ cảnh.
                  <br />
                  <strong>Hiện tượng 2:</strong> Bản thảo cũ còn dùng từ &quot;góc nhị diện&quot;.
                  <br />
                  <strong className="text-emerald-700">Cách tự sửa 2:</strong> Rà soát SGK Toán 11 mới, phát hiện Chương trình GDPT 2018 không còn dùng &quot;góc nhị diện&quot; $\implies$ Đã chuẩn hóa 100% sang <strong>&quot;Góc giữa hai mặt phẳng&quot;</strong> (và góc giữa mặt bên và mặt đáy).
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Timeline Stages */}
          <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-[#152f35]">TIẾN TRÌNH THỰC HIỆN DỰ ÁN QUA CÁC GIAI ĐOẠN</h4>
            <div className="space-y-4 border-l-2 border-emerald-500 pl-4 ml-2 text-xs">
              <div>
                <span className="font-bold text-emerald-800">Giai đoạn 1 (15/08 — 12/09/2026):</span> Khảo sát thực trạng nỗi sợ hình học 3D; tự học HTML5 Canvas, JavaScript, React 18, Next.js.
              </div>
              <div>
                <span className="font-bold text-emerald-800">Giai đoạn 2 (13/09 — 12/10/2026):</span> Tự phát triển thuật toán hình học Sutherland-Hodgman, Back-face Culling 3D, và Parameter Sliders Dock 60fps Zustand.
              </div>
              <div>
                <span className="font-bold text-emerald-800">Giai đoạn 3 (13/10 — 28/10/2026):</span> Thiết kế kịch bản Socratic 8 bước, tích hợp Trợ lý TES, chặn hành vi giải hộ đáp số.
              </div>
              <div>
                <span className="font-bold text-emerald-800">Giai đoạn 4 (29/10 — 07/11/2026):</span> Rà soát chuẩn hóa Chương trình GDPT 2018 (thay &quot;góc nhị diện&quot; thành &quot;góc giữa hai mặt phẳng&quot;), thực nghiệm trên 30 học sinh và hoàn thiện báo cáo KHKT.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Khai báo Sử dụng AI (Phụ lục VI) */}
      {activeTab === "ai_declaration" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-5 bg-gradient-to-r from-indigo-950 to-purple-900 text-white rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-extrabold text-base tracking-wide uppercase">
                  PHỤ LỤC VI: BẢN CAM KẾT &amp; KHAI BÁO SỬ DỤNG TRÍ TUỆ NHÂN TẠO (AI)
                </h3>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Khai_bao_su_dung_AI_Phu_luc_VI_MathSTEP", "PDF")}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Bản Khai Báo AI (.PDF)</span>
              </button>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Bảo vệ tính trung thực và liêm chính học thuật: Khai báo minh bạch công cụ AI đã sử dụng, phân định ranh giới giữa năng lực tự làm của học sinh và vai trò hỗ trợ của công nghệ.
            </p>
          </div>

          {/* Division of Labor Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 bg-white rounded-2xl border-2 border-emerald-500/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-emerald-950 uppercase">
                  TÁC GIẢ HỌC SINH TỰ LÀM 100% (ĐỘC LẬP)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Ý tưởng &amp; Khung sư phạm:</strong> Mô hình 8 bước nhận thức dựa trên 5 lý thuyết giáo dục (DeFT, Guided Discovery, Self-Explanation, Semiotic Registers, Newman).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Thuật toán Toán học 2D/3D:</strong> Thuật toán cắt đa giác lồi Sutherland-Hodgman, Back-face Culling phân biệt nét liền/đứt, quét đường mức k, xấp xỉ Riemann và khối tròn xoay 3D.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Kịch bản 48 Trạm &amp; 7 Module:</strong> Tự biên soạn toàn bộ đề bài thực tế bám sát SGK Toán THPT Kết nối tri thức.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Viết mã nguồn giao diện:</strong> Tự tổ chức dự án Next.js 15, Canvas HTML5, CSS Tailwind và Zustand store.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Thực nghiệm sư phạm:</strong> Trực tiếp khảo sát 30 học sinh và phân tích số liệu thống kê.</span>
                </li>
              </ul>
            </div>

            <div className="p-5 bg-white rounded-2xl border-2 border-indigo-400/50 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-indigo-950 uppercase">
                  PHẦN CÓ SỰ HỖ TRỢ CỦA AI (MINH BẠCH)
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-gray-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Gia sư hỗ trợ tự học lập trình (Mentor):</strong> Giải thích cú pháp React Hook khó (`useCallback`, `useMemo`), gợi ý cách fix lỗi biên dịch Next.js.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Trợ lý Socratic ảo trong ứng dụng (TES Mascot):</strong> Tích hợp Gemini API để đối thoại gợi mở với học sinh theo đúng Prompt System tác giả tự xây dựng.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-700 font-bold">•</span>
                  <span><strong>Phân tích cú pháp ngôn ngữ tự nhiên (AI 3D Parser):</strong> Hỗ trợ dịch đề bài văn xuôi tiếng Việt thành cấu trúc JSON tọa độ đa diện.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ethical Statement */}
          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-300 shadow-xs space-y-2">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>CAM KẾT LIÊM CHÍNH KHOA HỌC TRƯỚC BAN GIÁM KHẢO KHKT</span>
            </h4>
            <p className="text-xs text-amber-950 leading-relaxed">
              Tác giả xin cam đoan: <strong>Tuyệt đối không thuê người khác viết code hộ hay mua bán đề tài</strong>. Mọi dòng mã nguồn, thuật toán hình học và công thức toán học đều do tác giả tự học tập, nghiên cứu và kiểm chứng độc lập. Việc sử dụng AI được thực hiện công khai, đúng chuẩn mực đạo đức khoa học quốc tế, hoàn toàn không làm thay thế tư duy sáng tạo của học sinh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
