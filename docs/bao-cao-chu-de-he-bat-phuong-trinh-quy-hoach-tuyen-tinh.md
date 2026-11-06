# MathSTEP: Thiết kế học liệu và mô hình toán học tương tác cho chủ đề hệ bất phương trình bậc nhất hai ẩn và bài toán tối ưu tuyến tính lớp 10

## Bản biên tập theo góp ý

**Phạm vi bản này.** Tài liệu đã tiếp nhận góp ý trong `KHKT.docx` và nội dung định hướng người dùng cung cấp. Tệp gốc đề cương MathSTEP, bài kiểm tra học sinh và dữ liệu lớp học không có trong thư mục; vì vậy đây là bản chỉnh theo feedback cho mạch chủ đề 1, không phải hiệu đính từng câu của đề cương gốc. Các mã lỗi và nhận định về học sinh là khung phân tích cần kiểm chứng bằng minh chứng thật, không phải kết quả thực nghiệm đã có.

## Tóm tắt định hướng sau khi tiếp nhận feedback KHKT.docx

Báo cáo đặt chủ đề này trong MathSTEP, một hệ thống học liệu và mô hình toán học tương tác dự kiến phục vụ ba mạch nội dung: tối ưu tuyến tính, hình học không gian và lượng giác. Tài liệu này khoanh vào mạch thứ nhất để làm rõ chiều sâu Toán học và phương án đánh giá; mô hình 2D/3D, AI hay AR là phương tiện hỗ trợ việc học. Hệ thống câu hỏi gợi mở là một thành phần sư phạm đi cùng cấu trúc kiến thức chuẩn, phân loại biểu hiện sai, và nhiệm vụ luyện tập/chuyển giao.

Chương trình môn Toán GDPT 2018 yêu cầu học sinh nhận biết bất phương trình và hệ bất phương trình bậc nhất hai ẩn, biểu diễn miền nghiệm trên mặt phẳng tọa độ và vận dụng vào bài toán thực tiễn, trong đó có ví dụ tìm cực trị của biểu thức dạng \(F=ax+by\) trên một miền đa giác. Báo cáo dùng “bài toán quy hoạch tuyến tính” theo cách gọi của đề tài và giải thích đó là bài toán tối ưu tuyến tính ở mức phổ thông; không mở rộng sang thuật toán hay lý thuyết đại học.

### Điều chỉnh chính theo KHKT.docx

1. Đưa cấu trúc tri thức, mô hình Toán và học liệu chuẩn lên trước mô tả tính năng công nghệ.
2. Phân loại biểu hiện sai thành M1 (mô hình hóa), M2 (đại số–hình học), M3 (giao miền và tối ưu); chỉ xác nhận lỗi khi sản phẩm học sinh hoặc dữ liệu cho thấy.
3. Nêu cơ sở toán học của mô hình đường mức trượt: hàm mục tiêu, vectơ pháp tuyến, miền khả thi và trường hợp tối ưu đạt trên cả cạnh.
4. Tách kết quả làm có trợ giúp khỏi nhiệm vụ độc lập; phân tích kết quả theo lớp/cụm lớp, không xem từng học sinh là đơn vị được phân nhóm độc lập nếu thiết kế không hỗ trợ.
5. Viết câu hoàn chỉnh, bỏ ghi chú nội bộ khỏi danh mục nguồn và không khẳng định hiệu quả khi mới dừng ở thiết kế.

## Đặt vấn đề

### 1. Bối cảnh và lý do chọn đề tài

Nêu ngắn gọn vị trí của nội dung “Bất phương trình và hệ bất phương trình bậc nhất hai ẩn” trong Toán 10; kết nối yêu cầu mô tả miền nghiệm với vận dụng toán học vào tình huống có giới hạn nguồn lực. Giải thích giá trị dạy học của việc học sinh phải tự xác định biến, nêu điều kiện, dựng miền khả thi, so sánh phương án và giải thích đáp số. Chỉ khẳng định đây là khó khăn phổ biến nếu có tài liệu, khảo sát hoặc nghiên cứu làm căn cứ.

### 2. Vấn đề dạy học cần giải quyết

