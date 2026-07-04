<h1 align="center">📖 Storyframe</h1>

<p align="center">
  <img src="docs/assets/storyframe-app.png" alt="Storyframe app" width="760">
</p>

<p align="center">
Turn a read-aloud story video into a <b>PDF picture book</b> and an <b>MP3</b> of the narration — right on your own computer.<br>
<i>Biến video đọc truyện thành <b>sách PDF</b> và file <b>MP3</b> giọng đọc — ngay trên máy tính của bạn.</i>
</p>

> A friendly fork of [storyframe-cli](https://github.com/thieung/storyframe-cli): it adds this easy web app, full Windows support, and a one-click launcher.
> <br>_Bản fork thân thiện của [storyframe-cli](https://github.com/thieung/storyframe-cli): bổ sung ứng dụng web dễ dùng này, hỗ trợ Windows đầy đủ, và file khởi chạy một-cú-nhấp._

<p align="center"><sub>Each block shows English first, then <i>Tiếng Việt</i> underneath · Mỗi đoạn có tiếng Anh trước, rồi <i>tiếng Việt</i> ở dưới</sub></p>

<p align="center">
  <a href="https://github.com/nguyennhuanhle/storyframe-plus/releases/latest"><b>⬇ Download the installer</b></a>
  · <a href="https://github.com/nguyennhuanhle/storyframe-plus/releases/latest"><b>Tải bản cài đặt</b></a>
</p>

<p align="center"><sub>
No Git, no setup — download <code>StoryframeSetup.exe</code> from Releases and run it.<br>
<i>Không cần Git, không cần cài lằng nhằng — tải <code>StoryframeSetup.exe</code> từ Releases rồi chạy.</i>
</sub></p>

---

## What it does · Ứng dụng làm gì?

Give Storyframe a story video (like the animated read-aloud storybooks on YouTube) and it gives you back two things you can keep:
<br>_Đưa cho Storyframe một video đọc truyện (ví dụ video đọc sách thiếu nhi trên YouTube), nó trả lại hai thứ bạn có thể lưu giữ:_

- 📄 a **PDF** — each page of the story as a picture · _một file **PDF** — mỗi trang truyện là một tấm ảnh_
- 🎵 an **MP3** — the narration audio · _một file **MP3** — phần giọng đọc_

Everything runs on your own machine. Nothing is uploaded — the only time it goes online is to download the video from YouTube.
<br>_Mọi thứ chạy trên máy của bạn. Không có gì bị tải lên mạng — chỉ khi tải video từ YouTube mới cần internet._

## Get started in 3 steps (Windows) · Bắt đầu trong 3 bước (Windows)

1. **Download this project** — click the green **Code** button at the top of the page → **Download ZIP**, then unzip it.
   <br>_**Tải dự án này về** — bấm nút **Code** màu xanh ở đầu trang → **Download ZIP**, rồi giải nén._
2. **Double-click `start.bat`.**
   <br>_**Nhấp đúp vào `start.bat`.**_
3. **Wait.** The first time it sets everything up automatically (a few minutes), then the app opens in your browser.
   <br>_**Chờ.** Lần đầu ứng dụng tự cài đặt mọi thứ (vài phút), rồi tự mở trong trình duyệt._

You don't install anything by hand — the launcher installs Python, `ffmpeg`, and the YouTube helper (`deno`) for you.
<br>_Bạn không phải tự cài gì — launcher tự cài Python, `ffmpeg`, và công cụ tải YouTube (`deno`) giúp bạn._

> 💡 A black window full of text appears while it works — that's normal, just don't close it while using the app.
> <br>💡 _Cửa sổ nền đen hiện nhiều chữ khi chạy là bình thường — chỉ cần đừng đóng nó khi đang dùng app._

## How to use it · Cách sử dụng

1. **Paste a YouTube link** into the box, or click **Chọn file** (Choose file) to pick a video already on your computer.
   <br>_**Dán link YouTube** vào ô, hoặc bấm **Chọn file** để chọn video có sẵn trên máy._
2. Choose **whether the story text already appears on screen**:
   <br>_Chọn **“Chữ truyện trên màn hình?”**:_
   - **Video CÓ chữ trên màn hình** (text is on screen) — the usual choice · _lựa chọn thông thường_
   - **Video KHÔNG có chữ** (no text) — the app listens to the narration and adds subtitles for you · _app nghe giọng đọc và tự thêm phụ đề_
3. Leave **Chế độ nhanh** (Fast mode) turned on — it's quicker.
   <br>_Để nguyên **Chế độ nhanh** (đang bật) — sẽ chạy nhanh hơn._
4. Click **Bắt đầu xử lý** (Start).
   <br>_Bấm **Bắt đầu xử lý**._

You'll see easy-to-follow progress. A long video can take 10–40 minutes — normal for the on-device AI. When it's done you can play the MP3, open or download the PDF, review and remove pages (then rebuild the PDF in seconds), or delete the whole project.
<br>_Bạn sẽ thấy tiến độ dễ hiểu. Video dài có thể mất 10–40 phút — bình thường với AI chạy trên máy. Khi xong: nghe MP3, mở/tải PDF, xem lại và bỏ bớt trang (rồi tạo lại PDF trong vài giây), hoặc xóa cả dự án._

For more detail, open the **Hướng dẫn sử dụng** (User guide) button inside the app.
<br>_Muốn chi tiết hơn, bấm nút **Hướng dẫn sử dụng** trong app._

### Copying a YouTube link · Sao chép link YouTube

Open the video on youtube.com, click **Share** below the video, then **Copy** — or copy the address from your browser's address bar. A link looks like `https://www.youtube.com/watch?v=XXXXXXXXXXX`.
<br>_Mở video trên youtube.com, bấm **Chia sẻ** dưới video, rồi **Sao chép** — hoặc chép địa chỉ trên thanh trình duyệt. Link trông giống `https://www.youtube.com/watch?v=XXXXXXXXXXX`._

## Good to know · Cần biết

- Storyframe is **local and free**. The first run downloads a ~0.5 GB speech-recognition AI model; after that it works offline (except YouTube downloads).
  <br>_Storyframe **chạy local và miễn phí**. Lần đầu tải một model AI nhận diện giọng nói ~0.5 GB; sau đó dùng được offline (trừ khi tải video YouTube)._
- Only process videos you have the right to download, transform, and store.
  <br>_Chỉ xử lý video mà bạn có quyền tải, chuyển đổi và lưu trữ._

<details>
<summary><b>For advanced users: command line &amp; manual install · Nâng cao: dòng lệnh &amp; cài đặt thủ công</b></summary>

<br>

**Manual install (any platform)** · _Cài đặt thủ công (mọi nền tảng)_

System tools · _Công cụ hệ thống_:

```bash
# Windows
winget install Gyan.FFmpeg DenoLand.Deno
# macOS
brew install ffmpeg
# Linux
sudo apt-get install ffmpeg
```

`ffmpeg` is required. `deno` (or another yt-dlp JS runtime) is required for YouTube downloads. `tesseract` is optional (OCR fallback only).
<br>_`ffmpeg` là bắt buộc. `deno` (hoặc JS runtime khác cho yt-dlp) là bắt buộc để tải YouTube. `tesseract` là tùy chọn (chỉ dùng làm OCR dự phòng)._

```bash
git clone https://github.com/nguyennhuanhle/storyframe-plus.git
cd storyframe-plus
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install -U pip
python -m pip install -e ".[local,gui]"
```

Python 3.11+ is required. Extras: `local` (the processing pipeline) and `gui` (the web app).
<br>_Cần Python 3.11+. Extras: `local` (pipeline xử lý) và `gui` (ứng dụng web)._

**Start the web GUI** · _Mở giao diện web_:

```bash
storyframe gui
```

**Command line** · _Dòng lệnh_:

```bash
# YouTube, local file, or a whole folder · YouTube, file local, hoặc cả folder
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID"
storyframe run "/path/to/book.mp4"
storyframe run "/path/to/video-folder" --recursive

# Video with no on-screen text (render captions) · Video không có chữ (vẽ phụ đề)
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --caption-mode force

# Faster reruns using YouTube captions + cache · Rerun nhanh hơn nhờ phụ đề + cache
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto

# Use browser cookies if YouTube asks to sign in · Dùng cookies nếu YouTube đòi đăng nhập
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --cookies-from-browser chrome
```

Each video writes to `outputs/storyframe-runs/<video-name>/` containing `<video-name>.mp3`, `<video-name>.pdf`, `frames/*.jpg`, `review-index.csv`, `review-contact-sheet.jpg`, and `manifest.json`.
<br>_Mỗi video ghi vào `outputs/storyframe-runs/<video-name>/` gồm các file trên._

Help · _Trợ giúp_: `storyframe run --help` · `storyframe run --advanced-help`

**CPU tips** · _Mẹo CPU_: the heavy steps are OCR, scene detection, and local speech recognition. `--speed auto` reuses YouTube captions and an OCR/frame cache, so reruns are much lighter. If the machine runs hot, cap threads:
<br>_Các bước nặng là OCR, scene detection, và nhận diện giọng nói local. `--speed auto` tận dụng phụ đề YouTube và cache nên rerun nhẹ hơn. Nếu máy nóng, giới hạn threads:_

```bash
OMP_NUM_THREADS=2 OPENBLAS_NUM_THREADS=2 \
storyframe run "https://www.youtube.com/watch?v=VIDEO_ID" --speed auto
```

**Development** · _Phát triển_:

```bash
python3 -m unittest discover -s tests
python3 -m storyframe_cli gui
```

</details>
