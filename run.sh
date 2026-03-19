#!/bin/bash
# Runs the AI digest only when it's noon Eastern Time (handles DST automatically).
# Called every hour by cron.

ET_HOUR=$(TZ=America/New_York date +%H)
if [ "$ET_HOUR" != "12" ]; then
  exit 0
fi

# Prevent double-run on the same day
TODAY=$(TZ=America/New_York date +%Y-%m-%d)
LOCKFILE="/tmp/ai-digest-${TODAY}.lock"
if [ -f "$LOCKFILE" ]; then
  exit 0
fi
touch "$LOCKFILE"

# Run the digest
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# Use full node path (handles nvm / homebrew environments)
NODE_BIN=$(which node 2>/dev/null || echo "/usr/local/bin/node")

"$NODE_BIN" digest.js >> /tmp/ai-digest.log 2>&1