Viết vấn đề thành một đoạn cụ thể, chẳng hạn: “Trong các nhiệm vụ …, học sinh …; điều này thể hiện qua … (bài làm/quan sát/phỏng vấn, số lượng và thời điểm). Hệ thống câu hỏi hiện dùng … nên chưa hỗ trợ đủ cho …”. Nếu chưa có dữ liệu, diễn đạt dưới dạng vấn đề cần khảo sát, không viết như kết quả đã xác nhận.

### 3. Mục tiêu

Thiết kế một gói học liệu MathSTEP cho chủ đề lớp 10 gồm: (i) cấu trúc kiến thức và điều kiện toán học; (ii) phân loại biểu hiện sai cần chẩn đoán; (iii) mô hình đường mức tương tác và câu hỏi gợi mở đi kèm; (iv) nhiệm vụ luyện tập và chuyển giao; (v) công cụ đánh giá tách việc làm có trợ giúp và làm độc lập. Mục tiêu học tập quan sát được là học sinh xác định biến và đơn vị, lập ràng buộc, biểu diễn giao các miền nghiệm, lập luận về cực trị và diễn giải phương án theo giả định của bài toán.

### 4. Câu hỏi nghiên cứu/thiết kế

1. Những yêu cầu cần đạt và khó khăn nào liên quan trực tiếp đến việc học nội dung này?
2. Hệ thống câu hỏi cần có những thành phần và nguyên tắc thiết kế nào để hỗ trợ các bước lập mô hình, biểu diễn miền nghiệm, tối ưu và diễn giải?
3. Nếu có triển khai thử nghiệm: học sinh phản hồi và thực hiện nhiệm vụ ra sao; bằng chứng nào cho thấy tài liệu khả thi hoặc cần điều chỉnh?

Chỉ dùng câu hỏi thứ ba như câu hỏi đánh giá tác động khi thực sự có triển khai, thiết kế nghiên cứu và dữ liệu thích hợp.

### 5. Đối tượng, phạm vi, phương pháp và đóng góp

Nêu rõ sản phẩm nghiên cứu (hệ thống câu hỏi/tài liệu dạy học), đối tượng học sinh hoặc nhóm người dùng dự kiến, lớp học/đơn vị (nếu có), giới hạn nội dung và thời gian. Phương pháp có thể gồm phân tích chương trình và SGK, phân tích bài làm, phỏng vấn giáo viên/học sinh, thiết kế tài liệu, xin ý kiến chuyên gia và dạy thử. Chỉ liệt kê phương pháp có thực hiện. Đóng góp nên cụ thể ở sản phẩm, quy trình thiết kế hoặc khung phân tích; không khẳng định “nâng cao chất lượng” khi chưa đo lường.

## Chương 1. Cơ sở lý luận và định hướng chương trình

### 1.1. Yêu cầu cần đạt và giới hạn nội dung

Trích đúng yêu cầu trong chương trình môn Toán lớp 10: nhận biết bất phương trình và hệ bất phương trình bậc nhất hai ẩn; biểu diễn miền nghiệm trên mặt phẳng tọa độ; vận dụng vào giải quyết bài toán thực tiễn, trong đó có dạng tìm cực trị của biểu thức tuyến tính trên miền đa giác. Phân biệt yêu cầu quốc gia với cách phân phối nội dung của từng bộ SGK/nhà trường.

### 1.2. Một số khái niệm toán học cần thống nhất

- **Bất phương trình bậc nhất hai ẩn:** nêu dạng tổng quát phù hợp và quy ước miền nghiệm.
- **Hệ bất phương trình bậc nhất hai ẩn:** tập nghiệm chung, tức giao các miền nghiệm thành phần.
- **Miền khả thi/miền nghiệm:** tập các điểm thỏa mọi ràng buộc; ghi rõ khi nào miền bị chặn, rỗng hoặc không bị chặn nếu tình huống cần.
- **Hàm mục tiêu:** biểu thức tuyến tính cần tối đa hóa hoặc tối thiểu hóa.
- **Bài toán tối ưu tuyến tính:** tìm giá trị lớn nhất/nhỏ nhất của hàm mục tiêu trên miền khả thi theo các điều kiện của bài toán.

Ở mức phổ thông, khi miền khả thi là đa giác lồi bị chặn, có thể khảo sát các đỉnh để tìm cực trị tuyến tính. Nêu giả thiết và lập luận phù hợp nhiệm vụ; không trình bày thuật toán tổng quát simplex hay lý thuyết đối ngẫu nếu không thuộc phạm vi.

