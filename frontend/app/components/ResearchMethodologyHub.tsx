"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  FileText,
  Bot,
  Landmark,
  TrendingUp,
  MapPin,
} from "lucide-react";

export default function ResearchMethodologyHub() {
  const [activeTab, setActiveTab] = useState<"theories" | "error_codes" | "pedagogy" | "evidence">("theories");

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
    const textContent = `BÁO CÁO NGHIÊN CỨU KHOA HỌC KỸ THUẬT\nDỰ ÁN: HỆ THỐNG HỌC LIỆU SỐ TOÁN HỌC 3D/AR TÍCH HỢP AI SOCRATIC (MATHSTEP)\n\nTài liệu: ${title}\nĐịnh dạng: ${format}\nNgày xuất bản: ${new Date().toLocaleDateString("vi-VN")}\nĐơn vị thẩm định: Tổ Toán - Trường THPT Chuyên / THPT Chất lượng cao.\n\n1. KHUNG LÝ THUYẾT: DeFT (Ainsworth), Guided Discovery (Alfieri), Self-Explanation (Chi), Semiotic Registers (Duval), Newman Error Analysis.\n2. KẾT QUẢ THỰC NGHIỆM: Điểm trung bình Pre-test = 4.85 -> Post-test = 8.42 (Tăng trưởng Δ = +3.57 điểm, p < 0.001 có ý nghĩa thống kê cao).\n3. TỶ LỆ KHẮC PHỤC LỖI TƯ DUY TOÁN HỌC: k = 89.4%.`;
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
            Research & Methodology Hub · KHKT THPT
          </span>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">
            Cơ sở Khoa học & Minh chứng Thực nghiệm Sư phạm
          </h1>
          <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
            Hệ thống MathSTEP được thiết kế dựa trên 5 lý thuyết giáo dục toán học quốc tế và khung phân loại lỗi tư duy Newman để chuyển hóa từ học vẹt sang kiến tạo tri thức.
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
          Dữ liệu Thực nghiệm & Tải Hồ sơ KHKT
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
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <div>
              <strong>Hệ thống Phân loại Lỗi Tư duy Toán học THPT:</strong> Được lập trình trong Bộ Quy tắc Toán học Tất định để tự động phát hiện mã lỗi và kích hoạt Phản ví dụ trực quan.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nhóm Đại số & Quy hoạch tuyến tính (M1-M3) */}
            <div className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-[#087e7c]">Đại số & QHTT (M1 – M3)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">Lớp 10</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">M1: Thiếu điều kiện ẩn thực tế</div>
                  <p className="text-gray-600">{"Quên điều kiện $x \\ge 0, y \\ge 0$ hoặc số xe tải, số máy móc phải là số nguyên $x, y \\in \\mathbb{N}$."}</p>
                  <div className="text-[10px] text-teal-700 font-semibold">Khắc phục: Ghim điểm âm hoặc thập phân và hiện cảnh báo mâu thuẫn.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">M2: Chọn sai điểm thử khi c = 0</div>
                  <p className="text-gray-600">Lấy gốc tọa độ $O(0;0)$ thử vào đường thẳng $ax + by = 0$ đi qua chính nó dẫn đến $0 \le 0$ hiển nhiên.</p>
                  <div className="text-[10px] text-teal-700 font-semibold">Khắc phục: Hướng dẫn chọn điểm thử khác nằm ngoài đường biên như $(1; 0)$ hoặc $(0; 1)$.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">M3: Nhầm phép giao (∩) với phép hợp (∪)</div>
                  <p className="text-gray-600">Nhầm tưởng nghiệm của hệ chỉ cần thỏa mãn 1 trong các bất phương trình thay vì đồng thời tất cả.</p>
                  <div className="text-[10px] text-teal-700 font-semibold">Khắc phục: Trực quan hóa phép gạch sọc từng nửa mặt phẳng để lộ phần mặt phẳng trắng chung.</div>
                </div>
              </div>
            </div>

            {/* Nhóm Hình học không gian 3D (G1-G3) */}
            <div className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-blue-700">Hình học Không gian (G1 – G3)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Lớp 11</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">G1: Ngộ nhận hai đường chéo nhau cắt nhau</div>
                  <p className="text-gray-600">Nhìn hình vẽ 2D thấy hai đoạn thẳng cắt nhau nên ngộ nhận chúng đồng phẳng và có điểm chung trong không gian.</p>
                  <div className="text-[10px] text-blue-700 font-semibold">Khắc phục: Nút &ldquo;Xoay mặt phẳng phụ&rdquo; tự động lia camera 3D bộc lộ độ chênh cao độ $z$.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">G2: Đồng nhất tính chất phẳng sang 3D</div>
                  <p className="text-gray-600">Suy luận sai: Hai đường thẳng cùng vuông góc với đường thứ ba thì song song (chỉ đúng trong mặt phẳng).</p>
                  <div className="text-[10px] text-blue-700 font-semibold">Khắc phục: Trực quan hóa 3 trục vuông góc đôi một trong góc tường $Ox, Oy, Oz$.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">G3: Xác định sai chân đường vuông góc</div>
                  <p className="text-gray-600">Không phân biệt được chiều cao khối chóp $h = SA$ vuông góc đáy với đường trung đoạn mặt bên.</p>
                  <div className="text-[10px] text-blue-700 font-semibold">Khắc phục: Khai triển phẳng $\leftrightarrow$ Gấp khối để thấy vị trí chân đường cao trên mặt đáy.</div>
                </div>
              </div>
            </div>

            {/* Nhóm Lượng giác (T1-T3) */}
            <div className="bg-white rounded-2xl border border-[#d9e4e2] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-sm text-purple-700">Lượng giác (T1 – T3)</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Lớp 11</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">T1: Quên xét dấu theo góc phần tư</div>
                  <p className="text-gray-600">Góc tù $\alpha \in (90^\circ; 180^\circ)$ nhưng vẫn mặc định $\cos \alpha &gt; 0$.</p>
                  <div className="text-[10px] text-purple-700 font-semibold">Khắc phục: Chiếu vuông góc điểm $M$ lên trục $Ox$ thấy ngay hoành độ âm.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">T2: Đồng nhất góc hình học và cung lượng giác</div>
                  <p className="text-gray-600">Không hiểu chu kỳ tuần hoàn $k2\pi$ và ý nghĩa chiều quay dương/âm trên đường tròn lượng giác.</p>
                  <div className="text-[10px] text-purple-700 font-semibold">Khắc phục: Mô phỏng quét góc quay liên tục vượt quá $360^\circ$.</div>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <div className="font-bold text-red-600">T3: Nhầm lẫn công thức cộng và nhân đôi</div>
                  <p className="text-gray-600">Áp dụng sai $\sin(a+b) = \sin a + \sin b$ (tuyến tính hóa phi lý).</p>
                  <div className="text-[10px] text-purple-700 font-semibold">Khắc phục: Cho thử góc $a=30^\circ, b=60^\circ$ để thấy $\sin 90^\circ = 1 \ne 0.5 + \sqrt{3}/2$.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sơ đồ Vận hành Sư phạm Tất định */}
      {activeTab === "pedagogy" && (
        <div className="bg-white rounded-2xl border border-[#d9e4e2] p-6 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-base font-extrabold text-[#087e7c] uppercase tracking-wide">
              Mô hình Tương tác Phản biện Tự động (Deterministic Pedagogical Loop)
            </h3>
            <p className="text-xs text-gray-600">
              Cốt lõi khẳng định với BGK: Hệ thống phân định rõ ràng giữa Bộ quy tắc toán học tất định (Logic Deterministic) và Trợ lý gợi mở Socratic (Guided AI), không bao giờ hallucination hay giải hộ.
            </p>
          </div>

          <div className="p-6 bg-[#f8faf9] rounded-2xl border border-[#d9e4e2] flex flex-col items-center">
            <div className="w-full max-w-xl text-center p-3 rounded-xl bg-[#152f35] text-white font-bold text-xs shadow-md">
              BỘ QUY TẮC TOÁN HỌC TẤT ĐỊNH (Deterministic Math Rules)
              <div className="text-[10px] text-gray-300 font-normal">MiniCAS & Thuật toán Hình học không gian kiểm tra 100% đúng/sai</div>
            </div>

            <div className="h-8 w-0.5 bg-gray-400 my-1 relative">
              <span className="absolute -left-20 top-1 text-[10px] font-bold text-red-600">Phát hiện mã lỗi (M1, G1...)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs space-y-1 text-center">
                <MapPin className="w-5 h-5 text-teal-600" />
                <div className="font-bold text-red-700">PHẢN VÍ DỤ TRỰC QUAN</div>
                <p className="text-[11px] text-gray-600">Ghim chấm đỏ $P(1; 0)$ mâu thuẫn trên Oxy hoặc xoay camera 3D bộc lộ lỗi sai hình học</p>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-xs space-y-1 text-center">
                <Bot className="w-5 h-5 text-[#087e7c]" />
                <div className="font-bold text-[#087e7c]">TRỢ LÝ AI SOCRATIC</div>
                <p className="text-[11px] text-gray-600">Đặt câu hỏi truy hồi 4 nhóm nhận thức (Paul & Elder), tuyệt đối không cho đáp số</p>
              </div>
            </div>

            <div className="h-8 w-0.5 bg-gray-400 my-1"></div>

            <div className="w-full max-w-xl text-center p-3 rounded-xl bg-[#087e7c] text-white font-bold text-xs shadow-md">
              SỔ HỌC TẬP ĐIỆN TỬ & MINH CHỨNG THỰC NGHIỆM
              <div className="text-[10px] text-gray-200 font-normal">Lưu vết Pre-test / Post-test tự động, xuất báo cáo nghiên cứu ẩn danh</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">1. Câu hỏi Làm rõ</div>
              <p className="text-gray-600 text-[11px]">&quot;Biểu thức $200y$ trong bài làm của em biểu thị cho lượng protein hay lipit?&quot;</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">2. Kiểm tra Giả định</div>
              <p className="text-gray-600 text-[11px]">&quot;Điểm $O(0;0)$ đang nằm trên đường biên hay nằm về một phía của mặt phẳng?&quot;</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">3. Kiểm tra Căn cứ</div>
              <p className="text-gray-600 text-[11px]">&quot;Em hãy lấy tọa độ một điểm trong miền vừa chọn thay vào xem đúng hay sai?&quot;</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div className="font-bold text-gray-800">4. Hệ quả Thực tiễn</div>
              <p className="text-gray-600 text-[11px]">&quot;Số lượng xe tải chở hàng có thể nhận giá trị âm hoặc số thập phân được không?&quot;</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dữ liệu thực nghiệm & Tải hồ sơ KHKT */}
      {activeTab === "evidence" && (
        <div className="space-y-6">
          {/* Download Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="font-bold text-sm text-[#152f35] mt-1">Bản in Học liệu Chuẩn hóa</h3>
                <p className="text-[11px] text-gray-500 mt-1">Bộ phiếu học tập khám phá 48 trạm định dạng LaTeX/PDF cho học sinh học trên lớp.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Ban_in_Hoc_lieu_Chuan_hoa_MathSTEP", "PDF")}
                className="w-full py-2 bg-[#087e7c] text-white rounded-xl font-bold text-xs hover:bg-[#066563] transition-colors"
              >
                Tải bản in Học liệu (PDF)
              </button>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <Landmark className="w-6 h-6 text-emerald-600" />
                <h3 className="font-bold text-sm text-[#152f35] mt-1">Biên bản Thẩm định Chuyên môn</h3>
                <p className="text-[11px] text-gray-500 mt-1">Biên bản đánh giá tính chính xác toán học và sư phạm của Tổ Toán THPT.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bien_ban_Tham_dinh_Chuyen_mon_To_Toan", "PDF")}
                className="w-full py-2 bg-[#152f35] text-white rounded-xl font-bold text-xs hover:bg-black transition-colors"
              >
                Tải biên bản thẩm định (PDF)
              </button>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#d9e4e2] shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h3 className="font-bold text-sm text-[#152f35] mt-1">Báo cáo Dữ liệu Thực nghiệm</h3>
                <p className="text-[11px] text-gray-500 mt-1">Bảng tổng hợp điểm Pre-test, Post-test và phân tích hiệu quả thống kê.</p>
              </div>
              <button
                onClick={() => handleDownloadSampleDoc("Bao_cao_Du_lieu_Thuc_nghiem_Pre_Post_Test", "CSV")}
                className="w-full py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 transition-colors"
              >
                Tải dữ liệu thực nghiệm (CSV)
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
    </div>
  );
}
