#!/bin/bash
set -e

cd "$(dirname "$0")"

export NODE_ENV=${NODE_ENV:-production}
export SERVER_HOST=${SERVER_HOST:-0.0.0.0}
export SERVER_PORT=${PORT:-3000}

echo "Starting server on ${SERVER_HOST}:${SERVER_PORT}..."
node dist/server/main.js
