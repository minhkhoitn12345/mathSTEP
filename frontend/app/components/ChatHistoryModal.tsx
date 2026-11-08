"use client";

import React, { useState, useEffect } from "react";
import { History, MessageSquare, Search, X, Calendar, ChevronRight, Bot, User } from "lucide-react";
import { MathMessage } from "./SocraticChatDrawer";
import { STATION_CATALOG, getStationById } from "../lib/stationCatalogData";

interface ConversationItem {
  id: string;
  stationId?: string;
  stationTitle?: string;
  moduleId?: string;
  lastMessage: string;
  lastReply?: string;
  updatedAt: string;
  turnsCount: number;
}

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session?: {
    authenticated: boolean;
    name: string | null;
    email: string | null;
  } | null;
}

export default function ChatHistoryModal({
  isOpen,
  onClose,
  session,
}: ChatHistoryModalProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Tải danh sách hội thoại từ server (nếu đã đăng nhập) và từ localStorage trạm học
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const loadedList: ConversationItem[] = [];

    // 1. Quét các trạm học đã lưu trong localStorage
    if (typeof window !== "undefined") {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("mathstep:station:")) {
            const stationId = key.replace("mathstep:station:", "");
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            const parsed = JSON.parse(raw);
            const station = getStationById(stationId) || STATION_CATALOG.find((s) => s.id === stationId);

            if (parsed.prediction || parsed.reason || (parsed.activityLogs && parsed.activityLogs.length > 0)) {
              loadedList.push({
                id: `local-${stationId}`,
                stationId,
                stationTitle: station?.title || `Trạm thực nghiệm ${stationId}`,
                moduleId: parsed.moduleId,
                lastMessage: parsed.prediction || parsed.reason || "Thực nghiệm tương tác",
                lastReply: parsed.reason ? `Lập luận căn cứ: ${parsed.reason}` : "Đã ghi nhận tiến trình nhận thức 8 bước",
                updatedAt: parsed.updatedAt || new Date().toISOString(),
                turnsCount: (parsed.evidenceHistory?.length || 0) + (parsed.activityLogs?.length || 0) + 1,
              });
            }
          }
        }
      } catch (err) {
        console.warn("Không thể đọc cache localStorage:", err);
      }
    }

    // 2. Tải thêm từ API nếu đã đăng nhập
    if (session?.authenticated) {
      void fetch("/api/chat/conversations")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data?.conversations)) {
            data.conversations.forEach((c: { id: string; title?: string; module?: string; updated_at?: string }) => {
              loadedList.unshift({
                id: c.id,
                stationTitle: c.title || "Phiên hội thoại Socratic",
                moduleId: c.module,
                lastMessage: c.title || "Câu hỏi học sinh",
                updatedAt: c.updated_at || new Date().toISOString(),
                turnsCount: 1,
              });
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          // Sắp xếp theo thời gian mới nhất
          loadedList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setConversations(loadedList);
          setLoading(false);
        });
    } else {
      loadedList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setConversations(loadedList);
      setLoading(false);
    }
  }, [isOpen, session?.authenticated]);

  if (!isOpen) return null;

  const filtered = conversations.filter(
    (c) =>
      c.stationTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stationId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 text-slate-100 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[88vh] overflow-hidden text-xs">
        {/* Header Modal */}
        <header className="px-5 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-950/60 text-blue-400 border border-blue-800/60 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Lịch sử trò chuyện Socratic</h2>
              <p className="text-[11px] text-slate-400">
                Các đoạn hội thoại, dự đoán tư duy và hướng dẫn sư phạm đã lưu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Thanh tìm kiếm */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/30 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo trạm học, chủ đề hoặc nội dung câu hỏi..."
              className="w-full pl-9 pr-3 py-2 border border-slate-700/80 rounded-xl text-xs bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-2 py-1 text-slate-400 hover:text-white text-xs"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Danh sách các phiên trò chuyện */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-800/40">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Đang tải lịch sử trò chuyện...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-slate-300 font-semibold text-xs">Chưa có đoạn hội thoại nào</p>
              <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                Khi em trao đổi với Trợ lý Socratic hoặc thực hiện các bước lập luận tại phòng thực hành, các phiên học tập sẽ được lưu lại ở đây.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 group hover:bg-slate-850/60 p-3 rounded-xl border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                onClick={() => setSelectedConversation(item)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center justify-center text-[10px] font-bold font-mono">
                      {item.stationId || "AI"}
                    </span>
                    <strong className="text-xs text-white group-hover:text-blue-300 transition-colors">
                      {item.stationTitle}
                    </strong>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.updatedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Đoạn tin nhắn tóm tắt */}
                <div className="mt-2 space-y-1.5 pl-8">
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 italic text-slate-300">{item.lastMessage}</p>
                  </div>
                  {item.lastReply && (
                    <div className="flex items-start gap-1.5 text-[11px] text-blue-300/90 bg-blue-950/20 p-2 rounded-lg border border-blue-900/30">
                      <Bot className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="line-clamp-2">
                        <MathMessage content={item.lastReply} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 pl-8 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{item.turnsCount} lượt tương tác</span>
                  <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium">
                    Xem chi tiết <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span>{filtered.length} phiên học tập được ghi nhận</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </footer>
      </div>

      {/* Modal chi tiết một phiên trò chuyện nếu người dùng chọn */}
      {selectedConversation && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-3 animate-in fade-in duration-100"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="bg-slate-900 text-slate-100 w-full max-w-lg rounded-2xl border border-slate-700 p-5 shadow-2xl space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <strong className="text-sm text-white">{selectedConversation.stationTitle}</strong>
              <button
                onClick={() => setSelectedConversation(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1 font-semibold">CÂU HỎI / DỰ ĐOÁN HỌC SINH:</span>
                <p className="text-xs text-white">{selectedConversation.lastMessage}</p>
              </div>
              {selectedConversation.lastReply && (
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
                  <span className="text-[10px] text-blue-400 block mb-1 font-semibold">PHẢN HỒI GỢI MỞ SOCRATIC:</span>
                  <div className="text-xs text-blue-200">
                    <MathMessage content={selectedConversation.lastReply} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedConversation(null)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
