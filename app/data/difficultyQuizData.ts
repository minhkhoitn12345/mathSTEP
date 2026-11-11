import type { ReviewQuizItem } from "../types/learningPath";

type Level = NonNullable<ReviewQuizItem["level"]>;
type Seed = [question: string, answer: string, distractors: [string, string, string]];
type LessonSeeds = Record<Level, Seed[]>;

const S: Record<string, LessonSeeds> = {
  "lp-lesson-1": {
    basic: [
      ["Biểu thức nào là bất phương trình bậc nhất hai ẩn?", "$2x-3y\\le 6$", ["$x^2+y\\le 6$", "$xy<6$", "$2x-3=0$"]],
      ["Điều kiện của hai hệ số $a,b$ trong $ax+by\\le c$ là gì?", "$a,b$ không đồng thời bằng $0$", ["$a=b$", "$a,b$ đều dương", "$a+b=1$"]],
      ["Cặp $(1;2)$ có thỏa $x+y\\le 4$ không?", "Có, vì $1+2=3\\le4$", ["Không, vì $1+2=3<4$", "Có, vì $1+2=4$", "Không thể thay tọa độ vào bất phương trình"]],
      ["Miền nghiệm của một bất phương trình bậc nhất hai ẩn thường là gì?", "Một nửa mặt phẳng, có thể gồm cả bờ", ["Một điểm duy nhất", "Một đường tròn", "Một đoạn thẳng hữu hạn"]],
      ["Đường thẳng bờ của $3x+y>5$ có phương trình nào?", "$3x+y=5$", ["$3x+y>5$", "$3x+y=0$", "$x+3y=5$"]],
    ],
    intermediate: [
      ["Kiểm tra $(2;1)$ với $2x-y\\le3$.", "Thỏa mãn vì $2\\cdot2-1=3$", ["Không thỏa vì $3>2$", "Không thỏa vì $2-1=1$", "Thỏa vì $2+2-1=4$"]],
      ["Điểm nào nằm trên bờ $x+2y=6$?", "$(2;2)$", ["$(1;2)$", "$(0;2)$", "$(4;2)$"]],
      ["Với $x-2y<4$, điểm thử $O(0;0)$ cho kết luận nào?", "$0<4$, nên nửa mặt phẳng chứa $O$ là miền nghiệm", ["$0=4$, nên $O$ nằm trên bờ", "$0>4$, nên nửa mặt phẳng chứa $O$ bị loại", "Không thể dùng điểm $O$"]],
      ["Một điểm nằm đúng trên bờ của $2x+y\\le5$ có thuộc miền nghiệm không?", "Có, vì dấu $\\le$ nhận cả trường hợp bằng", ["Không, vì mọi điểm trên bờ đều bị loại", "Chỉ thuộc nếu $x,y>0$", "Chỉ thuộc khi đường bờ nét đứt"]],
      ["Miền nghiệm của $x-y>0$ gồm phía nào?", "Phía có $x>y$", ["Phía có $x<y$", "Chỉ đường thẳng $x=y$", "Toàn bộ mặt phẳng"]],
    ],
    advanced: [
      ["Với $-2x+3y\\ge6$, điểm thử nào giúp xác định miền nghiệm và cho giá trị đúng?", "$(0;3)$ vì $9\\ge6$", ["$(0;1)$ vì $3\\ge6$", "$(3;0)$ vì $-6\\ge6$", "$(1;1)$ vì $1\\ge6$"]],
      ["Tìm $m$ để $(2;m)$ thuộc bờ $3x-y=1$.", "$m=5$", ["$m=1$", "$m=2$", "$m=7$"]],
      ["Miền nghiệm $2x+4y\\le8$ có thể viết gọn thế nào?", "$x+2y\\le4$", ["$x+2y\\ge4$", "$2x+y\\le4$", "$x+2y=4$"]],
      ["Với $x+y\\ge0$, điểm nào chắc chắn là nghiệm?", "$(2;-1)$", ["$(-2;1)$", "$(0;-1)$", "$(-3;1)$"]],
      ["Một điểm thử thỏa $ax+by<c$. Ta tô miền nghiệm theo phía nào?", "Phía chứa điểm thử; bờ bị loại", ["Phía đối diện điểm thử; bờ vẫn lấy", "Chỉ tô đường bờ", "Cả hai phía của đường bờ"]],
    ],
  },
  "lp-lesson-2": {
    basic: [
      ["Bờ của $2x+y\\ge4$ cần vẽ bằng nét gì?", "Nét liền", ["Nét đứt", "Đường cong", "Không cần vẽ bờ"]],
      ["Bờ của $x-3y<6$ cần vẽ bằng nét gì?", "Nét đứt", ["Nét liền", "Nét đôi", "Không có đường bờ"]],
      ["Hai giao điểm với trục của $x+y=4$ là gì?", "$(4;0)$ và $(0;4)$", ["$(1;4)$ và $(4;1)$", "$(0;0)$ và $(4;4)$", "$(2;0)$ và $(0;2)$"]],
      ["Vì sao thường chọn $O(0;0)$ làm điểm thử?", "Thay tọa độ nhanh nếu $O$ không nằm trên đường bờ", ["$O$ luôn là nghiệm", "$O$ luôn nằm trên đường bờ", "Vì đường thẳng nào cũng đi qua $O$"]],
      ["Nếu điểm thử làm bất phương trình sai thì miền nghiệm ở phía nào?", "Phía đối diện điểm thử", ["Phía chứa điểm thử", "Chỉ nằm trên đường bờ", "Không có miền nghiệm"]],
    ],
    intermediate: [
      ["Với $2x+y\\le4$, chọn điểm thử $O$. Phía nghiệm được xác định ra sao?", "$O$ cho $0\\le4$, nên lấy phía chứa $O$ và cả bờ", ["$O$ cho $0>4$, nên lấy phía đối diện và bỏ bờ", "$O$ nằm trên bờ nên không thể kết luận", "Lấy cả hai nửa mặt phẳng"]],
      ["Đường thẳng $3x-2y=6$ cắt trục $Ox$ tại đâu?", "$(2;0)$", ["$(0;3)$", "$(6;0)$", "$(0;-3)$"]],
      ["Với $x+y>2$, điểm $(0;0)$ cho biết điều gì?", "Bất phương trình sai nên lấy nửa mặt phẳng không chứa gốc tọa độ", ["Bất phương trình đúng nên lấy phía chứa gốc", "Gốc nằm trên bờ", "Đường bờ không cần nét đứt"]],
      ["Đường bờ đi qua $O$ khi nào với $ax+by=c$?", "Khi $c=0$", ["Khi $a=b$", "Khi $a+b=c$", "Luôn luôn"]],
      ["Với dấu $\\ge$, các điểm nằm trên bờ có được lấy không?", "Có, vì dấu bất đẳng thức có dấu bằng", ["Không, vì bờ luôn nét đứt", "Chỉ lấy nếu đường bờ qua $O$", "Chỉ lấy giao điểm với trục"]],
    ],
    advanced: [
      ["Biểu diễn $-x+2y<4$. Điểm thử $(0;0)$ cho miền nghiệm nào?", "Nửa mặt phẳng chứa $O$, không lấy bờ", ["Nửa mặt phẳng không chứa $O$, lấy bờ", "Chỉ lấy đường $-x+2y=4$", "Toàn mặt phẳng trừ $O$"]],
      ["Đường bờ $4x-2y=8$ cắt $Oy$ tại điểm nào?", "$(0;-4)$", ["$(2;0)$", "$(0;4)$", "$(-2;0)$"]],
      ["Với $x-y\\ge0$, điểm $M(1;1)$ có dùng làm điểm thử được không?", "Không, vì $M$ nằm trên đường bờ", ["Có, vì $M$ luôn là điểm thử tốt", "Không, vì $x,y$ phải dương", "Có, nhưng phải vẽ nét đứt"]],
      ["Một bạn vẽ bờ $2x+y>3$ bằng nét liền. Bạn sai ở đâu?", "Dấu $>$ không lấy điểm trên bờ nên bờ phải nét đứt", ["Dấu $>$ luôn lấy bờ", "Đường bờ phải là $2x+y=0$", "Không thể vẽ bất phương trình này"]],
      ["Với $-3x+y\\le0$, điểm thử $(1;0)$ cho kết luận nào?", "$-3\\le0$, lấy phía chứa $(1;0)$ và lấy bờ", ["$-3>0$, lấy phía đối diện", "$1\\le0$, lấy trục $Oy$", "Điểm thử nằm trên bờ"]],
    ],
  },
  "lp-lesson-3": {
    basic: [
      ["Miền nghiệm của hệ bất phương trình là gì?", "Phần giao các miền nghiệm thành phần", ["Phần hợp mọi miền", "Chỉ là giao điểm các đường bờ", "Luôn là một đường thẳng"]],
      ["Điều kiện $x\\ge0$ chọn nửa mặt phẳng nào?", "Nửa mặt phẳng bên phải trục $Oy$, kể cả trục", ["Bên trái trục $Oy$, không kể trục", "Phía trên trục $Ox$", "Chỉ riêng trục $Oy$"]],
      ["Điểm $(1;1)$ có thỏa $x\\ge0, y\\ge0$ không?", "Có", ["Không, vì $x=y$", "Không, vì $y<0$", "Chỉ thỏa một điều kiện"]],
      ["Miền nghiệm của một hệ có thể không có điểm nào không?", "Có, nếu các điều kiện mâu thuẫn", ["Không, hệ nào cũng có nghiệm", "Chỉ khi có ba bất phương trình", "Chỉ khi miền nghiệm không bị chặn"]],
      ["Đỉnh của miền đa giác nghiệm thường là giao điểm của gì?", "Các đường thẳng biên", ["Hai điểm thử bất kỳ", "Hai trục song song", "Một đường tròn và một đường thẳng"]],
    ],
    intermediate: [
      ["Điểm $(2;1)$ có thuộc miền $x+y\\le4, x\\ge0, y\\ge0$ không?", "Có, vì thỏa cả ba điều kiện", ["Không, vì $2+1>4$", "Không, vì $x$ phải bằng $0$", "Không, vì $y<0$"]],
      ["Giao của $x\\ge0$ và $y\\ge0$ là góc phần tư nào?", "Góc phần tư thứ nhất, gồm cả hai trục dương", ["Góc phần tư thứ ba", "Nửa mặt phẳng phía dưới", "Chỉ một điểm $O$"]],
      ["Hai đường $x+y=4$ và $x-y=0$ cắt nhau ở đâu?", "$(2;2)$", ["$(4;0)$", "$(0;4)$", "$(1;3)$"]],
      ["Với $x+y\\le4, x\\ge0, y\\ge0$, điểm $(4;0)$ có thuộc miền nghiệm không?", "Có, nằm trên biên và thỏa cả hệ", ["Không, vì tổng bằng $4$", "Không, vì một tọa độ bằng $0$", "Chỉ thuộc nếu thay $\\le$ bằng $<$"]],
      ["Miền nghiệm của $x\\ge2$ và $x\\le1$ có dạng nào?", "Rỗng", ["Toàn mặt phẳng", "Một dải thẳng đứng", "Một đoạn trên trục $Ox$"]],
    ],
    advanced: [
      ["Tìm đỉnh giao của $x+y=6$ và $2x+y=8$.", "$(2;4)$", ["$(4;2)$", "$(6;0)$", "$(0;8)$"]],
      ["Đỉnh nào thỏa $x+y\\le5, x\\ge1, y\\ge0$?", "$(1;0)$", ["$(0;1)$", "$(4;2)$", "$(-1;0)$"]],
      ["Hệ $x+y\\le2, x+y\\ge5$ có miền nghiệm không?", "Không; hai điều kiện về cùng tổng mâu thuẫn", ["Có; mọi điểm trên $x+y=2$", "Có; miền là hình vuông", "Không thể xác định"]],
      ["Giao của $x=0$ và $y=0$ là điểm nào?", "$O(0;0)$", ["$(1;1)$", "Không giao nhau", "Toàn bộ hai trục"]],
      ["Một miền nghiệm bị chặn bởi $x=0,y=0,x+y=4$. Các đỉnh là gì?", "$(0;0),(4;0),(0;4)$", ["$(0;0),(2;2),(4;4)$", "$(0;4),(4;4),(4;0)$", "$(1;0),(0;1),(4;4)$"]],
    ],
  },
  "lp-lesson-4": {
    basic: [
      ["Trong bài toán tối ưu tuyến tính, hàm mục tiêu dùng để làm gì?", "Tính đại lượng cần lớn nhất hoặc nhỏ nhất", ["Vẽ trục tọa độ", "Thay thế mọi ràng buộc", "Xác định đơn vị đo góc"]],
      ["Miền phương án khả thi gồm các điểm nào?", "Các điểm thỏa tất cả ràng buộc", ["Các điểm nằm ngoài mọi nửa mặt phẳng", "Chỉ các điểm có tọa độ bằng nhau", "Mọi điểm trên đường biên"]],
      ["Nếu $F=3x+2y$, tính $F(1;2)$.", "$7$", ["$5$", "$6$", "$8$"]],
      ["Trong miền đa giác lồi bị chặn, giá trị tối ưu của hàm tuyến tính đạt tại đâu?", "Ít nhất một đỉnh của miền", ["Luôn tại tâm miền", "Chỉ tại gốc tọa độ", "Chỉ giữa hai đỉnh"]],
      ["Điều kiện $x,y\\ge0$ thường mô tả điều gì trong bài thực tế?", "Số lượng không âm", ["Số lượng bắt buộc âm", "Hai biến bằng nhau", "Hàm mục tiêu không đổi"]],
    ],
    intermediate: [
      ["Với $F=5x+2y$, tính tại $A(2;3)$.", "$16$", ["$13$", "$17$", "$19$"]],
      ["Miền khả thi có các đỉnh $(0;0),(4;0),(0;3)$. Với $F=2x+3y$, giá trị tại $(4;0)$ là gì?", "$8$", ["$9$", "$12$", "$4$"]],
      ["Nếu cần tối thiểu hóa $F$ trên một đa giác, nên làm gì?", "Tính $F$ tại mọi đỉnh rồi chọn giá trị nhỏ nhất", ["Chọn đỉnh có tung độ lớn nhất", "Chỉ tính tại gốc tọa độ", "Lấy trung bình tọa độ các đỉnh"]],
      ["Với $x+y\\le6, x\\ge0,y\\ge0$, điểm $(4;3)$ khả thi không?", "Không, vì $4+3=7>6$", ["Có, vì $4<6$", "Có, vì cả hai tọa độ dương", "Không, vì $x=y$"]],
      ["Một phương án $(x;y)$ thỏa ràng buộc nhưng cho lợi nhuận thấp. Nó có khả thi không?", "Có thể khả thi, nhưng chưa chắc tối ưu", ["Không, mọi điểm khả thi đều tối ưu", "Không thể khả thi nếu lợi nhuận thấp", "Chỉ khả thi khi nằm ở đỉnh"]],
    ],
    advanced: [
      ["Miền có đỉnh $A(0;0),B(4;0),C(0;3)$. Giá trị lớn nhất của $F=2x+3y$ là bao nhiêu?", "$9$ tại $C$", ["$8$ tại $B$", "$0$ tại $A$", "$6$ tại trung điểm $BC$"]],
      ["Với các đỉnh $(0;0),(2;0),(2;3),(0;4)$, tối đa hóa $F=3x+2y$. Giá trị lớn nhất?", "$12$ tại $(2;3)$", ["$8$ tại $(0;4)$", "$6$ tại $(2;0)$", "$10$ tại $(0;0)$"]],
      ["Ràng buộc $2x+y\\le10$ và $x,y\\ge0$. Điểm nào không khả thi?", "$(4;3)$", ["$(2;3)$", "$(5;0)$", "$(0;8)$"]],
      ["Nếu hàm mục tiêu có cùng giá trị tại hai đầu mút của một cạnh khả thi, điều gì đúng trên cạnh đó?", "Mọi điểm trên cạnh đều cho cùng giá trị", ["Chỉ trung điểm khả thi", "Không có điểm tối ưu", "Các đầu mút không thuộc miền"]],
      ["Khi bài toán thực tế yêu cầu số sản phẩm nguyên, nghiệm tối ưu liên tục là $(2{,}5;1)$. Cần xử lý thế nào?", "Kiểm tra các phương án nguyên khả thi lân cận", ["Làm tròn tùy ý thành $(3;1)$", "Chấp nhận $2{,}5$ sản phẩm", "Bỏ qua ràng buộc nguyên"]],
    ],
  },
  "lp-lesson-5": {
    basic: [
      ["Khi chia hai vế bất phương trình cho số âm, ta phải làm gì?", "Đổi chiều dấu bất đẳng thức", ["Giữ nguyên chiều", "Đổi dấu bằng thành gần bằng", "Chỉ đổi dấu vế phải"]],
      ["Giải $x+3<7$ được gì?", "$x<4$", ["$x>4$", "$x<10$", "$x>10$"]],
      ["Giải $-2x\\le6$ được gì?", "$x\\ge-3$", ["$x\\le-3$", "$x\\ge3$", "$x\\le3$"]],
      ["Số lượng người hoặc sản phẩm thường phải thỏa điều kiện nào?", "Là số nguyên không âm", ["Là số thực âm", "Luôn là phân số", "Bắt buộc bằng $0$"]],
      ["Nếu nghiệm của mô hình cho số người $x=2{,}4$, kết luận phù hợp là gì?", "Kiểm tra lại điều kiện nguyên; $2{,}4$ người không phù hợp", ["Làm tròn lên luôn", "Chấp nhận nguyên trạng", "Đổi thành $-2{,}4$"]],
    ],
    intermediate: [
      ["Giải $-3x+6\\le0$.", "$x\\ge2$", ["$x\\le2$", "$x\\ge-2$", "$x\\le-2$"]],
      ["Bất phương trình $5-2x>1$ tương đương với gì?", "$x<2$", ["$x>2$", "$x<-2$", "$x> -2$"]],
      ["Bạn viết $-4x<8$ thành $x<-2$. Lỗi ở đâu?", "Quên đổi chiều khi chia cho $-4$; đúng là $x>-2$", ["Không được chia hai vế", "Đúng, không có lỗi", "Phải cộng $4$ vào hai vế"]],
      ["Điều kiện $x\\in\\mathbb{N}$ loại phương án nào?", "$x=-1$", ["$x=0$", "$x=3$", "$x=12$"]],
      ["Giải hệ $x\\ge0, x\\le3$ trên tập số nguyên.", "$x\\in\\{0,1,2,3\\}$", ["$0<x<3$", "$x\\in\\{-3,-2,-1,0\\}$", "$x\\in\\mathbb{R}$ bất kỳ"]],
    ],
    advanced: [
      ["Giải $-2(3x-1)\\ge8$.", "$x\\le-1$", ["$x\\ge-1$", "$x\\le1$", "$x\\ge1$"]],
      ["Số nguyên không âm lớn nhất thỏa $3x+2\\le14$ là bao nhiêu?", "$4$", ["$3$", "$5$", "$6$"]],
      ["Một lời giải biến $-5x\\ge10$ thành $x\\ge-2$. Sửa lại thế nào?", "$x\\le-2$", ["$x\\ge2$", "$x\\le2$", "$x=-2$"]],
      ["Tìm số nguyên dương $n$ thỏa $2n+1<8$.", "$n\\in\\{1,2,3\\}$", ["$n\\in\\{1,2,3,4\\}$", "$n\\ge4$", "$n\\in\\{0,1,2,3\\}$"]],
      ["Một xưởng có $x$ sản phẩm, $x\\in\\mathbb{N}$ và $4x\\le19$. Giá trị lớn nhất của $x$ là gì?", "$4$", ["$4{,}75$", "$5$", "$3$"]],
    ],
  },
  "sg-lesson-1": {
    basic: [
      ["Hai đường chéo hình bình hành $ABCD$ cắt nhau tại $O$. Tính chất nào đúng?", "$O$ là trung điểm của $AC$ và $BD$", ["$AC\\perp BD$ luôn đúng", "$AB=AD$ luôn đúng", "$ABCD$ luôn là hình chữ nhật"]],
      ["Trong hình bình hành, hai cạnh đối có quan hệ gì?", "Song song và bằng nhau", ["Vuông góc và bằng nhau", "Chỉ song song khi là hình chữ nhật", "Luôn có độ dài khác nhau"]],
      ["Nếu $A(0;0), B(4;0), C(5;2)$ là ba đỉnh liên tiếp của hình bình hành $ABCD$, tọa độ $D$ là gì?", "$(1;2)$", ["$(9;2)$", "$(-1;-2)$", "$(5;0)$"]],
      ["Điều kiện nào bảo đảm $S$ không nằm trên đáy $z=0$?", "Tọa độ $z$ của $S$ khác $0$", ["Tọa độ $x$ khác $0$", "$S$ có hoành độ dương", "$S$ nằm trên đường chéo $AC$"]],
      ["Từ giả thiết đáy là hình bình hành, có được tự kết luận đáy là hình chữ nhật không?", "Không, cần thêm giả thiết phù hợp", ["Có, mọi hình bình hành đều là chữ nhật", "Có, nếu hai đường chéo cắt nhau", "Có, nếu đỉnh $S$ ở ngoài đáy"]],
    ],
    intermediate: [
      ["Với $A(1;2), B(5;2), C(6;4)$, tính $D$ để $ABCD$ là hình bình hành.", "$(2;4)$", ["$(10;4)$", "$(2;0)$", "$(6;2)$"]],
      ["$A(-1;0), C(5;4)$ là hai đỉnh đối của hình bình hành. Tâm $O$ là gì?", "$(2;2)$", ["$(4;4)$", "$(2;4)$", "$(3;2)$"]],
      ["Nếu $O$ là trung điểm $AC$ và $BD$, viết tọa độ $D$ theo $A,B,C$.", "$D=A+C-B$", ["$D=A+B+C$", "$D=B+C-A$", "$D=A-C+B$"]],
      ["Đáy nằm trên mặt phẳng $z=0$, còn $S(2;-1;3)$. Vì sao đây là hình chóp không suy biến?", "$S$ không thuộc mặt phẳng đáy vì $3\\ne0$", ["Vì $x=2$", "Vì $y=-1$", "Vì $S$ nằm trên đường chéo đáy"]],
      ["Trong hình bình hành, nếu $AB=5$ thì độ dài cạnh nào chắc chắn bằng $5$?", "$CD$", ["$BC$", "$AC$", "$BD$"]],
    ],
    advanced: [
      ["Cho $A(1;0;0), B(4;1;0), C(6;4;0)$. Tìm $D$.", "$(3;3;0)$", ["$(11;5;0)$", "$(3;5;0)$", "$(1;4;0)$"]],
      ["Cho $A(0;0), B(3;1), D(-1;2)$. Tìm $C$.", "$(2;3)$", ["$(-4;1)$", "$(4;-1)$", "$(2;1)$"]],
      ["Trong hình bình hành, $AC=10$. Tâm giao hai đường chéo cho biết $AO$ bằng bao nhiêu?", "$5$", ["$10$", "$20$", "Không thể xác định"]],
      ["Một bạn kết luận $SA\\perp(ABCD)$ chỉ vì đã vẽ hình chóp có $S$ nằm phía trên đáy. Đánh giá nào đúng?", "Kết luận thiếu giả thiết vuông góc", ["Đúng với mọi hình chóp", "Đúng khi đáy là hình bình hành", "Sai vì $S$ phải nằm trong đáy"]],
      ["Nếu $A,B,C,D$ theo thứ tự là hình bình hành, véc-tơ nào bằng $\\vec{AD}$?", "$\\vec{BC}$", ["$\\vec{CB}$", "$\\vec{AB}$", "$\\vec{DC}$"]],
    ],
  },
  "sg-lesson-2": {
    basic: [
      ["$M$ là trung điểm $SA$. Tỉ số $SM/SA$ bằng bao nhiêu?", "$1/2$", ["$1/3$", "$2/3$", "$1$"]],
      ["Nếu $SN:NB=2:1$, phần $SN$ chiếm bao nhiêu của $SB$?", "$2/3$", ["$1/2$", "$1/3$", "$2$"]],
      ["Điểm $N$ chia đoạn $SB$ với $SN:NB=2:1$ nằm gần điểm nào hơn?", "$B$", ["$S$", "Cách đều $S,B$", "Nằm ngoài đoạn $SB$"]],
      ["Nếu $N$ nằm trên đoạn $SB$, điều gì đúng về $SN+NB$?", "$SN+NB=SB$", ["$SN-NB=SB$", "$SN=NB$ luôn đúng", "$SN+SB=NB$"]],
      ["Công thức véc-tơ điểm chia đoạn $SN=t\\,SB$ cho tọa độ $N$ là gì?", "$N=S+t(B-S)$", ["$N=B+t(S-B)$", "$N=S+B+t$", "$N=t(S+B)$"]],
    ],
    intermediate: [
      ["$SB=12$ và $SN:NB=2:1$. Tính $SN$.", "$8$", ["$6$", "$4$", "$10$"]],
      ["$S(0;0;6), B(3;0;0)$, $N$ thỏa $SN/SB=2/3$. Tọa độ $N$ là gì?", "$(2;0;2)$", ["$(1;0;4)$", "$(2;0;4)$", "$(3;0;2)$"]],
      ["$M$ là trung điểm $SA$, với $S(2;4;6), A(0;0;0)$. Tọa độ $M$?", "$(1;2;3)$", ["$(2;2;3)$", "$(1;4;3)$", "$(0;2;6)$"]],
      ["Trong tam giác $SAB$, nếu $SM/SA=SN/SB$ thì kết luận nào thường dùng được?", "$MN\\parallel AB$ theo định lý Thales đảo", ["$MN\\perp AB$", "$M=N$", "$SA=SB$"]],
      ["Nếu $SN/SB=1/4$, tỉ số $SN:NB$ là gì?", "$1:3$", ["$1:4$", "$3:1$", "$2:3$"]],
    ],
    advanced: [
      ["$S(1;2;5), B(7;-1;2)$ và $SN:NB=2:1$. Tìm $N$.", "$(5;0;3)$", ["$(3;1;4)$", "$(5;1;3)$", "$(7;0;2)$"]],
      ["Trong $\\triangle SAB$, $SM=3, SA=8$ và $SN/SB=3/8$. Quan hệ giữa $MN$ và $AB$?", "$MN\\parallel AB$", ["$MN\\perp AB$", "$MN=AB$", "Không thể kết luận dù hai tỉ số bằng nhau"]],
      ["$M$ là trung điểm $SA$, $SN:NB=1:1$. Hai điểm $M,N$ cho đoạn $MN$ song song cạnh nào?", "$AB$", ["$SB$", "$SA$", "$AC$"]],
      ["$S(0;3;6), A(2;1;0)$, điểm $M$ thỏa $SM:MA=1:2$. Tọa độ $M$?", "$\\left(\\frac23;\\frac73;4\\right)$", ["$\\left(\\frac43;\\frac53;2\\right)$", "$(1;2;3)$", "$\\left(\\frac23;1;4\\right)$"]],
      ["Với $N=S+\\frac23(B-S)$, véc-tơ $\\vec{SN}$ bằng gì?", "$\\frac23\\vec{SB}$", ["$\\frac13\\vec{SB}$", "$\\vec{SB}$", "$\\frac32\\vec{SB}$"]],
    ],
  },
  "sg-lesson-3": {
    basic: [
      ["Hai đường thẳng chéo nhau có đặc điểm nào?", "Không đồng phẳng và không cắt nhau", ["Cùng nằm trong một mặt phẳng", "Song song và đồng phẳng", "Cắt nhau tại một điểm"]],
      ["Nếu $d\\parallel(P)$ theo định nghĩa phổ thông, $d$ có điểm chung với $(P)$ không?", "Không có điểm chung", ["Có đúng một điểm", "Có vô số điểm", "Luôn nằm trong $(P)$"]],
      ["Hai mặt phẳng phân biệt cắt nhau thì giao tuyến là gì?", "Một đường thẳng", ["Một điểm", "Một đoạn thẳng", "Một mặt phẳng"]],
      ["Một hình vẽ 2D khiến hai đường trông như cắt nhau có đủ chứng minh chúng cắt nhau trong không gian không?", "Không, cần lập luận không gian", ["Có, hình chiếu luôn bảo toàn giao điểm", "Có, nếu nét liền", "Chỉ cần chúng cùng màu"]],
      ["Để chứng minh $d$ song song với $(P)$ bằng một đường trong mặt phẳng, ta thường tìm gì?", "Đường $a\\subset(P)$ sao cho $d\\parallel a$ và $d$ không nằm trong $(P)$", ["Một điểm bất kỳ trên $d$", "$d\\perp a$", "Một đường tròn thuộc $(P)$"]],
    ],
    intermediate: [
      ["$d$ cắt $(P)$ tại đúng một điểm. Quan hệ nào đúng?", "$d$ cắt $(P)$", ["$d\\parallel(P)$", "$d\\subset(P)$", "$d$ chéo với $(P)$"]],
      ["Hai đường $AB$ và $SD$ trong hình chóp có thể chéo nhau nếu điều gì được chứng minh?", "Không đồng phẳng và không cắt nhau", ["Hình chiếu của chúng giao nhau", "Chúng có cùng độ dài", "Chúng cùng đi qua $S$"]],
      ["Nếu $A,B$ thuộc cả $(P)$ và $(Q)$, giao tuyến của hai mặt phẳng đi qua những điểm nào?", "$A$ và $B$", ["Chỉ qua $S$", "Không đi qua $A,B$", "Chỉ qua trung điểm $AB$"]],
      ["Đường $d$ nằm trong $(P)$ có được gọi là song song với $(P)$ không?", "Không; $d$ nằm trong mặt phẳng", ["Có, vì có vô số điểm chung", "Có, nếu $d$ không cắt đường thẳng nào", "Chỉ khi $d$ nằm ngang"]],
      ["Một đường thẳng song song với $a$ nằm trong $(P)$ và không thuộc $(P)$. Kết luận nào có thể dùng?", "$d\\parallel(P)$", ["$d\\perp(P)$", "$d\\subset(P)$", "$d$ cắt $(P)$"]],
    ],
    advanced: [
      ["Trong hình chóp $S.ABCD$, $O=AC\\cap BD$. Giao điểm của $SO$ với đáy là gì?", "$O$", ["$S$", "$A$", "Không có giao điểm"]],
      ["Cho $d\\parallel a$, $a\\subset(P)$ và $d$ không nằm trong $(P)$. Quan hệ của $d$ với $(P)$?", "$d\\parallel(P)$", ["$d\\perp(P)$", "$d\\subset(P)$", "$d$ cắt $(P)$ tại hai điểm"]],
      ["Hai đường thẳng cùng song song với một đường thẳng thứ ba có nhất thiết song song nhau trong không gian không?", "Không; chúng có thể chéo nhau", ["Có, luôn đồng phẳng", "Có, hoặc vuông góc", "Không; chúng luôn cắt nhau"]],
      ["Nếu $d\\subset(P)$ và $d\\subset(Q)$ với $(P)\\ne(Q)$, $d$ là gì?", "Giao tuyến của $(P)$ và $(Q)$", ["Pháp tuyến chung", "Đường vuông góc chung", "Một điểm chung"]],
      ["Để chứng minh hai đường chéo nhau, vì sao chứng minh không đồng phẳng là mấu chốt?", "Hai đường cắt nhau thì phải đồng phẳng; không đồng phẳng loại khả năng đó", ["Vì hai đường có độ dài khác nhau", "Vì hình chiếu không giao nhau", "Vì một đường phải vuông góc mặt đáy"]],
    ],
  },
  "sg-lesson-4": {
    basic: [
      ["Thiết diện của khối đa diện là gì?", "Hình thu được khi mặt phẳng cắt khối", ["Một cạnh khuất bất kỳ", "Hình chiếu của khối", "Luôn là tam giác đều"]],
      ["Mặt phẳng song song đáy cắt hình chóp thường tạo thiết diện có quan hệ nào với đáy?", "Đồng dạng với đáy", ["Luôn bằng đáy", "Vuông góc với đáy", "Luôn là đường tròn"]],
      ["Nếu mặt phẳng cắt khối theo một đa giác, mỗi đỉnh thiết diện nằm ở đâu?", "Trên cạnh hoặc mặt của khối nơi mặt phẳng đi qua", ["Luôn ở đỉnh chóp", "Luôn ngoài khối", "Chỉ trên đường chéo đáy"]],
      ["Đường giao tuyến của mặt phẳng cắt với một mặt bên là gì?", "Một đoạn thẳng thuộc thiết diện", ["Luôn là đường tròn", "Một điểm nằm ngoài khối", "Một đường song song mọi cạnh"]],
      ["Nếu thiết diện song song đáy qua trung điểm cạnh bên của hình chóp, tỉ số đồng dạng là gì?", "$1/2$", ["$1/3$", "$2$", "$1$"]],
    ],
    intermediate: [
      ["Tứ diện $SABC$, $M,N,P$ lần lượt là trung điểm $SA,SB,SC$. Quan hệ giữa $(MNP)$ và $(ABC)$?", "$(MNP)\\parallel(ABC)$", ["$(MNP)\\perp(ABC)$", "Hai mặt phẳng trùng nhau", "Chỉ có $MN\\parallel BC$"]],
      ["Thiết diện đồng dạng đáy với tỉ số độ dài $k=2/3$. Tỉ số diện tích là gì?", "$4/9$", ["$2/3$", "$8/27$", "$3/2$"]],
      ["Mặt phẳng song song đáy cắt $SA$ tại $M$, với $SM/SA=1/3$. Tỉ số cạnh tương ứng thiết diện/đáy là gì?", "$1/3$", ["$2/3$", "$1/9$", "$3$"]],
      ["Trong tam giác $SAB$, $MN\\parallel AB$ và $SM/SA=2/5$. Tính $MN/AB$.", "$2/5$", ["$3/5$", "$4/25$", "$5/2$"]],
      ["Mặt phẳng cắt qua $M$ trên $SA$ và song song với đáy. Vì sao giao tuyến trên mặt $SAB$ song song $AB$?", "Áp dụng định lý Thales trong tam giác $SAB$", ["Vì $SA=SB$", "Vì $M$ là đỉnh đáy", "Vì mọi giao tuyến đều vuông góc $AB$"]],
    ],
    advanced: [
      ["Thiết diện song song đáy có tỉ số đồng dạng $k=0{,}4$. Tỉ số diện tích là gì?", "$0{,}16$", ["$0{,}4$", "$0{,}8$", "$0{,}064$"]],
      ["Trong hình chóp, mặt phẳng song song đáy qua $M$ với $SM/SA=3/5$. Tỉ số thể tích khối chóp nhỏ/toàn khối là gì?", "$27/125$", ["$9/25$", "$3/5$", "$27/25$"]],
      ["Tỉ số diện tích thiết diện/đáy bằng $1/9$. Tỉ số độ dài đồng dạng dương bằng bao nhiêu?", "$1/3$", ["$1/9$", "$1/81$", "$3$"]],
      ["Trong tứ diện, $SM/SA=SN/SB=1/2$. Kết luận nào về $MN$?", "$MN\\parallel AB$ và $MN=AB/2$", ["$MN\\perp AB$", "$MN=AB$", "Không thể kết luận dù cùng tỉ số"]],
      ["Một mặt phẳng song song đáy cắt bốn cạnh bên tại cùng tỉ số $k$. Hình thiết diện là ảnh của đáy qua phép nào?", "Phép vị tự tâm đỉnh $S$, tỉ số $k$", ["Phép tịnh tiến", "Phép quay $90^\\circ$", "Phép đối xứng trục"]],
    ],
  },
  "sg-lesson-5": {
    basic: [
      ["Khi trải phẳng một mặt tam giác, độ dài cạnh có thay đổi không?", "Không; phép trải phẳng bảo toàn độ dài trên mặt", ["Có, luôn tăng gấp đôi", "Có, luôn bằng $0$", "Chỉ góc thay đổi"]],
      ["Đường ngắn nhất giữa hai điểm trên một mặt phẳng là gì?", "Đoạn thẳng nối hai điểm", ["Đường gấp khúc bất kỳ", "Một cung tròn", "Đường biên của mặt"]],
      ["Muốn tìm đường ngắn nhất đi qua hai mặt của khối, ta có thể làm gì?", "Trải hai mặt kề nhau rồi nối hai điểm bằng đoạn thẳng", ["Cộng chu vi hai mặt", "Chỉ nhìn hình chiếu", "Lấy đường cao của khối"]],
      ["Khi khai triển mặt bên quanh cạnh chung, cạnh bản lề có độ dài đổi không?", "Không", ["Có, phụ thuộc góc", "Luôn gấp đôi", "Biến thành đường cong"]],
      ["Một đường gấp khúc trên các mặt sau khi trải phẳng tương ứng với gì trên khối?", "Đường đi trên các mặt của khối", ["Đường đi xuyên qua khối", "Đường cao của khối", "Đường chéo đáy duy nhất"]],
    ],
    intermediate: [
      ["Hình vuông cạnh $3$ được trải phẳng. Đường chéo của nó dài bao nhiêu?", "$3\\sqrt2$", ["$6$", "$3$", "$9$"]],
      ["Hai mặt tam giác kề nhau được mở thành một mặt phẳng. Vì sao nối hai điểm bằng đoạn thẳng cho đường ngắn nhất trong triển khai?", "Đoạn thẳng ngắn nhất giữa hai điểm trong mặt phẳng", ["Vì mọi tam giác đều vuông", "Vì cạnh bị co lại", "Vì đường gấp khúc luôn ngắn hơn"]],
      ["Khi trải phẳng mặt tam giác, cạnh gắn với bản lề đóng vai trò gì?", "Trục quay; các điểm trên cạnh giữ nguyên vị trí", ["Cạnh bị xóa", "Đường kính của đường tròn", "Cạnh tự đổi độ dài"]],
      ["Nếu đường đi trên khối qua ba mặt, cần trải những mặt nào?", "Ba mặt theo đúng thứ tự đường đi", ["Chỉ mặt đầu và mặt cuối", "Mọi mặt của khối", "Chỉ mặt đáy"]],
      ["Trải một mặt rồi nối điểm đầu-cuối bằng đoạn thẳng nhưng đoạn cắt ra ngoài phần các mặt đã trải. Có dùng được ngay không?", "Không; cần kiểm tra đoạn nằm trong miền trải tương ứng", ["Có, mọi đoạn thẳng đều hợp lệ", "Có, chỉ cần độ dài nhỏ", "Không, vì đoạn thẳng không bảo toàn độ dài"]],
    ],
    advanced: [
      ["Hình chóp có đáy vuông cạnh $2$, đường cao mặt bên $3$. Trải hai mặt kề nhau để nối hai đỉnh ngoài cùng qua đỉnh chung. Độ dài đoạn nối phụ thuộc vào gì?", "Hình triển khai và tọa độ hai điểm sau khi trải", ["Chỉ thể tích hình chóp", "Chỉ chiều cao vuông góc", "Không phụ thuộc kích thước cạnh"]],
      ["Một đường đi qua các mặt $F_1,F_2,F_3$. Cách dựng ứng viên ngắn nhất phù hợp là gì?", "Trải liên tiếp ba mặt theo cạnh chung rồi nối hai đầu mút", ["Trải riêng từng mặt rồi cộng đường chéo", "Chiếu khối lên đáy", "Cộng độ dài các cạnh bản lề"]],
      ["Vì sao cần thử nhiều thứ tự mặt khi điểm đầu-cuối có nhiều đường đi trên khối?", "Mỗi thứ tự tạo một miền triển khai và đoạn nối khác nhau", ["Vì độ dài cạnh thay đổi khi gấp", "Vì không có đường thẳng trong mặt phẳng", "Vì mọi đường đi đều có độ dài bằng nhau"]],
      ["Trên triển khai hai tam giác kề nhau, khoảng cách ngắn nhất giữa hai điểm nằm ở hai tam giác được tìm bằng gì?", "Đoạn thẳng nối ảnh của hai điểm trên cùng mặt phẳng", ["Tổng chu vi hai tam giác", "Đường vuông góc với cạnh bản lề", "Đường tròn qua hai điểm"]],
      ["Sau khi tìm đoạn nối ngắn trên triển khai, cần kiểm tra điều gì trước khi kết luận?", "Đoạn cắt qua các cạnh nối đúng thứ tự và nằm trên các mặt đã chọn", ["Đoạn phải đi qua đỉnh chóp", "Đoạn phải song song đáy", "Độ dài đoạn phải bằng chu vi đáy"]],
    ],
  },
  "trig-lesson-1": {
    basic: [
      ["Góc lượng giác quay ngược chiều kim đồng hồ mang dấu gì?", "Dương", ["Âm", "Bằng $0$", "Không xác định"]],
      ["Hai góc cùng điểm cuối trên đường tròn lượng giác hơn kém nhau bao nhiêu?", "Một bội nguyên của $360^\\circ$ hoặc $2\\pi$", ["Một bội của $90^\\circ$", "Luôn bằng nhau", "Một bội của $180$ rad"]],
      ["Góc $-45^\\circ$ có góc đại diện dương nào trong $[0^\\circ;360^\\circ)$?", "$315^\\circ$", ["$45^\\circ$", "$225^\\circ$", "$405^\\circ$"]],
      ["Điểm gốc trên đường tròn lượng giác thường là điểm nào?", "$A(1;0)$", ["$O(0;0)$", "$B(0;1)$", "$C(-1;0)$"]],
      ["Góc $810^\\circ$ tương đương với góc nào trong một vòng?", "$90^\\circ$", ["$180^\\circ$", "$270^\\circ$", "$360^\\circ$"]],
    ],
    intermediate: [
      ["Rút gọn $-765^\\circ$ về góc dương nhỏ hơn $360^\\circ$.", "$315^\\circ$", ["$45^\\circ$", "$135^\\circ$", "$765^\\circ$"]],
      ["Góc $-\\frac{7\\pi}{3}$ có góc cùng phương trong $[0;2\\pi)$ là gì?", "$\\frac{5\\pi}{3}$", ["$\\frac{\\pi}{3}$", "$\\frac{7\\pi}{3}$", "$\\frac{4\\pi}{3}$"]],
      ["Điểm cuối của góc $150^\\circ$ thuộc góc phần tư nào?", "II", ["I", "III", "IV"]],
      ["Góc $-\\frac{\\pi}{4}$ quay theo chiều nào?", "Cùng chiều kim đồng hồ", ["Ngược chiều kim đồng hồ", "Không quay", "Quay hai vòng dương"]],
      ["Đổi $\\frac{3\\pi}{2}$ rad sang độ.", "$270^\\circ$", ["$180^\\circ$", "$90^\\circ$", "$540^\\circ$"]],
    ],
    advanced: [
      ["Tìm $k$ nguyên để $-765^\\circ=315^\\circ+360^\\circ k$.", "$k=-3$", ["$k=3$", "$k=-2$", "$k=2$"]],
      ["Một điểm trên đường tròn có tọa độ $(\\frac12;-\\frac{\\sqrt3}{2})$. Góc đại diện dương là gì?", "$300^\\circ$", ["$60^\\circ$", "$120^\\circ$", "$240^\\circ$"]],
      ["Góc $\\frac{25\\pi}{6}$ có góc đại diện trong $[0;2\\pi)$ là gì?", "$\\frac{\\pi}{6}$", ["$\\frac{5\\pi}{6}$", "$\\frac{13\\pi}{6}$", "$\\frac{11\\pi}{6}$"]],
      ["Góc $-\\frac{17\\pi}{4}$ có điểm cuối trùng góc nào trong $[0;2\\pi)$?", "$\\frac{7\\pi}{4}$", ["$\\frac{\\pi}{4}$", "$\\frac{5\\pi}{4}$", "$\\frac{3\\pi}{4}$"]],
      ["Điểm cuối góc $\\alpha$ ở góc phần tư IV. Dấu của $\\sin\\alpha$ và $\\cos\\alpha$ là gì?", "$\\sin\\alpha<0,\\;\\cos\\alpha>0$", ["Cả hai dương", "$\\sin\\alpha>0,\\;\\cos\\alpha<0$", "Cả hai âm"]],
    ],
  },
  "trig-lesson-2": {
    basic: [
      ["Đổi $180^\\circ$ sang radian.", "$\\pi$ rad", ["$2\\pi$ rad", "$\\frac{\\pi}{2}$ rad", "$1$ rad"]],
      ["Đổi $90^\\circ$ sang radian.", "$\\frac{\\pi}{2}$", ["$\\pi$", "$2\\pi$", "$\\frac{\\pi}{4}$"]],
      ["Đổi $\\pi$ rad sang độ.", "$180^\\circ$", ["$90^\\circ$", "$360^\\circ$", "$60^\\circ$"]],
      ["Công thức đổi từ độ sang radian là gì?", "$\\alpha^\\circ\\cdot\\frac{\\pi}{180}$", ["$\\alpha^\\circ\\cdot180\\pi$", "$\\frac{180}{\\alpha}\\pi$", "$\\alpha^\\circ+180$"]],
      ["Đổi $60^\\circ$ sang radian.", "$\\frac{\\pi}{3}$", ["$\\frac{\\pi}{6}$", "$\\frac{2\\pi}{3}$", "$\\frac{3\\pi}{2}$"]],
    ],
    intermediate: [
      ["Đổi $150^\\circ$ sang radian.", "$\\frac{5\\pi}{6}$", ["$\\frac{3\\pi}{5}$", "$\\frac{6\\pi}{5}$", "$\\frac{\\pi}{6}$"]],
      ["Đổi $\\frac{7\\pi}{4}$ rad sang độ.", "$315^\\circ$", ["$225^\\circ$", "$135^\\circ$", "$270^\\circ$"]],
      ["Góc $\\frac{11\\pi}{6}$ rad có số đo độ nào?", "$330^\\circ$", ["$300^\\circ$", "$210^\\circ$", "$165^\\circ$"]],
      ["Đổi $-45^\\circ$ sang radian.", "$-\\frac{\\pi}{4}$", ["$\\frac{\\pi}{4}$", "$-\\frac{\\pi}{2}$", "$-\\frac{3\\pi}{4}$"]],
      ["Đổi $225^\\circ$ sang radian.", "$\\frac{5\\pi}{4}$", ["$\\frac{3\\pi}{4}$", "$\\frac{7\\pi}{6}$", "$\\frac{4\\pi}{5}$"]],
    ],
    advanced: [
      ["Góc $\\frac{17\\pi}{6}$ có số đo dương nhỏ hơn $2\\pi$ cùng phương là gì?", "$\\frac{5\\pi}{6}$", ["$\\frac{\\pi}{6}$", "$\\frac{11\\pi}{6}$", "$\\frac{17\\pi}{6}$"]],
      ["Một cung có độ dài $s=3$ trên đường tròn bán kính $2$. Số đo radian của góc ở tâm là gì?", "$\\frac32$ rad", ["$6$ rad", "$1$ rad", "$\\frac23$ rad"]],
      ["Đổi $-330^\\circ$ sang radian và rút gọn.", "$-\\frac{11\\pi}{6}$", ["$-\\frac{5\\pi}{6}$", "$\\frac{11\\pi}{6}$", "$-\\frac{3\\pi}{2}$"]],
      ["Góc $\\frac{29\\pi}{3}$ tương đương với góc nào trong $[0;2\\pi)$?", "$\\frac{5\\pi}{3}$", ["$\\frac{2\\pi}{3}$", "$\\frac{11\\pi}{3}$", "$\\frac{\\pi}{3}$"]],
      ["Nếu $\\alpha=2{,}4$ rad, kết luận nào chắc chắn đúng?", "$\\alpha$ là số đo radian; đổi sang độ bằng $2{,}4\\cdot180/\\pi$", ["$\\alpha=2{,}4^\\circ$", "$\\alpha=2{,}4\\pi$ rad", "$\\alpha$ luôn thuộc góc phần tư I"]],
    ],
  },
  "trig-lesson-3": {
    basic: [
      ["Công thức nào đúng với mọi $x$?", "$\\sin(\\pi-x)=\\sin x$", ["$\\sin(\\pi-x)=-\\sin x$", "$\\cos(\\pi-x)=\\cos x$", "$\\tan(\\pi-x)=\\tan x$"]],
      ["Công thức nhân đôi của sin là gì?", "$\\sin2x=2\\sin x\\cos x$", ["$\\sin2x=\\sin x+\\cos x$", "$\\sin2x=\\sin^2x-\\cos^2x$", "$\\sin2x=2\\sin x$"]],
      ["Công thức nào đúng với cos của hai góc đối nhau?", "$\\cos(-x)=\\cos x$", ["$\\cos(-x)=-\\cos x$", "$\\sin(-x)=\\sin x$", "$\\tan(-x)=\\tan x$"]],
      ["Giá trị của $\\sin(\\pi+x)$ bằng gì?", "$-\\sin x$", ["$\\sin x$", "$\\cos x$", "$-\\cos x$"]],
      ["Công thức đúng cho $\\cos2x$ là gì?", "$\\cos^2x-\\sin^2x$", ["$2\\sin x\\cos x$", "$\\sin^2x+\\cos^2x$", "$\\cos x-\\sin x$"]],
    ],
    intermediate: [
      ["Tính $\\sin(3\\pi/4)$ bằng công thức cung phụ.", "$\\sqrt2/2$", ["$-\\sqrt2/2$", "$1/2$", "$-1/2$"]],
      ["Tính $\\cos(2\\pi/3)$.", "$-1/2$", ["$1/2$", "$-\\sqrt3/2$", "$\\sqrt3/2$"]],
      ["Biết $\\sin x=3/5$ và $\\cos x=4/5$. Tính $\\sin2x$.", "$24/25$", ["$7/25$", "$12/25$", "$-24/25$"]],
      ["Tính $\\sin(\\pi+x)$ khi $\\sin x=1/3$.", "$-1/3$", ["$1/3$", "$\\sqrt8/3$", "$-\\sqrt8/3$"]],
      ["Nếu $\\tan x=2$, tính $\\tan(-x)$.", "$-2$", ["$2$", "$1/2$", "$-1/2$"]],
    ],
    advanced: [
      ["Rút gọn $\\frac{1-\\cos^2x}{\\sin x}$ với $\\sin x\\ne0$.", "$\\sin x$", ["$\\cos x$", "$1$", "$\\tan x$"]],
      ["Biết $\\sin x+\\cos x=\\sqrt2$. Tính $\\sin2x$.", "$1$", ["$0$", "$-1$", "$\\sqrt2$"]],
      ["Rút gọn $\\sin(\\pi-x)+\\sin(\\pi+x)$.", "$0$", ["$2\\sin x$", "$-2\\sin x$", "$2\\cos x$"]],
      ["Nếu $\\cos x=-12/13$ ở góc phần tư III, tính $\\sin x$.", "$-5/13$", ["$5/13$", "$12/13$", "$-12/13$"]],
      ["Rút gọn $\\frac{\\sin2x}{2\\cos x}$ với $\\cos x\\ne0$.", "$\\sin x$", ["$\\cos x$", "$2\\sin x$", "$\\tan x$"]],
    ],
  },
  "trig-lesson-4": {
    basic: [
      ["Chu kỳ của $y=\\sin x$ là bao nhiêu?", "$2\\pi$", ["$\\pi$", "$\\pi/2$", "$4\\pi$"]],
      ["Giá trị lớn nhất của $\\cos x$ là gì?", "$1$", ["$0$", "$-1$", "$2$"]],
      ["Tập giá trị của $y=\\sin x$ là gì?", "$[-1;1]$", ["$[0;1]$", "$\\mathbb R$", "$[0;2\\pi]$"]],
      ["Điểm cao nhất trên đồ thị $y=\\sin x$ có tung độ nào?", "$1$", ["$0$", "$-1$", "$2$"]],
      ["Chu kỳ của $y=\\sin(2x)$ là bao nhiêu?", "$\\pi$", ["$2\\pi$", "$4\\pi$", "$\\pi/2$"]],
    ],
    intermediate: [
      ["Tìm chu kỳ của $y=\\cos(3x)$.", "$2\\pi/3$", ["$3\\pi$", "$2\\pi$", "$\\pi/3$"]],
      ["Nếu $y=2\\sin x+1$, tập giá trị là gì?", "$[-1;3]$", ["$[-2;2]$", "$[0;2]$", "$[-1;1]$"]],
      ["Hàm số $y=2\\sin x+1$ đạt giá trị lớn nhất nào?", "$3$", ["$2$", "$1$", "$-1$"]],
      ["Hàm số $y=3\\cos x-2$ có giá trị nhỏ nhất nào?", "$-5$", ["$-3$", "$-2$", "$1$"]],
      ["Biên độ của $y=3\\cos x$ là bao nhiêu?", "$3$", ["$1$", "$2$", "$6$"]],
    ],
    advanced: [
      ["Hàm số $y=2\\sin(3x-\\pi/2)$ có chu kỳ nào?", "$2\\pi/3$", ["$2\\pi$", "$3\\pi$", "$\\pi/2$"]],
      ["Hàm số $y=2\\sin x+1$ có biên độ bằng bao nhiêu?", "$2$", ["$1$", "$3$", "$2\\pi$"]],
      ["Đường trung bình của đồ thị $y=3\\cos x-2$ có phương trình nào?", "$y=-2$", ["$y=3$", "$y=1$", "$y=0$"]],
      ["Với $y=\\sin x$, giá trị tại $x=3\\pi/2$ là gì?", "$-1$", ["$1$", "$0$", "$1/2$"]],
      ["Đồ thị $y=\\sin(x-\\pi/2)$ là đồ thị sin dịch chuyển theo hướng nào?", "Sang phải $\\pi/2$", ["Sang trái $\\pi/2$", "Lên trên $\\pi/2$", "Co theo phương đứng $\\pi/2$"]],
    ],
  },
  "trig-lesson-5": {
    basic: [
      ["Phương trình $\\sin x=0$ có nghiệm nào?", "$x=k\\pi,\\;k\\in\\mathbb Z$", ["$x=\\pi/2+k\\pi$", "$x=2k\\pi+\\pi/2$", "$x=k\\pi/2$"]],
      ["Điều kiện để $\\cos x=m$ có nghiệm là gì?", "$|m|\\le1$", ["$m>1$", "$m< -1$", "$m=0$ là trường hợp duy nhất"]],
      ["Phương trình $\\tan x=0$ có nghiệm nào?", "$x=k\\pi$", ["$x=\\pi/2+k\\pi$", "$x=2k\\pi+\\pi$", "$x=\\pi/4+k\\pi$"]],
      ["Nghiệm của $\\cos x=1$ là gì?", "$x=2k\\pi$", ["$x=\\pi+2k\\pi$", "$x=k\\pi$", "$x=\\pi/2+k\\pi$"]],
      ["Nghiệm của $\\sin x=1$ là gì?", "$x=\\pi/2+2k\\pi$", ["$x=\\pi/2+k\\pi$", "$x=2k\\pi$", "$x=\\pi+k\\pi$"]],
    ],
    intermediate: [
      ["Giải $\\sin x=\\sqrt3/2$ trên $[0;2\\pi]$.", "$x=\\pi/3$ hoặc $x=2\\pi/3$", ["Chỉ $x=\\pi/3$", "Chỉ $x=2\\pi/3$", "$x=\\pi/6$ hoặc $5\\pi/6$"]],
      ["Giải $\\cos x=0$ trên $[0;2\\pi]$.", "$x=\\pi/2$ hoặc $x=3\\pi/2$", ["$x=0$ hoặc $2\\pi$", "$x=\\pi$", "$x=\\pi/4$ hoặc $5\\pi/4$"]],
      ["Phương trình $\\sin x=1{,}2$ có bao nhiêu nghiệm thực?", "Không có nghiệm", ["Một nghiệm", "Hai nghiệm mỗi chu kỳ", "Vô số nghiệm"]],
      ["Nghiệm tổng quát của $\\cos x=\\cos\\alpha$ là gì?", "$x=\\pm\\alpha+2k\\pi$", ["$x=\\alpha+k\\pi$", "$x=\\pm\\alpha+k\\pi$", "$x=\\alpha+2k\\pi$ khi $k$ chỉ nhận số chẵn"]],
      ["Nghiệm tổng quát của $\\sin x=\\sin\\alpha$ gồm những họ nào?", "$x=\\alpha+2k\\pi$ hoặc $x=\\pi-\\alpha+2k\\pi$", ["Chỉ $x=\\alpha+2k\\pi$", "$x=\\pm\\alpha+2k\\pi$", "$x=\\alpha+k\\pi$"]],
    ],
    advanced: [
      ["Giải $\\sin x=-\\sqrt2/2$ trên $[-\\pi;\\pi]$.", "$x=-3\\pi/4$ hoặc $x=-\\pi/4$", ["Chỉ $x=-\\pi/4$", "$x=\\pi/4$ hoặc $3\\pi/4$", "$x=-\\pi/2$ hoặc $\\pi/2$"]],
      ["Giải $2\\cos x-1=0$ trên $[0;2\\pi]$.", "$x=\\pi/3$ hoặc $x=5\\pi/3$", ["$x=\\pi/3$ hoặc $2\\pi/3$", "$x=0$ hoặc $2\\pi$", "$x=\\pi/6$ hoặc $11\\pi/6$"]],
      ["Các nghiệm của $\\tan x=\\sqrt3$ là gì?", "$x=\\pi/3+k\\pi$", ["$x=\\pi/3+2k\\pi$", "$x=2\\pi/3+k\\pi$", "$x=\\pi/6+k\\pi$"]],
      ["Tìm nghiệm của $\\sin x=1/2$ thuộc $[0;2\\pi]$.", "$\\pi/6$ và $5\\pi/6$", ["$\\pi/6$ và $7\\pi/6$", "$5\\pi/6$ và $11\\pi/6$", "$\\pi/3$ và $2\\pi/3$"]],
      ["Tìm nghiệm của $\\cos x=-1/2$ thuộc $[0;2\\pi]$.", "$2\\pi/3$ và $4\\pi/3$", ["$\\pi/3$ và $5\\pi/3$", "Chỉ $2\\pi/3$", "$4\\pi/3$ và $5\\pi/3$"]],
    ],
  },
};