### 1.3. Khung năng lực toán học có liên quan

Tập trung vào ba thành tố có thể quan sát được: **năng lực mô hình hoá toán học** (chuyển tình huống sang biến, ràng buộc và hàm mục tiêu; diễn giải lại kết quả), **năng lực giải quyết vấn đề toán học** (nhận ra yêu cầu, chọn cách giải, kiểm tra lời giải), **năng lực giao tiếp toán học** (giải thích ý nghĩa bất phương trình, miền nghiệm và phương án). Chỉ bổ sung tư duy-lập luận hoặc sử dụng công cụ khi nhiệm vụ và công cụ đánh giá thực sự đòi hỏi. Dẫn chương trình làm căn cứ; không gán thuật ngữ chung thành tiêu chí nếu chưa định nghĩa biểu hiện.

### 1.4. Đa biểu diễn, khám phá có hướng dẫn và tự giải thích

KHKT.docx gợi ý ba căn cứ có thể dùng nếu người viết đọc và trích đúng nguồn gốc: khung DeFT về thiết kế đa biểu diễn (Ainsworth, 2006), tổng hợp nghiên cứu về khám phá có hướng dẫn (Alfieri và cộng sự, 2011), và nghiên cứu về tự giải thích (Chi và cộng sự, 1989). Không dùng các công trình này như bằng chứng trực tiếp rằng MathSTEP có hiệu quả. Chuyển từng khái niệm thành quyết định thiết kế:

- **Đa biểu diễn:** nối lời văn, bất phương trình, đồ thị miền nghiệm và biểu thức mục tiêu; yêu cầu học sinh giải thích sự tương ứng.
- **Khám phá có hướng dẫn:** để học sinh dự đoán, thao tác và kiểm tra, đồng thời chuẩn bị câu hỏi định hướng và trợ giúp khi cần; không đồng nhất khám phá với việc để học sinh tự mò.
- **Tự giải thích:** yêu cầu học sinh nêu vì sao ràng buộc phù hợp, vì sao điểm thuộc miền khả thi và vì sao phương án được chọn tối ưu.

Trước khi nộp, cần kiểm tra bài báo gốc, thuật ngữ và phạm vi kết luận của từng nguồn; đưa trích dẫn đầy đủ vào danh mục theo chuẩn được yêu cầu.

### 1.5. Câu hỏi gợi mở kiểu Socratic trong dạy học Toán

Định nghĩa thao tác dùng trong báo cáo: chuỗi câu hỏi được sắp xếp có mục đích, dựa vào câu trả lời/bằng chứng học sinh để làm rõ giả định, yêu cầu, quan hệ và lập luận tiếp theo. Làm rõ giáo viên không chỉ hỏi liên tục mà còn lắng nghe, chọn câu hỏi tiếp nối và tạo cơ hội để học sinh tự giải thích. Phân biệt câu hỏi Socratic với câu hỏi mở nói chung, câu hỏi kiểm tra nhớ và dẫn giải từng bước đến đáp án có sẵn.

### 1.6. Các nguyên tắc thiết kế học liệu và câu hỏi

1. Bám yêu cầu cần đạt và mục tiêu học tập có thể quan sát.
2. Đi từ hiểu tình huống đến mô hình, biểu diễn hình học, xử lý tối ưu, diễn giải.
3. Một câu hỏi tập trung vào một hành động nhận thức; tránh câu hỏi kép mơ hồ.
4. Câu hỏi tiếp nối theo phản hồi học sinh; có nhánh gợi ý khi xuất hiện lỗi.
5. Không nói thay phần lập luận học sinh có thể tự thực hiện.
6. Có cơ hội giải thích, kiểm tra, phản biện và nối kết với bối cảnh.
7. Khả thi trong thời lượng, trình độ và tài nguyên lớp học; cho phép nhiều cách diễn đạt đúng.

### 1.7. Cơ sở nào không nên đưa vào hoặc chỉ dùng khi thật cần

