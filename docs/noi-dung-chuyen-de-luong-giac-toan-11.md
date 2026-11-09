# Nội dung học tập: Lượng giác (Toán 11)

> Nội dung biên soạn mới, bám theo `trig-lesson-1` đến `trig-lesson-5` trong `frontend/app/types/curriculum.ts`. Dùng LaTeX/KaTeX để hiển thị công thức. Khi tích hợp tương tác đường tròn lượng giác, không thay đổi giá trị toán học khi đổi góc nhìn.

## Mạch kiến thức

Học sinh hiểu góc như một phép quay, dùng đường tròn lượng giác để xác định giá trị và dấu, biến đổi các góc liên hệ, nối chuyển động trên đường tròn với đồ thị tuần hoàn, rồi giải và lọc nghiệm phương trình trên khoảng.

---

## Bài 1 — Góc lượng giác, chiều quay và điểm biểu diễn

### Mục tiêu

- Phân biệt góc dương, góc âm và số vòng quay.
- Tìm góc cùng phương cuối trong một vòng và đổi độ sang radian.
- Xác định điểm cuối của góc trên đường tròn lượng giác.

### Cơ sở lý thuyết

Quy ước góc dương quay ngược chiều kim đồng hồ, góc âm quay cùng chiều kim đồng hồ. Hai góc có cùng tia đầu và cùng tia cuối sai khác nhau một bội nguyên của $360^\circ$, hoặc $2\pi$ radian:

\[
\alpha=\beta+k\cdot360^\circ=\beta+2k\pi,\quad k\in\mathbb Z.
\]

Đổi đơn vị: $180^\circ=\pi$ rad, do đó $\alpha^\circ=\alpha\pi/180$ rad.

### Ví dụ giải từng bước

Biểu diễn góc $-765^\circ$.

1. Tách số vòng: $-765^\circ=-2\cdot360^\circ-45^\circ$. Góc quay hai vòng âm rồi thêm $45^\circ$ theo chiều kim đồng hồ.
2. Cộng $3\cdot360^\circ$: $-765^\circ+1080^\circ=315^\circ$. Hai góc có cùng điểm cuối.
3. $315^\circ=7\pi/4$ rad, còn góc tích lũy ban đầu là $-17\pi/4$ rad. Hai số đo khác nhau nhưng biểu diễn cùng điểm cuối.
4. Điểm cuối thuộc góc phần tư IV.

### Lỗi thường gặp

- Đổi dấu âm thành dương khi rút gọn góc.
- Nhầm góc đại diện trong $[0;360^\circ$) với góc ban đầu.
- Đổi độ sang radian bằng cách nhân $180/\pi$ thay vì $\pi/180$.

### Luyện tập

Tìm một góc trong $[0;360^\circ$) cùng điểm cuối với $840^\circ$. **Đáp án:** $120^\circ$. Đổi $225^\circ$ sang radian: **$5\pi/4$**.

---

## Bài 2 — Giá trị lượng giác và dấu theo góc phần tư

### Cơ sở lý thuyết

Với điểm (M(x;y)) trên đường tròn lượng giác đơn vị ứng với góc $\alpha$:

\[
\cos\alpha=x,\qquad \sin\alpha=y,\qquad
\tan\alpha=\frac{\sin\alpha}{\cos\alpha}\ (\cos\alpha\ne0),\qquad
\cot\alpha=\frac{\cos\alpha}{\sin\alpha}\ (\sin\alpha\ne0).
\]

Đẳng thức cơ bản: $\sin^2\alpha+\cos^2\alpha=1$. Do đó $\sin\alpha,\cos\alpha\in[-1;1]$. Dấu theo góc phần tư: I cả sin, cos dương; II chỉ sin dương; III chỉ tan, cot dương; IV chỉ cos dương. Trên trục, không gán góc phần tư; xét trực tiếp tọa độ.

### Ví dụ giải từng bước

Tính các giá trị lượng giác của $-765^\circ$.