// The original five-lesson quiz predates the thirteen-topic catalog. Replace
// LG02–LG05 so that each assessment matches the theory the learner just read.
const alignedEarlyTrigSeeds: Record<string, LessonSeeds> = {
  "trig-lesson-2": {
    basic: [
      ["Trên đường tròn đơn vị, hoành độ của điểm biểu diễn $\\alpha$ là gì?", "$\\cos\\alpha$", ["$\\sin\\alpha$", "$\\tan\\alpha$", "$\\cot\\alpha$"]],
      ["Trên đường tròn đơn vị, tung độ của điểm biểu diễn $\\alpha$ là gì?", "$\\sin\\alpha$", ["$\\cos\\alpha$", "$\\tan\\alpha$", "$1$"]],
      ["Tại $\\alpha=0$, giá trị $\\cos\\alpha$ là gì?", "$1$", ["$0$", "$-1$", "Không xác định"]],
      ["Tại $\\alpha=\\pi/2$, giá trị $\\sin\\alpha$ là gì?", "$1$", ["$0$", "$-1$", "Không xác định"]],
      ["Điểm nằm trên trục tọa độ có thuộc góc phần tư nào không?", "Không thuộc góc phần tư nào", ["Góc phần tư I", "Góc phần tư II", "Cả bốn góc phần tư"]],
    ],
    intermediate: [
      ["Tại $\\alpha=\\pi/2$, $\\tan\\alpha$ bằng gì?", "Không xác định", ["$0$", "$1$", "$-1$"]],
      ["Tại $\\alpha=0$, $\\cot\\alpha$ bằng gì?", "Không xác định", ["$0$", "$1$", "$-1$"]],
      ["Ở góc phần tư II, dấu của sin và cos lần lượt là gì?", "Sin dương, cos âm", ["Cả hai dương", "Sin âm, cos dương", "Cả hai âm"]],
      ["Ở góc phần tư III, dấu của tan là gì?", "Dương", ["Âm", "Bằng $0$", "Không xác định với mọi góc"]],
      ["Nếu $M(-3/5;4/5)$ trên đường tròn đơn vị, $\\sin\\alpha$ bằng gì?", "$4/5$", ["$-3/5$", "$3/5$", "$-4/5$"]],
    ],
    advanced: [
      ["Nếu $\\cos\\alpha=3/5$ và $\\sin\\alpha=4/5$, $\\tan\\alpha$ bằng gì?", "$4/3$", ["$3/4$", "$7/5$", "$1$"]],
      ["Nếu $M(-5/13;-12/13)$, $\\cot\\alpha$ bằng gì?", "$5/12$", ["$12/5$", "$-5/12$", "$-12/5$"]],
      ["Điều kiện xác định của $\\tan\\alpha$ là gì?", "$\\cos\\alpha\\ne0$", ["$\\sin\\alpha\\ne0$", "$\\cos\\alpha=0$", "Mọi $\\alpha$ đều xác định"]],
      ["Điều kiện xác định của $\\cot\\alpha$ là gì?", "$\\sin\\alpha\\ne0$", ["$\\cos\\alpha\\ne0$", "$\\sin\\alpha=0$", "Mọi $\\alpha$ đều xác định"]],
      ["Nếu điểm biểu diễn là $(0;-1)$, $\\cot\\alpha$ bằng gì?", "$0$", ["$1$", "$-1$", "Không xác định"]],
    ],
  },
  "trig-lesson-3": {
    basic: [
      ["Giá trị $\\sin30^\\circ$ là gì?", "$1/2$", ["$\\sqrt3/2$", "$\\sqrt2/2$", "$1$"]],
      ["Giá trị $\\cos60^\\circ$ là gì?", "$1/2$", ["$\\sqrt3/2$", "$\\sqrt2/2$", "$0$"]],
      ["Giá trị $\\sin45^\\circ$ là gì?", "$\\sqrt2/2$", ["$1/2$", "$\\sqrt3/2$", "$1$"]],
      ["Giá trị $\\tan45^\\circ$ là gì?", "$1$", ["$0$", "$\\sqrt3$", "$1/\\sqrt3$"]],
      ["Tam giác vuông cân giúp suy ra các giá trị tại góc nào?", "$45^\\circ$", ["$30^\\circ$", "$60^\\circ$", "$90^\\circ$"]],
    ],
    intermediate: [
      ["Giá trị $\\cos30^\\circ$ là gì?", "$\\sqrt3/2$", ["$1/2$", "$\\sqrt2/2$", "$1$"]],
      ["Giá trị $\\sin60^\\circ$ là gì?", "$\\sqrt3/2$", ["$1/2$", "$\\sqrt2/2$", "$0$"]],
      ["Giá trị $\\tan30^\\circ$ là gì?", "$\\sqrt3/3$", ["$\\sqrt3$", "$1$", "$1/2$"]],
      ["Giá trị $\\tan60^\\circ$ là gì?", "$\\sqrt3$", ["$\\sqrt3/3$", "$1$", "$2$"]],
      ["Nửa tam giác đều giúp suy ra trực tiếp góc nào?", "$30^\\circ$ và $60^\\circ$", ["$45^\\circ$", "$0^\\circ$ và $90^\\circ$", "$15^\\circ$ và $75^\\circ$"]],
    ],
    advanced: [
      ["Tính $\\sin30^\\circ+\\cos60^\\circ$.", "$1$", ["$0$", "$\\sqrt3$", "$2$"]],
      ["Tính $\\sin45^\\circ\\cos45^\\circ$.", "$1/2$", ["$1$", "$\\sqrt2/2$", "$1/4$"]],
      ["Tính $\\tan60^\\circ\\tan30^\\circ$.", "$1$", ["$3$", "$\\sqrt3$", "$1/3$"]],
      ["Tính $\\sin^230^\\circ+\\cos^230^\\circ$.", "$1$", ["$1/2$", "$3/4$", "$2$"]],
      ["Tính $\\cos45^\\circ/\\sin45^\\circ$.", "$1$", ["$0$", "$\\sqrt2$", "$1/2$"]],
    ],
  },
  "trig-lesson-4": {
    basic: [
      ["$\\cos(-\\alpha)$ bằng gì?", "$\\cos\\alpha$", ["$-\\cos\\alpha$", "$\\sin\\alpha$", "$-\\sin\\alpha$"]],
      ["$\\sin(-\\alpha)$ bằng gì?", "$-\\sin\\alpha$", ["$\\sin\\alpha$", "$\\cos\\alpha$", "$-\\cos\\alpha$"]],
      ["$\\sin(\\pi-\\alpha)$ bằng gì?", "$\\sin\\alpha$", ["$-\\sin\\alpha$", "$\\cos\\alpha$", "$-\\cos\\alpha$"]],
      ["$\\cos(\\pi-\\alpha)$ bằng gì?", "$-\\cos\\alpha$", ["$\\cos\\alpha$", "$\\sin\\alpha$", "$-\\sin\\alpha$"]],
      ["$\\sin(\\pi+\\alpha)$ bằng gì?", "$-\\sin\\alpha$", ["$\\sin\\alpha$", "$\\cos\\alpha$", "$-\\cos\\alpha$"]],
    ],
    intermediate: [
      ["$\\cos(\\pi+\\alpha)$ bằng gì?", "$-\\cos\\alpha$", ["$\\cos\\alpha$", "$\\sin\\alpha$", "$-\\sin\\alpha$"]],
      ["$\\sin(\\pi/2-\\alpha)$ bằng gì?", "$\\cos\\alpha$", ["$-\\cos\\alpha$", "$\\sin\\alpha$", "$-\\sin\\alpha$"]],
      ["$\\cos(\\pi/2-\\alpha)$ bằng gì?", "$\\sin\\alpha$", ["$-\\sin\\alpha$", "$\\cos\\alpha$", "$-\\cos\\alpha$"]],
      ["$\\sin(\\pi/2+\\alpha)$ bằng gì?", "$\\cos\\alpha$", ["$-\\cos\\alpha$", "$\\sin\\alpha$", "$-\\sin\\alpha$"]],
      ["$\\cos(\\pi/2+\\alpha)$ bằng gì?", "$-\\sin\\alpha$", ["$\\sin\\alpha$", "$\\cos\\alpha$", "$-\\cos\\alpha$"]],
    ],
    advanced: [
      ["Tính $\\sin150^\\circ$ từ góc $30^\\circ$.", "$1/2$", ["$-1/2$", "$\\sqrt3/2$", "$-\\sqrt3/2$"]],
      ["Tính $\\cos150^\\circ$ từ góc $30^\\circ$.", "$-\\sqrt3/2$", ["$\\sqrt3/2$", "$-1/2$", "$1/2$"]],
      ["Tính $\\sin210^\\circ$ từ góc $30^\\circ$.", "$-1/2$", ["$1/2$", "$-\\sqrt3/2$", "$\\sqrt3/2$"]],
      ["Tính $\\cos330^\\circ$ từ góc $30^\\circ$.", "$\\sqrt3/2$", ["$-\\sqrt3/2$", "$1/2$", "$-1/2$"]],
      ["Tính $\\sin330^\\circ$ từ góc $30^\\circ$.", "$-1/2$", ["$1/2$", "$-\\sqrt3/2$", "$\\sqrt3/2$"]],
    ],
  },
  "trig-lesson-5": {
    basic: [
      ["$\\sin(a+b)$ bằng gì?", "$\\sin a\\cos b+\\cos a\\sin b$", ["$\\sin a+\\sin b$", "$\\sin a\\sin b+\\cos a\\cos b$", "$\\sin a\\cos b-\\cos a\\sin b$"]],
      ["$\\cos(a+b)$ bằng gì?", "$\\cos a\\cos b-\\sin a\\sin b$", ["$\\cos a+\\cos b$", "$\\cos a\\cos b+\\sin a\\sin b$", "$\\sin a\\cos b+\\cos a\\sin b$"]],
      ["$\\sin2a$ bằng gì?", "$2\\sin a\\cos a$", ["$2\\sin a$", "$\\sin^2a+\\cos^2a$", "$\\cos^2a-\\sin^2a$"]],
      ["$\\cos2a$ bằng gì?", "$\\cos^2a-\\sin^2a$", ["$2\\sin a\\cos a$", "$\\sin^2a+\\cos^2a$", "$2\\cos a$"]],
      ["$\\cos(a-b)$ bằng gì?", "$\\cos a\\cos b+\\sin a\\sin b$", ["$\\cos a\\cos b-\\sin a\\sin b$", "$\\cos a-\\cos b$", "$\\sin a\\cos b+\\cos a\\sin b$"]],
    ],
    intermediate: [
      ["Tính $\\sin75^\\circ$ bằng công thức cộng.", "$(\\sqrt6+\\sqrt2)/4$", ["$(\\sqrt6-\\sqrt2)/4$", "$1/2$", "$\\sqrt2/2$"]],
      ["Tính $\\cos75^\\circ$ bằng công thức cộng.", "$(\\sqrt6-\\sqrt2)/4$", ["$(\\sqrt6+\\sqrt2)/4$", "$1/2$", "$\\sqrt3/2$"]],
      ["Nếu $\\sin a=3/5$ và $\\cos a=4/5$, $\\sin2a$ bằng gì?", "$24/25$", ["$12/25$", "$7/25$", "$-24/25$"]],
      ["Nếu $\\sin a=3/5$ và $\\cos a=4/5$, $\\cos2a$ bằng gì?", "$7/25$", ["$24/25$", "$-7/25$", "$1$"]],
      ["$\\sin^2a$ viết theo $\\cos2a$ là gì?", "$(1-\\cos2a)/2$", ["$(1+\\cos2a)/2$", "$1-\\cos2a$", "$2(1-\\cos2a)$"]],
    ],
    advanced: [
      ["Tính $\\cos15^\\circ$ bằng $45^\\circ-30^\\circ$.", "$(\\sqrt6+\\sqrt2)/4$", ["$(\\sqrt6-\\sqrt2)/4$", "$1/2$", "$\\sqrt3/2$"]],
      ["Tính $\\sin15^\\circ$ bằng $45^\\circ-30^\\circ$.", "$(\\sqrt6-\\sqrt2)/4$", ["$(\\sqrt6+\\sqrt2)/4$", "$1/2$", "$\\sqrt2/2$"]],
      ["Nếu $\\sin a=3/5$ và $\\cos a=4/5$, $\\cos2a$ bằng gì?", "$7/25$", ["$24/25$", "$-7/25$", "$1$"]],
      ["$\\cos^2a$ viết theo $\\cos2a$ là gì?", "$(1+\\cos2a)/2$", ["$(1-\\cos2a)/2$", "$1+\\cos2a$", "$2(1+\\cos2a)$"]],
      ["$\\tan(a+b)$ theo $\\tan a,\\tan b$ là gì?", "$(\\tan a+\\tan b)/(1-\\tan a\\tan b)$", ["$(\\tan a+\\tan b)/(1+\\tan a\\tan b)$", "$\\tan a+\\tan b$", "$(\\tan a-\\tan b)/(1+\\tan a\\tan b)$"]],
    ],
  },
};
Object.assign(S, alignedEarlyTrigSeeds);

