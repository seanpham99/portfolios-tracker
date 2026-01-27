# Migrate data-pipeline to uv

## Goal

Migrate `services/data-pipeline` from `pip` to `uv` for faster and more reliable dependency management.

## Tasks

- [x] Initialize `uv` project in `services/data-pipeline` → Verify: `pyproject.toml` exists
- [x] Convert `requirements.txt` to `pyproject.toml` dependencies → Verify: `pyproject.toml` contains all dependencies from `requirements.txt`
- [x] Create and sync virtual environment with `uv` → Verify: `.venv` created/updated and `uv.lock` exists
- [x] Update `Dockerfile` to use `uv` for package installation → Verify: `docker build` succeeds (optional manual check or assume standard pattern)
- [x] Update documentation or scripts if they reference `pip install` (checked `run_tests.sh`, no direct `pip` calls there) → Verify: No `pip install -r requirements.txt` remains in codebase
- [x] Verify setup by running tests using `uv run` or within the synced environment → Verify: `./run_tests.sh` passes

## Done When

- `pyproject.toml` and `uv.lock` are present in `services/data-pipeline`.
- `requirements.txt` is removed (or kept as legacy if requested, but usually removed).
- `Dockerfile` uses `uv`.
- Tests pass.
