#!/bin/sh
# The seal assembling, as the homepage's second arrival step (after the b0b.dev wordmark, before the films).
#
#   sh design/projection/build_seal_intro.sh          (from the repo root; needs numpy, Pillow, scipy, ffmpeg)
#
# Renders seal_anim.py 1.5x faster with the finished seal held 1.2 s (4.8 s), then cuts the centre 720 x 720
# square (the seal's 640 px box with its margin) so the seal fills a phone's width as well as a desktop's
# height, and writes, silent:
#   public/seal-intro.webm  VP9   (served first; Chromium without H.264 plays it)
#   public/seal-intro.mp4   H.264, +faststart
#   public/seal-intro.png   the last frame: the finished seal, shown still under prefers-reduced-motion
# public/, not site/: site/ is bundled into the 250 MB serverless function (CLAUDE.md, 19 Oct 2026).
set -e
FF=${FFMPEG:-ffmpeg}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
python3 design/projection/seal_anim.py "$TMP/seal.mp4" --speed 1.5 --hold 1.2
CROP="crop=720:720:280:0"
"$FF" -v error -y -i "$TMP/seal.mp4" -vf "$CROP" -an -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 \
  -deadline good -cpu-used 1 -pix_fmt yuv420p "$TMP/seal-intro.webm"
"$FF" -v error -y -i "$TMP/seal.mp4" -vf "$CROP" -an -c:v libx264 -crf 26 -preset slow -tune animation \
  -pix_fmt yuv420p -movflags +faststart "$TMP/seal-intro.mp4"
"$FF" -v error -y -sseof -0.05 -i "$TMP/seal.mp4" -vf "$CROP" -frames:v 1 "$TMP/last.png"
python3 -c "from PIL import Image; import sys; Image.open(sys.argv[1]).convert('RGB').quantize(24).save(sys.argv[2], optimize=True)" \
  "$TMP/last.png" "$TMP/seal-intro.png"
mv "$TMP/seal-intro.webm" "$TMP/seal-intro.mp4" "$TMP/seal-intro.png" public/
ls -l public/seal-intro.*
