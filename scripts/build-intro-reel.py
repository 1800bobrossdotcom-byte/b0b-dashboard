#!/usr/bin/env python3
"""Build site/intro-reel.mp4 — the b0b.dev intro film.

WHY THIS SCRIPT EXISTS RATHER THAN A CHECKED-IN VIDEO WITH NO PROVENANCE.
The film is cut from real world events, every shot of them public domain
or CC0, taken from archive.org items named in scripts/intro-reel.json with the
licence URL each item's own metadata carries. Running this script re-downloads
those masters, cuts the same frames and produces the same file, so the reel is
checkable the way a citation is checkable. A montage nobody can re-derive is
just an asset; this one is an exhibit with a source line.

WHAT IT DELIBERATELY DOES NOT DO: grade, retime, recolour, crop for drama, or
stabilise. Cut and scale, nothing else. Styling belongs to the overlay in
intro.js, where it sits over the footage instead of inside it.

Sources are large (the two government masters are ~276 MB each) and are cached
outside the repo. Pass --sources DIR to point at an existing cache.

Usage:
  python3 scripts/build-intro-reel.py [--sources DIR] [--dry-run]
"""
import argparse
import hashlib
import json
import os
import pathlib
import subprocess
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
SPEC = ROOT / 'scripts' / 'intro-reel.json'
UA = 'b0b.dev-research/1.0 (+https://www.b0b.dev/security.txt)'
DL = 'https://archive.org/download/{item}/{file}'


def ffmpeg() -> str:
    """Prefer a system ffmpeg; fall back to the one imageio-ffmpeg vendors."""
    for cand in ('ffmpeg',):
        try:
            subprocess.run([cand, '-version'], capture_output=True, check=True)
            return cand
        except Exception:
            pass
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit('no ffmpeg: install ffmpeg, or pip install imageio-ffmpeg')


