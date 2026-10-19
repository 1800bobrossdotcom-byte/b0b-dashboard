#!/usr/bin/env python3
"""Build the landing film's web files from the author's video(s).

    python3 scripts/build-landing-film.py SRC1.mp4 [SRC2.mp4 ...]

Writes site/omcomma-N.mp4 and site/omcomma-N.webm for each source, in order, which is what
report.html's #b0b-landing (data-videos="/omcomma-1,/omcomma-2") plays after the animated mark.

The MP4 is a stream copy with the index moved to the front (+faststart): the picture and sound are
bit-identical to the source, and the script proves it by comparing decoded-stream MD5s. The WebM is
a VP9/Opus transcode for browsers without H.264, in constrained quality capped at 650 kbps - about the
source's own video rate; uncapped, the collage's cuts and overlays made VP9 larger than the source.
Nothing is cut, trimmed, blurred or re-timed - the author's instruction was to keep the video
exactly as it is.

Needs an ffmpeg with libx264/libvpx-vp9/libopus: `pip install imageio-ffmpeg` provides one.
"""
import hashlib
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return 'ffmpeg'


def stream_md5(ff, path):
    out = subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-i', path, '-map', '0', '-f', 'md5', '-'],
                         capture_output=True, text=True, check=True)
    return out.stdout.strip()


def sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def main(srcs):
    ff = ffmpeg()
    for n, src in enumerate(srcs, 1):
        mp4 = os.path.join(SITE, 'omcomma-%d.mp4' % n)
        webm = os.path.join(SITE, 'omcomma-%d.webm' % n)
        subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-map', '0', '-c', 'copy',
                        '-movflags', '+faststart', mp4], check=True)
        if stream_md5(ff, src) != stream_md5(ff, mp4):
            sys.exit('build-landing-film: %s does not decode identically to %s' % (mp4, src))
        subprocess.run([ff, '-hide_banner', '-loglevel', 'error', '-y', '-i', mp4,
                        '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '650k', '-row-mt', '1', '-deadline', 'good',
                        '-cpu-used', '4', '-pix_fmt', 'yuv420p', '-c:a', 'libopus', '-b:a', '128k', webm], check=True)
        print('omcomma-%d  source sha256 %s' % (n, sha256(src)))
        print('            mp4 %8.1f MB (bit-identical streams)  webm %8.1f MB' %
              (os.path.getsize(mp4) / 1e6, os.path.getsize(webm) / 1e6))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
