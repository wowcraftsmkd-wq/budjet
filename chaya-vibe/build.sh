#!/bin/sh
# ചായ വൈബ് — one-command build: events → score/foley mix → frames → mux (−14 LUFS)
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/chaya-vibe.mp4" 30 1
