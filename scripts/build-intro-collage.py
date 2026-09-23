#!/usr/bin/env python3
"""Build the b0b.dev intro film, collage cut (v3), from scripts/intro-collage.json.

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
        self.f_year = font('ibm-plex-mono-latin-600-normal.woff2', H // 9)
        self.f_roman = font('ibm-plex-mono-latin-600-normal.woff2', H // 4)
        self.f_title = font('ibm-plex-mono-latin-500-normal.woff2', H // 20)
        self.f_small = font('ibm-plex-mono-latin-400-normal.woff2', H // 36)
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
        d.text((x + 2, y + 2), text, font=self.f_year, fill=(0, 0, 0), anchor=anchor)
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


# --------------------------------------------------------------- the cut ----
class Film:
    def __init__(self, spec, media_dir):
        self.spec = spec
        self.W, self.H, self.fps = spec['width'], spec['height'], spec['fps']
        self.media = {k: Media(k, v, media_dir) for k, v in spec['media'].items()}
        self.P = Painter(self.W, self.H)
        self.rng = random.Random(1945)
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
            self.parts.append({'id': part['id'], 'title': part['title'], 'years': part['years'],
                               'at': round(start, 3), 'end': round(t, 3), 'lines': part['lines']})
        self.dur = t

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

    def years(self, sh, p):
        out = []
        W, H = self.W, self.H
        ys = sh.get('years')
        if not ys:
            return out
        if sh['type'] == 'split':
            out.append((ys[0], (22, 18, 'lt')))
            if len(ys) > 1 and p > 0.18:
                out.append((ys[1], (W // 2 + 22, 18, 'lt')))
        else:
            out.append((ys[0], (22, 18, 'lt')))
        return out

    def card(self, part, p, dur):
        W, H = self.W, self.H
        img = Image.new('RGB', (W, H), INK)
        d = ImageDraw.Draw(img)
        P = self.P
        # a scan bar sweeps once; the numeral lands, the title types, the years tick
        sweep = ease(min(1, p * 1.6))
        d.rectangle((0, int(H * sweep) - 2, W, int(H * sweep)), fill=(0, 60, 76))
        land = ease(min(1, p * 4))
        rx = int(W * 0.08)
        ry = int(H * 0.30 + (1 - land) * 30)
        col = tuple(int(c * land) for c in AMBER)
        d.text((rx, ry), part['id'], font=P.f_roman, fill=col, anchor='ls')
        title = part['title'].upper()
        n = int(len(title) * ease(min(1, max(0, p - 0.12) * 3)))
        d.text((rx + 4, ry + int(H * 0.06)), title[:n], font=P.f_title, fill=(255, 255, 255), anchor='lt')
        y0, y1 = part['years']
        tick = ease(min(1, max(0, p - 0.3) * 2.2))
        try:
            a, b = int(y0), int(y1)
            yr = str(int(round(a + (b - a) * tick)))
        except ValueError:
            yr = y1 if tick > 0.5 else y0
        d.text((rx + 4, ry + int(H * 0.16)), '%s  →  ' % y0, font=P.f_small, fill=(150, 160, 162), anchor='lt')
        bb = d.textbbox((rx + 4, ry + int(H * 0.16)), '%s  →  ' % y0, font=P.f_small, anchor='lt')
        d.text((bb[2], ry + int(H * 0.16)), yr, font=P.f_small, fill=CYAN, anchor='lt')
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
        mix = np.tanh(mix * 1.1) * 0.8
        return mix[: int(self.dur * SR)]


def write_wav(path, a):
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(a, -1, 1) * 32767).astype('<i2').tobytes())


def write_js(film, spec, path):
    reel = []
    for sh in film.timeline:
        if sh['type'] == 'card':
            cap = '%s. %s' % (sh['part']['id'], sh['part']['title'])
        else:
            cap = ' | '.join(film.media[k].tag for k in sh.get('media', []))
        reel.append({'at': round(sh['at'], 3), 'dur': round(sh['dur'], 3), 'cap': cap})
    chapters = []
    for p in film.parts:
        chapters.append({'id': p['id'], 'title': p['title'], 'year': p['years'][1], 'at': p['at'],
                         'end': p['end'], 'map': False, 'lines': p['lines']})
    fin = spec['finale']
    chapters.append({'id': fin['id'], 'title': fin['title'], 'year': fin['year'], 'at': round(film.dur, 3),
                     'end': None, 'map': True, 'lines': fin['lines']})
    js = ('/* generated by scripts/build-intro-collage.py from scripts/intro-collage.json - edit there */\n'
          'window.B0B_INTRO_STYLE="collage";\n'
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
    args = ap.parse_args()
    spec = json.load(open(SPEC, encoding='utf-8'))
    media_dir = os.path.expanduser(spec['media_dir'])
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
    enc = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '%dx%d' % (W, H),
                            '-r', str(fps), '-i', '-', '-c:v', 'ffv1', '-level', '3', master], stdin=subprocess.PIPE)
    total = 0
    for sh in film.timeline:
        film.prepare(sh)
        n = max(1, int(round(sh['dur'] * fps)))
        for fi in range(n):
            enc.stdin.write(np.ascontiguousarray(film.frame(sh, fi)).tobytes())
        total += n
        film.release(sh)
        sys.stdout.write('\r  %d frames (%.0f%%)' % (total, 100 * total / (film.dur * fps)))
        sys.stdout.flush()
    enc.stdin.close(); enc.wait()
    print()
    a = spec['audio']
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
    poster = os.path.join(ROOT, spec['poster'])
    subprocess.run([FF, '-v', 'error', '-y', '-ss', str(spec.get('poster_at', 3)), '-i', master, '-frames:v', '1',
                    '-q:v', '4', poster], check=True)
    for f in (out_mp4, out_webm, poster):
        print('  %-40s %8.1f KB' % (os.path.relpath(f, ROOT), os.path.getsize(f) / 1024))
    write_js(film, spec, js_path)


if __name__ == '__main__':
    main()
