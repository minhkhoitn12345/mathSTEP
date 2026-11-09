"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Flame, LoaderCircle, Medal, RefreshCw, Sparkles, Trophy } from "lucide-react";

type Category = "streak" | "xp" | "lessons";
type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  total_xp: number;
  longest_streak_days: number;
  completed_lessons: number;
};
type LeaderboardResponse = {
  profile: { userId: string; displayName: string };
  boards: Record<Category, LeaderboardEntry[]>;
  own: LeaderboardEntry | null;
};

const CATEGORIES: Array<{ id: Category; title: string; subtitle: string; icon: typeof Flame; color: string; metric: keyof LeaderboardEntry; suffix: string }> = [
  { id: "streak", title: "Chuỗi học tập", subtitle: "Streak dài nhất", icon: Flame, color: "text-orange-500 bg-orange-50", metric: "longest_streak_days", suffix: "ngày" },
  { id: "xp", title: "Tích lũy XP", subtitle: "Tổng kinh nghiệm", icon: Sparkles, color: "text-violet-600 bg-violet-50", metric: "total_xp", suffix: "XP" },
  { id: "lessons", title: "Bền bỉ hoàn thành", subtitle: "Số bài đã hoàn thành", icon: Award, color: "text-emerald-600 bg-emerald-50", metric: "completed_lessons", suffix: "bài" },
];

function formatScore(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>("streak");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      const result = await response.json();
      if (response.status === 401) {
        setSignedOut(true);
        setData(null);
        return;
      }
      if (!response.ok || !result?.ok) throw new Error(result?.detail?.message || result?.message || "Chưa tải được bảng xếp hạng.");
      setSignedOut(false);
      setData(result as LeaderboardResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Chưa tải được bảng xếp hạng. Em thử lại nhé.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadLeaderboard(); }, [loadLeaderboard]);

  const selected = CATEGORIES.find((item) => item.id === category)!;
  const Icon = selected.icon;
  const entries = data?.boards?.[category] ?? [];

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700">
            <ArrowLeft className="h-4 w-4" /> Về trang học
          </Link>
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-slate-900">
            <Trophy className="h-5 w-5 text-amber-500" /> OPTIMATH LAB
          </div>
          <button type="button" onClick={() => void loadLeaderboard()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-[28px] bg-[#101a34] px-6 py-8 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-300">Cùng nhau tiến bộ</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Bảng xếp hạng</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Mỗi ngày học thêm một chút. Ghi nhận chuỗi ngày học, kinh nghiệm và những bài em đã chinh phục.
            </p>
          </div>
          <Medal className="absolute bottom-6 right-7 hidden h-24 w-24 text-amber-300/80 sm:block" strokeWidth={1.2} />
        </section>

        {signedOut ? (
          <section className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Trophy className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-4 text-xl font-extrabold">Đăng nhập để tham gia</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Bảng xếp hạng dùng tên hiển thị và tiến độ học tập của tài khoản. Email của em không được đưa lên bảng.</p>
            <Link href="/?auth=login" className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800">Đăng nhập</Link>
          </section>
        ) : (
          <>
            {data?.own && (
              <section className="mt-6 grid gap-3 sm:grid-cols-3">
                {CATEGORIES.map((item) => {
                  const StatIcon = item.icon;
                  const value = Number(data.own?.[item.metric] ?? 0);
                  return (
                    <article key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}><StatIcon className="h-5 w-5" /></span>
                      <div><p className="text-xs font-medium text-slate-500">{item.subtitle} của em</p><p className="mt-0.5 text-lg font-extrabold">{formatScore(value)} <span className="text-xs font-semibold text-slate-400">{item.suffix}</span></p></div>
                    </article>
                  );
                })}
              </section>
            )}

            <section className="mt-8">
              <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Ba cách để tỏa sáng</p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight">Chọn hạng mục</h2>
                </div>
                {data?.profile && <p className="text-xs text-slate-500">Đang xem với tên <strong className="text-slate-700">{data.profile.displayName}</strong></p>}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {CATEGORIES.map((item) => {
                  const CategoryIcon = item.icon;
                  const active = category === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => setCategory(item.id)} aria-pressed={active} className={`rounded-2xl border p-4 text-left transition ${active ? "border-blue-700 bg-white shadow-md shadow-blue-900/5 ring-1 ring-blue-700" : "border-slate-200 bg-white/70 hover:border-slate-300 hover:bg-white"}`}>
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color}`}><CategoryIcon className="h-5 w-5" /></span>
                      <span className="mt-3 block text-sm font-bold">{item.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{item.subtitle}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${selected.color}`}><Icon className="h-5 w-5" /></span>
                  <div><h3 className="font-extrabold">{selected.title}</h3><p className="mt-0.5 text-xs text-slate-500">Top 50 học sinh</p></div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">THPT</span>
              </div>

              {loading ? (
                <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Đang tải thứ hạng…</div>
              ) : error ? (
                <div className="px-6 py-12 text-center"><p className="text-sm font-semibold text-rose-700">{error}</p><button type="button" onClick={() => void loadLeaderboard()} className="mt-3 text-sm font-bold text-blue-700 hover:underline">Thử lại</button></div>
              ) : entries.length === 0 ? (
                <div className="px-6 py-14 text-center"><Trophy className="mx-auto h-9 w-9 text-amber-400" /><p className="mt-3 font-bold">Bảng đang chờ những học sinh đầu tiên</p><p className="mt-1 text-sm text-slate-500">Hoàn thành một bài học để ghi tên mình vào đây.</p></div>
              ) : (
                <ol className="divide-y divide-slate-100">
                  {entries.map((entry, index) => {
                    const isMe = entry.user_id === data?.profile.userId;
                    const value = Number(entry[selected.metric] ?? 0);
                    return (
                      <li key={entry.user_id} className={`flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 ${isMe ? "bg-blue-50/80" : "hover:bg-slate-50/70"}`}>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-200 text-slate-600" : index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-500"}`}>
                          {index < 3 ? <Medal className="h-4 w-4" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-800">{entry.display_name}{isMe && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">Em</span>}</p><p className="mt-0.5 text-[11px] text-slate-400">Học sinh OPTIMATH LAB</p></div>
                        <p className="shrink-0 text-sm font-extrabold tabular-nums text-slate-900">{formatScore(value)} <span className="text-[11px] font-semibold text-slate-400">{selected.suffix}</span></p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
            <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">Bảng xếp hạng cập nhật khi học sinh hoàn thành bài học và đồng bộ tiến độ khi đăng nhập.</p>
          </>
        )}
      </div>
    </main>
  );
}
