"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import MathGraphVisualizer from "./components/MathGraphVisualizer";

type ModuleId = "linear_programming" | "spatial_geometry" | "trigonometry";
type StageId = "observe" | "predict" | "manipulate" | "explore" | "verify" | "explain" | "transfer" | "apply";
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; intent?: string; nextQuestion?: string; hintLevel?: number; validation?: { status: string; result: boolean | number | null; explanation: string } | null };
type Session = { authenticated: boolean; name: string | null; email: string | null };
type RecentConversation = { id: string; title: string | null; module: ModuleId; updated_at: string };

function normalizeMathDelimiters(content: string): string {
  if (!content) return "";
  let text = content;
  // 1. Chuẩn hóa \[ ... \] thành $$ ... $$
  text = text.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expr: string) => `$$\n${expr.trim()}\n$$`);
  // 2. Chuẩn hóa \( ... \) thành $ ... $
  text = text.replace(/\\\(([\s\S]+?)\\\)/g, (_match, expr: string) => `$${expr.trim()}$`);
  // 3. Tự động bọc \begin{cases|aligned|matrix} trong $$ nếu chưa có
  text = text.replace(/(?<!\$)\s*(\\begin\{(cases|aligned|matrix|pmatrix|bmatrix)\}[\s\S]+?\\end\{\2\})\s*(?!\$)/g, (_match, block: string) => {
    return `\n$$\n${block.trim()}\n$$\n`;
  });
  // 4. Chuẩn hóa khoảng cách quanh dấu $ inline
  text = text.replace(/(?<!\$)\$\s+([^\$\n]+?)\s+\$(?!\$)/g, "$$$1$$");
  return text;
}

function MathMessage({ content }: { content: string }) {
  const normalized = useMemo(() => normalizeMathDelimiters(content), [content]);
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
    >
      {normalized}
    </ReactMarkdown>
  );
}

const modules: { id: ModuleId; title: string; short: string }[] = [
  { id: "linear_programming", title: "Quy hoạch tuyến tính", short: "Miền nghiệm & tối ưu" },
  { id: "spatial_geometry", title: "Hình học không gian", short: "Quan sát & suy luận" },
  { id: "trigonometry", title: "Lượng giác", short: "Góc & đường tròn" },
];
const stages: { id: StageId; label: string }[] = [
  { id: "observe", label: "Quan sát" }, { id: "predict", label: "Dự đoán" }, { id: "manipulate", label: "Thao tác" }, { id: "explore", label: "Khám phá" },
  { id: "verify", label: "Kiểm chứng" }, { id: "explain", label: "Giải thích" }, { id: "transfer", label: "Chuyển giao" }, { id: "apply", label: "Vận dụng" },
];
const starters: Record<ModuleId, string[]> = {
  linear_programming: ["Miền nghiệm của hệ bất phương trình là gì?", "Làm sao kiểm tra điểm (2, 3) có thuộc miền nghiệm?"],
  spatial_geometry: ["Làm sao phân biệt đường thẳng song song với mặt phẳng?", "Em nên bắt đầu chứng minh quan hệ vuông góc thế nào?"],
  trigonometry: ["Vì sao sin và cos gắn với đường tròn lượng giác?", "Em hay nhầm dấu lượng giác ở các góc phần tư."],
};
const demoQuestions: Record<ModuleId, string> = {
  linear_programming: "Với x ≥ 0, y ≥ 0 và x + y ≤ 6, em thử kiểm tra xem điểm (2, 3) có thuộc miền nghiệm không nhé.",
  spatial_geometry: "Cho hình chóp S.ABC có SA vuông góc với mặt phẳng (ABC). Em thử xác định đường thẳng nào trong đáy vuông góc với SA nhé.",
  trigonometry: "Trên đường tròn lượng giác, điểm ứng với góc 60° có tọa độ liên quan thế nào đến cos 60° và sin 60°? Em thử dự đoán nhé.",
};
const stageGuides: Record<ModuleId, string[]> = {
  linear_programming: [
    "Quan sát các bất phương trình và xác định điều kiện nào giới hạn miền nghiệm.",
    "Dự đoán điểm (2, 3) có thỏa mãn đồng thời mọi điều kiện không.",
    "Thay x = 2 và y = 3 vào từng bất phương trình.",
    "So sánh kết quả thay số với dấu của từng bất phương trình.",
    "Kiểm tra lại các phép tính và kết luận điểm có thuộc miền nghiệm.",
    "Giải thích vì sao chỉ cần một điều kiện sai là điểm không thuộc miền nghiệm.",
    "Thử áp dụng cách kiểm tra này với một điểm khác trong mặt phẳng.",
    "Tự chọn một điểm và trình bày đầy đủ cách xác định điểm thuộc miền nghiệm.",
  ],
  spatial_geometry: [
    "Quan sát giả thiết SA vuông góc với mặt phẳng đáy (ABC).",
    "Dự đoán SA vuông góc với những đường nào nằm trong mặt phẳng đáy.",
    "Chọn một đường thẳng trong (ABC) đi qua chân đường vuông góc A.",
    "Dùng định nghĩa đường thẳng vuông góc với mặt phẳng để suy luận.",
    "Kiểm tra lại đường thẳng em chọn có nằm trong mặt phẳng (ABC) không.",
    "Giải thích vì sao SA vuông góc với mọi đường thẳng trong đáy đi qua A.",
    "Thử chuyển lập luận sang một mặt phẳng khác chứa đường thẳng vuông góc.",
    "Tự nêu một kết luận vuông góc khác và chỉ ra giả thiết cần dùng.",
  ],
  trigonometry: [
    "Quan sát vị trí góc 60° trên đường tròn lượng giác.",
    "Dự đoán dấu của sin 60° và cos 60° dựa vào góc phần tư.",
    "Xác định hoành độ và tung độ của điểm trên đường tròn.",
    "Liên hệ hoành độ với cos và tung độ với sin.",
    "Kiểm tra kết quả bằng hệ thức sin²x + cos²x = 1.",
    "Giải thích vì sao cả sin 60° và cos 60° đều dương.",
    "Thử so sánh tọa độ tại góc 120° với góc 60°.",
    "Tự xác định dấu và giá trị lượng giác của một góc em chọn.",
  ],
};

