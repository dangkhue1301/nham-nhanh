# Báo Cáo Độ Phủ & Kiểm Toán Kỹ Thuật (Coverage Report)

Báo cáo kiểm toán kỹ thuật cho website **Nhẩm Nhanh**, đối chiếu toàn diện với các yêu cầu và tiêu chí nghiệm thu tại Mục 12 của tài liệu `PLAN-website-luyen-tinh-nham.md`.

---

## 1. Danh mục 66 họ câu hỏi đã triển khai

| ID | Chủ đề | Tên họ câu hỏi | Level hỗ trợ | Miền tham số / Đặc trưng toán học |
|---|---|---|---|---|
| **A01** | Cộng | Cộng dưới 10 | L1 | $a, b \ge 0; a + b \le 9$. Tuyệt đối từ chối $6+4$ và $7+5$. |
| **A02** | Cộng | Tìm số hạng còn thiếu | L1, L2, L3 | $a + \square = t$. L1: $t \le 9$; L2: $t \in [10, 20]$; L3: $t = 100$. |
| **A03** | Cộng | Cộng qua 10 phạm vi 20 | L2 | $a, b \in [2, 9]; a + b \in [10, 18]$. Áp dụng mẹo ghép đủ 10. |
| **A04** | Cộng | Cộng trong phạm vi 100 không nhớ | L3 | Hai chữ số; tổng hàng chục $\le 9$, tổng hàng đơn vị $\le 9$. |
| **A05** | Cộng | Cộng trong phạm vi 100 có nhớ | L3 | Hai chữ số; tổng hàng đơn vị $\ge 10$, tổng $< 100$. |
| **A06** | Cộng | Cộng trong phạm vi 1.000 | L4 | Tròn chục/trăm hoặc tách phần trăm-chục-đơn vị. |
| **A07** | Cộng | Cộng số nhỏ vào số lớn | L5 | $a \in [1000, 9999]$, $b \in [1, 99]$ $\rightarrow$ **891.000 cặp số khác nhau**. |
| **A08** | Cộng | Cộng ghép 3 số tròn | L5 | $p_1 + p_2 = 100 / 1000 / 10000$; tổng $\le 1.000.000$. |
| **S01** | Trừ | Trừ dưới 10 | L1 | $0 \le b \le a \le 9$. Tuyệt đối từ chối $3-8$ hoặc $10-1$. |
| **S02** | Trừ | Tìm số trừ còn thiếu | L1, L2, L3 | $a - \square = c$ trong phạm vi level tương ứng. |
| **S03** | Trừ | Trừ qua 10 phạm vi 20 | L2 | $10 \le a \le 18$; $a - b \in [1, 9]$. |
| **S04** | Trừ | Trừ phạm vi 100 không mượn | L3 | Hàng chục và hàng đơn vị của số bị trừ đều lớn hơn số trừ. |
| **S05** | Trừ | Trừ phạm vi 100 có mượn | L3 | Đơn vị số bị trừ bé hơn số trừ, mượn 1 chục. |
| **S06** | Trừ | Trừ qua hàng chục bằng 0 | L4 | Dạng $a0b - cde$ (ví dụ: $402 - 178 = 224$). |
| **S07** | Trừ | Trừ từ mốc tròn | L5 | $100, 1.000, 10.000, 100.000 - b$. |
| **S08** | Trừ | Đếm thêm / Bù số tìm hiệu | L5 | Hai số gần nhau hoặc số trừ gần mốc tròn (kết quả luôn $\ge 0$). |
| **M01** | Nhân | Bảng cửu chương 2–9 | L1 | $a \in [2, 9], b \in [1, 10]$. Không có $12 \times 12$. Hỗ trợ chọn từng bảng. |
| **M02** | Nhân | Nhân với 0, 1, 10 | L1 | Phép tính củng cố, chiếm tối đa 20% trong block basic. |
| **M03** | Nhân | Tìm thừa số còn thiếu | L1, L2 | $a \times \square = p$ ($a > 0$). |
| **M04** | Nhân | Nhân số tròn | L2 | Nhân với 10, 100, 20, 30... |
| **M05** | Nhân | Nhân 2 và nhân 5 | L2 | Số 2 chữ số $\times 2$ (gấp đôi) hoặc $\times 5$. |
| **M06** | Nhân | 2 chữ số × 1 chữ số | L3 | Tách chục và đơn vị: $(20 \times 4) + (3 \times 4)$. |
| **M07** | Nhân | Nhân với 11, 12, 15, 20 | L4 | Thừa số đặc biệt có mẹo nhẩm phân phối. |
| **M08** | Nhân | Nhân với 25 và 50 | L4 | Thừa số chia hết cho 4 (với 25) hoặc cho 2 (với 50) $\rightarrow$ số nguyên! |
| **M09** | Nhân | Nhân gần mốc tròn (×9, ×99) | L5 | $a \times 10 - a$ hoặc $a \times 100 - a$. |
| **M10** | Nhân | Ghép thừa số (125 × 24) | L5 | $125 \times 8 \times 3 = 1.000 \times 3 = 3.000$. |
| **D01** | Chia | Bảng chia đảo cửu chương | L1 | $n = d \times q$ ($d \in [2, 9], q \in [1, 10]$). Luôn chia hết! |
| **D02** | Chia | Chia số tròn chục / trăm | L2 | Chia cho 2, 5, 10, 100. |
| **D03** | Chia | Chia 2 chữ số cho 1 chữ số | L3 | Tách số thành các phần chia hết: $96 \div 6 = (60 \div 6) + (36 \div 6)$. |
| **D04** | Chia | Chia 3 chữ số cho 1 chữ số | L3 | Chia hết cho 1 chữ số, thương 2 chữ số. |
| **D05** | Chia | Chia cho số 2 chữ số | L4 | Số chia $11 \dots 25$, sinh ngược từ tích. |
| **D06** | Chia | Chia cho 25, 50, 125 | L5 | Nhân hệ số bù: $\times 4 \div 100$ hoặc $\times 8 \div 1000$. |
| **D07** | Chia | Tìm số bị chia còn thiếu | L2 | $\square \div d = q \rightarrow \square = d \times q$. |
| **D08** | Chia | Chia rút gọn cùng số 0 | L5 | Ví dụ: $4.800 \div 60 = 480 \div 6 = 80$. |
| **X01** | Biểu thức | Cộng trừ 2 bước | L2 | $a + b - c$, các bước không âm. |
| **X02** | Biểu thức | Nhân và cộng/trừ | L3 | $a \times b \pm c$, nhân trước cộng trừ sau. |
| **X03** | Biểu thức | Chia và cộng/trừ | L3 | $a \div b \pm c$, phép chia luôn chia hết. |
| **X04** | Biểu thức | Có dấu ngoặc | L4 | $(a + b) \times c$ hoặc $(a + b) \div c$. |
| **X05** | Biểu thức | Cộng 4 số ghép tròn chục | L4 | $a + b + c + d$ ghép 2 cặp tròn chục. |
| **X06** | Biểu thức | Ba bước tính | L5 | Tối đa 3 bước tính, không âm trung gian. |
| **P01** | Tiền | Tổng tiền hai món | L1 | Giá tròn nghìn VND. |
| **P02** | Tiền | Tính tiền thừa | L1 | Tiền đưa $\ge$ hóa đơn. |
| **P03** | Tiền | Mua nhiều món cùng giá | L2 | $q \times p$. |
| **P04** | Tiền | Giỏ hàng 2 loại | L3 | $q_1 \times p_1 + q_2 \times p_2$. |
| **P05** | Tiền | Chia tiền đều | L3 | Tổng chia hết cho số người, kết quả nguyên đồng. |
| **P06** | Tiền | Mua tối đa bao nhiêu món | L4 | $\lfloor B / p \rfloor$. |
| **P07** | Tiền | Tiền còn lại sau khi mua | L4 | $B \bmod p$. |
| **P08** | Tiền | Tiết kiệm tiền theo ngày | L4 | $S_0 + n \times p$. |
| **P09** | Tiền | Giảm giá số tiền cố định | L5 | Giá gốc trừ tiền giảm. |
| **P10** | Tiền | Giảm giá theo % | L5 | Giảm 10%, 20%, 25%, 50% trên số tiền gốc tròn trăm nghìn $\rightarrow$ nguyên đồng! |
| **T01** | Thời gian | Giờ nguyên ↔ phút | L1 | Phút $\rightarrow$ giờ luôn chia hết. |
| **T02** | Thời gian | Phút nguyên ↔ giây | L2 | Giây $\rightarrow$ phút luôn chia hết. |
| **T03** | Thời gian | Khoảng phút cùng giờ | L1 | Hiệu phút trong cùng 1 giờ. |
| **T04** | Thời gian | Khoảng phút qua giờ | L2 | Ví dụ: 9:45 đến 10:20 cùng ngày = 35 phút. |
| **T05** | Thời gian | Cộng/trừ phút tìm giờ | L3 | Đồng hồ 24h, định dạng HH:mm. |
| **T06** | Thời gian | Thời gian qua nửa đêm | L4 | Bắt đầu đêm hôm trước, kết thúc sáng hôm sau. |
| **T07** | Thời gian | Nhiều lượt có khoảng nghỉ | L4 | Ghi rõ số hiệp và số lần giải lao. |
| **T08** | Thời gian | Tính ngược giờ khởi hành | L5 | Giờ hẹn trừ thời gian đi và trừ hao đến sớm. |
| **C01** | Ngày tháng | Thứ trước/sau vài ngày | L1 | Lùi/tiến 1–6 ngày. |
| **C02** | Ngày tháng | Thứ theo chu kỳ tuần | L2 | Lùi/tiến 7–60 ngày (chu kỳ mod 7). |
| **C03** | Ngày tháng | Cộng/trừ ngày trong tháng | L1 | Giữ nguyên tháng. |
| **C04** | Ngày tháng | Khoảng ngày trong tháng | L2 | Không tính ngày bắt đầu. |
| **C05** | Ngày tháng | Qua ranh giới tháng | L3 | Ngày kết quả DD/MM/YYYY. |
| **C06** | Ngày tháng | Qua năm mới | L4 | Qua ngày 31/12 sang 01/01 năm sau. |
| **C07** | Ngày tháng | Tháng 2 năm thường / nhuận | L4 | Năm 2024 có 29/02; năm 2025 chỉ có 28/02. |
| **C08** | Ngày tháng | Đếm ngày tính cả hai đầu | L5 | Kết quả = hiệu ngày + 1. |

