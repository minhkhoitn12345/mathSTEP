# Nội dung học tập: Hình học không gian (Toán 11)

> Nội dung biên soạn mới, bám theo `sg-lesson-1` đến `sg-lesson-5` trong `frontend/app/types/curriculum.ts`. Khi tích hợp, trình bày công thức bằng LaTeX/KaTeX và chia nhỏ tương tác sau mỗi ý.

## Mạch kiến thức

Học sinh đi từ đọc giả thiết và dựng hình đúng, tới xác định điểm bằng tọa độ, phân biệt hình chiếu với quan hệ hình học, tìm thiết diện và hiểu cách trải phẳng các mặt.

---

## Bài 1 — Đọc giả thiết và dựng hình chóp (S.ABCD)

### Mục tiêu

- Nhận diện điểm, cạnh, mặt và quan hệ được cho.
- Dựng đáy (ABCD) là hình bình hành; (S) nằm ngoài mặt phẳng đáy.
- Không tự suy ra đáy là hình chữ nhật hoặc (SA\perp(ABCD)) nếu chưa được cho.

### Cơ sở lý thuyết

Hình chóp (S.ABCD) có đáy (ABCD) nằm trong một mặt phẳng và đỉnh (S) không thuộc mặt phẳng ấy. Nếu (A,B,C,D) được ghi theo thứ tự liên tiếp của hình bình hành thì hai đường chéo (AC,BD) có cùng trung điểm. Với tọa độ hoặc vectơ vị trí, (A+C=B+D), do đó (D=A+C-B). Công thức phụ thuộc thứ tự đỉnh; không thay bằng (D=A+B-C).

### Ví dụ giải từng bước

Cho (A(-2;0;0),B(2;0;0),C(3;2;0)), đáy (ABCD) là hình bình hành theo thứ tự (A,B,C,D), và (S(0;0;5)).

1. (A,B,C) đều có tọa độ (z=0), nên thuộc mặt phẳng đáy (z=0).
2. (D=A+C-B=(-2+3-2;0+2-0;0)=(-1;2;0)).
3. Trung điểm (AC) là ((0.5;1;0)). Trung điểm (BD) cũng là ((0.5;1;0)), đúng tính chất hình bình hành.
4. (S) có $z=5\ne0$, nên (S) không thuộc mặt phẳng đáy. Hình chóp không suy biến.

### Lỗi thường gặp

- Dùng sai công thức tọa độ điểm thứ tư của hình bình hành.
- Tự thêm tính vuông góc, cạnh bằng nhau hoặc hình chữ nhật từ hình phối cảnh.
- Đặt đỉnh (S) nằm trong mặt phẳng đáy.

### Luyện tập

Cho (A(0;0;0),B(4;0;0),C(5;3;0)). Tìm (D) và tâm (O). **Đáp án:** (D=(1;3;0)), (O) là trung điểm (AC), tức ((2.5;1.5;0)).

---

## Bài 2 — Trung điểm và điểm chia đoạn theo tỉ số

### Công thức cơ sở

Với (A(x_A;y_A;z_A),B(x_B;y_B;z_B)), trung điểm (M) có tọa độ

\[
M\left(\frac{x_A+x_B}{2};\frac{y_A+y_B}{2};\frac{z_A+z_B}{2}\right).
\]

Nếu $N\in SB$ và (SN:NB=m:n), thì

\[
N=\frac{nS+mB}{m+n}.
\]

Riêng (SN:NB=2:1), (N=\frac{S+2B}{3}=S+\frac23(B-S)). Điểm cách (S) hai phần trong ba phần đoạn nên gần (B) hơn.

### Ví dụ giải từng bước

Cho (S(0;0;6),A(-2;0;0),B(2;0;0)). (M) là trung điểm (SA), $N\in SB$ và (SN:NB=2:1).

1. (M=\frac{S+A}{2}=(-1;0;3)).
2. (N=\frac{S+2B}{3}=(4/3;0;2)).
3. Kiểm tra tọa độ (z): từ (z=6) ở (S) đến (z=0) ở (B), đi (2/3) đoạn thì (z=2), khớp kết quả.

### Lỗi thường gặp

- Đảo hệ số trong công thức chia đoạn.
- Hiểu tỉ số (2:1) thành điểm gần đầu (S).
- Tính trung bình trên một tọa độ rồi quên các tọa độ còn lại.

### Luyện tập

Cho (P(1;2;3),Q(7;-1;0)). Tìm trung điểm (I), rồi tìm $T\in PQ$ sao cho (PT:TQ=1:2). **Đáp án:** (I=(4;0.5;1.5)), (T=(3;1;2)).

---

## Bài 3 — Góc nhìn, nét thấy/nét khuất và đường thẳng chéo nhau

### Cơ sở lý thuyết

Hai đường thẳng chéo nhau là hai đường không đồng phẳng. Hình chiếu lên giấy có thể làm ảnh của chúng giao nhau dù chúng không có điểm chung trong không gian. Nét đứt biểu thị phần bị che trong góc nhìn đang xét; đổi góc nhìn có thể làm cạnh đó thành nét thấy. Nét đứt không phải ký hiệu song song.