// LG06–LG13: five distinct, parameterized questions at each level.
function laterTrigSeed(lesson: number, level: Level, index: number): Seed {
  const a = 3 + 2 * index;
  const k = 2 + index;
  const halfPlus = (a + 1) / 2;
  const halfMinus = (a - 1) / 2;
  if (lesson === 6) {
    if (level === "basic") return [`Biến đổi $\\cos ${a}x\\cos x$ thành tổng.`, `$\\frac{\\cos ${a + 1}x+\\cos ${a - 1}x}{2}$`, [`$\\cos ${a + 1}x+\\cos ${a - 1}x$`, `$\\frac{\\cos ${a + 1}x-\\cos ${a - 1}x}{2}$`, `$2\\cos ${a + 1}x\\cos ${a - 1}x$`]];
    if (level === "intermediate") return [`Biến đổi $\\sin ${a}x\\sin x$ thành tổng.`, `$\\frac{\\cos ${a - 1}x-\\cos ${a + 1}x}{2}$`, [`$\\frac{\\cos ${a + 1}x+\\cos ${a - 1}x}{2}$`, `$\\cos ${a - 1}x-\\cos ${a + 1}x$`, `$\\frac{\\sin ${a + 1}x+\\sin ${a - 1}x}{2}$`]];
    return [`Biến đổi $\\sin ${a}x\\cos x$ thành tổng.`, `$\\frac{\\sin ${a + 1}x+\\sin ${a - 1}x}{2}$`, [`$\\frac{\\sin ${a + 1}x-\\sin ${a - 1}x}{2}$`, `$\\sin ${a + 1}x+\\sin ${a - 1}x$`, `$\\frac{\\cos ${a + 1}x+\\cos ${a - 1}x}{2}$`]];
  }
  if (lesson === 7) {
    if (level === "basic") return [`Biến đổi $\\cos ${a}x+\\cos x$ thành tích.`, `$2\\cos ${halfPlus}x\\cos ${halfMinus}x$`, [`$2\\sin ${halfPlus}x\\sin ${halfMinus}x$`, `$\\cos ${halfPlus}x\\cos ${halfMinus}x$`, `$-2\\sin ${halfPlus}x\\sin ${halfMinus}x$`]];
    if (level === "intermediate") return [`Biến đổi $\\sin ${a}x+\\sin x$ thành tích.`, `$2\\sin ${halfPlus}x\\cos ${halfMinus}x$`, [`$2\\cos ${halfPlus}x\\sin ${halfMinus}x$`, `$\\sin ${halfPlus}x\\cos ${halfMinus}x$`, `$-2\\sin ${halfPlus}x\\sin ${halfMinus}x$`]];
    return [`Biến đổi $\\cos ${a}x-\\cos x$ thành tích.`, `$-2\\sin ${halfPlus}x\\sin ${halfMinus}x$`, [`$2\\sin ${halfPlus}x\\sin ${halfMinus}x$`, `$2\\cos ${halfPlus}x\\cos ${halfMinus}x$`, `$-2\\cos ${halfPlus}x\\cos ${halfMinus}x$`]];
  }
  if (lesson === 8) {
    const fn = level === "intermediate" ? "cos" : "sin";
    const phase = level === "advanced" ? "+\\frac\\pi4" : "";
    return [`Chu kỳ cơ bản của $y=\\${fn}(${k}x${phase})$ là bao nhiêu?`, `$\\frac{2\\pi}{${k}}$`, [`$\\frac{\\pi}{${k}}$`, `$2${k}\\pi$`, `$${k}\\pi$`]];
  }
  if (lesson === 9) {
    if (level === "advanced") return [`Tập giá trị của $y=-${k}\\sin x+1$ là gì?`, `$[${1 - k};${1 + k}]$`, [`$[-${k};${k}]$`, `$[1;${k + 1}]$`, `$[-${k + 1};${k - 1}]$`]];
    const fn = level === "basic" ? "tan" : "cot";
    return [`Chu kỳ cơ bản của $y=\\${fn}(${k}x)$ là bao nhiêu?`, `$\\frac{\\pi}{${k}}$`, [`$\\frac{2\\pi}{${k}}$`, `$${k}\\pi$`, `$2${k}\\pi$`]];
  }
  if (lesson === 10) {
    if (level === "basic") return [`Hàm số $y=\\tan(${k}x)$ biến thiên thế nào trên mỗi khoảng xác định?`, "Đồng biến", ["Nghịch biến", "Không đơn điệu trên từng nhánh", "Không xác định ở mọi điểm"]];
    if (level === "intermediate") return [`Tiệm cận đứng của $y=\\cot(${k}x)$ là họ đường nào?`, `$x=\\frac{m\\pi}{${k}},\\ m\\in\\mathbb Z$`, [`$x=\\frac{\\pi}{2${k}}+m\\pi$`, `$x=\\frac{2m\\pi}{${k}}$`, "$x=m\\pi+\\frac\\pi2$"]];
    return [`Tiệm cận đứng của $y=\\tan(${k}x)$ là họ đường nào?`, `$x=\\frac{\\pi}{2${k}}+\\frac{m\\pi}{${k}},\\ m\\in\\mathbb Z$`, [`$x=\\frac{m\\pi}{${k}}$`, "$x=m\\pi$", `$x=\\frac{2m\\pi}{${k}}$`]];
  }
  if (lesson === 11) {
    const angle = `\\frac{\\pi}{${k + 2}}`;
    if (level === "basic") return [`Phương trình $\\sin x=\\sin(${angle})$ có nghiệm tổng quát nào?`, `$x=${angle}+2m\\pi$ hoặc $x=\\pi-${angle}+2m\\pi$`, [`$x=${angle}+m\\pi$`, `$x=\\pm${angle}+2m\\pi$`, `$x=\\pi+${angle}+2m\\pi$`]];
    if (level === "intermediate") return [`Phương trình $\\cos x=\\cos(${angle})$ có nghiệm tổng quát nào?`, `$x=\\pm${angle}+2m\\pi$`, [`$x=${angle}+m\\pi$`, `$x=\\pi-${angle}+2m\\pi$`, "$x=m\\pi$"]];
    return [`Trên $[0;2\\pi)$, phương trình $\\sin x=\\sin(${angle})$ có mấy nghiệm?`, "2 nghiệm", ["0 nghiệm", "1 nghiệm", "Vô số nghiệm"]];
  }
  if (lesson === 12) {
    const angle = `\\frac{\\pi}{${k + 2}}`;
    if (level === "basic") return [`Giải $\\tan x=\\tan(${angle})$.`, `$x=${angle}+m\\pi,\\ m\\in\\mathbb Z$`, [`$x=${angle}+2m\\pi$`, `$x=\\pm${angle}+m\\pi$`, `$x=\\pi-${angle}+m\\pi$`]];
    if (level === "intermediate") return [`Giải $\\cot x=\\cot(${angle})$.`, `$x=${angle}+m\\pi,\\ m\\in\\mathbb Z$`, [`$x=${angle}+2m\\pi$`, `$x=-${angle}+m\\pi$`, `$x=\\pi/2+${angle}+m\\pi$`]];
    return [`Giải $\\tan(${k}x)=0$.`, `$x=\\frac{m\\pi}{${k}},\\ m\\in\\mathbb Z$`, [`$x=\\frac{2m\\pi}{${k}}$`, `$x=\\frac{\\pi}{2${k}}+m\\pi$`, "$x=m\\pi+\\frac\\pi2$"]];
  }
  const radius = 5 + index;
  const center = radius + 3 + index;
  const period = 12 + 2 * index;
  if (level === "basic") return [`Đu quay bán kính ${radius} m, tâm cao ${center} m. Khách ở đáy ban đầu cao bao nhiêu?`, `${center - radius} m`, [`${center} m`, `${center + radius} m`, `${radius} m`]];
  if (level === "intermediate") return [`Đu quay bán kính ${radius} m, tâm cao ${center} m. Đỉnh cao nhất cách đất bao nhiêu?`, `${center + radius} m`, [`${center - radius} m`, `${center} m`, `${2 * radius} m`]];
  return [`Khách bắt đầu ở đáy đu quay, chu kỳ ${period} phút. Sau bao lâu khách tới đỉnh lần đầu?`, `${period / 2} phút`, [`${period} phút`, `${period / 4} phút`, `${2 * period} phút`]];
}

