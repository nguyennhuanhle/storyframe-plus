<a name="storyframe"></a>
<h1 align="center">📖 Storyframe</h1>

<p align="center"><b>English</b> · <a href="#tiếng-việt">🇻🇳 Tiếng Việt</a></p>

<p align="center">
  <img src="docs/assets/storyframe-app.png" alt="Storyframe app" width="760">
</p>

<p align="center">
Turn a read-aloud story video into a <b>PDF picture book</b> and an <b>MP3</b> of the
narration — right on your own computer.
</p>

> A friendly fork of [storyframe-cli](https://github.com/thieung/storyframe-cli):
> it adds this easy web app, full Windows support, and a one-click launcher.

---

## What it does

Give Storyframe a story video (like the animated read-aloud storybooks on
YouTube) and it gives you back two things you can keep:

- 📄 a **PDF** — each page of the story as a picture
- 🎵 an **MP3** — the narration audio

Everything runs on your own machine. Nothing is uploaded — the only time it goes
online is to download the video you asked for from YouTube.

## Get started in 3 steps (Windows)

1. **Download this project** — click the green **Code** button at the top of the
   page → **Download ZIP**, then unzip it. (Or clone it with Git.)
2. **Double-click `start.bat`.**
3. **Wait.** The first time, it sets everything up automatically (a few
   minutes). Then the app opens in your web browser.

That's it — you don't install anything by hand. On the first run the launcher
installs Python, `ffmpeg`, and the YouTube helper (`deno`) for you.

> 💡 A black window full of text appears while it works — that's normal. Just
> don't close it while you're using the app.

## How to use it

1. **Paste a YouTube link** into the box, or click **Chọn file** (Choose file)
   to pick a video already on your computer.
   [How to copy a YouTube link ↓](#copying-a-youtube-link)
2. Choose **whether the story text already appears on screen**:
   - **Video CÓ chữ trên màn hình** (text is on screen) — the usual choice.
   - **Video KHÔNG có chữ** (no text) — the app listens to the narration and
     adds subtitles onto the pictures for you.
3. Leave **Chế độ nhanh** (Fast mode) turned on — it's quicker.
4. Click **Bắt đầu xử lý** (Start).

You'll see easy-to-follow progress for each step. A long video can take a while
(roughly 10–40 minutes) — that's normal for the on-device AI. When it's done you
can **play the MP3**, **open or download the PDF**, review and remove pages
(then rebuild the PDF in seconds), or delete the whole project.

Want more detail? Open the **Hướng dẫn sử dụng** (User guide) button inside the
app for a full step-by-step guide.

### Copying a YouTube link

Open the video on youtube.com, click **Share** below the video, then **Copy** —
or just copy the address from your browser's address bar. A link looks like
`https://www.youtube.com/watch?v=XXXXXXXXXXX`.

## Good to know

- Storyframe is **local and free**. The first run downloads a speech-recognition
  AI model (~0.5 GB); after that it works offline (except YouTube downloads).
- Only process videos you have the right to download, transform, and store.

<details>
<summary><b>For advanced users: command line &amp; manual install</b></summary>

### Manual install (any platform)

System tools:

```bash
# Windows
winget install Gyan.FFmpeg DenoLand.Deno
# macOS
brew install ffmpeg
# Linux
sudo apt-get install ffmpeg
```

`ffmpeg` is required. `deno` (or another yt-dlp JS runtime) is required for
YouTube downloads. `tesseract` is optional (used only as an OCR fallback).

```bash
git clone https://github.com/nguyennhuanhle/storyframe-plus.git
cd storyframe-plus
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[local,gui]"
```

Python 3.11+ is required. Extras: `local` (the processing pipeline) and `gui`
(the web app).

### Start the web GUI

```bash
storyframe gui
```

### Command line

```bash
# YouTube, local file, or a whole folder
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID"
storyframe run "/path/to/book.mp4"
storyframe run "/path/to/video-folder" --recursive

# Video with no on-screen text (render captions from narration)
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force

# Faster reruns using YouTube captions + cache
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto

# Use browser cookies if YouTube asks you to sign in
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --cookies-from-browser chrome
```

Each video writes to `outputs/storyframe-runs/<video-name>/` containing
`<video-name>.mp3`, `<video-name>.pdf`, `frames/*.jpg`, `review-index.csv`,
`review-contact-sheet.jpg`, and `manifest.json`.

Help: `storyframe run --help` (basic) or `storyframe run --advanced-help`
(all OCR/ASR tuning flags).

### CPU tips

The heavy steps are OCR over sampled frames, scene detection, and local speech
recognition. `--speed auto` reuses YouTube captions and an OCR/frame cache, so
reruns are much lighter. If the machine runs hot, cap threads:

```bash
OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 \
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

### Development

```bash
python3 -m unittest discover -s tests
python3 -m storyframe_cli gui
```

</details>

<br>

---

<a name="tiếng-việt"></a>
<h1 align="center">📖 Storyframe · Tiếng Việt</h1>

<p align="center"><a href="#storyframe">🇬🇧 English</a> · <b>Tiếng Việt</b></p>

<p align="center">
Biến video đọc truyện thành <b>sách PDF</b> và file <b>MP3</b> giọng đọc —
ngay trên máy tính của bạn.
</p>

> Bản fork thân thiện của [storyframe-cli](https://github.com/thieung/storyframe-cli):
> bổ sung ứng dụng web dễ dùng này, hỗ trợ Windows đầy đủ, và file khởi chạy
> một-cú-nhấp.

---

## Ứng dụng làm gì?

Đưa cho Storyframe một video đọc truyện (ví dụ các video đọc sách thiếu nhi trên
YouTube), nó trả lại cho bạn hai thứ có thể lưu giữ:

- 📄 một file **PDF** — mỗi trang truyện là một tấm ảnh
- 🎵 một file **MP3** — phần giọng đọc

Mọi thứ chạy ngay trên máy của bạn. Không có gì bị tải lên mạng — chỉ khi tải
video từ YouTube ứng dụng mới cần kết nối internet.

## Bắt đầu trong 3 bước (Windows)

1. **Tải dự án này về** — bấm nút **Code** màu xanh ở đầu trang → **Download
   ZIP**, rồi giải nén. (Hoặc clone bằng Git.)
2. **Nhấp đúp vào `start.bat`.**
3. **Chờ.** Lần đầu, ứng dụng tự cài đặt mọi thứ (mất vài phút). Sau đó nó tự mở
   trong trình duyệt.

Vậy là xong — bạn không phải tự cài gì cả. Lần chạy đầu, launcher tự cài Python,
`ffmpeg`, và công cụ tải YouTube (`deno`) giúp bạn.

> 💡 Một cửa sổ nền đen hiện nhiều dòng chữ trong lúc chạy là bình thường. Chỉ
> cần **đừng đóng nó** khi đang dùng app.

## Cách sử dụng

1. **Dán link YouTube** vào ô, hoặc bấm **Chọn file** để chọn video có sẵn trên
   máy. [Cách sao chép link YouTube ↓](#cách-sao-chép-link-youtube)
2. Chọn mục **“Chữ truyện trên màn hình?”**:
   - **Video CÓ chữ trên màn hình** — lựa chọn thông thường.
   - **Video KHÔNG có chữ** — app nghe giọng đọc và tự thêm phụ đề lên ảnh.
3. Để nguyên **Chế độ nhanh** (đang bật) — sẽ chạy nhanh hơn.
4. Bấm **Bắt đầu xử lý**.

Bạn sẽ thấy tiến độ dễ hiểu theo từng bước. Video dài có thể mất một lúc (khoảng
10–40 phút) — đây là điều bình thường với AI chạy trên máy. Khi xong, bạn có thể
**nghe MP3**, **mở hoặc tải PDF**, xem lại và bỏ bớt trang (rồi tạo lại PDF trong
vài giây), hoặc xóa cả dự án.

Muốn chi tiết hơn? Bấm nút **Hướng dẫn sử dụng** ngay trong app để xem hướng dẫn
đầy đủ từng bước.

### Cách sao chép link YouTube

Mở video trên youtube.com, bấm **Chia sẻ** (Share) dưới video, rồi bấm **Sao
chép** (Copy) — hoặc sao chép địa chỉ trên thanh trình duyệt. Link trông giống
`https://www.youtube.com/watch?v=XXXXXXXXXXX`.

## Cần biết

- Storyframe **chạy local và miễn phí**. Lần chạy đầu tải một model AI nhận diện
  giọng nói (~0.5 GB); sau đó dùng được offline (trừ khi tải video YouTube).
- Chỉ xử lý video mà bạn có quyền tải, chuyển đổi và lưu trữ.

<details>
<summary><b>Dành cho người dùng nâng cao: dòng lệnh &amp; cài đặt thủ công</b></summary>

### Cài đặt thủ công (mọi nền tảng)

Công cụ hệ thống:

```bash
# Windows
winget install Gyan.FFmpeg DenoLand.Deno
# macOS
brew install ffmpeg
# Linux
sudo apt-get install ffmpeg
```

`ffmpeg` là bắt buộc. `deno` (hoặc JS runtime khác cho yt-dlp) là bắt buộc để tải
YouTube. `tesseract` là tùy chọn (chỉ dùng làm OCR dự phòng).

```bash
git clone https://github.com/nguyennhuanhle/storyframe-plus.git
cd storyframe-plus
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[local,gui]"
```

Cần Python 3.11+. Extras: `local` (pipeline xử lý) và `gui` (ứng dụng web).

### Mở giao diện web

```bash
storyframe gui
```

### Dòng lệnh

```bash
# YouTube, file local, hoặc cả một folder
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID"
storyframe run "/path/to/book.mp4"
storyframe run "/path/to/video-folder" --recursive

# Video không có chữ trên màn hình (vẽ phụ đề từ giọng đọc)
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force

# Rerun nhanh hơn nhờ phụ đề YouTube + cache
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto

# Dùng cookies trình duyệt nếu YouTube yêu cầu đăng nhập
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --cookies-from-browser chrome
```

Mỗi video ghi vào `outputs/storyframe-runs/<video-name>/` gồm
`<video-name>.mp3`, `<video-name>.pdf`, `frames/*.jpg`, `review-index.csv`,
`review-contact-sheet.jpg`, và `manifest.json`.

Trợ giúp: `storyframe run --help` (cơ bản) hoặc `storyframe run --advanced-help`
(mọi flag tinh chỉnh OCR/ASR).

### Mẹo CPU

Các bước nặng là OCR trên nhiều frame, scene detection, và nhận diện giọng nói
local. `--speed auto` tận dụng phụ đề YouTube và cache OCR/frame nên rerun nhẹ
hơn nhiều. Nếu máy nóng, giới hạn số threads:

```bash
OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 \
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

### Phát triển

```bash
python3 -m unittest discover -s tests
python3 -m storyframe_cli gui
```

</details>
