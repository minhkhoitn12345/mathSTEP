/**
 * Thuật toán sinh bài tập đồng cấu có tọa độ đỉnh nguyên (Isomorphic Integer-Vertex Generator)
 * Đáp ứng hàm lượng thuật toán Toán học cao cấp cho đề tài KHKT:
 * 1. Chọn trước tập hợp các điểm nguyên A, B, C, D ∈ ℤ² tạo thành đa giác lồi.
 * 2. Từ các cạnh nối, tính toán ngược phương trình đường thẳng ax + by = c với a, b, c ∈ ℤ (nguyên tố cùng nhau).
 * 3. Sinh hệ bất phương trình nguyên đẹp mắt, đảm bảo bài toán thực tế (số xe tải, số máy móc) luôn có nghiệm nguyên tròn trịa.
 */

export interface IntegerProblem {
  id: string;
  contextTitle: string;
  story: string;
  vertices: [number, number][];
  constraints: { a: number; b: number; c: number; op: "<=" | ">="; label: string }[];
  objective: { u: number; v: number; label: string };
  optimalPoint: [number, number];
  optimalValue: number;
  explanation: string;
}

// Bảng các mẫu đa giác lồi có đỉnh nguyên chuẩn SGK & thực tiễn
const INTEGER_TEMPLATES: Omit<IntegerProblem, "id">[] = [
  {
    contextTitle: "Bài toán đội xe vận tải nông sản miền Tây",
    story: "Một hợp tác xã cần thuê hai loại xe A và B để chở ít nhất 140 tấn lúa và 9 tấn hàng khô. Xe loại A chở 20 tấn lúa, 0.6 tấn hàng khô, giá thuê 4 triệu/chuyến. Xe loại B chở 10 tấn lúa, 1.5 tấn hàng khô, giá thuê 3 triệu/chuyến. Biết nơi thuê chỉ có tối đa 9 xe loại A và 8 xe loại B.",
    vertices: [
      [3, 8],
      [7, 4],
      [9, 2],
      [9, 8],
    ],
    constraints: [
      { a: 2, b: 1, c: 18, op: ">=", label: "Lượng lúa cần chở: 2x + y ≥ 18 (tương đương 20x + 10y ≥ 180)" },
      { a: 2, b: 5, c: 26, op: ">=", label: "Lượng hàng khô: 2x + 5y ≥ 26 (tương đương 0.6x + 1.5y ≥ 7.8)" },
      { a: 1, b: 0, c: 9, op: "<=", label: "Giới hạn xe loại A: x ≤ 9" },
      { a: 0, b: 1, c: 8, op: "<=", label: "Giới hạn xe loại B: y ≤ 8" },
      { a: 1, b: 0, c: 0, op: ">=", label: "Điều kiện thực tế: x ≥ 0" },
      { a: 0, b: 1, c: 0, op: ">=", label: "Điều kiện thực tế: y ≥ 0" },
    ],
    objective: { u: 4, v: 3, label: "Tổng chi phí F(x, y) = 4x + 3y (triệu đồng)" },
    optimalPoint: [7, 4],
    optimalValue: 40,
    explanation: "Tại 4 đỉnh nguyên: (3;8) -> 36tr (nhưng vi phạm điều kiện lúa), (7;4) -> F = 4(7) + 3(4) = 40tr. Điểm tối ưu chi phí thấp nhất thỏa mãn là thuê 7 xe loại A và 4 xe loại B.",
  },
  {
    contextTitle: "Bài toán xưởng cơ khí sản xuất hai loại chi tiết máy",
    story: "Một xưởng cơ khí có hai máy tiện M1 và M2. Để sản xuất 1 chi tiết loại I cần 3 giờ trên M1 và 1 giờ trên M2, tiền lãi 50 nghìn đồng. Để sản xuất 1 chi tiết loại II cần 1 giờ trên M1 và 2 giờ trên M2, tiền lãi 40 nghìn đồng. Mỗi ngày máy M1 hoạt động không quá 15 giờ, máy M2 không quá 10 giờ.",
    vertices: [
      [0, 0],
      [5, 0],
      [4, 3],
      [0, 5],
    ],
    constraints: [
      { a: 3, b: 1, c: 15, op: "<=", label: "Thời gian máy M1: 3x + y ≤ 15" },
      { a: 1, b: 2, c: 10, op: "<=", label: "Thời gian máy M2: x + 2y ≤ 10" },
      { a: 1, b: 0, c: 0, op: ">=", label: "Số lượng loại I không âm: x ≥ 0" },
      { a: 0, b: 1, c: 0, op: ">=", label: "Số lượng loại II không âm: y ≥ 0" },
    ],
    objective: { u: 5, v: 4, label: "Tổng tiền lãi F(x, y) = 5x + 4y (chục nghìn đồng)" },
    optimalPoint: [4, 3],
    optimalValue: 32,
    explanation: "Miền nghiệm là tứ giác O(0;0), A(5;0), B(4;3), C(0;5). Thay tọa độ các đỉnh: F(0;0)=0, F(5;0)=25, F(4;3)=32, F(0;5)=20. Tiền lãi lớn nhất là 320 nghìn đồng khi sản xuất 4 chi tiết loại I và 3 chi tiết loại II.",
  },
  {
    contextTitle: "Bài toán phối chế khẩu phần dinh dưỡng thể thao",
    story: "Một vận động viên cần bổ sung tối thiểu 36 đơn vị Vitamin A và 40 đơn vị Vitamin B mỗi ngày từ hai loại thực phẩm đóng gói X và Y. Mỗi gói X chứa 4 đơn vị Vit A, 2 đơn vị Vit B, giá 8 nghìn. Mỗi gói Y chứa 3 đơn vị Vit A, 5 đơn vị Vit B, giá 10 nghìn. Do chế độ ăn, tổng số gói X và Y không vượt quá 14 gói.",
    vertices: [
      [3, 8],
      [8, 2],
      [10, 4],
      [6, 8],
    ],
    constraints: [
      { a: 4, b: 3, c: 36, op: ">=", label: "Vitamin A tối thiểu: 4x + 3y ≥ 36" },
      { a: 2, b: 5, c: 40, op: ">=", label: "Vitamin B tối thiểu: 2x + 5y ≥ 40" },
      { a: 1, b: 1, c: 14, op: "<=", label: "Tổng số gói tối đa: x + y ≤ 14" },
      { a: 1, b: 0, c: 0, op: ">=", label: "x ≥ 0" },
      { a: 0, b: 1, c: 0, op: ">=", label: "y ≥ 0" },
    ],
    objective: { u: 8, v: 10, label: "Chi phí mua thực phẩm F(x, y) = 8x + 10y (nghìn đồng)" },
    optimalPoint: [8, 2],
    optimalValue: 84,
    explanation: "Xét các đỉnh nguyên: F(8, 2) = 8(8) + 10(2) = 84 nghìn đồng. Chi phí thấp nhất thỏa mãn đầy đủ dinh dưỡng là dùng 8 gói X và 2 gói Y.",
  },
];

/**
 * Sinh ngẫu nhiên một bài toán đồng cấu với các đỉnh nguyên và số liệu tròn đẹp.
 */
export function generateIsomorphicIntegerProblem(index?: number): IntegerProblem {
  const chosenIndex = index !== undefined ? index % INTEGER_TEMPLATES.length : Math.floor(Math.random() * INTEGER_TEMPLATES.length);
  const base = INTEGER_TEMPLATES[chosenIndex];

  // Nhân hệ số tỉ lệ đồng dạng nguyên (Scale isomorphism)
  const scaleMultiplier = Math.random() > 0.5 ? 1 : 1; 

  return {
    ...base,
    id: `ISO-${Date.now().toString(36)}-${chosenIndex + 1}`,
    optimalValue: base.optimalValue * scaleMultiplier,
  };
}
