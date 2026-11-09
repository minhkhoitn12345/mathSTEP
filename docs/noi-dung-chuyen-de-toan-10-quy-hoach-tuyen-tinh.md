# Nội dung học tập: Bất phương trình và quy hoạch tuyến tính (Toán 10)

> Tài liệu nội dung gốc để tích hợp vào MathSTEP. Bám theo 5 mã bài `lp-lesson-1` đến `lp-lesson-5` trong `frontend/app/types/curriculum.ts`; diễn đạt lại bằng lời mới, không chép nguyên văn sách giáo khoa. Khi đưa lên hệ thống, trình bày công thức bằng KaTeX/LaTeX và chia nhỏ tương tác sau mỗi ý.

## Mạch kiến thức

Học sinh đi từ kiểm tra một cặp số có thỏa bất phương trình hay không, đến biểu diễn một miền nghiệm, giao các miền, rồi mô hình hóa và tối ưu hóa tình huống thực tế. Với bài toán tối ưu, cần phân biệt điều kiện ràng buộc, miền nghiệm và hàm mục tiêu.

---

## Bài 1 — Bất phương trình bậc nhất hai ẩn và nửa mặt phẳng

### Mục tiêu

- Nhận ra dạng $ax+by\le c$, (ax+by<c), $ax+by\ge c$, (ax+by>c), trong đó (a,b) không đồng thời bằng 0.
- Kiểm tra một cặp ((x_0;y_0)) bằng cách thay trực tiếp vào hai vế.
- Hiểu tập nghiệm là một nửa mặt phẳng; đường biên có được lấy hay không phụ thuộc dấu bất đẳng thức.

### Cơ sở lý thuyết

Đường thẳng biên là (d: ax+by=c). Đường thẳng chia mặt phẳng tọa độ thành hai nửa mặt phẳng. Mỗi điểm ở một phía làm biểu thức (ax+by-c) cùng dấu; vì thế chỉ cần thử một điểm không nằm trên (d) để xác định phía thỏa mãn.

- Dấu $\le,\ge$: lấy cả các điểm trên đường biên.
- Dấu (<,>): không lấy đường biên.
- Điểm (M(x_0;y_0)) là nghiệm khi mệnh đề sau khi thay tọa độ là đúng.

### Ví dụ hướng dẫn

Xét $2x-y\le4$. Kiểm tra (O(0;0)) và (A(3;1)).

1. Thay (O): $2\cdot0-0=0\le4$, vậy (O) là nghiệm.
2. Thay (A): $2\cdot3-1=5\not\le4$, vậy (A) không là nghiệm.
3. Để vẽ miền nghiệm, vẽ (2x-y=4), tức (y=2x-4), bằng nét liền vì có dấu bằng.
4. Thử (O). Vì (O) thỏa bất phương trình, tô phía chứa (O); miền nghiệm bao gồm đường biên.

### Lỗi thường gặp

- Chỉ kiểm tra một tọa độ hoặc quên thay đủ cả (x), (y).
- Cho rằng tập nghiệm chỉ là đường thẳng biên.
- Vẽ nét liền cho dấu nghiêm ngặt hoặc nét đứt cho dấu có bằng.
- Thử điểm nằm ngay trên đường biên; điểm này không giúp phân biệt hai phía.

### Luyện tập có đáp án

1. Điểm (P(1;2)) có thỏa $x+2y\le5$ không? **Có**, vì $1+2\cdot2=5\le5$.
2. Với (x-y>1), đường biên vẽ nét gì? **Nét đứt**, vì bất đẳng thức nghiêm ngặt.
3. Nếu điểm thử (O) nằm trên đường biên, chọn điểm thử nào? **Chọn điểm khác không nằm trên biên**, chẳng hạn ((1;0)) hoặc ((0;1)), rồi thay vào bất phương trình.

---

## Bài 2 — Biểu diễn miền nghiệm của một bất phương trình

### Mục tiêu

Vẽ đường biên chính xác, chọn điểm thử, xác định nửa mặt phẳng nghiệm và kết luận rõ đường biên có thuộc miền nghiệm hay không.

### Quy trình

Với $ax+by\,\square\,c$, trong đó \$\square\$ là một dấu bất đẳng thức:

1. Đưa bất phương trình về dạng chuẩn nếu cần.
2. Thay dấu bất đẳng thức bằng dấu bằng để được đường biên.
3. Chọn hai điểm phân biệt thuộc đường biên để vẽ; nếu không tiện dùng giao điểm trục thì chọn điểm khác.
4. Vẽ nét liền nếu có dấu bằng, nét đứt nếu không có.
5. Chọn điểm thử không nằm trên đường biên và thay vào bất phương trình.
6. Tô phía thỏa mãn; ghi rõ đường biên được lấy hay bị loại.

