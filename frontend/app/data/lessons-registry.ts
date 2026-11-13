// Extracted from the curriculum specification in the repository root.
export type LessonScalar=string|number; export interface CurriculumStep {stepNumber:number;title:string;subtitle:string;instruction:string;formula:string;targetValue:LessonScalar;unit:string;tolerance:number;pedagogicalNote:string;hints:{level1:string;level2:string;level3:string};sceneState:Record<string,unknown>} export interface SampleProblem{id:string;label:string;expression:string;tag:string;solutionSummary:string;presetParams:Record<string,unknown>} export interface CurriculumLesson{id:string;moduleId:"CD02"|"CD03";code:string;level:string;title:string;shortDesc:string;xp:number;sceneType:string;steps:CurriculumStep[];sampleProblems:SampleProblem[]}
export const ALL_LESSONS: CurriculumLesson[] = [
  {
    "id": "cd02-bai-1",
    "moduleId": "CD02",
    "code": "Bai 1",
    "level": "Cơ bản",
    "title": "Đọc đề & Dựng hình chóp $S.ABCD$ đúng giả thiết",
    "shortDesc": "Dựng hình chóp đáy hình bình hành, $SA \\perp (ABCD)$ và bảo toàn quan hệ hình học khi kéo đỉnh $S$.",
    "xp": 60,
    "sceneType": "pyramid-setup",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Xác định cấu trúc đáy",
        "subtitle": "Tứ giác ABCD trên mặt phẳng (Oxy)",
        "instruction": "Chọn loại đáy là hình bình hành tâm $O$ với cạnh $AB = 4$, $AD = 3$, góc $\\widehat{BAD} = 60^\\circ$.",
        "formula": "$ABCD \\text{ là hình bình hành } \\Rightarrow \\vec{AB} = \\vec{DC}$",
        "targetValue": "parallelogram",
        "unit": "Hình bình hành",
        "tolerance": 0.0,
        "pedagogicalNote": "Trong không gian, hình bình hành được biểu diễn bởi hình bình hành. Hai đường chéo $AC, BD$ cắt nhau tại trung điểm $O$ của mỗi đường.",
        "hints": {
          "level1": "Đọc kỹ giả thiết đáy: tứ giác có các cặp cạnh đối song song và bằng nhau.",
          "level2": "Chọn chế độ đáy \"Hình bình hành\" trên bảng điều khiển.",
          "level3": "Bấm chọn \"Hình bình hành\" và kiểm tra 4 đỉnh $A, B, C, D$ đồng phẳng trên lưới $(Oxy)$."
        },
        "sceneState": {
          "sceneType": "pyramid-setup",
          "stepNumber": 1,
          "focus": "Xác định cấu trúc đáy",
          "targetValue": "parallelogram",
          "unit": "Hình bình hành"
        }
      },
      {
        "stepNumber": 2,
        "title": "Dựng đường cao $SA \\perp (ABCD)$",
        "subtitle": "Chiều cao h = SA = 4",
        "instruction": "Điều chỉnh thanh trượt chiều cao $SA = 4$ sao cho đoạn $SA$ vuông góc với mặt phẳng đáy tại $A$.",
        "formula": "$SA \\perp (ABCD) \\Rightarrow SA \\perp AB \\text{ và } SA \\perp AD$",
        "targetValue": 4,
        "unit": "đvđd",
        "tolerance": 0.0,
        "pedagogicalNote": "Khi $SA \\perp (ABCD)$, $SA$ phải được vẽ thẳng đứng trên trang giấy và vuông góc với mọi đường thẳng nằm trong đáy.",
        "hints": {
          "level1": "Đường cao xuất phát từ đỉnh $S$ hạ vuông góc xuống đúng đỉnh $A$ của đáy.",
          "level2": "Kéo thanh trượt $SA$ đến giá trị $4.0$ và bật khóa vuông góc $SA \\perp (ABCD)$.",
          "level3": "Đặt $SA = 4$, quan sát ký hiệu góc vuông tại $A$ trên cạnh $AB$ và $AD$."
        },
        "sceneState": {
          "sceneType": "pyramid-setup",
          "stepNumber": 2,
          "focus": "Dựng đường cao $SA \\perp (ABCD)$",
          "targetValue": 4,
          "unit": "đvđd, sai số cho phép $\\pm 0.1$"
        }
      },
      {
        "stepNumber": 3,
        "title": "Phân loại nét thấy và nét khuất",
        "subtitle": "Quy tắc biểu diễn hình không gian",
        "instruction": "Xác định số cạnh bao khuất (nét đứt) của hình chóp $S.ABCD$ ở góc nhìn chuẩn từ phía trước.",
        "formula": "$\\text{Cạnh bao khuất: } SA, AB, AD \\text{ (cùng các đường chéo đáy } AC, BD\\text{)}$",
        "targetValue": 3,
        "unit": "cạnh bao khuất",
        "tolerance": 0.0,
        "pedagogicalNote": "Ở góc nhìn chuẩn mặt trước là $(SCD)$ và $(SBC)$, các cạnh bao bị che khuất là $SA$, $AB$, $AD$.",
        "hints": {
          "level1": "Quan sát từ hướng nhìn chính diện, các mặt $(SCD)$ và $(SBC)$ che khuất phần phía sau.",
          "level2": "Các cạnh xuất phát từ đỉnh $A$ nằm ở phía sau nên đều bị che khuất.",
          "level3": "Nhập số cạnh bao khuất là `3` (gồm $SA, AB, AD$)."
        },
        "sceneState": {
          "sceneType": "pyramid-setup",
          "stepNumber": 3,
          "focus": "Phân loại nét thấy và nét khuất",
          "targetValue": 3,
          "unit": "cạnh bao khuất"
        }
      },
      {
        "stepNumber": 4,
        "title": "Tính độ dài cạnh bên $SC$",
        "subtitle": "Áp dụng định lý Pytago hai lần",
        "instruction": "Với đáy hình chữ nhật $AB = 3, AD = 4$ và $SA = 12$, tính độ dài cạnh bên $SC$.",
        "formula": "",
        "targetValue": 13,
        "unit": "đvđd",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì $SA \\perp (ABCD)$ nên $SA \\perp AC$, tam giác $SAC$ luôn vuông tại $A$.",
        "hints": {
          "level1": "Tính đường chéo đáy $AC$ trước bằng tam giác vuông $ABC$.",
          "level2": "$AC = \\sqrt{3^2 + 4^2} = 5$. Sau đó xét tam giác $SAC$ vuông tại $A$.",
          "level3": "$SC = \\sqrt{12^2 + 5^2} = \\sqrt{169} = 13$. Nhập `13`."
        },
        "sceneState": {
          "sceneType": "pyramid-setup",
          "stepNumber": 4,
          "focus": "Tính độ dài cạnh bên $SC$",
          "targetValue": 13,
          "unit": "đvđd"
        }
      },
      {
        "stepNumber": 5,
        "title": "Kiểm tra tính bất biến khi kéo đỉnh $S$",
        "subtitle": "Khảo sát động trên mô hình 3D",
        "instruction": "Kéo đỉnh $S$ thay đổi độ cao từ $2$ đến $8$ và xác nhận góc $\\widehat{SAB}$ luôn bằng bao nhiêu độ.",
        "formula": "$SA \\perp (ABCD) \\Rightarrow \\widehat{SAB} = 90^\\circ \\ (\\forall SA > 0)$",
        "targetValue": 90,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Quan hệ vuông góc $SA \\perp (ABCD)$ là bất biến hình học: dù thay đổi chiều cao $SA$, góc $\\widehat{SAB}$ vẫn luôn bằng $90^\\circ$.",
        "hints": {
          "level1": "Quan sát số đo góc $\\widehat{SAB}$ trên khung 3D khi kéo thanh trượt $SA$.",
          "level2": "Do $AB \\subset (ABCD)$ mà $SA \\perp (ABCD)$ nên $SA \\perp AB$.",
          "level3": "Nhập `90` vào ô đáp án."
        },
        "sceneState": {
          "sceneType": "pyramid-setup",
          "stepNumber": 5,
          "focus": "Kiểm tra tính bất biến khi kéo đỉnh $S$",
          "targetValue": 90,
          "unit": "độ"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-1-example-a",
        "label": "V? d? A",
        "expression": "Hình chóp $S.ABCD$ đáy vuông cạnh $a=4, SA=3$.",
        "tag": "SGK Chuẩn",
        "solutionSummary": "Hình chóp $S.ABCD$ đáy vuông cạnh $a=4, SA=3$.",
        "presetParams": {
          "sceneType": "pyramid-setup",
          "sampleId": "cd02-bai-1-example-a",
          "stepNumber": 1,
          "targetValue": "parallelogram"
        }
      },
      {
        "id": "cd02-bai-1-example-b",
        "label": "V? d? B",
        "expression": "Hình chóp $S.ABCD$ đáy chữ nhật $AB=6, AD=8, SA=10$.",
        "tag": "Tam giác vuông cân",
        "solutionSummary": "Hình chóp $S.ABCD$ đáy chữ nhật $AB=6, AD=8, SA=10$.",
        "presetParams": {
          "sceneType": "pyramid-setup",
          "sampleId": "cd02-bai-1-example-b",
          "stepNumber": 1,
          "targetValue": "parallelogram"
        }
      },
      {
        "id": "cd02-bai-1-example-c",
        "label": "V? d? C",
        "expression": "Hình chóp tứ giác đều $S.ABCD$ cạnh đáy $4$, chiều cao $SO=6$.",
        "tag": "Chóp đều",
        "solutionSummary": "Hình chóp tứ giác đều $S.ABCD$ cạnh đáy $4$, chiều cao $SO=6$.",
        "presetParams": {
          "sceneType": "pyramid-setup",
          "sampleId": "cd02-bai-1-example-c",
          "stepNumber": 1,
          "targetValue": "parallelogram"
        }
      }
    ]
  },
  {
    "id": "cd02-bai-2",
    "moduleId": "CD02",
    "code": "Bai 2",
    "level": "Thông hiểu",
    "title": "Dựng trung điểm $M$ và điểm chia đoạn $N$ (tỉ số $2:1$)",
    "shortDesc": "Quan hệ phụ thuộc tọa độ theo tỉ số chia đoạn và cập nhật tức thời khi kéo đỉnh $S$.",
    "xp": 70,
    "sceneType": "segment-ratio",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Dựng trung điểm $M$ của cạnh bên $SA$",
        "subtitle": "Tỉ số chia đoạn SM/SA = 0.5",
        "instruction": "Kéo thanh trượt điểm $M$ trên $SA$ về đúng vị trí trung điểm ($t_M = 0.5$).",
        "formula": "$\\vec{OM} = \\frac{1}{2}(\\vec{OS} + \\vec{OA}) \\Leftrightarrow \\frac{SM}{SA} = \\frac{1}{2}$",
        "targetValue": 0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Trung điểm $M$ chia đoạn $SA$ theo tỉ số $1:1$, tức $\\frac{SM}{SA} = 0.5$.",
        "hints": {
          "level1": "Trung điểm nằm chính giữa đoạn thẳng $SA$.",
          "level2": "Kéo thanh trượt $t_M$ đến mốc $0.50$.",
          "level3": "Đặt $t_M = 0.5$ để khóa trung điểm $M$."
        },
        "sceneState": {
          "sceneType": "segment-ratio",
          "stepNumber": 1,
          "focus": "Dựng trung điểm $M$ của cạnh bên $SA$",
          "targetValue": 0.5,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Dựng điểm $N$ trên $SB$ thỏa $SN : NB = 2 : 1$",
        "subtitle": "Quy đổi tỉ số SN/SB",
        "instruction": "Nếu $SN : NB = 2 : 1$ thì tỉ số $\\frac{SN}{SB}$ bằng bao nhiêu (làm tròn 2 chữ số thập phân)?",
        "formula": "$\\frac{SN}{NB} = \\frac{2}{1} \\Rightarrow \\frac{SN}{SB} = \\frac{2}{2+1} = \\frac{2}{3} \\approx 0.67$",
        "targetValue": 0.67,
        "unit": "sai số $\\pm 0.02$",
        "tolerance": 0.0,
        "pedagogicalNote": "Học sinh rất hay nhầm $SN:NB = 2:1$ thành $\\frac{SN}{SB} = \\frac{1}{2}$. Thực tế tổng số phần bằng nhau của $SB$ là $2 + 1 = 3$ phần.",
        "hints": {
          "level1": "Chia đoạn $SB$ thành $2 + 1 = 3$ phần bằng nhau, $SN$ chiếm $2$ phần.",
          "level2": "Tính $\\frac{SN}{SB} = \\frac{2}{3} \\approx 0.67$.",
          "level3": "Kéo thanh trượt $t_N$ đến $0.67$ (mốc $2/3$)."
        },
        "sceneState": {
          "sceneType": "segment-ratio",
          "stepNumber": 2,
          "focus": "Dựng điểm $N$ trên $SB$ thỏa $SN : NB = 2 : 1$",
          "targetValue": 0.67,
          "unit": "sai số $\\pm 0.02$"
        }
      },
      {
        "stepNumber": 3,
        "title": "Khảo sát vị trí tương đối của $MN$ và $AB$",
        "subtitle": "Xét trong mặt phẳng (SAB)",
        "instruction": "Khi $\\frac{SM}{SA} = \\frac{1}{2}$ và $\\frac{SN}{SB} = \\frac{2}{3}$, đường thẳng $MN$ cắt $AB$ tại giao điểm $I$. Tính tỉ số $\\frac{IA}{IB}$.",
        "formula": "",
        "targetValue": 2,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì $\\frac{SM}{SA} \\neq \\frac{SN}{SB}$ nên $MN$ không song song với $AB$; chúng đồng phẳng trong $(SAB)$ nên chắc chắn cắt nhau tại $I$.",
        "hints": {
          "level1": "Bật hiển thị đường kéo dài $MN$ và $AB$ trên khung 3D để thấy giao điểm $I$.",
          "level2": "Áp dụng định lý Menelaus cho cát tuyến $M-N-I$ cắt 3 cạnh $\\triangle SAB$: $\\frac{IA}{IB} \\cdot \\frac{NB}{NS} \\cdot \\frac{MS}{MA} = 1$.",
          "level3": "Thay $\\frac{NB}{NS} = \\frac{1}{2}$ và $\\frac{MS}{MA} = 1$, suy ra $\\frac{IA}{IB} = 2$."
        },
        "sceneState": {
          "sceneType": "segment-ratio",
          "stepNumber": 3,
          "focus": "Khảo sát vị trí tương đối của $MN$ và $AB$",
          "targetValue": 2,
          "unit": ""
        }
      },
      {
        "stepNumber": 4,
        "title": "Điều chỉnh $N$ để $MN \\parallel AB$",
        "subtitle": "Áp dụng định lý Ta-lét đảo",
        "instruction": "Kéo thanh trượt $t_N$ về giá trị bao nhiêu để $MN$ song song với $AB$ (giao điểm $I$ tiến ra vô cực)?",
        "formula": "$MN \\parallel AB \\Leftrightarrow \\frac{SN}{SB} = \\frac{SM}{SA} = 0.5$",
        "targetValue": 0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Khi $t_N = 0.5$, $MN$ trở thành đường trung bình của $\\triangle SAB$, khi đó $MN \\parallel AB$ và $MN = \\frac{1}{2}AB$.",
        "hints": {
          "level1": "Theo định lý Ta-lét đảo, hai tỉ số trên hai cạnh bên phải bằng nhau.",
          "level2": "Vì $M$ là trung điểm $SA$ ($t_M = 0.5$), $N$ cũng phải là trung điểm $SB$.",
          "level3": "Kéo thanh trượt $t_N$ về `0.5`."
        },
        "sceneState": {
          "sceneType": "segment-ratio",
          "stepNumber": 4,
          "focus": "Điều chỉnh $N$ để $MN \\parallel AB$",
          "targetValue": 0.5,
          "unit": ""
        }
      },
      {
        "stepNumber": 5,
        "title": "Kiểm chứng tính phụ thuộc tọa độ khi kéo đỉnh $S$",
        "subtitle": "Bất biến tỉ số chia đoạn",
        "instruction": "Giữ nguyên $t_M = 0.5, t_N = 0.67$, kéo đỉnh $S$ đến tọa độ bất kỳ. Tỉ số $\\frac{SN}{SB}$ thay đổi bao nhiêu?",
        "formula": "$\\vec{N} = (1 - t_N)\\vec{S} + t_N\\vec{B} \\Rightarrow \\frac{SN}{SB} = t_N = \\text{const}$",
        "targetValue": 0,
        "unit": "sai lệch",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì điểm $N$ được định nghĩa theo tổ hợp tuyến tính $(1-t)\\vec{S} + t\\vec{B}$, tỉ số chia đoạn luôn được bảo toàn bất chấp vị trí đỉnh $S$.",
        "hints": {
          "level1": "Kéo đỉnh $S$ tự do trên màn hình 3D và nhìn bảng thông số tỉ số.",
          "level2": "Tỉ số chia đoạn là bất biến của phép biến hình afin trong không gian.",
          "level3": "Độ sai lệch bằng `0`. Nhập `0`."
        },
        "sceneState": {
          "sceneType": "segment-ratio",
          "stepNumber": 5,
          "focus": "Kiểm chứng tính phụ thuộc tọa độ khi kéo đỉnh $S$",
          "targetValue": 0,
          "unit": "sai lệch"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-2-example-a",
        "label": "V? d? A",
        "expression": "$M$ trung điểm $SA$, $N \\in SB$ sao cho $SN = 2NB$.",
        "tag": "Chuẩn bài học",
        "solutionSummary": "$M$ trung điểm $SA$, $N \\in SB$ sao cho $SN = 2NB$.",
        "presetParams": {
          "sceneType": "segment-ratio",
          "sampleId": "cd02-bai-2-example-a",
          "stepNumber": 1,
          "targetValue": 0.5
        }
      },
      {
        "id": "cd02-bai-2-example-b",
        "label": "V? d? B",
        "expression": "$M, N$ lần lượt là trọng tâm $\\triangle SAB$ và $\\triangle SBC$.",
        "tag": "Vận dụng trọng tâm",
        "solutionSummary": "$M, N$ lần lượt là trọng tâm $\\triangle SAB$ và $\\triangle SBC$.",
        "presetParams": {
          "sceneType": "segment-ratio",
          "sampleId": "cd02-bai-2-example-b",
          "stepNumber": 1,
          "targetValue": 0.5
        }
      },
      {
        "id": "cd02-bai-2-example-c",
        "label": "V? d? C",
        "expression": "Điểm $N$ chia đoạn theo tỉ số $SN : NB = 1 : 3$.",
        "tag": "Đổi tỉ số",
        "solutionSummary": "Điểm $N$ chia đoạn theo tỉ số $SN : NB = 1 : 3$.",
        "presetParams": {
          "sceneType": "segment-ratio",
          "sampleId": "cd02-bai-2-example-c",
          "stepNumber": 1,
          "targetValue": 0.5
        }
      }
    ]
  },
  {
    "id": "cd02-bai-3",
    "moduleId": "CD02",
    "code": "Bai 3",
    "level": "Thông hiểu",
    "title": "Tìm giao tuyến hai mặt phẳng & Giao điểm đường thẳng – mặt phẳng",
    "shortDesc": "Phương pháp tìm 2 điểm chung và chọn mặt phẳng phụ chứa đường thẳng.",
    "xp": 75,
    "sceneType": "intersection-lines",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Tìm điểm chung thứ nhất của $(SAC)$ và $(SBD)$",
        "subtitle": "",
        "instruction": "Click chọn điểm chung dễ thấy nhất xuất hiện trong tên của cả hai mặt phẳng $(SAC)$ và $(SBD)$.",
        "formula": "$S \\in (SAC) \\cap (SBD)$",
        "targetValue": "S",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Luôn kiểm tra tên hai mặt phẳng trước: chữ cái trùng nhau chính là điểm chung thứ nhất.",
        "hints": {
          "level1": "Nhìn vào ký hiệu $(SAC)$ và $(SBD)$, đỉnh nào có mặt ở cả hai?",
          "level2": "Đỉnh $S$ thuộc cả hai mặt phẳng.",
          "level3": "Click vào đỉnh `S` trên mô hình 3D."
        },
        "sceneState": {
          "sceneType": "intersection-lines",
          "stepNumber": 1,
          "focus": "Tìm điểm chung thứ nhất của $(SAC)$ và $(SBD)$",
          "targetValue": "S",
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Tìm điểm chung thứ hai trên mặt đáy",
        "subtitle": "",
        "instruction": "Trong đáy tứ giác lồi $ABCD$, hai đường chéo $AC$ và $BD$ cắt nhau tại điểm nào?",
        "formula": "$O = AC \\cap BD \\Rightarrow \\begin{cases} O \\in AC \\subset (SAC) \\\\ O \\in BD \\subset (SBD) \\end{cases}$",
        "targetValue": "O",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Muốn tìm giao điểm hai đường thẳng trong không gian, chúng bắt buộc phải cùng nằm trong một mặt phẳng.",
        "hints": {
          "level1": "$AC \\subset (SAC)$ và $BD \\subset (SBD)$, cả hai đều nằm ở đáy $(ABCD)$.",
          "level2": "Giao điểm hai đường chéo đáy $ABCD$ là tâm $O$.",
          "level3": "Chọn điểm `O`."
        },
        "sceneState": {
          "sceneType": "intersection-lines",
          "stepNumber": 2,
          "focus": "Tìm điểm chung thứ hai trên mặt đáy",
          "targetValue": "O",
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Xác định đường giao tuyến $(SAC) \\cap (SBD)$",
        "subtitle": "",
        "instruction": "Nối $S$ và $O$ để dựng giao tuyến $SO$. Đoạn $SO$ được vẽ bằng nét liền hay nét đứt?",
        "formula": "$(SAC) \\cap (SBD) = SO$",
        "targetValue": "dashed",
        "unit": "Nét đứt",
        "tolerance": 0.0,
        "pedagogicalNote": "Đoạn $SO$ nằm hoàn toàn bên trong lòng khối chóp $S.ABCD$ nên bị các mặt bên che khuất, phải vẽ nét đứt.",
        "hints": {
          "level1": "Điểm $O$ nằm bên trong tứ giác đáy $ABCD$.",
          "level2": "Mọi đoạn thẳng nối từ đỉnh $S$ tới điểm bên trong đáy đều nằm trong khối chóp.",
          "level3": "Chọn \"Nét đứt\"."
        },
        "sceneState": {
          "sceneType": "intersection-lines",
          "stepNumber": 3,
          "focus": "Xác định đường giao tuyến $(SAC) \\cap (SBD)$",
          "targetValue": "dashed",
          "unit": "Nét đứt"
        }
      },
      {
        "stepNumber": 4,
        "title": "Tìm giao điểm của $MN$ với mặt phẳng $(SBD)$",
        "subtitle": "",
        "instruction": "Với $M \\in SA, N \\in SC$ ($MN$ không song song $AC$), chọn mặt phẳng phụ chứa $MN$ sao cho dễ tìm giao tuyến với $(SBD)$ nhất.",
        "formula": "$MN \\subset (SAC)$",
        "targetValue": "SAC",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì $M \\in SA$ và $N \\in SC$ nên mặt phẳng phụ tự nhiên nhất chứa $MN$ chính là $(SAC)$.",
        "hints": {
          "level1": "$M$ nằm trên cạnh $SA$, $N$ nằm trên cạnh $SC$.",
          "level2": "Hai cạnh $SA$ và $SC$ tạo nên mặt phẳng nào?",
          "level3": "Chọn mặt phẳng phụ `(SAC)`."
        },
        "sceneState": {
          "sceneType": "intersection-lines",
          "stepNumber": 4,
          "focus": "Tìm giao điểm của $MN$ với mặt phẳng $(SBD)$",
          "targetValue": "SAC",
          "unit": ""
        }
      },
      {
        "stepNumber": 5,
        "title": "Chốt giao điểm $K = MN \\cap (SBD)$",
        "subtitle": "",
        "instruction": "Trong mặt phẳng $(SAC)$, kéo dài $MN$ cắt giao tuyến $SO$ tại điểm $K$. Bật hiển thị điểm $K$ trên hình 3D.",
        "formula": "$K = MN \\cap SO \\Rightarrow \\begin{cases} K \\in MN \\\\ K \\in SO \\subset (SBD) \\end{cases} \\Rightarrow K = MN \\cap (SBD)$",
        "targetValue": "K",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Quy trình 3 bước chuẩn tìm giao điểm $d \\cap (P)$: (1) Chọn $(Q) \\supset d$; (2) Tìm $\\Delta = (Q) \\cap (P)$; (3) Chốt $K = d \\cap \\Delta$.",
        "hints": {
          "level1": "Giao tuyến của $(SAC)$ và $(SBD)$ là $SO$.",
          "level2": "Cho $MN$ cắt $SO$ trong mặt phẳng $(SAC)$.",
          "level3": "Xác nhận điểm `K`."
        },
        "sceneState": {
          "sceneType": "intersection-lines",
          "stepNumber": 5,
          "focus": "Chốt giao điểm $K = MN \\cap (SBD)$",
          "targetValue": "K",
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-3-example-a",
        "label": "V? d? A",
        "expression": "Giao tuyến $(SAB) \\cap (SCD)$ khi đáy $ABCD$ là hình thang ($AB \\parallel CD$).",
        "tag": "Giao tuyến song song",
        "solutionSummary": "Giao tuyến $(SAB) \\cap (SCD)$ khi đáy $ABCD$ là hình thang ($AB \\parallel CD$).",
        "presetParams": {
          "sceneType": "intersection-lines",
          "sampleId": "cd02-bai-3-example-a",
          "stepNumber": 1,
          "targetValue": "S"
        }
      },
      {
        "id": "cd02-bai-3-example-b",
        "label": "V? d? B",
        "expression": "Giao tuyến $(SAB) \\cap (SCD)$ khi $AB$ cắt $CD$ tại $E$.",
        "tag": "Đáy tứ giác thường",
        "solutionSummary": "Giao tuyến $(SAB) \\cap (SCD)$ khi $AB$ cắt $CD$ tại $E$.",
        "presetParams": {
          "sceneType": "intersection-lines",
          "sampleId": "cd02-bai-3-example-b",
          "stepNumber": 1,
          "targetValue": "S"
        }
      },
      {
        "id": "cd02-bai-3-example-c",
        "label": "V? d? C",
        "expression": "Giao điểm $AM \\cap (SBD)$ với $M$ là trung điểm $SC$.",
        "tag": "Bài toán kinh điển",
        "solutionSummary": "Giao điểm $AM \\cap (SBD)$ với $M$ là trung điểm $SC$.",
        "presetParams": {
          "sceneType": "intersection-lines",
          "sampleId": "cd02-bai-3-example-c",
          "stepNumber": 1,
          "targetValue": "S"
        }
      }
    ]
  },
  {
    "id": "cd02-bai-4",
    "moduleId": "CD02",
    "code": "Bai 4",
    "level": "Thông hiểu",
    "title": "Khảo sát xoay 360° & Phân biệt quan sát góc nhìn với chứng minh toán học",
    "shortDesc": "Loại bỏ ảo giác phối cảnh 2D bằng xoay 3D và định lý suy diễn chặt chẽ.",
    "xp": 70,
    "sceneType": "visual-illusion-360",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Thử thách ngộ nhận góc nhìn ban đầu",
        "subtitle": "",
        "instruction": "Cho hình chóp $S.ABCD$ đáy hình chữ nhật $AB = 3, BC = 4$, $SA = 4$, $SA \\perp (ABCD)$. Nhìn hình phối cảnh có vẻ $\\widehat{SBC}$ nhọn, hãy tính số đo thật của $\\widehat{SBC}$.",
        "formula": "$\\begin{cases} BC \\perp AB \\\\ BC \\perp SA \\end{cases} \\Rightarrow BC \\perp (SAB) \\Rightarrow BC \\perp SB \\Rightarrow \\widehat{SBC} = 90^\\circ$",
        "targetValue": 90,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Trên hình vẽ không gian, góc vuông $\\widehat{SBC}$ thường bị vẽ thành góc nhọn hoặc góc tù do phép chiếu song song.",
        "hints": {
          "level1": "Đừng đo góc bằng mắt trên hình nghiêng! Hãy xét quan hệ vuông góc của $BC$ với $(SAB)$.",
          "level2": "$BC \\perp AB$ và $BC \\perp SA$.",
          "level3": "Vì $BC \\perp (SAB)$ nên $BC \\perp SB$, vậy $\\widehat{SBC} = 90^\\circ$."
        },
        "sceneState": {
          "sceneType": "visual-illusion-360",
          "stepNumber": 1,
          "focus": "Thử thách ngộ nhận góc nhìn ban đầu",
          "targetValue": 90,
          "unit": "độ"
        }
      },
      {
        "stepNumber": 2,
        "title": "Xoay mô hình 360° kiểm tra chuyển đổi nét khuất",
        "subtitle": "",
        "instruction": "Kéo xoay khối chóp $180^\\circ$ sang mặt sau ($\\theta = 180^\\circ$) để quan sát cạnh $SA$ chuyển từ nét đứt sang nét liền.",
        "formula": "$\\vec{n}_{\\text{face}} \\cdot \\vec{v}_{\\text{cam}} > 0 \\Rightarrow \\text{Nét liền}$",
        "targetValue": 180,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Nét liền hay nét đứt không phải tính chất cố định của hình, mà phụ thuộc vào vị trí người quan sát.",
        "hints": {
          "level1": "Dùng chuột xoay khối chóp ra phía sau hoặc kéo thanh trượt góc xoay $\\theta$ đến $180^\\circ$.",
          "level2": "Khi nhìn từ phía sau, mặt $(SAB)$ và $(SAD)$ hướng về phía bạn nên $SA$ trở thành cạnh thấy.",
          "level3": "Đưa góc xoay về khoảng `180`."
        },
        "sceneState": {
          "sceneType": "visual-illusion-360",
          "stepNumber": 2,
          "focus": "Xoay mô hình 360° kiểm tra chuyển đổi nét khuất",
          "targetValue": 180,
          "unit": "độ, sai số $\\pm 15^\\circ$"
        }
      },
      {
        "stepNumber": 3,
        "title": "Đưa camera về góc nhìn trực diện mặt phẳng $(SBC)$",
        "subtitle": "",
        "instruction": "Bấm nút chuyển góc nhìn vuông góc trực tiếp vào mặt phẳng $(SBC)$ để thấy $\\triangle SBC$ hiện nguyên hình là tam giác vuông.",
        "formula": "$SB = \\sqrt{SA^2 + AB^2} = \\sqrt{4^2 + 3^2} = 5, \\ BC = 4 \\Rightarrow SC = \\sqrt{5^2 + 4^2} = \\sqrt{41}$",
        "targetValue": "face-SBC",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Chỉ khi mặt phẳng nhìn song song với mặt phẳng chứa hình (góc nhìn trực giao), góc và tỉ lệ độ dài mới được bảo toàn nguyên vẹn.",
        "hints": {
          "level1": "Sử dụng thanh công cụ góc nhìn trên khung 3D.",
          "level2": "Chọn preset \"Nhìn thẳng mặt $(SBC)$\".",
          "level3": "Bấm chọn \"Nhìn thẳng mặt $(SBC)$\"."
        },
        "sceneState": {
          "sceneType": "visual-illusion-360",
          "stepNumber": 3,
          "focus": "Đưa camera về góc nhìn trực diện mặt phẳng $(SBC)$",
          "targetValue": "face-SBC",
          "unit": ""
        }
      },
      {
        "stepNumber": 4,
        "title": "Kiểm chứng định lý Pytago đảo trên số đo thật",
        "subtitle": "",
        "instruction": "Với $SB = 5$, $BC = 4$, $SC = \\sqrt{41}$, kiểm tra giá trị biểu thức $SB^2 + BC^2 - SC^2$.",
        "formula": "$SB^2 + BC^2 - SC^2 = 5^2 + 4^2 - (\\sqrt{41})^2 = 25 + 16 - 41 = 0$",
        "targetValue": 0,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Chứng minh toán học bằng định lý ba đường vuông góc hoặc Pytago đảo luôn đúng trong mọi góc nhìn.",
        "hints": {
          "level1": "Tính $5^2 + 4^2$ rồi trừ đi $(\\sqrt{41})^2$.",
          "level2": "$25 + 16 = 41$.",
          "level3": "$41 - 41 = 0$. Nhập `0`."
        },
        "sceneState": {
          "sceneType": "visual-illusion-360",
          "stepNumber": 4,
          "focus": "Kiểm chứng định lý Pytago đảo trên số đo thật",
          "targetValue": 0,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-4-example-a",
        "label": "V? d? A",
        "expression": "Chứng minh $\\triangle SCD$ vuông tại $D$ khi đáy $ABCD$ là hình chữ nhật, $SA \\perp (ABCD)$.",
        "tag": "Định lý 3 đường vuông góc",
        "solutionSummary": "Chứng minh $\\triangle SCD$ vuông tại $D$ khi đáy $ABCD$ là hình chữ nhật, $SA \\perp (ABCD)$.",
        "presetParams": {
          "sceneType": "visual-illusion-360",
          "sampleId": "cd02-bai-4-example-a",
          "stepNumber": 1,
          "targetValue": 90
        }
      },
      {
        "id": "cd02-bai-4-example-b",
        "label": "V? d? B",
        "expression": "Hình chóp $S.ABCD$ đáy vuông cạnh $a$, $SA = a$. Tính $\\widehat{SBD}$.",
        "tag": "Ngộ nhận góc đều",
        "solutionSummary": "Hình chóp $S.ABCD$ đáy vuông cạnh $a$, $SA = a$. Tính $\\widehat{SBD}$.",
        "presetParams": {
          "sceneType": "visual-illusion-360",
          "sampleId": "cd02-bai-4-example-b",
          "stepNumber": 1,
          "targetValue": 90
        }
      }
    ]
  },
  {
    "id": "cd02-bai-5",
    "moduleId": "CD02",
    "code": "Bai 5",
    "level": "Thông hiểu",
    "title": "Quan hệ song song trong không gian (Đường – Mặt & Mặt – Mặt)",
    "shortDesc": "Vận dụng định lý Ta-lét không gian và dấu hiệu nhận biết hai mặt phẳng song song.",
    "xp": 75,
    "sceneType": "parallel-relations",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Chứng minh đường thẳng $MN \\parallel (ABCD)$",
        "subtitle": "",
        "instruction": "Với $M, N$ là trung điểm $SA, SB$, chọn đường thẳng nằm trong mặt phẳng đáy $(ABCD)$ song song với $MN$.",
        "formula": "$\\begin{cases} MN \\not\\subset (ABCD) \\\\ MN \\parallel AB \\\\ AB \\subset (ABCD) \\end{cases} \\Rightarrow MN \\parallel (ABCD)$",
        "targetValue": "AB",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Muốn chứng minh đường thẳng $d \\parallel (P)$, ta tìm một đường thẳng $d' \\subset (P)$ sao cho $d \\parallel d'$.",
        "hints": {
          "level1": "$MN$ là đường trung bình của $\\triangle SAB$.",
          "level2": "Đường trung bình của $\\triangle SAB$ song song với cạnh đáy nào?",
          "level3": "Chọn cạnh `AB`."
        },
        "sceneState": {
          "sceneType": "parallel-relations",
          "stepNumber": 1,
          "focus": "Chứng minh đường thẳng $MN \\parallel (ABCD)$",
          "targetValue": "AB",
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Mở rộng thành mặt phẳng $(MNP) \\parallel (ABCD)$",
        "subtitle": "",
        "instruction": "Lấy thêm $P$ là trung điểm $SC$. Ngoài $MN \\parallel AB$, ta có thêm cặp đường thẳng nào song song với cạnh đáy?",
        "formula": "$\\begin{cases} MN \\parallel AB \\\\ NP \\parallel BC \\\\ MN \\cap NP = \\{N\\} \\end{cases} \\Rightarrow (MNP) \\parallel (ABCD)$",
        "targetValue": "NP//BC",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Hai mặt phẳng song song khi mặt phẳng này chứa hai đường thẳng cắt nhau lần lượt song song với mặt phẳng kia.",
        "hints": {
          "level1": "Xét $\\triangle SBC$ có $N$ trung điểm $SB$ và $P$ trung điểm $SC$.",
          "level2": "$NP$ là đường trung bình của $\\triangle SBC$.",
          "level3": "Chọn `NP//BC`."
        },
        "sceneState": {
          "sceneType": "parallel-relations",
          "stepNumber": 2,
          "focus": "Mở rộng thành mặt phẳng $(MNP) \\parallel (ABCD)$",
          "targetValue": "NP//BC",
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Tính tỉ số diện tích $\\frac{S_{\\triangle MNP}}{S_{\\triangle ABC}}$",
        "subtitle": "",
        "instruction": "Biết $\\triangle MNP \\sim \\triangle ABC$ theo tỉ số đồng dạng $k = \\frac{1}{2}$. Nhập giá trị $\\frac{S_{\\triangle MNP}}{S_{\\triangle ABC}}$ (dạng thập phân).",
        "formula": "$\\frac{S_{\\triangle MNP}}{S_{\\triangle ABC}} = k^2 = \\left(\\frac{1}{2}\\right)^2 = 0.25$",
        "targetValue": 0.25,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Tỉ số diện tích của hai hình đồng dạng bằng bình phương tỉ số đồng dạng ($k^2$).",
        "hints": {
          "level1": "Mỗi cạnh của $\\triangle MNP$ bằng $\\frac{1}{2}$ cạnh tương ứng của $\\triangle ABC$.",
          "level2": "Tỉ số diện tích bằng bình phương tỉ số cạnh.",
          "level3": "$\\left(\\frac{1}{2}\\right)^2 = 0.25$. Nhập `0.25`."
        },
        "sceneState": {
          "sceneType": "parallel-relations",
          "stepNumber": 3,
          "focus": "Tính tỉ số diện tích $\\frac{S_{\\triangle MNP}}{S_{\\triangle ABC}}$",
          "targetValue": 0.25,
          "unit": ""
        }
      },
      {
        "stepNumber": 4,
        "title": "Kiểm chứng định lý Ta-lét trong không gian",
        "subtitle": "",
        "instruction": "Mặt phẳng $(MNP) \\parallel (ABCD)$ cắt cạnh $SD$ tại $Q$. Nếu $\\frac{SM}{SA} = \\frac{1}{3}$ thì $\\frac{SQ}{SD}$ bằng bao nhiêu (làm tròn 2 chữ số)?",
        "formula": "$\\frac{SM}{SA} = \\frac{SN}{SB} = \\frac{SP}{SC} = \\frac{SQ}{SD} = \\frac{1}{3} \\approx 0.33$",
        "targetValue": 0.33,
        "unit": "sai số $\\pm 0.02$",
        "tolerance": 0.0,
        "pedagogicalNote": "Ba mặt phẳng đôi một song song chắn trên hai cát tuyến bất kỳ những đoạn thẳng tương ứng tỉ lệ.",
        "hints": {
          "level1": "Các mặt phẳng song song chia các cạnh bên xuất phát từ $S$ theo cùng một tỉ số.",
          "level2": "$\\frac{SQ}{SD} = \\frac{SM}{SA} = \\frac{1}{3}$.",
          "level3": "$1 / 3 \\approx 0.33$."
        },
        "sceneState": {
          "sceneType": "parallel-relations",
          "stepNumber": 4,
          "focus": "Kiểm chứng định lý Ta-lét trong không gian",
          "targetValue": 0.33,
          "unit": "sai số $\\pm 0.02$"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-5-example-a",
        "label": "V? d? A",
        "expression": "Cho $G_1, G_2$ là trọng tâm $\\triangle SAB$ và $\\triangle SAD$. Chứng minh $G_1G_2 \\parallel (ABCD)$.",
        "tag": "Trọng tâm & Song song",
        "solutionSummary": "Cho $G_1, G_2$ là trọng tâm $\\triangle SAB$ và $\\triangle SAD$. Chứng minh $G_1G_2 \\parallel (ABCD)$.",
        "presetParams": {
          "sceneType": "parallel-relations",
          "sampleId": "cd02-bai-5-example-a",
          "stepNumber": 1,
          "targetValue": "AB"
        }
      },
      {
        "id": "cd02-bai-5-example-b",
        "label": "V? d? B",
        "expression": "Hình hộp $ABCD.A'B'C'D'$. Chứng minh $(BDA') \\parallel (B'D'C)$.",
        "tag": "Hình hộp chuẩn SGK",
        "solutionSummary": "Hình hộp $ABCD.A'B'C'D'$. Chứng minh $(BDA') \\parallel (B'D'C)$.",
        "presetParams": {
          "sceneType": "parallel-relations",
          "sampleId": "cd02-bai-5-example-b",
          "stepNumber": 1,
          "targetValue": "AB"
        }
      }
    ]
  },
  {
    "id": "cd02-bai-6",
    "moduleId": "CD02",
    "code": "Bai 6",
    "level": "Vận dụng",
    "title": "Mặt phẳng cắt & Thiết diện đa giác lồi $MPQR$",
    "shortDesc": "Dựng thiết diện song song đáy và tính diện tích thiết diện theo tỉ số vị trí.",
    "xp": 85,
    "sceneType": "cross-section-polygon",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Thiết lập mặt phẳng $(\\alpha)$ qua $M \\in SA$ và song song đáy $(ABCD)$",
        "subtitle": "",
        "instruction": "Kéo thanh trượt điểm $M$ trên $SA$ đến vị trí $k = \\frac{SM}{SA} = 0.6$.",
        "formula": "$(\\alpha) \\ni M, \\ (\\alpha) \\parallel (ABCD)$",
        "targetValue": 0.6,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Khi mặt phẳng $(\\alpha)$ song song với đáy $(ABCD)$, giao tuyến của $(\\alpha)$ với mỗi mặt bên sẽ song song với cạnh đáy tương ứng.",
        "hints": {
          "level1": "Di chuyển điểm $M$ trên cạnh $SA$ tới mốc $0.6$.",
          "level2": "Dùng thanh trượt $k = SM/SA$.",
          "level3": "Đặt $k = 0.6$."
        },
        "sceneState": {
          "sceneType": "cross-section-polygon",
          "stepNumber": 1,
          "focus": "Thiết lập mặt phẳng $(\\alpha)$ qua $M \\in SA$ và song song đáy $(ABCD)$",
          "targetValue": 0.6,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Dựng các đoạn giao tuyến $MP, PQ, QR, RM$",
        "subtitle": "",
        "instruction": "Bật dựng tự động 4 đoạn giao tuyến: $MP \\parallel AB$, $PQ \\parallel BC$, $QR \\parallel CD$, $RM \\parallel DA$. Thiết diện $MPQR$ là hình gì nếu đáy $ABCD$ là hình vuông?",
        "formula": "$MP \\parallel AB, \\ PQ \\parallel BC, \\ QR \\parallel CD, \\ RM \\parallel DA$",
        "targetValue": "square",
        "unit": "Hình vuông",
        "tolerance": 0.0,
        "pedagogicalNote": "Thiết diện cắt bởi mặt phẳng song song đáy luôn đồng dạng với đa giác đáy theo tỉ số $k = \\frac{SM}{SA}$.",
        "hints": {
          "level1": "Các cạnh của thiết diện lần lượt song song với các cạnh của hình vuông đáy $ABCD$.",
          "level2": "Một tứ giác có các cạnh tương ứng song song và tỉ lệ với hình vuông thì cũng là hình vuông.",
          "level3": "Chọn \"Hình vuông\"."
        },
        "sceneState": {
          "sceneType": "cross-section-polygon",
          "stepNumber": 2,
          "focus": "Dựng các đoạn giao tuyến $MP, PQ, QR, RM$",
          "targetValue": "square",
          "unit": "Hình vuông"
        }
      },
      {
        "stepNumber": 3,
        "title": "Tính diện tích thiết diện $MPQR$",
        "subtitle": "",
        "instruction": "Tính diện tích thiết diện $S_{MPQR}$ khi đáy vuông cạnh $a = 5$ ($S_{ABCD} = 25$) và tỉ số $k = \\frac{SM}{SA} = 0.6$.",
        "formula": "$S_{MPQR} = k^2 \\cdot S_{ABCD} = (0.6)^2 \\cdot 25 = 0.36 \\cdot 25 = 9$",
        "targetValue": 9,
        "unit": "đvdt",
        "tolerance": 0.0,
        "pedagogicalNote": "Công thức tổng quát: $S_{\\text{thiết diện}} = \\left(\\frac{SM}{SA}\\right)^2 \\cdot S_{\\text{đáy}}$.",
        "hints": {
          "level1": "Tính cạnh của thiết diện: $MP = k \\cdot AB = 0.6 \\times 5 = 3$.",
          "level2": "Diện tích hình vuông $MPQR$ bằng $MP^2$.",
          "level3": "$3^2 = 9$. Nhập `9`."
        },
        "sceneState": {
          "sceneType": "cross-section-polygon",
          "stepNumber": 3,
          "focus": "Tính diện tích thiết diện $MPQR$",
          "targetValue": 9,
          "unit": "đvdt"
        }
      },
      {
        "stepNumber": 4,
        "title": "Tìm vị trí $k$ để diện tích thiết diện bằng một nửa diện tích đáy",
        "subtitle": "",
        "instruction": "Cần đặt điểm $M$ ở tỉ số $k = \\frac{SM}{SA}$ bằng bao nhiêu (làm tròn 2 chữ số) để $S_{MPQR} = \\frac{1}{2} S_{ABCD}$?",
        "formula": "$k^2 = \\frac{1}{2} \\Rightarrow k = \\frac{1}{\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\approx 0.71$",
        "targetValue": 0.71,
        "unit": "sai số $\\pm 0.02$",
        "tolerance": 0.0,
        "pedagogicalNote": "Nhiều học sinh nhầm $k = 0.5$ sẽ chia đôi diện tích, nhưng $k = 0.5$ chỉ cho diện tích bằng $0.25$ đáy!",
        "hints": {
          "level1": "Thiết lập phương trình $k^2 = 0.5$.",
          "level2": "Lấy căn bậc hai dương: $k = \\sqrt{0.5} = \\frac{\\sqrt{2}}{2}$.",
          "level3": "$\\frac{\\sqrt{2}}{2} \\approx 0.71$. Nhập `0.71`."
        },
        "sceneState": {
          "sceneType": "cross-section-polygon",
          "stepNumber": 4,
          "focus": "Tìm vị trí $k$ để diện tích thiết diện bằng một nửa diện tích đáy",
          "targetValue": 0.71,
          "unit": "sai số $\\pm 0.02$"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-6-example-a",
        "label": "V? d? A",
        "expression": "Thiết diện qua $M$ ($SM = \\frac{1}{3}SA$) song song đáy hình thoi cạnh $6$, góc $60^\\circ$.",
        "tag": "Đáy hình thoi",
        "solutionSummary": "Thiết diện qua $M$ ($SM = \\frac{1}{3}SA$) song song đáy hình thoi cạnh $6$, góc $60^\\circ$.",
        "presetParams": {
          "sceneType": "cross-section-polygon",
          "sampleId": "cd02-bai-6-example-a",
          "stepNumber": 1,
          "targetValue": 0.6
        }
      },
      {
        "id": "cd02-bai-6-example-b",
        "label": "V? d? B",
        "expression": "Thiết diện qua trọng tâm $G$ của $\\triangle SAB$ và song song với $(ABCD)$.",
        "tag": "Qua trọng tâm",
        "solutionSummary": "Thiết diện qua trọng tâm $G$ của $\\triangle SAB$ và song song với $(ABCD)$.",
        "presetParams": {
          "sceneType": "cross-section-polygon",
          "sampleId": "cd02-bai-6-example-b",
          "stepNumber": 1,
          "targetValue": 0.6
        }
      },
      {
        "id": "cd02-bai-6-example-c",
        "label": "V? d? C",
        "expression": "Thiết diện song song với $(SAD)$ qua trung điểm $M$ của $AB$.",
        "tag": "Thiết diện nghiêng",
        "solutionSummary": "Thiết diện song song với $(SAD)$ qua trung điểm $M$ của $AB$.",
        "presetParams": {
          "sceneType": "cross-section-polygon",
          "sampleId": "cd02-bai-6-example-c",
          "stepNumber": 1,
          "targetValue": 0.6
        }
      }
    ]
  },
  {
    "id": "cd02-bai-7",
    "moduleId": "CD02",
    "code": "Bai 7",
    "level": "Vận dụng",
    "title": "Góc giữa đường thẳng và mặt phẳng & Góc nhị diện",
    "shortDesc": "Quy trình 3 bước xác định góc giữa cạnh bên và mặt đáy trên mô hình 3D.",
    "xp": 85,
    "sceneType": "line-plane-angle",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Tìm giao điểm của cạnh bên $SC$ với mặt đáy $(ABCD)$",
        "subtitle": "",
        "instruction": "Click chọn giao điểm của đường thẳng $SC$ và mặt phẳng đáy $(ABCD)$.",
        "formula": "$SC \\cap (ABCD) = \\{C\\}$",
        "targetValue": "C",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Muốn tìm góc giữa đường thẳng $d$ và mặt phẳng $(P)$, trước hết phải chốt giao điểm $C = d \\cap (P)$.",
        "hints": {
          "level1": "Đỉnh nào của đáy nằm trên cạnh $SC$?",
          "level2": "Đó là đỉnh $C$.",
          "level3": "Chọn điểm `C`."
        },
        "sceneState": {
          "sceneType": "line-plane-angle",
          "stepNumber": 1,
          "focus": "Tìm giao điểm của cạnh bên $SC$ với mặt đáy $(ABCD)$",
          "targetValue": "C",
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Xác định hình chiếu vuông góc của $S$ lên đáy",
        "subtitle": "",
        "instruction": "Với giả thiết $SA \\perp (ABCD)$, hình chiếu vuông góc của đỉnh $S$ lên mặt phẳng $(ABCD)$ là điểm nào?",
        "formula": "$SA \\perp (ABCD) \\Rightarrow \\text{Hình chiếu của } S \\text{ là } A$",
        "targetValue": "A",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì $SA \\perp (ABCD)$ nên chân đường vuông góc hạ từ $S$ xuống đáy chính là điểm $A$.",
        "hints": {
          "level1": "Đường cao của hình chóp xuất phát từ $S$ hạ xuống đỉnh nào?",
          "level2": "Đó là điểm $A$.",
          "level3": "Chọn điểm `A`."
        },
        "sceneState": {
          "sceneType": "line-plane-angle",
          "stepNumber": 2,
          "focus": "Xác định hình chiếu vuông góc của $S$ lên đáy",
          "targetValue": "A",
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Khoanh vùng góc giữa $SC$ và $(ABCD)$",
        "subtitle": "",
        "instruction": "Hình chiếu của $SC$ lên $(ABCD)$ là $AC$. Góc giữa $SC$ và $(ABCD)$ chính là góc $\\widehat{SCA}$. Tính $\\widehat{SCA}$ khi $AB = 3, AD = 4, SA = 5$.",
        "formula": "$AC = \\sqrt{3^2 + 4^2} = 5 \\Rightarrow \\tan\\widehat{SCA} = \\frac{SA}{AC} = \\frac{5}{5} = 1 \\Rightarrow \\widehat{SCA} = 45^\\circ$",
        "targetValue": 45,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Tam giác $SAC$ vuông tại $A$ có hai cạnh góc vuông $SA = AC = 5$ nên vuông cân tại $A$, góc nhọn bằng $45^\\circ$.",
        "hints": {
          "level1": "Tính độ dài đường chéo đáy $AC = \\sqrt{AB^2 + AD^2}$.",
          "level2": "$AC = 5$. So sánh $SA$ và $AC$.",
          "level3": "$\\tan\\widehat{SCA} = 1 \\Rightarrow \\widehat{SCA} = 45^\\circ$."
        },
        "sceneState": {
          "sceneType": "line-plane-angle",
          "stepNumber": 3,
          "focus": "Khoanh vùng góc giữa $SC$ và $(ABCD)$",
          "targetValue": 45,
          "unit": "độ"
        }
      },
      {
        "stepNumber": 4,
        "title": "Xác định góc phẳng nhị diện $[S, BC, A]$",
        "subtitle": "",
        "instruction": "Giao tuyến hai mặt phẳng $(SBC)$ và $(ABCD)$ là $BC$. Biết $AB \\perp BC$ và $SB \\perp BC$, góc phẳng nhị diện $[S, BC, A]$ là góc $\\widehat{SBA}$. Tính $\\tan\\widehat{SBA}$ khi $SA = 6, AB = 3$.",
        "formula": "$\\tan\\widehat{SBA} = \\frac{SA}{AB} = \\frac{6}{3} = 2$",
        "targetValue": 2,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Từ chân đường cao $A$, kẻ $AB \\perp BC$ (giao tuyến), nối $S$ với $B$ ta thu được góc $\\widehat{SBA}$ là góc phẳng nhị diện.",
        "hints": {
          "level1": "Xét tam giác $SAB$ vuông tại $A$.",
          "level2": "Tỉ số $\\tan\\widehat{SBA} = \\frac{\\text{đối}}{\\text{kề}} = \\frac{SA}{AB}$.",
          "level3": "$\\frac{6}{3} = 2$. Nhập `2`."
        },
        "sceneState": {
          "sceneType": "line-plane-angle",
          "stepNumber": 4,
          "focus": "Xác định góc phẳng nhị diện $[S, BC, A]$",
          "targetValue": 2,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-7-example-a",
        "label": "V? d? A",
        "expression": "Đáy vuông cạnh $a$, $SA = a\\sqrt{3}$. Tính góc giữa $SC$ và $(ABCD)$.",
        "tag": "Góc cạnh bên - đáy",
        "solutionSummary": "Đáy vuông cạnh $a$, $SA = a\\sqrt{3}$. Tính góc giữa $SC$ và $(ABCD)$.",
        "presetParams": {
          "sceneType": "line-plane-angle",
          "sampleId": "cd02-bai-7-example-a",
          "stepNumber": 1,
          "targetValue": "C"
        }
      },
      {
        "id": "cd02-bai-7-example-b",
        "label": "V? d? B",
        "expression": "Đáy vuông cạnh $a$, $SA = a$. Tính góc giữa $(SBD)$ và $(ABCD)$.",
        "tag": "Góc mặt chéo - đáy",
        "solutionSummary": "Đáy vuông cạnh $a$, $SA = a$. Tính góc giữa $(SBD)$ và $(ABCD)$.",
        "presetParams": {
          "sceneType": "line-plane-angle",
          "sampleId": "cd02-bai-7-example-b",
          "stepNumber": 1,
          "targetValue": "C"
        }
      }
    ]
  },
  {
    "id": "cd02-bai-8",
    "moduleId": "CD02",
    "code": "Bai 8",
    "level": "Vận dụng cao",
    "title": "Trải phẳng (Unfolding), Tách-gộp hình & Đường đi ngắn nhất",
    "shortDesc": "Bảo toàn kích thước mặt khi trải phẳng 2D và giải bài toán con kiến bò trên mặt chóp.",
    "xp": 100,
    "sceneType": "unfolding-net",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Mở góc trải phẳng các mặt bên ($0^\\circ \\rightarrow 180^\\circ$)",
        "subtitle": "",
        "instruction": "Kéo thanh trượt góc mở $\\phi$ từ $0^\\circ$ lên $180^\\circ$ để trải toàn bộ 4 mặt bên của hình chóp xuống mặt phẳng đáy.",
        "formula": "$\\text{Bảo toàn đẳng cự: } \\triangle S_i A B \\cong \\triangle SAB$",
        "targetValue": 180,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Phép trải phẳng quay từng mặt bên quanh cạnh đáy tương ứng nên giữ nguyên độ dài mọi cạnh và diện tích từng mặt.",
        "hints": {
          "level1": "Kéo thanh trượt \"Góc trải phẳng\" hết cỡ sang phải.",
          "level2": "Đưa góc mở về $180^\\circ$ để các mặt nằm phẳng trên lưới $(Oxy)$.",
          "level3": "Đặt $\\phi = 180^\\circ$."
        },
        "sceneState": {
          "sceneType": "unfolding-net",
          "stepNumber": 1,
          "focus": "Mở góc trải phẳng các mặt bên ($0^\\circ \\rightarrow 180^\\circ$)",
          "targetValue": 180,
          "unit": "độ, sai số $\\pm 5^\\circ$"
        }
      },
      {
        "stepNumber": 2,
        "title": "Tính diện tích toàn phần từ hình trải phẳng",
        "subtitle": "",
        "instruction": "Hình chóp tứ giác đều cạnh đáy $a = 6$, trung đoạn $d = 5$. Từ hình trải phẳng gồm 1 hình vuông cạnh $6$ và 4 tam giác cân đáy $6$, chiều cao $5$, tính diện tích toàn phần $S_{tp}$.",
        "formula": "$S_{tp} = S_{\\text{đáy}} + 4 \\cdot S_{\\text{mặt bên}} = 6^2 + 4 \\cdot \\left(\\frac{1}{2} \\cdot 6 \\cdot 5\\right) = 36 + 60 = 96$",
        "targetValue": 96,
        "unit": "đvdt",
        "tolerance": 0.0,
        "pedagogicalNote": "Hình trải phẳng giúp học sinh nhìn trực tiếp tổng diện tích toàn phần mà không cần học thuộc máy móc công thức.",
        "hints": {
          "level1": "Tính diện tích đáy vuông $6 \\times 6$ và diện tích 1 tam giác bên $\\frac{1}{2} \\times 6 \\times 5$.",
          "level2": "$S_{\\text{đáy}} = 36$, mỗi tam giác bên có diện tích $15$.",
          "level3": "$36 + 4 \\times 15 = 96$. Nhập `96`."
        },
        "sceneState": {
          "sceneType": "unfolding-net",
          "stepNumber": 2,
          "focus": "Tính diện tích toàn phần từ hình trải phẳng",
          "targetValue": 96,
          "unit": "đvdt"
        }
      },
      {
        "stepNumber": 3,
        "title": "Bài toán đường đi ngắn nhất trên bề mặt hình chóp",
        "subtitle": "",
        "instruction": "Cho hình chóp tứ giác đều có các mặt bên là tam giác đều cạnh $a = 4$. Một con kiến bò từ $A$, băng qua cạnh $SB$ để tới trung điểm $M$ của $SC$. Tính độ dài đường đi ngắn nhất $AM_{\\min}$ (làm tròn 2 chữ số).",
        "formula": "",
        "targetValue": 5.29,
        "unit": "sai số $\\pm 0.05$",
        "tolerance": 0.0,
        "pedagogicalNote": "Trên khối 3D đường đi bị gãy khúc tại cạnh $SB$, nhưng khi trải phẳng hai mặt $(SAB)$ và $(SBC)$ thành tứ giác phẳng $SABC$, đường đi ngắn nhất chính là đoạn thẳng $AM$.",
        "hints": {
          "level1": "Trải phẳng hai tam giác đều $SAB$ và $SBC$ chung cạnh $SB$, góc $\\widehat{ASC} = 120^\\circ$.",
          "level2": "Áp dụng định lý Côsin trong $\\triangle SAM$ với $SA = 4, SM = 2, \\widehat{ASM} = 120^\\circ$.",
          "level3": "$AM = \\sqrt{28} \\approx 5.29$."
        },
        "sceneState": {
          "sceneType": "unfolding-net",
          "stepNumber": 3,
          "focus": "Bài toán đường đi ngắn nhất trên bề mặt hình chóp",
          "targetValue": 5.29,
          "unit": "sai số $\\pm 0.05$"
        }
      },
      {
        "stepNumber": 4,
        "title": "Gập ngược lưới phẳng về khối 3D kiểm tra đường gấp khúc",
        "subtitle": "",
        "instruction": "Kéo góc trải phẳng từ $180^\\circ$ về lại $0^\\circ$ để thấy đoạn thẳng $AM$ gập thành đường gấp khúc $AK + KM$ chạm cạnh $SB$ tại tỉ số $\\frac{SK}{SB}$ bằng bao nhiêu (làm tròn 2 chữ số)?",
        "formula": "",
        "targetValue": 0.33,
        "unit": "sai số $\\pm 0.02$",
        "tolerance": 0.0,
        "pedagogicalNote": "Vì $\\widehat{ASK} = \\widehat{KSM} = 60^\\circ$, $SB$ chính là đường phân giác trong của $\\triangle SAM$.",
        "hints": {
          "level1": "Để ý tia $SB$ chia góc $\\widehat{ASM} = 120^\\circ$ thành hai góc $60^\\circ$ bằng nhau.",
          "level2": "Dùng công thức độ dài đường phân giác $SK = \\frac{2bc\\cos 60^\\circ}{b+c}$ với $b=4, c=2$.",
          "level3": "$SK = \\frac{4}{3}$, chia cho $SB = 4$ được $\\frac{1}{3} \\approx 0.33$."
        },
        "sceneState": {
          "sceneType": "unfolding-net",
          "stepNumber": 4,
          "focus": "Gập ngược lưới phẳng về khối 3D kiểm tra đường gấp khúc",
          "targetValue": 0.33,
          "unit": "sai số $\\pm 0.02$"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd02-bai-8-example-a",
        "label": "V? d? A",
        "expression": "Trải phẳng hình lập phương cạnh $a = 3$, tìm đường đi ngắn nhất giữa 2 đỉnh đối diện qua 2 mặt.",
        "tag": "Thử thách B-01",
        "solutionSummary": "Trải phẳng hình lập phương cạnh $a = 3$, tìm đường đi ngắn nhất giữa 2 đỉnh đối diện qua 2 mặt.",
        "presetParams": {
          "sceneType": "unfolding-net",
          "sampleId": "cd02-bai-8-example-a",
          "stepNumber": 1,
          "targetValue": 180
        }
      },
      {
        "id": "cd02-bai-8-example-b",
        "label": "V? d? B",
        "expression": "Hình chóp tứ giác đều mặt bên là tam giác đều cạnh $6$, kiến bò từ $A$ vòng qua 3 mặt bên tới $D$.",
        "tag": "Thử thách B-02",
        "solutionSummary": "Hình chóp tứ giác đều mặt bên là tam giác đều cạnh $6$, kiến bò từ $A$ vòng qua 3 mặt bên tới $D$.",
        "presetParams": {
          "sceneType": "unfolding-net",
          "sampleId": "cd02-bai-8-example-b",
          "stepNumber": 1,
          "targetValue": 180
        }
      }
    ]
  },
  {
    "id": "cd03-lg01",
    "moduleId": "CD03",
    "code": "LG01",
    "level": "Cơ bản",
    "title": "Góc có hướng, đơn vị đo và nhiều vòng quay",
    "shortDesc": "Góc có hướng, đơn vị đo và nhiều vòng quay",
    "xp": 60,
    "sceneType": "unit-circle-angle",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Đổi góc từ độ sang radian",
        "subtitle": "",
        "instruction": "Nhập giá trị góc $150^\\circ$ dưới dạng hệ số nhân với $\\pi$ (làm tròn 3 chữ số thập phân).",
        "formula": "$150^\\circ = 150 \\cdot \\frac{\\pi}{180} = \\frac{5\\pi}{6} \\approx 0.833\\pi \\text{ rad}$",
        "targetValue": 0.833,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Lấy số đo độ chia cho $180$ rồi rút gọn phân số. | Cấp 2: $\\frac{150}{180} = \\frac{5}{6}$. | Cấp 3: Nhập `0.833`.",
        "hints": {
          "level1": "Lấy số đo độ chia cho $180$ rồi rút gọn phân số.",
          "level2": "$\\frac{150}{180} = \\frac{5}{6}$.",
          "level3": "Nhập `0.833`."
        },
        "sceneState": {
          "sceneType": "unit-circle-angle",
          "stepNumber": 1,
          "focus": "Đổi góc từ độ sang radian",
          "targetValue": 0.833,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Phân biệt chiều quay dương và âm",
        "subtitle": "",
        "instruction": "Kéo điểm $M$ từ gốc $A(1;0)$ theo chiều cùng chiều kim đồng hồ một góc $60^\\circ$. Góc lượng giác thu được bằng bao nhiêu độ?",
        "formula": "$\\text{Cùng chiều kim đồng hồ } \\Rightarrow \\alpha = -60^\\circ$",
        "targetValue": -60,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Chiều cùng chiều kim đồng hồ mang dấu âm. | Cấp 2: Quay xuống dưới trục hoành một góc $60^\\circ$. | Cấp 3: Nhập `-60`.",
        "hints": {
          "level1": "Chiều cùng chiều kim đồng hồ mang dấu âm.",
          "level2": "Quay xuống dưới trục hoành một góc $60^\\circ$.",
          "level3": "Nhập `-60`."
        },
        "sceneState": {
          "sceneType": "unit-circle-angle",
          "stepNumber": 2,
          "focus": "Phân biệt chiều quay dương và âm",
          "targetValue": -60,
          "unit": "độ"
        }
      },
      {
        "stepNumber": 3,
        "title": "Góc vượt quá một vòng quay ($> 360^\\circ$)",
        "subtitle": "",
        "instruction": "Góc lượng giác $\\alpha = 765^\\circ$ quay được bao nhiêu vòng nguyên $k$ cộng thêm góc dư nhọn?",
        "formula": "$765^\\circ = 45^\\circ + 2 \\cdot 360^\\circ \\Rightarrow k = 2$",
        "targetValue": 2,
        "unit": "vòng",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Lấy $765$ chia cho $360$ tìm thương nguyên. | Cấp 2: $2 \\times 360 = 720$, dư $45^\\circ$. | Cấp 3: Số vòng nguyên $k = 2$. Nhập `2`.",
        "hints": {
          "level1": "Lấy $765$ chia cho $360$ tìm thương nguyên.",
          "level2": "$2 \\times 360 = 720$, dư $45^\\circ$.",
          "level3": "Số vòng nguyên $k = 2$. Nhập `2`."
        },
        "sceneState": {
          "sceneType": "unit-circle-angle",
          "stepNumber": 3,
          "focus": "Góc vượt quá một vòng quay ($> 360^\\circ$)",
          "targetValue": 2,
          "unit": "vòng"
        }
      },
      {
        "stepNumber": 4,
        "title": "Tìm góc âm nhỏ nhất về trị tuyệt đối cùng điểm cuối với $\\frac{7\\pi}{4}$",
        "subtitle": "",
        "instruction": "Trừ đi $1$ vòng ($2\\pi$) từ góc $\\frac{7\\pi}{4}$, ta được góc âm cùng điểm cuối là bao nhiêu độ?",
        "formula": "$\\frac{7\\pi}{4} - 2\\pi = -\\frac{\\pi}{4} = -45^\\circ$",
        "targetValue": -45,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: $\\frac{7\\pi}{4}$ tương ứng với $315^\\circ$. | Cấp 2: Lấy $315^\\circ - 360^\\circ$. | Cấp 3: Nhập `-45`.",
        "hints": {
          "level1": "$\\frac{7\\pi}{4}$ tương ứng với $315^\\circ$.",
          "level2": "Lấy $315^\\circ - 360^\\circ$.",
          "level3": "Nhập `-45`."
        },
        "sceneState": {
          "sceneType": "unit-circle-angle",
          "stepNumber": 4,
          "focus": "Tìm góc âm nhỏ nhất về trị tuyệt đối cùng điểm cuối với $\\frac{7\\pi}{4}$",
          "targetValue": -45,
          "unit": "độ"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg01-example-a",
        "label": "V? d? A",
        "expression": "Đổi $-225^\\circ$ sang radian và xác định góc phần tư $\\Rightarrow -225^\\circ = -\\frac{5\\pi}{4}$ (cùng điểm cuối với $\\frac{3\\pi}{4}$ ở góc phần tư II).",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Đổi $-225^\\circ$ sang radian và xác định góc phần tư $\\Rightarrow -225^\\circ = -\\frac{5\\pi}{4}$ (cùng điểm cuối với $\\frac{3\\pi}{4}$ ở góc phần tư II).",
        "presetParams": {
          "sceneType": "unit-circle-angle",
          "sampleId": "cd03-lg01-example-a",
          "stepNumber": 1,
          "targetValue": 0.833
        }
      },
      {
        "id": "cd03-lg01-example-b",
        "label": "V? d? B",
        "expression": "Biểu diễn góc $\\frac{25\\pi}{3}$ trên đường tròn lượng giác $\\Rightarrow \\frac{25\\pi}{3} = \\frac{\\pi}{3} + 4 \\cdot 2\\pi$ ($4$ vòng dương $+ 60^\\circ$).",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Biểu diễn góc $\\frac{25\\pi}{3}$ trên đường tròn lượng giác $\\Rightarrow \\frac{25\\pi}{3} = \\frac{\\pi}{3} + 4 \\cdot 2\\pi$ ($4$ vòng dương $+ 60^\\circ$).",
        "presetParams": {
          "sceneType": "unit-circle-angle",
          "sampleId": "cd03-lg01-example-b",
          "stepNumber": 1,
          "targetValue": 0.833
        }
      }
    ]
  },
  {
    "id": "cd03-lg02",
    "moduleId": "CD03",
    "code": "LG02",
    "level": "Cơ bản",
    "title": "Giá trị lượng giác và điểm trên trục tọa độ",
    "shortDesc": "Giá trị lượng giác và điểm trên trục tọa độ",
    "xp": 60,
    "sceneType": "unit-circle-coords",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Đọc tọa độ $(\\cos\\alpha; \\sin\\alpha)$ tại góc $\\alpha = 120^\\circ$",
        "subtitle": "",
        "instruction": "Kéo điểm $M$ tới góc $120^\\circ$ (góc phần tư II) và nhập giá trị của $\\cos 120^\\circ$.",
        "formula": "$M(120^\\circ) = \\left(-\\frac{1}{2}; \\frac{\\sqrt{3}}{2}\\right) \\Rightarrow \\cos 120^\\circ = -0.5$",
        "targetValue": -0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Ở góc phần tư II, điểm $M$ nằm bên trái trục tung nên hoành độ âm. | Cấp 2: Hình chiếu xuống trục hoành có độ dài $\\frac{1}{2}$ về phía âm. | Cấp 3: Nhập `-0.5`.",
        "hints": {
          "level1": "Ở góc phần tư II, điểm $M$ nằm bên trái trục tung nên hoành độ âm.",
          "level2": "Hình chiếu xuống trục hoành có độ dài $\\frac{1}{2}$ về phía âm.",
          "level3": "Nhập `-0.5`."
        },
        "sceneState": {
          "sceneType": "unit-circle-coords",
          "stepNumber": 1,
          "focus": "Đọc tọa độ $(\\cos\\alpha; \\sin\\alpha)$ tại góc $\\alpha = 120^\\circ$",
          "targetValue": -0.5,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Kiểm tra hằng đẳng thức cơ bản $\\sin^2\\alpha + \\cos^2\\alpha = 1$",
        "subtitle": "",
        "instruction": "Với $\\sin\\alpha = 0.6$ và $\\alpha$ thuộc góc phần tư II ($\\frac{\\pi}{2} < \\alpha < \\pi$), tính $\\cos\\alpha$.",
        "formula": "$\\cos\\alpha = -\\sqrt{1 - \\sin^2\\alpha} = -\\sqrt{1 - 0.36} = -0.8$",
        "targetValue": -0.8,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Tính $\\cos^2\\alpha = 1 - 0.6^2 = 0.64$. | Cấp 2: Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên $\\cos\\alpha < 0$. | Cấp 3: Lấy dấu âm: `-0.8`.",
        "hints": {
          "level1": "Tính $\\cos^2\\alpha = 1 - 0.6^2 = 0.64$.",
          "level2": "Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên $\\cos\\alpha < 0$.",
          "level3": "Lấy dấu âm: `-0.8`."
        },
        "sceneState": {
          "sceneType": "unit-circle-coords",
          "stepNumber": 2,
          "focus": "Kiểm tra hằng đẳng thức cơ bản $\\sin^2\\alpha + \\cos^2\\alpha = 1$",
          "targetValue": -0.8,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Kiểm tra mẫu số khi tính $\\tan\\alpha$ và $\\cot\\alpha$",
        "subtitle": "",
        "instruction": "Tại góc $\\alpha = 90^\\circ$ ($\\frac{\\pi}{2}$), giá trị $\\cos 90^\\circ$ bằng bao nhiêu khiến $\\tan 90^\\circ = \\frac{\\sin 90^\\circ}{\\cos 90^\\circ}$ không xác định?",
        "formula": "$\\cos\\frac{\\pi}{2} = 0 \\Rightarrow \\tan\\frac{\\pi}{2} \\text{ không xác định}$",
        "targetValue": 0,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Cấp 1: Điểm $M(90^\\circ)$ trùng với điểm $B(0;1)$ trên trục tung. | Cấp 2: Hoành độ của điểm $B(0;1)$ bằng $0$. | Cấp 3: Nhập `0`.",
        "hints": {
          "level1": "Điểm $M(90^\\circ)$ trùng với điểm $B(0;1)$ trên trục tung.",
          "level2": "Hoành độ của điểm $B(0;1)$ bằng $0$.",
          "level3": "Nhập `0`."
        },
        "sceneState": {
          "sceneType": "unit-circle-coords",
          "stepNumber": 3,
          "focus": "Kiểm tra mẫu số khi tính $\\tan\\alpha$ và $\\cot\\alpha$",
          "targetValue": 0,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg02-example-a",
        "label": "V? d? A",
        "expression": "Cho $\\cos\\alpha = -\\frac{5}{13}$ với $\\pi < \\alpha < \\frac{3\\pi}{2}$. Tính $\\tan\\alpha \\Rightarrow \\sin\\alpha = -\\frac{12}{13} \\Rightarrow \\tan\\alpha = \\frac{12}{5} = 2.4$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Cho $\\cos\\alpha = -\\frac{5}{13}$ với $\\pi < \\alpha < \\frac{3\\pi}{2}$. Tính $\\tan\\alpha \\Rightarrow \\sin\\alpha = -\\frac{12}{13} \\Rightarrow \\tan\\alpha = \\frac{12}{5} = 2.4$.",
        "presetParams": {
          "sceneType": "unit-circle-coords",
          "sampleId": "cd03-lg02-example-a",
          "stepNumber": 1,
          "targetValue": -0.5
        }
      },
      {
        "id": "cd03-lg02-example-b",
        "label": "V? d? B",
        "expression": "Tính $P = \\frac{2\\sin\\alpha + 3\\cos\\alpha}{\\sin\\alpha - \\cos\\alpha}$ khi $\\tan\\alpha = 2 \\Rightarrow P = \\frac{2\\tan\\alpha + 3}{\\tan\\alpha - 1} = \\frac{4 + 3}{2 - 1} = 7$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $P = \\frac{2\\sin\\alpha + 3\\cos\\alpha}{\\sin\\alpha - \\cos\\alpha}$ khi $\\tan\\alpha = 2 \\Rightarrow P = \\frac{2\\tan\\alpha + 3}{\\tan\\alpha - 1} = \\frac{4 + 3}{2 - 1} = 7$.",
        "presetParams": {
          "sceneType": "unit-circle-coords",
          "sampleId": "cd03-lg02-example-b",
          "stepNumber": 1,
          "targetValue": -0.5
        }
      }
    ]
  },
  {
    "id": "cd03-lg03",
    "moduleId": "CD03",
    "code": "LG03",
    "level": "Cơ bản",
    "title": "Căn cứ hình học của các giá trị đặc biệt",
    "shortDesc": "Căn cứ hình học của các giá trị đặc biệt",
    "xp": 60,
    "sceneType": "special-angles-geometry",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Tam giác vuông cân ứng với góc $\\frac{\\pi}{4}$ ($45^\\circ$)",
        "subtitle": "",
        "instruction": "Trong tam giác vuông cân $OHM$ có cạnh huyền $OM = R = 1$, độ dài mỗi cạnh góc vuông $OH = HM$ bằng bao nhiêu (làm tròn 3 chữ số)?",
        "formula": "$OH^2 + HM^2 = 1 \\Leftrightarrow 2\\,OH^2 = 1 \\Rightarrow OH = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
        "targetValue": 0.707,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$OH^2 + HM^2 = 1 \\Leftrightarrow 2\\,OH^2 = 1 \\Rightarrow OH = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
        "hints": {
          "level1": "Trong tam giác vuông cân $OHM$ có cạnh huyền $OM = R = 1$, độ dài mỗi cạnh góc vuông $OH = HM$ bằng bao nhiêu (làm tròn 3 chữ số)?",
          "level2": "$OH^2 + HM^2 = 1 \\Leftrightarrow 2\\,OH^2 = 1 \\Rightarrow OH = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
          "level3": "Trong tam giác vuông cân $OHM$ có cạnh huyền $OM = R = 1$, độ dài mỗi cạnh góc vuông $OH = HM$ bằng bao nhiêu (làm tròn 3 chữ số)?"
        },
        "sceneState": {
          "sceneType": "special-angles-geometry",
          "stepNumber": 1,
          "focus": "Tam giác vuông cân ứng với góc $\\frac{\\pi}{4}$ ($45^\\circ$)",
          "targetValue": 0.707,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Nửa tam giác đều ứng với góc $\\frac{\\pi}{6}$ ($30^\\circ$)",
        "subtitle": "",
        "instruction": "Khi $\\widehat{MOH} = 30^\\circ$ và $OM = 1$, cạnh đối $HM = \\sin 30^\\circ = 0.5$. Tính cạnh kề $OH = \\cos 30^\\circ$ (làm tròn 3 chữ số).",
        "formula": "$OH = \\sqrt{1^2 - 0.5^2} = \\sqrt{0.75} = \\frac{\\sqrt{3}}{2} \\approx 0.866$",
        "targetValue": 0.866,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$OH = \\sqrt{1^2 - 0.5^2} = \\sqrt{0.75} = \\frac{\\sqrt{3}}{2} \\approx 0.866$",
        "hints": {
          "level1": "Khi $\\widehat{MOH} = 30^\\circ$ và $OM = 1$, cạnh đối $HM = \\sin 30^\\circ = 0.5$. Tính cạnh kề $OH = \\cos 30^\\circ$ (làm tròn 3 chữ số).",
          "level2": "$OH = \\sqrt{1^2 - 0.5^2} = \\sqrt{0.75} = \\frac{\\sqrt{3}}{2} \\approx 0.866$",
          "level3": "Khi $\\widehat{MOH} = 30^\\circ$ và $OM = 1$, cạnh đối $HM = \\sin 30^\\circ = 0.5$. Tính cạnh kề $OH = \\cos 30^\\circ$ (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "special-angles-geometry",
          "stepNumber": 2,
          "focus": "Nửa tam giác đều ứng với góc $\\frac{\\pi}{6}$ ($30^\\circ$)",
          "targetValue": 0.866,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Tính giá trị biểu thức đặc biệt",
        "subtitle": "",
        "instruction": "Tính giá trị của $A = \\sin^2 30^\\circ + \\cos^2 45^\\circ + \\tan 60^\\circ \\cdot \\cot 60^\\circ$.",
        "formula": "$A = \\left(\\frac{1}{2}\\right)^2 + \\left(\\frac{\\sqrt{2}}{2}\\right)^2 + 1 = 0.25 + 0.5 + 1 = 1.75$",
        "targetValue": 1.75,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$A = \\left(\\frac{1}{2}\\right)^2 + \\left(\\frac{\\sqrt{2}}{2}\\right)^2 + 1 = 0.25 + 0.5 + 1 = 1.75$",
        "hints": {
          "level1": "Tính giá trị của $A = \\sin^2 30^\\circ + \\cos^2 45^\\circ + \\tan 60^\\circ \\cdot \\cot 60^\\circ$.",
          "level2": "$A = \\left(\\frac{1}{2}\\right)^2 + \\left(\\frac{\\sqrt{2}}{2}\\right)^2 + 1 = 0.25 + 0.5 + 1 = 1.75$",
          "level3": "Tính giá trị của $A = \\sin^2 30^\\circ + \\cos^2 45^\\circ + \\tan 60^\\circ \\cdot \\cot 60^\\circ$."
        },
        "sceneState": {
          "sceneType": "special-angles-geometry",
          "stepNumber": 3,
          "focus": "Tính giá trị biểu thức đặc biệt",
          "targetValue": 1.75,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg03-example-a",
        "label": "V? d? A",
        "expression": "Tính $B = 2\\cos\\frac{\\pi}{3} - 4\\sin\\frac{\\pi}{6} + \\tan\\frac{\\pi}{4} = 2\\cdot\\frac{1}{2} - 4\\cdot\\frac{1}{2} + 1 = 0$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $B = 2\\cos\\frac{\\pi}{3} - 4\\sin\\frac{\\pi}{6} + \\tan\\frac{\\pi}{4} = 2\\cdot\\frac{1}{2} - 4\\cdot\\frac{1}{2} + 1 = 0$.",
        "presetParams": {
          "sceneType": "special-angles-geometry",
          "sampleId": "cd03-lg03-example-a",
          "stepNumber": 1,
          "targetValue": 0.707
        }
      },
      {
        "id": "cd03-lg03-example-b",
        "label": "V? d? B",
        "expression": "Tính $C = \\sin 150^\\circ + \\cos 135^\\circ + \\tan 120^\\circ = \\frac{1}{2} - \\frac{\\sqrt{2}}{2} - \\sqrt{3}$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $C = \\sin 150^\\circ + \\cos 135^\\circ + \\tan 120^\\circ = \\frac{1}{2} - \\frac{\\sqrt{2}}{2} - \\sqrt{3}$.",
        "presetParams": {
          "sceneType": "special-angles-geometry",
          "sampleId": "cd03-lg03-example-b",
          "stepNumber": 1,
          "targetValue": 0.707
        }
      }
    ]
  },
  {
    "id": "cd03-lg04",
    "moduleId": "CD03",
    "code": "LG04",
    "level": "Cơ bản",
    "title": "Cung liên kết và đối xứng hình học",
    "shortDesc": "Cung liên kết và đối xứng hình học",
    "xp": 65,
    "sceneType": "related-arcs-symmetry",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Hai cung đối nhau ($\\alpha$ và $-\\alpha$ — Đối xứng qua $Ox$)",
        "subtitle": "",
        "instruction": "Nếu $\\cos 40^\\circ \\approx 0.766$ thì $\\cos(-40^\\circ)$ bằng bao nhiêu?",
        "formula": "$\\cos(-\\alpha) = \\cos\\alpha \\Rightarrow \\cos(-40^\\circ) = 0.766$",
        "targetValue": 0.766,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos(-\\alpha) = \\cos\\alpha \\Rightarrow \\cos(-40^\\circ) = 0.766$",
        "hints": {
          "level1": "Nếu $\\cos 40^\\circ \\approx 0.766$ thì $\\cos(-40^\\circ)$ bằng bao nhiêu?",
          "level2": "$\\cos(-\\alpha) = \\cos\\alpha \\Rightarrow \\cos(-40^\\circ) = 0.766$",
          "level3": "Nếu $\\cos 40^\\circ \\approx 0.766$ thì $\\cos(-40^\\circ)$ bằng bao nhiêu?"
        },
        "sceneState": {
          "sceneType": "related-arcs-symmetry",
          "stepNumber": 1,
          "focus": "Hai cung đối nhau ($\\alpha$ và $-\\alpha$ — Đối xứng qua $Ox$)",
          "targetValue": 0.766,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Hai cung bù nhau ($\\alpha$ và $\\pi - \\alpha$ — Đối xứng qua $Oy$)",
        "subtitle": "",
        "instruction": "Nếu $\\sin\\alpha = 0.643$ thì $\\sin(\\pi - \\alpha)$ bằng bao nhiêu?",
        "formula": "$\\sin(\\pi - \\alpha) = \\sin\\alpha = 0.643$",
        "targetValue": 0.643,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\sin(\\pi - \\alpha) = \\sin\\alpha = 0.643$",
        "hints": {
          "level1": "Nếu $\\sin\\alpha = 0.643$ thì $\\sin(\\pi - \\alpha)$ bằng bao nhiêu?",
          "level2": "$\\sin(\\pi - \\alpha) = \\sin\\alpha = 0.643$",
          "level3": "Nếu $\\sin\\alpha = 0.643$ thì $\\sin(\\pi - \\alpha)$ bằng bao nhiêu?"
        },
        "sceneState": {
          "sceneType": "related-arcs-symmetry",
          "stepNumber": 2,
          "focus": "Hai cung bù nhau ($\\alpha$ và $\\pi - \\alpha$ — Đối xứng qua $Oy$)",
          "targetValue": 0.643,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Hai cung phụ nhau ($\\alpha$ và $\\frac{\\pi}{2} - \\alpha$ — Đối xứng qua $y = x$)",
        "subtitle": "",
        "instruction": "Rút gọn biểu thức $P = \\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) - \\cos\\alpha$.",
        "formula": "$\\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) = \\cos\\alpha \\Rightarrow P = \\cos\\alpha - \\cos\\alpha = 0$",
        "targetValue": 0,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) = \\cos\\alpha \\Rightarrow P = \\cos\\alpha - \\cos\\alpha = 0$",
        "hints": {
          "level1": "Rút gọn biểu thức $P = \\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) - \\cos\\alpha$.",
          "level2": "$\\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) = \\cos\\alpha \\Rightarrow P = \\cos\\alpha - \\cos\\alpha = 0$",
          "level3": "Rút gọn biểu thức $P = \\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) - \\cos\\alpha$."
        },
        "sceneState": {
          "sceneType": "related-arcs-symmetry",
          "stepNumber": 3,
          "focus": "Hai cung phụ nhau ($\\alpha$ và $\\frac{\\pi}{2} - \\alpha$ — Đối xứng qua $y = x$)",
          "targetValue": 0,
          "unit": ""
        }
      },
      {
        "stepNumber": 4,
        "title": "Vận dụng rút gọn chuỗi cung liên kết",
        "subtitle": "",
        "instruction": "Tính giá trị $Q = \\cos 20^\\circ + \\cos 40^\\circ + \\cos 140^\\circ + \\cos 160^\\circ$.",
        "formula": "$\\cos 160^\\circ = -\\cos 20^\\circ$ và $\\cos 140^\\circ = -\\cos 40^\\circ \\Rightarrow Q = 0$",
        "targetValue": 0,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos 160^\\circ = -\\cos 20^\\circ$ và $\\cos 140^\\circ = -\\cos 40^\\circ \\Rightarrow Q = 0$",
        "hints": {
          "level1": "Tính giá trị $Q = \\cos 20^\\circ + \\cos 40^\\circ + \\cos 140^\\circ + \\cos 160^\\circ$.",
          "level2": "$\\cos 160^\\circ = -\\cos 20^\\circ$ và $\\cos 140^\\circ = -\\cos 40^\\circ \\Rightarrow Q = 0$",
          "level3": "Tính giá trị $Q = \\cos 20^\\circ + \\cos 40^\\circ + \\cos 140^\\circ + \\cos 160^\\circ$."
        },
        "sceneState": {
          "sceneType": "related-arcs-symmetry",
          "stepNumber": 4,
          "focus": "Vận dụng rút gọn chuỗi cung liên kết",
          "targetValue": 0,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg04-example-a",
        "label": "V? d? A",
        "expression": "Rút gọn $A = \\sin(\\pi + \\alpha) + \\cos\\left(\\frac{\\pi}{2} + \\alpha\\right) = -\\sin\\alpha - \\sin\\alpha = -2\\sin\\alpha$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Rút gọn $A = \\sin(\\pi + \\alpha) + \\cos\\left(\\frac{\\pi}{2} + \\alpha\\right) = -\\sin\\alpha - \\sin\\alpha = -2\\sin\\alpha$.",
        "presetParams": {
          "sceneType": "related-arcs-symmetry",
          "sampleId": "cd03-lg04-example-a",
          "stepNumber": 1,
          "targetValue": 0.766
        }
      },
      {
        "id": "cd03-lg04-example-b",
        "label": "V? d? B",
        "expression": "Tính $B = \\tan 10^\\circ \\cdot \\tan 20^\\circ \\cdots \\tan 80^\\circ = (\\tan 10^\\circ\\tan 80^\\circ)\\cdots(\\tan 40^\\circ\\tan 50^\\circ) = 1^4 = 1$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $B = \\tan 10^\\circ \\cdot \\tan 20^\\circ \\cdots \\tan 80^\\circ = (\\tan 10^\\circ\\tan 80^\\circ)\\cdots(\\tan 40^\\circ\\tan 50^\\circ) = 1^4 = 1$.",
        "presetParams": {
          "sceneType": "related-arcs-symmetry",
          "sampleId": "cd03-lg04-example-b",
          "stepNumber": 1,
          "targetValue": 0.766
        }
      }
    ]
  },
  {
    "id": "cd03-lg05",
    "moduleId": "CD03",
    "code": "LG05",
    "level": "Thông hiểu",
    "title": "Công thức cộng, trừ, nhân đôi và hạ bậc",
    "shortDesc": "Công thức cộng, trừ, nhân đôi và hạ bậc",
    "xp": 75,
    "sceneType": "addition-double-formulas",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Công thức cộng (Phá bỏ ngộ nhận $\\sin(a+b) = \\sin a + \\sin b$)",
        "subtitle": "",
        "instruction": "Tính $\\sin 75^\\circ = \\sin(45^\\circ + 30^\\circ)$ theo công thức chuẩn (làm tròn 3 chữ số).",
        "formula": "$\\sin 75^\\circ = \\sin 45^\\circ\\cos 30^\\circ + \\cos 45^\\circ\\sin 30^\\circ = \\frac{\\sqrt{6}+\\sqrt{2}}{4} \\approx 0.966$",
        "targetValue": 0.966,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\sin 75^\\circ = \\sin 45^\\circ\\cos 30^\\circ + \\cos 45^\\circ\\sin 30^\\circ = \\frac{\\sqrt{6}+\\sqrt{2}}{4} \\approx 0.966$",
        "hints": {
          "level1": "Tính $\\sin 75^\\circ = \\sin(45^\\circ + 30^\\circ)$ theo công thức chuẩn (làm tròn 3 chữ số).",
          "level2": "$\\sin 75^\\circ = \\sin 45^\\circ\\cos 30^\\circ + \\cos 45^\\circ\\sin 30^\\circ = \\frac{\\sqrt{6}+\\sqrt{2}}{4} \\approx 0.966$",
          "level3": "Tính $\\sin 75^\\circ = \\sin(45^\\circ + 30^\\circ)$ theo công thức chuẩn (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "addition-double-formulas",
          "stepNumber": 1,
          "focus": "Công thức cộng (Phá bỏ ngộ nhận $\\sin(a+b) = \\sin a + \\sin b$)",
          "targetValue": 0.966,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Công thức nhân đôi",
        "subtitle": "",
        "instruction": "Biết $\\sin a = \\frac{3}{5}$ và $\\cos a = \\frac{4}{5}$, tính $\\sin 2a = 2\\sin a\\cos a$.",
        "formula": "$\\sin 2a = 2 \\cdot \\frac{3}{5} \\cdot \\frac{4}{5} = \\frac{24}{25} = 0.96$",
        "targetValue": 0.96,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\sin 2a = 2 \\cdot \\frac{3}{5} \\cdot \\frac{4}{5} = \\frac{24}{25} = 0.96$",
        "hints": {
          "level1": "Biết $\\sin a = \\frac{3}{5}$ và $\\cos a = \\frac{4}{5}$, tính $\\sin 2a = 2\\sin a\\cos a$.",
          "level2": "$\\sin 2a = 2 \\cdot \\frac{3}{5} \\cdot \\frac{4}{5} = \\frac{24}{25} = 0.96$",
          "level3": "Biết $\\sin a = \\frac{3}{5}$ và $\\cos a = \\frac{4}{5}$, tính $\\sin 2a = 2\\sin a\\cos a$."
        },
        "sceneState": {
          "sceneType": "addition-double-formulas",
          "stepNumber": 2,
          "focus": "Công thức nhân đôi",
          "targetValue": 0.96,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Công thức hạ bậc",
        "subtitle": "",
        "instruction": "Áp dụng công thức hạ bậc để tính $\\cos^2 15^\\circ = \\frac{1 + \\cos 30^\\circ}{2}$ (làm tròn 3 chữ số).",
        "formula": "$\\cos^2 15^\\circ = \\frac{1 + \\frac{\\sqrt{3}}{2}}{2} = \\frac{2 + \\sqrt{3}}{4} \\approx 0.933$",
        "targetValue": 0.933,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos^2 15^\\circ = \\frac{1 + \\frac{\\sqrt{3}}{2}}{2} = \\frac{2 + \\sqrt{3}}{4} \\approx 0.933$",
        "hints": {
          "level1": "Áp dụng công thức hạ bậc để tính $\\cos^2 15^\\circ = \\frac{1 + \\cos 30^\\circ}{2}$ (làm tròn 3 chữ số).",
          "level2": "$\\cos^2 15^\\circ = \\frac{1 + \\frac{\\sqrt{3}}{2}}{2} = \\frac{2 + \\sqrt{3}}{4} \\approx 0.933$",
          "level3": "Áp dụng công thức hạ bậc để tính $\\cos^2 15^\\circ = \\frac{1 + \\cos 30^\\circ}{2}$ (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "addition-double-formulas",
          "stepNumber": 3,
          "focus": "Công thức hạ bậc",
          "targetValue": 0.933,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg05-example-a",
        "label": "V? d? A",
        "expression": "Tính $\\tan 15^\\circ = \\tan(45^\\circ - 30^\\circ) = \\frac{1 - 1/\\sqrt{3}}{1 + 1/\\sqrt{3}} = 2 - \\sqrt{3} \\approx 0.268$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $\\tan 15^\\circ = \\tan(45^\\circ - 30^\\circ) = \\frac{1 - 1/\\sqrt{3}}{1 + 1/\\sqrt{3}} = 2 - \\sqrt{3} \\approx 0.268$.",
        "presetParams": {
          "sceneType": "addition-double-formulas",
          "sampleId": "cd03-lg05-example-a",
          "stepNumber": 1,
          "targetValue": 0.966
        }
      },
      {
        "id": "cd03-lg05-example-b",
        "label": "V? d? B",
        "expression": "Tính $\\cos 2a$ biết $\\sin a = \\frac{1}{3} \\Rightarrow \\cos 2a = 1 - 2\\sin^2 a = 1 - \\frac{2}{9} = \\frac{7}{9}$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $\\cos 2a$ biết $\\sin a = \\frac{1}{3} \\Rightarrow \\cos 2a = 1 - 2\\sin^2 a = 1 - \\frac{2}{9} = \\frac{7}{9}$.",
        "presetParams": {
          "sceneType": "addition-double-formulas",
          "sampleId": "cd03-lg05-example-b",
          "stepNumber": 1,
          "targetValue": 0.966
        }
      }
    ]
  },
  {
    "id": "cd03-lg06",
    "moduleId": "CD03",
    "code": "LG06",
    "level": "Thông hiểu",
    "title": "Biến đổi tích thành tổng",
    "shortDesc": "Biến đổi tích thành tổng",
    "xp": 75,
    "sceneType": "product-to-sum",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Công thức $\\cos a \\cos b$",
        "subtitle": "",
        "instruction": "Áp dụng $\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b) + \\cos(a+b)]$ để tính $P = \\cos 75^\\circ \\cos 15^\\circ$.",
        "formula": "$\\cos 75^\\circ \\cos 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ + \\cos 90^\\circ) = \\frac{1}{2}(0.5 + 0) = 0.25$",
        "targetValue": 0.25,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos 75^\\circ \\cos 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ + \\cos 90^\\circ) = \\frac{1}{2}(0.5 + 0) = 0.25$",
        "hints": {
          "level1": "Áp dụng $\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b) + \\cos(a+b)]$ để tính $P = \\cos 75^\\circ \\cos 15^\\circ$.",
          "level2": "$\\cos 75^\\circ \\cos 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ + \\cos 90^\\circ) = \\frac{1}{2}(0.5 + 0) = 0.25$",
          "level3": "Áp dụng $\\cos a\\cos b = \\frac{1}{2}[\\cos(a-b) + \\cos(a+b)]$ để tính $P = \\cos 75^\\circ \\cos 15^\\circ$."
        },
        "sceneState": {
          "sceneType": "product-to-sum",
          "stepNumber": 1,
          "focus": "Công thức $\\cos a \\cos b$",
          "targetValue": 0.25,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Công thức $\\sin a \\sin b$",
        "subtitle": "",
        "instruction": "Tính giá trị $Q = \\sin 75^\\circ \\sin 15^\\circ$.",
        "formula": "$\\sin 75^\\circ \\sin 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ - \\cos 90^\\circ) = \\frac{1}{2}(0.5 - 0) = 0.25$",
        "targetValue": 0.25,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\sin 75^\\circ \\sin 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ - \\cos 90^\\circ) = \\frac{1}{2}(0.5 - 0) = 0.25$",
        "hints": {
          "level1": "Tính giá trị $Q = \\sin 75^\\circ \\sin 15^\\circ$.",
          "level2": "$\\sin 75^\\circ \\sin 15^\\circ = \\frac{1}{2}(\\cos 60^\\circ - \\cos 90^\\circ) = \\frac{1}{2}(0.5 - 0) = 0.25$",
          "level3": "Tính giá trị $Q = \\sin 75^\\circ \\sin 15^\\circ$."
        },
        "sceneState": {
          "sceneType": "product-to-sum",
          "stepNumber": 2,
          "focus": "Công thức $\\sin a \\sin b$",
          "targetValue": 0.25,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Công thức $\\sin a \\cos b$",
        "subtitle": "",
        "instruction": "Rút gọn biểu thức $R = 2\\sin 40^\\circ \\cos 10^\\circ - \\sin 50^\\circ$.",
        "formula": "$2\\sin 40^\\circ\\cos 10^\\circ = \\sin 50^\\circ + \\sin 30^\\circ \\Rightarrow R = \\sin 50^\\circ + 0.5 - \\sin 50^\\circ = 0.5$",
        "targetValue": 0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$2\\sin 40^\\circ\\cos 10^\\circ = \\sin 50^\\circ + \\sin 30^\\circ \\Rightarrow R = \\sin 50^\\circ + 0.5 - \\sin 50^\\circ = 0.5$",
        "hints": {
          "level1": "Rút gọn biểu thức $R = 2\\sin 40^\\circ \\cos 10^\\circ - \\sin 50^\\circ$.",
          "level2": "$2\\sin 40^\\circ\\cos 10^\\circ = \\sin 50^\\circ + \\sin 30^\\circ \\Rightarrow R = \\sin 50^\\circ + 0.5 - \\sin 50^\\circ = 0.5$",
          "level3": "Rút gọn biểu thức $R = 2\\sin 40^\\circ \\cos 10^\\circ - \\sin 50^\\circ$."
        },
        "sceneState": {
          "sceneType": "product-to-sum",
          "stepNumber": 3,
          "focus": "Công thức $\\sin a \\cos b$",
          "targetValue": 0.5,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg06-example-a",
        "label": "V? d? A",
        "expression": "Tính $A = \\cos 20^\\circ \\cos 40^\\circ \\cos 80^\\circ = \\frac{1}{2}(\\cos 20^\\circ + \\cos 60^\\circ)\\cos 80^\\circ = \\frac{1}{4}(\\cos 60^\\circ + \\cos 100^\\circ) + \\frac{1}{4}\\cos 80^\\circ = \\frac{1}{8}$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tính $A = \\cos 20^\\circ \\cos 40^\\circ \\cos 80^\\circ = \\frac{1}{2}(\\cos 20^\\circ + \\cos 60^\\circ)\\cos 80^\\circ = \\frac{1}{4}(\\cos 60^\\circ + \\cos 100^\\circ) + \\frac{1}{4}\\cos 80^\\circ = \\frac{1}{8}$.",
        "presetParams": {
          "sceneType": "product-to-sum",
          "sampleId": "cd03-lg06-example-a",
          "stepNumber": 1,
          "targetValue": 0.25
        }
      }
    ]
  },
  {
    "id": "cd03-lg07",
    "moduleId": "CD03",
    "code": "LG07",
    "level": "Thông hiểu",
    "title": "Biến đổi tổng thành tích",
    "shortDesc": "Biến đổi tổng thành tích",
    "xp": 75,
    "sceneType": "sum-to-product",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Công thức $\\cos u + \\cos v$",
        "subtitle": "",
        "instruction": "Tính giá trị $M = \\cos 105^\\circ + \\cos 15^\\circ$ (làm tròn 3 chữ số).",
        "formula": "$\\cos 105^\\circ + \\cos 15^\\circ = 2\\cos 60^\\circ \\cos 45^\\circ = 2 \\cdot \\frac{1}{2} \\cdot \\frac{\\sqrt{2}}{2} = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
        "targetValue": 0.707,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos 105^\\circ + \\cos 15^\\circ = 2\\cos 60^\\circ \\cos 45^\\circ = 2 \\cdot \\frac{1}{2} \\cdot \\frac{\\sqrt{2}}{2} = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
        "hints": {
          "level1": "Tính giá trị $M = \\cos 105^\\circ + \\cos 15^\\circ$ (làm tròn 3 chữ số).",
          "level2": "$\\cos 105^\\circ + \\cos 15^\\circ = 2\\cos 60^\\circ \\cos 45^\\circ = 2 \\cdot \\frac{1}{2} \\cdot \\frac{\\sqrt{2}}{2} = \\frac{\\sqrt{2}}{2} \\approx 0.707$",
          "level3": "Tính giá trị $M = \\cos 105^\\circ + \\cos 15^\\circ$ (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "sum-to-product",
          "stepNumber": 1,
          "focus": "Công thức $\\cos u + \\cos v$",
          "targetValue": 0.707,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Công thức $\\cos u - \\cos v$ (Lưu ý dấu trừ)",
        "subtitle": "",
        "instruction": "Tính giá trị $N = \\cos 105^\\circ - \\cos 15^\\circ$ (làm tròn 3 chữ số).",
        "formula": "$\\cos 105^\\circ - \\cos 15^\\circ = -2\\sin 60^\\circ \\sin 45^\\circ = -\\frac{\\sqrt{6}}{2} \\approx -1.225$",
        "targetValue": -1.225,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos 105^\\circ - \\cos 15^\\circ = -2\\sin 60^\\circ \\sin 45^\\circ = -\\frac{\\sqrt{6}}{2} \\approx -1.225$",
        "hints": {
          "level1": "Tính giá trị $N = \\cos 105^\\circ - \\cos 15^\\circ$ (làm tròn 3 chữ số).",
          "level2": "$\\cos 105^\\circ - \\cos 15^\\circ = -2\\sin 60^\\circ \\sin 45^\\circ = -\\frac{\\sqrt{6}}{2} \\approx -1.225$",
          "level3": "Tính giá trị $N = \\cos 105^\\circ - \\cos 15^\\circ$ (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "sum-to-product",
          "stepNumber": 2,
          "focus": "Công thức $\\cos u - \\cos v$ (Lưu ý dấu trừ)",
          "targetValue": -1.225,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Rút gọn phân thức bằng tổng thành tích",
        "subtitle": "",
        "instruction": "Tính tỉ số $K = \\frac{\\sin 50^\\circ + \\sin 10^\\circ}{\\cos 50^\\circ + \\cos 10^\\circ}$ (làm tròn 3 chữ số).",
        "formula": "$K = \\frac{2\\sin 30^\\circ\\cos 20^\\circ}{2\\cos 30^\\circ\\cos 20^\\circ} = \\tan 30^\\circ = \\frac{\\sqrt{3}}{3} \\approx 0.577$",
        "targetValue": 0.577,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$K = \\frac{2\\sin 30^\\circ\\cos 20^\\circ}{2\\cos 30^\\circ\\cos 20^\\circ} = \\tan 30^\\circ = \\frac{\\sqrt{3}}{3} \\approx 0.577$",
        "hints": {
          "level1": "Tính tỉ số $K = \\frac{\\sin 50^\\circ + \\sin 10^\\circ}{\\cos 50^\\circ + \\cos 10^\\circ}$ (làm tròn 3 chữ số).",
          "level2": "$K = \\frac{2\\sin 30^\\circ\\cos 20^\\circ}{2\\cos 30^\\circ\\cos 20^\\circ} = \\tan 30^\\circ = \\frac{\\sqrt{3}}{3} \\approx 0.577$",
          "level3": "Tính tỉ số $K = \\frac{\\sin 50^\\circ + \\sin 10^\\circ}{\\cos 50^\\circ + \\cos 10^\\circ}$ (làm tròn 3 chữ số)."
        },
        "sceneState": {
          "sceneType": "sum-to-product",
          "stepNumber": 3,
          "focus": "Rút gọn phân thức bằng tổng thành tích",
          "targetValue": 0.577,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg07-example-a",
        "label": "V? d? A",
        "expression": "Rút gọn $P = \\frac{\\sin x + \\sin 2x + \\sin 3x}{\\cos x + \\cos 2x + \\cos 3x} = \\frac{\\sin 2x(2\\cos x + 1)}{\\cos 2x(2\\cos x + 1)} = \\tan 2x$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Rút gọn $P = \\frac{\\sin x + \\sin 2x + \\sin 3x}{\\cos x + \\cos 2x + \\cos 3x} = \\frac{\\sin 2x(2\\cos x + 1)}{\\cos 2x(2\\cos x + 1)} = \\tan 2x$.",
        "presetParams": {
          "sceneType": "sum-to-product",
          "sampleId": "cd03-lg07-example-a",
          "stepNumber": 1,
          "targetValue": 0.707
        }
      }
    ]
  },
  {
    "id": "cd03-lg08",
    "moduleId": "CD03",
    "code": "LG08",
    "level": "Thông hiểu",
    "title": "Hàm số $\\sin$, $\\cos$ và tính tuần hoàn",
    "shortDesc": "Hàm số $\\sin$, $\\cos$ và tính tuần hoàn",
    "xp": 75,
    "sceneType": "sine-cosine-wave",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Tập giá trị và biên độ dao động",
        "subtitle": "",
        "instruction": "Với $-1 \\le \\sin x \\le 1$, tìm giá trị lớn nhất của hàm số $y = 3\\sin x - 1$.",
        "formula": "$-4 \\le 3\\sin x - 1 \\le 2 \\Rightarrow \\max y = 2$",
        "targetValue": 2,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$-4 \\le 3\\sin x - 1 \\le 2 \\Rightarrow \\max y = 2$",
        "hints": {
          "level1": "Với $-1 \\le \\sin x \\le 1$, tìm giá trị lớn nhất của hàm số $y = 3\\sin x - 1$.",
          "level2": "$-4 \\le 3\\sin x - 1 \\le 2 \\Rightarrow \\max y = 2$",
          "level3": "Với $-1 \\le \\sin x \\le 1$, tìm giá trị lớn nhất của hàm số $y = 3\\sin x - 1$."
        },
        "sceneState": {
          "sceneType": "sine-cosine-wave",
          "stepNumber": 1,
          "focus": "Tập giá trị và biên độ dao động",
          "targetValue": 2,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Tính chẵn, lẻ của đồ thị hàm số",
        "subtitle": "",
        "instruction": "Hàm số $y = \\cos x$ là hàm chẵn nên đồ thị nhận trục nào làm trục đối xứng?",
        "formula": "$\\cos(-x) = \\cos x \\ (\\forall x \\in \\mathbb{R})$",
        "targetValue": "Oy",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos(-x) = \\cos x \\ (\\forall x \\in \\mathbb{R})$",
        "hints": {
          "level1": "Hàm số $y = \\cos x$ là hàm chẵn nên đồ thị nhận trục nào làm trục đối xứng?",
          "level2": "$\\cos(-x) = \\cos x \\ (\\forall x \\in \\mathbb{R})$",
          "level3": "Hàm số $y = \\cos x$ là hàm chẵn nên đồ thị nhận trục nào làm trục đối xứng?"
        },
        "sceneState": {
          "sceneType": "sine-cosine-wave",
          "stepNumber": 2,
          "focus": "Tính chẵn, lẻ của đồ thị hàm số",
          "targetValue": "Oy",
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Xác định chu kỳ tuần hoàn $T$",
        "subtitle": "",
        "instruction": "Tìm chu kỳ tuần hoàn $T$ của hàm số $y = \\cos(4x + \\frac{\\pi}{3})$ dưới dạng hệ số nhân với $\\pi$.",
        "formula": "$T = \\frac{2\\pi}{4} = \\frac{\\pi}{2} = 0.5\\pi$",
        "targetValue": 0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$T = \\frac{2\\pi}{4} = \\frac{\\pi}{2} = 0.5\\pi$",
        "hints": {
          "level1": "Tìm chu kỳ tuần hoàn $T$ của hàm số $y = \\cos(4x + \\frac{\\pi}{3})$ dưới dạng hệ số nhân với $\\pi$.",
          "level2": "$T = \\frac{2\\pi}{4} = \\frac{\\pi}{2} = 0.5\\pi$",
          "level3": "Tìm chu kỳ tuần hoàn $T$ của hàm số $y = \\cos(4x + \\frac{\\pi}{3})$ dưới dạng hệ số nhân với $\\pi$."
        },
        "sceneState": {
          "sceneType": "sine-cosine-wave",
          "stepNumber": 3,
          "focus": "Xác định chu kỳ tuần hoàn $T$",
          "targetValue": 0.5,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg08-example-a",
        "label": "V? d? A",
        "expression": "Tìm GTLN và GTNN của $y = 2\\cos^2 x + 4\\sin x - 1 = -2t^2 + 4t + 1 \\ (t \\in [-1;1]) \\Rightarrow \\max y = 3, \\ \\min y = -5$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tìm GTLN và GTNN của $y = 2\\cos^2 x + 4\\sin x - 1 = -2t^2 + 4t + 1 \\ (t \\in [-1;1]) \\Rightarrow \\max y = 3, \\ \\min y = -5$.",
        "presetParams": {
          "sceneType": "sine-cosine-wave",
          "sampleId": "cd03-lg08-example-a",
          "stepNumber": 1,
          "targetValue": 2
        }
      }
    ]
  },
  {
    "id": "cd03-lg09",
    "moduleId": "CD03",
    "code": "LG09",
    "level": "Thông hiểu",
    "title": "Hàm số $\\tan$, $\\cot$ và mô hình điều hòa",
    "shortDesc": "Hàm số $\\tan$, $\\cot$ và mô hình điều hòa",
    "xp": 75,
    "sceneType": "tan-cot-harmonic",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Điều kiện xác định và đường tiệm cận đứng của $y = \\tan x$",
        "subtitle": "",
        "instruction": "Trên khoảng $(0; 2\\pi)$, đồ thị hàm số $y = \\tan x$ có bao nhiêu đường tiệm cận đứng?",
        "formula": "$\\cos x = 0 \\text{ trên } (0; 2\\pi) \\Leftrightarrow x = \\frac{\\pi}{2} \\text{ hoặc } x = \\frac{3\\pi}{2}$",
        "targetValue": 2,
        "unit": "đường",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos x = 0 \\text{ trên } (0; 2\\pi) \\Leftrightarrow x = \\frac{\\pi}{2} \\text{ hoặc } x = \\frac{3\\pi}{2}$",
        "hints": {
          "level1": "Trên khoảng $(0; 2\\pi)$, đồ thị hàm số $y = \\tan x$ có bao nhiêu đường tiệm cận đứng?",
          "level2": "$\\cos x = 0 \\text{ trên } (0; 2\\pi) \\Leftrightarrow x = \\frac{\\pi}{2} \\text{ hoặc } x = \\frac{3\\pi}{2}$",
          "level3": "Trên khoảng $(0; 2\\pi)$, đồ thị hàm số $y = \\tan x$ có bao nhiêu đường tiệm cận đứng?"
        },
        "sceneState": {
          "sceneType": "tan-cot-harmonic",
          "stepNumber": 1,
          "focus": "Điều kiện xác định và đường tiệm cận đứng của $y = \\tan x$",
          "targetValue": 2,
          "unit": "đường"
        }
      },
      {
        "stepNumber": 2,
        "title": "Chu kỳ cơ bản của hàm số $y = \\tan(2x - \\frac{\\pi}{4})$",
        "subtitle": "",
        "instruction": "Tính chu kỳ tuần hoàn của $y = \\tan(2x - \\frac{\\pi}{4})$ theo đơn vị $\\pi$.",
        "formula": "$T = \\frac{\\pi}{2} = 0.5\\pi$",
        "targetValue": 0.5,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$T = \\frac{\\pi}{2} = 0.5\\pi$",
        "hints": {
          "level1": "Tính chu kỳ tuần hoàn của $y = \\tan(2x - \\frac{\\pi}{4})$ theo đơn vị $\\pi$.",
          "level2": "$T = \\frac{\\pi}{2} = 0.5\\pi$",
          "level3": "Tính chu kỳ tuần hoàn của $y = \\tan(2x - \\frac{\\pi}{4})$ theo đơn vị $\\pi$."
        },
        "sceneState": {
          "sceneType": "tan-cot-harmonic",
          "stepNumber": 2,
          "focus": "Chu kỳ cơ bản của hàm số $y = \\tan(2x - \\frac{\\pi}{4})$",
          "targetValue": 0.5,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Đọc tham số mô hình dao động điều hòa",
        "subtitle": "",
        "instruction": "Cho phương trình $x(t) = 5\\cos(2\\pi t + \\frac{\\pi}{6})$ (cm). Xác định chu kỳ dao động $T$ (giây).",
        "formula": "$\\omega = 2\\pi \\Rightarrow T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{2\\pi} = 1 \\text{ (giây)}$",
        "targetValue": 1,
        "unit": "giây",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\omega = 2\\pi \\Rightarrow T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{2\\pi} = 1 \\text{ (giây)}$",
        "hints": {
          "level1": "Cho phương trình $x(t) = 5\\cos(2\\pi t + \\frac{\\pi}{6})$ (cm). Xác định chu kỳ dao động $T$ (giây).",
          "level2": "$\\omega = 2\\pi \\Rightarrow T = \\frac{2\\pi}{\\omega} = \\frac{2\\pi}{2\\pi} = 1 \\text{ (giây)}$",
          "level3": "Cho phương trình $x(t) = 5\\cos(2\\pi t + \\frac{\\pi}{6})$ (cm). Xác định chu kỳ dao động $T$ (giây)."
        },
        "sceneState": {
          "sceneType": "tan-cot-harmonic",
          "stepNumber": 3,
          "focus": "Đọc tham số mô hình dao động điều hòa",
          "targetValue": 1,
          "unit": "giây"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg09-example-a",
        "label": "V? d? A",
        "expression": "Tìm tập xác định của $y = \\cot(2x - \\frac{\\pi}{3}) \\Rightarrow 2x - \\frac{\\pi}{3} \\neq k\\pi \\Leftrightarrow x \\neq \\frac{\\pi}{6} + k\\frac{\\pi}{2}$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Tìm tập xác định của $y = \\cot(2x - \\frac{\\pi}{3}) \\Rightarrow 2x - \\frac{\\pi}{3} \\neq k\\pi \\Leftrightarrow x \\neq \\frac{\\pi}{6} + k\\frac{\\pi}{2}$.",
        "presetParams": {
          "sceneType": "tan-cot-harmonic",
          "sampleId": "cd03-lg09-example-a",
          "stepNumber": 1,
          "targetValue": 2
        }
      }
    ]
  },
  {
    "id": "cd03-lg10",
    "moduleId": "CD03",
    "code": "LG10",
    "level": "Thông hiểu",
    "title": "Tính biến thiên và đồ thị lượng giác",
    "shortDesc": "Tính biến thiên và đồ thị lượng giác",
    "xp": 75,
    "sceneType": "monotonicity-graph",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Chiều biến thiên của $y = \\sin x$ trên $[-\\frac{\\pi}{2}; \\frac{\\pi}{2}]$",
        "subtitle": "",
        "instruction": "Hàm số $y = \\sin x$ đồng biến hay nghịch biến trên khoảng $[-\\frac{\\pi}{2}; \\frac{\\pi}{2}]$?",
        "formula": "`increasing` (Đồng biến)",
        "targetValue": "increasing",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "`increasing` (Đồng biến)",
        "hints": {
          "level1": "Hàm số $y = \\sin x$ đồng biến hay nghịch biến trên khoảng $[-\\frac{\\pi}{2}; \\frac{\\pi}{2}]$?",
          "level2": "`increasing` (Đồng biến)",
          "level3": "Hàm số $y = \\sin x$ đồng biến hay nghịch biến trên khoảng $[-\\frac{\\pi}{2}; \\frac{\\pi}{2}]$?"
        },
        "sceneState": {
          "sceneType": "monotonicity-graph",
          "stepNumber": 1,
          "focus": "Chiều biến thiên của $y = \\sin x$ trên $[-\\frac{\\pi}{2}; \\frac{\\pi}{2}]$",
          "targetValue": "increasing",
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Chiều biến thiên của $y = \\cos x$ trên $(0; \\pi)$",
        "subtitle": "",
        "instruction": "So sánh $\\cos 40^\\circ$ và $\\cos 70^\\circ$: giá trị nào lớn hơn?",
        "formula": "$y = \\cos x \\text{ nghịch biến trên } (0; \\pi) \\Rightarrow \\cos 40^\\circ > \\cos 70^\\circ$",
        "targetValue": "cos40",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$y = \\cos x \\text{ nghịch biến trên } (0; \\pi) \\Rightarrow \\cos 40^\\circ > \\cos 70^\\circ$",
        "hints": {
          "level1": "So sánh $\\cos 40^\\circ$ và $\\cos 70^\\circ$: giá trị nào lớn hơn?",
          "level2": "$y = \\cos x \\text{ nghịch biến trên } (0; \\pi) \\Rightarrow \\cos 40^\\circ > \\cos 70^\\circ$",
          "level3": "So sánh $\\cos 40^\\circ$ và $\\cos 70^\\circ$: giá trị nào lớn hơn?"
        },
        "sceneState": {
          "sceneType": "monotonicity-graph",
          "stepNumber": 2,
          "focus": "Chiều biến thiên của $y = \\cos x$ trên $(0; \\pi)$",
          "targetValue": "cos40",
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Tính chất đặc trưng của mỗi nhánh đồ thị $y = \\tan x$",
        "subtitle": "",
        "instruction": "Trên mỗi khoảng xác định $\\left(-\\frac{\\pi}{2} + k\\pi; \\frac{\\pi}{2} + k\\pi\\right)$, đồ thị $y = \\tan x$ luôn có tính chất gì?",
        "formula": "`strictly_increasing` (Tăng nghiêm ngặt)",
        "targetValue": "strictly_increasing",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "`strictly_increasing` (Tăng nghiêm ngặt)",
        "hints": {
          "level1": "Trên mỗi khoảng xác định $\\left(-\\frac{\\pi}{2} + k\\pi; \\frac{\\pi}{2} + k\\pi\\right)$, đồ thị $y = \\tan x$ luôn có tính chất gì?",
          "level2": "`strictly_increasing` (Tăng nghiêm ngặt)",
          "level3": "Trên mỗi khoảng xác định $\\left(-\\frac{\\pi}{2} + k\\pi; \\frac{\\pi}{2} + k\\pi\\right)$, đồ thị $y = \\tan x$ luôn có tính chất gì?"
        },
        "sceneState": {
          "sceneType": "monotonicity-graph",
          "stepNumber": 3,
          "focus": "Tính chất đặc trưng của mỗi nhánh đồ thị $y = \\tan x$",
          "targetValue": "strictly_increasing",
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg10-example-a",
        "label": "V? d? A",
        "expression": "Hàm số $y = \\sin x$ nghịch biến trên khoảng $\\left(\\frac{\\pi}{2}; \\frac{3\\pi}{2}\\right)$ (nửa đường tròn bên trái).",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Hàm số $y = \\sin x$ nghịch biến trên khoảng $\\left(\\frac{\\pi}{2}; \\frac{3\\pi}{2}\\right)$ (nửa đường tròn bên trái).",
        "presetParams": {
          "sceneType": "monotonicity-graph",
          "sampleId": "cd03-lg10-example-a",
          "stepNumber": 1,
          "targetValue": ""
        }
      }
    ]
  },
  {
    "id": "cd03-lg11",
    "moduleId": "CD03",
    "code": "LG11",
    "level": "Vận dụng",
    "title": "Phương trình $\\sin$ và $\\cos$ cơ bản",
    "shortDesc": "Phương trình $\\sin$ và $\\cos$ cơ bản",
    "xp": 85,
    "sceneType": "basic-trig-equations",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Kiểm tra điều kiện có nghiệm $|m| \\le 1$",
        "subtitle": "",
        "instruction": "Phương trình $\\sin x = 1.5$ có bao nhiêu nghiệm trên $\\mathbb{R}$?",
        "formula": "$|m| = 1.5 > 1 \\Rightarrow 0 \\text{ nghiệm}$",
        "targetValue": 0,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "$|m| = 1.5 > 1 \\Rightarrow 0 \\text{ nghiệm}$",
        "hints": {
          "level1": "Phương trình $\\sin x = 1.5$ có bao nhiêu nghiệm trên $\\mathbb{R}$?",
          "level2": "$|m| = 1.5 > 1 \\Rightarrow 0 \\text{ nghiệm}$",
          "level3": "Phương trình $\\sin x = 1.5$ có bao nhiêu nghiệm trên $\\mathbb{R}$?"
        },
        "sceneState": {
          "sceneType": "basic-trig-equations",
          "stepNumber": 1,
          "focus": "Kiểm tra điều kiện có nghiệm $|m| \\le 1$",
          "targetValue": 0,
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Hai họ nghiệm của phương trình $\\sin x = \\frac{1}{2}$",
        "subtitle": "",
        "instruction": "Trên khoảng $[0; 2\\pi)$, phương trình $\\sin x = \\frac{1}{2}$ có nghiệm nhỏ nhất là $30^\\circ$. Nghiệm thứ hai bằng bao nhiêu độ?",
        "formula": "$x = 180^\\circ - 30^\\circ = 150^\\circ$",
        "targetValue": 150,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "$x = 180^\\circ - 30^\\circ = 150^\\circ$",
        "hints": {
          "level1": "Trên khoảng $[0; 2\\pi)$, phương trình $\\sin x = \\frac{1}{2}$ có nghiệm nhỏ nhất là $30^\\circ$. Nghiệm thứ hai bằng bao nhiêu độ?",
          "level2": "$x = 180^\\circ - 30^\\circ = 150^\\circ$",
          "level3": "Trên khoảng $[0; 2\\pi)$, phương trình $\\sin x = \\frac{1}{2}$ có nghiệm nhỏ nhất là $30^\\circ$. Nghiệm thứ hai bằng bao nhiêu độ?"
        },
        "sceneState": {
          "sceneType": "basic-trig-equations",
          "stepNumber": 2,
          "focus": "Hai họ nghiệm của phương trình $\\sin x = \\frac{1}{2}$",
          "targetValue": 150,
          "unit": "độ"
        }
      },
      {
        "stepNumber": 3,
        "title": "Đếm số nghiệm phương trình $\\cos 2x = -\\frac{\\sqrt{2}}{2}$ trên $[0; 2\\pi]$",
        "subtitle": "",
        "instruction": "Giải $\\cos 2x = -\\frac{\\sqrt{2}}{2} \\Leftrightarrow x = \\pm \\frac{3\\pi}{8} + k\\pi$. Đếm xem có bao nhiêu nghiệm $x \\in [0; 2\\pi]$.",
        "formula": "Các nghiệm thuộc $[0; 2\\pi]$ gồm $\\frac{3\\pi}{8}, \\frac{5\\pi}{8}, \\frac{11\\pi}{8}, \\frac{13\\pi}{8}$ ($4$ nghiệm).",
        "targetValue": 4,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Các nghiệm thuộc $[0; 2\\pi]$ gồm $\\frac{3\\pi}{8}, \\frac{5\\pi}{8}, \\frac{11\\pi}{8}, \\frac{13\\pi}{8}$ ($4$ nghiệm).",
        "hints": {
          "level1": "Giải $\\cos 2x = -\\frac{\\sqrt{2}}{2} \\Leftrightarrow x = \\pm \\frac{3\\pi}{8} + k\\pi$. Đếm xem có bao nhiêu nghiệm $x \\in [0; 2\\pi]$.",
          "level2": "Các nghiệm thuộc $[0; 2\\pi]$ gồm $\\frac{3\\pi}{8}, \\frac{5\\pi}{8}, \\frac{11\\pi}{8}, \\frac{13\\pi}{8}$ ($4$ nghiệm).",
          "level3": "Giải $\\cos 2x = -\\frac{\\sqrt{2}}{2} \\Leftrightarrow x = \\pm \\frac{3\\pi}{8} + k\\pi$. Đếm xem có bao nhiêu nghiệm $x \\in [0; 2\\pi]$."
        },
        "sceneState": {
          "sceneType": "basic-trig-equations",
          "stepNumber": 3,
          "focus": "Đếm số nghiệm phương trình $\\cos 2x = -\\frac{\\sqrt{2}}{2}$ trên $[0; 2\\pi]$",
          "targetValue": 4,
          "unit": ""
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg11-example-a",
        "label": "V? d? A",
        "expression": "Giải $\\sin\\left(2x - \\frac{\\pi}{3}\\right) = \\frac{\\sqrt{3}}{2} \\Leftrightarrow \\left[\\begin{array}{l} x = \\frac{\\pi}{3} + k\\pi \\\\ x = \\frac{\\pi}{2} + k\\pi \\end{array}\\right.$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Giải $\\sin\\left(2x - \\frac{\\pi}{3}\\right) = \\frac{\\sqrt{3}}{2} \\Leftrightarrow \\left[\\begin{array}{l} x = \\frac{\\pi}{3} + k\\pi \\\\ x = \\frac{\\pi}{2} + k\\pi \\end{array}\\right.$.",
        "presetParams": {
          "sceneType": "basic-trig-equations",
          "sampleId": "cd03-lg11-example-a",
          "stepNumber": 1,
          "targetValue": 0
        }
      }
    ]
  },
  {
    "id": "cd03-lg12",
    "moduleId": "CD03",
    "code": "LG12",
    "level": "Vận dụng",
    "title": "Phương trình $\\tan$, $\\cot$ và lọc nghiệm",
    "shortDesc": "Phương trình $\\tan$, $\\cot$ và lọc nghiệm",
    "xp": 85,
    "sceneType": "tan-cot-equations",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Biểu diễn nghiệm của $\\tan x = \\sqrt{3}$",
        "subtitle": "",
        "instruction": "Phương trình $\\tan x = \\sqrt{3} \\Leftrightarrow x = \\frac{\\pi}{3} + k\\pi$. Trên $[0; 2\\pi)$, có bao nhiêu điểm biểu diễn nghiệm trên đường tròn?",
        "formula": "`2` (điểm: $\\frac{\\pi}{3}$ và $\\frac{4\\pi}{3}$)",
        "targetValue": "",
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "`2` (điểm: $\\frac{\\pi}{3}$ và $\\frac{4\\pi}{3}$)",
        "hints": {
          "level1": "Phương trình $\\tan x = \\sqrt{3} \\Leftrightarrow x = \\frac{\\pi}{3} + k\\pi$. Trên $[0; 2\\pi)$, có bao nhiêu điểm biểu diễn nghiệm trên đường tròn?",
          "level2": "`2` (điểm: $\\frac{\\pi}{3}$ và $\\frac{4\\pi}{3}$)",
          "level3": "Phương trình $\\tan x = \\sqrt{3} \\Leftrightarrow x = \\frac{\\pi}{3} + k\\pi$. Trên $[0; 2\\pi)$, có bao nhiêu điểm biểu diễn nghiệm trên đường tròn?"
        },
        "sceneState": {
          "sceneType": "tan-cot-equations",
          "stepNumber": 1,
          "focus": "Biểu diễn nghiệm của $\\tan x = \\sqrt{3}$",
          "targetValue": "",
          "unit": ""
        }
      },
      {
        "stepNumber": 2,
        "title": "Kỹ thuật lọc nghiệm ngoại lai bằng đường tròn",
        "subtitle": "",
        "instruction": "Giải phương trình $\\frac{\\sin 2x}{\\cos x} = 0$. Tử số $\\sin 2x = 0 \\Leftrightarrow x = k\\frac{\\pi}{2}$ ($4$ điểm ngọn). Sau khi đối chiếu điều kiện mẫu $\\cos x \\neq 0$, còn lại bao nhiêu điểm ngọn thỏa mãn?",
        "formula": "Loại $x = \\frac{\\pi}{2} + k\\pi \\Rightarrow$ còn lại $x = k\\pi$ ($2$ điểm ngọn: $0$ và $\\pi$).",
        "targetValue": 2,
        "unit": "",
        "tolerance": 0.0,
        "pedagogicalNote": "Loại $x = \\frac{\\pi}{2} + k\\pi \\Rightarrow$ còn lại $x = k\\pi$ ($2$ điểm ngọn: $0$ và $\\pi$).",
        "hints": {
          "level1": "Giải phương trình $\\frac{\\sin 2x}{\\cos x} = 0$. Tử số $\\sin 2x = 0 \\Leftrightarrow x = k\\frac{\\pi}{2}$ ($4$ điểm ngọn). Sau khi đối chiếu điều kiện mẫu $\\cos x \\neq 0$, còn lại bao nhiêu điểm ngọn thỏa mãn?",
          "level2": "Loại $x = \\frac{\\pi}{2} + k\\pi \\Rightarrow$ còn lại $x = k\\pi$ ($2$ điểm ngọn: $0$ và $\\pi$).",
          "level3": "Giải phương trình $\\frac{\\sin 2x}{\\cos x} = 0$. Tử số $\\sin 2x = 0 \\Leftrightarrow x = k\\frac{\\pi}{2}$ ($4$ điểm ngọn). Sau khi đối chiếu điều kiện mẫu $\\cos x \\neq 0$, còn lại bao nhiêu điểm ngọn thỏa mãn?"
        },
        "sceneState": {
          "sceneType": "tan-cot-equations",
          "stepNumber": 2,
          "focus": "Kỹ thuật lọc nghiệm ngoại lai bằng đường tròn",
          "targetValue": 2,
          "unit": ""
        }
      },
      {
        "stepNumber": 3,
        "title": "Giải phương trình $\\cot(2x + \\frac{\\pi}{6}) = -1$",
        "subtitle": "",
        "instruction": "Từ họ nghiệm $x = -\\frac{5\\pi}{24} + k\\frac{\\pi}{2}$, tìm nghiệm dương nhỏ nhất (tính theo độ).",
        "formula": "Với $k = 1 \\Rightarrow x = -\\frac{5\\pi}{24} + \\frac{12\\pi}{24} = \\frac{7\\pi}{24} = \\frac{7 \\cdot 180^\\circ}{24} = 52.5^\\circ$.",
        "targetValue": 52.5,
        "unit": "độ",
        "tolerance": 0.0,
        "pedagogicalNote": "Với $k = 1 \\Rightarrow x = -\\frac{5\\pi}{24} + \\frac{12\\pi}{24} = \\frac{7\\pi}{24} = \\frac{7 \\cdot 180^\\circ}{24} = 52.5^\\circ$.",
        "hints": {
          "level1": "Từ họ nghiệm $x = -\\frac{5\\pi}{24} + k\\frac{\\pi}{2}$, tìm nghiệm dương nhỏ nhất (tính theo độ).",
          "level2": "Với $k = 1 \\Rightarrow x = -\\frac{5\\pi}{24} + \\frac{12\\pi}{24} = \\frac{7\\pi}{24} = \\frac{7 \\cdot 180^\\circ}{24} = 52.5^\\circ$.",
          "level3": "Từ họ nghiệm $x = -\\frac{5\\pi}{24} + k\\frac{\\pi}{2}$, tìm nghiệm dương nhỏ nhất (tính theo độ)."
        },
        "sceneState": {
          "sceneType": "tan-cot-equations",
          "stepNumber": 3,
          "focus": "Giải phương trình $\\cot(2x + \\frac{\\pi}{6}) = -1$",
          "targetValue": 52.5,
          "unit": "độ"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg12-example-a",
        "label": "V? d? A",
        "expression": "Giải $\\tan x + \\cot x = 2$ (ĐK: $\\sin 2x \\neq 0$) $\\Leftrightarrow (\\tan x - 1)^2 = 0 \\Leftrightarrow x = \\frac{\\pi}{4} + k\\pi$.",
        "tag": "B?i t?p m?u",
        "solutionSummary": "Giải $\\tan x + \\cot x = 2$ (ĐK: $\\sin 2x \\neq 0$) $\\Leftrightarrow (\\tan x - 1)^2 = 0 \\Leftrightarrow x = \\frac{\\pi}{4} + k\\pi$.",
        "presetParams": {
          "sceneType": "tan-cot-equations",
          "sampleId": "cd03-lg12-example-a",
          "stepNumber": 1,
          "targetValue": ""
        }
      }
    ]
  },
  {
    "id": "cd03-lg13",
    "moduleId": "CD03",
    "code": "LG13",
    "level": "Vận dụng",
    "title": "Vận dụng thực tiễn và mô hình hóa (Đu quay Ferris Wheel)",
    "shortDesc": "Vận dụng thực tiễn và mô hình hóa (Đu quay Ferris Wheel)",
    "xp": 95,
    "sceneType": "ferris-wheel-model",
    "steps": [
      {
        "stepNumber": 1,
        "title": "Thiết lập thông số hình học của đu quay",
        "subtitle": "",
        "instruction": "Đu quay có bán kính $R = 20\\text{ m}$, tâm quay cao $d = 25\\text{ m}$, chu kỳ $T = 12\\text{ phút}$. Khi cabin ở vị trí thấp nhất (đáy đu quay tại $t = 0$), hành khách cách mặt đất bao nhiêu mét?",
        "formula": "$h_{\\min} = d - R = 25 - 20 = 5 \\text{ (m)}$",
        "targetValue": 5,
        "unit": "mét",
        "tolerance": 0.0,
        "pedagogicalNote": "$h_{\\min} = d - R = 25 - 20 = 5 \\text{ (m)}$",
        "hints": {
          "level1": "Đu quay có bán kính $R = 20\\text{ m}$, tâm quay cao $d = 25\\text{ m}$, chu kỳ $T = 12\\text{ phút}$. Khi cabin ở vị trí thấp nhất (đáy đu quay tại $t = 0$), hành khách cách mặt đất bao nhiêu mét?",
          "level2": "$h_{\\min} = d - R = 25 - 20 = 5 \\text{ (m)}$",
          "level3": "Đu quay có bán kính $R = 20\\text{ m}$, tâm quay cao $d = 25\\text{ m}$, chu kỳ $T = 12\\text{ phút}$. Khi cabin ở vị trí thấp nhất (đáy đu quay tại $t = 0$), hành khách cách mặt đất bao nhiêu mét?"
        },
        "sceneState": {
          "sceneType": "ferris-wheel-model",
          "stepNumber": 1,
          "focus": "Thiết lập thông số hình học của đu quay",
          "targetValue": 5,
          "unit": "mét"
        }
      },
      {
        "stepNumber": 2,
        "title": "Xây dựng hàm số độ cao $h(t)$ theo thời gian",
        "subtitle": "",
        "instruction": "Sau $t = 3$ phút ($\\frac{1}{4}$ vòng quay), cabin đi tới vị trí ngang tầm trục quay. Tính độ cao $h(3)$.",
        "formula": "$h(3) = 25 - 20\\cos\\left(\\frac{2\\pi}{12} \\cdot 3\\right) = 25 - 20\\cos\\frac{\\pi}{2} = 25 \\text{ (m)}$",
        "targetValue": 25,
        "unit": "mét",
        "tolerance": 0.0,
        "pedagogicalNote": "$h(3) = 25 - 20\\cos\\left(\\frac{2\\pi}{12} \\cdot 3\\right) = 25 - 20\\cos\\frac{\\pi}{2} = 25 \\text{ (m)}$",
        "hints": {
          "level1": "Sau $t = 3$ phút ($\\frac{1}{4}$ vòng quay), cabin đi tới vị trí ngang tầm trục quay. Tính độ cao $h(3)$.",
          "level2": "$h(3) = 25 - 20\\cos\\left(\\frac{2\\pi}{12} \\cdot 3\\right) = 25 - 20\\cos\\frac{\\pi}{2} = 25 \\text{ (m)}$",
          "level3": "Sau $t = 3$ phút ($\\frac{1}{4}$ vòng quay), cabin đi tới vị trí ngang tầm trục quay. Tính độ cao $h(3)$."
        },
        "sceneState": {
          "sceneType": "ferris-wheel-model",
          "stepNumber": 2,
          "focus": "Xây dựng hàm số độ cao $h(t)$ theo thời gian",
          "targetValue": 25,
          "unit": "mét"
        }
      },
      {
        "stepNumber": 3,
        "title": "Tìm thời điểm lần đầu tiên hành khách đạt độ cao $35\\text{ m}$",
        "subtitle": "",
        "instruction": "Giải phương trình $25 - 20\\cos\\left(\\frac{\\pi}{6}t\\right) = 35$ để tìm thời điểm $t > 0$ đầu tiên cabin ở độ cao $35\\text{ m}$ (tính theo phút).",
        "formula": "$\\cos\\left(\\frac{\\pi}{6}t\\right) = -\\frac{10}{20} = -0.5 \\Rightarrow \\frac{\\pi}{6}t = \\frac{2\\pi}{3} \\Rightarrow t = 4 \\text{ (phút)}$",
        "targetValue": 4,
        "unit": "phút",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\cos\\left(\\frac{\\pi}{6}t\\right) = -\\frac{10}{20} = -0.5 \\Rightarrow \\frac{\\pi}{6}t = \\frac{2\\pi}{3} \\Rightarrow t = 4 \\text{ (phút)}$",
        "hints": {
          "level1": "Giải phương trình $25 - 20\\cos\\left(\\frac{\\pi}{6}t\\right) = 35$ để tìm thời điểm $t > 0$ đầu tiên cabin ở độ cao $35\\text{ m}$ (tính theo phút).",
          "level2": "$\\cos\\left(\\frac{\\pi}{6}t\\right) = -\\frac{10}{20} = -0.5 \\Rightarrow \\frac{\\pi}{6}t = \\frac{2\\pi}{3} \\Rightarrow t = 4 \\text{ (phút)}$",
          "level3": "Giải phương trình $25 - 20\\cos\\left(\\frac{\\pi}{6}t\\right) = 35$ để tìm thời điểm $t > 0$ đầu tiên cabin ở độ cao $35\\text{ m}$ (tính theo phút)."
        },
        "sceneState": {
          "sceneType": "ferris-wheel-model",
          "stepNumber": 3,
          "focus": "Tìm thời điểm lần đầu tiên hành khách đạt độ cao $35\\text{ m}$",
          "targetValue": 4,
          "unit": "phút"
        }
      },
      {
        "stepNumber": 4,
        "title": "Tổng thời gian hành khách ở độ cao từ $35\\text{ m}$ trở lên trong 1 vòng quay",
        "subtitle": "",
        "instruction": "Cabin đạt $35\\text{ m}$ lúc đi lên ở $t_1 = 4$ phút và lúc đi xuống ở $t_2 = 12 - 4 = 8$ phút. Vậy trong 1 vòng quay $12$ phút, khách ở độ cao $\\ge 35\\text{ m}$ trong bao nhiêu phút?",
        "formula": "$\\Delta t = t_2 - t_1 = 8 - 4 = 4 \\text{ (phút)}$",
        "targetValue": 4,
        "unit": "phút",
        "tolerance": 0.0,
        "pedagogicalNote": "$\\Delta t = t_2 - t_1 = 8 - 4 = 4 \\text{ (phút)}$",
        "hints": {
          "level1": "Cabin đạt $35\\text{ m}$ lúc đi lên ở $t_1 = 4$ phút và lúc đi xuống ở $t_2 = 12 - 4 = 8$ phút. Vậy trong 1 vòng quay $12$ phút, khách ở độ cao $\\ge 35\\text{ m}$ trong bao nhiêu phút?",
          "level2": "$\\Delta t = t_2 - t_1 = 8 - 4 = 4 \\text{ (phút)}$",
          "level3": "Cabin đạt $35\\text{ m}$ lúc đi lên ở $t_1 = 4$ phút và lúc đi xuống ở $t_2 = 12 - 4 = 8$ phút. Vậy trong 1 vòng quay $12$ phút, khách ở độ cao $\\ge 35\\text{ m}$ trong bao nhiêu phút?"
        },
        "sceneState": {
          "sceneType": "ferris-wheel-model",
          "stepNumber": 4,
          "focus": "Tổng thời gian hành khách ở độ cao từ $35\\text{ m}$ trở lên trong 1 vòng quay",
          "targetValue": 4,
          "unit": "phút"
        }
      }
    ],
    "sampleProblems": [
      {
        "id": "cd03-lg13-example-a",
        "label": "V? d? A",
        "expression": "Bán kính $R = 50\\text{ m}$, tâm cao $d = 55\\text{ m}$, chu kỳ $T = 15\\text{ phút} \\Rightarrow h(t) = 55 - 50\\cos\\left(\\frac{2\\pi}{15}t\\right) \\Rightarrow h(5) = 80\\text{ m}$.",
        "tag": "Đu quay Sun Wheel",
        "solutionSummary": "Bán kính $R = 50\\text{ m}$, tâm cao $d = 55\\text{ m}$, chu kỳ $T = 15\\text{ phút} \\Rightarrow h(t) = 55 - 50\\cos\\left(\\frac{2\\pi}{15}t\\right) \\Rightarrow h(5) = 80\\text{ m}$.",
        "presetParams": {
          "sceneType": "ferris-wheel-model",
          "sampleId": "cd03-lg13-example-a",
          "stepNumber": 1,
          "targetValue": 5
        }
      },
      {
        "id": "cd03-lg13-example-b",
        "label": "V? d? B",
        "expression": "Mực nước cảng biển $h(t) = 3 + 1.5\\sin\\left(\\frac{\\pi}{6}t\\right)$ (m) đạt đỉnh $h_{\\max} = 4.5\\text{ m}$ tại $t = 3\\text{h}$ và đạt $3.75\\text{ m}$ lần đầu tại $t = 1\\text{h}$.",
        "tag": "Mô hình thủy triều",
        "solutionSummary": "Mực nước cảng biển $h(t) = 3 + 1.5\\sin\\left(\\frac{\\pi}{6}t\\right)$ (m) đạt đỉnh $h_{\\max} = 4.5\\text{ m}$ tại $t = 3\\text{h}$ và đạt $3.75\\text{ m}$ lần đầu tại $t = 1\\text{h}$.",
        "presetParams": {
          "sceneType": "ferris-wheel-model",
          "sampleId": "cd03-lg13-example-b",
          "stepNumber": 1,
          "targetValue": 5
        }
      }
    ]
  }
];
export const CD02_LESSONS=ALL_LESSONS.filter(x=>x.moduleId==="CD02"); export const CD03_LESSONS=ALL_LESSONS.filter(x=>x.moduleId==="CD03"); export const getCurriculumLesson=(id:string)=>ALL_LESSONS.find(x=>x.id===id);
