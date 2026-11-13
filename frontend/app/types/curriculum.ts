// Cấu trúc ba chuyên đề cốt lõi của MathSTEP (chuẩn GDPT 2018)
import { TRIG_LESSONS } from "../data/trigonometryLessons";
import { ALL_LESSONS as DETAILED_CURRICULUM } from "../data/lessons-registry";

// Module 1: Bất phương trình & Quy hoạch tuyến tính (Toán 10)
// Module 2: Dựng hình và khảo sát quan hệ Hình học không gian 3D (Toán 11)
// Module 3: Khảo sát các quan hệ Lượng giác tương tác (Toán 11)

export type ModuleCategory = "linear_programming" | "spatial_geometry" | "trigonometry";

export interface LessonStep {
  stepNumber: number;
  title: string;
  instruction: string;
  taskCode?: string;
  coreConcepts: string[];
  keyFormulas?: string[];
  socraticQuestions: string[];
}

export interface LessonUnit {
  id: string;
  moduleId: ModuleCategory;
  order: number;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  grade: 10 | 11;
  difficulty: "Cơ bản" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
  steps: LessonStep[];
  errorCodes: string[];
}

export interface CoreModuleConfig {
  id: ModuleCategory;
  number: number;
  code: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  grade: 10 | 11;
  color: string;
  accentColor: string;
  badgeLabel: string;
  standardCodes: string[];
  lessons: LessonUnit[];
}

