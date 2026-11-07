// Danh mục 48 trạm học toán học THPT chuẩn GDPT 2018
// Trích xuất từ đề cương dự án và hethongmodule/index (2).html

export type ModuleId =
  | "linear_programming"
  | "spatial_geometry"
  | "trigonometry"
  | "functions"
  | "calculus"
  | "probability"
  | "conics_and_solids";

export interface StationItem {
  id: string;
  grade: 10 | 11 | 12;
  source: string;
  title: string;
  simulation: string;
  goal: string;
  priority: "A" | "B" | "C";
  moduleId: ModuleId;
  is3D: boolean;
}

export function removeVietnameseAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export const STATION_CATALOG: StationItem[] = [
  {
    "id": "10.01",
    "source": "KNTT tập 1 Bài 2, tr.12",
    "title": "Tập hợp và phép toán",
    "simulation": "2D: kéo phần tử giữa các miền; bật giao, hợp, hiệu.",
    "goal": "Phân biệt giao với hợp; không đồng nhất phần tử và tập con.",
    "priority": "B",
    "grade": 10,
    "moduleId": "spatial_geometry",
    "is3D": false
  },
  {
    "id": "10.02",
    "source": "KNTT tập 1 Bài 3, tr.22",
    "title": "Bất phương trình hai ẩn",
    "simulation": "2D: kéo điểm thử, đổi dấu và tô nửa mặt phẳng.",
    "goal": "Thay tọa độ để kiểm tra; phân biệt có và không lấy bờ.",
    "priority": "A",
    "grade": 10,
    "moduleId": "linear_programming",
    "is3D": false
  },
  {
    "id": "10.03",
    "source": "KNTT tập 1 Bài 4, tr.26",
    "title": "Hệ bất phương trình hai ẩn",
    "simulation": "2D: chồng miền nghiệm; kéo đường mục tiêu; lưới nguyên tùy bài.",
    "goal": "Nghiệm phải thỏa đồng thời; nhận biết vô nghiệm và biên.",
    "priority": "A",
    "grade": 10,
    "moduleId": "linear_programming",
    "is3D": false
  },
  {
    "id": "10.04",
    "source": "KNTT tập 1 Bài 5, tr.33",
    "title": "Lượng giác góc 0 đến 180 độ",
    "simulation": "2D: quay bán kính trên nửa đường tròn; chiếu lên hai trục.",
    "goal": "Liên hệ sin, cos với tọa độ; chú ý dấu cos góc tù.",
    "priority": "B",
    "grade": 10,
    "moduleId": "linear_programming",
    "is3D": false
  },
  {
    "id": "10.05",
    "source": "KNTT tập 1 Bài 6, tr.38",
    "title": "Hệ thức lượng tam giác",
    "simulation": "2D và cảnh 3D đo đạc: kéo đỉnh, thay cạnh và góc.",
    "goal": "Chọn định lý sin hoặc cos; kiểm tra dữ kiện tạo được tam giác.",
    "priority": "B",
    "grade": 10,
    "moduleId": "trigonometry",
    "is3D": true
  },
  {
    "id": "10.06",
    "source": "KNTT tập 1 Bài 7 đến 9, tr.46, 51, 55",
    "title": "Phép toán vectơ",
    "simulation": "2D: kéo mũi tên; ghép đầu đuôi, hình bình hành, nhân số.",
    "goal": "Phân biệt độ dài với vectơ; hệ số âm đổi hướng.",
    "priority": "B",
    "grade": 10,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "10.07",
    "source": "KNTT tập 1 Bài 10 và 11, tr.60, 66",
    "title": "Tọa độ và tích vô hướng",
    "simulation": "2D: kéo vectơ, đo góc, hiện hình chiếu và tọa độ.",
    "goal": "Tích vô hướng có thể âm; kiểm tra điều kiện vuông góc.",
    "priority": "B",
    "grade": 10,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "10.08",
    "source": "KNTT tập 1 Bài 12, tr.73",
    "title": "Số gần đúng và sai số",
    "simulation": "2D: phóng trục số, chọn hàng làm tròn và khoảng sai số.",
    "goal": "Phân biệt sai số thực với độ chính xác; đơn vị và hàng làm tròn.",
    "priority": "B",
    "grade": 10,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "10.09",
    "source": "KNTT tập 1 và tập 2 T1, Bài 13 và 14, tr.78, 84",
    "title": "Thống kê không ghép nhóm",
    "simulation": "2D: kéo dữ liệu, thêm ngoại lệ, so sánh trung bình và trung vị.",
    "goal": "Nhận ra ảnh hưởng ngoại lệ; phân biệt phương sai và độ lệch chuẩn.",
    "priority": "B",
    "grade": 10,
    "moduleId": "probability",
    "is3D": false
  },
  {
    "id": "10.10",
    "source": "KNTT tập 1 và tập 2 T2, Bài 15 và 16, tr.4, 11",
    "title": "Hàm số và parabol",
    "simulation": "2D: đổi a, b, c; hiện đỉnh, trục đối xứng và bảng giá trị.",
    "goal": "Tác động đồng thời của hệ số; kiểm tra miền xác định theo tình huống.",
    "priority": "A",
    "grade": 10,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "10.11",
    "source": "KNTT tập 1 và tập 2 T2, Bài 17 và 18, tr.19, 25",
    "title": "Tam thức và phương trình",
    "simulation": "2D: đồng bộ đồ thị với trục dấu; đánh dấu giao điểm nghiệm.",
    "goal": "Không lấy nghiệm ngoại lai; phân biệt dấu tại và giữa các nghiệm.",
    "priority": "B",
    "grade": 10,
    "moduleId": "conics_and_solids",
    "is3D": false
  },
  {
    "id": "10.12",
    "source": "KNTT tập 1 và tập 2 T2, Bài 19 và 20, tr.30, 36",
    "title": "Đường thẳng trong Oxy",
    "simulation": "2D: đổi pháp tuyến, chỉ phương, điểm đi qua; kéo hai đường.",
    "goal": "Không nhầm hai vectơ; xử lý đường thẳng đứng.",
    "priority": "B",
    "grade": 10,
    "moduleId": "conics_and_solids",
    "is3D": false
  },
  {
    "id": "10.13",
    "source": "KNTT tập 1 và tập 2 T2, Bài 21, tr.43",
    "title": "Đường tròn trong Oxy",
    "simulation": "2D: kéo tâm, đổi bán kính; quan sát tiếp xúc với đường thẳng.",
    "goal": "Bán kính dương; phân biệt r với r bình phương trong phương trình.",
    "priority": "B",
    "grade": 10,
    "moduleId": "conics_and_solids",
    "is3D": false
  },
  {
    "id": "10.14",
    "source": "KNTT tập 1 và tập 2 T2, Bài 22, tr.48",
    "title": "Ba đường conic",
    "simulation": "2D liên kết 3D: cắt mặt nón; kiểm tra định nghĩa bằng tiêu điểm.",
    "goal": "Liên hệ mặt cắt và phương trình; chú ý điều kiện tham số.",
    "priority": "C",
    "grade": 10,
    "moduleId": "probability",
    "is3D": true
  },
  {
    "id": "10.15",
    "source": "KNTT tập 1 và tập 2 T2, Bài 23 đến 25, tr.60, 66, 72",
    "title": "Đếm và nhị thức Newton",
    "simulation": "2D: kéo thẻ, xếp chỗ, cây chọn; khai triển thành nhóm tổ hợp.",
    "goal": "Phân biệt có xét thứ tự và không; tránh đếm lặp.",
    "priority": "C",
    "grade": 10,
    "moduleId": "probability",
    "is3D": false
  },
  {
    "id": "10.16",
    "source": "KNTT tập 1 và tập 2 T2, Bài 26 và 27, tr.77, 83",
    "title": "Xác suất cổ điển",
    "simulation": "2D hoặc xúc xắc 3D: chọn không gian mẫu, lặp phép thử.",
    "goal": "Đồng khả năng là điều kiện; tần suất không luôn bằng xác suất.",
    "priority": "B",
    "grade": 10,
    "moduleId": "probability",
    "is3D": true
  },
  {
    "id": "11.01",
    "source": "KNTT tập 1 Bài 1 và 2, tr.5, 17",
    "title": "Góc và công thức lượng giác",
    "simulation": "2D: quay đường tròn lượng giác, ghép góc, chiếu tọa độ.",
    "goal": "Đổi radian và độ; góc cùng điểm cuối khác số đo.",
    "priority": "B",
    "grade": 11,
    "moduleId": "trigonometry",
    "is3D": false
  },
  {
    "id": "11.02",
    "source": "KNTT tập 1 Bài 3 và 4, tr.22, 31",
    "title": "Hàm và phương trình lượng giác",
    "simulation": "2D: kéo góc liên kết đồ thị sin, cos, tan, cot.",
    "goal": "Chu kỳ, miền xác định và đủ họ nghiệm.",
    "priority": "B",
    "grade": 11,
    "moduleId": "trigonometry",
    "is3D": false
  },
  {
    "id": "11.03",
    "source": "KNTT tập 1 Bài 5 đến 7, tr.42, 48, 52",
    "title": "Dãy số và hai cấp số",
    "simulation": "2D: dựng bậc thang, ghép cặp tổng; tăng trưởng số hạng.",
    "goal": "Dãy là các điểm rời; phân biệt công sai với công bội.",
    "priority": "B",
    "grade": 11,
    "moduleId": "trigonometry",
    "is3D": false
  },
  {
    "id": "11.04",
    "source": "KNTT tập 1 Bài 8 và 9, tr.58, 62",
    "title": "Trung tâm dữ liệu ghép nhóm",
    "simulation": "2D: đổi khoảng lớp, tần số; di chuyển vị trí phân vị.",
    "goal": "Kết quả ghép nhóm là ước lượng; xét tần số tích lũy.",
    "priority": "B",
    "grade": 11,
    "moduleId": "calculus",
    "is3D": false
  },
  {
    "id": "11.05",
    "source": "KNTT tập 1 Bài 10, tr.70",
    "title": "Điểm đường mặt trong không gian",
    "simulation": "3D: xoay hình chóp, chọn điểm và giao tuyến hai mặt.",
    "goal": "Điều kiện xác định mặt phẳng; hình chiếu có thể gây nhầm giao nhau.",
    "priority": "A",
    "grade": 11,
    "moduleId": "calculus",
    "is3D": true
  },
  {
    "id": "11.06",
    "source": "KNTT tập 1 Bài 11, tr.78",
    "title": "Hai đường thẳng song song",
    "simulation": "3D: kéo hai đường, chuyển giữa cắt, song song, chéo nhau.",
    "goal": "Không giao nhau chưa đủ để song song; phải đồng phẳng.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.07",
    "source": "KNTT tập 1 Bài 12, tr.84",
    "title": "Đường song song mặt phẳng",
    "simulation": "3D: dịch đường; tô đường tham chiếu trong mặt.",
    "goal": "Phân biệt song song với nằm trong mặt phẳng.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.08",
    "source": "KNTT tập 1 Bài 13, tr.88",
    "title": "Hai mặt phẳng song song",
    "simulation": "3D: quay, dịch hai tấm trong suốt; chọn đường kiểm tra.",
    "goal": "Một cặp đường song song chưa đủ kết luận hai mặt song song.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.09",
    "source": "KNTT tập 1 Bài 14, tr.95",
    "title": "Phép chiếu song song",
    "simulation": "3D liên kết 2D: đổi phương chiếu và mặt phẳng nhận hình.",
    "goal": "Độ dài và góc thường không bảo toàn; phương chiếu không song song mặt.",
    "priority": "B",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.10",
    "source": "KNTT tập 1 Bài 15 đến 17, tr.104, 111, 119",
    "title": "Giới hạn và liên tục",
    "simulation": "2D: tăng n; tiến đến điểm từ hai phía; hiện điểm khuyết.",
    "goal": "Giới hạn khác giá trị tại điểm; ví dụ số không là chứng minh.",
    "priority": "B",
    "grade": 11,
    "moduleId": "calculus",
    "is3D": false
  },
  {
    "id": "11.11",
    "source": "KNTT tập 2 Bài 18 và 19, tr.4, 10",
    "title": "Lũy thừa và logarit",
    "simulation": "2D: nối phép nhân, số mũ và phép toán ngược bằng trục số.",
    "goal": "Điều kiện cơ số và đối số; log của tổng không bằng tổng log.",
    "priority": "C",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": false
  },
  {
    "id": "11.12",
    "source": "KNTT tập 2 Bài 20 và 21, tr.16, 20",
    "title": "Hàm mũ và logarit",
    "simulation": "2D: thay cơ số; soi qua y=x; kéo đường mức để tìm nghiệm.",
    "goal": "Đổi chiều đơn điệu khi cơ số thuộc (0;1); kiểm tra điều kiện.",
    "priority": "B",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": false
  },
  {
    "id": "11.13",
    "source": "KNTT tập 2 Bài 22, tr.27",
    "title": "Hai đường thẳng vuông góc",
    "simulation": "3D: chọn hai đường, dời vectơ về cùng gốc và đo góc.",
    "goal": "Hai đường chéo nhau có thể vuông góc theo góc giữa hai đường.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.14",
    "source": "KNTT tập 2 Bài 23, tr.31",
    "title": "Đường vuông góc mặt phẳng",
    "simulation": "3D: dựng đường, chọn hai đường cắt nhau trong mặt để kiểm tra.",
    "goal": "Vuông góc một đường trong mặt chưa đủ.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.15",
    "source": "KNTT tập 2 Bài 24, tr.38",
    "title": "Chiếu vuông góc và góc",
    "simulation": "3D: kéo điểm, dựng chân chiếu và hình chiếu của đường.",
    "goal": "Góc đường và mặt là góc với hình chiếu trong trường hợp phù hợp.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.16",
    "source": "KNTT tập 2 Bài 25, tr.44",
    "title": "Hai mặt phẳng vuông góc",
    "simulation": "3D: mở cánh cửa, cắt bởi mặt phẳng vuông góc giao tuyến.",
    "goal": "Không lấy góc ngẫu nhiên giữa hai đường trong hai mặt.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.17",
    "source": "KNTT tập 2 Bài 26, tr.54",
    "title": "Khoảng cách trong không gian",
    "simulation": "3D: kéo chân đoạn nối; dựng hình chiếu và đường vuông góc chung.",
    "goal": "Khoảng cách là độ dài thích hợp nhỏ nhất; phân biệt đoạn xiên.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.18",
    "source": "KNTT tập 2 Bài 27, tr.61",
    "title": "Thể tích khối đa diện",
    "simulation": "3D: đổi đáy và chiều cao; phân chia lăng trụ, chóp, chóp cụt đều.",
    "goal": "Chiều cao vuông góc đáy; giữ rõ điều kiện công thức từng khối.",
    "priority": "A",
    "grade": 11,
    "moduleId": "spatial_geometry",
    "is3D": true
  },
  {
    "id": "11.19",
    "source": "KNTT tập 2 Bài 28 đến 30, tr.66, 72, 76",
    "title": "Phép toán và quy tắc xác suất",
    "simulation": "2D: tô miền biến cố; cây thử nghiệm, lặp phép thử.",
    "goal": "Xung khắc khác độc lập; chỉ nhân trực tiếp theo điều kiện tương ứng.",
    "priority": "B",
    "grade": 11,
    "moduleId": "probability",
    "is3D": false
  },
  {
    "id": "11.20",
    "source": "KNTT tập 2 Bài 31 đến 33, tr.81, 88, 95",
    "title": "Đạo hàm và tốc độ thay đổi",
    "simulation": "2D: kéo cát tuyến thành tiếp tuyến; đồ thị vận tốc, gia tốc.",
    "goal": "Không suy ra đạo hàm tồn tại chỉ từ hình vẽ; kiểm tra đơn vị.",
    "priority": "A",
    "grade": 11,
    "moduleId": "calculus",
    "is3D": false
  },
  {
    "id": "12.01",
    "source": "CTST tập 1 Ch.I Bài 1, tr.6",
    "title": "Đơn điệu và cực trị",
    "simulation": "2D: kéo tiếp điểm, liên kết f và dấu của đạo hàm.",
    "goal": "Đạo hàm bằng 0 chưa đủ có cực trị; kiểm tra đổi dấu.",
    "priority": "A",
    "grade": 12,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "12.02",
    "source": "CTST tập 1 Ch.I Bài 2, tr.14",
    "title": "Giá trị lớn nhất nhỏ nhất",
    "simulation": "2D và ngữ cảnh 3D: hộp mở nắp, đổi kích thước và thể tích.",
    "goal": "Xét miền xác định, điểm tới hạn và đầu mút; xét khả năng đạt.",
    "priority": "B",
    "grade": 12,
    "moduleId": "functions",
    "is3D": true
  },
  {
    "id": "12.03",
    "source": "CTST tập 1 Ch.I Bài 3, tr.19",
    "title": "Đường tiệm cận",
    "simulation": "2D: zoom gần điểm gián đoạn và xa vô cực, hiện khoảng cách.",
    "goal": "Đồ thị có thể cắt tiệm cận ngang hoặc xiên; dùng giới hạn để kết luận.",
    "priority": "B",
    "grade": 12,
    "moduleId": "functions",
    "is3D": false
  },
  {
    "id": "12.04",
    "source": "CTST tập 1 Ch.I Bài 4, tr.25",
    "title": "Khảo sát và vẽ đồ thị",
    "simulation": "2D: đổi tham số, đồng bộ bảng biến thiên và đồ thị.",
    "goal": "Miền xác định, nhánh đồ thị và số giao điểm phải nhất quán.",
    "priority": "B",
    "grade": 12,
    "moduleId": "probability",
    "is3D": false
  },
  {
    "id": "12.05",
    "source": "CTST tập 1 Ch.II Bài 1 đến 3, tr.41, 52, 58",
    "title": "Vectơ và tọa độ Oxyz",
    "simulation": "3D: kéo vectơ theo trục hoặc mặt điều khiển; chiếu lên ba trục.",
    "goal": "Phân biệt điểm và vectơ; dấu tọa độ, góc và độ dài.",
    "priority": "A",
    "grade": 12,
    "moduleId": "calculus",
    "is3D": true
  },
  {
    "id": "12.06",
    "source": "CTST tập 1 Ch.III Bài 1 và 2, tr.68, 75",
    "title": "Độ phân tán dữ liệu ghép nhóm",
    "simulation": "2D: kéo tần số, so hai mẫu, hiện khoảng tứ phân vị và độ lệch chuẩn.",
    "goal": "Tính theo giá trị đại diện; không nhầm số quan sát với số nhóm.",
    "priority": "B",
    "grade": 12,
    "moduleId": "calculus",
    "is3D": false
  },
  {
    "id": "12.07",
    "source": "CTST tập 2 Ch.IV Bài 1 và 2, tr.6, 12",
    "title": "Nguyên hàm và tích phân",
    "simulation": "2D: thay hằng số C, chia dải, tăng số hình chữ nhật.",
    "goal": "Họ nguyên hàm có C; tích phân có dấu và đổi cận đổi dấu.",
    "priority": "B",
    "grade": 12,
    "moduleId": "calculus",
    "is3D": false
  },
  {
    "id": "12.08",
    "source": "CTST tập 2 Ch.IV Bài 3, tr.21",
    "title": "Diện tích và thể tích tích phân",
    "simulation": "2D liên kết 3D: tô miền, quét lát cắt, quay tạo khối tròn xoay.",
    "goal": "Diện tích cần trị tuyệt đối; bán kính và cận phải đúng.",
    "priority": "A",
    "grade": 12,
    "moduleId": "calculus",
    "is3D": true
  },
  {
    "id": "12.09",
    "source": "CTST tập 2 Ch.V Bài 1, tr.32",
    "title": "Phương trình mặt phẳng",
    "simulation": "3D: đổi pháp tuyến, điểm qua và hệ số; hiện giao với các trục.",
    "goal": "Pháp tuyến khác vectơ không; tránh coi hệ số tự do là tọa độ.",
    "priority": "A",
    "grade": 12,
    "moduleId": "calculus",
    "is3D": true
  },
  {
    "id": "12.10",
    "source": "CTST tập 2 Ch.V Bài 2, tr.43",
    "title": "Đường thẳng trong không gian",
    "simulation": "3D: đổi điểm qua và vectơ chỉ phương; đo góc, tìm vị trí tương đối.",
    "goal": "Vectơ chỉ phương khác không; trường hợp tọa độ bằng 0 trong dạng chính tắc.",
    "priority": "A",
    "grade": 12,
    "moduleId": "conics_and_solids",
    "is3D": true
  },
  {
    "id": "12.11",
    "source": "CTST tập 2 Ch.V Bài 3, tr.61",
    "title": "Phương trình mặt cầu",
    "simulation": "3D: kéo tâm, thay r, cắt mặt cầu bằng mặt phẳng.",
    "goal": "r dương; mặt cắt có thể rỗng, một điểm hoặc đường tròn.",
    "priority": "A",
    "grade": 12,
    "moduleId": "conics_and_solids",
    "is3D": true
  },
  {
    "id": "12.12",
    "source": "CTST tập 2 Ch.VI Bài 1 và 2, tr.69, 75",
    "title": "Xác suất có điều kiện và Bayes",
    "simulation": "2D: lọc quần thể, cây xác suất, đổi tỉ lệ ban đầu.",
    "goal": "P(A|B) khác P(B|A); xác định lại mẫu số và điều kiện dương.",
    "priority": "B",
    "grade": 12,
    "moduleId": "probability",
    "is3D": false
  }
];

export function filterStations(
  catalog: StationItem[],
  query: string,
  gradeFilter: number | null,
  dimensionFilter: "all" | "2d" | "3d",
  priorityFilter: "all" | "A" | "B" | "C"
): StationItem[] {
  const normQuery = removeVietnameseAccents(query.trim());
  return catalog.filter((st) => {
    if (gradeFilter !== null && st.grade !== gradeFilter) return false;
    if (dimensionFilter === "2d" && st.is3D) return false;
    if (dimensionFilter === "3d" && !st.is3D) return false;
    if (priorityFilter !== "all" && st.priority !== priorityFilter) return false;
    if (!normQuery) return true;

    const hay = removeVietnameseAccents(`${st.id} ${st.title} ${st.source} ${st.goal} ${st.simulation}`);
    return hay.includes(normQuery);
  });
}

export function getStationById(id: string): StationItem | undefined {
  return STATION_CATALOG.find((s) => s.id === id);
}

export function getAllStations(): StationItem[] {
  return STATION_CATALOG;
}
