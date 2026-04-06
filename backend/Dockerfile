FROM node:18-alpine

# Install system dependencies: ffmpeg (via apk) and yt-dlp (via pip)
# Symlink the node binary into /usr/bin so yt-dlp can discover it as a
# JS runtime regardless of how PATH is set in child processes.
RUN apk add --no-cache ffmpeg python3 py3-pip \
    && pip3 install --no-cache-dir --break-system-packages yt-dlp \
    && ln -sf /usr/local/bin/node /usr/bin/node \
    && ln -sf /usr/local/bin/node /usr/bin/nodejs

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
