# Phạm vi và kiểm tra bản cập nhật

## Nội dung

86 họ bài: 66 họ tính nhẩm/toán đời sống sẵn có và 20 họ nền tảng mới.

| Nhóm | Mức 1 | Mức 2 | Mức 3 | Mức 4 | Mức 5 |
|---|---|---|---|---|---|
| Tách–ghép số | Ghép đủ 10/100 | Bù mốc tròn | Ghép thừa số 25/50/125 | Cặp tổng–tích có dấu | Hiệu hai bình phương |
| Hằng đẳng thức | Bình phương tổng | Bình phương hiệu | Hiệu hai bình phương | Lập phương tổng/hiệu | Tổng/hiệu hai lập phương |
| Phân tích đa thức | Nhân tử chung | Nhận dạng bình phương | Nhóm hạng tử | Tách cặp tổng–tích | Kết hợp nhân tử chung và cặp tổng–tích |
| Diện tích | Vuông/chữ nhật | Tam giác | Bình hành/thoi/thang | Hình tròn/đổi cm² sang m² | Hình ghép cắt góc |

Các nhóm mới có bài theo từng bước không tính giờ hoặc bài luyện có giờ. Đáp án là số, các ô hệ số hoặc lựa chọn; không yêu cầu nhập biểu thức đại số tự do.

## Những lỗi đã xử lý

- Tổng kết bỏ sót câu thứ 20 do đọc state cũ.
- Đáp án đúng sau tạm dừng bị tính bỏ qua.
- Đánh giá nhanh dùng thời gian Normal thay vì chuẩn Hard.
- Nút trả lời bị ẩn và thiếu nút chuyển câu khi tắt tự động.
- Chọn bảng nhân nhưng sinh đề ngoài bảng đã chọn.
- ID lượt thay đổi theo câu và thời điểm bắt đầu lượt giả.
- Dữ liệu lưu trữ có JSON hoặc cấu trúc con hỏng gây crash.
- Timer chuyển câu còn sống sau khi thoát; gửi đáp án nhiều lần gây đếm lặp.
- Hiển thị đáp án đồng hồ/ngày tháng dưới dạng object.
- Viewport khóa phóng to trên điện thoại.

## Kiểm tra tự động

- Sinh 8.000 bài nhóm mới, kiểm tra đáp án, bước học và giới hạn giờ.
- Đối chiếu độc lập đa thức khai triển/nhân tử tại nhiều giá trị x, đủ các biến thể của 7 hằng đẳng thức.
- Đối chiếu diện tích với kích thước của cả 8 hình và chuyển đổi đơn vị vuông.
- Số âm, dấu trừ Unicode, số thập phân dấu phẩy/chấm và cặp nhân tử đảo thứ tự.
- Thống kê tất cả trạng thái, chống đếm lặp, mốc nửa đêm Việt Nam, tổng 20/20 và lượt dừng giữa chừng.
- Chuyển dữ liệu v1, giữ bản dự phòng, dữ liệu hỏng, lưu từng bài và fallback khi chặn lưu trữ.
- Giữ kiểm toán hơn 100.000 cấu hình khác nhau của bộ sinh đề cũ.

Không có backend máy chủ; logic chấm, chọn câu và lưu dữ liệu đều chạy trong trình duyệt.