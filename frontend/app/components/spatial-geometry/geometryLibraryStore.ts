import { create } from "zustand";

export type Point3 = [number, number, number];
export type GeometryTool = "select" | "free-point" | "edge-point" | "midpoint" | "face-point" | "segment" | "vector" | "translation" | "perpendicular";
export type EdgeStyle = "auto" | "solid" | "dashed";
export type LibraryPoint = { id: string; label: string; point: Point3; source: "free" | "edge" | "midpoint" | "face" | "foot" | "vector_dependent" | "translation"; edgeId?: string; t?: number; faceId?: string; dependsOn?: string[] };
export type LibrarySegment = { id: string; from: string; to: string; dashed?: boolean; rightAngleAt?: Point3 };
export type LibraryVector = { id: string; from: string; to: string; label: string; color: string };
export type ConstructionLog = { id: string; at: number; text: string; kind: "point" | "segment" | "foot" | "edge" | "system" };
export type GeometryLibrarySnapshot = { points: LibraryPoint[]; segments: LibrarySegment[]; vectors: LibraryVector[]; edgeStyles: Record<string, EdgeStyle>; objectVisibility: Record<string, boolean> };

interface GeometryLibraryState extends GeometryLibrarySnapshot {
  tool: GeometryTool;
  selectedVertexId: string | null;
  selectedFaceId: string | null;
  selectedEdgeId: string | null;
  pendingVertexIds: string[];
  pendingVectorIds: string[];
  logs: ConstructionLog[];
  undoStack: GeometryLibrarySnapshot[];
  redoStack: GeometryLibrarySnapshot[];
  setTool: (tool: GeometryTool) => void;
  selectVertex: (id: string | null) => void;
  selectFace: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  addPoint: (point: LibraryPoint, logText: string) => void;
  addSegment: (from: string, to: string, logText: string, extras?: Partial<LibrarySegment>) => void;
  addPerpendicular: (point: LibraryPoint, from: string, logText: string) => void;
  setEdgeStyle: (id: string, style: EdgeStyle) => void;
  addLog: (kind: ConstructionLog["kind"], text: string) => void;
  toggleObjectVisibility: (id: string) => void;
  replaceScene: (scene: GeometryLibrarySnapshot) => void;
  toggleSegmentVertex: (id: string) => void;
  toggleVectorVertex: (id: string) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

function snapshot(state: GeometryLibraryState): GeometryLibrarySnapshot {
  return { points: state.points, segments: state.segments, vectors: state.vectors, edgeStyles: state.edgeStyles, objectVisibility: state.objectVisibility };
}

function commit(state: GeometryLibraryState, patch: Partial<GeometryLibrarySnapshot>): Partial<GeometryLibraryState> {
  return { ...patch, undoStack: [...state.undoStack.slice(-49), snapshot(state)], redoStack: [] };
}

function addLog(state: GeometryLibraryState, kind: ConstructionLog["kind"], text: string): ConstructionLog[] {
  return [...state.logs.slice(-29), { id: `log-${Date.now()}`, at: Date.now(), text, kind }];
}

export const useGeometryLibraryStore = create<GeometryLibraryState>((set) => ({
  points: [], segments: [], vectors: [], edgeStyles: {}, objectVisibility: {}, tool: "select",
  selectedVertexId: null, selectedFaceId: null, selectedEdgeId: null,
  pendingVertexIds: [], pendingVectorIds: [], logs: [], undoStack: [], redoStack: [],
  setTool: (tool) => set({ tool, pendingVertexIds: [], pendingVectorIds: [] }),
  selectVertex: (id) => set({ selectedVertexId: id }),
  selectFace: (id) => set({ selectedFaceId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedFaceId: null }),
  addPoint: (point, logText) => set((state) => ({
    ...commit(state, { points: [...state.points, point], objectVisibility: { ...state.objectVisibility, [point.id]: true } }),
    selectedVertexId: point.id,
    logs: addLog(state, point.source === "foot" ? "foot" : "point", logText),
  })),
  addSegment: (from, to, logText, extras) => set((state) => {
    const id = `segment-${Date.now()}`;
    return {
      ...commit(state, { segments: [...state.segments, { id, from, to, ...extras }], objectVisibility: { ...state.objectVisibility, [id]: true } }),
      logs: addLog(state, extras?.rightAngleAt ? "foot" : "segment", logText),
    };
  }),
  addPerpendicular: (point, from, logText) => set((state) => {
    const segmentId = `segment-${Date.now()}`;
    return {
      ...commit(state, {
        points: [...state.points, point],
        segments: [...state.segments, { id: segmentId, from, to: point.id, dashed: true, rightAngleAt: point.point }],
        objectVisibility: { ...state.objectVisibility, [point.id]: true, [segmentId]: true },
      }),
      selectedVertexId: point.id,
      logs: addLog(state, "foot", logText),
    };
  }),
  setEdgeStyle: (id, style) => set((state) => ({
    ...commit(state, { edgeStyles: { ...state.edgeStyles, [id]: style } }),
    selectedEdgeId: id,
    logs: addLog(state, "edge", `Đổi cách thể hiện cạnh ${id}: ${style === "auto" ? "tự động" : style === "solid" ? "nét liền" : "nét đứt"}.`),
  })),
  addLog: (kind, text) => set((state) => ({ logs: addLog(state, kind, text) })),
  toggleObjectVisibility: (id) => set((state) => ({ objectVisibility: { ...state.objectVisibility, [id]: state.objectVisibility[id] === false } })),
  replaceScene: (scene) => set((state) => ({
    ...commit(state, scene), selectedVertexId: null, selectedFaceId: null, selectedEdgeId: null,
    pendingVertexIds: [], pendingVectorIds: [], logs: addLog(state, "system", "Đã nạp bản vẽ JSON và liên kết lại các đối tượng."),
  })),
  toggleSegmentVertex: (id) => set((state) => {
    const ids = [...state.pendingVertexIds];
    if (ids.includes(id)) return { pendingVertexIds: ids.filter(value => value !== id) };
    if (ids.length === 0) return { pendingVertexIds: [id], selectedVertexId: id };
    const from = ids[0]; if (from === id) return { pendingVertexIds: [] };
    const label = (pointId: string) => state.points.find(point => point.id === pointId)?.label ?? pointId;
    const segmentId = `segment-${Date.now()}`;
    return {
      ...commit(state, { segments: [...state.segments, { id: segmentId, from, to: id }], objectVisibility: { ...state.objectVisibility, [segmentId]: true } }),
      pendingVertexIds: [], selectedVertexId: id,
      logs: addLog(state, "segment", `Vừa dựng đoạn ${label(from)}${label(id)}. Hãy kiểm tra giả thiết để xác định quan hệ giữa đoạn này với các đối tượng khác.`),
    };
  }),
  toggleVectorVertex: (id) => set((state) => {
    const ids = [...state.pendingVectorIds];
    if (ids.includes(id)) return { pendingVectorIds: ids.filter(value => value !== id) };
    if (ids.length === 0) return { pendingVectorIds: [id], selectedVertexId: id };
    const from = ids[0]; if (from === id) return { pendingVectorIds: [] };
    const vectorId = `vector-${Date.now()}`;
    return {
      ...commit(state, { vectors: [...state.vectors, { id: vectorId, from, to: id, label: `\\overrightarrow{${from}${id}}`, color: "#7c3aed" }], objectVisibility: { ...state.objectVisibility, [vectorId]: true } }),
      pendingVectorIds: [], selectedVertexId: id,
      logs: addLog(state, "segment", `Đã dựng véc-tơ ${from}${id}. Hãy phân biệt hướng và độ dài của véc-tơ với đoạn thẳng nối hai điểm.`),
    };
  }),
  undo: () => set((state) => {
    const previous = state.undoStack.at(-1); if (!previous) return state;
    return { ...previous, undoStack: state.undoStack.slice(0, -1), redoStack: [...state.redoStack, snapshot(state)], pendingVertexIds: [], pendingVectorIds: [] };
  }),
  redo: () => set((state) => {
    const next = state.redoStack.at(-1); if (!next) return state;
    return { ...next, redoStack: state.redoStack.slice(0, -1), undoStack: [...state.undoStack, snapshot(state)], pendingVertexIds: [], pendingVectorIds: [] };
  }),
  clear: () => set((state) => ({
    ...commit(state, { points: [], segments: [], vectors: [], edgeStyles: {}, objectVisibility: {} }),
    selectedVertexId: null, selectedFaceId: null, selectedEdgeId: null, pendingVertexIds: [], pendingVectorIds: [],
    logs: addLog(state, "system", "Đã xóa các phép dựng phụ."),
  })),
}));
