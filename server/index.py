"""Vercel Python runtime entrypoint for the MathSTEP FastAPI application."""

from mathstep.main import app

__all__ = ["app"]
