# Stage 1: Builder
FROM python:3.12-slim-bookworm AS builder

# Copy the uv binary from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set environment variables to optimize uv installation
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies without the application code
RUN uv sync --frozen --no-install-project --no-dev

# Copy the application code and sync again to include the project
COPY main.py /app/
RUN uv sync --frozen --no-dev

# Stage 2: Runtime
FROM python:3.12-slim-bookworm

WORKDIR /app

# Create a non-root user and group for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy the pre-built virtual environment and application code from the builder
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/main.py /app/main.py

# Transfer ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Switch to the non-root user
USER appuser

# Put the virtual environment in the PATH
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Start the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]