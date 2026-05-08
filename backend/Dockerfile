FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Install dependencies only first (layer cache friendly)
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-install-project --no-dev

# Copy application and install the project into the venv
COPY . .
RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# fastapi[standard] ships uvicorn; expects a FastAPI instance named `app` in main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
