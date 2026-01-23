# huit-gpa-calculator
# 🎓 Công Cụ Tính GPA - HUIT GPA Calculator

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26.svg)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Responsive](https://img.shields.io/badge/Responsive-Yes-green.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)

**Ứng dụng web tiện lợi giúp sinh viên tính toán và quản lý điểm GPA học kỳ, tổng thể theo thang điểm Việt Nam.**

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-4361ee" alt="Version">
  <img src="https://img.shields.io/badge/Built%20With-Pure%20Web%20Tech-3a0ca3" alt="Built With">
  <img src="https://img.shields.io/badge/Platform-Web%20Browser-4cc9f0" alt="Platform">
</p>

## 🌟 Tính Năng Nổi Bật

### 📊 Tính Toán Thông Minh
- **Tính GPA theo thang 4.0** và **điểm trung bình thang 10**
- **Tự động chuyển đổi điểm số** sang điểm chữ (A, B+, B, C+, C, D+, D, F)
- **Tính điểm tổng kết** với tỷ lệ quá trình/thi cuối kỳ linh hoạt
- **Đánh giá học lực** tự động (Xuất sắc, Giỏi, Khá, Trung bình, Yếu)

### 🗂️ Quản Lý Linh Hoạt
- **Thêm/Xóa học kỳ** không giới hạn
- **Quản lý môn học** trong từng học kỳ
- **Lưu trữ cục bộ** (LocalStorage) - dữ liệu không bị mất khi tải lại trang
- **Import/Export dữ liệu** qua file JSON

### 📱 Thiết Kế Hiện Đại
- **Giao diện trực quan** với bảng màu hiện đại
- **Responsive hoàn hảo** từ điện thoại (360px) đến desktop
- **Tối ưu UX/UI** với các hiệu ứng chuyển động mượt mà
- **Dark mode support** (tự động phát hiện hệ thống)

### 🔧 Tiện Ích Bổ Sung
- **Dữ liệu mẫu** để làm quen nhanh
- **Thang điểm GPA** tham khảo trực quan
- **Xác nhận trước khi xóa** tránh nhầm lẫn
- **Phím tắt thông minh** cho nhập điểm


📖 Hướng Dẫn Sử Dụng
1. Thêm Học Kỳ
Nhấn nút "Thêm học kỳ" để tạo học kỳ mới

Đặt tên học kỳ (mặc định: "Học kỳ X")

Mỗi học kỳ có thể chứa nhiều môn học

2. Thêm Môn Học
Trong mỗi học kỳ, nhấn "Thêm môn học"

Điền thông tin:

Tên môn học

Số tín chỉ (chỉ số nguyên)

Điểm quá trình (0-10)

Điểm cuối kỳ (0-10)

Tỷ lệ (20/80, 30/70, 40/60, 50/50)

3. Tính Toán Tự Động
Điểm tổng kết = (QT × %QT) + (CK × %CK)

Điểm chữ & GPA tự động tính từ điểm tổng kết

Đánh giá học lực hiển thị ngay lập tức

4. Quản Lý Dữ Liệu
Xuất dữ liệu: Lưu toàn bộ điểm vào file JSON

Import dữ liệu: Tải điểm từ file JSON có sẵn

Xóa dữ liệu: Dọn sạch để bắt đầu mới

📱 Hỗ Trợ Thiết Bị
Thiết bị	Kích thước	Hỗ trợ
📱 Điện thoại nhỏ	360px - 400px	✅ Hoàn hảo
📱 Điện thoại thường	401px - 576px	✅ Tối ưu
📱 Điện thoại lớn	577px - 768px	✅ Tốt
🖥️ Máy tính bảng	769px - 992px	✅ Tuyệt vời
💻 Desktop	993px+	✅ Xuất sắc
🎯 Thang Điểm Quy Đổi
Điểm số (10)	Điểm chữ	GPA (4.0)	Đánh giá
8.5 - 10.0	A	4.0	Xuất sắc
8.0 - 8.4	B+	3.5	Giỏi
7.0 - 7.9	B	3.0	Khá
6.5 - 6.9	C+	2.5	Trung bình khá
5.5 - 6.4	C	2.0	Trung bình
5.0 - 5.4	D+	1.5	Trung bình yếu
4.0 - 4.9	D	1.0	Yếu
0.0 - 3.9	F	0.0	Kém
🛠️ Công Nghệ Sử Dụng
Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)

Lưu trữ: LocalStorage API

Styling: CSS Grid, Flexbox, CSS Custom Properties

Responsive: Media Queries, Mobile-First Design

Không phụ thuộc: Không dùng bất kỳ framework hay thư viện nào

📁 Cấu Trúc Dự Án
text
huit-gpa-calculator/
├── index.html          # Trang chính
├── style.css          # Styling chính
├── responsive.css     # Responsive styles
├── script.js          # Logic chính
├── Logo HUIT-01.ico   # Favicon
├── 140.png            # Logo
└── README.md          # Tài liệu
🔧 Tùy Chỉnh
Thay đổi màu sắc
css
:root {
  --primary: #4361ee;      /* Màu chủ đạo */
  --secondary: #3a0ca3;    /* Màu phụ */
  --success: #4cc9f0;      /* Màu thành công */
  --danger: #f72585;       /* Màu cảnh báo */
  /* ... các biến khác */
}
Thêm tỷ lệ điểm mới
javascript
// Trong script.js
const percentageOptions = [
  { label: "10% QT - 90% CK", qt: 10, ck: 90 }, // Thêm vào đây
  { label: "20% QT - 80% CK", qt: 20, ck: 80 },
  // ...
];
🤝 Đóng Góp
Đóng góp luôn được chào đón! Các bước:

Fork dự án

Tạo branch mới (git checkout -b feature/AmazingFeature)

Commit thay đổi (git commit -m 'Add some AmazingFeature')

Push lên branch (git push origin feature/AmazingFeature)

Mở Pull Request



## 🚀 Bắt Đầu Nhanh

### Cách 1: Sử dụng trực tuyến
Truy cập: [https://YuluWusu.github.io/gpa-calculator](https://YuluWusu.github.io/gpa-calculator)

### Cách 2: Chạy cục bộ
```bash
# 1. Clone repository
git clone https://github.com/YuluWusu/huit-gpa-calculator.git

# 2. Mở thư mục
cd huit-gpa-calculator

# 3. Mở file index.html bằng trình duyệt
# Hoặc dùng Live Server nếu có VSCode
