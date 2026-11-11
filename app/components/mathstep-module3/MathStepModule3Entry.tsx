"use client";

import dynamic from "next/dynamic";

const MathStepModule3App = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-5 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-center shadow-xl">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-violet-400" />
        <p className="text-sm font-bold">Đang mở phòng thí nghiệm lượng giác…</p>
        <p className="mt-1 text-xs text-slate-400">Đang chuẩn bị mô phỏng và các hoạt động học tập.</p>
      </div>
    </main>
  ),
});

export default function MathStepModule3Entry() {
  return <MathStepModule3App />;
}
