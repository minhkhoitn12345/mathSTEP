"use client";

import React, { useRef } from "react";
import { Printer, Target } from "lucide-react";

interface WorksheetPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: {
    id: string;
    title: string;
    source: string;
    goal: string;
    simulation: string;
    is3D: boolean;
  };
  canvasSnapshotUrl: string | null;
  predictionText?: string;
  reasonText?: string;
  observations?: { at: string; summary: string }[];
  quizQuestion?: {
    question: string;
    options: string[];
    correctIdx: number;
    explanation: string;
  };
  transferProblem?: {
    prompt: string;
    hint: string;
  };
  metricsSummary?: string[];
}

export default function WorksheetPrintModal({
  isOpen,
  onClose,
  station,
  canvasSnapshotUrl,
  predictionText,
  reasonText,
  observations = [],
  quizQuestion,
  transferProblem,
  metricsSummary = [],
}: WorksheetPrintModalProps) {
  const printRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#08232999] backdrop-blur-sm flex items-center justify-center p-3 md:p-6 print:p-0 print:bg-white print:static"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl h-[92vh] rounded-2xl shadow-2xl border border-[#d9e4e2] flex flex-col overflow-hidden text-xs print:h-auto print:max-w-none print:shadow-none print:border-none print:rounded-none">
        {/* Header - Hidden on Print */}
        <header className="px-5 py-3 border-b border-[#d9e4e2] bg-[#f8faf9] flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-slate-700" />
            <div>
              <h2 className="font-bold text-sm text-[#152f35]">
                Xem trước Phiếu học tập A4 · Trạm {station.id}
              </h2>
              <p className="text-[11px] text-[#63777c]">
                Phiếu in dùng cho học sinh thực hành trên lớp hoặc làm bài thu hoạch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#087e7c] text-white rounded-lg font-bold hover:bg-[#066563] flex items-center gap-1.5 shadow-sm"
            >
              <span className="flex items-center gap-1.5"><Printer className="w-4 h-4" /><span>In ra giấy / Lưu PDF</span></span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Printable Worksheet Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 print:bg-white print:p-0">
          <div
            ref={printRef}
            className="max-w-[210mm] mx-auto bg-white p-8 md:p-10 shadow-md border border-gray-200 print:shadow-none print:border-none print:p-2 print:max-w-none text-[#111827] font-sans"
          >
            {/* 1. Header hành chính */}
            <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider">
                  SỞ GIÁO DỤC VÀ ĐÀO TẠO ........................
                </div>
                <div className="text-xs font-bold text-gray-800">
                  TRƯỜNG THPT: ...........................................................
                </div>
                <div className="text-[11px] text-gray-600 italic">
                  Năm học: 202... - 202...
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-[#087e7c] print:text-black">
                  PHIẾU HỌC TẬP THỰC HÀNH MÔ PHỎNG
                </div>
                <div className="text-[11px] font-medium text-gray-700">
                  Lớp: ................... · Nhóm: ...................
                </div>
                <div className="text-[11px] font-medium text-gray-700">
                  Họ và tên: ...........................................................
                </div>
              </div>
            </div>

            {/* 2. Tiêu đề trạm học & Mục tiêu */}
            <div className="text-center mb-5">
              <h1 className="text-base font-extrabold uppercase text-[#087e7c] print:text-black tracking-wide">
                BÀI HỌC: {station.title}
              </h1>
              <div className="text-xs font-semibold text-gray-600 mt-0.5">
                Mã trạm: {station.id} · Nguồn: {station.source}
              </div>
              <div className="mt-2 p-2.5 bg-gray-100 rounded border border-gray-300 text-left text-[11px] leading-relaxed">
                <strong className="flex items-center gap-1"><Target className="w-3.5 h-3.5 text-emerald-600 inline" /><span>Yêu cầu cần đạt (GDPT 2018):</span></strong> {station.goal}
              </div>
            </div>

            {/* 3. Mô phỏng trực quan & Ảnh chụp phòng Lab */}
            <div className="mb-5 border border-gray-300 rounded p-3 bg-white break-inside-avoid">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs uppercase text-gray-800">
                  I. Trực quan hóa mô hình mô phỏng ({station.is3D ? "3D Không gian" : "2D Mặt phẳng"})
                </span>
                <span className="text-[10px] text-gray-500 italic">Hình chụp từ Canvas tương tác</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {canvasSnapshotUrl ? (
                  <div className="border border-gray-300 rounded bg-white p-1 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={canvasSnapshotUrl}
                      alt="Mô hình mô phỏng phòng lab"
                      className="max-h-48 mx-auto object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded h-40 flex items-center justify-center text-gray-400 text-xs italic">
                    [Khung vẽ sơ đồ mô phỏng của học sinh]
                  </div>
                )}

                <div className="text-[11px] space-y-1.5">
                  <div className="font-semibold text-gray-700">Thông số mô hình hiện tại:</div>
                  {metricsSummary.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-0.5 text-gray-800">
                      {metricsSummary.map((m, idx) => (
                        <li key={idx} className="font-mono text-[11px]">
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 italic">Mô hình đang ở trạng thái chuẩn SGK.</p>
                  )}
                  <div className="pt-2 text-[10px] text-gray-500 italic leading-snug">
                    * Học sinh sử dụng mô hình để đối chiếu số liệu và kiểm chứng tính chất hình học.
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Tiến trình 7 bước học tập */}
            <div className="space-y-4">
              {/* Bước 1 & 2: Dự đoán */}
              <div className="border border-gray-300 rounded p-3 break-inside-avoid">
                <div className="font-bold text-xs uppercase text-gray-800 mb-1">
                  II. Dự đoán ban đầu & Cơ sở suy luận
                </div>
                <div className="text-[11px] text-gray-700 mb-1">
                  <strong>Câu hỏi:</strong> Khi thay đổi các tham số của bài toán, em dự đoán điều gì sẽ xảy ra? Vì sao?
                </div>
                <div className="min-h-[50px] border-b border-dotted border-gray-400 text-[11px] text-gray-800 italic pt-1">
                  {predictionText ? (
                    <div>
                      <span>- Dự đoán: {predictionText}</span>
                      {reasonText && <div>- Giải thích: {reasonText}</div>}
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      ........................................................................................................................................................................................
                      <br />
                      ........................................................................................................................................................................................
                    </div>
                  )}
                </div>
              </div>

              {/* Bước 3: Quan sát & Thao tác */}
              <div className="border border-gray-300 rounded p-3 break-inside-avoid">
                <div className="font-bold text-xs uppercase text-gray-800 mb-1">
                  III. Bảng ghi chép dữ liệu quan sát thực nghiệm
                </div>
                <table className="w-full border-collapse border border-gray-300 text-[11px] mb-1">
                  <thead>
                    <tr className="bg-gray-100 font-semibold text-gray-700">
                      <th className="border border-gray-300 p-1 w-12 text-center">Lần</th>
                      <th className="border border-gray-300 p-1 text-left">Thao tác tham số thay đổi</th>
                      <th className="border border-gray-300 p-1 text-left">Hiện tượng / Dữ liệu quan sát được</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observations.length > 0 ? (
                      observations.slice(0, 3).map((obs, i) => (
                        <tr key={i}>
                          <td className="border border-gray-300 p-1 text-center font-bold">{i + 1}</td>
                          <td className="border border-gray-300 p-1 font-mono text-[10px]">{obs.at}</td>
                          <td className="border border-gray-300 p-1">{obs.summary}</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="border border-gray-300 p-1.5 text-center">1</td>
                          <td className="border border-gray-300 p-1.5"></td>
                          <td className="border border-gray-300 p-1.5"></td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 p-1.5 text-center">2</td>
                          <td className="border border-gray-300 p-1.5"></td>
                          <td className="border border-gray-300 p-1.5"></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bước 4: Kiểm tra trắc nghiệm */}
              {quizQuestion && (
                <div className="border border-gray-300 rounded p-3 break-inside-avoid">
                  <div className="font-bold text-xs uppercase text-gray-800 mb-1">
                    IV. Câu hỏi kiểm tra nhận thức
                  </div>
                  <div className="text-[11px] font-medium text-gray-900 mb-2">
                    {quizQuestion.question}
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[11px] pl-2">
                    {quizQuestion.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border border-gray-500 inline-block text-[10px] text-center font-bold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bước 5: Bài toán vận dụng */}
              {transferProblem && (
                <div className="border border-gray-300 rounded p-3 break-inside-avoid">
                  <div className="font-bold text-xs uppercase text-gray-800 mb-1">
                    V. Bài toán vận dụng nâng cao & Chuyển giao tri thức
                  </div>
                  <div className="text-[11px] font-medium text-gray-900 mb-2">
                    {transferProblem.prompt}
                  </div>
                  <div className="min-h-[80px] border border-dashed border-gray-400 rounded p-2 text-[10px] text-gray-400">
                    [Phần trình bày các bước lập luận, biến đổi công thức và đáp số của học sinh]
                  </div>
                </div>
              )}

              {/* Phần đánh giá của giáo viên */}
              <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-start text-[11px] break-inside-avoid">
                <div className="w-2/3">
                  <div className="font-bold text-gray-800 uppercase mb-1">
                    Nhận xét & Lời phê của Giáo viên:
                  </div>
                  <div className="border-b border-dotted border-gray-400 h-6"></div>
                  <div className="border-b border-dotted border-gray-400 h-6"></div>
                </div>
                <div className="w-28 text-center border border-gray-400 rounded p-2">
                  <div className="font-bold text-gray-700 uppercase text-[10px]">ĐIỂM SỐ</div>
                  <div className="h-8"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
