"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type ModuleId = "linear_programming" | "spatial_geometry" | "trigonometry";
type StageId = "observe" | "predict" | "manipulate" | "explore" | "verify" | "explain" | "transfer" | "apply";
type ChatMessage = { id: string; role: "user" | "assistant"; content: string; intent?: string; nextQuestion?: string; hintLevel?: number; validation?: { status: string; result: boolean | number | null; explanation: string } | null };
type Session = { authenticated: boolean; name: string | null; email: string | null };
type RecentConversation = { id: string; title: string | null; module: ModuleId; updated_at: string };

const modules: { id: ModuleId; title: string; short: string; icon: string }[] = [
  { id: "linear_programming", title: "Quy hoạch tuyến tính", short: "Miền nghiệm & tối ưu", icon: "⌁" },
  { id: "spatial_geometry", title: "Hình học không gian", short: "Quan sát & suy luận", icon: "◇" },
  { id: "trigonometry", title: "Lượng giác", short: "Góc & đường tròn", icon: "◉" },
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
  const [displayName, setDisplayName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginNotice, setLoginNotice] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
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

  useEffect(() => { void loadSession(); }, [loadSession]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy]);

  useEffect(() => {
    if (!session?.authenticated || !storageKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const listResponse = await fetch("/api/chat/conversations", { cache: "no-store" });
        const listData = await listResponse.json();
        const items = Array.isArray(listData?.items) ? listData.items : [];
        if (!cancelled) setRecentConversations(items);
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
      const response = await fetch(authMode === "login" ? "/api/auth/login" : "/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPassword, name: displayName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.detail?.message ?? "Đăng nhập chưa thành công.");
      setLoginPassword("");
      if (data.confirmation_required) { setAuthMode("login"); setLoginNotice("Tài khoản đã được tạo. Hãy xác nhận email rồi đăng nhập."); return; }
      await loadSession();
    } catch (cause) {
      setLoginError(cause instanceof Error ? cause.message : "Đã có lỗi. Em thử lại nhé.");
    } finally { setLoginBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession({ authenticated: false, name: null, email: null });
    setMessages([]);
    setConversationId(null);
    setRecentConversations([]);
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

  function beginNewConversation() {
    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
    if (storageKey) localStorage.removeItem(storageKey);
  }

  async function sendMessage(text = input, requestedHint?: number) {
    const message = text.trim();
    if (!message || busy || !session?.authenticated) return;
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
        <a className="brand" href="#home" aria-label="MathSTEP trang chủ"><span className="brand-mark">m</span><span>math<span className="brand-accent">step</span></span></a>
        <div className="topbar-center"><span className="status-dot" /> HỌC THEO CÁCH CỦA EM</div>
        {session?.authenticated ? <div className="user-menu"><span className="user-avatar">{(session.name ?? session.email ?? "M").slice(0, 1).toUpperCase()}</span><span className="user-name">{session.name ?? session.email}</span><button className="quiet-button" onClick={() => void logout()}>Thoát</button></div> : <div className="topbar-note">Bạn đồng hành Toán THPT</div>}
      </header>

      <section className="workspace" id="home">
        <aside className="left-rail">
          <div className="rail-eyebrow">KHÔNG GIAN HỌC</div>
          <h1>Hôm nay mình<br /><em>khám phá gì?</em></h1>
          <p className="rail-copy">Chọn một chủ đề, rồi cùng linh vật đi từng bước. Em vẫn là người tìm ra lời giải.</p>
          <div className="module-list" role="tablist" aria-label="Chọn chủ đề Toán">
            {modules.map((item) => <button key={item.id} role="tab" aria-selected={moduleId === item.id} className={`module-card ${moduleId === item.id ? "selected" : ""}`} onClick={() => { if (moduleId !== item.id) { setModuleId(item.id); beginNewConversation(); } }}>
              <span className="module-icon">{item.icon}</span><span className="module-text"><strong>{item.title}</strong><small>{item.short}</small></span><span className="module-chevron">↗</span>
            </button>)}
          </div>
          {recentConversations.length > 0 && <div className="recent-conversations"><div className="recent-heading">LỊCH SỬ GẦN ĐÂY</div>{recentConversations.slice(0, 5).map((item) => <button key={item.id} className={`recent-thread ${conversationId === String(item.id) ? "active" : ""}`} onClick={() => void openConversation(item.id)}><span className="recent-thread-icon">◷</span><span>{item.title || modules.find((entry) => entry.id === item.module)?.title || "Cuộc trò chuyện"}</span></button>)}</div>}
          <div className="learning-flow">
            <div className="flow-heading"><span>HÀNH TRÌNH HỌC</span><span className="flow-count">{stages.findIndex((item) => item.id === stage) + 1}<i>/8</i></span></div>
            <div className="stage-track">{stages.map((item, index) => <button key={item.id} className={`stage-item ${item.id === stage ? "active" : ""} ${index < stages.findIndex((s) => s.id === stage) ? "passed" : ""}`} onClick={() => setStage(item.id)}><span className="stage-dot">{index < stages.findIndex((s) => s.id === stage) ? "✓" : String(index + 1).padStart(2, "0")}</span><span>{item.label}</span></button>)}</div>
          </div>
          <div className="rail-note"><span className="note-spark">✳</span><p><strong>Gợi mở trước, đáp án sau.</strong><br />Sai một bước là cơ hội để hiểu sâu hơn.</p></div>
        </aside>

        <section className="chat-panel" aria-label="Trò chuyện cùng MathSTEP">
          <div className="chat-header"><div className="chat-title"><div className="mini-mascot"><span /></div><div><strong>MathSTEP Mascot</strong><small><span className="online-dot" /> Sẵn sàng đồng hành</small></div></div><div className="chat-topic"><span className="topic-kicker">CHỦ ĐỀ</span><strong>{currentModule.title}</strong></div><button className="new-chat-button" onClick={beginNewConversation}>＋ Mới</button></div>

          {!sessionLoading && !session?.authenticated ? <div className="login-stage"><div className={mascotClass()}><span className="mascot-ear left"/><span className="mascot-ear right"/><span className="mascot-face"><i className="eye left"/><i className="eye right"/><i className="smile"/><b className="cheek left"/><b className="cheek right"/></span><span className="mascot-spark">✦</span></div><span className="login-kicker">BẮT ĐẦU HÀNH TRÌNH</span><h2>Chào em, mình cùng<br /><em>nghĩ Toán nhé.</em></h2><p>{authMode === "login" ? "Đăng nhập tài khoản MathSTEP để trò chuyện và tiếp tục việc học của em." : "Tạo tài khoản học tập để lưu lại hành trình Toán của em."}</p><form className="login-form" onSubmit={login}>{authMode === "signup" && <label>Họ và tên<input type="text" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={100} required /></label>}<label>Email<input type="email" autoComplete="username" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required /></label><label>Mật khẩu<input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} minLength={authMode === "signup" ? 8 : undefined} required /></label>{loginError && <p className="inline-error">{loginError}</p>}{loginNotice && <p className="auth-notice">{loginNotice}</p>}<button className="primary-button login-button" disabled={loginBusy}>{loginBusy ? "Đang kết nối…" : authMode === "login" ? "Đăng nhập và bắt đầu" : "Tạo tài khoản"}<span>↗</span></button></form><button className="auth-mode-toggle" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setLoginError(""); setLoginNotice(""); }}>{authMode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}</button><div className="privacy-note">Phiên đăng nhập được giữ trong cookie bảo mật.</div></div>
          : sessionLoading ? <div className="loading-stage"><div className="loader"/><span>Đang kiểm tra phiên học…</span></div>
          : messages.length === 0 ? <div className="welcome-stage"><div className={mascotClass()}><span className="mascot-ear left"/><span className="mascot-ear right"/><span className="mascot-face"><i className="eye left"/><i className="eye right"/><i className="smile"/><b className="cheek left"/><b className="cheek right"/></span><span className="mascot-spark">✦</span></div><div className="welcome-copy"><span className="welcome-kicker">MÌNH BẮT ĐẦU TỪ ĐÂU NHỈ?</span><h2>Chào {session?.name?.split(" ").slice(-1)[0] ?? "em"},<br /><em>mình cùng khám phá nhé.</em></h2><p>Em đang học <strong>{currentModule.title.toLowerCase()}</strong>. Hãy kể điều em đang nghĩ — mình sẽ gợi mở từng bước, không vội đưa đáp án đâu.</p></div><div className="starter-grid">{starters[moduleId].map((prompt, index) => <button key={prompt} className="starter-card" onClick={() => void sendMessage(prompt)}><span>{index === 0 ? "✳" : "↗"}</span>{prompt}</button>)}</div><div className="welcome-foot"><span className="foot-line"/><span>Em có thể hỏi theo cách của mình</span><span className="foot-line"/></div></div>
          : <div className="conversation" aria-live="polite">{messages.map((item) => <article key={item.id} className={`message-row ${item.role}`}><div className={item.role === "assistant" ? "message-avatar" : "message-avatar student"}>{item.role === "assistant" ? "m" : (session?.name ?? "E").slice(0, 1).toUpperCase()}</div><div className="message-content"><div className="message-meta">{item.role === "assistant" ? "MATHSTEP" : "EM"}{item.intent && <span className="intent-pill">{item.intent}</span>}</div><div className="message-bubble">{item.content}</div>{item.validation && <div className={`validation-card ${item.validation.status}`}><span>{item.validation.status === "verified" ? "✓" : "i"}</span><div><strong>{item.validation.status === "verified" ? "Mình đã kiểm tra phép tính" : "Chưa thể kiểm tra tự động"}</strong><small>{item.validation.explanation}</small></div></div>}{item.nextQuestion && <button className="next-question" onClick={() => setInput(item.nextQuestion!)}><span>↳</span>{item.nextQuestion}</button>}</div></article>)}{busy && <div className="message-row assistant"><div className="message-avatar thinking-avatar">m</div><div className="thinking-bubble"><span/><span/><span/></div></div>}<div ref={endRef}/></div>}

          {session?.authenticated && <div className="composer-wrap"><div className="composer-hint"><span>✦</span> Mình đang ở bước <strong>{stages.find((item) => item.id === stage)?.label.toLowerCase()}</strong></div>{error && <div className="composer-error" role="alert">{error}</div>}<form className="composer" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={onInputKeyDown} placeholder="Viết điều em đang nghĩ…" rows={1} maxLength={4000} disabled={busy} aria-label="Tin nhắn của em"/><div className="composer-bottom"><span>Enter để gửi · Shift + Enter xuống dòng</span><button className="send-button" disabled={busy || !input.trim()} aria-label="Gửi tin nhắn">{busy ? <span className="send-spinner"/> : "↑"}</button></div></form><div className="composer-disclaimer">AI có thể nhầm. Hãy cùng kiểm chứng các bước Toán nhé.</div></div>}
        </section>
      </section>
      <footer className="page-footer"><span>© MathSTEP</span><span>Học bằng cách khám phá <i>✳</i></span><span>Toán THPT · Việt Nam</span></footer>
    </main>
  );
}
