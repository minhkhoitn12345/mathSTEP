import { ParsedGeometrySolid } from "./geometryParserPrompt";

export interface ResolvedPoint {
  name: string;
  coord: [number, number, number];
  isApex?: boolean;
  isFoot?: boolean;
  isSpecial?: boolean;
  color?: string;
}

export interface ResolvedEdge {
  from: string;
  to: string;
  start: [number, number, number];
  end: [number, number, number];
  style: "solid" | "dashed" | "altitude" | "special";
  color?: string;
  label?: string;
}

export interface ResolvedFace {
  name?: string;
  vertices: [number, number, number][];
  indices: number[]; // Triangulated index list for BufferGeometry
  color: string;
  opacity: number;
}

export interface ResolvedGeometryScene {
  solidType: "pyramid" | "prism" | "cone" | "cylinder" | "sphere";
  title: string;
  description: string;
  points: ResolvedPoint[];
  pointMap: Map<string, [number, number, number]>;
  edges: ResolvedEdge[];
  faces: ResolvedFace[];
  sectionPlanes: ResolvedFace[];
  altitudeFoot?: {
    apex: [number, number, number];
    foot: [number, number, number];
    footName: string;
    apexName: string;
  };
  relations: string[];
  suggestedQuestions: string[];
  // Dành riêng cho nón / trụ / cầu
  curvedMesh?: {
    type: "cone" | "cylinder" | "sphere";
    apex?: [number, number, number];
    center: [number, number, number];
    topCenter?: [number, number, number];
    radius: number;
    height: number;
  };
}

