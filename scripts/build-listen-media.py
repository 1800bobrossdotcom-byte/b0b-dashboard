#!/usr/bin/env python3
"""Export licence-checked imagery and short archive clips for listen mode.

Sources: the three film specs (intro, Continuity, the Epstein-Maxwell Record)
and, when present, the listen-mode sourcing manifest (items fetched for the
slideshow alone). Output: a 1024px JPEG per still, a short muted clip (WebM +
MP4, 640x360) for each moment a film used from an archive film, and a manifest
at site/listen-media.js. Every entry carries the source tag the film burned into
its frame, licence and credit included, and the slideshow prints it.

WHAT DECIDES WHEN A PICTURE IS SHOWN: scripts/listen-media-keys.json. An item
with no entry there is not exported. The slideshow shows a picture only when one
of its trigger phrases, or its subject's name, is in the line being read. There
is no filler pool: a line with no matching picture gets a graphic made from its
own words. (The first version drew "ambient" pictures from a section's pool, and
the loose words it matched on - Bank, Washington, Article, Reading - put wrong
pictures under the narration.)

Clips start at the in-points the films chose. Those moments were picked by hand
under the living-person floor (the Iran-Contra tape, for one, is used only for
the wide of the room and the late chairman), so the slideshow inherits that
vetting instead of choosing new frames from the same reels.

Face lists come from the sourcing manifests (session scratchpad; set
B0B_LISTEN_MANIFESTS). ERC-1155 frames with identifiable people are excluded.

    python3 scripts/build-listen-media.py [--no-clips]
"""
import hashlib
import json
import os
import re
import subprocess
import sys
from io import BytesIO

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'site', 'img', 'listen')
CLIP_DIR = os.path.join(OUT_DIR, 'clips')
OUT_JS = os.path.join(ROOT, 'site', 'listen-media.js')
KEYS = os.path.join(ROOT, 'scripts', 'listen-media-keys.json')
SCR = os.environ.get('B0B_LISTEN_MANIFESTS', '/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad')

FILMS = [('intro', 'scripts/intro-collage.json', 'intro-v2-media.json'),
         ('continuity', 'scripts/film-continuity.json', 'film2-media.json'),
         ('em', 'scripts/film-epstein-maxwell.json', 'film3-media.json')]
EXTRA = 'listen-media-sourcing.json'          # items sourced for the slideshow itself
ERC_WITH_FACES = {'erc_fs_0-rRKsy4', 'erc_8VbssmVYakg', 'erc_OiYL9z3bXEI',
                  # identifiable people in the frame (a cinema audience, an actor, a man on a street)
                  'erc_YlMeyAAWhwE', 'erc_vCeDEZtRY9s', 'erc_VP2iLdUcI1c'}
MAX_CLIPS = 3
# clips dropped on review of their frames: unnamed people close to camera (ivy_1, the Nevada observers at the
# end of nevada_0, a profile in suez_2) and a travelogue intertitle that reads as commentary (bank_of_england_0)
SKIP_CLIPS = {'ivy_1', 'L_nevada_test_site_ranger_busterjangle_doe_1951_0', 'L_suez_canal_universal_1956_2',
              'L_bank_of_england_seeing_london_c1920_0'}
CLIP_LEN = 3.6


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return 'ffmpeg'


FF = ffmpeg()


