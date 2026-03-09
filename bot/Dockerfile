FROM python:3.12-slim
WORKDIR /app
RUN pip install --no-cache-dir python-telegram-bot==20.8 httpx python-dotenv
COPY bot_saas.py .
CMD ["python", "bot_saas.py"]
