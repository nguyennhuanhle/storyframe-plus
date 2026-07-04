from __future__ import annotations

import threading
import webbrowser
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .jobs import JobManager

STATIC_DIR = Path(__file__).parent / "static"


class NewJobRequest(BaseModel):
    source: str
    caption_mode: str = "off"
    fast: bool = True
    keep_work: bool = False
    cookies_browser: str = ""


class FrameActionRequest(BaseModel):
    names: list[str]


def create_app(output_root: Path) -> FastAPI:
    manager = JobManager(output_root)
    app = FastAPI(title="Storyframe", docs_url=None, redoc_url=None)
    app.state.manager = manager

    def require_job(job_id: str):
        job = manager.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy công việc này.")
        return job

    @app.get("/api/system")
    def system() -> dict:
        return manager.system_status()

    @app.get("/api/jobs")
    def list_jobs() -> list[dict]:
        return manager.list_jobs()

    @app.post("/api/jobs")
    def create_job(request: NewJobRequest) -> list[dict]:
        source = request.source.strip().strip('"')
        if not source:
            raise HTTPException(
                status_code=400, detail="Hãy dán link YouTube hoặc chọn file video."
            )
        if request.caption_mode not in {"off", "auto", "force"}:
            raise HTTPException(status_code=400, detail="Chế độ phụ đề không hợp lệ.")
        options = {
            "caption_mode": request.caption_mode,
            "fast": request.fast,
            "keep_work": request.keep_work,
            "cookies_browser": request.cookies_browser.strip(),
        }
        try:
            return manager.submit(source, options)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/api/jobs/{job_id}")
    def job_detail(job_id: str) -> dict:
        return require_job(job_id).to_dict(include_log=True)

    @app.post("/api/jobs/{job_id}/cancel")
    def cancel_job(job_id: str) -> dict:
        require_job(job_id)
        if not manager.cancel(job_id):
            raise HTTPException(status_code=409, detail="Không thể hủy công việc này.")
        return {"ok": True}

    @app.post("/api/jobs/{job_id}/retry")
    def retry_job(job_id: str) -> list[dict]:
        job = require_job(job_id)
        if job.status in {"queued", "running"}:
            raise HTTPException(status_code=409, detail="Công việc vẫn đang chạy.")
        return manager.submit(job.source, job.options)

    @app.delete("/api/jobs/{job_id}")
    def delete_job(job_id: str, purge: bool = False) -> dict:
        require_job(job_id)
        if not manager.remove_record(job_id, delete_files=purge):
            raise HTTPException(
                status_code=409, detail="Không thể xóa khi công việc đang chạy."
            )
        return {"ok": True}

    @app.get("/api/jobs/{job_id}/frames")
    def job_frames(job_id: str) -> dict:
        job = require_job(job_id)
        if not job.output_dir:
            return {"frames": [], "removed": []}
        return manager.list_frames(job)

    @app.post("/api/jobs/{job_id}/frames/remove")
    def remove_frames(job_id: str, request: FrameActionRequest) -> dict:
        job = require_job(job_id)
        moved = manager.move_frames(job, request.names, restore=False)
        return {"moved": moved, "frame_count": job.frame_count}

    @app.post("/api/jobs/{job_id}/frames/restore")
    def restore_frames(job_id: str, request: FrameActionRequest) -> dict:
        job = require_job(job_id)
        moved = manager.move_frames(job, request.names, restore=True)
        return {"moved": moved, "frame_count": job.frame_count}

    @app.get("/api/jobs/{job_id}/thumb")
    def job_thumb(job_id: str):
        job = require_job(job_id)
        if job.output_dir:
            frames = sorted(Path(job.output_dir, "frames").glob("*.jpg"))
            if frames:
                return FileResponse(frames[0])
        raise HTTPException(status_code=404, detail="Chưa có ảnh.")

    @app.get("/api/jobs/{job_id}/file/{relpath:path}")
    def job_file(job_id: str, relpath: str):
        job = require_job(job_id)
        if not job.output_dir:
            raise HTTPException(status_code=404, detail="Chưa có kết quả.")
        base = Path(job.output_dir).resolve()
        target = (base / relpath).resolve()
        if not target.is_relative_to(base) or not target.is_file():
            raise HTTPException(status_code=404, detail="Không tìm thấy file.")
        return FileResponse(target)

    @app.post("/api/upload")
    def upload(file: UploadFile = File(...)) -> dict:
        try:
            saved = manager.save_upload(file.filename or "video.mp4", file.file)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {"path": str(saved), "name": saved.name}

    @app.get("/")
    def index():
        return FileResponse(STATIC_DIR / "index.html")

    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
    return app


def serve(
    host: str = "127.0.0.1",
    port: int = 8765,
    output_root: Path | None = None,
    open_browser: bool = True,
) -> None:
    import uvicorn

    root = output_root or (Path.cwd() / "outputs" / "storyframe-runs")
    app = create_app(root)
    url = f"http://{host}:{port}"
    print(f"Storyframe GUI: {url}")
    if open_browser:
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    uvicorn.run(app, host=host, port=port, log_level="warning")
