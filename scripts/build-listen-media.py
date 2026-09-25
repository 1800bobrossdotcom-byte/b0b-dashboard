#!/usr/bin/env python3
"""Export the films' licence-checked imagery for the listen-mode slideshow.

Reads the three film specs (intro, Continuity, the Epstein-Maxwell Record), and
writes a 1024px JPEG per still - plus one frame from each archive film, taken at
the moment the film itself used - to site/img/listen/, and a manifest to
site/listen-media.js. Every entry carries the source tag the film burned into its
frame (licence and credit included), so the slideshow shows the same line.

THE RULE THE SLIDESHOW ENFORCES WITH THIS MANIFEST: an image with an
identifiable person (`faces`) is shown only when that person's name is in the
sentence being read. Everything else - places, buildings, documents, objects -
may be used as a section's ambient picture. In a montage, juxtaposition is
implication; the films were cut by hand under that rule, and a slideshow that
picks pictures automatically has to carry the rule in its data.

Face lists come from the sourcing manifests (session scratchpad; path in
B0B_LISTEN_MANIFESTS, or the defaults below). The three ERC-1155 frames with
faces are excluded outright, as they were from the Epstein-Maxwell film.

    python3 scripts/build-listen-media.py
"""
import json
import os
import re
import subprocess
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'site', 'img', 'listen')
OUT_JS = os.path.join(ROOT, 'site', 'listen-media.js')
SCR = os.environ.get('B0B_LISTEN_MANIFESTS', '/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad')

FILMS = [('intro', 'scripts/intro-collage.json', 'intro-v2-media.json'),
         ('continuity', 'scripts/film-continuity.json', 'film2-media.json'),
         ('em', 'scripts/film-epstein-maxwell.json', 'film3-media.json')]

# which report sections each film part speaks to (the films were written from these sections)
SECTIONS = {
    'intro': {'I': ['XVI', 'I'], 'II': ['X'], 'III': ['IX', 'X', 'XXI'], 'IV': ['X', 'XXI'], 'V': ['XVI', 'XV'],
              'VI': ['XXIII'], 'VII': ['XVI', 'XXIV']},
    'continuity': {'I': ['VII'], 'II': ['VII'], 'III': ['IX'], 'IV': ['XXIV', 'XVI'], 'V': ['VII', 'XX'],
                   'VI': ['VII', 'X'], 'VII': ['XVI'], 'VIII': ['VII', 'XII']},
    'em': {'I': ['V'], 'II': ['II'], 'III': ['II'], 'IV': ['II'], 'V': ['II'], 'VI': ['II'], 'VII': ['V'],
           'VIII': ['II', 'V']},
}
# the archive films' frames: match words, and whether people are the subject
V1 = {
    'nuremberg': (['Nuremberg', 'war crimes'], True),
    'huac': (['HUAC', 'Un-American', 'Hollywood Ten'], True),
    'ivy': (['Operation Ivy', 'Ivy Mike', 'hydrogen bomb', 'thermonuclear'], False),
    'explorer': (['Explorer 1', 'Explorer I'], False),
    'cuba': (['Cuban Missile', 'missile crisis', 'Cuba'], True),
    'peacemarch': (['peace march', 'anti-war', 'Vietnam War'], True),
    'irancontra': (['Iran-Contra', 'Contra'], True),
}
# surnames too common, or too close to ordinary words, to trigger a portrait on their own
AMBIGUOUS = {'Johnson', 'King', 'Mary', 'Tower', 'Hamilton', 'Baker', 'Carter', 'Church', 'Chambers', 'Thompson',
             'Jackson', 'Powell', 'Kennedy', 'Alam', 'Randolph', 'Stevenson', 'Nixon', 'Reagan', 'Maxwell'}
