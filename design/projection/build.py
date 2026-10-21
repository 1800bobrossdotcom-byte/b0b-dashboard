#!/usr/bin/env python3
"""Wall projection for b0b.dev: a landscape still and a silent looping video.

  python3 design/projection/build.py            still (1080p + 4K) and the loop
  python3 design/projection/build.py --still    still only
  python3 design/projection/build.py --sheet    one frame per shot, for review

The still is the address, the slashed zero in cyan as on the stickers and the site's wordmark,
"b zero b" spelled underneath, and a QR (dark on light: inverted codes fail on many phone cameras).

The loop is the report's own images: the licence-checked listen-mode set (site/listen-media.js),
FACE-FREE ITEMS ONLY - documents, buildings, places, the sky. A projected loop has no narration to
grade a juxtaposition, and in a montage juxtaposition is implication, so no person appears. Every
image carries its source tag on screen, as in the films (and the CC BY ones need it). The address
holds at the bottom throughout, and the full address card returns every few images. The loop
begins and ends on the card, so it repeats without a seam.
"""
import json, os, re, subprocess, sys

import segno
import zxingcpp
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OUT = os.path.join(HERE, 'out')
FONTS = os.path.join(ROOT, 'design', 'stickers', 'fonts')
URL = 'https://www.b0b.dev'

BG = (5, 5, 5)
GREEN = (0, 255, 65)       # the wordmark's green
CYAN = (0, 204, 255)       # the wordmark's slash
LIGHT = (216, 255, 228)
DIM = (150, 182, 162)

FPS = 25
HOLD = 5.0                 # seconds each image is on screen, crossfade included
CARD = 5.0                 # seconds the address card holds
XF = 0.8                   # crossfade
EVERY = 6                  # the card returns after this many images

# The report's images, in running order. Face-free only (the manifest's own faces field is checked
# below as well). Left out on purpose: residences and the streets around them, prisons, the
# author's own city.
SHOTS = [
    'IV_nasa_black_marble_americas_2012',
    'L_national_security_act_1947_61stat495',
    'VIII_cia_headquarters_entrance',
    'L_cia_act_1949_sec10b_certificate_63stat213',
    'II_nsa_hq_fort_meade',
    'VII_ukusa_revision_uscib_19541206_p1',
    'L_menwith_hill_radomes_2005',
    'VII_mkultra_subproject8_19530609',
    'V_eisenhower_farewell_reading_copy_p15',
    'VII_northwoods_memo_lemnitzer_19620313_p1',
    'V_cuban_missiles_19621101',
    'L_gulf_of_tonkin_resolution_pl88-408',
    'VII_church_committee_book2_title_1976',
    'III_cheyenne_mountain_norad_entrance_1968',
    'III_mount_weather_fema_2007',
    'L_federal_reserve_act_1913_38stat251',
    'II_bis_tower_basel_2015_romero',
    'II_bretton_woods_meeting_room_highsmith',
    'IV_proclamation_7463_federal_register_20010918',
    'IV_aumf_public_law_107-40_p1',
    'L_usa_patriot_act_pl107-56_p2',
    'III_nsa_utah_data_center_2014_eff',
    'IV_corona_beijing_1967',
    'IV_starlink_ctio_2019',
    'VIII_unsc_chamber_empty_2024_forrester',
    'VIII_oval_office_empty_19810422',
    'I_fbi_maxwell_file_cover',
    'L_epstein_files_transparency_act_pl119-38_p2',
    'I_nara_wnrc_stacks',
    'VIII_national_archives_pediment',
]


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size, layout_engine=ImageFont.Layout.RAQM)


def address(draw, xy, size, anchor='ls'):
    """www.b0b.dev with the zero slashed in cyan: the slashed glyph drawn cyan, the plain glyph
    drawn green over it, so only the slash shows cyan. Returns the drawn width."""
    f = font('IBMPlexMono-Bold.ttf', size)
    parts = ['www.b', '0', 'b.dev']
    total = sum(f.getlength(p) for p in parts)
    x, y = xy
    if anchor[0] == 'm':
        x -= total / 2
    for p in parts:
        if p == '0':
            draw.text((x, y), '0', font=f, fill=CYAN, anchor='l' + anchor[1], features=['zero'])
            draw.text((x, y), '0', font=f, fill=GREEN, anchor='l' + anchor[1], features=['salt'])
        else:
            draw.text((x, y), p, font=f, fill=GREEN, anchor='l' + anchor[1])
        x += f.getlength(p)
    return total