export const CORE_3_MODULES: CoreModuleConfig[] = [
  // =========================================================================
  // MODULE 1: BẤT PHƯƠNG TRÌNH & QUY HOẠCH TUYẾN TÍNH (TOÁN 10)
  // =========================================================================
  {
    id: "linear_programming",
    number: 1,
    code: "CD01",
    title: "Chuyên đề 1: Bất Phương Trình & Quy Hoạch Tuyến Tính",
    shortTitle: "1. BPT & Tối Ưu",
    subtitle: "Trực quan hóa nửa mặt phẳng Oxy, miền đa giác lồi & bài toán xưởng mộc tối ưu",
    description:
      "Chuyển đổi ngôn ngữ tự nhiên sang đại số nghiệm, thực hành quy trình 7 bước chuẩn SGK, xác định các đỉnh đa giác và tìm giá trị lớn nhất của hàm mục tiêu F(x, y).",
    grade: 10,
    color: "#2563EB",
    accentColor: "blue",
    badgeLabel: "Toán 10 · GDPT 2018",
    standardCodes: ["M01-M17", "E01-E10"],
    lessons: [
      {
        id: "lp-lesson-1",
        moduleId: "linear_programming",
        order: 1,
        code: "BÀI 1",
        title: "Bất phương trình bậc nhất hai ẩn & Nửa mặt phẳng bờ (d)",
        subtitle: "Nhận diện hệ số a, b, c và tính chất vô số nghiệm",
        description: "Phân tích điều kiện a^2 + b^2 > 0, kiểm tra điểm thử M(x0; y0), xác định nửa mặt phẳng nghiệm bờ d.",
        grade: 10,
        difficulty: "Cơ bản",
        errorCodes: ["M01", "M04", "M05"],
        steps: [
          {
            stepNumber: 1,
            title: "Nhận dạng hệ số đại số",
            instruction: "Xác định các hệ số a, b, c trong ax + by <= c và kiểm tra điều kiện a^2 + b^2 > 0.",
            coreConcepts: ["Dạng chuẩn BPT bậc nhất hai ẩn", "Tập nghiệm là một nửa mặt phẳng lấp đầy"],
            socraticQuestions: ["Vì sao a và b không được đồng thời bằng 0?", "Tập nghiệm của BPT khác tập nghiệm của phương trình như thế nào?"],
          },
          {
            stepNumber: 2,
            title: "Kiểm tra nghiệm bằng điểm thử M",
            instruction: "Thay tọa độ điểm M(x0; y0) vào vế trái LHS và so sánh với vế phải RHS.",
            coreConcepts: ["Đại số nghiệm", "Mệnh đề đúng/sai"],
            socraticQuestions: ["Điểm O(0,0) có luôn là điểm thử phù hợp không?", "Khi đường bờ đi qua gốc tọa độ O thì phải chọn điểm thử nào?"],
          },
        ],
      },
      {
        id: "lp-lesson-2",
        moduleId: "linear_programming",
        order: 2,
        code: "BÀI 2",
        title: "Quy trình 7 bước biểu diễn miền nghiệm chuẩn SGK",
        subtitle: "Vẽ đường bờ nét liền/đứt và gạch bỏ miền không thỏa mãn",
        description: "Thực hành lần lượt 7 thao tác: Hệ số -> Kiểu nét -> 2 Điểm A, B -> Vẽ đường thẳng -> Chọn điểm thử -> Xác định miền nghiệm -> Kết luận.",
        grade: 10,
        difficulty: "Thông hiểu",
        errorCodes: ["M06", "M07", "M08", "E01", "E04"],
        steps: [
          {
            stepNumber: 1,
            title: "Vẽ đường thẳng bờ d",
            instruction: "Xác định 2 điểm cắt trục A(c/a, 0) và B(0, c/b) rồi vẽ đường thẳng kéo dài vô hạn.",
            coreConcepts: ["Quy ước nét liền (<=, >=) và nét đứt (<, >)", "Đường thẳng chia mặt phẳng làm hai nửa"],
            socraticQuestions: ["Nếu chỉ vẽ đoạn thẳng ngắn giữa hai trục thì có chia được mặt phẳng không?", "Khi nào phải vẽ nét đứt?"],
          },
          {
            stepNumber: 2,
            title: "Gạch bỏ nửa mặt phẳng không phải nghiệm",
            instruction: "Giữ trắng phần mặt phẳng nghiệm theo đúng quy ước sách giáo khoa Việt Nam.",
            coreConcepts: ["Quy ước giữ trắng miền nghiệm", "Phản ví dụ kiểm chứng"],
            socraticQuestions: ["Mẹo 'lớn phải nhỏ trái' có đúng khi hệ số của x âm không?", "Tại sao cần kiểm tra điểm thử thay vì nhớ mẹo?"],
          },
        ],
      },
      {
        id: "lp-lesson-3",
        moduleId: "linear_programming",
        order: 3,
        code: "BÀI 3",
        title: "Hệ bất phương trình bậc nhất hai ẩn & Miền đa giác lồi",
        subtitle: "Giao các nửa mặt phẳng nghiệm và tìm tọa độ các đỉnh",
        description: "Xác lập hệ từ 2 đến 5 ràng buộc, tìm giao điểm các đường bờ và xác định các đỉnh đa giác lồi.",
        grade: 10,
        difficulty: "Vận dụng",
        errorCodes: ["M02", "M09", "M10", "E05"],
        steps: [
          {
            stepNumber: 1,
            title: "Giao các nửa mặt phẳng",
            instruction: "Lần lượt gạch bỏ các miền không thỏa mãn từng BPT trong hệ.",
            coreConcepts: ["Phần chung của các miền nghiệm", "Miền phương án là đa giác lồi bị chặn"],
            socraticQuestions: ["Một cặp số chỉ thỏa mãn 1 BPT đầu thì có phải nghiệm của cả hệ không?", "Làm sao tránh rối hình khi gạch nhiều đường?"],
          },
          {
            stepNumber: 2,
            title: "Giải hệ phương trình tìm tọa độ các đỉnh",
            instruction: "Lập hệ 2 phương trình của 2 đường thẳng bờ cắt nhau để tìm tọa độ chính xác từng đỉnh.",
            coreConcepts: ["Tọa độ chính xác tuyệt đối", "Không ước lượng bằng mắt"],
            socraticQuestions: ["Vì sao không nên gióng bằng mắt từ hình vẽ tay xuống hai trục tọa độ?"],
          },
        ],
      },
      {
        id: "lp-lesson-4",
        moduleId: "linear_programming",
        order: 4,
        code: "BÀI 4",
        title: "Mô hình hóa thực tiễn: Bài toán Xưởng mộc tối ưu",
        subtitle: "Bài toán thực tiễn chuẩn SGK Kết nối tri thức (Trang 26-30)",
        description: "Mô hình hóa bài toán sản xuất bàn và ghế: 3x+2y <= 48, x+2y <= 32, 7x-2y >= 0, max F(x,y) = 600x + 450y.",
        grade: 10,
        difficulty: "Vận dụng cao",
        errorCodes: ["M11", "M12", "M13", "M14"],
        steps: [
          {
            stepNumber: 1,
            title: "Thiết lập mô hình đại số đồng nhất đơn vị",
            instruction: "Gọi ẩn x (số bàn), y (số ghế), đặt điều kiện x, y thuộc N, lập hệ ràng buộc giờ công và tỷ lệ.",
            coreConcepts: ["Nguyên tắc đồng nhất đơn vị", "Điều kiện thực tế nguyên x, y in N"],
            socraticQuestions: ["Tổng thời gian 'không quá 24 giờ' tương ứng với dấu bất đẳng thức nào?", "Biểu thức tiền lãi F có nằm trong hệ BPT không?"],
          },
          {
            stepNumber: 2,
            title: "Tính giá trị F(x, y) tại các đỉnh và kết luận",
            instruction: "Xác định 4 đỉnh khả thi O(0; 0), A(16; 0), B(8; 12), C(4; 14) (loại điểm (0; 16) do vi phạm y <= 3.5x), tính F(O), F(A), F(B), F(C) để tìm giá trị lớn nhất tại đỉnh B(8; 12) = 10.200 nghìn đồng.",
            coreConcepts: ["Định lý cực trị trên tập lồi", "3 phương diện Looking back của Polya"],
            socraticQuestions: ["Nếu tiền lãi mỗi chiếc bàn thay đổi thì miền đa giác OABC có thay đổi không?", "Với miền phương án OABC bị chặn, vì sao chỉ cần tính hàm mục tiêu tại các đỉnh?"],
          },
        ],
      },
      {
        id: "lp-lesson-5",
        moduleId: "linear_programming",
        order: 5,
        code: "BÀI 5",
        title: "Luyện tập & Chẩn đoán lỗi nhận thức",
        subtitle: "40 bài tập tương tác để luyện tập và nhận biết lỗi thường gặp",
        description: "Tự rèn luyện các dạng bài tập phân loại theo 4 mức độ nhận thức GDPT 2018, nhận diện và khắc phục lỗi tức thì.",
        grade: 10,
        difficulty: "Vận dụng",
        errorCodes: ["M01-M17", "E01-E10"],
        steps: [
          {
            stepNumber: 1,
            title: "Kiểm tra chẩn đoán",
            instruction: "Làm bài tập và xem gợi ý theo từng bước khi cần.",
            coreConcepts: ["Chẩn đoán lỗi Newman", "Học tập phản tư"],
            socraticQuestions: ["Em đã kiểm tra lại điều kiện nghiệm với bối cảnh thực tế chưa?"],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // MODULE 2: HÌNH HỌC KHÔNG GIAN 3D (TOÁN 11)
  // =========================================================================
  {
    id: "spatial_geometry",
    number: 2,
    code: "CD02",
    title: "Chuyên đề 2: Dựng Hình & Quan Hệ Không Gian 3D",
    shortTitle: "2. Hình Học Không Gian",
    subtitle: "Dựng hình đúng giả thiết, khảo sát xoay 360°, nét thấy/khuất, thiết diện & trải hình",
    description:
      "Nhiệm vụ trọng tâm SG-M2-01: Chóp S.ABCD đáy hình bình hành, tâm O, M là trung điểm SA, N trên SB với tỉ số 2:1. Phân biệt quan sát với chứng minh toán học.",
    grade: 11,
    color: "#059669",
    accentColor: "emerald",
    badgeLabel: "Toán 11 · GDPT 2018",
    standardCodes: ["SG01-SG16", "Task SG-M2-01"],
    lessons: [
      {
        id: "sg-lesson-1",
        moduleId: "spatial_geometry",
        order: 1,
        code: "BÀI 1",
        title: "Đọc đề & Dựng hình chóp S.ABCD đúng giả thiết",
        subtitle: "Dựng hình theo giả thiết và giữ đúng các quan hệ hình học",
        description: "Chuyển giả thiết thành ràng buộc tọa độ: 4 đỉnh A, B, C, D quanh đáy, đỉnh S nằm ngoài mặt phẳng đáy, không tự thêm góc vuông.",
        grade: 11,
        difficulty: "Cơ bản",
        errorCodes: ["SG01", "SG02", "SG03", "SG06"],
        steps: [
          {
            stepNumber: 1,
            title: "Trích xuất đối tượng và ràng buộc",
            instruction: "Nhận diện đỉnh S, đáy ABCD là hình bình hành, dựng D = A + C - B sao cho ABCD đồng phẳng không suy biến.",
            coreConcepts: ["Điều kiện xác định hình chóp", "Không tự thêm tính đều hay vuông góc (SG02)"],
            socraticQuestions: ["Đề bài cho đáy hình bình hành, ta có được tự ý xem đáy là hình chữ nhật không?", "Điều kiện để đỉnh S tạo thành hình chóp là gì?"],
          },
          {
            stepNumber: 2,
            title: "Dựng tâm đáy O của hình bình hành",
            instruction: "Xác định giao điểm hai đường chéo AC và BD, thỏa O = (A + C)/2 = (B + D)/2.",
            coreConcepts: ["Tâm đối xứng hình bình hành", "Trung điểm hai đường chéo"],
            socraticQuestions: ["Vì sao O phải thuộc đồng thời cả hai đoạn AC và BD?"],
          },
        ],
      },
      {
        id: "sg-lesson-2",
        moduleId: "spatial_geometry",
        order: 2,
        code: "BÀI 2",
        title: "Dựng trung điểm M và Điểm chia đoạn N (Tỉ số 2:1)",
        subtitle: "Quan hệ phụ thuộc tọa độ và cập nhật tức thời khi kéo đỉnh S",
        description: "Dựng điểm M là trung điểm của cạnh bên SA và điểm N trên SB thỏa mãn SN : NB = 2 : 1 (SN = 2/3 SB).",
        grade: 11,
        difficulty: "Thông hiểu",
        errorCodes: ["SG04", "SG05"],
        steps: [
          {
            stepNumber: 1,
            title: "Dựng trung điểm M trên đoạn SA",
            instruction: "Xác định tọa độ M = (S + A)/2. Điểm M phải nằm trên đoạn SA, không nằm ngoài đoạn.",
            coreConcepts: ["Đoạn thẳng giới hạn bởi 2 đầu mút", "Tọa độ trung điểm"],
            socraticQuestions: ["Điểm nằm trên đường thẳng chứa cạnh nhưng ngoài đoạn cạnh có hợp lệ không?"],
          },
          {
            stepNumber: 2,
            title: "Dựng điểm chia đoạn N thỏa SN : NB = 2 : 1",
            instruction: "Tính tọa độ N = S + (2/3)*(B - S). Điểm N nằm gần B hơn hay gần S hơn?",
            coreConcepts: ["Thứ tự tỉ số chia đoạn", "N nằm trong đoạn SB"],
            socraticQuestions: ["Tỉ số SN:NB = 2:1 nghĩa là đoạn SN dài gấp mấy lần NB? Điểm N gần đầu mút nào hơn?"],
          },
        ],
      },
      {
        id: "sg-lesson-3",
        moduleId: "spatial_geometry",
        order: 3,
        code: "BÀI 3",
        title: "Khảo sát xoay 360° & Nét thấy - Nét khuất",
        subtitle: "Phân biệt quan sát góc nhìn với chứng minh bản chất toán học",
        description: "Xoay khối chóp quanh các trục, quan sát nét liền và nét đứt thay đổi theo góc nhìn; nhận diện hai đường chéo nhau nhìn như cắt nhau.",
        grade: 11,
        difficulty: "Thông hiểu",
        errorCodes: ["SG07", "SG08", "SG16"],
        steps: [
          {
            stepNumber: 1,
            title: "Xoay quan sát nét thấy và nét khuất",
            instruction: "Xoay hình để thấy cạnh SA bị che chuyển thành nét thấy khi đổi góc nhìn. Nét khuất không phải thuộc tính cố định.",
            coreConcepts: ["Nét thấy (Solid) và nét khuất (Dashed)", "Bảo toàn cấu hình khi đổi góc nhìn"],
            socraticQuestions: ["Khi đổi góc nhìn, quan hệ hình học của các đoạn thẳng trong không gian có thay đổi không?", "Nét đứt có phải là ký hiệu song song không?"],
          },
          {
            stepNumber: 2,
            title: "Khám phá phản ví dụ hai đường chéo nhau",
            instruction: "Khảo sát AB và SD: ở một góc nhìn ảnh của chúng cắt nhau nhưng thực tế chúng chéo nhau trong không gian.",
            coreConcepts: ["Hai đường thẳng chéo nhau", "Hình chiếu giao nhau không suy ra cắt nhau"],
            socraticQuestions: ["Hai đường nhìn như cắt nhau trên màn hình có nhất thiết có điểm chung trong không gian không?"],
          },
        ],
      },
      {
        id: "sg-lesson-4",
        moduleId: "spatial_geometry",
        order: 4,
        code: "BÀI 4",
        title: "Mặt phẳng cắt & Thiết diện đa giác lồi",
        subtitle: "Mặt phẳng qua M song song đáy cắt hình chóp theo thiết diện MPQR",
        description: "Xác định giao tuyến của mặt phẳng cắt với các mặt của khối đa diện, nối các đoạn biên theo đúng quan hệ kề không tự cắt.",
        grade: 11,
        difficulty: "Vận dụng",
        errorCodes: ["SG09", "SG10", "SG11"],
        steps: [
          {
            stepNumber: 1,
            title: "Xác định giao điểm trên các cạnh bên",
            instruction: "Mặt phẳng song song đáy qua M cắt SB, SC, SD lần lượt tại P, Q, R là trung điểm các cạnh bên.",
            coreConcepts: ["Định lý giao tuyến song song", "Giao điểm thuộc đoạn cạnh"],
            socraticQuestions: ["Điểm N của đề bài (tỉ số 2:1) có thuộc mặt phẳng thiết diện đi qua trung điểm M không?"],
          },
          {
            stepNumber: 2,
            title: "Khép kín đa giác thiết diện MPQR",
            instruction: "Nối các đoạn giao tuyến M-P, P-Q, Q-R, R-M tạo thành thiết diện hình bình hành có diện tích dương.",
            coreConcepts: ["Đa giác thiết diện lồi", "Đoạn biên nằm trên các mặt của khối"],
            socraticQuestions: ["Giao điểm trên phần kéo dài ngoài cạnh có được lấy làm đỉnh thiết diện không?"],
          },
        ],
      },
      {
        id: "sg-lesson-5",
        moduleId: "spatial_geometry",
        order: 5,
        code: "BÀI 5",
        title: "Trải phẳng (Unfolding), Tách-gộp hình & Thử thách chuyển giao",
        subtitle: "Bảo toàn kích thước từng mặt, kiểm tra không chồng lấn và hoàn thành các bài B-01 đến B-05",
        description: "Thực hành trải phẳng các mặt của khối hình học ra cùng một mặt phẳng 2D, khôi phục cấu hình gốc và xử lý các bài toán tương tự.",
        grade: 11,
        difficulty: "Vận dụng cao",
        errorCodes: ["SG12", "SG13", "SG14", "SG15"],
        steps: [
          {
            stepNumber: 1,
            title: "Trải phẳng các mặt không biến dạng",
            instruction: "Mở các mặt tam giác bên xoay quanh cạnh đáy, bảo toàn độ dài cạnh và diện tích từng mặt.",
            coreConcepts: ["Chuyển động cứng không biến dạng", "Điều kiện bản trải không chồng lấn"],
            socraticQuestions: ["Khi trải hình, góc giữa các mặt có giữ nguyên không? Kích thước từng mặt có đổi không?"],
          },
          {
            stepNumber: 2,
            title: "Bài tập chuyển giao độc lập (B-01 đến B-05)",
            instruction: "Giải bài toán thay đổi tỉ số chia đoạn thành SN:NB = 1:2 và dựng hình trên lăng trụ tam giác.",
            coreConcepts: ["Nhiệm vụ chuyển giao", "Tự lực giải quyết vấn đề"],
            socraticQuestions: ["Nếu tỉ số đổi thành 1:2 thì điểm N di chuyển về phía đầu mút nào?"],
          },
        ],
      },
    ],
  },

  // =========================================================================
  // MODULE 3: LƯỢNG GIÁC TƯƠNG TÁC (TOÁN 11)
  // =========================================================================
  {
    id: "trigonometry",
    number: 3,
    code: "CD03",
    title: "Chuyên đề 3: Khảo Sát Các Quan Hệ Lượng Giác",
    shortTitle: "3. Lượng Giác",
    subtitle: "Liên kết Đường tròn đơn vị, Cung liên kết, Đồ thị sóng sin/cos & Phương trình lượng giác",
    description:
      "13 bài LG01–LG13: từ góc và giá trị lượng giác đến công thức biến đổi, đồ thị, phương trình và mô hình hóa thực tiễn. Mỗi bài có lý thuyết, ví dụ và mô phỏng khám phá.",
    grade: 11,
    color: "#7C3AED",
    accentColor: "purple",
    badgeLabel: "Toán 11 · GDPT 2018",
    standardCodes: ["E01-E16", "LG01-LG13", "KT01-KT06"],
    lessons: TRIG_LESSONS,
  },
];

// Use the detailed CD02/CD03 curriculum as the single source for the public
// lesson lists, generated routes, syllabus counts, and next-lesson navigation.
const detailedUnits: LessonUnit[] = DETAILED_CURRICULUM.map((lesson) => ({
  id: lesson.id,
  moduleId: lesson.moduleId === "CD02" ? "spatial_geometry" : "trigonometry",
  order: lesson.moduleId === "CD02"
    ? DETAILED_CURRICULUM.filter((item) => item.moduleId === "CD02").findIndex((item) => item.id === lesson.id) + 1
    : DETAILED_CURRICULUM.filter((item) => item.moduleId === "CD03").findIndex((item) => item.id === lesson.id) + 1,
  code: lesson.code,
  title: lesson.title,
  subtitle: lesson.shortDesc,
  description: lesson.shortDesc,
  grade: 11,
  difficulty: lesson.level as LessonUnit["difficulty"],
  errorCodes: [],
  steps: lesson.steps.map((step) => ({
    stepNumber: step.stepNumber,
    title: step.title,
    instruction: step.instruction,
    coreConcepts: [step.pedagogicalNote].filter(Boolean),
    keyFormulas: [step.formula].filter(Boolean),
    socraticQuestions: [step.hints.level1, step.hints.level2, step.hints.level3].filter(Boolean),
  })),
}));

CORE_3_MODULES.find((module) => module.id === "spatial_geometry")!.lessons = detailedUnits.filter((lesson) => lesson.moduleId === "spatial_geometry");
CORE_3_MODULES.find((module) => module.id === "trigonometry")!.lessons = detailedUnits.filter((lesson) => lesson.moduleId === "trigonometry");