function ArrowUpRight() {
  return <svg className="arrow-up-right" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>;
}

function SparkleIcon() {
  return <svg className="sparkle-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 15Z"/></svg>;
}

function ModuleIcon({ id }: { id: ModuleId }) {
  if (id === "linear_programming") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16M5 18V5m1 12 4-4 3 2 6-7"/><circle cx="10" cy="13" r="1"/><circle cx="13" cy="15" r="1"/></svg>;
  if (id === "spatial_geometry") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.7 8-4.7M12 12.2V21"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 19h14M5 19V5"/><path d="M9 19a4 4 0 0 1 0-5.7"/><path d="M13 19a8 8 0 0 1 0-11.3"/></svg>;
}

function mascotClass(emotion?: string) {
  return `mascot ${emotion ?? "encouraging"}`;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [moduleId, setModuleId] = useState<ModuleId>("linear_programming");
  const [stage, setStage] = useState<StageId>("explore");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [recoverMode, setRecoverMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accountKey, setAccountKey] = useState("");
  const [accountKeyConfigured, setAccountKeyConfigured] = useState(false);
  const [accountKeyBusy, setAccountKeyBusy] = useState(false);
  const [accountKeyLoading, setAccountKeyLoading] = useState(false);
  const [accountKeyNotice, setAccountKeyNotice] = useState("");
  const [accountKeyError, setAccountKeyError] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoadingMore, setHistoryLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const currentModule = useMemo(() => modules.find((item) => item.id === moduleId)!, [moduleId]);
  const storageKey = session?.email ? `mathstep:last-conversation:${session.email.toLowerCase()}` : null;

  const loadSession = useCallback(async () => {
    setSessionLoading(true);
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await response.json() as Session;
      setSession(data);
    } catch {
      setSession({ authenticated: false, name: null, email: null });
    } finally {
      setSessionLoading(false);
    }
  }, []);

  async function openAccount() {
    setAccountOpen(true);
    setAccountKey("");
    setAccountKeyNotice("");
    setAccountKeyError("");
    setAccountKeyLoading(true);
    try {
      const response = await fetch("/api/account/api-key", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa tải được trạng thái API key.");
      setAccountKeyConfigured(Boolean(data.configured));
    } catch (cause) {
      setAccountKeyError(cause instanceof Error ? cause.message : "Chưa tải được trạng thái API key.");
    } finally { setAccountKeyLoading(false); }
  }

  async function saveAccountKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = accountKey.trim();
    setAccountKeyNotice(""); setAccountKeyError("");
    if (value.length < 20 || value.length > 512 || /\s/.test(value)) {
      setAccountKeyError("API key cần dài từ 20 đến 512 ký tự và không chứa khoảng trắng.");
      return;
    }
    setAccountKeyBusy(true);
    try {
      const response = await fetch("/api/account/api-key", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: value }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa lưu được API key.");
      setAccountKeyConfigured(true);
      setAccountKey("");
      setAccountKeyNotice("API key đã được lưu mã hóa. Khóa đầy đủ sẽ không hiển thị lại.");
    } catch (cause) {
      setAccountKeyError(cause instanceof Error ? cause.message : "Chưa lưu được API key.");
    } finally { setAccountKeyBusy(false); }
  }

  async function removeAccountKey() {
    setAccountKeyBusy(true); setAccountKeyNotice(""); setAccountKeyError("");
    try {
      const response = await fetch("/api/account/api-key", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa xóa được API key.");
      setAccountKeyConfigured(false);
      setAccountKey("");
      setAccountKeyNotice("Đã xóa API key. MathSTEP sẽ dùng cấu hình AI mặc định.");
    } catch (cause) {
      setAccountKeyError(cause instanceof Error ? cause.message : "Chưa xóa được API key.");
    } finally { setAccountKeyBusy(false); }
  }

  async function loadMoreHistory() {
    if (historyLoadingMore || !historyHasMore) return;
    setHistoryLoadingMore(true);
    setHistoryError("");
    try {
      const response = await fetch(`/api/chat/conversations?limit=20&offset=${historyOffset}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa tải thêm được lịch sử.");
      const items = Array.isArray(data?.items) ? data.items as RecentConversation[] : [];
      setRecentConversations((existing) => [...existing, ...items.filter((item) => !existing.some((previous) => previous.id === item.id))]);
      setHistoryOffset(Number(data?.next_offset ?? historyOffset + items.length));
      setHistoryHasMore(Boolean(data?.has_more));
    } catch (cause) {
      setHistoryError(cause instanceof Error ? cause.message : "Chưa tải thêm được lịch sử.");
    } finally { setHistoryLoadingMore(false); }
  }

  const closeAccount = useCallback(() => {
    setAccountKey("");
    setAccountOpen(false);
  }, []);

  useEffect(() => { void loadSession(); }, [loadSession]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);
  useEffect(() => {
    if (!accountOpen) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") closeAccount(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [accountOpen, closeAccount]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") === "confirmed") setLoginNotice("Email đã được xác nhận. Em có thể bắt đầu học ngay.");
    if (params.get("auth_error") === "google-disabled") setLoginError("Đăng nhập Google chưa được bật cho ứng dụng. Em vẫn có thể đăng nhập bằng email hoặc dùng thử.");
    if (params.has("auth")) window.history.replaceState(null, "", window.location.pathname);
    if (params.has("auth_error")) window.history.replaceState(null, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (!session?.authenticated || !storageKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const listResponse = await fetch("/api/chat/conversations?limit=20&offset=0", { cache: "no-store" });
        const listData = await listResponse.json();
        const items = Array.isArray(listData?.items) ? listData.items : [];
        if (!cancelled) {
          setRecentConversations(items);
          setHistoryOffset(Number(listData?.next_offset ?? items.length));
          setHistoryHasMore(Boolean(listData?.has_more));
        }
        const savedId = localStorage.getItem(storageKey);
        if (!savedId || !/^[0-9a-f-]{36}$/i.test(savedId)) return;
        const detailResponse = await fetch(`/api/chat/conversations/${savedId}`, { cache: "no-store" });
        if (!detailResponse.ok) { localStorage.removeItem(storageKey); return; }
        const detail = await detailResponse.json();
        if (cancelled || !detail?.conversation || !Array.isArray(detail.messages)) return;
        setConversationId(String(detail.conversation.id));
        if (modules.some((item) => item.id === detail.conversation.module)) setModuleId(detail.conversation.module);
        setMessages(detail.messages.map((item: { id: string; role: "user" | "assistant"; content: string; intent?: string; hint_level?: number; math_validation?: ChatMessage["validation"]; learning_stage?: StageId }) => ({
          id: String(item.id), role: item.role, content: item.content, intent: item.intent,
          hintLevel: item.hint_level, validation: item.math_validation,
        })));
        const lastStage = detail.messages.at(-1)?.learning_stage as StageId | undefined;
        if (lastStage && stages.some((item) => item.id === lastStage)) setStage(lastStage);
      } catch {
        if (!cancelled) setError("Chưa tải được hội thoại gần đây.");
      }
    })();
    return () => { cancelled = true; };
  }, [session?.authenticated, storageKey]);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginBusy(true); setLoginError(""); setLoginNotice("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) throw new Error("Vui lòng nhập email đúng định dạng.");
      if (!recoverMode && !loginPassword) throw new Error("Vui lòng nhập mật khẩu.");
      if (authMode === "signup" && !recoverMode && !displayName.trim()) throw new Error("Vui lòng nhập họ và tên của em.");
      if (authMode === "signup" && !recoverMode && loginPassword.length < 6) throw new Error("Mật khẩu cần có ít nhất 6 ký tự.");
      if (authMode === "signup" && !recoverMode && loginPassword !== confirmPassword) throw new Error("Mật khẩu xác nhận chưa khớp.");
      if (recoverMode) {
        const response = await fetch("/api/auth/recover", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail.trim().toLowerCase() }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa gửi được email đặt lại mật khẩu.");
        setLoginNotice("Nếu email này đã đăng ký, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của em.");
        return;
      }
      const response = await fetch(authMode === "login" ? "/api/auth/login" : "/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword, name: displayName.trim() }) });
      const data = await response.json();
      if (!response.ok) {
        if (data?.detail?.code === "EMAIL_NOT_CONFIRMED") setConfirmationPending(true);
        throw new Error(data?.detail?.message ?? "Đăng nhập chưa thành công.");
      }
      setLoginPassword("");
      setConfirmPassword("");
      if (data.confirmation_required) { setAuthMode("login"); setRecoverMode(false); setConfirmationPending(true); setLoginNotice("Tài khoản đã được tạo. Hãy mở email xác nhận trong hộp thư đến hoặc thư rác, rồi quay lại đăng nhập."); return; }
      await loadSession();
    } catch (cause) {
      setLoginError(cause instanceof Error ? cause.message : "Đã có lỗi. Em thử lại nhé.");
    } finally { setLoginBusy(false); }
  }

  async function resendConfirmation() {
    setResendBusy(true); setLoginError(""); setLoginNotice("");
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) throw new Error("Vui lòng nhập email đúng định dạng trước.");
      const response = await fetch("/api/auth/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail.trim().toLowerCase() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Chưa gửi lại được email.");
      setLoginNotice("Đã yêu cầu gửi lại email xác nhận. Hãy kiểm tra cả hộp thư rác.");
    } catch (cause) { setLoginError(cause instanceof Error ? cause.message : "Đã có lỗi. Hãy thử lại."); }
    finally { setResendBusy(false); }
  }

  function startDemo() {
    setDemoMode(true);
    setMessages([{ id: "demo-welcome", role: "assistant", content: `Mình cùng thử một bài nhé: ${demoQuestions[moduleId]} ${stageGuides[moduleId][0]}` }]);
    setError("");
  }



  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession({ authenticated: false, name: null, email: null });
    setMessages([]);
    setConversationId(null);
    setRecentConversations([]);
    setHistoryOffset(0); setHistoryHasMore(false); setHistoryError("");
  }

  async function openConversation(id: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/chat/conversations/${id}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Không mở được hội thoại này.");
      setConversationId(String(data.conversation.id));
      if (modules.some((item) => item.id === data.conversation.module)) setModuleId(data.conversation.module);
      setMessages(data.messages.map((item: { id: string; role: "user" | "assistant"; content: string; intent?: string; hint_level?: number; math_validation?: ChatMessage["validation"]; learning_stage?: StageId }) => ({
        id: String(item.id), role: item.role, content: item.content, intent: item.intent,
        hintLevel: item.hint_level, validation: item.math_validation,
      })));
      const lastStage = data.messages.at(-1)?.learning_stage as StageId | undefined;
      if (lastStage && stages.some((item) => item.id === lastStage)) setStage(lastStage);
      if (storageKey) localStorage.setItem(storageKey, String(data.conversation.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không mở được hội thoại.");
    } finally { setBusy(false); }
  }

  function beginNewConversation(nextModule: ModuleId = moduleId) {
    if (!session?.authenticated && !demoMode && nextModule === moduleId) { setLoginError("Vui lòng đăng nhập để bắt đầu phiên học mới."); return; }
    setModuleId(nextModule);
    setConversationId(null);
    setMessages(demoMode ? [{ id: crypto.randomUUID(), role: "assistant", content: `Mình cùng thử một bài nhé: ${demoQuestions[nextModule]} ${stageGuides[nextModule][0]}` }] : []);
    setInput("");
    setStage("observe");
    setError("");
    if (storageKey) localStorage.removeItem(storageKey);
  }

  async function sendMessage(text = input, requestedHint?: number) {
    const message = text.trim();
    if (!message || busy) return;
    if (demoMode && !session?.authenticated) {
      const studentMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message };
      const activeStep = stages.findIndex((item) => item.id === stage);
      const demoReply: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: `Gợi ý ở bước ${String(activeStep + 1).padStart(2, "0")} · ${stages[activeStep].label}: ${stageGuides[moduleId][activeStep]}` };
      setMessages((items) => [...items, studentMessage, demoReply]); setInput("");
      return;
    }
    if (!session?.authenticated) return;
    const prior = messages;
    const previousHint = [...prior].reverse().find((item) => item.role === "assistant" && item.intent === "hint")?.hintLevel ?? 0;
    const hintLevel = requestedHint ?? (/gợi ý (thêm|tiếp)|nói thêm một chút/i.test(message) ? Math.min(3, previousHint + 1) : 1);
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: message };
    setMessages((items) => [...items, userMessage]); setInput(""); setBusy(true); setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
          mode: "guided_learning",
          learning_context: { module: moduleId, learning_stage: stage },
          history: prior.slice(-8).map(({ role, content }) => ({ role, content })),
          hint_level: hintLevel,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Linh vật chưa trả lời được. Em thử lại sau nhé.");
      const reply: ChatMessage = {
        id: data.message_id ?? crypto.randomUUID(), role: "assistant", content: data.answer,
        intent: data.intent, nextQuestion: data.next_action?.payload?.question, hintLevel: data.hint_level,
        validation: data.math_validation,
      };
      setMessages((items) => [...items, reply]);
      if (data.conversation_id) {
        setConversationId(String(data.conversation_id));
        if (storageKey) localStorage.setItem(storageKey, String(data.conversation_id));
        setRecentConversations((items) => {
          const next = [{ id: String(data.conversation_id), title: message, module: moduleId, updated_at: new Date().toISOString() }, ...items.filter((item) => item.id !== String(data.conversation_id))];
          return next.slice(0, 20);
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Đã có lỗi kết nối.");
      setMessages((items) => items.filter((item) => item.id !== userMessage.id));
      setInput(message);
    } finally { setBusy(false); }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="MathSTEP trang chủ"><span className="brand-mark">m</span><span>math<span className="brand-accent">step</span></span></Link>
        <div className="topbar-center"><span className="status-dot" /> HỌC THEO CÁCH CỦA EM</div>
        {session?.authenticated ? <div className="user-menu"><span className="user-avatar">{(session.name ?? session.email ?? "M").slice(0, 1).toUpperCase()}</span><span className="user-name">{session.name ?? session.email}</span><button className="quiet-button" onClick={() => void logout()}>Thoát</button></div> : demoMode ? <div className="guest-session-tools"><span className="demo-badge">Bản dùng thử</span><button className="quiet-button" onClick={() => { setDemoMode(false); setMessages([]); }}>Đăng nhập</button></div> : <div className="topbar-note">Bạn đồng hành Toán THPT</div>}
        {session?.authenticated && <button className="quiet-button account-open-button" type="button" onClick={() => void openAccount()}>Tài khoản của tôi</button>}
      </header>

      <section className="workspace" id="home">
        {mobileDrawerOpen && <button className="mobile-drawer-backdrop" type="button" aria-label="Đóng danh mục học" onClick={() => setMobileDrawerOpen(false)}/>}
        <aside className={`left-rail ${sidebarOpen ? "open" : "collapsed"} ${mobileDrawerOpen ? "mobile-open" : ""}`}>
          <div className="sidebar-actions">
            <button
              type="button"
              className="sidebar-new-chat-btn"
              onClick={() => { setMobileDrawerOpen(false); beginNewConversation(); }}
              disabled={!session?.authenticated && !demoMode}
              title={!session?.authenticated && !demoMode ? "Vui lòng đăng nhập để bắt đầu đoạn chat mới" : "Bắt đầu đoạn chat mới"}
            >
              <span className="sidebar-btn-icon">＋</span>
              <span>Đoạn chat mới</span>
            </button>
            <button
              type="button"
              className="sidebar-visualizer-btn"
              onClick={() => { setMobileDrawerOpen(false); setVisualizerOpen(true); }}
              title="Mở mô hình trực quan: đồ thị Oxy, đường tròn lượng giác, hình 3D"
            >
              <span className="sidebar-btn-icon">📐</span>
              <span>Mô hình & Đồ thị</span>
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-heading">CHUYÊN ĐỀ TOÁN HỌC</div>
            <div className="module-list" role="tablist" aria-label="Chọn chủ đề Toán">
              {modules.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={moduleId === item.id}
                  className={`module-card ${moduleId === item.id ? "selected" : ""}`}
                  onClick={() => { setMobileDrawerOpen(false); if (moduleId !== item.id) beginNewConversation(item.id); }}
                >
                  <span className="module-icon"><ModuleIcon id={item.id}/></span>
                  <span className="module-text">
                    <strong>{item.title}</strong>
                    <small>{item.short}</small>
                  </span>
                  <span className="module-chevron"><ArrowUpRight/></span>
                </button>
              ))}
            </div>
          </div>

          {recentConversations.length > 0 && (
            <div className="sidebar-section sidebar-history">
              <div className="sidebar-section-heading">LỊCH SỬ TRÒ CHUYỆN</div>
              <div className="recent-conversations-list">
                {recentConversations.slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    className={`recent-thread ${conversationId === String(item.id) ? "active" : ""}`}
                    onClick={() => { setMobileDrawerOpen(false); void openConversation(item.id); }}
                  >
                    <span className="recent-thread-icon">◷</span>
                    <span>{item.title || modules.find((entry) => entry.id === item.module)?.title || "Cuộc trò chuyện"}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        <section className="chat-panel" aria-label="Trò chuyện cùng MathSTEP">
          <div className="chat-header">
            <button type="button" className="sidebar-toggle-btn" onClick={() => setSidebarOpen((prev) => !prev)} title={sidebarOpen ? "Thu gọn thanh bên" : "Mở rộng thanh bên"} aria-label="Thu gọn/Mở thanh bên"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg></button>
            <button className="mobile-sidebar-toggle" type="button" onClick={() => setMobileDrawerOpen(true)} aria-label="Mở chủ đề và hành trình học"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Học</span></button><div className="chat-title"><div className="mini-mascot"><span /></div><div><strong>MathSTEP Mascot</strong><small><span className="online-dot" /> Sẵn sàng đồng hành</small></div></div><button
              type="button"
              className="visualizer-toggle-btn"
              onClick={() => setVisualizerOpen(true)}
              title="Mở mô hình trực quan: đồ thị Oxy, đường tròn lượng giác, hình 3D"
            >
              <span className="visualizer-toggle-icon">📐</span>
              <span className="visualizer-toggle-text">Mô hình trực quan</span>
            </button>
            <div className="chat-topic"><span className="topic-kicker">CHỦ ĐỀ</span><strong>{currentModule.title}</strong></div><button className="new-chat-button" onClick={() => beginNewConversation()} disabled={!session?.authenticated && !demoMode} title={!session?.authenticated && !demoMode ? "Vui lòng đăng nhập để bắt đầu phiên học mới" : "Bắt đầu bài học mới"}>＋ Mới</button></div>
          {!sessionLoading && !session?.authenticated && !demoMode ? (
            <div className="login-stage">
              <div className="auth-card">
              <div className={mascotClass()}>
                <span className="mascot-ear left"/><span className="mascot-ear right"/>
                <span className="mascot-face"><i className="eye left"/><i className="eye right"/><i className="smile"/><b className="cheek left"/><b className="cheek right"/></span>
                <svg className="mascot-spark-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>
              </div>
              <span className="login-kicker">{recoverMode ? "KHÔI PHỤC TÀI KHOẢN" : "BẮT ĐẦU HÀNH TRÌNH"}</span>
              <h2>{recoverMode ? <>Lấy lại quyền<br/><em>tiếp tục khám phá.</em></> : <>Chào em, mình cùng<br/><em>nghĩ Toán nhé.</em></>}</h2>
              <p>{recoverMode ? "Nhập email đã đăng ký. MathSTEP sẽ gửi hướng dẫn đặt lại mật khẩu đến hộp thư của em." : authMode === "login" ? "Đăng nhập tài khoản MathSTEP để trò chuyện và tiếp tục việc học của em." : "Tạo tài khoản học tập để lưu lại hành trình Toán của em."}</p>
              <form className="login-form" onSubmit={login} noValidate>
                {authMode === "signup" && !recoverMode && <label>{"H\u1ecd v\u00e0 t\u00ean"}<input type="text" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} required disabled={loginBusy}/></label>}
                <label>Email<input type="email" autoComplete="username" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required disabled={loginBusy} aria-label="Email"/></label>
                {!recoverMode && <label>{"M\u1eadt kh\u1ea9u"}<span className="password-field"><input type={showPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} minLength={authMode === "signup" ? 6 : undefined} required disabled={loginBusy}/><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "\u1ea8n m\u1eadt kh\u1ea9u" : "Hi\u1ec7n m\u1eadt kh\u1ea9u"} title={showPassword ? "\u1ea8n m\u1eadt kh\u1ea9u" : "Hi\u1ec7n m\u1eadt kh\u1ea9u"}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.2 9.5 7-.4 1.1-1.1 2.1-2 3M6.2 6.2C3.9 7.6 2.8 9.4 2.5 12c.5 1.4 1.5 2.7 3 3.8A10.5 10.5 0 0 0 12 18c1 0 2-.2 2.9-.5"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.3-7 9.5-7 9.5 7 9.5 7-3.3 7-9.5 7-9.5-7-9.5-7Z"/><circle cx="12" cy="12" r="3"/></svg>}</button></span></label>}
                {authMode === "signup" && !recoverMode && <label>{"X\u00e1c nh\u1eadn m\u1eadt kh\u1ea9u"}<input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required disabled={loginBusy}/></label>}
                {authMode === "login" && !recoverMode && <button type="button" className="forgot-link" onClick={() => { setRecoverMode(true); setLoginError(""); setLoginNotice(""); }}>{"Qu\u00ean m\u1eadt kh\u1ea9u?"}</button>}
                {loginError && <p className="inline-error" role="alert">{loginError}</p>}
                {loginNotice && <div className="auth-notice" role="status"><span aria-hidden="true">{"\u2713"}</span><p>{loginNotice}</p></div>}
                {confirmationPending && authMode === "login" && !recoverMode && <button type="button" className="resend-link" onClick={() => void resendConfirmation()} disabled={resendBusy || loginBusy}>{resendBusy ? "\u0110ang g\u1eedi l\u1ea1i\u2026" : "Ch\u01b0a nh\u1eadn \u0111\u01b0\u1ee3c email? G\u1eedi l\u1ea1i x\u00e1c nh\u1eadn"}</button>}
                <button className="primary-button login-button" disabled={loginBusy}>{loginBusy ? <><span className="button-spinner"/>{recoverMode ? "\u0110ang g\u1eedi email\u2026" : authMode === "login" ? "\u0110ang \u0111\u0103ng nh\u1eadp\u2026" : "\u0110ang t\u1ea1o t\u00e0i kho\u1ea3n\u2026"}</> : recoverMode ? "G\u1eedi h\u01b0\u1edbng d\u1eabn \u0111\u1eb7t l\u1ea1i" : authMode === "login" ? "\u0110\u0103ng nh\u1eadp v\u00e0 b\u1eaft \u0111\u1ea7u" : "T\u1ea1o t\u00e0i kho\u1ea3n"}<ArrowUpRight/></button>
              </form>
              {!recoverMode && <><div className="auth-divider"><span/>{"ho\u1eb7c"}<span/></div><a className="google-button" href="/api/auth/google" aria-label="Ti\u1ebfp t\u1ee5c v\u1edbi Google"><svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.3 13.6 17.6 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.6 3-2.3 5.6-4.9 7.3l7.6 5.9c4.5-4.2 7-10.4 7-17.7Z"/><path fill="#FBBC05" d="M10.4 28.6a14.5 14.5 0 0 1 0-9.2l-7.8-6.1a24 24 0 0 0 0 21.4l7.8-6.1Z"/><path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.4 2.2-6.4 0-11.7-4.1-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48Z"/></svg>{"Ti\u1ebfp t\u1ee5c v\u1edbi Google"}</a><button className="guest-link" type="button" onClick={startDemo}>{"D\u00f9ng th\u1eed kh\u00f4ng c\u1ea7n t\u00e0i kho\u1ea3n"} <span><ArrowUpRight/></span></button></>}
              {recoverMode ? <button className="auth-mode-toggle" type="button" onClick={() => { setRecoverMode(false); setLoginError(""); setLoginNotice(""); }}>{"Quay l\u1ea1i \u0111\u0103ng nh\u1eadp"}</button> : <button className="auth-mode-toggle" type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setLoginPassword(""); setConfirmPassword(""); setShowPassword(false); setConfirmationPending(false); setLoginError(""); setLoginNotice(""); }}>{authMode === "login" ? "Ch\u01b0a c\u00f3 t\u00e0i kho\u1ea3n? \u0110\u0103ng k\u00fd" : "\u0110\u00e3 c\u00f3 t\u00e0i kho\u1ea3n? \u0110\u0103ng nh\u1eadp"}</button>}
              <div className="privacy-note">{"Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u01b0\u1ee3c gi\u1eef trong cookie b\u1ea3o m\u1eadt."}</div>
              </div>
            </div>
          )
          : sessionLoading ? <div className="loading-stage"><div className="loader"/><span>Đang kiểm tra phiên học…</span></div>
          : messages.length === 0 ? <div className="welcome-stage"><div className={mascotClass()}><span className="mascot-ear left"/><span className="mascot-ear right"/><span className="mascot-face"><i className="eye left"/><i className="eye right"/><i className="smile"/><b className="cheek left"/><b className="cheek right"/></span><SparkleIcon/></div><div className="welcome-copy"><span className="welcome-kicker">MÌNH BẮT ĐẦU TỪ ĐÂU NHỈ?</span><h2>Chào {session?.name?.split(" ").slice(-1)[0] ?? "em"},<br /><em>mình cùng khám phá nhé.</em></h2><p>Em đang học <strong>{currentModule.title.toLowerCase()}</strong>. Hãy kể điều em đang nghĩ — mình sẽ gợi mở từng bước, không vội đưa đáp án đâu.</p></div><div className="starter-grid">{starters[moduleId].map((prompt, index) => <button key={prompt} className="starter-card" onClick={() => void sendMessage(prompt)}><span>{index === 0 ? "✳" : "↗"}</span>{prompt}</button>)}</div><div className="welcome-foot"><span className="foot-line"/><span>Em có thể hỏi theo cách của mình</span><span className="foot-line"/></div></div>
          : <div className="conversation" aria-live="polite">{messages.map((item) => <article key={item.id} className={`message-row ${item.role}`}><div className={item.role === "assistant" ? "message-avatar" : "message-avatar student"}>{item.role === "assistant" ? "m" : (session?.name ?? "E").slice(0, 1).toUpperCase()}</div><div className="message-content"><div className="message-meta">{item.role === "assistant" ? "MATHSTEP" : "EM"}{item.intent && <span className="intent-pill">{item.intent}</span>}</div><div className="message-bubble"><MathMessage content={item.content} /></div>{item.validation && <div className={`validation-card ${item.validation.status}`}><span>{item.validation.status === "verified" ? "✓" : "i"}</span><div><strong>{item.validation.status === "verified" ? "Mình đã kiểm tra phép tính" : "Chưa thể kiểm tra tự động"}</strong><small>{item.validation.explanation}</small></div></div>}{item.nextQuestion && <button className="next-question" onClick={() => setInput(item.nextQuestion!)}><span>↳</span>{item.nextQuestion}</button>}</div></article>)}{busy && <div className="message-row assistant"><div className="message-avatar thinking-avatar">m</div><div className="thinking-bubble"><span/><span/><span/></div></div>}<div ref={endRef}/></div>}

          {(session?.authenticated || demoMode) && (
            <div className="composer-wrap">
              {error && <div className="composer-error" role="alert">{error}</div>}
              <form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Nhập bài toán, câu hỏi hoặc ý tưởng của em (ví dụ: bpt x + y ≤ 6, nghiệm, cos 60°)..."
                  rows={2}
                  maxLength={4000}
                  disabled={busy}
                  aria-label="Tin nhắn của em"
                />
                <div className="composer-bottom">
                  <div className="composer-left-tools">
                    <button
                      type="button"
                      className="composer-visualizer-btn"
                      onClick={() => setVisualizerOpen(true)}
                      title="Mở mô hình trực quan"
                    >
                      <span>📐</span>
                      <span>Mô hình</span>
                    </button>
                    <span className="composer-shortcut-hint">Enter để gửi · Shift + Enter xuống dòng</span>
                  </div>
                  <button className="send-button" disabled={busy || !input.trim()} aria-label="Gửi tin nhắn">
                    {busy ? <span className="send-spinner"/> : "↑"}
                  </button>
                </div>
              </form>
              <div className="composer-disclaimer">
                {demoMode && !session?.authenticated
                  ? "Bản dùng thử minh họa phản hồi gợi mở theo từng bước."
                  : "MathSTEP trợ giảng Socratic · Hãy đối chiếu và kiểm chứng phép tính nhé."}
              </div>
            </div>
          )}
        </section>
      </section>
      <footer className="page-footer"><span>© MathSTEP</span><span>Học bằng cách khám phá <i>✳</i></span><span>Toán THPT · Việt Nam</span></footer>
      {visualizerOpen && (
        <MathGraphVisualizer
          moduleId={moduleId}
          onClose={() => setVisualizerOpen(false)}
        />
      )}
      {accountOpen && <div className="account-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAccount(); }}>
        <section className="account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title">
          <header className="account-dialog-header"><div><span className="account-kicker">MATHSTEP</span><h2 id="account-title">Tài khoản của tôi</h2></div><button className="account-close" type="button" onClick={closeAccount} aria-label="Đóng">×</button></header>
          <div className="account-identity"><span className="user-avatar">{(session?.name ?? session?.email ?? "M").slice(0, 1).toUpperCase()}</span><div><strong>{session?.name ?? "Học sinh MathSTEP"}</strong><small>{session?.email}</small></div></div>
          <section className="account-section"><div className="account-section-heading"><div><h3>API key AI cá nhân</h3><p>Khóa chỉ dùng trên máy chủ để gửi yêu cầu tới AI đã cấu hình.</p></div><span className={`account-key-status ${accountKeyConfigured ? "saved" : ""}`}>{accountKeyLoading ? "Đang tải…" : accountKeyConfigured ? "Đã kết nối" : "Chưa thêm"}</span></div>
            <form className="account-key-form" onSubmit={(event) => void saveAccountKey(event)}><label htmlFor="user-ai-key">API key<input id="user-ai-key" type="password" autoComplete="new-password" spellCheck={false} value={accountKey} onChange={(event) => setAccountKey(event.target.value)} placeholder={accountKeyConfigured ? "Đã lưu · nhập khóa mới để thay thế" : "Dán API key của em vào đây"} maxLength={512} disabled={accountKeyBusy || accountKeyLoading}/></label><div className="account-key-actions"><button className="primary-button" type="submit" disabled={accountKeyBusy || accountKeyLoading || !accountKey.trim()}>{accountKeyBusy ? "Đang lưu…" : accountKeyConfigured ? "Cập nhật khóa" : "Lưu API key"}</button>{accountKeyConfigured && <button className="account-remove-key" type="button" onClick={() => void removeAccountKey()} disabled={accountKeyBusy || accountKeyLoading}>{accountKeyBusy ? "Đang xử lý…" : "Xóa khóa"}</button>}</div></form>
            <p className="account-security-note">Khóa được mã hóa bằng Supabase Vault, không gửi lại cho trình duyệt sau khi lưu. Nếu chưa nhập khóa riêng, MathSTEP dùng cấu hình AI mặc định.</p>
            {accountKeyNotice && <p className="account-message success" role="status">{accountKeyNotice}</p>}{accountKeyError && <p className="account-message error" role="alert">{accountKeyError}</p>}
          </section>
          <section className="account-section account-history"><div className="account-section-heading"><div><h3>Lịch sử trò chuyện</h3><p>Các phiên học được lưu vào tài khoản của em.</p></div><span className="account-history-count">{recentConversations.length}</span></div>
            {recentConversations.length ? <><div className="account-history-list">{recentConversations.map((item) => <button key={item.id} className={`account-history-item ${conversationId === item.id ? "active" : ""}`} type="button" onClick={() => { closeAccount(); void openConversation(item.id); }}><span className="account-history-icon" aria-hidden="true">◷</span><span className="account-history-copy"><strong>{item.title || modules.find((entry) => entry.id === item.module)?.title || "Cuộc trò chuyện"}</strong><small>{modules.find((entry) => entry.id === item.module)?.title ?? "Toán THPT"} · {new Date(item.updated_at).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</small></span><ArrowUpRight/></button>)}</div>{historyError && <p className="account-message error" role="alert">{historyError}</p>}{historyHasMore && <button className="history-load-more" type="button" onClick={() => void loadMoreHistory()} disabled={historyLoadingMore}>{historyLoadingMore ? "Đang tải…" : "Tải thêm lịch sử"}</button>}</> : <div className="account-history-empty">Chưa có cuộc trò chuyện nào được lưu. Gửi tin nhắn đầu tiên để bắt đầu lịch sử học tập.</div>}
          </section>
        </section>
      </div>}
    </main>
  );
}