def spelled(draw, xy, size, anchor='ms', gap='  '):
    """b  zero  b, with 'zero' in the slash's cyan."""
    f = font('IBMPlexMono-Medium.ttf', size)
    parts = [('b', LIGHT), (gap, LIGHT), ('zero', CYAN), (gap, LIGHT), ('b', LIGHT)]
    total = sum(f.getlength(t) for t, _ in parts)
    x, y = xy
    if anchor[0] == 'm':
        x -= total / 2
    for t, c in parts:
        draw.text((x, y), t, font=f, fill=c, anchor='l' + anchor[1])
        x += f.getlength(t)
    return total


def qr_tile(px):
    """Dark modules on a pale tile with a quiet zone, px square."""
    q = segno.make(URL, error='q', micro=False, boost_error=False)
    m = q.matrix
    n = len(m) + 8                      # 4-module quiet zone each side
    tile = Image.new('RGB', (n, n), (236, 255, 242))
    d = ImageDraw.Draw(tile)
    for r, row in enumerate(m):
        for c, v in enumerate(row):
            if v:
                d.point((c + 4, r + 4), fill=(5, 20, 12))
    return tile.resize((px, px), Image.NEAREST)


def scanlines(im, step=4, k=0.9):
    """Faint CRT scanlines, as the wordmark's screen."""
    over = Image.new('L', im.size, 255)
    d = ImageDraw.Draw(over)
    for y in range(0, im.height, step):
        d.line([(0, y), (im.width, y)], fill=int(255 * k))
    return Image.composite(im, Image.new('RGB', im.size, (0, 0, 0)), over)


def card(s=1):
    """The address card, at scale s (1 = 1920x1080)."""
    W, H = 1920 * s, 1080 * s
    im = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(im)
    address(d, (W / 2, 520 * s), 210 * s, anchor='ms')
    d.line([(W / 2 - 180 * s, 600 * s), (W / 2 + 180 * s, 600 * s)], fill=(0, 90, 110), width=2 * s)
    spelled(d, (W / 2, 900 * s), 92 * s, anchor='ms', gap=' ')
    im = scanlines(im, step=4 * s)
    q = qr_tile(190 * s)
    im.paste(q, (W - 190 * s - 56 * s, H - 190 * s - 56 * s))
    return im


def band():
    """The address held at the bottom of every image frame (RGBA overlay, 1920x1080)."""
    ov = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    d.rectangle([0, 930, 1920, 1080], fill=BG + (255,))
    d.line([(0, 930), (1920, 930)], fill=(0, 90, 50, 255), width=2)
    address(d, (64, 1003), 76, anchor='ls')
    spelled(d, (66, 1052), 32, anchor='ls', gap=' ')
    q = qr_tile(124).convert('RGBA')
    ov.alpha_composite(q, (1920 - 124 - 40, 943))
    return ov