Didacticque/Didactique des mathématiques là một lĩnh vực nghiên cứu rộng, không phải “một hệ tư tưởng” đơn nhất. Không nên đưa cả lý thuyết tình huống didactic, chuyển đổi didactic, hợp đồng didactic, lý thuyết trường khái niệm, kiến tạo, Bloom, Polya… thành danh sách nền tảng nếu không dùng chúng để phân tích một hiện tượng hoặc thiết kế một quyết định cụ thể. Có thể chọn một khung chính và tối đa vài khái niệm hỗ trợ. Nếu vận dụng didactique, phải đọc tài liệu chuyên ngành gốc, định nghĩa khái niệm chính xác và chỉ ra nó giải thích điều gì trong dữ liệu/thiết kế.

### 1.8. Khung phân tích dùng xuyên suốt báo cáo

Đề xuất chuỗi: **yêu cầu cần đạt → biểu hiện toán học quan sát được → nhiệm vụ/biểu diễn → phản hồi học sinh → câu hỏi tiếp nối → bằng chứng độc lập**. Dùng cùng khung để phân tích bài làm ban đầu, thiết kế học liệu và đánh giá bài dạy thử. Đây là công cụ phân tích của báo cáo, không tự nhận là một lý thuyết đã được kiểm chứng.

## Chương 2. Cơ sở thực tiễn và phân tích nhu cầu

### 2.1. Chương trình và yêu cầu cần đạt

Tóm tắt chính xác các động từ yêu cầu: nhận biết, biểu diễn/mô tả, vận dụng. Nêu hàm ý cho nhiệm vụ đánh giá: học sinh cần đưa ra mô hình, miền nghiệm và câu trả lời trong bối cảnh chứ không chỉ vẽ đường thẳng. Không lẫn với bài toán lập quy hoạch tuyến tính tổng quát ở bậc đại học.

### 2.2. Phân tích sách giáo khoa và tài liệu dạy học

Chọn bộ sách đang dùng tại địa bàn/lớp; nếu so sánh nhiều bộ, ghi tên, tập, bài, năm xuất bản và trang. Dùng tiêu chí nhất quán: yêu cầu kiến thức; cách khởi tạo tình huống; dạng biểu diễn; vị trí bài tập thực tiễn; cơ hội học sinh giải thích; gợi ý đánh giá; câu hỏi/hoạt động có thể khai thác Socratic. Trình bày điểm giống/khác có dẫn trang. Không suy rộng từ một bộ sách thành “các sách hiện nay”.

### 2.3. Bối cảnh lớp học và minh chứng ban đầu

Mô tả trường/lớp, số học sinh, thời điểm, tiến độ đã học, cách chọn người tham gia và điều kiện thu thập dữ liệu; ẩn danh. Ưu tiên bài kiểm tra/bài tập học sinh có thật, phiếu chẩn đoán ngắn, quan sát có bảng kiểm và phỏng vấn bán cấu trúc. Nêu câu hỏi công cụ, thang/mã hóa, người mã hóa và cách xử lý trường hợp không rõ. Xin phép theo quy định của cơ sở; không đưa thông tin nhận dạng học sinh.

### 2.4. Khung phân tích lỗi và khó khăn — giả thuyết cần kiểm chứng

Theo KHKT.docx, dùng ba mã lớn để làm rõ hàm lượng Toán học. Các mục dưới đây là **khung mã hóa để tìm trong sản phẩm học sinh**, không phải kết quả thực trạng đã thu thập:

| Mã | Nhóm biểu hiện | Dấu hiệu cần kiểm tra trong bài làm |
|---|---|---|
| M1 | Mô hình hóa: ngôn ngữ tình huống → đại số | Bỏ điều kiện không âm/nguyên; dịch sai “tối đa”, “ít nhất”, “nhiều hơn”; nhầm hệ số ràng buộc nguồn lực với hệ số hàm mục tiêu. |
| M2 | Chuyển đổi đại số → hình học | Vẽ/tô sai nửa mặt phẳng; chọn điểm thử trên biên; nhầm lấy hay không lấy đường biên; khó xử lý đường biên song song/trùng trục hoặc giao điểm suy biến. |
| M3 | Giao các miền và tối ưu | Dùng hợp thay cho giao; đưa vào đỉnh nằm ngoài miền khả thi; bỏ sót đỉnh; cho rằng nghiệm tối ưu luôn duy nhất tại một đỉnh; không xét bài toán vô nghiệm, không bị chặn hoặc tối ưu trên cả một cạnh. |

