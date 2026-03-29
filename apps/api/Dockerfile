FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/apps/api:/app/packages/agents/src

COPY packages/agents /app/packages/agents
COPY apps/api /app/apps/api

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -e /app/packages/agents -e /app/apps/api

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
