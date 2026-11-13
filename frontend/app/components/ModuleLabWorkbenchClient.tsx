"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Layers, Maximize2, Volume2, Lightbulb, ChevronDown } from "lucide-react";
import { CoreModuleCard } from "../lib/modulesCatalogData";
import { StationItem } from "../lib/stationCatalogData";
import MathStepWorkbench from "./MathStepWorkbench";
import SocraticChatDrawer, { ChatMessage } from "./SocraticChatDrawer";
import { getMathContext } from "../lib/mathModelContext";
import StationCatalogModal from "./StationCatalogModal";
import { generateSmartSocraticResponse } from "../lib/smartSocratic";
import { useDynamicMathStore } from "./dynamic-math/useDynamicMathStore";
import { OptiMascot } from "./optimath/mascot/OptiMascot";
import { MathFormattedText } from "./KatexMath";

interface ModuleLabWorkbenchClientProps {
  module: CoreModuleCard;
  initialStation: StationItem;
  initialStep?: number;
  initialMode?: "sgk" | "dynamic";
}

export default function ModuleLabWorkbenchClient({
  module,
  initialStation,
  initialStep = 0,
  initialMode = "sgk",
}: ModuleLabWorkbenchClientProps) {
  const [currentStation, setCurrentStation] = useState<StationItem>(initialStation);
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Chatbot Socratic State
  const [tutorOpen, setTutorOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [conversationId] = useState<string>(() => crypto.randomUUID());
  const [stuckCount, setStuckCount] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Đồng bộ URL sạch (URL-Driven Routing)
  const syncCleanUrl = useCallback((stId: string, stepNum: number) => {
    if (typeof window === "undefined") return;
    const cleanUrl = `/stations/${stId}?step=${stepNum + 1}`;
    window.history.replaceState(null, "", cleanUrl);
  }, []);

  // Khởi tạo lời chào mở đầu của Trợ lý Socratic
  useEffect(() => {
    const welcomeText = `Chào em! Thầy/cô là Trợ lý gợi mở Socratic đồng hành cùng em tại **Trạm ${currentStation.id}: ${currentStation.title}** (${module.title}).\n\nEm hãy quan sát trực quan trên mô hình, thao tác thử và chia sẻ phát hiện của em nhé!`;
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: welcomeText,
      },
    ]);
  }, [currentStation.id, currentStation.title, module.title]);

  const handleStepChange = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    syncCleanUrl(currentStation.id, stepNumber);
  };

  const handleSelectStation = (newStation: StationItem) => {
    setCurrentStation(newStation);
    setCurrentStep(0);
    setCatalogOpen(false);
    syncCleanUrl(newStation.id, 0);
  };

  const handleSendMessage = async (customMessage?: string, imageDataUrl?: string) => {
    const textToSend = customMessage || input.trim() || (imageDataUrl ? "Hãy đọc đề trong ảnh và gợi ý bước đầu." : "");
    if (!textToSend || busy) return;

    const normalizedMessage = textToSend.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const expressesConfusion = /\b(khong biet|bi roi|khong hieu|chua hieu|khong lam duoc|khong nghi ra|chiu roi)\b/.test(normalizedMessage);
    const nextStuckCount = expressesConfusion ? stuckCount + 1 : 0;
    setStuckCount(nextStuckCount);
    const recentHistory = messages.slice(-8).map(({ role, content }) => ({ role, content }));

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!customMessage) setInput("");
    setBusy(true);
    setError("");

    try {
      const liveModel = useDynamicMathStore.getState();
      const modelState = liveModel.activeModule === module.id
        ? Object.fromEntries(Object.entries(liveModel.params).map(([id, param]) => [id, param.val]))
        : undefined;
      // 2. Thử gọi API backend /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: textToSend,
          history: recentHistory,
          stuck_count: nextStuckCount,
          scaffolding_mode: nextStuckCount >= 2,
          image_data_url: imageDataUrl,
          mode: "guided_learning",
          learning_context: {
            module: module.id,
            station_id: currentStation.id,
            learning_stage: currentStep,
            model_state: modelState,
            model_context: getMathContext(module.id),
          },
          hint_level: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.answer || data.reply || data.content;
        if (replyText) {
          setMessages((prev) => [
            ...prev,
            {
              id: data.message_id || crypto.randomUUID(),
              role: "assistant",
              content: replyText,
              nextQuestion: data.next_action?.payload?.question || data.next_question,
            },
          ]);
          setBusy(false);
          return;
        }
      }
      if (imageDataUrl) { const detail = await response.json().catch(() => null); setError(detail?.detail?.message || "Chưa đọc được ảnh. Hãy thử lại."); setBusy(false); return; }
    } catch {
      if (imageDataUrl) { setError("Không gửi được ảnh. Hãy kiểm tra kết nối và thử lại."); setBusy(false); return; }
      // Fallback về smart Socratic cục bộ nếu offline hoặc backend lỗi
    }

    // 2. Fallback sang Smart Socratic Engine
    setTimeout(() => {
      const socraticResp = generateSmartSocraticResponse(
        textToSend,
        module.id,
        `step-${currentStep + 1}`,
        1
      );
      if (module.id === "conics_and_solids" && /thiết diện|conic|góc|parabol|hypebol|elip/i.test(textToSend)) {
        const live = useDynamicMathStore.getState().params;
        const beta = live.coneBeta?.val;
        const alpha = live.coneAlpha?.val;
        if (Number.isFinite(beta) && Number.isFinite(alpha)) {
          socraticResp.answer = `Trên mô hình hiện tại, góc cắt β là ${beta}° và góc nửa đỉnh α là ${alpha}°. Em hãy so sánh hai góc rồi dự đoán mặt phẳng cắt tạo đường gì?`;
          socraticResp.nextQuestion = "Em thấy β lớn hơn, nhỏ hơn hay bằng α?";
        }
      }
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: socraticResp.answer,
          nextQuestion: socraticResp.nextQuestion,
        },
      ]);
      setBusy(false);
    }, 400);
  };

  return (
    <div id="module-guided-workspace" className="h-dvh min-h-[620px] bg-slate-50 text-slate-800 flex flex-col overflow-hidden">
      {/* Top Application Bar chuẩn Desktop-Grade GeoGebra */}
      <header className="mx-3 mt-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm sm:mx-4 sm:p-4 flex items-center justify-between gap-3 shrink-0 select-none z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          <Link
            href="/modules"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
            title="Xem danh mục 7 Module"
          >
            <span>7 Module</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-200" />

          {/* Nhãn trạm và module */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-100">
              {currentStation.id}
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {currentStation.title}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Đổi trạm học (48 trạm SGK)"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">48 Trạm SGK</span>
          </button>

          <button
            type="button"
            onClick={() => setTutorOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Mở Trợ lý gợi mở Socratic"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Trợ lý Socratic</span>
          </button>
          <button type="button" onClick={async () => { const target = document.getElementById("module-guided-workspace"); try { if (!document.fullscreenElement && target) { await target.requestFullscreen(); setIsFullscreen(true); } else { await document.exitFullscreen(); setIsFullscreen(false); } } catch { setIsFullscreen(false); } }} aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"><Maximize2 size={16}/></button>
        </div>
      </header>

      {hintVisible && <section className="mx-3 mt-2 flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-2 sm:mx-4 sm:px-4"><OptiMascot size={38} animate={false}/><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="rounded bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold text-white">MATHSTEP</span><b className="text-xs text-slate-800">Bước {currentStep + 1}: {currentStep === 0 ? "Quan sát" : "Khám phá và kiểm chứng"}</b></div><p className="truncate text-xs text-slate-600"><MathFormattedText text={currentStation.goal}/></p>{hintLevel > 0 && <p className="truncate text-[11px] font-medium text-blue-800">Gợi ý cấp {hintLevel}: <MathFormattedText text={hintLevel === 1 ? currentStation.goal : hintLevel === 2 ? currentStation.simulation : "Hãy thay đổi một tham số, dự đoán kết quả rồi đối chiếu với hình."}/></p>}</div><button type="button" title="Nghe hướng dẫn" onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(currentStation.goal)); }} className="grid h-8 w-8 place-items-center rounded-lg text-blue-700 hover:bg-white"><Volume2 size={16}/></button><button type="button" onClick={() => setHintLevel((level) => level >= 3 ? 1 : level + 1)} className="flex h-8 shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2 text-[11px] font-bold text-blue-700"><Lightbulb size={14}/>Gợi ý 3 cấp<ChevronDown size={13}/></button><button type="button" onClick={() => setHintVisible(false)} aria-label="Thu gọn hướng dẫn" className="px-2 text-lg text-slate-500">×</button></section>}

      {/* Main Workbench Area */}
      <main className={`flex-1 min-h-0 relative px-3 pb-3 pt-2 sm:px-4 transition-[margin] duration-200 ${tutorOpen ? "xl:mr-[420px]" : ""}`}>
        <MathStepWorkbench
          moduleId={module.id}
          stationId={currentStation.id}
          initialStep={currentStep}
          initialMode={initialMode}
          onStepChange={handleStepChange}
          onSelectStation={handleSelectStation}
          onBackToCatalog={() => setCatalogOpen(true)}
          onAskTutor={(question) => {
            setTutorOpen(true);
            void handleSendMessage(question);
          }}
          hideAppHeader
        />
      </main>

      {/* Socratic Chat Drawer */}
      <SocraticChatDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        messages={messages}
        busy={busy}
        error={error}
        input={input}
        onInputChange={setInput}
        onSendMessage={handleSendMessage}
        stationId={currentStation.id}
        moduleTitle={module.title}
        quickPrompts={["Gợi ý bước tiếp theo", "Giải thích theo hình 3D", "Cho ví dụ tương tự"]}
      />

      {/* Station Catalog Modal */}
      <StationCatalogModal
        isOpen={catalogOpen}
        onClose={() => setCatalogOpen(false)}
        onSelectStation={handleSelectStation}
      />
    </div>
  );
}