// -------------------------------------------------------------
// Thư viện Đề mẫu chuẩn hóa SGK Toán THPT (1-Click Prompt Templates)
// -------------------------------------------------------------
export const GEOMETRY_PRESET_TEMPLATES: {
  id: string;
  name: string;
  prompt: string;
  solid: ParsedGeometrySolid;
}[] = [
  {
    id: "sample_1_regular_pyramid",
    name: "Mẫu 1: Hình chóp tứ giác đều S.ABCD",
    prompt:
      "Cho hình chóp tứ giác đều S.ABCD có đáy ABCD là hình vuông tâm O cạnh a = 4, chiều cao SO = 4. Gọi M là trung điểm SC, N là trung điểm SD.",
    solid: {
      solidType: "pyramid",
      title: "Hình chóp tứ giác đều S.ABCD",
      description: "Đáy ABCD là hình vuông tâm O, hình chiếu của đỉnh S trùng với tâm O.",
      apex: { name: "S", coord: [0, 0, 4], isApex: true },
      base: {
        type: "square",
        center: { name: "O", coord: [0, 0, 0], isFoot: true },
        vertices: [
          { name: "A", coord: [-2, -2, 0] },
          { name: "B", coord: [2, -2, 0] },
          { name: "C", coord: [2, 2, 0] },
          { name: "D", coord: [-2, 2, 0] },
        ],
      },
      specialPoints: [
        { name: "O", type: "intersection", lines: [["A", "C"], ["B", "D"]], coord: [0, 0, 0] },
        { name: "M", type: "midpoint", segment: ["S", "C"], coord: [1, 1, 2] },
        { name: "N", type: "midpoint", segment: ["S", "D"], coord: [-1, 1, 2] },
      ],
      planes: [
        { name: "(AMN)", points: ["A", "M", "N"], color: "#0ea5e9", opacity: 0.35 },
      ],
      relations: ["SO_perpendicular_base", "ABCD_square", "M_midpoint_SC", "N_midpoint_SD"],
      suggestedQuestions: [
        "Chứng minh SO vuông góc với mặt phẳng (ABCD)?",
        "Xác định góc giữa cạnh bên SA và mặt phẳng đáy (ABCD)?",
        "Tìm thiết diện của hình chóp cắt bởi mặt phẳng (AMN)?",
      ],
    },
  },
  {
    id: "sample_2_pyramid_sa_perp",
    name: "Mẫu 2: Hình chóp S.ABC vuông tại B, SA vuông góc đáy",
    prompt:
      "Cho hình chóp S.ABC có đáy ABC là tam giác vuông tại B, SA vuông góc với mặt phẳng (ABC). Gọi M là trung điểm cạnh huyền AC, N là điểm trên SB sao cho SN = 2NB.",
    solid: {
      solidType: "pyramid",
      title: "Hình chóp S.ABC có SA ⊥ (ABC)",
      description: "Đáy ABC vuông tại B (AB ⊥ BC), SA là đường cao của hình chóp.",
      apex: { name: "S", coord: [-2, -1.8, 3.8], isApex: true },
      base: {
        type: "triangle",
        vertices: [
          { name: "A", coord: [-2, -1.8, 0], isFoot: true },
          { name: "B", coord: [1.8, -1.8, 0] },
          { name: "C", coord: [1.8, 1.8, 0] },
        ],
      },
      specialPoints: [
        { name: "M", type: "midpoint", segment: ["A", "C"], coord: [-0.1, 0, 0] },
        { name: "N", type: "ratio", segment: ["S", "B"], ratio: 0.667, coord: [0.53, -1.8, 1.27] },
      ],
      planes: [
        { name: "(SMN)", points: ["S", "M", "N"], color: "#10b981", opacity: 0.35 },
      ],
      relations: ["SA_perpendicular_base", "ABC_right_at_B", "BC_perpendicular_SAB"],
      suggestedQuestions: [
        "Chứng minh tam giác SBC vuông tại B?",
        "Tính khoảng cách từ điểm A đến mặt phẳng (SBC)?",
        "Chứng minh BC vuông góc với mặt phẳng (SAB)?",
      ],
    },
  },
  {
    id: "sample_3_triangular_prism",
    name: "Mẫu 3: Hình lăng trụ tam giác ABC.A'B'C'",
    prompt:
      "Cho hình lăng trụ đứng tam giác ABC.A'B'C' có đáy ABC là tam giác đều cạnh a. Gọi G là trọng tâm tam giác ABC, M là trung điểm cạnh bên CC'.",
    solid: {
      solidType: "prism",
      title: "Hình lăng trụ tam giác ABC.A'B'C'",
      description: "Lăng trụ đứng với hai đáy là tam giác đều song song, các cạnh bên song song và bằng nhau.",
      base: {
        type: "triangle",
        vertices: [
          { name: "A", coord: [-2, -1.5, 0] },
          { name: "B", coord: [2, -1.5, 0] },
          { name: "C", coord: [0, 1.8, 0] },
        ],
      },
      topBase: {
        type: "triangle",
        vertices: [
          { name: "A'", coord: [-2, -1.5, 3.5] },
          { name: "B'", coord: [2, -1.5, 3.5] },
          { name: "C'", coord: [0, 1.8, 3.5] },
        ],
      },
      height: 3.5,
      specialPoints: [
        { name: "G", type: "center", plane: ["A", "B", "C"], coord: [0, -0.4, 0] },
        { name: "M", type: "midpoint", segment: ["C", "C'"], coord: [0, 1.8, 1.75] },
      ],
      planes: [
        { name: "(A'B'M)", points: ["A'", "B'", "M"], color: "#f59e0b", opacity: 0.35 },
      ],
      relations: ["prism_parallel_bases", "lateral_edges_equal"],
      suggestedQuestions: [
        "Chứng minh đường thẳng A'B' song song với mặt phẳng (ABC)?",
        "Tìm góc giữa đường thẳng A'C và mặt đáy (ABC)?",
        "Tính thể tích khối đa diện ABCA'B'M?",
      ],
    },
  },
  {
    id: "sample_4_cone_equilateral_section",
    name: "Mẫu 4: Khối nón có thiết diện qua trục là tam giác đều",
    prompt:
      "Cho khối nón tròn xoay đỉnh S, trục SO = 4, bán kính đáy R = 2.3. Thiết diện qua trục SO là tam giác đều SAB.",
    solid: {
      solidType: "cone",
      title: "Khối nón có thiết diện qua trục là tam giác đều",
      description: "Hình nón tròn xoay đỉnh S, trục SO vuông góc với mặt phẳng đáy tâm O bán kính R.",
      apex: { name: "S", coord: [0, 0, 4], isApex: true },
      base: {
        type: "circle",
        center: { name: "O", coord: [0, 0, 0], isFoot: true },
        radius: 2.3,
        vertices: [
          { name: "A", coord: [-2.3, 0, 0] },
          { name: "B", coord: [2.3, 0, 0] },
          { name: "C", coord: [0, -2.3, 0] },
          { name: "D", coord: [0, 2.3, 0] },
        ],
      },
      height: 4,
      radius: 2.3,
      specialPoints: [
        { name: "O", type: "center", coord: [0, 0, 0] },
        { name: "M", type: "midpoint", segment: ["S", "B"], coord: [1.15, 0, 2] },
      ],
      planes: [
        { name: "Thiết diện qua trục (SAB)", points: ["S", "A", "B"], color: "#ec4899", opacity: 0.4 },
      ],
      relations: ["SO_axis_cone", "SAB_equilateral_section"],
      suggestedQuestions: [
        "Tính diện tích xung quanh và diện tích toàn phần của khối nón?",
        "Tính thể tích khối nón tròn xoay?",
        "Một mặt phẳng (P) đi qua đỉnh S và cắt đường tròn đáy theo một dây cung có độ dài bằng R. Tính khoảng cách từ O đến (P)?",
      ],
    },
  },
];