for (let lesson = 6; lesson <= 13; lesson++) {
  S[`trig-lesson-${lesson}`] = Object.fromEntries(
    (["basic", "intermediate", "advanced"] as const).map(level => [level, Array.from({ length: 5 }, (_, index) => laterTrigSeed(lesson, level, index))])
  ) as LessonSeeds;
}

function buildItems(lessonId: string, level: Level, seeds: Seed[], startIndex = 0): ReviewQuizItem[] {
  const levelReason: Record<Level, string> = {
    basic: "Dùng định nghĩa và kiến thức nền của bài để nhận ra đáp án.",
    intermediate: "Thay dữ kiện vào công thức hoặc định lý, rồi kiểm tra điều kiện trước khi kết luận.",
    advanced: "Kết hợp các bước suy luận và kiểm tra đầy đủ điều kiện của bài toán.",
  };
  return seeds.map(([question, answer, distractors], offset) => {
    const index = startIndex + offset;
    const correctPosition = (index * 3 + 1) % 4;
    const choices = [...distractors];
    choices.splice(correctPosition, 0, answer);
    return {
      id: `${lessonId}-${level}-${index + 1}`,
      level,
      question,
      options: choices.map((text, optionIndex) => ({ id: String.fromCharCode(65 + optionIndex), text, isCorrect: optionIndex === correctPosition })),
      explanationCorrect: `Chính xác. ${levelReason[level]} Kết quả đúng là ${answer}.`,
      explanationIncorrect: `Em hãy xem lại định nghĩa, phép tính và điều kiện áp dụng. ${levelReason[level]}`,
    };
  });
}

