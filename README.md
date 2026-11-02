# Thủy cung tí hon

Game thủy cung 2D pixel art chạy hoàn toàn trong trình duyệt: cá bơi và vẫy đuôi, rong biển chuyển động, san hô, cho ăn, mua cá và lưu tiến trình bằng localStorage. Đồ họa dùng Canvas 2D, HTML, CSS và JavaScript thuần; Vite phục vụ phát triển và tạo bản production. Không cần backend, API key hay CDN.

## Đưa game lên website công khai bằng Vercel

1. Đưa mã nguồn trong thư mục này lên GitHub, bao gồm `package-lock.json`, `vite.config.js` và `vercel.json`.
2. Đăng nhập Vercel, chọn **Add New → Project**, kết nối GitHub rồi import repository `minhchau794/aquarium-pixel-game-Copy`.
3. Chọn nhánh chứa mã nguồn game. Nếu mã nằm trong PR, merge vào `main` để deploy production, hoặc chọn nhánh game làm Production Branch.
4. Root Directory là gốc repository. Framework **Vite**, Node.js **24.x**, Install Command **npm ci**, Build Command **npm run build**, Output Directory **dist**. Không cần biến môi trường.
5. Bấm **Deploy**. Khi trạng thái **Ready**, dùng URL HTTPS được Vercel cấp để chơi và chia sẻ. Không dùng địa chỉ localhost của cloud. Để ai cũng xem được, kiểm tra Deployment Protection của deployment và tắt yêu cầu đăng nhập nếu đang bật.

`vercel.json` đã khai báo các lệnh và thư mục output. Vercel chỉ cần xuất bản `dist`; không chạy `server.js` hay file BAT. Sau khi kết nối GitHub, các commit mới có thể kích hoạt deployment tự động. LocalStorage riêng theo domain, trình duyệt và thiết bị; save trên địa chỉ cũ không tự chuyển sang domain mới.

Nếu không dùng GitHub, sau khi tải mã về máy, cài Node.js 24 rồi chạy `npm ci`, `npm run build`, tiếp theo `npx vercel` và làm theo hướng dẫn đăng nhập/liên kết project. Dùng `npx vercel --prod` khi muốn xuất bản production.

## Phát triển và kiểm tra

Dùng Node.js 24 LTS (yêu cầu tối thiểu 22.12):

```sh
npm ci
npm run check
npm run build
npm run dev -- --host 0.0.0.0
```

`npm run build` tạo `dist/` với HTML và assets tối ưu. `npm run preview -- --host 0.0.0.0` phục vụ bản build trên cổng 4173 để kiểm tra nội bộ; đây không phải thao tác deploy công khai. Cổng dev mặc định 5173, có thể đổi bằng `--port 3000`. Trong cloud, chỉ URL do nền tảng hosting cấp mới dùng để truy cập từ máy khác. Giao diện onboarding không cung cấp web Preview.

Kiểm tra trực quan: cá bơi, cho ăn, số tiền tăng khi ăn, mua từng loại cá, tạm dừng/tiếp tục, và tải lại trang để kiểm tra lưu tiến trình. Chưa có bộ kiểm thử trình duyệt tự động.

## Cách chơi

- Bắt đầu với 100 đồng và 3 con cá; tối đa 20 con.
- Chạm vào nước hoặc bấm **Cho cá ăn** để thả 6 viên thức ăn, cách nhau ít nhất 2 giây.
- Cá ăn thưởng 5 đồng; mỗi con nghỉ 3 giây giữa các lần ăn.
- Ba loại cá giá 40, 65 và 90 đồng.
- Tạm dừng dừng mô phỏng; vẫn có thể mua cá.
- Tiến trình lưu số tiền và loại cá. Vị trí bơi tạo lại khi tải trang. Nếu trình duyệt chặn lưu trữ, game vẫn chơi trong phiên hiện tại.

## Tệp dự án

- `index.html`, `src/main.js`, `src/style.css`: giao diện và logic game.
- `vite.config.js`, `package.json`, `package-lock.json`: phát triển và build.
- `vercel.json`: cấu hình hosting production.
- `server.js`: máy chủ tệp nguồn dự phòng, không cần cài thư viện; chạy bằng `npm start`.
- `start-game.bat`, `start-game.ps1`: tiện ích chạy trên Windows cá nhân, không deploy lên mạng. Cần Node.js 18 trở lên cho chế độ dự phòng này; tải và giải nén cả project, nhấp đúp BAT, giữ cửa sổ mở và nhấn Enter để dừng. Ưu tiên cổng 5173, tự chọn cổng khác nếu bị chiếm; save gắn với cổng.

Không tắt kiểm tra TLS. Trong môi trường cloud, kết nối npm/GitHub qua proxy có thể yêu cầu thực thi ngoài sandbox. Không ghi token hoặc mật khẩu vào mã nguồn.
