from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import uuid
from collections import deque
from dataclasses import dataclass, field
from pathlib import Path
from types import SimpleNamespace

from .. import cli

OCR_PROGRESS_RE = re.compile(r"local OCR (\d+)/(\d+)")
MAX_LOG_LINES = 400

STAGE_ORDER = ["download", "prepare", "pages", "listen", "scan", "select", "package"]


def friendly_error(raw: str) -> str:
    lower = raw.lower()
    if "this video is not available" in lower or "video unavailable" in lower:
        return (
            "Video không tồn tại, đã bị xóa hoặc bị chặn ở khu vực của bạn. "
            "Hãy kiểm tra lại đường link."
        )
    if "sign in" in lower or "login required" in lower or "age" in lower and "confirm" in lower:
        return (
            "YouTube yêu cầu đăng nhập để xem video này. "
            "Mở phần Cài đặt nâng cao và chọn trình duyệt để lấy cookies."
        )
    if "selected no frames" in lower or "no ocr observations" in lower:
        return (
            "Không tìm thấy chữ truyện trên màn hình video. "
            "Hãy thử lại và chọn 'Video KHÔNG có chữ trên màn hình'."
        )
    if "no asr transcript units" in lower:
        return (
            "Không nghe được lời đọc trong video nên không thể tạo phụ đề. "
            "Video có thể không có tiếng nói."
        )
    if "ffmpeg" in lower and ("not found" in lower or "missing" in lower):
        return "Thiếu ffmpeg trên máy. Cài bằng lệnh: winget install Gyan.FFmpeg"
    tail = raw.strip().splitlines()[-1] if raw.strip() else "Lỗi không xác định."
    return f"Xử lý thất bại: {tail[:300]}"


@dataclass
class Job:
    id: str
    source: str
    title: str
    options: dict
    created_at: float
    status: str = "queued"  # queued | running | done | failed | canceled
    stage: str = ""
    stage_progress: float | None = None
    detail: str = ""
    output_dir: str = ""
    error: str = ""
    frame_count: int = 0
    mp3: str = ""
    pdf: str = ""
    finished_at: float | None = None
    log: list[str] = field(default_factory=list)
    cancel_requested: bool = False

    def to_dict(self, include_log: bool = False) -> dict:
        data = {
            "id": self.id,
            "source": self.source,
            "title": self.title,
            "options": self.options,
            "created_at": self.created_at,
            "status": self.status,
            "stage": self.stage,
            "stage_progress": self.stage_progress,
            "detail": self.detail,
            "output_dir": self.output_dir,
            "error": self.error,
            "frame_count": self.frame_count,
            "has_mp3": bool(self.mp3),
            "has_pdf": bool(self.pdf),
            "finished_at": self.finished_at,
        }
        if include_log:
            data["log"] = self.log[-60:]
        return data