const EXTRA_COUNTS: Record<Level, number> = { basic: 8, intermediate: 9, advanced: 8 };

function variantSeed(lessonId: string, level: Level, index: number): Seed {
  const n = index + 1;
  const levelBoost = level === "basic" ? 0 : level === "intermediate" ? 1 : 2;
  const a = 2 + ((n + levelBoost) % 5);
  const b = 1 + ((n * 2 + levelBoost) % 4);
  const x = 1 + ((n * 3 + levelBoost) % 5);
  const y = 1 + ((n + 2 * levelBoost) % 4);
  const positive = (lessonId.startsWith("lp-"));
  const spatial = lessonId.startsWith("sg-");

  if (positive) {
    const lesson = Number(lessonId[lessonId.length - 1]);
    if (lesson === 1) {
      const value = a * x - b * y;
      const limit = value + (n % 2 ? 1 : -1);
      return [`Kiểm tra điểm $P(${x};${y})$ với bất phương trình $${a}x-${b}y\\le ${limit}$.`, value <= limit ? `Có, vì $${value}\\le${limit}$.` : `Không, vì $${value}>${limit}$.`, [`Có, vì $${value}=${limit}$.`, `Không, vì phải thay $x=y$.`, `Chỉ cần kiểm tra đường biên.`]];
    }
    if (lesson === 2) {
      const c = 4 + n;
      return [`Đường thẳng biên $${a}x+${b}y=${c}$ cắt trục $Ox$ tại điểm nào?`, `$(\\frac{${c}}{${a}};0)$`, [`$(0;\\frac{${c}}{${b}})$`, `$(${c};0)$`, `$(0;${c})$`]];
    }
    if (lesson === 3) {
      const total = x + y;
      return [`Điểm $M(${x};${y})$ có thuộc miền nghiệm của hệ $x\\ge0, y\\ge0, x+y\\le ${total + (n % 2)}$ không?`, `Có; tọa độ không âm và $${total}\\le${total + (n % 2)}$.`, [`Không; vì $x+y=${total}$.`, `Không; vì một tọa độ phải bằng $0$.`, `Chưa đủ dữ kiện để thay vào hệ.`]];
    }
    if (lesson === 4) {
      const c = a * x + b * y;
      return [`Với hàm mục tiêu $F=${a}x+${b}y$, tính $F$ tại $A(${x};${y})$.`, `$${c}$`, [`$${c + 1}$`, `$${c - 1}$`, `$${c + a + b}$`]];
    }
    return [`Giải bất phương trình $-${a}x+${a * x}\\ge0$.`, `$x\\le ${x}$`, [`$x>${x}$`, `$x<${x}$`, `$x\\le ${x - 1}$`]];
  }

  if (spatial) {
    const lesson = Number(lessonId[lessonId.length - 1]);
    if (lesson === 1) {
      return [`Hình bình hành $ABCD$ có $A(0;0), B(${a};0), C(${a + b};${y})$. Tọa độ $D$ là gì?`, `(${b};${y})`, [`(${a + b};${y})`, `(${b};-${y})`, `(${a};${y})`]];
    }
    if (lesson === 2) {
      return [`Hai mặt phẳng phân biệt $(P)$ và $(Q)$ có điểm chung $A$. Điều gì chắc chắn đúng?`, `Chúng cắt nhau theo một đường thẳng đi qua $A$.`, [`Chúng song song vì cùng chứa $A$.`, `Chúng chỉ có đúng điểm $A$ chung.`, `Chúng trùng nhau trong mọi trường hợp.`]];
    }
    if (lesson === 3) {
      return [`Đường thẳng $d$ song song với mặt phẳng $(P)$. Nếu $M\\in d$ thì kết luận nào đúng?`, `$M\\notin(P)$`, [`$M\\in(P)$`, `$d\\subset(P)$`, `$d\\perp(P)$`]];
    }
    if (lesson === 4) {
      return [`Trong tam giác $SAB$, $M\\in SA$, $N\\in SB$ và $\\frac{SM}{SA}=\\frac{${n}}{${n + 2}}$. Chọn $N$ để $MN\\parallel AB$.`, `$\\frac{SN}{SB}=\\frac{${n}}{${n + 2}}$`, [`$SN=SB-SM$`, `$\\frac{SN}{SB}=\\frac{${n + 1}}{${n + 2}}$`, `$SN=SM$`]];
    }
    return [`Trong hình chóp $S.ABCD$, mặt phẳng qua trung điểm của $SA$ và song song đáy cắt $SC$ tại $P$. Tỉ số $SP/SC$ bằng bao nhiêu?`, `$\\frac12$`, [`$\\frac13$`, `$\\frac23$`, `$1$`]];
  }

  const lesson = Number(lessonId[lessonId.length - 1]);
  if (lesson === 1) {
    const deg = 30 * (1 + (n % 10));
    return [`Đổi góc $${deg}^\\circ$ sang radian.`, `$\\frac{${deg / 30}\\pi}{6}$`, [`$${deg}\\pi$`, `$\\frac{${deg / 30}\\pi}{180}$`, `$\\frac{${deg}\\pi}{360}$`]];
  }
  if (lesson === 2) {
    const deg = [30, 45, 60][n % 3];
    return [`Giá trị của $\\sin(${deg}^\\circ)$ là bao nhiêu?`, deg === 30 ? `$\\frac12$` : deg === 45 ? `$\\frac{\\sqrt2}{2}$` : `$\\frac{\\sqrt3}{2}$`, [`$0$`, `$1$`, deg === 30 ? `$\\frac{\\sqrt3}{2}$` : `$\\frac12$`]];
  }
  if (lesson === 3) {
    return [`Rút gọn $\\sin(\\pi+\\alpha)$.`, `$-\\sin\\alpha$`, [`$\\sin\\alpha$`, `$-\\cos\\alpha$`, `$\\cos\\alpha$`]];
  }
  if (lesson === 4) {
    return [`Chu kỳ của hàm số $y=\\sin(${a}x)$ là bao nhiêu?`, `$\\frac{2\\pi}{${a}}$`, [`$2${a}\\pi$`, `$\\frac{\\pi}{${a}}$`, `$2\\pi${a}$`]];
  }
  return [`Nghiệm tổng quát của $\\cos x=0$ là gì?`, `$x=\\frac{\\pi}{2}+k\\pi,\ k\\in\\mathbb Z$`, [`$x=k\\pi,\ k\\in\\mathbb Z$`, `$x=\\frac{\\pi}{2}+2k\\pi,\ k\\in\\mathbb Z$`, `$x=2k\\pi,\ k\\in\\mathbb Z$`]];
}