---

## 2. Kiểm chứng quy mô ngân hàng câu hỏi

### Chứng minh toán học họ A07
- Họ A07 ($a \in [1000, 9999]$ cộng $b \in [1, 99]$):
  - Số lượng giá trị của $a$: $9999 - 1000 + 1 = 9000$.
  - Số lượng giá trị của $b$: $99 - 1 + 1 = 99$.
  - Do hai miền số không giao nhau ($a \ge 1000 > b$), mỗi cặp $(a, b)$ là một cấu hình toán học duy nhất.
  - Tổng số cặp cấu hình độc lập:
    $$9.000 \times 99 = 891.000\text{ cấu hình}$$
  - Riêng họ A07 đã gấp gần 9 lần tiêu chuẩn 100.000 cấu hình tối thiểu của toàn hệ thống.

### Kết quả kiểm toán thực nghiệm (`tests/auditLargePool.test.ts`)
- Bộ test tự động sinh câu hỏi thực tế qua PRNG có seed và ghi nhận các `semanticKey` độc lập:
  - **Số câu đã sinh thử nghiệm:** 294.219 câu.
  - **Số cấu hình toán học duy nhất đạt được:** **100.000** cấu hình.
  - **Thời gian thực thi:** 1.885 ms (~ 1,88 giây).
  - **Tốc độ sinh trung bình:** **0,01 ms / câu** (vượt xa chỉ tiêu < 50 ms/câu của PLAN).