def sha256(p: pathlib.Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def fetch(url: str, dest: pathlib.Path) -> None:
    if dest.exists() and dest.stat().st_size > 0:
        return
    print(f'  fetching {url}')
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    tmp = dest.with_suffix(dest.suffix + '.part')
    with urllib.request.urlopen(req, timeout=300) as r, tmp.open('wb') as out:
        while True:
            chunk = r.read(1 << 20)
            if not chunk:
                break
            out.write(chunk)
    tmp.rename(dest)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--sources', default=os.environ.get('B0B_INTRO_SOURCES', ''),
                    help='directory holding the downloaded archive masters')
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()

    spec = json.loads(SPEC.read_text(encoding='utf-8'))
    src_dir = pathlib.Path(args.sources) if args.sources else (ROOT.parent / '.b0b-intro-sources')
    src_dir.mkdir(parents=True, exist_ok=True)
    out = ROOT / spec['output']

    W, H, FPS, CRF = spec['width'], spec['height'], spec['fps'], spec['crf']

    A = spec.get('audio', {})
    fade = float(A.get('splice_fade', 0.09))
    ch = int(A.get('channels', 1))
    layout = 'mono' if ch == 1 else 'stereo'
    total_dur = sum(float(s['dur']) for s in spec['shots'])

    inputs, filters, labels = [], [], []
    hashed = {}
    for i, s in enumerate(spec['shots']):
        local = src_dir / f"{s['key']}{pathlib.Path(s['file']).suffix}"
        fetch(DL.format(item=s['item'], file=s['file']), local)
        if s['key'] not in hashed:
            hashed[s['key']] = sha256(local)
            print(f"  {s['key']:12s} {hashed[s['key']][:16]}…  {local.stat().st_size:>11,} bytes")
        s['sha256'] = hashed[s['key']]
        # -ss before -i seeks fast; -t after bounds the segment. Sources are a
        # mix of 640x480 and 320x240, so everything is brought to one raster and
        # one frame rate before the concat filter, which requires that.
        inputs += ['-ss', str(s['start']), '-t', str(s['dur']), '-i', str(local)]
        filters.append(
            f"[{i}:v]scale={W}:{H}:flags=lanczos,fps={FPS},"
            f"setsar=1,format=yuv420p[v{i}]"
        )
        # The film's own sound. Optical tracks and videotape forty years apart,
        # so each segment is brought to one rate and layout and faded at both
        # ends - without the fade every splice is an audible click, which reads
        # as a broken file rather than as a cut.
        d = float(s['dur'])
        filters.append(
            f"[{i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts={layout},"
            f"afade=t=in:st=0:d={fade},afade=t=out:st={d - fade:.3f}:d={fade}[a{i}]"
        )
        labels.append(f'[v{i}][a{i}]')

    n = len(spec['shots'])
    graph = (';'.join(filters) + ';' + ''.join(labels)
             + f'concat=n={n}:v=1:a=1[vout][araw];'
             # Level-matching across items is correction, not embellishment: a
             # 1945 optical track and a 1987 videotape are nowhere near each
             # other, and without it the film lurches loud and quiet.
             + f"[araw]loudnorm={A.get('loudnorm', 'I=-20:TP=-2:LRA=11')},"
             + 'aresample=48000,afade=t=in:st=0:d=0.4,'
             + f'afade=t=out:st={total_dur - 1.2:.3f}:d=1.2[aout]')

    cmd = [ffmpeg(), '-y', '-hide_banner', '-loglevel', 'error', *inputs,
           '-filter_complex', graph, '-map', '[vout]', '-map', '[aout]',
           '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
           '-crf', str(CRF), '-pix_fmt', 'yuv420p', '-g', str(FPS * 2),
           '-c:a', 'aac', '-b:a', A.get('bitrate_mp4', '64k'), '-ac', str(ch),
           '-movflags', '+faststart', str(out)]

    if args.dry_run:
        print(' '.join(cmd))
        return 0

    subprocess.run(cmd, check=True)
    size = out.stat().st_size

    # A VP9/WebM twin of the same cut. Two reasons, and the second one is the
    # better one: H.264 is a licensed codec, so a browser build without it -
    # Firefox on a Linux box with no system decoders, and every open-source
    # Chromium, including the one this repo verifies with - gets a black plate
    # from the MP4 alone. Shipping WebM covers those readers AND makes the reel
    # inspectable in a headless browser here, which is the only way anyone can
    # check that what plays is what the shot list says.
    webm = out.with_suffix('.webm')
    subprocess.run([ffmpeg(), '-y', '-hide_banner', '-loglevel', 'error', '-i', str(out),
                    '-c:v', 'libvpx-vp9', '-crf', str(CRF + 6), '-b:v', '0',
                    '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2',
                    '-pix_fmt', 'yuv420p', '-g', str(FPS * 2),
                    '-c:a', 'libopus', '-b:a', A.get('bitrate_webm', '48k'), '-ac', str(ch),
                    str(webm)], check=True)
    print(f'wrote {webm.relative_to(ROOT)}  {webm.stat().st_size:,} bytes')

    # Poster: the reel's own first frame. Without it the plate sits black until
    # the video decodes, which on a loader is the one thing you cannot afford.
    poster = ROOT / 'site' / 'intro-poster.jpg'
    subprocess.run([ffmpeg(), '-y', '-hide_banner', '-loglevel', 'error',
                    '-i', str(out), '-frames:v', '1', '-q:v', '6', str(poster)], check=True)
    print(f'wrote site/intro-poster.jpg  {poster.stat().st_size:,} bytes')
    total = sum(s['dur'] for s in spec['shots'])
    print(f'wrote {out.relative_to(ROOT)}  {size:,} bytes  {total:.2f}s  {len(spec["shots"])} shots')

    # Write the hashes back so the spec records exactly which bytes were cut.
    SPEC.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

    # Captions and narration go out as a small JS file so intro.js never
    # carries provenance or script inline, and picture, source line and voice
    # can never drift apart: all three come from the one spec.
    shots_js, t = [], 0.0
    for s in spec['shots']:
        shots_js.append({'at': round(t, 3), 'dur': s['dur'], 'ch': s['chapter'], 'cap': s['caption']})
        t += s['dur']
    chapters_js = []
    for c in spec['chapters']:
        mine = [x for x in shots_js if x['ch'] == c['id']]
        at = mine[0]['at'] if mine else round(t, 3)
        end = round(mine[-1]['at'] + mine[-1]['dur'], 3) if mine else None
        chapters_js.append({'id': c['id'], 'title': c['title'], 'year': c['year'],
                            'at': at, 'end': end, 'map': bool(c.get('map')),
                            'lines': c['lines']})
    js = ['/* GENERATED by scripts/build-intro-reel.py from scripts/intro-reel.json - do not edit.',
          ' * Source line per shot, chapters, and the narration script for the intro film.',
          ' * Every shot is public domain or CC0; the spec names each archive item. */',
          'window.B0B_INTRO_REEL=' + json.dumps(shots_js, ensure_ascii=False) + ';',
          'window.B0B_INTRO_CHAPTERS=' + json.dumps(chapters_js, ensure_ascii=False) + ';',
          'window.B0B_INTRO_REEL_DUR=%.3f;' % t]
    (ROOT / 'site' / 'intro-reel.js').write_text('\n'.join(js) + '\n', encoding='utf-8')
    print(f'wrote site/intro-reel.js  {len(shots_js)} shots, {len(chapters_js)} chapters')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