Với mỗi mã, ghi nhiệm vụ, bài làm ẩn danh, quy tắc gán mã, số bài hợp lệ và cách xử lý trường hợp chưa rõ. Một lỗi tính toán đơn lẻ chưa đủ để kết luận có ngộ nhận. Không trình bày các ví dụ trong bảng như tần suất lỗi thực tế nếu chưa phân tích bài làm.

Khung chi tiết dưới đây có thể dùng để thiết kế phiếu chẩn đoán và câu hỏi tiếp nối:

| Nhóm dấu hiệu | Ví dụ biểu hiện cần kiểm tra | Câu hỏi phân tích |
|---|---|---|
| Xác định biến | Không nói rõ biến đại diện đại lượng nào hoặc đơn vị | Em đang đếm/đo đại lượng gì? Một đơn vị của biến nghĩa là gì? |
| Chuyển điều kiện | Đổi nhầm “ít nhất”, “không vượt quá”, giới hạn nguyên | Mệnh đề trong đề cho biết đại lượng nhỏ nhất/lớn nhất nào? Dấu nào biểu đạt điều đó? |
| Điều kiện không âm/tính rời rạc | Bỏ điều kiện (x,y\ge0), hoặc kết quả lẻ trong bối cảnh đếm | Đại lượng này có thể âm/phân số không? Vì sao? |
| Biểu diễn miền | Tô sai nửa mặt phẳng; nhầm đường biên; quên giao các miền | Điểm thử nào giúp xác định phía thỏa? Đường biên có được lấy không? |
| Đọc miền khả thi | Chọn điểm không thỏa đủ ràng buộc hoặc nhầm miền với một đường | Điểm này có thỏa từng điều kiện không? |
| Tối ưu | Chọn điểm nhìn “có vẻ tốt”, chỉ xét một đỉnh, tính sai giao điểm | Hàm mục tiêu đo điều gì? Vì sao các điểm ứng viên này cần được xét? |
| Diễn giải | Trả số mà thiếu đơn vị/không xét tính nguyên/không trả lời câu hỏi | Phương án có thực hiện được trong bối cảnh không? Kết quả cần làm tròn hay đổi cách hiểu không? |

Chỉ gắn nhãn “sai lầm” sau khi có câu trả lời quan sát được; chỉ kết luận “ngộ nhận” khi có bằng chứng lặp lại và cân nhắc giải thích khác như đọc nhầm/tính nhầm. Công bố quy tắc mã hóa trước khi thống kê. Có thể dùng mã phụ cho điều kiện rời rạc, diễn giải đơn vị và giao điểm suy biến.

### 2.5. Tổng hợp nhu cầu thiết kế

Kết thúc chương bằng bảng truy vết: **minh chứng cụ thể → nhu cầu học tập → thành phần câu hỏi → loại bằng chứng cần quan sát**. Ví dụ chỉ điền sau thu thập dữ liệu. Đây là cầu nối logic sang Chương 3.

## Chương 3. Thiết kế học liệu và mô hình toán học tương tác MathSTEP

### 3.1. Mục tiêu, người dùng và điều kiện sử dụng

Nêu rõ hệ thống phục vụ bài học nào, thời lượng dự kiến, hình thức cá nhân/cặp/nhóm, tài liệu và cách giáo viên điều phối. Xác định kiến thức tiên quyết: tọa độ, đường thẳng, bất phương trình một ẩn và cách đọc điều kiện thực tiễn.

### 3.2. Cấu trúc hệ thống

Tổ chức tiến trình theo chuỗi nhận thức tám bước nêu trong KHKT.docx. Đây là khung thiết kế dự kiến cần kiểm tra trong dạy thử, không phải bằng chứng cho một lý thuyết đã được kiểm chứng:

1. **Nhìn thấy:** đọc tình huống và xác định các đại lượng/quan hệ.
2. **Dự đoán:** dự đoán miền khả thi hoặc phương án có thể tốt trước khi thao tác.
3. **Thao tác:** thay đổi hệ số, đường biên hay mức hàm mục tiêu trong mô hình.
4. **Khám phá dấu hiệu sai:** so sánh dự đoán với điều kiện và phản ví dụ cụ thể.
5. **Kiểm chứng:** thay tọa độ vào ràng buộc, kiểm tra giao điểm và giá trị mục tiêu.
6. **Giải thích:** trình bày lý do bằng lời, ký hiệu và hình biểu diễn.
7. **Chuyển giao:** giải nhiệm vụ mới có dữ kiện hoặc cách biểu diễn thay đổi.
8. **Vận dụng, rèn luyện:** diễn giải phương án trong bối cảnh, nêu giả định và giới hạn.

