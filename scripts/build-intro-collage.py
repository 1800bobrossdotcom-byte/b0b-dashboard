#!/usr/bin/env python3
"""Build the b0b.dev intro film, collage cut (v3), from scripts/intro-collage.json.

The narration is baked in (Piper, en_GB cori, public-domain training data) and a
second, subtitled master is written in the same pass for the downloadable file.

Every frame is composed here, in numpy and Pillow, and piped to ffmpeg: split
screens (then | now), face grids, pushes on stills, the part cards, the source
tag burned into every panel. Picture and source line cannot drift apart because
they are drawn in the same frame.

Sound: the archive films' own sound where a film clip is on screen, a bed that
is synthesised here (drone, a tick on every cut, a low hit on every part card),
nothing licensed from anyone. The narration is not in the file - the reader's
browser speaks it (site/intro.js) - and this script writes the script for it
into site/intro-reel.js with the part timings, so voice and picture share one
source of truth.

    python3 scripts/build-intro-collage.py            # full build
    python3 scripts/build-intro-collage.py --js-only  # timings/script only
    python3 scripts/build-intro-collage.py --still 12.5 --out /tmp/f.png

Media live outside the repo (MEDIA_DIR); each entry in the spec carries its
source page, licence and sha256 so a missing file can be re-fetched and checked.
"""
import argparse, hashlib, json, math, os, random, subprocess, sys, wave

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, 'scripts', 'intro-collage.json')
FONTS = os.path.join(ROOT, 'site', 'fonts')
SR = 48000

AMBER = (255, 204, 0)
CYAN = (0, 204, 255)
INK = (5, 5, 5)
PAPER = (232, 228, 216)


def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return 'ffmpeg'


FF = ffmpeg_exe()


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def ease(x):
    x = max(0.0, min(1.0, x))
    return x * x * (3 - 2 * x)


# ----------------------------------------------------------------- media ----
class Media:
    def __init__(self, key, m, media_dir):
        self.key = key
        self.m = m
        self.path = os.path.join(media_dir, m['file'])
        self.kind = m['kind']
        self.tag = m['tag']
        self._img = None

    def check(self):
        if not os.path.exists(self.path):
            sys.exit('missing media %s: %s (source: %s)' % (self.key, self.path, self.m.get('source_page')))
        want = self.m.get('sha256')
        if want:
            h = hashlib.sha256(open(self.path, 'rb').read()).hexdigest()
            if h != want:
                sys.exit('sha256 mismatch for %s: %s' % (self.key, self.path))

    def image(self):
        if self._img is None:
            im = Image.open(self.path)
            im.load()
            self._img = im.convert('RGB')
        return self._img


def cover_box(sw, sh, w, h, zoom=1.0, fx=0.5, fy=0.5):
    """Crop box on a sw x sh source that fills w x h, zoomed and centred on fx,fy."""
    scale = max(w / sw, h / sh) * zoom
    cw, ch = w / scale, h / scale
    x = (sw - cw) * fx
    y = (sh - ch) * fy
    x = max(0, min(sw - cw, x))
    y = max(0, min(sh - ch, y))
    return (x, y, x + cw, y + ch)


