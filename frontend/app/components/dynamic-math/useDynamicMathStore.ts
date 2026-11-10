import { create } from "zustand";

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export interface DynamicParam {
  id: string;
  name: string;
  label: string;
  val: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  isCustom?: boolean;
}

export interface DynamicPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z?: number;
  isFree: boolean;
  color?: string;
  pinnedTo?: string; // e.g. "curve", "midpoint(A,B)"
}

interface DynamicMathState {
  // Params per module
  params: Record<string, DynamicParam>;
  freePoints: Record<string, DynamicPoint>;
  activeModule: ModuleId;

  // Actions
  setActiveModule: (mod: ModuleId) => void;
  setParamVal: (id: string, val: number) => void;
  addCustomParam: (param: Omit<DynamicParam, "id" | "isCustom">) => void;
  removeParam: (id: string) => void;
  resetModuleParams: (mod: ModuleId) => void;
  setFreePoint: (id: string, x: number, y: number, z?: number) => void;
}

// Preset defaults for 7 modules
export const MODULE_PRESETS: Record<ModuleId, Record<string, DynamicParam>> = {
  linear_programming: {
    u: { id: "u", name: "u", label: "Hệ số u (F = ux + vy)", val: 3, min: 0.5, max: 10, step: 0.5 },
    v: { id: "v", name: "v", label: "Hệ số v (F = ux + vy)", val: 2, min: 0.5, max: 10, step: 0.5 },
    k: { id: "k", name: "k", label: "Mức k (ux + vy = k)", val: 12, min: 0, max: 40, step: 0.5 },
    cap1: { id: "cap1", name: "c1", label: "Giới hạn thời gian (x + y ≤ c1)", val: 6, min: 2, max: 15, step: 0.5 },
    cap2: { id: "cap2", name: "c2", label: "Giới hạn vốn (2x - y ≤ c2)", val: 4, min: 1, max: 12, step: 0.5 },
  },
  spatial_geometry: {
    h: { id: "h", name: "h", label: "Chiều cao hình chóp (SH)", val: 3.5, min: 1.5, max: 7, step: 0.1, unit: "m" },
    tiltX: { id: "tiltX", name: "tiltX", label: "Độ nghiêng đỉnh S (Ox)", val: 0, min: -2, max: 2, step: 0.1 },
    tiltY: { id: "tiltY", name: "tiltY", label: "Độ nghiêng đỉnh S (Oy)", val: 0, min: -2, max: 2, step: 0.1 },
    planeZ: { id: "planeZ", name: "planeZ", label: "Độ cao mặt phẳng cắt (P)", val: 1.8, min: 0.2, max: 3.4, step: 0.1 },
    baseWidth: { id: "baseWidth", name: "baseWidth", label: "Kích thước cạnh đáy a", val: 4, min: 2, max: 6, step: 0.2 },
  },
  trigonometry: {
    theta: { id: "theta", name: "θ", label: "Góc quay điểm M", val: 60, min: -360, max: 720, step: 5, unit: "°" },
    amp: { id: "amp", name: "A", label: "Biên độ sóng A", val: 1.5, min: 0.2, max: 3, step: 0.1 },
    omega: { id: "omega", name: "ω", label: "Tần số góc ω", val: 1, min: 0.2, max: 4, step: 0.1, unit: "rad/s" },
    phi: { id: "phi", name: "φ", label: "Pha ban đầu φ", val: 0, min: -180, max: 180, step: 15, unit: "°" },
    shiftY: { id: "shiftY", name: "d", label: "Độ dịch dọc d", val: 0, min: -2, max: 2, step: 0.1 },
  },
  functions: {
    m: { id: "m", name: "m", label: "Tham số đường mức y = m", val: 0, min: -6, max: 6, step: 0.1 },
    coeffA: { id: "coeffA", name: "a", label: "Hệ số bậc 3 (a)", val: 1, min: -3, max: 3, step: 0.2 },
    coeffB: { id: "coeffB", name: "b", label: "Hệ số tự do / tuyến tính (b)", val: -3, min: -6, max: 6, step: 0.2 },
    x0: { id: "x0", name: "x0", label: "Hoành độ tiếp điểm x₀", val: 1.0, min: -3, max: 3, step: 0.05 },
  },
  calculus: {
    riemannN: { id: "riemannN", name: "n", label: "Số hình chữ nhật n", val: 10, min: 2, max: 100, step: 1 },
    boundA: { id: "boundA", name: "a", label: "Cận dưới a", val: 0, min: -2, max: 3, step: 0.2 },
    boundB: { id: "boundB", name: "b", label: "Cận trên b", val: 3, min: 1, max: 5, step: 0.2 },
    thetaRev: { id: "thetaRev", name: "θ_rev", label: "Góc quay tròn xoay θ", val: 360, min: 0, max: 360, step: 10, unit: "°" },
  },
  probability: {
    box1Red: { id: "box1Red", name: "b1_red", label: "Hộp 1: Số bi đỏ", val: 4, min: 1, max: 15, step: 1 },
    box1Blue: { id: "box1Blue", name: "b1_blue", label: "Hộp 1: Số bi xanh", val: 6, min: 1, max: 15, step: 1 },
    box2Red: { id: "box2Red", name: "b2_red", label: "Hộp 2: Số bi đỏ", val: 5, min: 1, max: 15, step: 1 },
    box2Blue: { id: "box2Blue", name: "b2_blue", label: "Hộp 2: Số bi xanh", val: 3, min: 1, max: 15, step: 1 },
  },
  conics_and_solids: {
    coneBeta: { id: "coneBeta", name: "β", label: "Góc nghiêng mặt phẳng cắt β", val: 55, min: 10, max: 90, step: 1, unit: "°" },
    coneAlpha: { id: "coneAlpha", name: "α", label: "Góc nửa đỉnh mặt nón α", val: 30, min: 20, max: 45, step: 1, unit: "°" },
    foldPercent: { id: "foldPercent", name: "fold", label: "Độ gập mô hình đa diện", val: 100, min: 0, max: 100, step: 1, unit: "%" },
    ellipseTheta: { id: "ellipseTheta", name: "θ_M", label: "Vị trí điểm M trên Elip", val: 45, min: 0, max: 360, step: 5, unit: "°" },
  },
};

