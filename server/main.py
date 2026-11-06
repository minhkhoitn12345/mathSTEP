"""MathSTEP ASGI main entrypoint for FastAPI."""
import sys
from pathlib import Path

# Đảm bảo thư mục server nằm trong sys.path để import mathstep.*
_server_dir = str(Path(__file__).parent.resolve())
if _server_dir not in sys.path:
    sys.path.insert(0, _server_dir)

from mathstep.main import app

__all__ = ["app"]