def frame(src, at):
    raw = subprocess.run([FF, '-v', 'error', '-ss', '%.2f' % at, '-i', src, '-frames:v', '1',
                          '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
    return Image.open(BytesIO(raw)).convert('RGB') if raw else None


def cut_clip(src, at, dur, base):
    """Two muted 640x360 encodes of one moment; skipped if both already exist."""
    vf = 'scale=640:360:force_original_aspect_ratio=increase,crop=640:360,fps=25,format=yuv420p'
    webm, mp4 = base + '.webm', base + '.mp4'
    frames = str(int(dur * 25))                 # an exact frame cap: -t alone let one source run 0.5 s long
    if not os.path.exists(webm):
        subprocess.run([FF, '-v', 'error', '-y', '-ss', '%.2f' % at, '-t', '%.2f' % dur, '-i', src, '-an', '-vf', vf,
                        '-frames:v', frames, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '42', '-row-mt', '1', '-deadline', 'good',
                        '-cpu-used', '4', webm], check=True)
    if not os.path.exists(mp4):
        subprocess.run([FF, '-v', 'error', '-y', '-ss', '%.2f' % at, '-t', '%.2f' % dur, '-i', src, '-an', '-vf', vf,
                        '-frames:v', frames, '-c:v', 'libx264', '-preset', 'slow', '-crf', '30', '-profile:v', 'main',
                        '-movflags', '+faststart', mp4], check=True)
    return webm, mp4


def rel(p):
    return '/' + os.path.relpath(p, os.path.join(ROOT, 'site')).replace(os.sep, '/')


def main():
    no_clips = '--no-clips' in sys.argv
    os.makedirs(CLIP_DIR, exist_ok=True)
    keys = {k: v for k, v in json.load(open(KEYS, encoding='utf-8')).items() if not k.startswith('_')}
    entries, seen, faces_of = [], set(), {}

    def add(k, src_path, kind, tag, uses, faces, film, erc=False):
        out_name = re.sub(r'[^A-Za-z0-9_\-]', '_', k)
        out_path = os.path.join(OUT_DIR, out_name + '.jpg')
        at0 = (uses[0][0] + min(1.0, uses[0][1] / 2)) if (kind == 'video' and uses) else 0
        im = frame(src_path, at0) if kind == 'video' else Image.open(src_path).convert('RGB')
        if im is None:
            print('\n  no frame:', k); return
        im.thumbnail((1024, 1024), Image.LANCZOS)
        im.save(out_path, 'JPEG', quality=76, optimize=True, progressive=True)
        cur = keys.get(k, {})
        e = {'k': k, 'src': rel(out_path), 'w': im.width, 'h': im.height, 'tag': tag,
             'faces': faces, 'names': cur.get('names', []), 'match': cur.get('match', []),
             'not': cur.get('not', []), 'film': film, 'erc': erc}
        if cur.get('cooldown'):
            e['cool'] = cur['cooldown']
        if kind == 'video' and uses and not no_clips:
            clips = []
            for n, (t, dur) in enumerate(uses[:MAX_CLIPS]):
                # never longer than the vetted window: a film's own shot, or the sourcing pass's
                # face-checked in-point. Running past it reaches footage nobody checked.
                length = min(CLIP_LEN, dur - 0.1)
                if length < 1.2:
                    continue
                if '%s_%d' % (out_name, n) in SKIP_CLIPS:
                    continue
                base = os.path.join(CLIP_DIR, '%s_%d' % (out_name, n))
                webm, mp4 = cut_clip(src_path, t, length, base)
                clips.append({'webm': rel(webm), 'mp4': rel(mp4)})
            if clips:
                e['clips'] = clips
        entries.append(e)
        sys.stdout.write('\r  %d items' % len(entries)); sys.stdout.flush()

    for film, spec_path, man_name in FILMS:
        spec = json.load(open(os.path.join(ROOT, spec_path), encoding='utf-8'))
        media_dir = spec['media_dir']
        man = {}
        try:
            for it in json.load(open(os.path.join(SCR, man_name), encoding='utf-8'))['items']:
                man[os.path.splitext(it['file'])[0]] = it
        except FileNotFoundError:
            sys.exit('sourcing manifest missing: %s (set B0B_LISTEN_MANIFESTS)' % os.path.join(SCR, man_name))
        uses = {}
        for p in spec['parts']:
            for sh in p['shots']:
                for i, k in enumerate(sh.get('media', [])):
                    t = sh.get('t')
                    t = t[i] if isinstance(t, list) and i < len(t) else t
                    m = spec['media'][k]
                    t = t if t is not None else m.get('in', 0) or 0
                    u = uses.setdefault(k, [])
                    if all(abs(t - x[0]) > 2 for x in u):
                        u.append((t, sh['dur']))
        for k, m in spec['media'].items():
            if k in seen or k not in uses or k in ERC_WITH_FACES:
                continue
            erc = k.startswith('erc_')
            if not erc and k not in keys:
                continue
            seen.add(k)
            it = man.get(k, {})
            faces = ['*'] if (it.get('faces') or m['kind'] == 'video' and k in ('nuremberg', 'huac', 'cuba', 'peacemarch', 'irancontra')) else []
            add(k, os.path.join(media_dir, m['file']), m['kind'], m['tag'], uses[k], faces, film, erc)

    # items sourced for the slideshow itself (optional)
    try:
        extra = json.load(open(os.path.join(SCR, EXTRA), encoding='utf-8'))
    except FileNotFoundError:
        extra = None
    if extra:
        for it in extra['items']:
            k = 'L_' + re.sub(r'[^A-Za-z0-9_\-]', '_', os.path.splitext(it['file'])[0])
            if k in seen or k not in keys:
                continue
            seen.add(k)
            ins = [(a, b) for a, b in (it.get('inpoints') or [])]
            faces = ['*'] if it.get('faces') else []
            add(k, os.path.join(extra['dir'], it['file']), it['kind'], it['tag'], ins or [(0, 4)], faces, 'listen')

    print()
    js = ('/* generated by scripts/build-listen-media.py from the film specs and scripts/listen-media-keys.json - do not edit */\n'
          'window.B0B_LISTEN_MEDIA=%s;\n' % json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
    open(OUT_JS, 'w', encoding='utf-8').write(js)
    size = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT_DIR) for f in fs)
    print('wrote %d items (%d with clips, %d clips), %.1f MB on disk, %s' % (
        len(entries), sum(1 for e in entries if e.get('clips')), sum(len(e.get('clips', [])) for e in entries),
        size / 1e6, os.path.relpath(OUT_JS, ROOT)))
    missing = [k for k in keys if k not in seen]
    if missing:
        print('  curated but not found in any source:', ', '.join(missing))


if __name__ == '__main__':
    main()