### Ví dụ giải từng bước bằng tọa độ

Đáy (ABCD) là hình vuông trong (z=0), với (A(-1;-1;0),B(1;-1;0),C(1;1;0),D(-1;1;0)), (S(0;0;4)). Xét (AB) và (SD).

1. (AB) nằm trong mặt phẳng (z=0), có vectơ chỉ phương ((2;0;0)).
2. (SD) có vectơ chỉ phương ((-1;1;-4)), không song song với (AB).
3. Điểm trên (SD) có dạng ((-t;t;4-4t)). Muốn có (y=-1) như (AB), cần (t=-1), khi đó $z=8\ne0$, nên hai đường không cắt nhau.
4. Chúng không song song và không cắt nhau, do vậy không đồng phẳng và là hai đường chéo nhau.

### Lỗi thường gặp

- Thấy hình chiếu cắt nhau rồi kết luận hai đường cắt nhau.
- Dựa riêng vào nét đứt để suy ra quan hệ song song.
- Kết luận chéo nhau mà chưa loại trừ khả năng cắt hoặc song song.

### Luyện tập

Hai đường thẳng ở hai mặt phẳng khác nhau có nhất thiết chéo nhau không? **Không.** Cần xét chúng có cắt nhau hoặc cùng nằm trong một mặt phẳng hay không; vị trí mặt phẳng riêng lẻ chưa đủ để kết luận.

---

## Bài 4 — Mặt phẳng cắt và thiết diện

### Cơ sở lý thuyết

Nếu mặt phẳng cắt song song với đáy hình chóp thì thiết diện đồng dạng với đáy. Tỉ số từ đỉnh chóp tới các giao điểm trên cạnh bên bằng nhau. Tỉ số đồng dạng diện tích phải được bình phương.

### Ví dụ giải từng bước

Cho hình chóp (S.ABCD), đáy là hình bình hành. (M) là trung điểm (SA). Mặt phẳng ((P)) đi qua (M) và song song với đáy, cắt (SB,SC,SD) tại (P_1,Q,R).

1. Trong mặt (SAB), giao tuyến qua (M) song song (AB), nên cắt (SB) tại trung điểm (P_1) theo định lý đường trung bình.
2. Tương tự (Q,R) lần lượt là trung điểm (SC,SD).
3. Nối (M,P_1,Q,R) theo thứ tự quanh thiết diện. Các cạnh tương ứng song song với cạnh đáy; thiết diện đồng dạng với đáy với tỉ số (1/2).
4. Nếu diện tích đáy bằng (24), diện tích thiết diện là (24\cdot(1/2)^2=6).

Nếu một điểm $N\in SB$ được cho (SN:NB=2:1), thì (N) không phải (P_1), vì (P_1) là trung điểm. Không tự đặt (N) lên thiết diện.

### Lỗi thường gặp và luyện tập

Không nối điểm cắt theo thứ tự khiến đa giác tự cắt; không nhầm điểm chia tỉ số với trung điểm; không quên bình phương tỉ số diện tích. Thiết diện đồng dạng đáy với tỉ số (3/5), diện tích đáy (50): diện tích thiết diện là **18**.

---

## Bài 5 — Trải phẳng và diện tích mặt

### Cơ sở lý thuyết

Trải phẳng một đa diện là quay các mặt quanh cạnh chung. Độ dài cạnh và diện tích từng mặt không đổi; góc giữa các mặt không được giữ nguyên như góc phẳng trong bản trải. Diện tích toàn phần bằng tổng diện tích tất cả mặt.

### Ví dụ giải từng bước

Hình chóp có đáy vuông cạnh (6); mỗi mặt bên là tam giác đáy (6), chiều cao mặt bên (5).

1. (S_{đ}=6^2=36).
2. Một mặt bên có diện tích $\frac12\cdot6\cdot5=15$.
3. Bốn mặt bên có tổng diện tích $4\cdot15=60$.
4. (S_{tp}=36+60=96) đơn vị diện tích. Bản trải gồm hình vuông và bốn tam giác gắn quanh bốn cạnh, không làm biến dạng mặt.

### Lỗi thường gặp

- Cộng độ dài thay vì diện tích.
- Nhầm diện tích xung quanh với diện tích toàn phần.
- Nghĩ rằng góc giữa các mặt được bảo toàn sau khi trải.

### Luyện tập

Lăng trụ tam giác có hai đáy diện tích (12) mỗi đáy, ba mặt bên diện tích (8,10,12). Diện tích toàn phần là $2\cdot12+8+10+12=54$.

## Nguồn và ghi chú

Nội dung được biên soạn mới theo thứ tự bài trong `frontend/app/types/curriculum.ts` và Chương trình GDPT môn Toán ban hành kèm Thông tư 32/2018/TT-BGDĐT cùng văn bản hợp nhất do Bộ GDĐT công bố. Hệ tọa độ là công cụ minh họa bổ trợ; cần đối chiếu phạm vi với kế hoạch dạy học của trường.

Nguồn chương trình: [Bộ GDĐT, văn bản hợp nhất Chương trình GDPT](https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1453/vbhn-322018-202021-ttbgddt-trinh-ky-xt.pdf).
