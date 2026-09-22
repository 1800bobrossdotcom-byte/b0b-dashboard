#!/usr/bin/env python3
"""Regenerate the TRANSMISSIONS reel on the home page.

    python3 scripts/build-transmissions.py            # fetch feeds, rewrite the reel
    python3 scripts/build-transmissions.py --offline  # rebuild the reel from the last fetch

Sources, both public and unauthenticated:
  - the ERC-1155 YouTube channel's Atom feed (its 15 most recent uploads - the
    feed does not go deeper, so "the channel has the rest" on the page is true)
  - Vimeo's v2 simple API, per video id, for the pieces listed in
    scripts/transmissions.json. Vimeo is curated by id on purpose: the same
    account also carries client and spec work that is not this site's subject.
    Add an id to `vimeo_ids` to include a piece; nothing is pulled implicitly.
  - YouTube videos that are NOT on the channel, listed in `youtube_ids` as
    objects: {"id", "date", "sub", optionally "title"}. Title and thumbnail
    come from YouTube's public oEmbed endpoint when online. `date` and `sub`
    are curated because oEmbed carries neither, and the watch page itself
    refuses this crawler (402-byte stub), so an upload date cannot be read
    from here - state in the entry what the date actually refers to rather
    than implying it is the upload date.

The fetched entries are written to scripts/transmissions.json under `entries`
so the reel is reproducible without the network and the diff of any rebuild is
reviewable. If a feed cannot be read the reel is left exactly as it was and the
script exits non-zero: a reel is never rebuilt from a partial fetch.

Markers in site/index.html bound what this script owns:
  <!-- transmissions:begin --> ... <!-- transmissions:end -->
and the two counts carry data-tx-count. Everything else on the page is hand-written.
"""
import datetime
import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CFG = os.path.join(ROOT, 'scripts', 'transmissions.json')
PAGE = os.path.join(ROOT, 'site', 'index.html')
UA = os.environ.get('B0B_SPIDER_UA',
                    'b0bSourceBot/1.0 (+https://www.b0b.dev/; site build; contact via /.well-known/security.txt)')
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015',
      'm': 'http://search.yahoo.com/mrss/'}


def get(url, timeout=30):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def youtube(channel_id):
    root = ET.fromstring(get('https://www.youtube.com/feeds/videos.xml?channel_id=' + channel_id))
    out = []
    for e in root.findall('a:entry', NS):
        vid = e.find('yt:videoId', NS).text
        out.append({
            'kind': 'youtube', 'id': vid,
            'title': e.find('a:title', NS).text or '',
            'sub': '',
            'date': e.find('a:published', NS).text[:10],
            'thumb': 'https://i.ytimg.com/vi/%s/hqdefault.jpg' % vid,
            'href': 'https://www.youtube.com/watch?v=' + vid,
            'dur': None,
        })
    if not out:
        raise RuntimeError('YouTube feed returned no entries')
    return out


def vimeo(video_id):
    v = json.loads(get('https://vimeo.com/api/v2/video/%s.json' % video_id))[0]
    return {
        'kind': 'vimeo', 'id': str(v['id']),
        'title': v.get('title') or '',
        'sub': re.sub(r'<br\s*/?>', ' ', v.get('description') or '').strip(),
        'date': (v.get('upload_date') or '')[:10],
        'thumb': v.get('thumbnail_large') or v.get('thumbnail_medium') or '',
        'href': 'https://vimeo.com/%s' % v['id'],
        'dur': v.get('duration'),
    }


def youtube_one(spec):
    """A single YouTube video that is not on the channel feed. Curated."""
    vid = spec['id'] if isinstance(spec, dict) else str(spec)
    meta = spec if isinstance(spec, dict) else {}
    title = meta.get('title')
    thumb = 'https://i.ytimg.com/vi/%s/hqdefault.jpg' % vid
    if not title:
        o = json.loads(get('https://www.youtube.com/oembed?url=%s&format=json'
                           % urllib.parse.quote('https://www.youtube.com/watch?v=' + vid, safe='')))
        title = o.get('title') or ''
        thumb = o.get('thumbnail_url') or thumb
    if not title:
        raise RuntimeError('no title for curated YouTube id ' + vid)
    return {
        'kind': 'youtube', 'id': vid,
        'title': title,
        'sub': meta.get('sub', ''),
        'date': meta.get('date') or datetime.date.today().isoformat(),
        'thumb': thumb,
        'href': 'https://www.youtube.com/watch?v=' + vid,
        'dur': meta.get('dur'),
    }


