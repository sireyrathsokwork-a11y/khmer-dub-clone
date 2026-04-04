FROM node:18-alpine

# Install system dependencies: ffmpeg (via apk) and yt-dlp (via pip)
RUN apk add --no-cache ffmpeg python3 py3-pip \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY src/ ./src/

# Create temp directory for downloaded audio/video files
RUN mkdir -p temp

EXPOSE 3001

CMD ["node", "src/index.js"]