1. Góc cùng điểm cuối là $315^\circ=360^\circ-45^\circ$, thuộc góc phần tư IV.
2. Góc chuẩn $45^\circ$ có sin và cos bằng $\sqrt2/2$. Ở góc phần tư IV, sin âm, cos dương.
3. (\sin$-765^\circ$=-\sqrt2/2), (\cos$-765^\circ$=\sqrt2/2).
4. $\tan=-1$, $\cot=-1$, vì cả hai tỉ số đều xác định và bằng sin chia cos hoặc cos chia sin.

Tại $90^\circ$, (cos=0) nên tan không xác định; (sin=1) nên (cot=0).

### Lỗi thường gặp

- Gán dấu theo góc chưa rút gọn hoặc nhầm góc phần tư.
- Cho rằng tan hoặc cot luôn xác định.
- Nhầm sin là hoành độ; sin là tung độ, cos là hoành độ.

### Luyện tập

Tính sin và cos của $150^\circ$. **Đáp án:** $\sin150^\circ=1/2$, $\cos150^\circ=-\sqrt3/2$. Tan xác định khi nào? **Khi $cos\alpha\ne0$, tức $alpha\ne\pi/2+k\pi$.**

---

## Bài 3 — Cung liên kết và công thức lượng giác

### Công thức cơ sở

Các công thức góc đối và góc bù:

\[
\sin(-x)=-\sin x,\quad \cos(-x)=\cos x;\qquad
\sin(\pi-x)=\sin x,\quad \cos(\pi-x)=-\cos x.
\]

Công thức cộng:

\[
\sin(a\pm b)=\sin a\cos b\pm\cos a\sin b,
\]
\[
\cos(a\pm b)=\cos a\cos b\mp\sin a\sin b.
\]

Hệ quả nhân đôi:

\[
\sin2x=2\sin x\cos x,\quad
\cos2x=\cos^2x-\sin^2x=1-2\sin^2x=2\cos^2x-1.
\]

### Ví dụ giải từng bước

Tính (sin$-1530^\circ$) bằng công thức nhân đôi.

1. (-1530^\circ=2\cdot$-765^\circ$), nên (sin$-1530^\circ$=2\sin$-765^\circ$\cos$-765^\circ$).
2. Từ bài trước, (sin$-765^\circ$=-\sqrt2/2), (cos$-765^\circ$=\sqrt2/2).
3. Kết quả là (2\cdot$-\sqrt2/2$\cdot$\sqrt2/2$=-1).
4. Kiểm tra: $-1530^\circ$ cùng điểm cuối với $270^\circ$, có sin bằng (-1).

### Lỗi thường gặp

- Dùng (\sin(a+b)=\sin a+\sin b); đây không phải đẳng thức đúng.
- Quên dấu trừ trong công thức cos của tổng/hiệu.
- Chỉ nhớ công thức mà không kiểm tra dấu và góc phần tư.

### Luyện tập

Biết sin x = 3/5 và cos x = 4/5. Tính sin 2x và cos 2x. **Đáp án:** 24/25 và 7/25. Hai giá trị dương nên x thuộc góc phần tư I; luôn kiểm tra tính nhất quán giữa dấu lượng giác và góc phần tư.

---

## Bài 4 — Đường tròn lượng giác, đồ thị và chu kỳ

### Cơ sở lý thuyết

Khi góc (x) tăng, điểm trên đường tròn đơn vị quay và tung độ của nó tạo giá trị (sin x), hoành độ tạo giá trị (cos x). Cả (sin x,cos x) có chu kỳ cơ bản $2\pi$.

Với (y=a\sin(bx+c)+d), $a,b,c,d\in\mathbb R$, $b\ne0$: biên độ là (|a|), chu kỳ $T=2\pi/|b|$, đường giữa (y=d), tập giá trị ([d-|a|;d+|a|]). Pha ngang có thể viết (bx+c=b(x+c/b)); cần chú ý dấu khi đọc dịch chuyển.

### Ví dụ giải từng bước

Phân tích (y=2\sin$3x-\pi/2$+1).

