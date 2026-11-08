"use client";

import { useEffect, useState, useCallback } from "react";

export interface ActivityLogEntry {
  timestamp: string;
  type:
    | "vertex_drag"
    | "param_change"
    | "prediction"
    | "error"
    | "scaffold"
    | "self_explain"
    | "independent_quiz"
    | "view_change";
  details: string;
}

export interface StationSavedState {
  stationId: string;
  moduleId: string;
  currentStep: number; // 0 to 7 (0-indexed)
  params: Record<string, number>;
  prediction: string;
  reason: string;
  observations: { at: string; summary: string; params: Record<string, number> }[];
  evidenceHistory: {
    stepId: number;
    stepName: string;
    completedAt: string;
    summary: string;
    data: Record<string, unknown>;
  }[];
  activityLogs?: ActivityLogEntry[];
  errorCount?: number;
  scaffoldLevel?: number; // H0 - H4
  selfExplanation?: string;
  independentScore?: number;
  quizAnswer?: number | null;
  quizSubmitted?: boolean;
  transferInput?: string;
  updatedAt: string;
}

const STORAGE_PREFIX = "mathstep:station:";

export function getStationStorageKey(stationId: string): string {
  return `${STORAGE_PREFIX}${stationId}`;
}

/**
 * Tải toàn bộ tiến trình học tập đã lưu của một trạm từ localStorage
 */
export function loadStationState(stationId: string): StationSavedState | null {
  if (typeof window === "undefined" || !stationId) return null;
  try {
    const raw = localStorage.getItem(getStationStorageKey(stationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as StationSavedState;
  } catch (err) {
    console.warn(`[useStationStorage] Không thể đọc cache cho trạm ${stationId}:`, err);
    return null;
  }
}

/**
 * Lưu tiến trình học tập của trạm vào localStorage
 */
export function saveStationState(stationId: string, state: Partial<StationSavedState>): void {
  if (typeof window === "undefined" || !stationId) return;
  try {
    const existing = loadStationState(stationId) || {
      stationId,
      moduleId: "",
      currentStep: 0,
      params: {},
      prediction: "",
      reason: "",
      observations: [],
      evidenceHistory: [],
      updatedAt: new Date().toISOString(),
    };
    const merged: StationSavedState = {
      ...existing,
      ...state,
      stationId,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(getStationStorageKey(stationId), JSON.stringify(merged));
  } catch (err) {
    console.warn(`[useStationStorage] Không thể ghi cache cho trạm ${stationId}:`, err);
  }
}

/**
 * Xóa dữ liệu tiến trình học tập để làm lại bài từ đầu
 */
export function clearStationState(stationId: string): void {
  if (typeof window === "undefined" || !stationId) return;
  try {
    localStorage.removeItem(getStationStorageKey(stationId));
    // Dọn dẹp cả key cache legacy nếu có
    localStorage.removeItem(`mathstep:state:${stationId}`);
  } catch (err) {
    console.warn(`[useStationStorage] Không thể xóa cache cho trạm ${stationId}:`, err);
  }
}

/**
 * Custom hook quản lý tự động lưu và khôi phục tiến trình trạm
 */
export function useStationStorage(stationId: string, moduleId: string) {
  const [loadedState, setLoadedState] = useState<StationSavedState | null>(null);
  const [hasRestored, setHasRestored] = useState<boolean>(false);

  // Khôi phục khi stationId thay đổi
  useEffect(() => {
    if (!stationId) return;
    const data = loadStationState(stationId);
    if (data) {
      setLoadedState(data);
      setHasRestored(true);
    } else {
      setLoadedState(null);
      setHasRestored(false);
    }
  }, [stationId]);

  const save = useCallback(
    (data: Partial<StationSavedState>) => {
      if (!stationId) return;
      saveStationState(stationId, {
        ...data,
        moduleId,
      });
    },
    [stationId, moduleId]
  );

  const reset = useCallback(() => {
    if (!stationId) return;
    clearStationState(stationId);
    setLoadedState(null);
    setHasRestored(false);
  }, [stationId]);

  return {
    loadedState,
    hasRestored,
    save,
    reset,
  };
}

/**
 * Lấy toàn bộ nhật ký tự học của tất cả các trạm đã lưu trong localStorage
 * Phục vụ cho Teacher Dashboard và Hội đồng chấm KHKT
 */
export function getAllSavedStudentLogs(): StationSavedState[] {
  if (typeof window === "undefined") return [];
  const results: StationSavedState[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            results.push(parsed as StationSavedState);
          } catch {
            // bỏ qua entry lỗi cú pháp
          }
        }
      }
    }
  } catch (err) {
    console.warn("[useStationStorage] Không thể đọc danh sách toàn bộ logs:", err);
  }
  return results;
}

/**
 * Xuất toàn bộ dữ liệu học tập ra file JSON để sao lưu dự phòng (Backup)
 */
export function exportStudentProgressJson(): string {
  if (typeof window === "undefined") return "{}";
  const allData: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    version: "mathstep-backup-v1",
    profile: null,
    stations: {},
  };

  try {
    const rawProfile = localStorage.getItem("mathstep:user_profile");
    if (rawProfile) allData.profile = JSON.parse(rawProfile);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            (allData.stations as Record<string, unknown>)[key] = JSON.parse(raw);
          } catch {}
        }
      }
    }
  } catch (err) {
    console.warn("Không thể xuất dữ liệu sao lưu:", err);
  }

  return JSON.stringify(allData, null, 2);
}

/**
 * Tải file sao lưu JSON về máy tính của học sinh (Client-side Backup Download)
 */
export function downloadBackupFile(): void {
  if (typeof window === "undefined") return;
  const jsonContent = exportStudentProgressJson();
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MathSTEP_SaoLuu_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
