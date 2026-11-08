"use client";

import React, { useState } from "react";
import { ShieldAlert, GraduationCap, Lock, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

interface TeacherAccessGuardProps {
  currentRole: string;
  isAuthenticated: boolean;
  onBackToStudent: () => void;
  onUpgradeSuccess: () => void;
  onRequireLogin: () => void;
}

export default function TeacherAccessGuard({
  currentRole,
  isAuthenticated,
  onBackToStudent,
  onUpgradeSuccess,
  onRequireLogin,
}: TeacherAccessGuardProps) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onRequireLogin();
      return;
    }

    if (!teacherCode.trim()) {
      setError("Vui lòng nhập Mã xác thực Sư phạm.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/account/verify-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherCode: teacherCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail?.message || data?.message || "Mã xác thực không hợp lệ.");
      }

      setSuccess(data.message || "Xác thực vai trò Giáo viên thành công!");
      setTimeout(() => {
        onUpgradeSuccess();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi xác thực.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 relative overflow-hidden backdrop-blur-md">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header icon & Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Bảo vệ Sư phạm & Phân quyền RBAC
                </span>
                <h2 className="text-lg font-bold text-white">Khu vực Giảng dạy & Chẩn đoán Sư phạm</h2>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              Vai trò: <strong className="text-blue-400 capitalize">{currentRole === "guest" ? "Khách" : currentRole === "student" ? "Học sinh" : currentRole}</strong>
            </span>
          </div>

          {/* Explanation block */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Chức năng giới hạn cho Giáo viên & Chuyên gia bộ môn</span>
            </div>
            <p className="text-slate-400">
              Theo quy chuẩn sư phạm gợi mở <strong>Socratic GDPT 2018</strong>, các tài nguyên gồm:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong className="text-slate-300">Ma trận bẫy ngộ nhận</strong> và thống kê điểm yếu tư duy của học sinh.</li>
              <li><strong className="text-slate-300">Kế hoạch bài dạy số hóa (Giáo án)</strong> phân phối 55 phút.</li>
              <li><strong className="text-slate-300">Ngân hàng can thiệp & đáp án chuẩn</strong> định dạng LaTeX/GeoGebra.</li>
            </ul>
            <p className="text-slate-400 pt-1">
              được bảo vệ để đảm bảo học sinh duy trì sự tò mò khoa học, tự tay thao tác mô hình và tự phát hiện định lý thay vì ỷ lại vào lời giải có sẵn.
            </p>
          </div>

          {/* Verification form or Actions */}
          {showCodeInput ? (
            <form onSubmit={handleVerifyTeacher} className="space-y-3.5 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nhập mã định danh Sư phạm (Teacher Access Code):</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCodeInput(false)}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  Đóng
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="Ví dụ: MATHSTEP-GV-2026"
                  disabled={busy}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {busy ? "Đang kiểm tra..." : "Xác nhận"}
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 p-2 rounded-lg border border-rose-900/50">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/50">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Ghi chú: Thầy/cô giảng dạy THPT có thể sử dụng mã phát hành hoặc liên hệ ban tổ chức để nhận mã cấp quyền.
              </p>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToStudent}
                className="w-full sm:flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Cổng học tập Học sinh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    onRequireLogin();
                  } else {
                    setShowCodeInput(true);
                  }
                }}
                className="w-full sm:flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 active:scale-[0.98] text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Tôi là Giáo viên (Kích hoạt)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
