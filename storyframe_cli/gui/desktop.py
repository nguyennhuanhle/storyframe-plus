"""Desktop entry point: run the GUI inside a native window (pywebview).

This is used by the packaged installer/portable build. It starts the same
FastAPI app the ``storyframe gui`` command serves, but hosts it in an app window
instead of a browser tab. It does not change any CLI or server behavior.
"""
from __future__ import annotations

import socket
import threading
import time
from pathlib import Path

import uvicorn

from .server import create_app


def default_output_root() -> Path:
    """Store outputs under Documents so PDFs/MP3s are easy for users to find."""
    home = Path.home()
    documents = home / "Documents"
    base = documents if documents.exists() else home
    return base / "Storyframe"


def _free_port(preferred: int = 8765) -> int:
    for port in (preferred, 8766, 8767, 8768, 0):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind(("127.0.0.1", port))
                return sock.getsockname()[1]
            except OSError:
                continue
    return preferred


def _wait_until_up(port: int, timeout: float = 40.0) -> bool:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            if sock.connect_ex(("127.0.0.1", port)) == 0:
                return True
        time.sleep(0.2)
    return False


def main() -> None:
    import webview  # lazy import so the 'desktop' extra is only needed here

    output_root = default_output_root()
    output_root.mkdir(parents=True, exist_ok=True)

    app = create_app(output_root)
    port = _free_port()
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning")
    server = uvicorn.Server(config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    _wait_until_up(port)

    webview.create_window(
        "Storyframe",
        f"http://127.0.0.1:{port}/",
        width=1200,
        height=900,
        min_size=(900, 680),
    )
    try:
        webview.start()
    finally:
        server.should_exit = True


if __name__ == "__main__":
    main()
