# Nhẩm Nhanh

[Luyện trên website](https://dangkhue1301.github.io/nham-nhanh/) · [Mã nguồn](https://github.com/dangkhue1301/nham-nhanh)

Ưu tiên luyện tính nhẩm nhanh mỗi ngày. React + TypeScript + Vite, chạy tĩnh trên GitHub Pages; kết quả lưu ở trình duyệt, không cần tài khoản.

## Cách luyện

- **Luyện nhẩm:** 20 câu có đếm ngược và gợi ý khi cần.
- **Tốc độ cao:** 20 câu với thời gian ngắn hơn, không có gợi ý. Rời tab kết thúc lượt.
- **Học từng bước:** 10 bài không đếm ngược cho tách–ghép số, hằng đẳng thức, phân tích đa thức và diện tích. Điền ô hoặc chọn đáp án từng bước; một bài hoàn tất chỉ tính một câu.

Chủ đề có 5 mức: cộng, trừ, nhân, chia, trộn bốn phép; tách–ghép số; đủ 7 hằng đẳng thức; phân tích nhân tử; diện tích hình phẳng (có sơ đồ); tiền, thời gian, ngày tháng. Tổng cộng 86 họ bài sinh theo seed.

Nhóm mới dùng giới hạn Luyện nhẩm/Tốc độ cao: mức 1–2 là 20/10 giây, mức 3–4 là 40/20 giây, mức 5 là 60/30 giây. Không có lịch ôn tập hoặc hàng đợi chèn lại câu sai.

## Thống kê và dữ liệu

Kết quả lưu ngay sau từng bài đã chấm, kể cả khi dừng giữa lượt. Thống kê theo ngày ở múi giờ Việt Nam gồm số câu, độ chính xác và thời gian trung bình của câu đúng có thời gian. Có bộ lọc chủ đề, cách luyện và lịch sử 7/30/tất cả ngày.

Chỉ một tab được luyện tại một thời điểm. Các tab khác vẫn xem và cập nhật thống kê; bắt đầu lượt mới hoặc thay đổi/xóa tiến độ phải chờ tab đang luyện kết thúc. Cần trình duyệt hiện đại hỗ trợ Web Locks. Khi tạm dừng Luyện nhẩm/Học từng bước, đáp án đang nhập được giữ nguyên; không tự chuyển câu trong nền. Ngày thống kê tự cập nhật lúc nửa đêm và khi quay lại tab.

Độ chính xác = số câu đúng độc lập / tổng số câu đã chấm. Các trạng thái có trợ giúp, sai, bỏ qua và hết giờ được tách riêng. Trong Học từng bước, thử sai hoặc dùng gợi ý khiến cả bài được tính có trợ giúp khi hoàn tất. Câu đang làm chưa chấm không được tính.

Dữ liệu dùng khóa localStorage nham-nhanh:v2. Lịch sử v1 được chuyển sang v2 khi lưu lần tiếp theo; khóa v1 vẫn giữ nguyên làm bản dự phòng. Thống kê ngày bắt đầu từ bản cập nhật này vì lịch sử cũ không đủ để tái dựng chính xác. Nếu trình duyệt chặn lưu trữ, ứng dụng giữ kết quả trong bộ nhớ của phiên đang mở.

## Chạy và kiểm thử

Yêu cầu Node.js 22 (cùng phiên bản với CI).

~~~sh
npm ci
npm run dev
npm test
npm run build
npm run preview
~~~

Push lên main tự chạy kiểm thử, build và deploy GitHub Pages bằng workflow hiện có.

## Frontend

Bố cục, khoảng cách, kiểu chữ, trạng thái điều khiển và scrollbar dựa trên skill ui-ux của [evondevKit](https://github.com/evondev/evondevKit). Giữ React/CSS và bảng màu tím sẵn có, bổ sung nhãn nhập liệu, nút trả lời luôn hiện, thao tác Enter, trạng thái focus, modal hỗ trợ Escape/Tab và giao diện thích ứng.

Các phần scrollbar được điều chỉnh từ mã MIT của repo tham khảo; xem THIRD_PARTY_NOTICES.md.

## Mã chính

- src/engine/generators: sinh đề và hướng dẫn, gồm thinking.ts cho nhóm mới.
- src/engine/scoreAttempt.ts: chấm và kiểm tra hạn giờ.
- src/engine/activity.ts: thống kê ngày và tổng kết lượt.
- src/storage/localProgress.ts: kiểm tra cấu trúc dữ liệu, chuyển v1, lưu và fallback.
- src/screens và src/components: trang chủ, luyện tập, kết quả và thống kê.
- tests: kiểm tra công thức độc lập, parser, lịch, chọn bài, chấm điểm, thống kê và lưu trữ.
