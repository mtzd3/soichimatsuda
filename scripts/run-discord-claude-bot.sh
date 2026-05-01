#!/bin/zsh

set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
cd /Users/so01/codex

exec node scripts/discord-claude-bot.mjs
