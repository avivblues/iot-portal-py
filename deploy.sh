#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

git pull origin main

docker compose up -d --build

curl http://localhost:4000/health
