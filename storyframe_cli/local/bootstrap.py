from __future__ import annotations

import os
import sys
from pathlib import Path


def add_local_dependency_paths() -> None:
    raw_value = os.environ.get("STORYFRAME_LOCAL_DEPS_DIR", "")
    for raw_path in raw_value.split(os.pathsep):
        if not raw_path:
            continue
        candidate = Path(raw_path).expanduser()
        if candidate.exists():
            sys.path.insert(0, str(candidate))