1. Viết pha (3x-\pi/2=3$x-\pi/6$), vì vậy đồ thị sin được dịch sang phải $\pi/6$.
2. Biên độ (|2|=2); đường giữa (y=1).
3. Chu kỳ $T=2\pi/3$.
4. Tập giá trị là ([1-2;1+2]=[-1;3]).
5. Tại $x=\pi/6$, pha bằng 0 nên (y=1); đây là điểm đồ thị cắt đường giữa theo chiều tăng.

### Lỗi thường gặp

- Dùng $2\pi b$ thay cho $2\pi/|b|$.
- Cho biên độ bằng (a) khi (a<0); biên độ là (|a|).
- Đọc sai chiều dịch ngang từ (bx+c).
- Cho rằng khi (b=0) công thức chu kỳ $2\pi/|b|$ vẫn áp dụng; khi đó hàm là hằng số.

### Luyện tập

Với (y=-3\cos(2x)+4), hãy nêu biên độ, chu kỳ, đường giữa, tập giá trị. **Đáp án:** $3,\pi,y=4,[1;7]$.

---

## Bài 5 — Phương trình lượng giác cơ bản và lọc nghiệm

### Cơ sở lý thuyết

Với $m\in[-1;1]$, phương trình (sin x=m) có nghiệm khi đặt $\alpha\$ là một góc có $sin\alpha=m$:

\[
x=\alpha+2k\pi\quad\text{hoặc}\quad x=\pi-\alpha+2k\pi,\qquad k\in\mathbb Z.
\]

Tương tự, với (cos x=m): $x=\pm\alpha+2k\pi$, trong đó $\cos\alpha=m$. Sau khi có nghiệm tổng quát, thay từng họ vào khoảng yêu cầu để tìm các $k\in\mathbb Z$ phù hợp. Nếu $m\notin[-1;1]$, phương trình sin/cos tương ứng vô nghiệm.

### Ví dụ giải từng bước

Giải $sin x=-\sqrt2/2$ trên đoạn $[-\pi;\pi]$.

1. Góc tham chiếu là $\pi/4$; sin âm ở góc phần tư III và IV.
2. Hai họ nghiệm có thể viết $x=-\pi/4+2k\pi$ hoặc $x=-3\pi/4+2k\pi$.
3. Với khoảng $[-\pi;\pi]$, chọn (k=0) cho cả hai họ. Các giá trị với $k\ne0$ nằm ngoài khoảng.
4. Nghiệm là $x=-\pi/4,-3\pi/4$. Hai đầu mút $-\pi,\pi$ không là nghiệm vì sin bằng 0.

### Lỗi thường gặp

- Chỉ lấy một giao điểm của đường (y=m) với đường tròn.
- Quên chu kỳ $2k\pi$.
- Tìm đúng nghiệm tổng quát nhưng không lọc theo khoảng hoặc lấy cả nghiệm ngoài khoảng.
- Lẫn đoạn đóng với khoảng mở ở hai đầu.

### Luyện tập

Giải (cos x=1/2) trên $[0;2\pi]$. **Đáp án:** $x=\pi/3,5\pi/3$. Phương trình (sin x=2) có nghiệm thực không? **Không**, vì sin chỉ nhận giá trị từ (-1) đến (1).

## Nguồn và ghi chú

Nội dung được biên soạn mới theo danh sách và mục tiêu bài trong `frontend/app/types/curriculum.ts`, đối chiếu phạm vi chung với Chương trình GDPT môn Toán ban hành kèm Thông tư 32/2018/TT-BGDĐT và văn bản hợp nhất do Bộ GDĐT công bố. Giáo viên nên đối chiếu thêm với kế hoạch dạy học và sách giáo khoa đang dùng tại trường.

Nguồn chương trình: [Bộ GDĐT, văn bản hợp nhất Chương trình GDPT](https://moet.gov.vn/content/vanban/Lists/VBPQ/Attachments/1453/vbhn-322018-202021-ttbgddt-trinh-ky-xt.pdf).