const moduleStorageKey = (mod: ModuleId) => `mathstep:dynamic-params:${mod}`;

function restoreModuleParams(mod: ModuleId): Record<string, DynamicParam> {
  const defaults = MODULE_PRESETS[mod];
  try {
    const saved = JSON.parse(localStorage.getItem(moduleStorageKey(mod)) || "null") as Record<string, unknown> | null;
    if (!saved || typeof saved !== "object") return { ...defaults };
    return Object.fromEntries(Object.entries(defaults).map(([id, param]) => {
      const value = saved[id];
      return [id, { ...param, val: typeof value === "number" && Number.isFinite(value)
        ? Math.max(param.min, Math.min(param.max, value)) : param.val }];
    }));
  } catch { return { ...defaults }; }
}

function saveModuleParams(mod: ModuleId, params: Record<string, DynamicParam>) {
  try {
    localStorage.setItem(moduleStorageKey(mod), JSON.stringify(Object.fromEntries(
      Object.entries(params).filter(([id]) => id in MODULE_PRESETS[mod]).map(([id, param]) => [id, param.val])
    )));
  } catch { /* Browser storage is optional. */ }
}

export const useDynamicMathStore = create<DynamicMathState>((set, get) => ({
  activeModule: "linear_programming",
  params: { ...MODULE_PRESETS.linear_programming },
  freePoints: {},

  setActiveModule: (mod) =>
    set({
      activeModule: mod,
      params: restoreModuleParams(mod),
    }),

  setParamVal: (id, val) =>
    {
      set((state) => {
      const p = state.params[id];
      if (!p) return state;
      const clamped = Math.max(p.min, Math.min(p.max, val));
      return {
        params: {
          ...state.params,
          [id]: { ...p, val: clamped },
        },
      };
      });
      const state = get();
      saveModuleParams(state.activeModule, state.params);
    },

  addCustomParam: (newP) =>
    set((state) => {
      const id = `custom_${Date.now()}`;
      return {
        params: {
          ...state.params,
          [id]: {
            ...newP,
            id,
            isCustom: true,
          },
        },
      };
    }),

  removeParam: (id) =>
    set((state) => {
      const rest = { ...state.params };
      delete rest[id];
      return { params: rest };
    }),

  resetModuleParams: (mod) =>
    {
      try { localStorage.removeItem(moduleStorageKey(mod)); } catch {}
      set({ params: { ...MODULE_PRESETS[mod] } });
    },

  setFreePoint: (id, x, y, z) =>
    set((state) => ({
      freePoints: {
        ...state.freePoints,
        [id]: {
          ...(state.freePoints[id] || { id, name: id, isFree: true }),
          x,
          y,
          z,
        },
      },
    })),
}));