---

## 3. Kết quả kiểm thử các trường hợp bắt buộc (Bảng 12.2)

Tất cả các ca kiểm thử quy định trong Bảng 12.2 đã được kiểm chứng tự động tại `tests/mandatoryCases.test.ts`:

| Tình huống kiểm thử | Kết quả mong đợi | Kết quả kiểm thử tự động | Trạng thái |
|---|---|---|---|
| Cộng L1: 4 + 5 | 9, hợp lệ | 9, hợp lệ | **ĐẠT** |
| Cộng L1: 6 + 4 | Bị từ chối vì tổng = 10 | Bị từ chối | **ĐẠT** |
| Cộng L1: 8 + 7 | Bị từ chối ở L1, hợp lệ ở L2 | L1 từ chối, L2 chấp nhận | **ĐẠT** |
| Trừ L1: 8 − 3 | 5 | 5 | **ĐẠT** |
| Trừ L1: 3 − 8 | Bị từ chối | Bị từ chối | **ĐẠT** |
| Trừ L1: 10 − 1 | Bị từ chối dù kết quả bằng 9 | Bị từ chối | **ĐẠT** |
| 0 + 0; 5 − 5 | 0 là đáp án hợp lệ | 0 hợp lệ | **ĐẠT** |
| Nhân L1: 7 × 8 | 56 | 56 | **ĐẠT** |
| Nhân L1: 12 × 12 | Bị từ chối ở L1 | Bị từ chối | **ĐẠT** |
| Chia basic: 56 ÷ 7 | 8 | 8 | **ĐẠT** |
| 7 ÷ 2 trong chia thuần túy | Không bao giờ được sinh | Không sinh | **ĐẠT** |
| 0 ÷ 5; 5 ÷ 0 | 0 và bị từ chối | 0 và từ chối | **ĐẠT** |
| 18 + 6 × 4 | 42 | 42 | **ĐẠT** |
| (18 + 6) × 4 | 96 | 96 | **ĐẠT** |
| 402 − 178 | 224 | 224 | **ĐẠT** |
| 24 × 25 | 600, giải không có số thập phân | 600, giải số nguyên | **ĐẠT** |
| 50.000đ, 8.000đ/món, mua tối đa | 6 món | 6 món | **ĐẠT** |
| Tiền còn lại sau khi mua | 2.000 đồng | 2.000 đồng | **ĐẠT** |
| 200.000đ giảm 25% | 150.000 đồng | 150.000 đồng | **ĐẠT** |
| 9:45 → 10:20 cùng ngày | 35 phút | 35 phút | **ĐẠT** |
| 23:50 → 00:15 hôm sau | 25 phút | 25 phút | **ĐẠT** |
| 23:45 cộng 35 phút | 00:20 (ngày hôm sau) | 00:20 | **ĐẠT** |
| 8:00 trừ 35 phút | 07:25 | 07:25 | **ĐẠT** |
| 180 phút đổi sang giờ | 3 giờ | 3 giờ | **ĐẠT** |
| 28/02/2024 + 2 ngày | 01/03/2024 | 01/03/2024 | **ĐẠT** |
| 28/02/2025 + 2 ngày | 02/03/2025 | 02/03/2025 | **ĐẠT** |
| 31/12/2026 + 1 ngày | 01/01/2027 | 01/01/2027 | **ĐẠT** |
| 01/03/2024 − 1 ngày | 29/02/2024 | 29/02/2024 | **ĐẠT** |
| Năm 1900, 2000, 2100 | Không nhuận, nhuận, không nhuận | Khớp 100% | **ĐẠT** |
| 31/04/2026; 29/02/2025 | Không hợp lệ | Bị từ chối | **ĐẠT** |
| 01/05 → 10/05 (không tính đầu) | 9 ngày | 9 ngày | **ĐẠT** |
| 01/05 → 10/05 (tính cả 2 đầu) | 10 ngày | 10 ngày | **ĐẠT** |
| Thứ Ba sau 10 ngày | Thứ Sáu | Thứ Sáu | **ĐẠT** |
| Nhập 25000, 25.000, 25 000 | Chuẩn hóa về 25000 | Chuẩn hóa đúng | **ĐẠT** |
| Nhập 12,5; 12.50; 2e3 | Báo lỗi định dạng | Báo lỗi đúng | **ĐẠT** |
| Đáp án rỗng khi kết quả là 0 | Báo chưa nhập | Báo chưa nhập | **ĐẠT** |
| Lịch ôn tập 10 lần trong ngày | Không tăng 10 bậc | Chỉ tăng tối đa 1 bậc | **ĐẠT** |
| JSON lưu trữ hỏng | Phục hồi an toàn | Không crash | **ĐẠT** |

---

## 4. Tổng kết tình trạng nghiệm thu

- **Số test suites:** 6 suites
- **Tổng số unit/integration tests:** 109 tests
- **Tỷ lệ vượt qua:** 100% (109/109 tests PASS)
- **Kích thước gói build production:** 71,4 kB gzipped (gồm toàn bộ 66 họ, React app, styles và thuật toán).
