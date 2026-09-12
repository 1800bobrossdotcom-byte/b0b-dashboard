#!/usr/bin/env python3
"""Build site/map.kml from the locations array in site/map.html.

The KML is the Google Earth path: Google's own web/desktop Earth clients import
KML, so this exports the curated corpus without adding a third-party API key,
a billing account, or a rewrite of the Leaflet layer stack to the site.

Dated markers carry a <TimeSpan>, so Google Earth Pro's time slider works off
the same dates the site's own period scrubber uses. Undated markers carry no
time element and therefore stay visible at every slider position.
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'site', 'map.html')
OUT = os.path.join(ROOT, 'site', 'map.kml')

SECTION_NAMES = {
    'MS': 'Mass shootings',
    'ANIMAL': 'Animal research',
    'SPORTS': 'Sport and gambling',
}


def extract_block(text, opener):
    """Return the source of a JS array/object literal starting at `opener`."""
    i = text.index(opener) + len(opener) - 1
    depth = 0
    in_str = None
    esc = False
    j = i
    n = len(text)
    while j < n:
        c = text[j]
        if in_str:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == in_str:
                in_str = None
            j += 1
            continue
        # Comments are skipped: a `//` line comment containing an apostrophe
        # would otherwise open a phantom string and swallow the brackets.
        if c == '/' and j + 1 < n and text[j + 1] == '/':
            k = text.find('\n', j)
            j = n if k == -1 else k
            continue
        if c == '/' and j + 1 < n and text[j + 1] == '*':
            k = text.find('*/', j + 2)
            j = n if k == -1 else k + 2
            continue
        if c in '"\'':
            in_str = c
        elif c in '[{':
            depth += 1
        elif c in ']}':
            depth -= 1
            if depth == 0:
                return text[i:j + 1]
        j += 1
    raise ValueError('unterminated literal for ' + opener)


def js_to_json(src):
    """Quote bare object keys and drop trailing commas.

    Walks the literal rather than running a regex over it: marker context
    strings contain punctuation ("row sources: https://...") that a regex
    rewrites into broken JSON.
    """
    out = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c in '"\'':
            j = i + 1
            while j < n:
                if src[j] == '\\':
                    j += 2
                    continue
                if src[j] == c:
                    break
                j += 1
            literal = src[i:j + 1]
            if c == "'":
                literal = '"' + literal[1:-1].replace('"', '\\"') + '"'
            # \' is legal in a JS double-quoted string and illegal in JSON.
            literal = literal.replace("\\'", "'")
            out.append(literal)
            i = j + 1
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i)
            i = n if j == -1 else j
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j == -1 else j + 2
            continue
        if c in '{,':
            out.append(c)
            j = i + 1
            while j < n and src[j].isspace():
                j += 1
            k = j
            while k < n and (src[k].isalnum() or src[k] in '_$'):
                k += 1
            m = k
            while m < n and src[m].isspace():
                m += 1
            if k > j and m < n and src[m] == ':':
                out.append(src[i + 1:j] + '"' + src[j:k] + '"')
                i = k
            else:
                i += 1
            continue
        out.append(c)
        i += 1
    txt = ''.join(out)
    txt = re.sub(r',(\s*[}\]])', r'\1', txt)
    return json.loads(txt)


def kml_color(hex_rgb):
    """#rrggbb -> KML aabbggrr."""
    r, g, b = hex_rgb[1:3], hex_rgb[3:5], hex_rgb[5:7]
    return ('ff' + b + g + r).lower()


def timespan(date, dprec):
    if not date:
        return ''
    y = date[:4]
    if dprec == 'year':
        return '<TimeSpan><begin>%s-01-01</begin><end>%s-12-31</end></TimeSpan>' % (y, y)
    if dprec == 'month':
        return '<TimeSpan><begin>%s-01</begin><end>%s-28</end></TimeSpan>' % (date[:7], date[:7])
    return '<TimeStamp><when>%s</when></TimeStamp>' % date


def main():
    text = open(SRC, encoding='utf-8').read()
    locations = js_to_json(extract_block(text, 'var locations = ['))
    colors = js_to_json(extract_block(text, 'var colorMap = {'))

    styles = []
    for typ, col in colors.items():
        styles.append(
            '<Style id="t-%s"><IconStyle><color>%s</color><scale>0.9</scale>'
            '<Icon><href>https://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon>'
            '</IconStyle><LabelStyle><color>%s</color><scale>0.8</scale></LabelStyle></Style>'
            % (typ, kml_color(col), kml_color(col)))

    folders = {}
    for loc in locations:
        folders.setdefault(loc['section'], []).append(loc)

    def sort_key(sec):
        romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
                  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII',
                  'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV']
        return (romans.index(sec), sec) if sec in romans else (99, sec)

    body = []
    dated = 0
    for sec in sorted(folders, key=sort_key):
        label = SECTION_NAMES.get(sec, 'Section ' + sec)
        body.append('<Folder><name>%s (%d)</name><open>0</open>'
                    % (html.escape(label), len(folders[sec])))
        for loc in folders[sec]:
            if loc.get('date'):
                dated += 1
            desc = (
                '<![CDATA[<p><b>%s</b> &middot; %s</p><p>%s</p>'
                '<p><a href="https://www.b0b.dev/report#%s">View in report</a></p>]]>'
                % (html.escape(label), html.escape(loc['type']),
                   html.escape(loc['ctx']),
                   {'ANIMAL': 'XIV', 'MS': 'X'}.get(sec, sec)))
            body.append(
                '<Placemark><name>%s</name><styleUrl>#t-%s</styleUrl>'
                '<description>%s</description>%s'
                '<Point><coordinates>%s,%s,0</coordinates></Point></Placemark>'
                % (html.escape(loc['name']), loc['type'], desc,
                   timespan(loc.get('date'), loc.get('dprec')),
                   loc['lng'], loc['lat']))
        body.append('</Folder>')

    doc = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<kml xmlns="http://www.opengis.net/kml/2.2"><Document>'
        '<name>PROJECT ANGLERFISH — locations</name>'
        '<description><![CDATA[%d locations from the report at '
        '<a href="https://www.b0b.dev/report">b0b.dev/report</a>. '
        '%d carry a date parsed from their own context text and drive the time '
        'slider; %d do not and are shown at every slider position.]]></description>'
        '%s%s</Document></kml>\n'
        % (len(locations), dated, len(locations) - dated,
           ''.join(styles), ''.join(body)))

    open(OUT, 'w', encoding='utf-8').write(doc)
    print('wrote %s: %d placemarks in %d folders, %d dated, %d bytes'
          % (os.path.relpath(OUT, ROOT), len(locations), len(folders), dated,
             len(doc.encode('utf-8'))))
    return 0


if __name__ == '__main__':
    sys.exit(main())
