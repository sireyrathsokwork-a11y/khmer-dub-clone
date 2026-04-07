FROM node:18-alpine

RUN apk add --no-cache ffmpeg python3 py3-pip nodejs \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

# Create directories
RUN mkdir -p temp config

EXPOSE 3001

# Use a startup script instead of running node directly
CMD ["sh", "src/start.sh"]