class JobManager:
    def __init__(self, output_root: Path) -> None:
        self.output_root = output_root.expanduser().resolve()
        self.work_root = self.output_root / "_work"
        self.cache_dir = self.output_root / "_youtube-cache"
        self.upload_dir = self.output_root / "_uploads"
        self.state_dir = self.output_root / "_gui"
        for directory in (
            self.output_root,
            self.work_root,
            self.cache_dir,
            self.upload_dir,
            self.state_dir,
        ):
            directory.mkdir(parents=True, exist_ok=True)

        self.lock = threading.RLock()
        self.jobs: dict[str, Job] = {}
        self.order: list[str] = []
        self.queue: deque[str] = deque()
        self._proc: subprocess.Popen | None = None
        self._proc_job_id: str | None = None
        self._load_state()

        self._worker = threading.Thread(target=self._worker_loop, daemon=True)
        self._worker.start()

    # ------------------------------------------------------------- state

    def _state_path(self) -> Path:
        return self.state_dir / "jobs.json"

    def _load_state(self) -> None:
        path = self._state_path()
        if not path.exists():
            return
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return
        for item in payload:
            job = Job(
                id=item["id"],
                source=item["source"],
                title=item.get("title", item["source"]),
                options=item.get("options", {}),
                created_at=item.get("created_at", 0.0),
                status=item.get("status", "failed"),
                stage=item.get("stage", ""),
                detail=item.get("detail", ""),
                output_dir=item.get("output_dir", ""),
                error=item.get("error", ""),
                frame_count=item.get("frame_count", 0),
                mp3=item.get("mp3", ""),
                pdf=item.get("pdf", ""),
                finished_at=item.get("finished_at"),
            )
            if job.status in {"queued", "running"}:
                job.status = "failed"
                job.error = "Phiên làm việc trước bị gián đoạn. Hãy chạy lại."
            self.jobs[job.id] = job
            self.order.append(job.id)

    def _save_state(self) -> None:
        with self.lock:
            payload = []
            for job_id in self.order:
                job = self.jobs[job_id]
                item = job.to_dict()
                item["mp3"] = job.mp3
                item["pdf"] = job.pdf
                payload.append(item)
        try:
            self._state_path().write_text(
                json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
            )
        except Exception:
            pass

    # ------------------------------------------------------------ public

    def system_status(self) -> dict:
        return {
            "ffmpeg": shutil.which("ffmpeg") is not None,
            "ffprobe": shutil.which("ffprobe") is not None,
            "deno": shutil.which("deno") is not None or shutil.which("node") is not None,
            "tesseract": shutil.which("tesseract") is not None,
            "output_root": str(self.output_root),
        }

    def list_jobs(self) -> list[dict]:
        with self.lock:
            return [self.jobs[job_id].to_dict() for job_id in reversed(self.order)]

    def get_job(self, job_id: str) -> Job | None:
        with self.lock:
            return self.jobs.get(job_id)

    def submit(self, source: str, options: dict) -> list[dict]:
        sources: list[tuple[str, str]] = []
        if cli.is_url(source):
            sources.append((source, source))
        else:
            path = Path(source).expanduser()
            if path.is_dir():
                for video in cli.iter_video_files(path, recursive=True):
                    sources.append((str(video), video.stem))
                if not sources:
                    raise ValueError("Thư mục này không có file video nào.")
            elif path.is_file() and path.suffix.lower() in cli.VIDEO_EXTENSIONS:
                sources.append((str(path), path.stem))
            else:
                raise ValueError(
                    "Nguồn không hợp lệ. Hãy dán link YouTube hoặc chọn file video."
                )

        created = []
        with self.lock:
            for src, title in sources:
                job = Job(
                    id=uuid.uuid4().hex[:12],
                    source=src,
                    title=title,
                    options=dict(options),
                    created_at=time.time(),
                )
                self.jobs[job.id] = job
                self.order.append(job.id)
                self.queue.append(job.id)
                created.append(job.to_dict())
        self._save_state()
        return created

    def cancel(self, job_id: str) -> bool:
        with self.lock:
            job = self.jobs.get(job_id)
            if job is None:
                return False
            if job.status == "queued":
                try:
                    self.queue.remove(job_id)
                except ValueError:
                    pass
                job.status = "canceled"
                job.finished_at = time.time()
                self._save_state()
                return True
            if job.status == "running":
                job.cancel_requested = True
                job.detail = "Đang hủy..."
                if self._proc is not None and self._proc_job_id == job_id:
                    self._kill_process_tree(self._proc)
                return True
        return False

    def remove_record(self, job_id: str, delete_files: bool = False) -> bool:
        with self.lock:
            job = self.jobs.get(job_id)
            if job is None or job.status in {"queued", "running"}:
                return False
            output_dir = job.output_dir
            del self.jobs[job_id]
            self.order.remove(job_id)
        if delete_files and output_dir:
            target = Path(output_dir).resolve()
            # Guard: only ever delete a per-video folder inside output_root.
            if (
                target.is_relative_to(self.output_root)
                and target != self.output_root
                and target.exists()
            ):
                shutil.rmtree(target, ignore_errors=True)
        self._save_state()
        return True

    def save_upload(self, filename: str, stream) -> Path:
        suffix = Path(filename).suffix.lower()
        if suffix not in cli.VIDEO_EXTENSIONS:
            raise ValueError(
                "Định dạng file không được hỗ trợ. Hãy chọn file video (mp4, mkv, mov...)."
            )
        stem = cli.slugify(Path(filename).stem)
        target = self.upload_dir / f"{stem}-{uuid.uuid4().hex[:6]}{suffix}"
        with target.open("wb") as handle:
            shutil.copyfileobj(stream, handle)
        return target

    # -------------------------------------------------------- frame review

    def list_frames(self, job: Job) -> dict:
        output_dir = Path(job.output_dir)
        frames_dir = output_dir / "frames"
        removed_dir = output_dir / "removed-frames"
        rows: dict[str, dict] = {}
        index_path = output_dir / "review-index.csv"
        if index_path.exists():
            import csv as csv_module

            with index_path.open(encoding="utf-8", newline="") as handle:
                for row in csv_module.DictReader(handle):
                    name = Path(row.get("image", "")).name
                    if name:
                        rows[name] = {
                            "transcript": row.get("transcript", ""),
                            "status": row.get("status", ""),
                            "warnings": row.get("warnings", ""),
                            "timestamp": row.get("timestamp", ""),
                        }

        def entry(path: Path, removed: bool) -> dict:
            meta = rows.get(path.name, {})
            return {
                "name": path.name,
                "removed": removed,
                "transcript": meta.get("transcript", ""),
                "status": meta.get("status", ""),
                "warnings": meta.get("warnings", ""),
                "timestamp": meta.get("timestamp", ""),
            }

        active = [entry(p, False) for p in sorted(frames_dir.glob("*.jpg"))]
        removed = (
            [entry(p, True) for p in sorted(removed_dir.glob("*.jpg"))]
            if removed_dir.exists()
            else []
        )
        return {"frames": active, "removed": removed}

    def move_frames(self, job: Job, names: list[str], restore: bool) -> int:
        output_dir = Path(job.output_dir)
        frames_dir = output_dir / "frames"
        removed_dir = output_dir / "removed-frames"
        removed_dir.mkdir(exist_ok=True)
        src_dir, dst_dir = (
            (removed_dir, frames_dir) if restore else (frames_dir, removed_dir)
        )
        moved = 0
        for name in names:
            if Path(name).name != name or not name.endswith(".jpg"):
                continue
            src = src_dir / name
            if src.is_file():
                shutil.move(str(src), str(dst_dir / name))
                moved += 1
        if moved:
            self.rebuild_pdf(job)
        return moved

    def rebuild_pdf(self, job: Job) -> None:
        output_dir = Path(job.output_dir)
        pdf_path = Path(job.pdf) if job.pdf else output_dir / f"{output_dir.name}.pdf"
        job.frame_count = cli.build_pdf(output_dir / "frames", pdf_path)
        job.pdf = str(pdf_path)
        self._save_state()

    # ------------------------------------------------------------ worker

    def _worker_loop(self) -> None:
        while True:
            job_id = None
            with self.lock:
                if self.queue:
                    job_id = self.queue.popleft()
            if job_id is None:
                time.sleep(0.5)
                continue
            job = self.jobs.get(job_id)
            if job is None or job.status != "queued":
                continue
            try:
                self._run_job(job)
            except Exception as exc:  # noqa: BLE001 - worker must survive any job error
                if job.cancel_requested:
                    job.status = "canceled"
                    job.detail = ""
                else:
                    job.status = "failed"
                    job.error = friendly_error(str(exc))
                job.finished_at = time.time()
            finally:
                self._save_state()

    def _cli_args(self, options: dict) -> SimpleNamespace:
        defaults = cli.build_parser().parse_args(["run", "placeholder"])
        args = SimpleNamespace(**vars(defaults))
        args.speed = "auto" if options.get("fast", True) else "quality"
        args.caption_mode = options.get("caption_mode", "off")
        args.keep_work = bool(options.get("keep_work", False))
        args.redownload = False
        args.cookies = None
        args.cookies_from_browser = options.get("cookies_browser") or None
        return args

    def _run_job(self, job: Job) -> None:
        job.status = "running"
        job.stage = "download"
        job.detail = ""
        args = self._cli_args(job.options)

        subtitle_path: Path | None = None
        if cli.is_url(job.source):
            job.detail = "Đang tải video từ YouTube..."
            videos = cli.download_youtube(job.source, args, self.cache_dir)
            video_path = videos[0]
            if args.speed == "auto":
                cli.download_youtube_captions(job.source, args, self.cache_dir)
                subtitle_path = cli.find_caption_for_video_path(video_path)
            job.title = video_path.stem
        else:
            video_path = Path(job.source)
            if not video_path.is_file():
                raise RuntimeError(f"File video không tồn tại: {video_path}")
            if args.speed == "auto":
                subtitle_path = cli.find_caption_for_video_path(video_path)

        if job.cancel_requested:
            raise RuntimeError("canceled")

        job.stage = "prepare"
        job.detail = ""
        duration = cli.video_duration(video_path)

        slug = cli.slugify(video_path.stem)
        output_dir = cli.unique_dir(self.output_root, slug)
        output_dir.mkdir(parents=True, exist_ok=True)
        work_dir = self.work_root / "engine" / output_dir.name
        work_dir.mkdir(parents=True, exist_ok=True)
        job.output_dir = str(output_dir)

        self._run_engine(job, args, video_path, output_dir, work_dir, duration, subtitle_path)

        if job.cancel_requested:
            raise RuntimeError("canceled")

        job.stage = "package"
        job.stage_progress = None
        job.detail = "Đang xuất MP3 và PDF..."
        mp3_path = output_dir / f"{output_dir.name}.mp3"
        pdf_path = output_dir / f"{output_dir.name}.pdf"
        cli.extract_mp3(video_path, mp3_path, args.audio_bitrate, 0.0, duration)
        job.frame_count = cli.build_pdf(output_dir / "frames", pdf_path)
        job.mp3 = str(mp3_path)
        job.pdf = str(pdf_path)

        manifest = {
            "source": job.source,
            "video_path": str(video_path),
            "output_dir": str(output_dir),
            "mp3_path": str(mp3_path),
            "pdf_path": str(pdf_path),
            "frame_count": job.frame_count,
            "status": "ok",
        }
        (output_dir / "manifest.json").write_text(
            json.dumps(manifest, indent=2), encoding="utf-8"
        )

        if not args.keep_work and work_dir.exists():
            shutil.rmtree(work_dir, ignore_errors=True)

        job.status = "done"
        job.stage = ""
        job.detail = ""
        job.finished_at = time.time()

    def _run_engine(
        self,
        job: Job,
        args: SimpleNamespace,
        video_path: Path,
        output_dir: Path,
        work_dir: Path,
        duration: float,
        subtitle_path: Path | None,
    ) -> None:
        cmd = [
            sys.executable,
            "-m",
            "storyframe_cli.local.engine",
            str(video_path),
            "--output-dir",
            str(output_dir),
            "--work-dir",
            str(work_dir),
            "--fps",
            str(args.fps),
            "--scan-mode",
            args.scan_mode,
            "--dense-fps",
            str(args.dense_fps),
            "--story-start",
            "0.000",
            "--story-end",
            f"{duration:.3f}",
            "--quality",
            args.quality,
            "--caption-mode",
            args.caption_mode,
            "--speed",
            args.speed,
            "--asr-backend",
            args.asr_backend,
            "--asr-model",
            args.asr_model,
            "--ocr-backend",
            args.ocr_backend,
            "--window-padding",
            str(args.window_padding),
            "--page-detection",
            args.page_detection,
            "--page-window-mode",
            args.page_window_mode,
            "--scene-threshold",
            str(args.scene_threshold),
            "--scene-min-len",
            str(args.scene_min_len),
        ]
        if args.speed == "auto":
            cmd += ["--cache-dir", str(self.work_root / "cache")]
        if subtitle_path is not None:
            cmd += ["--subtitle-path", str(subtitle_path)]

        env = dict(os.environ)
        env["PYTHONUNBUFFERED"] = "1"
        env["PYTHONUTF8"] = "1"
        env["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

        job.stage = "pages"
        job.detail = ""
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            env=env,
            creationflags=cli.no_window_creationflags(),
        )
        with self.lock:
            self._proc = proc
            self._proc_job_id = job.id
        try:
            assert proc.stdout is not None
            for raw_line in proc.stdout:
                line = raw_line.rstrip()
                if line:
                    job.log.append(line)
                    if len(job.log) > MAX_LOG_LINES:
                        del job.log[: len(job.log) - MAX_LOG_LINES]
                    self._parse_engine_line(job, line)
                if job.cancel_requested:
                    self._kill_process_tree(proc)
                    break
            proc.wait()
        finally:
            with self.lock:
                self._proc = None
                self._proc_job_id = None
        if job.cancel_requested:
            raise RuntimeError("canceled")
        if proc.returncode != 0:
            tail = "\n".join(job.log[-25:])
            raise RuntimeError(tail)

    def _parse_engine_line(self, job: Job, line: str) -> None:
        match = OCR_PROGRESS_RE.search(line)
        if match:
            done, total = int(match.group(1)), int(match.group(2))
            job.stage = "scan"
            job.stage_progress = done / total if total else None
            job.detail = f"Đã quét {done}/{total} khung hình"
            return
        if line.startswith("local: detecting scene"):
            job.stage = "pages"
            job.stage_progress = None
            job.detail = ""
        elif line.startswith("local: building transcript units"):
            job.stage = "listen"
            job.stage_progress = None
            job.detail = ""
        elif line.startswith("local: using subtitle transcript"):
            job.detail = "Dùng phụ đề YouTube (bỏ qua bước nghe)"
        elif line.startswith("local: refined_asr_units") or line.startswith(
            "local selected"
        ):
            job.stage = "select"
            job.stage_progress = None
            job.detail = ""
        elif line.startswith("local: caption-mode=force"):
            job.stage = "select"
            job.stage_progress = None
            job.detail = "Đang vẽ phụ đề lên khung hình"

    @staticmethod
    def _kill_process_tree(proc: subprocess.Popen) -> None:
        if sys.platform == "win32":
            subprocess.run(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                capture_output=True,
                creationflags=cli.no_window_creationflags(),
            )
        else:
            proc.terminate()
