export type Vector3 = [number, number, number];

export type SpatialGeometryProblem = {
  problemId?: string;
  problemMetadata: { title: string; gradeLevel: string; topic: string; originalText: string };
  sceneConfig: { cameraPosition: Vector3; target: Vector3 };
  geometry: {
    type: "pyramid" | "prism" | "cylinder" | "cone" | "sphere";
    vertices: Array<{ id: string; label: string; coords: Vector3 }>;
    solidEdges: string[][];
    dashedEdges: string[][];
    faces: string[][];
    heightLine?: { start: string; end: string; hasRightAngleMark: boolean };
    angleMarker?: { vertex: string; firstRay: string; secondRay: string; label: string };
  };
  pedagogy: {
    level1_Identify: { question: string; targetNodeId: string; successExplanation: string };
    level2_Construction?: { question: string; cutPlaneEquation: string; expectedPolygonType: string; crossSectionVertices: string[]; requiredNodeIds?: string[] };
    level3_ParametricSlider?: { parameter: string; min: number; max: number; step: number; formulaLatex: string; targetRatio: number };
    socraticHints: string[];
  };
};

export type GeminiGeometryPayload = {
  problemId: string;
  geometry: {
    vertices: Array<{ id: string; coords: Vector3 }>;
    solidEdges: string[][];
    dashedEdges: string[][];
    faces: string[][];
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} phải là chuỗi không rỗng.`);
  return value;
}

function requireVector3(value: unknown, path: string): Vector3 {
  if (!Array.isArray(value) || value.length !== 3 || !value.every((item) => typeof item === "number" && Number.isFinite(item))) {
    throw new Error(`${path} phải là mảng tọa độ gồm đúng ba số hữu hạn.`);
  }
  return value as Vector3;
}

function parseJsonCandidate(input: unknown): unknown {
  if (typeof input === "string") {
    const unfenced = input.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    try { return JSON.parse(unfenced); } catch {
      const start = unfenced.indexOf("{");
      const end = unfenced.lastIndexOf("}");
      if (start >= 0 && end > start) return JSON.parse(unfenced.slice(start, end + 1));
      throw new Error("Gemini không trả về JSON hợp lệ.");
    }
  }
  if (isRecord(input) && Array.isArray(input.candidates)) {
    const first = input.candidates.find(isRecord);
    const content = first?.content;
    if (isRecord(content) && Array.isArray(content.parts)) {
      const textPart = content.parts.find((part) => isRecord(part) && typeof part.text === "string");
      if (isRecord(textPart)) return parseJsonCandidate(textPart.text);
    }
    throw new Error("Phản hồi Gemini không có phần JSON trong candidates[0].content.parts.");
  }
  return input;
}

function validateEdgeList(value: unknown, knownIds: Set<string>, path: string): string[][] {
  if (!Array.isArray(value)) throw new Error(`${path} phải là danh sách cạnh.`);
  return value.map((edge, index) => {
    if (!Array.isArray(edge) || edge.length !== 2) throw new Error(`${path}[${index}] phải gồm hai mã đỉnh.`);
    const [from, to] = edge.map((id) => requireString(id, `${path}[${index}]`));
    if (from === to || !knownIds.has(from) || !knownIds.has(to)) throw new Error(`${path}[${index}] tham chiếu đỉnh không hợp lệ.`);
    return [from, to];
  });
}

function validateFaces(value: unknown, knownIds: Set<string>): string[][] {
  if (!Array.isArray(value) || value.length === 0) throw new Error("geometry.faces phải có ít nhất một mặt.");
  return value.map((face, index) => {
    if (!Array.isArray(face) || face.length < 3) throw new Error(`geometry.faces[${index}] phải có ít nhất ba đỉnh.`);
    const ids = face.map((id) => requireString(id, `geometry.faces[${index}]`));
    if (ids.some((id) => !knownIds.has(id)) || new Set(ids).size !== ids.length) throw new Error(`geometry.faces[${index}] chứa đỉnh lạ hoặc trùng.`);
    return ids;
  });
}

/** Validates a full lesson problem, plain JSON, fenced JSON, or a Gemini generateContent response. */
export function parseSpatialGeometryProblem(input: unknown): SpatialGeometryProblem {
  const root = parseJsonCandidate(input);
  if (!isRecord(root)) throw new Error("Đề Gemini phải là một đối tượng JSON.");
  const problemId = requireString(root.problemId, "problemId");
  const metadata = root.problemMetadata;
  const scene = root.sceneConfig;
  const geometry = root.geometry;
  const pedagogy = root.pedagogy;
  if (!isRecord(metadata) || !isRecord(scene) || !isRecord(geometry) || !isRecord(pedagogy)) {
    throw new Error("JSON thiếu problemMetadata, sceneConfig, geometry hoặc pedagogy.");
  }

  const verticesRaw = geometry.vertices;
  if (!Array.isArray(verticesRaw) || verticesRaw.length < 4) throw new Error("geometry.vertices phải có ít nhất bốn đỉnh.");
  const vertices = verticesRaw.map((item, index) => {
    if (!isRecord(item)) throw new Error(`geometry.vertices[${index}] không hợp lệ.`);
    return { id: requireString(item.id, `geometry.vertices[${index}].id`), label: requireString(item.label, `geometry.vertices[${index}].label`), coords: requireVector3(item.coords, `geometry.vertices[${index}].coords`) };
  });
  const knownIds = new Set(vertices.map((vertex) => vertex.id));
  if (knownIds.size !== vertices.length) throw new Error("geometry.vertices có mã đỉnh bị trùng.");
  const type = geometry.type;
  if (type !== "pyramid" && type !== "prism" && type !== "cylinder" && type !== "cone" && type !== "sphere") throw new Error("geometry.type không được hỗ trợ.");
  const solidEdges = validateEdgeList(geometry.solidEdges, knownIds, "geometry.solidEdges");
  const dashedEdges = validateEdgeList(geometry.dashedEdges, knownIds, "geometry.dashedEdges");
  const faces = validateFaces(geometry.faces, knownIds);
  const heightLine = geometry.heightLine;
  if (heightLine !== undefined && (!isRecord(heightLine) || !knownIds.has(String(heightLine.start)) || !knownIds.has(String(heightLine.end)) || typeof heightLine.hasRightAngleMark !== "boolean")) {
    throw new Error("geometry.heightLine phải tham chiếu hai đỉnh hợp lệ và có hasRightAngleMark.");
  }
  const angleMarker = geometry.angleMarker;
  if (angleMarker !== undefined && (!isRecord(angleMarker) || ![angleMarker.vertex, angleMarker.firstRay, angleMarker.secondRay].every((id) => typeof id === "string" && knownIds.has(id)) || typeof angleMarker.label !== "string")) {
    throw new Error("geometry.angleMarker tham chiếu điểm không hợp lệ.");
  }

  const identify = pedagogy.level1_Identify;
  if (!isRecord(identify) || !knownIds.has(String(identify.targetNodeId))) throw new Error("pedagogy.level1_Identify thiếu câu hỏi hoặc đỉnh đáp án hợp lệ.");
  if (!Array.isArray(pedagogy.socraticHints) || pedagogy.socraticHints.length !== 3 || pedagogy.socraticHints.some((hint) => typeof hint !== "string" || !hint.trim())) {
    throw new Error("pedagogy.socraticHints phải có đúng ba gợi ý không rỗng.");
  }
  const level2 = pedagogy.level2_Construction;
  if (level2 !== undefined && (!isRecord(level2) || !Array.isArray(level2.crossSectionVertices) || level2.crossSectionVertices.length < 3 || level2.crossSectionVertices.some((id) => typeof id !== "string" || !knownIds.has(id)) || (Array.isArray(level2.requiredNodeIds) && level2.requiredNodeIds.some((id) => typeof id !== "string" || !knownIds.has(id))))) {
    throw new Error("pedagogy.level2_Construction chứa đỉnh thiết diện không hợp lệ.");
  }
  const level3 = pedagogy.level3_ParametricSlider;
  if (level3 !== undefined && (!isRecord(level3) || typeof level3.parameter !== "string" || typeof level3.min !== "number" || typeof level3.max !== "number" || typeof level3.step !== "number" || typeof level3.targetRatio !== "number" || typeof level3.formulaLatex !== "string" || level3.min >= level3.max || level3.step <= 0)) {
    throw new Error("pedagogy.level3_ParametricSlider có khoảng hoặc bước trượt không hợp lệ.");
  }

  return {
    problemId,
    problemMetadata: {
      title: requireString(metadata.title, "problemMetadata.title"), gradeLevel: requireString(metadata.gradeLevel, "problemMetadata.gradeLevel"),
      topic: requireString(metadata.topic, "problemMetadata.topic"), originalText: requireString(metadata.originalText, "problemMetadata.originalText"),
    },
    sceneConfig: { cameraPosition: requireVector3(scene.cameraPosition, "sceneConfig.cameraPosition"), target: requireVector3(scene.target, "sceneConfig.target") },
    geometry: {
      type, vertices, solidEdges, dashedEdges, faces,
      ...(heightLine ? { heightLine: heightLine as SpatialGeometryProblem["geometry"]["heightLine"] } : {}),
      ...(angleMarker ? { angleMarker: angleMarker as SpatialGeometryProblem["geometry"]["angleMarker"] } : {}),
    },
    pedagogy: {
      level1_Identify: { question: requireString(identify.question, "pedagogy.level1_Identify.question"), targetNodeId: requireString(identify.targetNodeId, "pedagogy.level1_Identify.targetNodeId"), successExplanation: requireString(identify.successExplanation, "pedagogy.level1_Identify.successExplanation") },
      ...(level2 ? { level2_Construction: level2 as SpatialGeometryProblem["pedagogy"]["level2_Construction"] } : {}),
      ...(level3 ? { level3_ParametricSlider: level3 as SpatialGeometryProblem["pedagogy"]["level3_ParametricSlider"] } : {}),
      socraticHints: pedagogy.socraticHints as string[],
    },
  };
}

/** Validates Gemini's compact geometry payload when the model returns geometry without lesson metadata. */
export function parseGeminiGeometryPayload(input: unknown): GeminiGeometryPayload {
  const root = parseJsonCandidate(input);
  if (!isRecord(root) || !isRecord(root.geometry)) throw new Error("JSON Gemini phải có problemId và geometry.");
  const problemId = requireString(root.problemId, "problemId");
  const geometry = root.geometry;
  if (!Array.isArray(geometry.vertices) || geometry.vertices.length < 4) throw new Error("geometry.vertices phải có ít nhất bốn đỉnh.");
  const vertices = geometry.vertices.map((item, index) => {
    if (!isRecord(item)) throw new Error(`geometry.vertices[${index}] không hợp lệ.`);
    return { id: requireString(item.id, `geometry.vertices[${index}].id`), coords: requireVector3(item.coords, `geometry.vertices[${index}].coords`) };
  });
  const ids = new Set(vertices.map((item) => item.id));
  if (ids.size !== vertices.length) throw new Error("geometry.vertices có mã đỉnh bị trùng.");
  return {
    problemId,
    geometry: {
      vertices,
      solidEdges: validateEdgeList(geometry.solidEdges, ids, "geometry.solidEdges"),
      dashedEdges: validateEdgeList(geometry.dashedEdges, ids, "geometry.dashedEdges"),
      faces: validateFaces(geometry.faces, ids),
    },
  };
}