Mỗi bước cần có sản phẩm quan sát được và điểm dừng; không nhất thiết dùng đủ tám bước trong mọi tiết học.

### Cơ sở toán học của mô hình “đường mức trượt”

Với hàm mục tiêu \(F=ax+by\), các đường mức có dạng \(ax+by=c\) và vectơ pháp tuyến \((a,b)\). Khi thay đổi \(c\), đường mức tịnh tiến song song. Trong miền khả thi lồi, cách quan sát này giúp học sinh dự đoán hướng tăng/giảm và tìm các điểm/biên ứng viên. Nếu miền là đa giác lồi compact, hàm tuyến tính đạt giá trị lớn nhất và nhỏ nhất tại ít nhất một đỉnh; nghiệm tối ưu có thể không duy nhất, chẳng hạn khi một cạnh tối ưu song song với đường mức. Vì thế không dạy quy tắc “nghiệm tối ưu luôn duy nhất tại một đỉnh”. Với miền không bị chặn, cần phân tích riêng tính khả thi và tính bị chặn của hàm mục tiêu.

Chuyển động của đường mức trong mô phỏng chỉ hỗ trợ dự đoán, không thay thế lập luận về tính lồi, các đỉnh hay điều kiện tồn tại cực trị. Học liệu cần yêu cầu học sinh xác minh bằng tính toán hoặc giải thích.

### 3.3. Mẫu thiết kế một nhánh câu hỏi

| Thành phần | Nội dung cần viết |
|---|---|
| Nhiệm vụ/bối cảnh | Dữ kiện vừa đủ, đơn vị rõ, điều kiện thực tế hợp lý |
| Mục tiêu | Hành động toán học và hiểu biết cần biểu hiện |
| Câu hỏi lõi | Gợi học sinh nêu suy nghĩ, không gài đáp án |
| Lập luận mong đợi | Các bước/mối quan hệ chính, chấp nhận cách diễn đạt tương đương |
| Phản hồi có thể gặp | Đúng, thiếu căn cứ, sai dấu, bỏ điều kiện, tính nhầm… |
| Câu hỏi tiếp nối | Chọn theo phản hồi để làm rõ hoặc đẩy tư duy tiếp |
| Bằng chứng đánh giá | Câu nói, ký hiệu, hình vẽ, phép thử hoặc kết luận quan sát được |
| Gợi ý/điều chỉnh | Gợi ý tăng dần; phương án hỗ trợ và mở rộng |

### 3.4. Minh họa một nhiệm vụ (ví dụ do người biên soạn đề xuất)

Một cơ sở làm hai loại hộp quà A và B. Mỗi hộp A cần 2 giờ công và 1 đơn vị vật liệu; mỗi hộp B cần 1 giờ công và 2 đơn vị vật liệu. Trong ngày có tối đa 8 giờ công và 8 đơn vị vật liệu. Lãi gộp dự kiến lần lượt là 3 và 4 đơn vị tiền cho mỗi hộp. Giả sử số hộp có thể được xem liên tục ở mô hình ban đầu; sau khi tìm phương án, cần xem xét điều kiện số lượng nguyên.

Đặt (x,y) là số hộp A,B. Một mô hình là (2x+y\le8), (x+2y\le8), (x\ge0,y\ge0), tối đa hóa (P=3x+4y). Các đỉnh miền khả thi gồm ((0,0),(4,0),(0,4),(8/3,8/3)). Giá trị (P) lần lượt là (0,12,16,56/3), do đó mô hình liên tục đạt cực đại tại giao điểm trong với giá trị (56/3\approx18.67). Tuy nhiên, nếu số hộp phải nguyên, đây chưa phải phương án thực hiện được; cần khảo sát các điểm nguyên khả thi (trong ví dụ này, ((2,3)) cho (P=18), cũng như ((3,2)) cho (P=17), và kiểm tra các điểm nguyên khác). Nêu rõ phân biệt mô hình liên tục với quyết định nguyên là một cơ hội để học sinh đánh giá mô hình, không che giấu giả định.

**Gợi ý chuỗi câu hỏi:**