MONTHS = r'^(Jan|Feb|March|April|May|June|July|Aug|Sept|Oct|Nov|Dec)[a-z]*\.?$'
# documents and places about one named person: shown only when that person is named, like a portrait
NAMED_DOCS = {'I_fbi_maxwell_file_cover': ['Robert Maxwell', 'Ian Robert Maxwell'],
              'VIII_fbi_maxwell_airtel_1954_redacted': ['Robert Maxwell', 'Ian Robert Maxwell'],
              'VIII_fbi_maxwell_heidelberg_1954_redacted': ['Robert Maxwell', 'Ian Robert Maxwell'],
              'I_headington_hill_hall_2008': ['Headington Hill', 'Pergamon']}
# full names the sourcing manifest recorded only as a surname
FULL_NAMES = {'II_hoover_1961_trikosko': ['J. Edgar Hoover'], 'II_hoover_newsreel_1937': ['J. Edgar Hoover']}
ERC_WITH_FACES = {'erc_fs_0-rRKsy4', 'erc_8VbssmVYakg', 'erc_OiYL9z3bXEI',
                  # identifiable people in the frame (a cinema audience, an actor, a man on a street): not flashed in listen mode
                  'erc_YlMeyAAWhwE', 'erc_vCeDEZtRY9s', 'erc_VP2iLdUcI1c'}
STOP = {'The', 'A', 'An', 'Of', 'And', 'In', 'On', 'At', 'For', 'To', 'From', 'By', 'With', 'Photo', 'Official',
        'Portrait', 'Library', 'Congress', 'Commons', 'Wikimedia', 'Carol', 'Highsmith', 'NASA', 'PD', 'CC',
        'BY', 'US', 'U.S.', 'USAF', 'Air', 'Force', 'Government', 'Photograph', 'Undated', 'Date', 'Not', 'Recorded',
        'Photographer', 'Universal', 'Newsreel', 'NARA', 'Image'}


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return 'ffmpeg'


def surname(face):
    """'Dwight D. Eisenhower (d. 1969)' -> 'Eisenhower'; crowds and anonymous figures -> None.
    The intro's manifest records faces as {name, living}: an unnamed person there returns '*',
    which keeps the image to keyword use only."""
    if isinstance(face, dict):
        name = face.get('name', '')
        if 'unnamed' in name or '(' in name or not re.match(r'[A-Z]', name):
            return '*'
        face = name + ' (d.'
    if '(d.' not in face:
        return None
    name = face.split('(d.')[0].strip(' ,')
    name = re.sub(r"\s*['\"].*?['\"]\s*", ' ', name)          # nicknames
    name = re.sub(r'\b(Jr|Sr|II|III)\.?$', '', name).strip()
    parts = name.split()
    if not parts:
        return None
    if re.match(r'^[IVX]+$', parts[-1]) and len(parts) > 1:  # Elizabeth I, George V
        return ' '.join(parts[-2:])
    return parts[-1]


