# Nhẩm Nhanh — Website Luyện Tính Nhẩm

- **Website trực tuyến (GitHub Pages):** [https://dangkhue1301.github.io/nham-nhanh/](https://dangkhue1301.github.io/nham-nhanh/)
- **Mã nguồn GitHub:** [https://github.com/dangkhue1301/nham-nhanh](https://github.com/dangkhue1301/nham-nhanh)

Website luyện tính nhẩm tốc độ cao, tinh gọn, mở lên là luyện được ngay, xây dựng bám sát 100% tài liệu `PLAN-website-luyen-tinh-nham.md`.

## 1. Tính năng nổi bật

- **Đầy đủ 4 phép tính cơ bản & 3 chủ đề đời sống:**
  - Cộng, Trừ, Nhân, Chia (mỗi phép 5 level chuẩn từ dễ đến khó).
  - Trộn bốn phép tính (biểu thức 1–3 bước có ngoặc, nhân chia trước cộng trừ sau).
  - Tiền & mua sắm Việt Nam (VND, chia tiền đều, mua tối đa, % nguyên đồng).
  - Thời gian (đồng hồ 24h, đổi đơn vị, qua giờ, qua nửa đêm, tính ngược giờ xuất phát).
  - Ngày tháng (chu kỳ tuần mod 7, qua ranh giới tháng, qua năm mới, năm nhuận 29/02, tính cả hai đầu).
- **Bộ 66 họ câu hỏi sinh tham số (PRNG Seeded):**
  - Không dùng danh sách câu hỏi cố định ngắn.
  - Khả năng sinh trên 100.000 cấu hình toán học hợp lệ độc lập (riêng họ A07 có 891.000 cặp số).
  - Tốc độ sinh cực nhanh (< 0.05ms/câu).
  - Tái hiện chính xác câu hỏi qua Seed + Phiên bản generator.
- **Quy chuẩn nội dung nghiêm ngặt:**
  - Cộng basic (Level 1): tổng luôn < 10 (từ chối 6 + 4, 7 + 5).
  - Trừ basic (Level 1): $0 \le b \le a \le 9$ (từ chối 3 − 8, 10 − 1).
  - Nhân basic (Level 1): bảng cửu chương 2–9 (tuyệt đối không có 12 × 12).
  - Chia thuần túy luôn luôn chia hết, không chia cho 0, không có số thập phân trong câu hỏi và bước giải.
  - Lịch Gregory chuẩn UTC epoch: năm 1900, 2100 không nhuận; năm 2000, 2024 nhuận.
- **Normal Mode vs Hard Mode:**
  - Normal mode: thời gian dài hơn, có nút gợi ý, mẹo nhẩm sau khi làm sai.
  - Hard mode: rút ngắn hạn giờ (4s cho câu cơ bản), thử thách phản xạ tốc độ cao.
- **Hệ thống Ôn tập ngắt quãng (Spaced Repetition):**
  - Ôn lặp trong lượt: câu sai/hết giờ/gợi ý xuất hiện lại sau ít nhất 5 câu xen giữa.
  - Ôn cách ngày: chu kỳ 1 ngày → 3 ngày → 7 ngày → 14 ngày → 30 ngày.
  - Giới hạn chuẩn: tối đa tiến 1 bậc/ngày cho mỗi thẻ ghi nhớ.
  - Đánh giá "Nhớ bền" khi đạt $\ge 3$ ngày ôn đúng trải dài trên $\ge 7$ ngày.
  - Nút **"Ôn hôm nay"** và **"Ôn câu sai"**.
- **Giao diện Glassmorphism tinh gọn:**
  - Màu nền dịu mắt (#EEF6FF → #F4F0FF), thẻ kính mờ bán trong suốt.
  - Tương thích hoàn hảo mọi kích thước màn hình: 320px, 390px, 768px, 1440px.
  - Hỗ trợ bàn phím số, phím Enter, định dạng số tiếng Việt (25.000 hoặc 25000).
  - Không cần đăng nhập, lưu trữ cục bộ an toàn (`nham-nhanh:v1`) có cơ chế tự phục hồi nếu dữ liệu hỏng.

## 2. Hướng dẫn chạy và kiểm thử

### Cài đặt môi trường
Yêu cầu Node.js $\ge 18$.

```bash
# Cài đặt thư viện
npm install

# Khởi chạy máy chủ phát triển (Dev server)
npm run dev

# Chạy toàn bộ test suites tự động
npm run test

# Chạy kiểm toán sinh lớn (>100.000 câu độc lập)
npm run test:audit

# Build production tĩnh
npm run build

# Xem thử bản build production
npm run preview
```

## 3. Cấu trúc thư mục

```
src/
├── app/                  # Quản lý vòng đời phiên luyện tập và điều hướng màn hình
├── components/           # Component giao diện (AnswerInput, QuestionCard, LevelPicker, Feedback...)
├── content/              # Mẫu lời văn tiếng Việt (lifeTemplates) & Mẹo nhẩm (mentalStrategies)
├── engine/               # Bộ xử lý trung tâm
│   ├── generators/       # 8 module sinh câu hỏi cho 66 họ (addition, subtraction, multiplication...)
│   ├── arithmetic.ts     # Toán học an toàn & định dạng số tiếng Việt
│   ├── calendarMath.ts   # Lịch Gregory, năm nhuận, epoch UTC
│   ├── catalog.ts        # Danh mục 66 họ câu hỏi, cấu hình hạn giờ Normal/Hard
│   ├── normalizeAnswer.ts# Parser đáp án số, đồng hồ, ngày tháng, thứ trong tuần
│   ├── progress.ts       # Đánh giá cửa sổ 40 câu (Đang luyện, Đúng vững, Nhẩm nhanh)
│   ├── random.ts         # PRNG Mulberry32 có seed
│   ├── scoreAttempt.ts   # Chấm câu hỏi & kiểm tra deadline
│   ├── selectNextQuestion.ts # Hàng đợi chọn câu: 40% level - 20% yếu - 40% ôn
│   ├── spacedReview.ts   # Thuật toán Spaced Repetition 1-3-7-14-30 ngày
│   └── types.ts          # Type definitions đầy đủ
├── screens/              # HomeScreen, PracticeScreen, ResultsScreen
├── storage/              # Lưu trữ localStorage có fallback bộ nhớ
└── styles/               # Design tokens & CSS glassmorphism
tests/                    # Bộ test suites toàn diện
```