- “Đề bài đang quyết định điều gì? Hai đại lượng nào thay đổi?”
- “Một đơn vị của (x) và (y) có nghĩa gì? Chúng có thể âm hoặc lẻ không?”
- “8 giờ công giới hạn tổng thời gian sử dụng theo cách nào? Em biểu diễn chi phí thời gian cho mỗi loại hộp ra sao?”
- “Điều kiện vật liệu tạo bất phương trình nào? Em có thể kiểm tra bằng một phương án cụ thể không?”
- “Miền nào thỏa đồng thời cả hai giới hạn? Vì sao chỉ chọn một miền nửa mặt phẳng là chưa đủ?”
- “Lãi gộp phụ thuộc vào (x,y) như thế nào? Em đang cần tối đa hay tối thiểu?”
- “Những điểm nào cần được so sánh trong miền khả thi này? Kết quả tại mỗi điểm là bao nhiêu?”
- “Phương án tối ưu của mô hình có thực hiện được khi số hộp phải nguyên không? Cần kiểm tra điều gì trước khi kết luận?”

Câu hỏi gợi mở phải được điều chỉnh theo phản hồi thực tế; không buộc mọi học sinh đi đúng một chuỗi cố định. Ví dụ trên là minh họa thiết kế, không phải dữ liệu khảo sát.

### 3.5. Đánh giá quá trình học tập

Thiết kế bảng kiểm/rubric nhỏ theo tiêu chí: định nghĩa biến và đơn vị; mô hình hóa ràng buộc; biểu diễn và kiểm tra miền; xác định hàm mục tiêu; lập luận về cực trị; diễn giải và kiểm tra tính khả thi. Mô tả mức độ bằng hành vi nhìn thấy được (ví dụ “viết đúng và giải thích được ràng buộc”), không dùng nhãn chung như “tốt/chưa tốt” mà thiếu tiêu chí. Dùng câu trả lời để quyết định câu hỏi tiếp theo hoặc điều chỉnh hỗ trợ.

### 3.6. Cấu trúc gói học liệu và hướng dẫn giáo viên

Gói học liệu nên có: (i) bản đồ kiến thức và liên kết lời văn–đại số–đồ thị; (ii) ma trận mã lỗi M1–M3 kèm nhiệm vụ chẩn đoán; (iii) phiếu học tập theo tiến trình tám bước; (iv) ngân hàng nhiệm vụ có mức hỗ trợ và bài chuyển giao; (v) hướng dẫn giáo viên, lời giải và tiêu chí đánh giá. Các sản phẩm này cần được rà soát toán học và thử nghiệm trước khi gọi là “chuẩn hóa”.

Mô phỏng có thể cung cấp phản ví dụ trực quan, chẳng hạn điểm thử không thỏa ràng buộc hoặc đường mức song song với cạnh tối ưu. Bộ sinh bài tập chỉ nên được đưa vào phạm vi sản phẩm khi quy tắc sinh đã được đặc tả, các trường hợp biên được kiểm tra và lời giải được đối chiếu độc lập. Tính năng quá khó thực hiện có thể được ghi là hướng phát triển thay vì cam kết trong sản phẩm hiện tại.

Nêu cách chọn câu hỏi theo thời lượng, tổ chức trao đổi, xử lý im lặng, câu trả lời sai, nhiều chiến lược, chênh lệch trình độ và sử dụng công cụ đồ họa/máy tính nếu phù hợp. Tài liệu cho giáo viên nên kèm mục tiêu, ý định nhận thức, dự kiến phản hồi và gợi ý; tài liệu cho học sinh không nên phơi sẵn đáp án ở ngay cạnh câu hỏi.

## Chương 4. Thử nghiệm/đánh giá (chỉ viết nếu đã thực hiện)

Nếu đã dạy thử, trình bày: mục đích (khả thi hay hiệu quả), lớp/người tham gia, thời lượng, quy trình, công cụ thu thập, nguyên tắc ẩn danh, cách phân tích và giới hạn. Tách kết quả làm có gợi ý/phản hồi khỏi nhiệm vụ độc lập khi tắt hỗ trợ. Dùng cùng quy tắc tính toán và công cụ phù hợp ở các lượt đánh giá.

