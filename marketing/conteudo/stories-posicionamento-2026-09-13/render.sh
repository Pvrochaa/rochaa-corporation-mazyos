#!/usr/bin/env bash
# Renderiza cada .story do stories.html em PNG 1080x1920 com o Chrome headless.
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
DIR="$(cd "$(dirname "$0")" && pwd)"; WIN="C:${DIR#/c}"
mkdir -p "$DIR/instagram"
for i in 1 2 3 4; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1080,1920 --force-device-scale-factor=1 --allow-file-access-from-files \
    --virtual-time-budget=8000 --screenshot="$DIR/instagram/story-0$i.png" "file:///$WIN/stories.html?slide=$i" 2>/dev/null
done
ls "$DIR/instagram"
