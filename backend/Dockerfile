# Build stage
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# 파이썬 라이브러리 설치
# 트렌드 크롤링/정제 파이프라인 의존성까지 함께 설치합니다.
COPY requirements.txt requirements-trends.txt ./
RUN pip install --no-cache-dir -r requirements-trends.txt

# 트렌드 크롤링용 Playwright 브라우저 설치
RUN python -m playwright install --with-deps chromium

# Copy project
COPY . .

# Create storage directory for media files
RUN chmod +x /app/docker-entrypoint.sh

# 미디어 파일 및 AI 처리 결과를 저장할 디렉토리 생성
RUN mkdir -p storage/captures storage/processed storage/synthetic

# Expose port
EXPOSE 8000

# Start Gunicorn
# 스케줄러(선택)와 Gunicorn 서버 실행
# mirrai_project 폴더 안의 wsgi.py를 실행 파일로 지정합니다.
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "mirrai_project.wsgi:application"]
