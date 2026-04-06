#!/bin/sh
set -e

if [ -n "$YOUTUBE_COOKIES" ]; then
  echo "$YOUTUBE_COOKIES" > /app/config/cookies.txt
  echo "[startup] cookies.txt written from environment variable"
else
  echo "[startup] WARNING: YOUTUBE_COOKIES env var not set — downloads will fail"
fi

exec node src/index.js