// -------------------------------------------------------------
// Toán giải tích tọa độ 3D (Vector Math Helpers)
// -------------------------------------------------------------
function addV(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function subV(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function scaleV(v: [number, number, number], s: number): [number, number, number] {
  return [v[0] * s, v[1] * s, v[2] * s];
}

function lerpV(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// -------------------------------------------------------------
// Bộ giải Hình học Không gian (Geometry Resolver Engine)
// -------------------------------------------------------------
export function resolveGeometrySolid(solid: ParsedGeometrySolid): ResolvedGeometryScene {
  const pointMap = new Map<string, [number, number, number]>();
  const points: ResolvedPoint[] = [];

  // 1. Thêm Đỉnh chóp S (nếu có)
  if (solid.apex) {
    const coord: [number, number, number] = solid.apex.coord || [0, 0, 3.8];
    pointMap.set(solid.apex.name, coord);
    points.push({
      name: solid.apex.name,
      coord,
      isApex: true,
      color: "#dc2626", // Đỏ nổi bật
    });
  }

  // 2. Thêm các đỉnh đáy dưới
  if (solid.base && Array.isArray(solid.base.vertices)) {
    for (const v of solid.base.vertices) {
      const coord: [number, number, number] = v.coord || [0, 0, 0];
      pointMap.set(v.name, coord);
      points.push({
        name: v.name,
        coord,
        isFoot: v.isFoot,
        color: v.isFoot ? "#dc2626" : "#2563eb",
      });
    }
  }

  // 3. Thêm tâm đáy nếu có
  if (solid.base?.center) {
    const cCoord = solid.base.center.coord || [0, 0, 0];
    pointMap.set(solid.base.center.name, cCoord);
    if (!points.some((p) => p.name === solid.base.center!.name)) {
      points.push({
        name: solid.base.center.name,
        coord: cCoord,
        isFoot: solid.base.center.isFoot,
        color: "#d97706",
      });
    }
  }

  // 4. Thêm các đỉnh đáy trên (lăng trụ, khối hộp)
  if (solid.topBase && Array.isArray(solid.topBase.vertices)) {
    for (const v of solid.topBase.vertices) {
      const coord: [number, number, number] = v.coord || [0, 0, solid.height || 3.5];
      pointMap.set(v.name, coord);
      points.push({
        name: v.name,
        coord,
        color: "#2563eb",
      });
    }
  }

  // 5. Giải tọa độ các điểm đặc biệt (Special Points: Midpoints, Ratios, Intersections)
  if (Array.isArray(solid.specialPoints)) {
    for (const sp of solid.specialPoints) {
      let resolvedCoord: [number, number, number] | null = null;

      if (sp.coord && Array.isArray(sp.coord) && sp.coord.length === 3) {
        resolvedCoord = sp.coord;
      } else if (sp.type === "midpoint" && sp.segment && sp.segment.length === 2) {
        const p1 = pointMap.get(sp.segment[0]);
        const p2 = pointMap.get(sp.segment[1]);
        if (p1 && p2) {
          resolvedCoord = lerpV(p1, p2, 0.5);
        }
      } else if (sp.type === "ratio" && sp.segment && sp.segment.length === 2) {
        const p1 = pointMap.get(sp.segment[0]);
        const p2 = pointMap.get(sp.segment[1]);
        const r = typeof sp.ratio === "number" ? sp.ratio : 0.667;
        if (p1 && p2) {
          resolvedCoord = lerpV(p1, p2, r);
        }
      } else if (sp.type === "intersection" && sp.lines && sp.lines.length === 2) {
        // Giao điểm 2 đường thẳng trên mặt phẳng đáy
        const l1a = pointMap.get(sp.lines[0][0]);
        const l1b = pointMap.get(sp.lines[0][1]);
        const l2a = pointMap.get(sp.lines[1][0]);
        const l2b = pointMap.get(sp.lines[1][1]);
        if (l1a && l1b && l2a && l2b) {
          // Tính trung bình trung điểm hoặc tâm đường chéo
          resolvedCoord = lerpV(lerpV(l1a, l1b, 0.5), lerpV(l2a, l2b, 0.5), 0.5);
        }
      } else if (sp.type === "center" && sp.plane) {
        const coords = sp.plane.map((n) => pointMap.get(n)).filter(Boolean) as [number, number, number][];
        if (coords.length > 0) {
          let sum: [number, number, number] = [0, 0, 0];
          for (const c of coords) {
            sum = addV(sum, c);
          }
          resolvedCoord = scaleV(sum, 1 / coords.length);
        }
      }

      if (resolvedCoord) {
        pointMap.set(sp.name, resolvedCoord);
        if (!points.some((p) => p.name === sp.name)) {
          points.push({
            name: sp.name,
            coord: resolvedCoord,
            isSpecial: true,
            color: "#f59e0b", // Vàng hổ phách cho điểm đặc biệt
          });
        }
      }
    }
  }

  // 6. Xây dựng danh sách các cạnh (Edges)
  const edges: ResolvedEdge[] = [];
  const addedEdgeKey = new Set<string>();

  const addEdge = (
    from: string,
    to: string,
    style: "solid" | "dashed" | "altitude" | "special" = "solid",
    color?: string
  ) => {
    const key = [from, to].sort().join("--");
    if (addedEdgeKey.has(key)) return;
    addedEdgeKey.add(key);

    const start = pointMap.get(from);
    const end = pointMap.get(to);
    if (start && end) {
      edges.push({ from, to, start, end, style, color });
    }
  };

  // Xác định đường cao (Altitude)
  let altitudeFoot: ResolvedGeometryScene["altitudeFoot"] = undefined;
  const isPyramid = solid.solidType === "pyramid";
  const apexName = solid.apex?.name;

  if (isPyramid && apexName) {
    // Tìm chân đường cao từ relations hoặc isFoot
    let footName = "";
    if (solid.relations.some((r) => r.includes("SA_perp") || r.includes("SA_vuong_goc"))) {
      footName = "A";
    } else if (solid.relations.some((r) => r.includes("SO_perp") || r.includes("SO_altitude"))) {
      footName = "O";
    } else if (solid.relations.some((r) => r.includes("SH_perp") || r.includes("SH_altitude"))) {
      footName = "H";
    } else {
      const footPoint = points.find((p) => p.isFoot && p.name !== apexName);
      if (footPoint) footName = footPoint.name;
    }

    if (footName && pointMap.has(footName)) {
      const footCoord = pointMap.get(footName)!;
      const apexCoord = pointMap.get(apexName)!;
      altitudeFoot = {
        apex: apexCoord,
        foot: footCoord,
        footName,
        apexName,
      };
      addEdge(apexName, footName, "altitude", "#dc2626");
    }
  }

  // Nối các cạnh đáy dưới
  const baseVerts = solid.base?.vertices || [];
  for (let i = 0; i < baseVerts.length; i++) {
    const curr = baseVerts[i].name;
    const next = baseVerts[(i + 1) % baseVerts.length].name;
    // Quy ước nét vẽ hình không gian: Các cạnh đáy phía sau hoặc nối với chân đường cao A thường khuất
    const isHidden = (curr === "A" && next === "D") || (curr === "D" && next === "A") || (curr === "A" && next === "B");
    addEdge(curr, next, isHidden ? "dashed" : "solid");
  }

  // Nối các cạnh bên của hình chóp
  if (isPyramid && apexName) {
    for (const bv of baseVerts) {
      if (bv.name !== altitudeFoot?.footName) {
        const isHidden = bv.name === "A" && altitudeFoot?.footName !== "A";
        addEdge(apexName, bv.name, isHidden ? "dashed" : "solid");
      }
    }
  }

  // Nối các cạnh lăng trụ (đáy trên và các cạnh bên)
  if (solid.solidType === "prism" && solid.topBase?.vertices) {
    const topVerts = solid.topBase.vertices;
    for (let i = 0; i < topVerts.length; i++) {
      const curr = topVerts[i].name;
      const next = topVerts[(i + 1) % topVerts.length].name;
      addEdge(curr, next, "solid");
    }
    // Nối cạnh bên tương ứng (A-A', B-B', C-C')
    const minLen = Math.min(baseVerts.length, topVerts.length);
    for (let i = 0; i < minLen; i++) {
      const isHidden = i === 0; // Cạnh AA' phía trong thường vẽ nét đứt
      addEdge(baseVerts[i].name, topVerts[i].name, isHidden ? "dashed" : "solid");
    }
  }

  // Đường chéo đáy (nếu có điểm O là tâm)
  if (pointMap.has("O")) {
    if (pointMap.has("A") && pointMap.has("C")) addEdge("A", "C", "dashed", "#94a3b8");
    if (pointMap.has("B") && pointMap.has("D")) addEdge("B", "D", "dashed", "#94a3b8");
  }

  // 7. Xây dựng các mặt phẳng (Faces)
  const faces: ResolvedFace[] = [];

  // Mặt đáy dưới
  if (baseVerts.length >= 3) {
    const baseCoords = baseVerts.map((v) => pointMap.get(v.name)!).filter(Boolean);
    // Triangulate n-gon bằng fan triangulation
    const indices: number[] = [];
    for (let i = 1; i < baseCoords.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    faces.push({
      name: "Mặt đáy",
      vertices: baseCoords,
      indices,
      color: "#0f766e",
      opacity: 0.18,
    });
  }

  // Mặt đáy trên (nếu là lăng trụ)
  if (solid.solidType === "prism" && solid.topBase?.vertices && solid.topBase.vertices.length >= 3) {
    const topCoords = solid.topBase.vertices.map((v) => pointMap.get(v.name)!).filter(Boolean);
    const indices: number[] = [];
    for (let i = 1; i < topCoords.length - 1; i++) {
      indices.push(0, i, i + 1);
    }
    faces.push({
      name: "Đáy trên",
      vertices: topCoords,
      indices,
      color: "#0f766e",
      opacity: 0.18,
    });
  }

  // Các mặt bên của hình chóp
  if (isPyramid && apexName && pointMap.has(apexName)) {
    const sCoord = pointMap.get(apexName)!;
    for (let i = 0; i < baseVerts.length; i++) {
      const v1 = pointMap.get(baseVerts[i].name);
      const v2 = pointMap.get(baseVerts[(i + 1) % baseVerts.length].name);
      if (v1 && v2) {
        faces.push({
          name: `Mặt bên (S${baseVerts[i].name}${baseVerts[(i + 1) % baseVerts.length].name})`,
          vertices: [sCoord, v1, v2],
          indices: [0, 1, 2],
          color: "#0284c7",
          opacity: 0.12,
        });
      }
    }
  }

  // 8. Xây dựng các Mặt phẳng cắt / Thiết diện (Section Planes)
  const sectionPlanes: ResolvedFace[] = [];
  if (Array.isArray(solid.planes)) {
    for (const pl of solid.planes) {
      const planeCoords = pl.points.map((p) => pointMap.get(p)).filter(Boolean) as [number, number, number][];
      if (planeCoords.length >= 3) {
        const indices: number[] = [];
        for (let i = 1; i < planeCoords.length - 1; i++) {
          indices.push(0, i, i + 1);
        }
        sectionPlanes.push({
          name: pl.name || "Thiết diện",
          vertices: planeCoords,
          indices,
          color: pl.color || "#0ea5e9",
          opacity: pl.opacity || 0.4,
        });

        // Nối các cạnh của thiết diện
        for (let i = 0; i < pl.points.length; i++) {
          const pCurr = pl.points[i];
          const pNext = pl.points[(i + 1) % pl.points.length];
          addEdge(pCurr, pNext, "special", pl.color || "#0ea5e9");
        }
      }
    }
  }

  // 9. Dành cho khối tròn xoay (cone, cylinder, sphere)
  let curvedMesh: ResolvedGeometryScene["curvedMesh"] = undefined;
  if (solid.solidType === "cone") {
    curvedMesh = {
      type: "cone",
      apex: solid.apex?.coord || [0, 0, 4],
      center: solid.base?.center?.coord || [0, 0, 0],
      radius: solid.radius || solid.base?.radius || 2.3,
      height: solid.height || 4,
    };
  } else if (solid.solidType === "cylinder") {
    curvedMesh = {
      type: "cylinder",
      center: solid.base?.center?.coord || [0, 0, 0],
      topCenter: solid.topBase?.center?.coord || [0, 0, solid.height || 4],
      radius: solid.radius || solid.base?.radius || 2.0,
      height: solid.height || 4,
    };
  } else if (solid.solidType === "sphere") {
    curvedMesh = {
      type: "sphere",
      center: solid.base?.center?.coord || [0, 0, 2],
      radius: solid.radius || 2.2,
      height: (solid.radius || 2.2) * 2,
    };
  }

  return {
    solidType: solid.solidType,
    title: solid.title || "Mô hình Hình học Không gian 3D",
    description: solid.description || "",
    points,
    pointMap,
    edges,
    faces,
    sectionPlanes,
    altitudeFoot,
    relations: solid.relations || [],
    suggestedQuestions: solid.suggestedQuestions || [],
    curvedMesh,
  };
}