const lessonQuestionBank: Record<string, ReviewQuizItem[]> = Object.fromEntries(
  Object.entries(S).map(([lessonId, levels]) => [
    lessonId,
    (["basic", "intermediate", "advanced"] as const).flatMap((level) => {
      const seeds = levels[level];
      const isAlignedTrigLesson = lessonId.startsWith("trig-lesson-") && Number(lessonId.split("-").at(-1)) >= 2;
      const extras = isAlignedTrigLesson ? [] : Array.from({ length: EXTRA_COUNTS[level] }, (_, index) => variantSeed(lessonId, level, index));
      return [...buildItems(lessonId, level, seeds), ...buildItems(lessonId, level, extras, seeds.length)];
    }),
  ])
);

/** Counts reflect the questions actually available for each module. */
export const QUESTION_BANK_COUNTS = {
  linear_programming: Object.entries(lessonQuestionBank).filter(([id]) => id.startsWith("lp-")).reduce((sum, [, items]) => sum + items.length, 0),
  spatial_geometry: Object.entries(lessonQuestionBank).filter(([id]) => id.startsWith("sg-")).reduce((sum, [, items]) => sum + items.length, 0),
  trigonometry: Object.entries(lessonQuestionBank).filter(([id]) => id.startsWith("trig-")).reduce((sum, [, items]) => sum + items.length, 0),
};

export const DIFFICULTY_QUIZ_BANK: Record<string, ReviewQuizItem[]> = lessonQuestionBank;

/** Backwards-compatible name for the complete lesson bank. */
export const DIFFICULTY_QUIZ_DATA = DIFFICULTY_QUIZ_BANK;

export function sampleLessonQuiz(lessonId: string, random: () => number = Math.random): ReviewQuizItem[] {
  const pool = DIFFICULTY_QUIZ_BANK[lessonId] ?? [];
  const levels: Level[] = ["basic", "intermediate", "advanced"];
  return levels.flatMap((level) => {
    const tier = pool.filter((item) => item.level === level);
    const shuffled = [...tier];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 5);
  });
}

export function sampleLessonQuizLevel(lessonId: string, level: Level, random: () => number = Math.random): ReviewQuizItem[] {
  const tier = (DIFFICULTY_QUIZ_BANK[lessonId] ?? []).filter((item) => item.level === level);
  const shuffled = [...tier];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 5);
}