Nếu $c\ne0$, gốc tọa độ thường là điểm thử tiện lợi. Nếu (c=0), đường biên đi qua gốc nên phải chọn điểm thử khác.

### Ví dụ hướng dẫn

Biểu diễn miền nghiệm (3x+2y>6).

1. Đường biên: (3x+2y=6). Hai giao điểm trục là (A(2;0)), (B(0;3)).
2. Vẽ đường thẳng qua (A,B) bằng nét đứt vì dấu (>).
3. Thử (O(0;0)): (0>6) sai, nên miền nghiệm là phía không chứa (O).
4. Kiểm tra điểm ((3;0)): (9>6) đúng, nên điểm này nằm trong miền đã chọn.

### Lỗi thường gặp

- Dùng “lớn hơn thì tô phía trên” mà không xét dấu của hệ số hoặc vị trí đường thẳng.
- Chỉ vẽ đoạn giữa hai giao điểm, trong khi đường biên là đường thẳng kéo dài vô hạn.
- Nhầm đường biên của (>) là một phần của miền nghiệm.

### Luyện tập có đáp án

Biểu diễn $x+2y\le4$. Đường biên qua ((4;0)), ((0;2)), vẽ nét liền. Điểm (O) cho $0\le4$ đúng, nên tô phía chứa (O), lấy cả đường biên. Điểm thử ((0;0)) nằm trong miền; ((5;0)) nằm ngoài.

---

## Bài 3 — Hệ bất phương trình hai ẩn và miền đa giác lồi

### Mục tiêu

- Hiểu nghiệm của hệ là cặp số thỏa đồng thời mọi bất phương trình.
- Biểu diễn từng miền rồi lấy phần giao.
- Tìm tọa độ các đỉnh bằng cách giải giao điểm của các đường biên, không ước lượng bằng mắt.

### Cơ sở lý thuyết

Miền nghiệm của hệ là giao các nửa mặt phẳng nghiệm. Nếu miền nghiệm bị chặn và có dạng đa giác, các đỉnh được xác định từ giao điểm các đường biên đang hoạt động. Mỗi đỉnh tìm được phải được kiểm tra lại trong tất cả ràng buộc ban đầu.

### Ví dụ hướng dẫn

Tìm miền nghiệm của hệ

\[
\begin{cases}
x\ge0,\\
y\ge0,\\
x+y\le4,\\
x+2y\le6.
\end{cases}
\]

1. Hai điều kiện đầu giới hạn miền ở góc phần tư thứ nhất.
2. Hai đường biên còn lại là (x+y=4) và (x+2y=6). Giao điểm của chúng thỏa (y=2, x=2), tức (B(2;2)).
3. Trên trục (Ox), (y=0) cho $x\le4$, nên có đỉnh ((4;0)). Trên trục (Oy), (x=0) cho $2y\le6$, nên có đỉnh ((0;3)).
4. Kèm gốc (O(0;0)), miền nghiệm có các đỉnh (O,(4;0),(2;2),(0;3)).
5. Thay từng đỉnh vào cả bốn điều kiện để kiểm tra. Chẳng hạn ((4;0)) thỏa $4+0=4\le4$, $4+0\le6$.

### Lỗi thường gặp

- Lấy miền thỏa riêng từng bất phương trình thay vì phần giao.
- Giao điểm của hai đường biên được tính đúng nhưng không thỏa các ràng buộc còn lại.
- Bỏ sót giao điểm với trục hoặc nhầm giao điểm là một đỉnh khả thi.

### Luyện tập có đáp án

Với $x\ge0,y\ge0,x+y\le5,2x+y\le8$, tìm giao của hai đường biên: (x+y=5), (2x+y=8), suy ra ((3;2)). Các đỉnh miền nghiệm là ((0;0),(4;0),(3;2),(0;5)). Kiểm tra từng đỉnh trong mọi ràng buộc trước khi kết luận.

---

## Bài 4 — Mô hình hóa và tối ưu hóa bài toán thực tế

### Mục tiêu

Chọn ẩn có ý nghĩa và đơn vị rõ ràng; chuyển điều kiện thực tế thành hệ bất phương trình; lập hàm mục tiêu; xét giá trị hàm tại các đỉnh khả thi và diễn đạt kết quả theo bối cảnh.

### Cơ sở lý thuyết

Trong bài toán quy hoạch tuyến tính hai biến, hàm mục tiêu thường có dạng (F(x,y)=px+qy). Nếu miền nghiệm khác rỗng, bị chặn và là đa giác lồi, giá trị lớn nhất/nhỏ nhất đạt tại ít nhất một đỉnh. Nếu số sản phẩm phải nguyên, kết quả liên tục cần được kiểm tra với điều kiện nguyên; không tự làm tròn nghiệm tối ưu.

