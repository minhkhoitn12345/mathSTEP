import React from 'react';
import { OptiMascot } from '@/app/components/optimath/mascot/OptiMascot';

export const Footer: React.FC = () => (
  <footer className="border-t border-slate-800 bg-slate-900 text-slate-400">
    <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
          <svg viewBox="0 0 40 40" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M 12 28 L 20 12 L 28 28 Z" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3" fill="#FBBF24" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-tight text-white">MathSTEP</p>
          <p className="mt-0.5 text-xs">Phòng học Toán tương tác THPT</p>
        </div>
      </div>

      <p className="max-w-2xl text-xs leading-relaxed md:text-center">
        Dự án phục vụ mục đích giáo dục. Nội dung có thể có sai sót; học sinh nên đối chiếu với sách giáo khoa và hướng dẫn của giáo viên.
      </p>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>© {new Date().getFullYear()} MathSTEP</span>
        <OptiMascot expression="happy" size={24} animate={false} />
      </div>
    </div>
  </footer>
);
