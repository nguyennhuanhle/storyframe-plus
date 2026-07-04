# Storyframe Plus

[English](README.md)

Biến video đọc truyện thành một **sách PDF** và một file **MP3** giọng đọc —
mọi thứ chạy ngay trên máy của bạn. Storyframe Plus trích xuất các frame có chữ
truyện sạch từ video, xuất audio giọng đọc thành MP3, và đóng gói các ảnh đã
chọn thành PDF.

> Đây là bản fork của [storyframe-cli](https://github.com/thieung/storyframe-cli),
> bổ sung một **giao diện web** thân thiện cho người dùng không rành kỹ thuật,
> hỗ trợ **Windows** đầy đủ, file khởi chạy một-cú-nhấp, và nhiều sửa lỗi ổn định.

<p align="center">
  <img src="docs/assets/storyframe-cli-overview.png" alt="Tổng quan Storyframe" width="720">
</p>

Hỗ trợ:

- link YouTube, có cache local để tránh tải lại
- một file video local
- folder chứa nhiều video

## Nền tảng

| Nền tảng | Trạng thái |
| --- | --- |
| Windows | Hỗ trợ. Nhấp đúp `start.bat` để cài đặt một-cú-nhấp. |
| macOS | Hỗ trợ và đã test. |
| Linux | Hỗ trợ nếu đã cài system packages. |

## Bắt đầu nhanh (Windows)

1. Tải repo này về (nút **Code** màu xanh → **Download ZIP**, rồi giải nén),
   hoặc clone về.
2. Nhấp đúp vào **`start.bat`**.
3. Chờ quá trình cài đặt lần đầu hoàn tất — ứng dụng sẽ tự mở trong trình duyệt.

Lần chạy đầu tiên, launcher **tự động cài mọi thứ cần thiết** — Python (nếu máy
chưa có), các thư viện Python, `ffmpeg`, và `deno` (dùng để tải YouTube) — thông
qua `winget`. Chạy lại `start.bat` bất cứ lúc nào để mở app; thêm `-Update` để
cập nhật thư viện. Model AI nghe giọng nói (~0.5&nbsp;GB) sẽ tải về ở lần xử lý
video đầu tiên.

## Cài đặt thủ công (mọi nền tảng)

Công cụ hệ thống:

```bash
# Windows
winget install Gyan.FFmpeg DenoLand.Deno
# macOS
brew install ffmpeg
# Linux
sudo apt-get install ffmpeg
```

`ffmpeg` là bắt buộc. `deno` (hoặc một JS runtime khác cho yt-dlp) là bắt buộc
để tải video YouTube. `tesseract` là tùy chọn — chỉ dùng làm OCR dự phòng.

Clone và cài Python package:

```bash
git clone https://github.com/nguyennhuanhle/storyframe-plus.git
cd storyframe-plus
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[local,gui]"
```

Cần Python 3.11+.

Python dependencies:

- base: `liteparse`, `numpy`, `opencv-python-headless`, `pillow`, `yt-dlp`
- local pipeline (`local`): `faster-whisper`, `imagehash`, `pytesseract`,
  `rapidocr`, `rapidfuzz`, `scenedetect`, `scikit-image`
- web GUI (`gui`): `fastapi`, `uvicorn`, `python-multipart`

`faster-whisper` sẽ download ASR model được chọn ở lần chạy đầu tiên.

## Giao diện web

Khởi động giao diện web local:

```bash
storyframe gui
```

Trình duyệt sẽ mở tại `http://127.0.0.1:8765`. Tại đây bạn có thể:

- Dán link YouTube hoặc chọn file video, rồi bắt đầu xử lý.
- Xem tiến độ theo từng giai đoạn dễ hiểu, và hủy công việc đang chạy.
- Nghe MP3, sau đó mở hoặc tải PDF khi xong.
- Duyệt lại các trang: trang bị đánh dấu **cần xem lại** có viền cam; bỏ hoặc
  khôi phục trang và tạo lại PDF trong vài giây.
- Xóa một dự án (xóa luôn file khỏi máy).
- Mở phần **Hướng dẫn sử dụng** có sẵn.

Mọi thứ chạy local; công việc và kết quả được lưu trong
`outputs/storyframe-runs`. Giao diện bằng tiếng Việt, hướng đến người dùng không
rành kỹ thuật.

## Dòng lệnh

YouTube:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID"
```

File local:

```bash
storyframe run "/path/to/book.mp4"
```

Folder:

```bash
storyframe run "/path/to/video-folder"
```

Video không có text truyện sẵn trên frame:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force
```

Chạy nhanh hơn khi rerun YouTube:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

Folder có thư mục con:

```bash
storyframe run "/path/to/video-folder" --recursive
```

## Dùng Với Codex App Hoặc Claude Desktop

Mở repository này làm working folder, rồi dùng một trong các prompt dưới đây.
Các prompt này giả định app có quyền truy cập file local và terminal.

Chạy với YouTube:

```text
Cài local dependencies cho repo này, rồi chạy Storyframe với:
https://www.youtube.com/watch?v=VIDEO_ID

Giữ outputs trong outputs/storyframe-runs, reuse YouTube cache, và không commit
các file MP3/PDF/JPG generated. Sau khi chạy xong, tóm tắt output folder và các
dòng bị marked needs_review.
```

Batch folder:

```text
Chạy Storyframe cho mọi video trong /path/to/video-folder, có recursive.
Giữ work files để review, báo lại output paths, và không commit generated media.
```

## Output

Mặc định mỗi video ghi vào:

```text
outputs/storyframe-runs/<video-name>/
```

File chính:

```text
<video-name>.mp3
<video-name>.pdf
frames/*.jpg
review-index.csv
review-contact-sheet.jpg
manifest.json
```

## CPU Usage

Storyframe chạy local/free, nên lần chạy đầu có thể dùng CPU cao. Các bước nặng
là OCR trên nhiều frame, scene/page detection, và local ASR nếu video không có
YouTube captions.

Command khuyến nghị cho video YouTube:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

`--speed auto` dùng YouTube captions nếu có và lưu OCR/frame cache trong
`<output-root>/_work/cache`, nên rerun cùng video sẽ nhẹ hơn nhiều.

Nếu máy quá nóng, giới hạn số CPU threads:

```bash
OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 \
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

Với video không có text truyện sẵn trên màn hình, dùng caption rendering:

```bash
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto --caption-mode force
```

## Options Hay Dùng

```bash
# Chọn output directory.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --output-root runs

# Dùng chung YouTube cache.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" \
  --download-cache-dir outputs/storyframe-youtube-cache

# Dùng browser cookies nếu YouTube yêu cầu login.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --cookies-from-browser chrome

# Render transcript caption khi video không có text truyện sẵn trên frame.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force

# Dùng YouTube captions nếu có và reuse OCR/frame cache.
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto

# Giữ raw scanned frames và work files để debug.
storyframe run "/path/to/book.mp4" --keep-work
```

Basic help:

```bash
storyframe run --help
```

Advanced OCR/ASR tuning flags:

```bash
storyframe run --advanced-help
```

## Ghi Chú

- `strict-complete` là quality mode mặc định.
- `--caption-mode off` là mặc định để tránh ảnh hưởng video đã có text truyện
  sẵn trên frame.
- Dùng `--caption-mode force` cho video không có text truyện sẵn trên frame.
  Chỉ dùng `--caption-mode auto` khi muốn Storyframe tự detect case đó.
- Dùng `--speed auto` để bỏ qua ASR local khi YouTube có captions, và reuse
  OCR/frame cache khi rerun. Nếu không có captions, tool dùng fallback
  OCR-first cho video đã có text truyện trên màn hình.
- Video YouTube được cache tại `<output-root>/_youtube-cache`.
- Chỉ xử lý video mà bạn có quyền download, transform, và lưu trữ.

## Development

```bash
python3 -m unittest discover -s tests
python3 -m storyframe_cli run "https://www.youtube.com/watch?v=VIDEO_ID"
python3 -m storyframe_cli gui
```