### Ví dụ hướng dẫn

Một xưởng làm bàn và ghế. Mỗi bàn cần 3 giờ công đoạn 1 và 1 giờ công đoạn 2; mỗi ghế cần 2 giờ công đoạn 1 và 2 giờ công đoạn 2. Tổng thời gian khả dụng lần lượt là 48 và 32 giờ. Lợi nhuận mỗi bàn là 600 nghìn đồng, mỗi ghế 450 nghìn đồng. Tỉ lệ sản xuất yêu cầu $y\le\frac72x$. Tìm phương án tối ưu.

1. Đặt (x,y) lần lượt là số bàn và số ghế; $x,y\ge0$, thực tế thường yêu cầu $x,y\in\mathbb Z$.
2. Ràng buộc thời gian: $3x+2y\le48$, $x+2y\le32$. Ràng buộc tỉ lệ: $7x-2y\ge0$.
3. Hàm lợi nhuận: (F=600x+450y) (nghìn đồng).
4. Hai ràng buộc thời gian cắt nhau tại ((8;12)). Đường (y=3.5x) cắt (x+2y=32) tại ((4;14)). Các đỉnh khả thi là (O(0;0)), (A(16;0)), (B(8;12)), (C(4;14)). Điểm ((0;16)) không khả thi vì vi phạm $y\le3.5x$.
5. Tính (F(O)=0), (F(A)=9600), (F(B)=10200), (F(C)=8700). Chọn ((8;12)), lợi nhuận lớn nhất là 10.200 nghìn đồng.
6. ((8;12)) là cặp số nguyên nên phù hợp điều kiện sản xuất nguyên. Kết luận: làm 8 bàn và 12 ghế.

### Lỗi cần tránh

- Đơn vị của hàm mục tiêu không khớp đơn vị lợi nhuận.
- Đưa hàm mục tiêu vào nhầm hệ ràng buộc.
- Tính giá trị tại một số điểm bất kỳ thay vì tất cả đỉnh khả thi.
- Làm tròn nghiệm rồi kết luận khi số lượng phải nguyên.

### Luyện tập có đáp án

Miền nghiệm có các đỉnh ((0;0),(4;0),(2;3),(0;2)), hàm mục tiêu (G=5x+4y). Giá trị lần lượt là (0,20,22,8). Giá trị lớn nhất là (22) tại ((2;3)).

---

## Bài 5 — Ôn tập và tự chẩn đoán lỗi

### Bản đồ kiến thức

1. **Đọc biểu thức:** xác định dạng tuyến tính và hệ số.
2. **Kiểm tra cặp số:** thay đúng tọa độ vào bất đẳng thức.
3. **Vẽ miền:** vẽ đường biên, quyết định nét liền/đứt, thử điểm, chọn nửa mặt phẳng.
4. **Giải hệ:** lấy giao các miền, tìm và kiểm tra đỉnh.
5. **Tối ưu:** lập hàm mục tiêu, tính tại mọi đỉnh, kết luận kèm đơn vị.

### Ví dụ tổng hợp

Miền nghiệm của $x\ge0,y\ge0,x+y\le6,2x+y\le8$. Giao hai đường xiên là (x=2,y=4). Các đỉnh là ((0;0),(4;0),(2;4),(0;6)). Với (F=3x+2y), giá trị lần lượt là (0,12,14,12); cực đại bằng (14) tại ((2;4)).

### Tự kiểm tra

- Vì sao phải thử điểm không nằm trên đường biên?
- Nếu một ràng buộc chứa dấu (<), miền có lấy các điểm trên đường biên đó không? **Không.**
- Khi mô hình hóa, biến (x,y) biểu diễn gì và có đơn vị nào? **Phải ghi rõ trước khi lập ràng buộc.**
- Với miền đa giác bị chặn, cần tính hàm mục tiêu tại đâu? **Tại mọi đỉnh khả thi.**

### Nguồn và phạm vi

Nội dung được biên soạn mới dựa trên cấu trúc bài học và mục tiêu trong `frontend/app/types/curriculum.ts`, cùng Chương trình GDPT môn Toán ban hành kèm Thông tư 32/2018/TT-BGDĐT và văn bản hợp nhất được Bộ GDĐT công bố. Ví dụ xưởng ở bài 4 là ví dụ minh họa biên soạn cho tài liệu này. Giáo viên nên đối chiếu kế hoạch dạy học và sách giáo khoa nhà trường đang sử dụng trước khi phát hành cho học sinh.

Nguồn chương trình: [Bộ GDĐT, văn bản hợp nhất Chương trình GDPT](https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1453/vbhn-322018-202021-ttbgddt-trinh-ky-xt.pdf).