def wrap(text, f, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if f.getlength(t) > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = t
    lines.append(cur)
    return lines


class Shot:
    BOX = (1640, 760, 70)          # max width, max height, top

    def __init__(self, item):
        self.k, self.tag = item['k'], item['tag']
        src = Image.open(os.path.join(ROOT, 'site', item['src'].lstrip('/'))).convert('RGB')
        # background: the same picture, covering, blurred and dark
        W, H = 1920, 1080
        sc = max(W / src.width, H / src.height)
        bg = src.resize((int(src.width * sc) + 2, int(src.height * sc) + 2), Image.BILINEAR)
        bg = bg.crop(((bg.width - W) // 2, (bg.height - H) // 2, (bg.width - W) // 2 + W, (bg.height - H) // 2 + H))
        bg = bg.filter(ImageFilter.GaussianBlur(28))
        self.bg = Image.blend(Image.new('RGB', (W, H), BG), bg, 0.28)
        bw, bh, top = self.BOX
        fit = min(bw / src.width, bh / src.height)
        self.fw, self.fh = int(src.width * fit), int(src.height * fit)
        self.fx, self.fy = (W - self.fw) // 2, top + (bh - self.fh) // 2
        z = 1.07                                     # room for the slow push
        self.big = src.resize((int(self.fw * z), int(self.fh * z)), Image.LANCZOS)
        f = font('IBMPlexMono-Medium.ttf', 24)
        self.cap = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(self.cap)
        y = self.fy + self.fh + 30
        for line in wrap(self.tag, f, 1700)[:2]:
            cd.text((W / 2, y), line, font=f, fill=DIM + (255,), anchor='mt')
            y += 30

    def frame(self, t, band_ov):
        """t in 0..1 across the shot: a slow push in, centred."""
        z = 1.0 + 0.065 * t
        cw, ch = self.big.width / z, self.big.height / z
        x0, y0 = (self.big.width - cw) / 2, (self.big.height - ch) / 2
        fg = self.big.resize((self.fw, self.fh), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))
        im = self.bg.copy()
        im.paste(fg, (self.fx, self.fy))
        d = ImageDraw.Draw(im)
        d.rectangle([self.fx - 1, self.fy - 1, self.fx + self.fw, self.fy + self.fh], outline=(28, 52, 40))
        im = im.convert('RGBA')
        im.alpha_composite(self.cap)
        im.alpha_composite(band_ov)
        return im.convert('RGB')


def load_items():
    src = open(os.path.join(ROOT, 'site', 'listen-media.js'), encoding='utf-8').read()
    arr = json.loads(src[src.index('['):src.rindex(']') + 1])
    by = {x['k']: x for x in arr}
    items = []
    for k in SHOTS:
        x = by[k]
        if x.get('faces'):
            sys.exit('refusing %s: the manifest records faces' % k)
        items.append(x)
    return items


def timeline(n):
    """[('card'|i, seconds)] - card first, then images with the card back every EVERY images."""
    seq = [('card', CARD)]
    for i in range(n):
        seq.append((i, HOLD))
        if (i + 1) % EVERY == 0 and i + 1 < n:
            seq.append(('card', CARD - 1.0))
    return seq


def verify_qr(im, label):
    ok = any(r.text == URL for r in zxingcpp.read_barcodes(im))
    half = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
    ok2 = any(r.text == URL for r in zxingcpp.read_barcodes(half))
    print('  QR %-34s full %s  half %s' % (label, 'OK' if ok else 'FAIL', 'OK' if ok2 else 'FAIL'))
    return ok and ok2


def build_still():
    os.makedirs(OUT, exist_ok=True)
    ok = True
    for s, name in ((1, 'b0b-dev-projection-1080p.png'), (2, 'b0b-dev-projection-4k.png')):
        im = card(s)
        im.save(os.path.join(OUT, name), optimize=True)
        print('wrote', name, im.size)
        ok &= verify_qr(im, name)
    return ok


def build_loop(sheet=False):
    ff = os.environ.get('FFMPEG') or __import__('imageio_ffmpeg').get_ffmpeg_exe()
    items = load_items()
    shots = [Shot(x) for x in items]
    ov = band()
    c = card(1)
    seq = timeline(len(shots))
    if sheet:
        thumbs = [c] + [s.frame(0.5, ov) for s in shots]
        cols, tw, th = 5, 384, 216
        rows = (len(thumbs) + cols - 1) // cols
        sh = Image.new('RGB', (cols * tw, rows * th), (20, 20, 20))
        for i, t in enumerate(thumbs):
            sh.paste(t.resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
        sh.save(os.path.join(OUT, 'contact-sheet.jpg'), quality=88)
        print('wrote contact-sheet.jpg', len(thumbs), 'frames')
        verify_qr(shots[0].frame(0.5, ov), 'image frame (bottom band)')
        return
    total = sum(d for _, d in seq)
    nfr = int(round(total * FPS))
    tmp = os.path.join(OUT, 'b0b-dev-projection-loop.part.mp4')
    final = os.path.join(OUT, 'b0b-dev-projection-loop.mp4')
    p = subprocess.Popen([ff, '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                          '-s', '1920x1080', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-tune', 'stillimage', '-pix_fmt', 'yuv420p',
                          '-g', str(FPS * 2), '-movflags', '+faststart', '-an', tmp], stdin=subprocess.PIPE)
    starts, t = [], 0.0
    for _, d in seq:
        starts.append(t)
        t += d

    def render(idx, local):
        what, dur = seq[idx % len(seq)]
        if what == 'card':
            return c
        return shots[what].frame(min(1.0, max(0.0, local / dur)), ov)

    for fi in range(nfr):
        tt = fi / FPS
        j = max(i for i, s0 in enumerate(starts) if s0 <= tt)
        local = tt - starts[j]
        dur = seq[j][1]
        im = render(j, local)
        if local > dur - XF:                         # crossfade into the next; the last fades into the card
            nxt = render(j + 1, local - dur + XF) if j + 1 < len(seq) else c
            im = Image.blend(im, nxt, (local - (dur - XF)) / XF)
        p.stdin.write(im.tobytes())
        if fi % (FPS * 20) == 0:
            print('  %5.1f / %.1f s' % (tt, total), flush=True)
    p.stdin.close()
    if p.wait() != 0:
        sys.exit('ffmpeg failed')
    os.replace(tmp, final)
    print('wrote', os.path.basename(final), '%.1f s' % total, '%.1f MB' % (os.path.getsize(final) / 1e6))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    if '--sheet' in sys.argv:
        build_loop(sheet=True)
    else:
        if not build_still():
            sys.exit('QR did not decode')
        if '--still' not in sys.argv:
            build_loop()