def video_frames(med, t0, dur, w, h, fps):
    """Decode dur seconds from t0, scaled to cover w x h, as a list of arrays."""
    n = max(1, int(round(dur * fps)))
    vf = ('scale=%d:%d:force_original_aspect_ratio=increase,crop=%d:%d,fps=%d'
          % (w, h, w, h, fps))
    cmd = [FF, '-v', 'error', '-ss', '%.3f' % t0, '-i', med.path, '-t', '%.3f' % (dur + 0.5),
           '-vf', vf, '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    fs = len(raw) // (w * h * 3)
    arr = np.frombuffer(raw[:fs * w * h * 3], dtype=np.uint8).reshape(fs, h, w, 3)
    if fs == 0:
        sys.exit('no frames decoded from %s at %.2f' % (med.path, t0))
    out = [arr[min(i, fs - 1)] for i in range(n)]
    return out


def audio_clip(med, t0, dur):
    cmd = [FF, '-v', 'error', '-ss', '%.3f' % t0, '-i', med.path, '-t', '%.3f' % dur,
           '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-']
    r = subprocess.run(cmd, capture_output=True)
    a = np.frombuffer(r.stdout, dtype=np.float32).copy()
    return a


# --------------------------------------------------------------- drawing ----
class Painter:
    def __init__(self, W, H):
        self.W, self.H = W, H
        self.f_tag = font('ibm-plex-mono-latin-500-normal.woff2', max(11, H // 52))
        self.f_year = font('ibm-plex-mono-latin-600-normal.woff2', H // 12)
        self.f_roman = font('ibm-plex-mono-latin-600-normal.woff2', H // 4)
        self.f_title = font('ibm-plex-mono-latin-500-normal.woff2', H // 13)
        self.f_small = font('ibm-plex-mono-latin-500-normal.woff2', H // 22)
        self.f_word = font('ibm-plex-serif-latin-600-normal.woff2', H // 7)

    def tag(self, img, x, y, text, anchor='ls'):
        d = ImageDraw.Draw(img)
        text = text.upper()
        bb = d.textbbox((0, 0), text, font=self.f_tag)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        pad = 5
        dot = th
        if anchor == 'ls':
            bx0, by1 = x, y
        else:  # right-aligned
            bx0, by1 = x - tw - 2 * pad - dot - 4, y
        box = (bx0, by1 - th - 2 * pad, bx0 + tw + 2 * pad + dot + 4, by1)
        ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.rectangle(box, fill=(5, 5, 5, 170))
        img.paste(Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB'))
        d = ImageDraw.Draw(img)
        cy = (box[1] + box[3]) // 2
        d.ellipse((box[0] + pad, cy - dot // 4, box[0] + pad + dot // 2, cy + dot // 4), fill=CYAN)
        d.text((box[0] + pad + dot // 2 + 6, box[3] - pad - bb[3]), text, font=self.f_tag, fill=(220, 232, 236))

    def year(self, img, x, y, text, color=AMBER, anchor='lt'):
        d = ImageDraw.Draw(img)
        bb = d.textbbox((x, y), text, font=self.f_year, anchor=anchor)
        ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
        ImageDraw.Draw(ov).rectangle((bb[0] - 10, bb[1] - 8, bb[2] + 10, bb[3] + 8), fill=(5, 5, 5, 185))
        img.paste(Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB'))
        d = ImageDraw.Draw(img)
        d.text((x, y), text, font=self.f_year, fill=color, anchor=anchor)


def still_panel(med, w, h, p, motion):
    im = med.image()
    z0, z1, fx0, fx1, fy0, fy1 = 1.0, 1.12, 0.5, 0.5, 0.45, 0.45
    fx = med.m.get('focus', [0.5, 0.42])
    fy0 = fy1 = fx[1]
    fx0 = fx1 = fx[0]
    if motion == 'pull':
        z0, z1 = 1.14, 1.0
    elif motion == 'pan-l':
        z0 = z1 = 1.18; fx0, fx1 = 0.7, 0.3
    elif motion == 'pan-r':
        z0 = z1 = 1.18; fx0, fx1 = 0.3, 0.7
    elif motion == 'hold':
        z0 = z1 = 1.02
    elif motion == 'slam':
        z0, z1 = 1.35, 1.06
    e = ease(p) if motion != 'slam' else 1 - (1 - min(1, p * 3)) ** 3
    z = z0 + (z1 - z0) * e
    box = cover_box(im.width, im.height, w, h, z, fx0 + (fx1 - fx0) * e, fy0 + (fy1 - fy0) * e)
    return np.asarray(im.resize((w, h), Image.BILINEAR, box=box))


def glitch(arr, k, rng):
    """RGB split plus horizontal slice displacement; k in 0..1."""
    if k <= 0:
        return arr
    h, w, _ = arr.shape
    out = arr.copy()
    s = int(4 + 22 * k)
    out[:, :, 0] = np.roll(arr[:, :, 0], s, axis=1)
    out[:, :, 2] = np.roll(arr[:, :, 2], -s, axis=1)
    for _ in range(int(3 + 7 * k)):
        y = rng.randrange(0, h - 8)
        hh = rng.randrange(4, max(5, int(h * 0.08)))
        dx = rng.randrange(-int(60 * k) - 1, int(60 * k) + 1)
        out[y:y + hh] = np.roll(out[y:y + hh], dx, axis=1)
    return out



# ------------------------------------------------------------ narration ----
# Baked into the file since 23 Sept 2026: the author asked for the narration
# in the video, so the film is the same everywhere and can be downloaded whole.
# The voice is Piper's en_GB "cori" model, trained on LibriVox recordings
# (public domain, per its model card). Lines are cached by content hash.
LEAD, GAP, TAIL = 0.35, 0.45, 0.7
GREEK_FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'

_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
         'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen']
_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']


def number_words(n):
    """British reading of an integer below a million: 1174 -> one thousand, one hundred and seventy-four."""
    def under100(x):
        return _ONES[x] if x < 20 else _TENS[x // 10] + ('' if x % 10 == 0 else '-' + _ONES[x % 10])

    def under1000(x):
        h, r = divmod(x, 100)
        if not h:
            return under100(r)
        return _ONES[h] + ' hundred' + (' and ' + under100(r) if r else '')
    th, r = divmod(n, 1000)
    if not th:
        return under1000(r)
    out = under1000(th) + ' thousand'
    if r:
        out += (', ' if r >= 100 else ' and ') + under1000(r)
    return out


def fill(text, total):
    return (text.replace('{TOTAL}', '{:,}'.format(total))
                .replace('{TOTALWORDS}', number_words(total)[0].upper() + number_words(total)[1:]))


def read_total():
    s = open(os.path.join(ROOT, 'site', 'intro-points.js'), encoding='utf-8').read()
    import re
    return int(re.search(r'B0B_INTRO_TOTAL=(\d+)', s).group(1))


def read_points():
    s = open(os.path.join(ROOT, 'site', 'intro-points.js'), encoding='utf-8').read()
    import re
    return json.loads(re.search(r'B0B_INTRO_POINTS=(\[.*?\]);', s, re.S).group(1))


class Narrator:
    def __init__(self, spec, media_dir):
        v = spec['voice']
        self.model = os.path.join(media_dir, v['model'])
        self.ls = v.get('length_scale', 1.0)
        self.cache = os.path.join(media_dir, 'voice', 'cache')
        os.makedirs(self.cache, exist_ok=True)
        self.voice = None
        want = v.get('sha256')
        if want and hashlib.sha256(open(self.model, 'rb').read()).hexdigest() != want:
            sys.exit('voice model sha256 mismatch: ' + self.model)
        self.key = (want or '') + str(self.ls)

    def _synth(self, seg):
        if self.voice is None:
            from piper import PiperVoice
            self.voice = PiperVoice.load(self.model)
        from piper import SynthesisConfig
        chunks = self.voice.synthesize(seg, syn_config=SynthesisConfig(length_scale=self.ls))
        a = np.concatenate([np.frombuffer(c.audio_int16_bytes, dtype=np.int16) for c in chunks]).astype(np.float32) / 32768
        sr = self.voice.config.sample_rate
        on = np.where(np.abs(a) > 0.008)[0]
        if len(on):
            pad = int(0.04 * sr)
            a = a[max(0, on[0] - pad): on[-1] + pad]
        # to 48 kHz through ffmpeg's resampler, not linear interpolation
        r = subprocess.run([FF, '-v', 'error', '-f', 'f32le', '-ar', str(sr), '-ac', '1', '-i', '-',
                            '-ar', str(SR), '-f', 'f32le', '-'], input=a.tobytes(), capture_output=True, check=True)
        return np.frombuffer(r.stdout, dtype=np.float32).copy()

    def line(self, say):
        segs = say if isinstance(say, list) else [say]
        h = hashlib.sha1((self.key + '\x00' + '\x01'.join(segs)).encode('utf-8')).hexdigest()
        p = os.path.join(self.cache, h + '.npy')
        if os.path.exists(p):
            return np.load(p)
        parts = []
        for i, seg in enumerate(segs):
            if i:
                parts.append(np.zeros(int(0.5 * SR), dtype=np.float32))
            parts.append(self._synth(seg))
        a = np.concatenate(parts)
        rms = float(np.sqrt(np.mean(a ** 2))) or 1.0
        a = (a / rms * 0.11).astype(np.float32)
        np.save(p, a)
        return a


def layout(spec, media_dir):
    """Synthesise every line, then size each part to its reading: a part whose
    narration runs longer than its picture has its shots stretched evenly (the
    flashes keep their length). Returns the spec with the finale appended."""
    total = read_total()
    nar = Narrator(spec, media_dir)
    parts = [dict(p, shots=[dict(s) for s in p['shots']]) for p in spec['parts']]
    fin = spec['finale']
    parts.append({'id': fin['id'], 'title': fin['title'], 'years': fin.get('years', ['1945', fin['year']]),
                  'lines': fin['lines'], 'card': 1.4, 'finale': True,
                  'shots': [{'type': 'finale', 'dur': 1.0, 'sound': False}]})
    for p in parts:
        p['_audio'] = []
        for L in p['lines']:
            say = L.get('say') or L['text']
            say = [fill(x, total) for x in say] if isinstance(say, list) else fill(say, total)
            p['_audio'].append(nar.line(say))
        durs = [len(a) / SR for a in p['_audio']]
        read = sum(durs) + GAP * (len(durs) - 1)
        card = p.get('card', 1.4)
        if p.get('finale'):
            p['shots'][0]['dur'] = round(0.5 + read + 3.2, 3)
            continue
        need = LEAD + read + TAIL
        pic = card + sum(s['dur'] for s in p['shots'])
        if need > pic:
            flashes = sum(s['dur'] for s in p['shots'] if s['type'] == 'flash')
            body = sum(s['dur'] for s in p['shots'] if s['type'] != 'flash')
            k = (need - card - flashes) / body
            for s in p['shots']:
                if s['type'] != 'flash':
                    s['dur'] = round(s['dur'] * k, 3)
    out = dict(spec, parts=parts)
    out['_total'] = total
    return out


# --------------------------------------------------------------- the cut ----
class Film:
    def __init__(self, spec, media_dir):
        self.spec = spec
        self.W, self.H, self.fps = spec['width'], spec['height'], spec['fps']
        self.media = {k: Media(k, v, media_dir) for k, v in spec['media'].items()}
        self.P = Painter(self.W, self.H)
        self.rng = random.Random(1945)
        self._strips = {}
        self.narr = []
        # flatten parts into a timeline
        self.timeline = []
        t = 0.0
        self.parts = []
        for part in spec['parts']:
            start = t
            shots = [{'type': 'card', 'dur': part.get('card', 1.4), 'part': part}] + part['shots']
            for sh in shots:
                sh = dict(sh)
                sh['at'] = t
                sh['part'] = part
                self.timeline.append(sh)
                t += sh['dur']
            # narration: absolute time of every line
            lt = start + (part.get('card', 1.4) + 0.5 if part.get('finale') else LEAD)
            lines = []
            for L, a in zip(part['lines'], part.get('_audio', [])):
                d = len(a) / SR
                lines.append(dict(L, at=round(lt, 3), end=round(lt + d, 3)))
                self.narr.append((lt, a))
                lt += d + GAP
            self.parts.append({'id': part['id'], 'title': part['title'], 'years': part['years'],
                               'at': round(start, 3), 'end': round(t, 3), 'lines': lines or part['lines'],
                               'finale': part.get('finale', False)})
        self.dur = t
        self.subs = [(L['at'], L['end'], L['text']) for p in self.parts for L in p['lines'] if 'at' in L]
        self.total = spec.get('_total', 0)
        self.pts = read_points()
        fin = [p for p in self.parts if p.get('finale')]
        self.greek_at = fin[0]['lines'][-1]['at'] if fin and 'at' in fin[0]['lines'][-1] else None

    # --- per-shot frame source, cached across the frames of one shot
    def prepare(self, sh):
        sh['_src'] = []
        for i, key in enumerate(sh.get('media', [])):
            med = self.media[key]
            if med.kind == 'video':
                w, h = self.panel_size(sh, i)
                t0 = sh.get('t', [med.m.get('in', 0)] * 9)[i] if isinstance(sh.get('t'), list) else sh.get('t', med.m.get('in', 0))
                sh['_src'].append(('v', video_frames(med, t0, sh['dur'], w, h, self.fps)))
            else:
                sh['_src'].append(('s', med))

    def release(self, sh):
        sh.pop('_src', None)

    def panel_size(self, sh, i):
        W, H = self.W, self.H
        ty = sh['type']
        if ty == 'split':
            return (W // 2, H)
        if ty == 'grid':
            c, r = sh.get('cols', 3), sh.get('rows', 2)
            return (W // c, H // r)
        if ty == 'inset':
            return (W, H) if i == 0 else (int(W * 0.34), int(H * 0.34))
        return (W, H)

    def panel(self, sh, i, p, fi):
        kind, src = sh['_src'][i]
        w, h = self.panel_size(sh, i)
        if kind == 'v':
            return src[min(fi, len(src) - 1)]
        motions = sh.get('motion', 'push')
        motion = motions[i] if isinstance(motions, list) else motions
        return still_panel(src, w, h, p, motion)

    def frame(self, sh, fi):
        W, H = self.W, self.H
        n = max(1, int(round(sh['dur'] * self.fps)))
        p = fi / max(1, n - 1)
        ty = sh['type']
        canvas = np.zeros((H, W, 3), dtype=np.uint8)
        canvas[:] = INK
        tags = []
        if ty == 'card':
            img = self.card(sh['part'], p, sh['dur'])
            return np.asarray(img)
        if ty == 'finale':
            return np.asarray(self.finale(sh, fi))
        if ty in ('full', 'flash'):
            canvas[:] = self.panel(sh, 0, p, fi)
            tags.append((16, H - 16, self.media[sh['media'][0]].tag, 'ls'))
        elif ty == 'split':
            a = self.panel(sh, 0, p, fi)
            b = self.panel(sh, 1, p, fi)
            # the right panel wipes in over the first fifth of the shot
            reveal = ease(min(1, p * 5)) if sh.get('wipe', True) else 1
            canvas[:, :W // 2] = a
            xw = int(W // 2 + (W // 2) * (1 - reveal))
            canvas[:, xw:] = b[:, : W - xw]
            canvas[:, W // 2 - 1:W // 2 + 1] = AMBER if reveal >= 1 else canvas[:, W // 2 - 1:W // 2 + 1]
            tags.append((16, H - 16, self.media[sh['media'][0]].tag, 'ls'))
            if reveal > 0.6:
                tags.append((W // 2 + 16, H - 16, self.media[sh['media'][1]].tag, 'ls'))
        elif ty == 'grid':
            c, r = sh.get('cols', 3), sh.get('rows', 2)
            pw, ph = W // c, H // r
            k = len(sh['media'])
            for i in range(k):
                appear = i / (k + 1) * sh.get('stagger', 0.7)
                if p < appear:
                    continue
                pp = (p - appear) / max(1e-6, 1 - appear)
                cell = self.panel(sh, i, pp, fi)
                x, y = (i % c) * pw, (i // c) * ph
                canvas[y:y + ph, x:x + pw] = cell
                canvas[y:y + ph, x:x + 1] = INK
                canvas[y:y + 1, x:x + pw] = INK
            for i in range(k):
                appear = i / (k + 1) * sh.get('stagger', 0.7)
                if p >= appear + 0.05:
                    x, y = (i % c) * pw, (i // c) * ph
                    tags.append((x + 10, y + ph - 10, self.media[sh['media'][i]].tag, 'ls'))
        elif ty == 'inset':
            canvas[:] = self.panel(sh, 0, p, fi)
            iw, ih = self.panel_size(sh, 1)
            reveal = ease(min(1, p * 4))
            x = W - iw - 28
            y = int(28 + (1 - reveal) * -ih - 0)
            if reveal > 0:
                small = self.panel(sh, 1, p, fi)
                y = max(0, y)
                canvas[y:y + ih, x:x + iw] = small[: min(ih, H - y)]
                canvas[y:y + ih, x - 2:x] = AMBER
                canvas[y:y + ih, x + iw:x + iw + 2] = AMBER
                canvas[y - 2 if y >= 2 else 0:y, x - 2:x + iw + 2] = AMBER
                canvas[y + ih:y + ih + 2, x - 2:x + iw + 2] = AMBER
                tags.append((x + iw, y + ih + 26, self.media[sh['media'][1]].tag, 'rs'))
            tags.append((16, H - 16, self.media[sh['media'][0]].tag, 'ls'))
        img = Image.fromarray(canvas)
        for (x, y, t, a) in tags:
            self.P.tag(img, x, y, t, a)
        for (txt, pos) in self.years(sh, p):
            self.P.year(img, pos[0], pos[1], txt, anchor=pos[2])
        arr = np.asarray(img)
        # cut glitch: first frames of shots marked glitch, and every flash
        g = 0.0
        if sh.get('glitch') and fi < 3:
            g = (3 - fi) / 3
        if ty == 'flash':
            g = max(g, 0.55)
        if g:
            arr = glitch(arr, g, self.rng)
        return arr


    def finale(self, sh, fi):
        """The ledger: the map's own markers arrive, then the closing word."""
        W, H, P = self.W, self.H, self.P
        tl = fi / self.fps
        ta = sh['at'] + tl
        img = Image.new('RGB', (W, H), INK)
        d = ImageDraw.Draw(img)
        sweep = 2.6
        prog = min(1.0, tl / sweep)
        n = len(self.pts)
        upto = int((1 - (1 - prog) ** 2) * n)
        s = min(W * 0.92 / 1024, H * 0.86 / 512)
        ox, oy = (W - 1024 * s) / 2, (H - 512 * s) / 2 + 10
        for i in range(upto):
            x, y = ox + self.pts[i][0] * s, oy + self.pts[i][1] * s
            age = (upto - i) / max(1, n * 0.06)
            flare = max(0.0, 1 - age) if prog < 1 else 0.0
            r = 1.8 + flare * 2.6
            col = (255, 246, 213) if flare > 0.25 else AMBER
            d.ellipse((x - r, y - r, x + r, y + r), fill=col)
        if prog < 1 and upto:
            lx = ox + self.pts[min(upto, n - 1)][0] * s
            d.rectangle((lx, oy, lx + 1, oy + 512 * s), fill=(0, 140, 180))
        if prog >= 1:
            k = min(1.0, (tl - sweep) / 0.8)
            col = tuple(int(c * k) for c in AMBER)
            d.text((34, 40), '{:,} DOCUMENTED SITES'.format(self.total), font=P.f_small, fill=col, anchor='lt')
            d.text((34, 40 + int(H * 0.06)), 'TWENTY-FIVE SECTIONS', font=P.f_small, fill=tuple(int(c * k) for c in (150, 160, 162)), anchor='lt')
        P.tag(img, 16, H - 16, 'B0B.DEV/MAP · THE SITE’S OWN {:,} MARKERS'.format(self.total), 'ls')
        # the closing word, cross-faded in as she says it
        if self.greek_at is not None and ta >= self.greek_at - 0.4:
            k = min(1.0, (ta - (self.greek_at - 0.4)) / 0.6)
            card = Image.new('RGB', (W, H), INK)
            c = ImageDraw.Draw(card)
            gf = ImageFont.truetype(GREEK_FONT, int(H / 6.5))
            c.text((W // 2, int(H * 0.44)), 'τετέλεσται', font=gf, fill=(244, 240, 230), anchor='mm')
            c.text((W // 2, int(H * 0.60)), 'IT HAS BEEN COMPLETED, AND REMAINS SO', font=P.f_small, fill=AMBER, anchor='mm')
            c.text((W // 2, H - 40), 'b0b.dev', font=P.f_title, fill=(255, 255, 255), anchor='ms')
            img = Image.blend(img, card, k)
        return img

    def subtitle(self, arr, t):
        """Burn the line being spoken into a copy of the frame (download edition)."""
        txt = None
        if self.greek_at is not None and t >= self.greek_at - 0.4:
            return arr   # the closing card carries its own words
        for a, b, x in self.subs:
            if a - 0.05 <= t < b + 0.35:
                txt = fill(x, self.total)
                break
        if not txt:
            return arr
        W, H = self.W, self.H
        img = Image.fromarray(arr)
        greek = any('Ͱ' <= ch <= 'Ͽ' for ch in txt)
        f = ImageFont.truetype(GREEK_FONT, H // 27) if greek else font('ibm-plex-serif-latin-400-normal.woff2', H // 25)
        d = ImageDraw.Draw(img)
        words, lines, cur = txt.split(), [], ''
        for w in words:
            trial = (cur + ' ' + w).strip()
            if d.textlength(trial, font=f) > W * 0.74 and cur:
                lines.append(cur); cur = w
            else:
                cur = trial
        lines.append(cur)
        lh = int(H / 25 * 1.45)
        y1 = H - int(H * 0.085)
        ov = Image.new('RGBA', img.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        for i, ln in enumerate(lines):
            y = y1 - (len(lines) - 1 - i) * lh
            tw = d.textlength(ln, font=f)
            od.rectangle((W / 2 - tw / 2 - 12, y - lh + 6, W / 2 + tw / 2 + 12, y + 8), fill=(5, 5, 5, 175))
        img = Image.alpha_composite(img.convert('RGBA'), ov).convert('RGB')
        d = ImageDraw.Draw(img)
        for i, ln in enumerate(lines):
            y = y1 - (len(lines) - 1 - i) * lh
            d.text((W / 2, y), ln, font=f, fill=(244, 240, 230), anchor='ms')
        return np.asarray(img)

    def years(self, sh, p):
        out = []
        W, H = self.W, self.H
        ys = sh.get('years')
        if not ys:
            return out
        if sh['type'] == 'split':
            out.append((ys[0], (30, 28, 'lt')))
            if len(ys) > 1 and p > 0.18:
                out.append((ys[1], (W // 2 + 30, 28, 'lt')))
        else:
            out.append((ys[0], (30, 28, 'lt')))
        return out

    def strip(self, part):
        """Thumbnails of the part's own footage, for the filmstrip on its card."""
        key = part['id']
        if key in self._strips:
            return self._strips[key]
        tw, th = self.W // 7, self.H // 7
        thumbs = []
        for sh in part['shots']:
            for k in sh.get('media', [])[:1]:
                med = self.media[k]
                if med.kind == 'video':
                    t0 = sh['t'][0] if isinstance(sh.get('t'), list) and sh['t'][0] is not None else med.m.get('in', 0)
                    fr = video_frames(med, t0 + sh['dur'] / 2, 0.05, tw, th, self.fps)[0]
                    im = Image.fromarray(fr)
                else:
                    src = med.image()
                    im = src.resize((tw, th), Image.BILINEAR, box=cover_box(src.width, src.height, tw, th))
                thumbs.append(im.convert('L').convert('RGB'))
        self._strips[key] = thumbs
        return thumbs

    def card(self, part, p, dur):
        W, H = self.W, self.H
        img = Image.new('RGB', (W, H), INK)
        P = self.P
        # the part's footage runs past underneath, dimmed, as a filmstrip
        thumbs = self.strip(part)
        if thumbs:
            tw, th = thumbs[0].size
            gap = 8
            y = int(H * 0.68)
            x0 = int(W * 0.05 - p * (tw + gap) * 2.2)
            k = 0
            x = x0
            while x < W:
                im = thumbs[k % len(thumbs)]
                img.paste(Image.eval(im, lambda v: int(v * 0.42)), (x, y))
                x += tw + gap
                k += 1
            d = ImageDraw.Draw(img)
            for xx in range(0, W, 18):
                d.rectangle((xx, y - 14, xx + 8, y - 8), fill=(26, 26, 26))
                d.rectangle((xx, y + th + 8, xx + 8, y + th + 14), fill=(26, 26, 26))
        d = ImageDraw.Draw(img)
        # a scan bar sweeps once; the numeral lands, the rule draws, the title types, the years tick
        sweep = ease(min(1, p * 1.6))
        d.rectangle((0, int(H * sweep) - 2, W, int(H * sweep)), fill=(0, 60, 76))
        land = ease(min(1, p * 4))
        rx = int(W * 0.07)
        ry = int(H * 0.44 + (1 - land) * 30)
        col = tuple(int(c * land) for c in AMBER)
        d.text((rx, ry), part['id'], font=P.f_roman, fill=col, anchor='ls')
        rb = d.textbbox((rx, ry), part['id'], font=P.f_roman, anchor='ls')
        tx = rb[2] + int(W * 0.03)
        rule = ease(min(1, max(0, p - 0.05) * 3))
        d.rectangle((tx, ry - int(H * 0.115), tx + int(W * 0.5 * rule), ry - int(H * 0.115) + 2), fill=AMBER)
        title = part['title'].upper()
        n = int(len(title) * ease(min(1, max(0, p - 0.12) * 3)))
        d.text((tx, ry - int(H * 0.10)), title[:n], font=P.f_title, fill=(255, 255, 255), anchor='lt')
        y0, y1 = part['years']
        tick = ease(min(1, max(0, p - 0.3) * 2.2))
        try:
            a, b = int(y0), int(y1)
            yr = str(int(round(a + (b - a) * tick)))
        except ValueError:
            yr = y1 if tick > 0.5 else y0
        yy = ry + int(H * 0.035)
        d.text((tx, yy), y0, font=P.f_small, fill=(150, 160, 162), anchor='ls')
        bb = d.textbbox((tx, yy), y0, font=P.f_small, anchor='ls')
        # an arrow, drawn: the face has no arrow glyph
        ax0, ax1, ay = bb[2] + 18, bb[2] + 64, (bb[1] + bb[3]) // 2
        d.line((ax0, ay, ax1, ay), fill=(150, 160, 162), width=2)
        d.polygon([(ax1, ay), (ax1 - 9, ay - 6), (ax1 - 9, ay + 6)], fill=(150, 160, 162))
        d.text((ax1 + 18, yy), yr, font=P.f_small, fill=CYAN, anchor='ls')
        # registration corners
        L = 18
        for (x, y, sx, sy) in ((14, 14, 1, 1), (W - 14, 14, -1, 1), (14, H - 14, 1, -1), (W - 14, H - 14, -1, -1)):
            d.line((x, y, x + sx * L, y), fill=(120, 100, 20), width=1)
            d.line((x, y, x, y + sy * L), fill=(120, 100, 20), width=1)
        d.text((W - 16, H - 14), 'b0b.dev', font=P.f_tag, fill=(90, 96, 98), anchor='rs')
        return img

    # ----------------------------------------------------------- audio ----
    def audio(self):
        n = int(math.ceil(self.dur * SR)) + SR
        mix = np.zeros(n, dtype=np.float32)
        t = np.arange(n) / SR
        # drone: A1 and E2, a slow swell, a little filtered noise - the room tone
        lfo = 0.55 + 0.45 * np.sin(2 * np.pi * t / 11.0)
        bed = (0.11 * np.sin(2 * np.pi * 55 * t) + 0.06 * np.sin(2 * np.pi * 82.41 * t)
               + 0.035 * np.sin(2 * np.pi * 110 * t + 0.4 * np.sin(2 * np.pi * 0.2 * t)))
        noise = np.random.default_rng(7).standard_normal(n).astype(np.float32)
        k = int(SR / 400)
        noise = np.convolve(noise, np.ones(k) / k, mode='same') * 0.05
        mix += (bed + noise) * lfo
        for sh in self.timeline:
            i0 = int(sh['at'] * SR)
            if sh['type'] == 'card':
                # a low hit: 90 Hz falling to 38 Hz over 0.9 s
                m = int(0.9 * SR)
                tt = np.arange(m) / SR
                f = 38 + 52 * np.exp(-tt * 5)
                ph = 2 * np.pi * np.cumsum(f) / SR
                mix[i0:i0 + m] += (0.55 * np.sin(ph) * np.exp(-tt * 3.2)).astype(np.float32)[: n - i0]
            else:
                # a tick on the cut
                m = int(0.018 * SR)
                tt = np.arange(m) / SR
                tick = np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 260) * 0.22
                mix[i0:i0 + m] += tick.astype(np.float32)[: n - i0]
            # the archive film's own sound, where a film is on screen
            if sh.get('sound', True):
                for j, key in enumerate(sh.get('media', [])):
                    med = self.media[key]
                    if med.kind != 'video' or not med.m.get('sound', True):
                        continue
                    t0 = sh['t'][j] if isinstance(sh.get('t'), list) else sh.get('t', med.m.get('in', 0))
                    a = audio_clip(med, t0, sh['dur'])
                    if not len(a):
                        continue
                    rms = float(np.sqrt(np.mean(a ** 2))) or 1.0
                    a = a / rms * 0.09
                    f = min(len(a), int(0.03 * SR))
                    if f:
                        a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
                    mix[i0:i0 + len(a)] += a[: n - i0]
                    break
        bed = np.tanh(mix * 1.1) * 0.8
        # the voice on top; everything else steps back while she speaks
        voice = np.zeros(n, dtype=np.float32)
        pres = np.zeros(n, dtype=np.float32)
        for at, a in self.narr:
            i0 = int(at * SR)
            m = min(len(a), n - i0)
            voice[i0:i0 + m] += a[:m]
            pres[max(0, i0 - int(0.12 * SR)):i0 + m + int(0.2 * SR)] = 1
        k = int(0.15 * SR)
        pres = np.convolve(pres, np.ones(k) / k, mode='same')
        mix = bed * (1 - 0.72 * pres) + voice * 1.6
        return np.clip(mix, -1, 1)[: int(self.dur * SR)]


def write_wav(path, a):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype('<i2').tobytes())


def write_js(film, spec, path):
    reel = []
    for sh in film.timeline:
        if sh['type'] == 'card':
            cap = '%s. %s' % (sh['part']['id'], sh['part']['title'])
        elif sh['type'] == 'finale':
            cap = '{:,} markers \u00b7 b0b.dev/map'.format(film.total)
        else:
            cap = ' | '.join(film.media[k].tag for k in sh.get('media', []))
        reel.append({'at': round(sh['at'], 3), 'dur': round(sh['dur'], 3), 'cap': cap})
    chapters = []
    for p in film.parts:
        lines = [{k: v for k, v in L.items() if k in ('text', 'at', 'end')} for L in p['lines']]
        chapters.append({'id': p['id'], 'title': p['title'], 'year': p['years'][1], 'at': p['at'],
                         'end': p['end'], 'map': False, 'lines': lines})
    js = ('/* generated by scripts/build-intro-collage.py from scripts/intro-collage.json - edit there */\n'
          'window.B0B_INTRO_STYLE="collage";\n'
          'window.B0B_INTRO_BAKED=true;\n'
          'window.B0B_INTRO_REEL=%s;\n'
          'window.B0B_INTRO_CHAPTERS=%s;\n'
          'window.B0B_INTRO_REEL_DUR=%s;\n'
          % (json.dumps(reel, ensure_ascii=False), json.dumps(chapters, ensure_ascii=False), round(film.dur, 3)))
    open(path, 'w', encoding='utf-8').write(js)
    print('wrote %s (%d shots, %.1f s of film)' % (path, len(reel), film.dur))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--js-only', action='store_true')
    ap.add_argument('--still', type=float)
    ap.add_argument('--sheet', action='store_true', help='contact sheet: one frame per shot')
    ap.add_argument('--out')
    ap.add_argument('--download-only', action='store_true', help='rebuild only the subtitled download file')
    args = ap.parse_args()
    spec = json.load(open(SPEC, encoding='utf-8'))
    media_dir = os.path.expanduser(os.environ.get('B0B_MEDIA_DIR', spec['media_dir']))
    spec = layout(spec, media_dir)
    film = Film(spec, media_dir)
    for m in film.media.values():
        m.check()
    js_path = os.path.join(ROOT, spec['js'])
    if args.js_only:
        write_js(film, spec, js_path)
        return
    if args.still is not None or args.sheet:
        targets = []
        if args.sheet:
            targets = [(sh, int(round(sh['dur'] * film.fps * 0.6))) for sh in film.timeline]
        else:
            for sh in film.timeline:
                if sh['at'] <= args.still < sh['at'] + sh['dur']:
                    targets = [(sh, int((args.still - sh['at']) * film.fps))]
        frames = []
        for sh, fi in targets:
            film.prepare(sh)
            frames.append(Image.fromarray(film.frame(sh, fi)))
            film.release(sh)
        if args.sheet:
            cw, chh = 320, 180
            cols = 6
            rows = (len(frames) + cols - 1) // cols
            sheet = Image.new('RGB', (cw * cols, chh * rows), (20, 20, 20))
            for i, f in enumerate(frames):
                sheet.paste(f.resize((cw, chh)), ((i % cols) * cw, (i // cols) * chh))
            sheet.save(args.out or '/tmp/sheet.jpg', quality=85)
        else:
            frames[0].save(args.out or '/tmp/frame.png')
        return

    W, H, fps = film.W, film.H, film.fps
    out_mp4 = os.path.join(ROOT, spec['output'])
    out_webm = out_mp4[:-4] + '.webm'
    tmp = os.path.join(media_dir, '_build')
    os.makedirs(tmp, exist_ok=True)
    wav = os.path.join(tmp, 'mix.wav')
    write_wav(wav, film.audio())
    master = os.path.join(tmp, 'master.mkv')
    master_dl = os.path.join(tmp, 'master-subtitled.mkv')

    def encoder(path):
        return subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H),
                                 '-r', str(fps), '-i', '-', '-c:v', 'ffv1', '-level', '3', path], stdin=subprocess.PIPE)
    enc = None if args.download_only else encoder(master)
    enc_dl = encoder(master_dl)
    total = 0
    for sh in film.timeline:
        film.prepare(sh)
        # frame count from the running clock, so rounding never drifts the cut off the voice
        n = max(1, int(round((sh['at'] + sh['dur']) * fps)) - int(round(sh['at'] * fps)))
        for fi in range(n):
            arr = np.ascontiguousarray(film.frame(sh, fi))
            if enc:
                enc.stdin.write(arr.tobytes())
            enc_dl.stdin.write(np.ascontiguousarray(film.subtitle(arr, sh['at'] + fi / fps)).tobytes())
        total += n
        film.release(sh)
        sys.stdout.write('\r  %d frames (%.0f%%)' % (total, 100 * total / (film.dur * fps)))
        sys.stdout.flush()
    for e in (enc, enc_dl):
        if e:
            e.stdin.close(); e.wait()
    print()
    a = spec['audio']
    if not args.download_only:
      subprocess.run([FF, '-v', 'error', '-y', '-i', master, '-i', wav,
                      '-c:v', 'libx264', '-preset', 'slow', '-crf', str(spec['crf_mp4']), '-pix_fmt', 'yuv420p',
                      '-profile:v', 'high', '-movflags', '+faststart',
                      '-af', 'loudnorm=' + a['loudnorm'], '-c:a', 'aac', '-b:a', a['bitrate_mp4'], '-ac', '1',
                      '-shortest', out_mp4], check=True)
      subprocess.run([FF, '-v', 'error', '-y', '-i', master, '-i', wav,
                      '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', str(spec['crf_webm']), '-row-mt', '1', '-deadline', 'good',
                      '-cpu-used', '4', '-pix_fmt', 'yuv420p',
                      '-af', 'loudnorm=' + a['loudnorm'], '-c:a', 'libopus', '-b:a', a['bitrate_webm'], '-ac', '1',
                      '-shortest', out_webm], check=True)
    out_dl = os.path.join(ROOT, spec['download'])
    subprocess.run([FF, '-v', 'error', '-y', '-i', master_dl, '-i', wav,
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', str(spec.get('crf_download', 26)), '-pix_fmt', 'yuv420p',
                    '-profile:v', 'high', '-movflags', '+faststart',
                    '-af', 'loudnorm=' + a['loudnorm'], '-c:a', 'aac', '-b:a', '96k', '-ac', '1',
                    '-metadata', 'title=b0b.dev - the intro film', '-metadata', 'comment=Every panel cites its source. Full list: https://www.b0b.dev/intro',
                    '-shortest', out_dl], check=True)
    if args.download_only:
        print('  %-40s %8.1f KB' % (os.path.relpath(out_dl, ROOT), os.path.getsize(out_dl) / 1024))
        return
    poster = os.path.join(ROOT, spec['poster'])
    subprocess.run([FF, '-v', 'error', '-y', '-ss', str(spec.get('poster_at', 3)), '-i', master, '-frames:v', '1',
                    '-q:v', '4', poster], check=True)
    for f in (out_mp4, out_webm, out_dl, poster):
        print('  %-40s %8.1f KB' % (os.path.relpath(f, ROOT), os.path.getsize(f) / 1024))
    write_js(film, spec, js_path)


if __name__ == '__main__':
    main()
