#!/usr/bin/env bash
# Spawns a fresh ephemeral runner container after each job completes.
# Used as an alternative to docker-compose when you want more control.
#
# Usage: ./runner-loop.sh
# Env:   REPO_URL and GITHUB_TOKEN must be set (or copy .env.example → .env and source it)

set -euo pipefail

: "${REPO_URL:?REPO_URL is required}"
: "${GITHUB_TOKEN:?GITHUB_TOKEN is required}"

IMAGE="supabase-runner:latest"
LABELS="self-hosted,pi5"

echo "Starting ephemeral runner loop for ${REPO_URL}"

while true; do
  echo "[$(date -u +%FT%TZ)] Spawning runner..."
  docker run --rm \
    -e RUNNER_SCOPE=repo \
    -e REPO_URL="${REPO_URL}" \
    -e GITHUB_TOKEN="${GITHUB_TOKEN}" \
    -e LABELS="${LABELS}" \
    -e EPHEMERAL=true \
    -v /var/run/docker.sock:/var/run/docker.sock \
    "${IMAGE}"
  echo "[$(date -u +%FT%TZ)] Runner exited, respawning..."
done