Nếu nghiên cứu có bốn lớp thực nghiệm/đối chứng, lớp học là đơn vị cụm trong cách tổ chức; không mặc nhiên xem 140–160 học sinh là các đơn vị được phân nhóm ngẫu nhiên độc lập. Nêu cách phân lớp, khác biệt ban đầu, giáo viên và điều kiện dạy; giới hạn kết luận nhân quả theo thiết kế thực tế. Báo cáo số lớp và số học sinh, mẫu số rõ ràng, kết quả theo lớp khi phù hợp và cả trường hợp không tiến bộ.

Nếu chưa dạy thử, đổi thành “Kế hoạch đánh giá dự kiến” hoặc bỏ chương theo yêu cầu học thuật; không viết kết quả giả.

## Kết luận và kiến nghị

Tóm tắt sản phẩm và cách hệ thống câu hỏi đáp ứng mục tiêu; trả lời từng câu hỏi nghiên cứu bằng đúng mức bằng chứng hiện có. Nêu giới hạn: thiếu dữ liệu lớp học, phạm vi một nội dung, thời gian thử nghiệm, bộ sách hoặc cỡ mẫu. Đề xuất bước tiếp theo cụ thể như xin ý kiến giáo viên, phân tích thêm bài làm, chỉnh sửa câu hỏi, dạy thử và đánh giá bằng rubric.

## Phụ lục nên có

1. Hệ thống nhiệm vụ và câu hỏi đầy đủ.
2. Hướng dẫn giáo viên và đáp án/giải thích dự kiến.
3. Phiếu chẩn đoán hoặc bài kiểm tra, tiêu chí mã hóa lỗi.
4. Rubric/bảng kiểm đánh giá.
5. Trích đoạn bài làm đã ẩn danh và mẫu đồng thuận/cho phép nếu áp dụng.

## Thuật ngữ và văn phong cần giữ nhất quán

Viết “học sinh lớp 10”, “yêu cầu cần đạt”, “miền nghiệm”, “miền khả thi”, “hàm mục tiêu”, “bài toán tối ưu tuyến tính”. Lần đầu có thể ghi “quy hoạch tuyến tính (linear programming)” để đối chiếu thuật ngữ quốc tế; sau đó dùng một cách gọi nhất quán. Dùng “câu hỏi gợi mở kiểu Socratic” nếu hệ thống chưa phải đối thoại Socratic theo nghĩa đầy đủ. Tránh “học sinh thường mắc…” nếu chưa có dữ liệu; dùng “một số dạng khó khăn cần khảo sát gồm…”. Tránh “chứng minh hiệu quả” khi chỉ mới thiết kế; dùng “đề xuất”, “dự kiến”, “khả thi theo nhận định chuyên gia” đúng bằng chứng.

## Tài liệu căn cứ ban đầu

1. Bộ Giáo dục và Đào tạo. (2018). *Chương trình giáo dục phổ thông môn Toán*, ban hành kèm Thông tư 32/2018/TT-BGDĐT, mục lớp 10 “Bất phương trình và hệ bất phương trình bậc nhất hai ẩn”. [Thông tư 32/2018/TT-BGDĐT trên Cơ sở dữ liệu quốc gia về văn bản pháp luật](https://vbpl.moj.gov.vn/boquocphong/Pages/vbpq-van-ban-goc.aspx?ItemID=146721); [bản PDF chương trình](https://quanlysangkien.bacgiang.gov.vn/sites/default/files/thong-tu-32-2018-tt-bgddt-ban-hanh-chuong-trinh-giao-duc-pho-thong-moi.pdf).
2. Bộ Giáo dục và Đào tạo. (2025). Thông tư 17/2025/TT-BGDĐT sửa đổi, bổ sung một số nội dung trong Chương trình GDPT ban hành kèm Thông tư 32/2018/TT-BGDĐT. Đối chiếu bản hiện hành và xác nhận nội dung lớp 10 trước khi nộp.
3. Tài liệu sách giáo khoa/giáo viên đang được sử dụng tại cơ sở: điền đủ bộ sách, tác giả, nhà xuất bản, năm, tập và trang sau khi đối chiếu bản thực tế.

**Lưu ý nguồn:** Trong tra cứu xuất hiện các tài liệu môn Toán GDTX và một tài liệu điều chỉnh chương trình cũ; chúng không thay thế chương trình GDPT phổ thông 2018. Cần trích đúng chương trình môn Toán phổ thông và đối chiếu các sửa đổi hiện hành trước khi hoàn tất trích dẫn.
