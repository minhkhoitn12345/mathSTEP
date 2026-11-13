import { create } from "zustand";

export type MathModelContext = {
  moduleName: "spatial_geometry" | "trigonometry" | "conics_and_solids";
  modelTitle: string;
  parameters: Record<string, number | string>;
  keyProperties: string[];
};

type MathModelContextStore = {
  current: MathModelContext | null;
  setCurrent: (context: MathModelContext) => void;
  clear: (moduleName: MathModelContext["moduleName"]) => void;
};

export const useMathContext = create<MathModelContextStore>((set) => ({
  current: null,
  setCurrent: (current) => set({ current }),
  clear: (moduleName) => set((state) => state.current?.moduleName === moduleName ? { current: null } : state),
}));

export function getMathContext(moduleName: string): MathModelContext | undefined {
  const current = useMathContext.getState().current;
  return current?.moduleName === moduleName ? current : undefined;
}
