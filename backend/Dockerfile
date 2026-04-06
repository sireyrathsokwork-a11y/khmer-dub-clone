FROM node:18-alpine

# Install system dependencies: ffmpeg, python3, nodejs (via apk) and yt-dlp (via pip).
# Installing nodejs via apk places the binary in standard system locations
# (e.g. /usr/bin/node) that yt-dlp can reliably discover as a JS runtime.
RUN apk add --no-cache ffmpeg python3 py3-pip nodejs \
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
