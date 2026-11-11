"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Layers } from "lucide-react";
import { CoreModuleCard } from "../lib/modulesCatalogData";
import { StationItem } from "../lib/stationCatalogData";
import MathStepWorkbench from "./MathStepWorkbench";
import SocraticChatDrawer, { ChatMessage } from "./SocraticChatDrawer";
import StationCatalogModal from "./StationCatalogModal";
import { generateSmartSocraticResponse } from "../lib/smartSocratic";
import { useDynamicMathStore } from "./dynamic-math/useDynamicMathStore";

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

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || input.trim();
    if (!textToSend || busy) return;

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
          mode: "guided_learning",
          learning_context: {
            module: module.id,
            station_id: currentStation.id,
            learning_stage: currentStep,
            model_state: modelState,
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
    } catch {
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
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col overflow-hidden">
      {/* Top Application Bar chuẩn Desktop-Grade GeoGebra */}
      <header className="h-12 bg-slate-950/95 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium transition-colors"
            title="Quay lại Trang chủ"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trang chủ</span>
          </Link>

          <Link
            href="/modules"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs font-medium transition-colors"
            title="Xem danh mục 7 Module"
          >
            <span>7 Module</span>
          </Link>

          <div className="h-4 w-[1px] bg-slate-800" />

          {/* Nhãn trạm và module */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-[11px] font-bold border border-blue-700/50">
              {currentStation.id}
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              {currentStation.title}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCatalogOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-slate-800 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Đổi trạm học (48 trạm SGK)"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">48 Trạm SGK</span>
          </button>

          <button
            type="button"
            onClick={() => setTutorOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Mở Trợ lý gợi mở Socratic"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Trợ lý Socratic</span>
          </button>
        </div>
      </header>

      {/* Main Workbench Area */}
      <main className={`flex-1 min-h-0 relative transition-[margin] duration-200 ${tutorOpen ? "xl:mr-[420px]" : ""}`}>
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
        quickPrompts={module.id === "trigonometry"
          ? ["Vì sao tan không xác định tại góc hiện tại?", "Kiểm tra dấu của sin α và cos α tại điểm M.", "Giải thích sin² α + cos² α = 1 theo tọa độ M."]
          : module.id === "conics_and_solids"
          ? ["Thiết diện hiện tại là đường gì?", "Vì sao β và α quyết định loại thiết diện?", "Nếu tăng β thêm 5° thì hình đổi thế nào?"]
          : ["Em nên quan sát yếu tố nào trước?", "Cho em một gợi ý nhỏ.", "Em kiểm tra kết luận này thế nào?"]}
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