def nice(d):
    return datetime.date.fromisoformat(d).strftime('%b %Y').upper()


def card(v, i):
    dur = ('<span class="card-dur">%d:%02d</span>' % (v['dur'] // 60, v['dur'] % 60)) if v.get('dur') else ''
    sub = ('<span class="card-sub">%s</span>' % html.escape(v['sub'])) if v.get('sub') else ''
    return f'''      <li class="card" data-kind="{v['kind']}" data-id="{html.escape(v['id'])}">
        <a class="card-link" href="{html.escape(v['href'])}" target="_blank" rel="noopener noreferrer" aria-label="Play: {html.escape(v['title'])}">
          <span class="card-frame">
            <img class="card-img" src="{html.escape(v['thumb'])}" alt="" loading="{'eager' if i < 3 else 'lazy'}" decoding="async" width="640" height="360">
            <span class="card-play" aria-hidden="true">&#9654;</span>
            {dur}
          </span>
          <span class="card-meta">
            <span class="card-title">{html.escape(v['title'])}</span>
            {sub}
            <span class="card-line"><span class="card-kind">{'VIMEO' if v['kind'] == 'vimeo' else 'YOUTUBE'}</span><span class="card-date">{nice(v['date'])}</span></span>
          </span>
        </a>
      </li>'''


def main():
    offline = '--offline' in sys.argv
    cfg = json.load(open(CFG, encoding='utf-8'))
    if offline:
        entries = list(cfg.get('entries') or [])
        if not entries:
            sys.exit('build-transmissions: no cached entries to build from')
        # A curated id added since the last successful fetch still belongs in the
        # reel. It can be built here without the network only if it carries its
        # own title; otherwise say so rather than dropping it silently.
        have = {(v['kind'], v['id']) for v in entries}
        for spec in cfg.get('youtube_ids', []):
            vid = spec['id'] if isinstance(spec, dict) else str(spec)
            if ('youtube', vid) in have:
                continue
            if isinstance(spec, dict) and spec.get('title'):
                entries.append(youtube_one(spec))
            else:
                print('build-transmissions: curated id %s has no cached entry and no title; '
                      'skipped in offline mode' % vid, file=sys.stderr)
        entries.sort(key=lambda v: v['date'], reverse=True)
    else:
        try:
            entries = youtube(cfg['youtube_channel_id'])
            for vid in cfg.get('vimeo_ids', []):
                entries.append(vimeo(vid))
            for spec in cfg.get('youtube_ids', []):
                entries.append(youtube_one(spec))
        except Exception as e:
            sys.exit('build-transmissions: fetch failed, reel left untouched: %s' % e)
        entries.sort(key=lambda v: v['date'], reverse=True)
        cfg['entries'] = entries
        cfg['fetched_at'] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')
        with open(CFG, 'w', encoding='utf-8') as fh:
            json.dump(cfg, fh, indent=1, ensure_ascii=False)
            fh.write('\n')

    page = open(PAGE, encoding='utf-8').read()
    begin, end = '<!-- transmissions:begin -->', '<!-- transmissions:end -->'
    if page.count(begin) != 1 or page.count(end) != 1:
        sys.exit('build-transmissions: markers missing or duplicated in site/index.html')
    body = '\n' + '\n'.join(card(v, i) for i, v in enumerate(entries)) + '\n    '
    page = page[:page.index(begin) + len(begin)] + body + page[page.index(end):]
    n = len(entries)
    page, k = re.subn(r'(<span[^>]*data-tx-count="intro"[^>]*>)\d+(</span>)', r'\g<1>%d\2' % n, page)
    page, k2 = re.subn(r'(<span class="count" id="tx-count"[^>]*>)1 / \d+(</span>)', r'\g<1>1 / %d\2' % n, page)
    if k != 1 or k2 != 1:
        sys.exit('build-transmissions: count spans not found (%d, %d)' % (k, k2))
    open(PAGE, 'w', encoding='utf-8').write(page)
    yt = sum(1 for v in entries if v['kind'] == 'youtube')
    print('wrote %d cards into site/index.html (%d YouTube, %d Vimeo)%s'
          % (n, yt, n - yt, ' from cache' if offline else ''))


if __name__ == '__main__':
    main()