def keys_from(caption):
    """Proper-noun phrases from a caption: runs of capitalised words, minus boilerplate."""
    caption = re.sub(r'\(.*?\)', ' ', caption)
    out = []
    for run in re.findall(r"(?:[A-Z][A-Za-z0-9'\.\-]*(?:\s+(?:of|the|de|du|von|and|&)\s+|\s+)?)+", caption):
        words = [w for w in run.split() if w not in STOP]
        phrase = ' '.join(words).strip(' .-')
        if (len(phrase) >= 4 and phrase not in out and not re.fullmatch(r'[0-9 .]+', phrase)
                and not re.match(MONTHS, phrase) and not phrase.endswith(')')):
            out.append(phrase)
    return out[:6]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ff = ffmpeg()
    entries, seen = [], set()
    for film, spec_path, man_name in FILMS:
        spec = json.load(open(os.path.join(ROOT, spec_path), encoding='utf-8'))
        media_dir = spec['media_dir']
        man = {}
        try:
            for it in json.load(open(os.path.join(SCR, man_name), encoding='utf-8'))['items']:
                man[os.path.splitext(it['file'])[0]] = it
        except FileNotFoundError:
            sys.exit('sourcing manifest missing: %s (set B0B_LISTEN_MANIFESTS)' % os.path.join(SCR, man_name))
        # first use of each media key, and the part it served
        first = {}
        for p in spec['parts']:
            for sh in p['shots']:
                for i, k in enumerate(sh.get('media', [])):
                    if k in first:
                        continue
                    t = sh.get('t')
                    t = t[i] if isinstance(t, list) and i < len(t) else t
                    first[k] = (p['id'], t, sh['dur'])
        for k, m in spec['media'].items():
            if k in seen or k in ERC_WITH_FACES or k not in first:
                continue
            seen.add(k)
            part, t, dur = first[k]
            src = os.path.join(media_dir, m['file'])
            out_name = re.sub(r'[^A-Za-z0-9_\-]', '_', k) + '.jpg'
            out_path = os.path.join(OUT_DIR, out_name)
            erc = k.startswith('erc_')
            if m['kind'] == 'video':
                at = (t if t is not None else m.get('in', 0)) + min(1.0, dur / 2)
                raw = subprocess.run([ff, '-v', 'error', '-ss', '%.2f' % at, '-i', src, '-frames:v', '1',
                                      '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
                if not raw:
                    print('  no frame:', k); continue
                from io import BytesIO
                im = Image.open(BytesIO(raw)).convert('RGB')
            else:
                im = Image.open(src).convert('RGB')
            im.thumbnail((1024, 1024), Image.LANCZOS)
            im.save(out_path, 'JPEG', quality=76, optimize=True, progressive=True)
            it = man.get(k, {})
            base = k.split('_x')[0] if film != 'intro' or k not in V1 else k
            full = []
            if k in V1:
                keys, people = V1[k]
                faces = ['*'] if people else []          # archive crowds and principals: keyword use only
            else:
                faces = sorted(set(s for s in (surname(f) for f in it.get('faces') or []) if s and not s.endswith(')')))
                full = [f.get('name') if isinstance(f, dict) else f.split('(d.')[0].strip(' ,') for f in it.get('faces') or []]
                full = [re.sub(r"\s*['\"].*?['\"]\s*", ' ', x).strip() for x in full if x and '(d.' in (x + ' (d.') and re.match(r'[A-Z][a-z]', x) and 'unnamed' not in x and len(x.split()) >= 2]
                keys = keys_from(it.get('caption', '') or m['tag'].title())
            full = full + FULL_NAMES.get(k, [])
            if k in NAMED_DOCS:
                full = list(NAMED_DOCS[k]); faces = faces or []
            entries.append({'k': k, 'src': '/img/listen/' + out_name, 'w': im.width, 'h': im.height,
                            'tag': m['tag'], 'faces': faces,
                            # a portrait is triggered by its subject's name, never by a topic word
                            'names': sorted(set(x for x in (full if k not in V1 else []) +
                                                [f for f in faces if f != '*' and f not in AMBIGUOUS and len(f) >= 5]
                                                if x and not x.endswith(')'))),
                            'keys': [x for x in keys if x not in AMBIGUOUS and not x.endswith(')')
                                     and not any(x in n or n in x for n in (full + faces) if n and n != '*')][:6],
                            'sections': SECTIONS[film].get(part, []), 'film': film, 'erc': erc})
            sys.stdout.write('\r  %d images' % len(entries)); sys.stdout.flush()
    print()
    js = ('/* generated by scripts/build-listen-media.py from the three film specs - do not edit */\n'
          'window.B0B_LISTEN_MEDIA=%s;\n' % json.dumps(entries, ensure_ascii=False, separators=(',', ':')))
    open(OUT_JS, 'w', encoding='utf-8').write(js)
    size = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in os.listdir(OUT_DIR))
    print('wrote %d images (%.1f MB) and %s' % (len(entries), size / 1e6, os.path.relpath(OUT_JS, ROOT)))
    print('  portraits (shown only when a subject is named):', sum(1 for e in entries if e['names']))
    print('  crowds/archive with people (topic match only, never ambient):', sum(1 for e in entries if e['faces'] and not e['names']))
    print('  ambient-eligible:', sum(1 for e in entries if not e['faces'] and not e['erc']))


if __name__ == '__main__':
    main()
