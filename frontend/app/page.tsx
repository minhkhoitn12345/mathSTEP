"use client";

import { FormEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import MathGraphVisualizer from "./components/MathGraphVisualizer";
import MathStepWorkbench from "./components/MathStepWorkbench";
import { generateSmartSocraticResponse } from "./lib/smartSocratic";

type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";
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

const INTENT_LABELS: Record<string, string> = {
  student_response: "phản hồi học sinh",
  clarification_needed: "cần làm rõ",
  hint: "gợi ý",
  diagnose: "kiểm tra bài",
  explain: "giải thích",
  practice: "luyện tập",
  reflect: "tổng kết",
  simulation_help: "mô hình trực quan",
  general: "hỏi đáp",
};

const modules: { id: ModuleId; title: string; short: string }[] = [
  { id: "linear_programming", title: "Quy hoạch tuyến tính", short: "Miền nghiệm & tối ưu" },
  { id: "spatial_geometry", title: "Hình học không gian", short: "Quan sát & dựng hình SG-M2" },
  { id: "trigonometry", title: "Lượng giác", short: "Góc & đường tròn đơn vị" },
  { id: "functions", title: "Hàm số & Khảo sát", short: "Đồ thị & BBT 2 chiều" },
  { id: "calculus", title: "Giải tích & Ứng dụng", short: "Đạo hàm, Tích phân & Khối xoay 3D" },
  { id: "probability", title: "Xác suất & Bayes", short: "Thực nghiệm 3D & Sơ đồ cây" },
  { id: "conics_and_solids", title: "Hình khối & Conic", short: "Cắt mặt nón, Elip, Parabol, Hypebol" },
];

const DEFAULT_STATION_MAP: Record<ModuleId, string> = {
  linear_programming: "10.03",
  spatial_geometry: "11.06",
  trigonometry: "11.01",
  functions: "10.06",
  calculus: "12.08",
  probability: "11.14",
  conics_and_solids: "10.12",
};
const stages: { id: StageId; label: string }[] = [
  { id: "observe", label: "Quan sát" }, { id: "predict", label: "Dự đoán" }, { id: "manipulate", label: "Thao tác" }, { id: "explore", label: "Khám phá" },
  { id: "verify", label: "Kiểm chứng" }, { id: "explain", label: "Giải thích" }, { id: "transfer", label: "Chuyển giao" }, { id: "apply", label: "Vận dụng" },
];
const starters: Record<ModuleId, string[]> = {
  linear_programming: ["Miền nghiệm của hệ bất phương trình là gì?", "Làm sao kiểm tra điểm (2, 3) có thuộc miền nghiệm?"],
  spatial_geometry: ["Làm sao phân biệt đường thẳng song song với mặt phẳng?", "Em nên bắt đầu chứng minh quan hệ vuông góc thế nào?"],
  trigonometry: ["Vì sao sin và cos gắn với đường tròn lượng giác?", "Em hay nhầm dấu lượng giác ở các góc phần tư."],
  functions: ["Làm sao lập bảng biến thiên từ đạo hàm?", "Điểm cực trị khác gì với giá trị cực trị của hàm số?"],
  calculus: ["Ý nghĩa hình học của tích phân tính diện tích là gì?", "Làm sao tính thể tích khối tròn xoay khi quay quanh Ox?"],
  probability: ["Khi nào dùng công thức Bayes và xác suất có điều kiện?", "Cách dựng sơ đồ cây xác suất cho bài toán hai hộp bi?"],
  conics_and_solids: ["Mặt phẳng cắt mặt nón tròn xoay khi nào tạo thành Elip?", "Làm sao phân biệt tâm sai e của 3 đường conic?"],
};
const demoQuestions: Record<ModuleId, string> = {
  linear_programming: "Với x ≥ 0, y ≥ 0 và x + y ≤ 6, em thử kiểm tra xem điểm (2, 3) có thuộc miền nghiệm không nhé.",
  spatial_geometry: "Cho hình chóp S.ABCD đáy hình bình hành. Em hãy thử xác định giao tuyến của (SAC) và (SBD) nhé.",
  trigonometry: "Trên đường tròn lượng giác, điểm ứng với góc 60° có tọa độ liên quan thế nào đến cos 60° và sin 60°? Em thử dự đoán nhé.",
  functions: "Cho hàm số y = x³ - 3x. Em thử tính đạo hàm y' và dự đoán xem hàm số đạt cực đại, cực tiểu tại điểm nào nhé.",
  calculus: "Xét diện tích hình phẳng giới hạn bởi y = 4 - x² và trục Ox trên đoạn [0; 2]. Em thử dự đoán kết quả tích phân nhé.",
  probability: "Có 2 hộp: Hộp 1 có 3 bi đỏ 2 xanh; Hộp 2 có 4 bi đỏ 1 xanh. Rút ngẫu nhiên một hộp rồi rút một viên bi được bi đỏ. Xác suất viên bi đó thuộc Hộp 1 là bao nhiêu?",
  conics_and_solids: "Khi mặt phẳng cắt qua mặt nón tròn xoay với góc nghiêng lớn hơn góc nghiêng đường sinh thì đường conic thu được là đường gì?",
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
  functions: [
    "Quan sát biểu thức hàm số và tập xác định.",
    "Dự đoán dấu của đạo hàm f'(x) và các điểm làm f'(x) = 0.",
    "Lập dòng xét dấu của f'(x) trên bảng biến thiên.",
    "Vẽ chiều mũi tên biến thiên (đi lên khi f'>0, đi xuống khi f'<0).",
    "Kiểm tra giá trị cực đại, cực tiểu và các giới hạn vô cực/tiệm cận.",
    "Giải thích mối liên hệ giữa bảng biến thiên và hình dáng đồ thị.",
    "Xác định phương trình tiếp tuyến tại một điểm trên đồ thị.",
    "Vận dụng để biện luận số nghiệm phương trình hoặc tìm GTLN/GTNN.",
  ],
  calculus: [
    "Quan sát đồ thị chuyển động s(t) hoặc hàm số y = f(x).",
    "Dự đoán tốc độ biến thiên tức thời (hệ số góc tiếp tuyến) khi cát tuyến co lại.",
    "Chia đoạn tích phân thành các hình chữ nhật Riemann nhỏ.",
    "Xấp xỉ diện tích tổng các hình chữ nhật với số dải n tăng dần.",
    "Kiểm chứng kết quả xấp xỉ bằng công thức Newton-Leibniz.",
    "Giải thích vì sao tích phân xác định bằng diện tích hình phẳng có dấu.",
    "Mở rộng quay hình phẳng quanh trục Ox để sinh khối tròn xoay 3D.",
    "Tính và diễn giải thể tích khối tròn xoay theo công thức lát cắt tròn.",
  ],
  probability: [
    "Quan sát mô hình thí nghiệm ngẫu nhiên (gieo xúc xắc / rút bi từ 2 hộp).",
    "Dự đoán không gian mẫu và phân loại các biến cố thành phần.",
    "Dựng sơ đồ cây hai giai đoạn và gắn xác suất trên từng nhánh.",
    "Nhân xác suất trên nhánh để tính xác suất hợp thành (giao biến cố).",
    "Cộng xác suất các nhánh để tính xác suất toàn phần theo công thức chuẩn.",
    "Kiểm chứng kết quả bằng công thức Bayes khi biết thông tin biến cố điều kiện.",
    "Giải thích sự khác biệt giữa rút có hoàn lại và rút không hoàn lại.",
    "Vận dụng vào bài toán chẩn đoán thực tế hoặc sàng lọc mẫu.",
  ],
  conics_and_solids: [
    "Quan sát mặt nón tròn xoay hai tầng và vị trí mặt phẳng cắt.",
    "Dự đoán tiết diện thu được khi thay đổi góc nghiêng β của mặt phẳng.",
    "Xoay và điều chỉnh góc cắt để nhận diện Elip, Parabol và Hypebol.",
    "Xác định hai tiêu điểm F1, F2 và kiểm chứng tính chất khoảng cách.",
    "Kiểm tra tâm sai e = c/a: e < 1 (Elip), e = 1 (Parabol), e > 1 (Hypebol).",
    "Giải thích mối liên hệ giữa phương trình chính tắc và hình học 3D.",
    "Mở rộng tính toán thể tích và diện tích xung quanh khối nón/trụ/cầu.",
    "Vận dụng vào mô hình quỹ đạo hành tinh hoặc thiết kế kiến trúc vòm.",
  ],
};

function ArrowUpRight() {
  return <svg className="arrow-up-right" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>;
}


function ModuleIcon({ id }: { id: ModuleId }) {
  if (id === "linear_programming") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16M5 18V5m1 12 4-4 3 2 6-7"/><circle cx="10" cy="13" r="1"/><circle cx="13" cy="15" r="1"/></svg>;
  if (id === "spatial_geometry") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.7 8-4.7M12 12.2V21"/></svg>;
  if (id === "trigonometry") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 19h14M5 19V5"/><path d="M9 19a4 4 0 0 1 0-5.7"/><path d="M13 19a8 8 0 0 1 0-11.3"/></svg>;
  if (id === "functions") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h3c2 0 3-8 5-8s3 16 5 16 3-8 5-8h3"/></svg>;
  if (id === "calculus") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4c-2 0-3 1.5-3 3.5v9c0 2-1 3.5-3 3.5"/><path d="M8 12h8"/></svg>;
  if (id === "probability") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><circle cx="8.5" cy="15.5" r="1.5"/><circle cx="15.5" cy="15.5" r="1.5"/><circle cx="12" cy="12" r="1.5"/></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c-4.97 0-9 1.79-9 4s4.03 4 9 4 9-1.79 9-4-4.03-4-9-4Z"/><path d="m3 7 9 14 9-14"/></svg>;
}


export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [moduleId, setModuleId] = useState<ModuleId>("linear_programming");
  const [stationId, setStationId] = useState<string>("10.03");
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
  const [demoMode] = useState(true);
  const [tutorOpen, setTutorOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
      const socratic = generateSmartSocraticResponse(message, moduleId, stage);
      const demoReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: socratic.answer,
        intent: socratic.intent,
        nextQuestion: socratic.nextQuestion,
        hintLevel: socratic.hintLevel,
        validation: socratic.mathValidation,
      };
      setMessages((items) => [...items, studentMessage, demoReply]);
      setInput("");
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
    } catch {
      // Fallback to Smart Socratic Engine if backend is unreachable
      const fallback = generateSmartSocraticResponse(message, moduleId, stage, hintLevel);
      const fallbackReply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: fallback.answer,
        intent: fallback.intent,
        nextQuestion: fallback.nextQuestion,
        hintLevel: fallback.hintLevel,
      };
      setMessages((items) => [...items, fallbackReply]);
    } finally {
      setBusy(false);
    }
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="MathSTEP trang chủ"><span className="brand-mark">m</span><span>math<span className="brand-accent">step</span></span></Link>
        <div className="topbar-center"><span className="status-dot" /> {sessionLoading ? "Đang đồng bộ..." : "HỌC THEO CÁCH CỦA EM"}</div>
        {session?.authenticated ? <div className="user-menu"><span className="user-avatar">{(session.name ?? session.email ?? "M").slice(0, 1).toUpperCase()}</span><span className="user-name">{session.name ?? session.email}</span><button className="quiet-button" onClick={() => void logout()}>Thoát</button></div> : demoMode ? <div className="guest-session-tools"><span className="demo-badge">Mô phỏng 2D/3D & AR</span><button className="quiet-button" onClick={() => setAuthModalOpen(true)}>Đăng nhập</button></div> : <div className="topbar-note">Bạn đồng hành Toán THPT</div>}
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
            <div className="sidebar-section-heading flex justify-between items-center"><span>CHUYÊN ĐỀ TOÁN HỌC</span><button type="button" onClick={() => setSidebarOpen(s => !s)} className="text-[10px] text-gray-400 hover:text-gray-600">⇄</button></div>
            <div className="module-list" role="tablist" aria-label="Chọn chủ đề Toán">
              {modules.map((item) => (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={moduleId === item.id}
                  className={`module-card ${moduleId === item.id ? "selected" : ""}`}
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    if (moduleId !== item.id) {
                      setStationId(DEFAULT_STATION_MAP[item.id] || "10.03");
                      beginNewConversation(item.id);
                    }
                  }}
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

        <div className="main-lab-layout flex-1 flex gap-4 min-w-0 h-full">
          {/* 1. KHÔNG GIAN LÀM VIỆC MÔ PHỎNG & BƯỚC HỌC CHÍNH (HERO) */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            <MathStepWorkbench
              moduleId={moduleId}
              stationId={stationId}
              onSelectStation={(st) => {
                setStationId(st.id);
                setModuleId(st.moduleId);
              }}
              onAskTutor={(prompt) => {
                setTutorOpen(true);
                void sendMessage(prompt);
              }}
              onStepChange={(stepNum) => {
                const activeStepIdx = stepNum - 1;
                if (activeStepIdx >= 0 && activeStepIdx < stages.length) {
                  setStage(stages[activeStepIdx].id);
                }
              }}
            />
          </div>

          {/* 2. LINH VẬT & TRỢ LÝ SOCRATIC (COMPANION DỌC BÊN PHẢI - CÓ THỂ THU GỌN) */}
          {tutorOpen ? (
            <aside className="w-[340px] shrink-0 h-full flex flex-col bg-white border border-[#e5ebe4] rounded-2xl overflow-hidden shadow-sm">
              <div className="px-3.5 py-2.5 border-b border-[#e5ebe4] bg-[#fbfcf8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#eaf4ee] text-[#146e52] flex items-center justify-center font-bold text-xs">
                    m
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-800">Linh vật TES (Trợ lý)</div>
                    <div className="text-[10px] text-gray-400">Gợi mở Socratic · Không giải hộ</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTutorOpen(false)}
                  className="px-2 py-1 text-[11px] text-gray-500 hover:text-gray-800 rounded bg-gray-100 hover:bg-gray-200 font-medium"
                  title="Thu gọn Trợ lý để mở rộng mô phỏng"
                >
                  Thu gọn ❯
                </button>
              </div>

              {/* Chat conversation area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-[#eaf4ee] text-[#146e52] flex items-center justify-center text-lg font-bold">
                      m
                    </div>
                    <p className="font-semibold text-gray-800 text-xs">
                      Trợ lý Socratic · {currentModule.title}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Em cứ thao tác trên mô phỏng. Chọn câu hỏi nhanh bên dưới nếu cần gợi mở:
                    </p>
                    <div className="flex flex-col gap-1.5 text-left pt-1">
                      {starters[moduleId].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => void sendMessage(p)}
                          className="p-2 rounded-lg bg-[#fbfcf8] border border-gray-200 hover:border-[#146e52] hover:bg-[#f0fdf4] text-gray-700 text-[11px] transition-all text-left"
                        >
                          💬 {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((item) => (
                    <article key={item.id} className={`message-row ${item.role}`}>
                      <div className={item.role === "assistant" ? "message-avatar" : "message-avatar student"}>
                        {item.role === "assistant" ? "m" : (session?.name ?? "E").slice(0, 1).toUpperCase()}
                      </div>
                      <div className="message-content">
                        <div className="message-meta">
                          {item.role === "assistant" ? "MATHSTEP" : "EM"}
                          {item.intent && (
                            <span className="intent-pill">
                              {INTENT_LABELS[item.intent] || item.intent.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                        <div className="message-bubble">
                          <MathMessage content={item.content} />
                        </div>
                        {item.validation && (
                          <div className={`validation-card ${item.validation.status}`}>
                            <span>{item.validation.status === "verified" ? "✓" : "i"}</span>
                            <div>
                              <strong>{item.validation.status === "verified" ? "Đã kiểm tra phép tính" : "Chưa thể kiểm tra"}</strong>
                              <small>{item.validation.explanation}</small>
                            </div>
                          </div>
                        )}
                        {item.nextQuestion && (
                          <button className="next-question" onClick={() => setInput(item.nextQuestion!)}>
                            <span>↳</span>
                            {item.nextQuestion}
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
                {busy && (
                  <div className="message-row assistant">
                    <div className="message-avatar thinking-avatar">m</div>
                    <div className="thinking-bubble"><span /><span /><span /></div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Composer */}
              <div className="p-2.5 border-t border-[#e5ebe4] bg-[#fbfcf8]">
                {error && <div className="text-[10px] text-red-600 mb-1">{error}</div>}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                  className="flex gap-1.5"
                >
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onInputKeyDown}
                    placeholder="Hỏi trợ lý (Enter để gửi)..."
                    rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#146e52] resize-none"
                  />
                  <button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="px-3 py-1.5 bg-[#146e52] text-white rounded-xl font-bold text-xs hover:bg-[#0f573f] disabled:opacity-40 transition-colors"
                  >
                    ↑
                  </button>
                </form>
              </div>
            </aside>
          ) : (
            /* Minimized Pill to re-open companion */
            <button
              type="button"
              onClick={() => setTutorOpen(true)}
              className="self-start mt-2 px-3 py-2 bg-white hover:bg-[#f0fdf4] text-[#146e52] border border-[#c1d7c6] rounded-xl shadow-md font-bold text-xs flex items-center gap-1.5 transition-all"
              title="Mở Trợ lý Socratic gợi mở"
            >
              <span>🤖</span>
              <span>Trợ lý AI</span>
            </button>
          )}
        </div>
      </section>
      <footer className="page-footer"><span>© MathSTEP</span><span>Học bằng cách khám phá <i>✳</i></span><span>Toán THPT · Việt Nam</span></footer>
      {visualizerOpen && (
        <MathGraphVisualizer
          moduleId={moduleId}
          onClose={() => setVisualizerOpen(false)}
        />
      )}
            {authModalOpen && (
        <div className="account-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}>
          <div className="login-stage" style={{ background: "transparent", minHeight: "auto" }}>
            <div className="auth-card" style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="account-close"
                style={{ position: "absolute", top: 12, right: 12 }}
                aria-label="Đóng"
              >
                ×
              </button>
              <span className="login-kicker">{recoverMode ? "KHÔI PHỤC TÀI KHOẢN" : "MATHSTEP ACCOUNT"}</span>
              <h2>{recoverMode ? <>Lấy lại quyền<br/><em>tiếp tục khám phá.</em></> : <>Đăng nhập tài khoản<br/><em>học tập của em.</em></>}</h2>
              <form className="login-form" onSubmit={login} noValidate>
                {authMode === "signup" && !recoverMode && <label>Họ và tên<input type="text" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} required disabled={loginBusy}/></label>}
                <label>Email<input type="email" autoComplete="username" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required disabled={loginBusy}/></label>
                {!recoverMode && <label>Mật khẩu<span className="password-field"><input type={showPassword ? "text" : "password"} autoComplete={authMode === "login" ? "current-password" : "new-password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} minLength={authMode === "signup" ? 6 : undefined} required disabled={loginBusy}/><button className="password-toggle" type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "✕" : "👁"}</button></span></label>}
                {authMode === "signup" && !recoverMode && <label>Xác nhận mật khẩu<input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} required disabled={loginBusy}/></label>}
                {authMode === "login" && !recoverMode && <button type="button" className="forgot-link" onClick={() => { setRecoverMode(true); setLoginError(""); }}>Quên mật khẩu?</button>}
                {loginError && <p className="inline-error" role="alert">{loginError}</p>}
                {loginNotice && <div className="auth-notice" role="status"><span>✓</span><p>{loginNotice}</p></div>}
                {confirmationPending && authMode === "login" && !recoverMode && <button type="button" className="resend-link" onClick={() => void resendConfirmation()} disabled={resendBusy || loginBusy}>Chưa nhận được email? Gửi lại xác nhận</button>}
                <button className="primary-button login-button" disabled={loginBusy}>{loginBusy ? "Đang xử lý..." : recoverMode ? "Gửi hướng dẫn" : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
              </form>
              {!recoverMode && (
                <>
                  <div className="auth-divider"><span></span>hoặc<span></span></div>
                  <a className="google-button" href="/api/auth/google">Tiếp tục với Google</a>
                  <button className="guest-link" type="button" onClick={() => setAuthModalOpen(false)}>Tiếp tục trải nghiệm không cần tài khoản</button>
                </>
              )}
              {recoverMode ? <button className="auth-mode-toggle" type="button" onClick={() => setRecoverMode(false)}>Quay lại đăng nhập</button> : <button className="auth-mode-toggle" type="button" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>{authMode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}</button>}
            </div>
          </div>
        </div>
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
