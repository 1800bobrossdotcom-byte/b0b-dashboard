#!/usr/bin/env python3
"""b0b source spider - an identified crawler with a provenance ledger.

WHAT THIS IS FOR
    The report's authority rests on sources a reader can check. That requires
    three things this tool provides and ad-hoc curl does not: the bytes as they
    were on the day they were read, a hash of those bytes, and a record of the
    fetch that produced them. `verify` re-fetches a recorded source later and
    says whether it changed, moved or vanished - which is how a citation to a
    live page stops being a hostage to link rot and silent edits.

WHAT IT REFUSES TO DO, AND WHY IT IS BUILT THIS WAY
    It sends ONE identity, always, with a contact URL. It reads robots.txt and
    obeys it. It rate-limits per host and backs off when told to. It does not
    rotate user agents, rotate addresses, route through proxy pools, forge
    referers, solve challenges, or retry a refusal under a second name.

    That is not squeamishness, it is the project's own rule applied to itself.
    b0b.dev runs an access gate and a crawler allowlist, and deliberately keeps
    GPTBot, CCBot and ClaudeBot out. A tool that disguised itself to defeat
    another site's version of the same control would be the rule that only
    bites strangers, and §2 of the operating memory says a rule that only bites
    strangers is not a rule.

    The practical argument is stronger than the principled one. A document
    acquired by defeating a publisher's access control is a document whose
    provenance is contaminated, and provenance is the entire asset. One such
    citation is enough for an adversary to discredit the rest. So:

        A REFUSAL IS A FINDING, NOT AN OBSTACLE.

    A 403, a 401, a robots disallow - each is written to the ledger as a null,
    with its host, status and timestamp, exactly as a positive fetch is. That is
    the same discipline the report applies to evidence: publish the null at
    equal prominence. Nulls are queryable with `ledger --nulls`, which is also
    the honest input to a records request or a direct approach to a publisher.

USAGE
    spider.py fetch URL [URL ...]          fetch, cache, and record
    spider.py crawl SEED --depth 2         follow links within the seed's host
    spider.py verify [URL ...]             re-fetch recorded sources, diff hashes
    spider.py ledger [--nulls] [--host H]  read the record back
    spider.py text URL                     cached bytes -> text on stdout

    Cached bodies live in research/sources/cache/ and are NOT committed.
    The ledger at research/sources/ledger.jsonl IS committed: it is append-only
    and it is the audit trail.
"""

import argparse
import datetime
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.robotparser

try:
    import requests
except ImportError:
    sys.exit('spider: requests is required (pip install requests)')

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(ROOT, 'research', 'sources')
CACHE_DIR = os.path.join(SRC_DIR, 'cache')
LEDGER = os.path.join(SRC_DIR, 'ledger.jsonl')
HOSTS_CFG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'hosts.json')

# One identity. Overridable so the contact address can be corrected without a
# code change - NOT so the crawler can wear a different face per host.
DEFAULT_UA = ('b0bSourceBot/1.0 (+https://www.b0b.dev/; OSINT source '
              'verification for b0b.dev/report; contact via /.well-known/security.txt)')
UA = os.environ.get('B0B_SPIDER_UA', DEFAULT_UA)

DEFAULT_DELAY = 2.0          # seconds between requests to one host, floor
TIMEOUT = 45
BACKOFF = [5, 15, 35, 60, 90]  # the DOJ/Akamai ladder, which applies well enough elsewhere
MAX_BYTES = 80 * 1024 * 1024

_last_hit = {}     # host -> monotonic time of last request
_robots = {}       # host -> (RobotFileParser|None, crawl_delay|None)


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')


def load_hosts():
    """Per-host access requirements.

    These are documented interaction requirements - an age-gate cookie a site
    asks every visitor to set, a redirect that needs following - not disguises.
    The user agent is deliberately not settable here.
    """
    if not os.path.exists(HOSTS_CFG):
        return {}
    cfg = {k: v for k, v in json.load(open(HOSTS_CFG, encoding='utf-8')).items()
           if not k.startswith('_')}
    for host, prof in cfg.items():
        for banned in ('user-agent', 'User-Agent', 'ua'):
            if banned in prof.get('headers', {}) or banned in prof:
                sys.exit('spider: hosts.json must not override the user agent (%s)' % host)
    return cfg


HOSTS = load_hosts()


def profile(url):
    host = urllib.parse.urlparse(url).netloc.lower()
    for key, prof in HOSTS.items():
        if host == key or host.endswith('.' + key):
            return prof
    return {}


def robots_for(url, session):
    """Fetch and cache robots.txt. A host that will not serve robots.txt is
    treated as permissive - absence of a rule is not a rule - but a robots.txt
    that disallows is obeyed without argument."""
    p = urllib.parse.urlparse(url)
    host = p.netloc.lower()
    if host in _robots:
        return _robots[host]
    rp = urllib.robotparser.RobotFileParser()
    delay = None
    try:
        r = session.get('%s://%s/robots.txt' % (p.scheme, host),
                        headers={'User-Agent': UA}, timeout=20)
        if r.status_code == 200:
            rp.parse(r.text.splitlines())
            try:
                delay = rp.crawl_delay(UA)
            except Exception:
                delay = None
        else:
            rp = None
    except Exception:
        rp = None
    _robots[host] = (rp, delay)
    return _robots[host]


def throttle(url, extra_delay=None):
    host = urllib.parse.urlparse(url).netloc.lower()
    prof = profile(url)
    wait = max(DEFAULT_DELAY, float(prof.get('delay', 0)), float(extra_delay or 0))
    last = _last_hit.get(host)
    if last is not None:
        gap = time.monotonic() - last
        if gap < wait:
            time.sleep(wait - gap)
    _last_hit[host] = time.monotonic()


def cache_path(digest):
    return os.path.join(CACHE_DIR, digest[:2], digest)


def append(rec):
    os.makedirs(SRC_DIR, exist_ok=True)
    with open(LEDGER, 'a', encoding='utf-8') as fh:
        fh.write(json.dumps(rec, ensure_ascii=False, sort_keys=True) + '\n')
    return rec


def read_ledger():
    if not os.path.exists(LEDGER):
        return []
    out = []
    for line in open(LEDGER, encoding='utf-8'):
        line = line.strip()
        if line:
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    return out


def latest_by_url():
    seen = {}
    for rec in read_ledger():
        seen[rec['url']] = rec
    return seen


def title_of(body, ctype):
    if 'html' not in (ctype or ''):
        return None
    try:
        text = body[:200000].decode('utf-8', 'replace')
    except Exception:
        return None
    m = re.search(r'<title[^>]*>(.*?)</title>', text, re.S | re.I)
    return re.sub(r'\s+', ' ', html.unescape(m.group(1))).strip()[:300] if m else None


def fetch(url, session, note=None, conditional=True, quiet=False):
    """Fetch one URL and write exactly one ledger row. Returns the row.

    Every terminal outcome is recorded, including every refusal. Nothing is
    retried under a different identity; a refusal ends the attempt.
    """
    rec = {'url': url, 'fetched_at': now(), 'ua': UA}
    if note:
        rec['note'] = note

    rp, crawl_delay = robots_for(url, session)
    rec['robots'] = 'absent' if rp is None else 'present'
    if rp is not None and not rp.can_fetch(UA, url):
        rec.update(reason='robots_disallow', status=None, ok=False)
        if not quiet:
            print('robots disallow  %s' % url)
        return append(rec)
    if crawl_delay:
        rec['crawl_delay'] = crawl_delay

    prof = profile(url)
    headers = {'User-Agent': UA, 'Accept': '*/*', 'Accept-Encoding': 'gzip, deflate'}
    headers.update(prof.get('headers', {}))
    cookies = dict(prof.get('cookies', {}))
    if prof.get('why'):
        rec['profile_reason'] = prof['why']

    prior = latest_by_url().get(url) if conditional else None
    if prior and prior.get('ok'):
        if prior.get('etag'):
            headers['If-None-Match'] = prior['etag']
        elif prior.get('last_modified'):
            headers['If-Modified-Since'] = prior['last_modified']

    for attempt in range(len(BACKOFF) + 1):
        throttle(url, crawl_delay)
        try:
            r = session.get(url, headers=headers, cookies=cookies, timeout=TIMEOUT,
                            allow_redirects=True, stream=True)
        except requests.RequestException as e:
            rec.update(reason='transport_error', status=None, ok=False,
                       error=str(e)[:300])
            if attempt < len(BACKOFF):
                time.sleep(BACKOFF[attempt])
                continue
            if not quiet:
                print('transport error  %s  %s' % (url, rec['error']))
            return append(rec)

        rec['status'] = r.status_code
        rec['final_url'] = r.url

        # 401 is a rate-limit signal on Akamai-fronted DOJ, not only an auth
        # failure, which is why it shares the backoff ladder with 429/503.
        if r.status_code in (401, 429, 500, 502, 503, 504) and attempt < len(BACKOFF):
            r.close()
            time.sleep(BACKOFF[attempt])
            continue

        if r.status_code == 304:
            r.close()
            rec.update(reason='not_modified', ok=True,
                       sha256=prior.get('sha256'), cache=prior.get('cache'),
                       bytes=prior.get('bytes'), content_type=prior.get('content_type'))
            if not quiet:
                print('unchanged        %s' % url)
            return append(rec)

        if r.status_code != 200:
            r.close()
            rec.update(reason='http_%d' % r.status_code, ok=False)
            if not quiet:
                print('refused %-4s     %s' % (r.status_code, url))
            return append(rec)

        chunks, total = [], 0
        for chunk in r.iter_content(65536):
            total += len(chunk)
            if total > MAX_BYTES:
                r.close()
                rec.update(reason='too_large', ok=False, bytes=total)
                if not quiet:
                    print('too large        %s' % url)
                return append(rec)
            chunks.append(chunk)
        r.close()
        body = b''.join(chunks)
        digest = hashlib.sha256(body).hexdigest()
        path = cache_path(digest)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if not os.path.exists(path):
            with open(path, 'wb') as fh:
                fh.write(body)

        ctype = (r.headers.get('Content-Type') or '').split(';')[0].strip().lower()
        t = title_of(body, ctype)

        # A 200 that is really a refusal is the worst outcome available: it enters
        # the ledger as a source. cia.gov/readingroom serves its homepage for every
        # document id; b0b.dev's own gate serves an 8,607-byte pixel page on every
        # path. Both are HTTP 200. Known decoys are demoted to nulls here so the
        # ledger never carries a block page as evidence.
        decoy = None
        if digest in set(prof.get('decoy_sha256', [])):
            decoy = 'sha256'
        elif t and any(s.lower() in t.lower() for s in prof.get('decoy_titles', [])):
            decoy = 'title'
        elif len(body) in set(prof.get('decoy_bytes', [])):
            decoy = 'bytes'
        elif any(m.encode() in body[:8192] for m in prof.get('decoy_markers', [])):
            # a challenge page whose size and (blank) title vary: match a fixed
            # marker in its opening bytes. Recorded, never solved.
            decoy = 'marker'
        if decoy:
            rec.update(reason='decoy_200', ok=False, sha256=digest, bytes=len(body),
                       content_type=ctype, decoy_match=decoy, title=t)
            if not quiet:
                print('decoy 200        %s  (matched on %s)' % (url, decoy))
            return append(rec)

        rec.update(reason='ok', ok=True, sha256=digest, bytes=len(body),
                   content_type=ctype,
                   cache=os.path.relpath(path, ROOT),
                   etag=r.headers.get('ETag'),
                   last_modified=r.headers.get('Last-Modified'))
        if t:
            rec['title'] = t
        if not quiet:
            changed = ''
            if prior and prior.get('sha256') and prior['sha256'] != digest:
                changed = '  CHANGED since %s' % prior['fetched_at']
            print('ok  %8d B  %s%s' % (len(body), url, changed))
        return append(rec)

    rec.setdefault('reason', 'exhausted')
    rec['ok'] = False
    if not quiet:
        print('exhausted        %s' % url)
    return append(rec)


LINK_RE = re.compile(rb'<a\b[^>]*?href=["\']([^"\'#]+)', re.I)


def links_from(body, base):
    out = []
    for m in LINK_RE.finditer(body[:4 * 1024 * 1024]):
        href = html.unescape(m.group(1).decode('utf-8', 'replace')).strip()
        if href.lower().startswith(('javascript:', 'mailto:', 'tel:', 'data:')):
            continue
        out.append(urllib.parse.urldefrag(urllib.parse.urljoin(base, href))[0])
    return out


def cmd_crawl(args, session):
    seed_host = urllib.parse.urlparse(args.seed).netloc.lower()
    allowed = {seed_host} | {h.lower() for h in (args.allow_host or [])}
    queue = [(args.seed, 0)]
    seen = set()
    fetched = 0
    while queue and fetched < args.max:
        url, depth = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)
        host = urllib.parse.urlparse(url).netloc.lower()
        if host not in allowed:
            continue
        rec = fetch(url, session, note=args.note)
        fetched += 1
        if not rec.get('ok') or depth >= args.depth:
            continue
        if 'html' not in (rec.get('content_type') or ''):
            continue
        cache = os.path.join(ROOT, rec['cache']) if rec.get('cache') else None
        if not cache or not os.path.exists(cache):
            continue
        body = open(cache, 'rb').read()
        for link in links_from(body, rec.get('final_url') or url):
            if link not in seen:
                queue.append((link, depth + 1))
    print('\n%d fetched, %d refusals recorded'
          % (fetched, sum(1 for r in read_ledger()[-fetched:] if not r.get('ok'))))


def cmd_verify(args, session):
    targets = args.urls or [u for u, r in sorted(latest_by_url().items()) if r.get('ok')]
    if not targets:
        print('nothing recorded to verify')
        return
    prior = latest_by_url()
    changed, gone, same, refused = [], [], [], []
    for url in targets:
        before = prior.get(url, {}).get('sha256')
        rec = fetch(url, session, note='verify', conditional=False, quiet=True)
        if not rec.get('ok'):
            (gone if rec.get('status') == 404 else refused).append((url, rec['reason']))
        elif before and rec['sha256'] != before:
            changed.append(url)
        else:
            same.append(url)
    print('VERIFY  %d unchanged  %d changed  %d gone  %d refused' %
          (len(same), len(changed), len(gone), len(refused)))
    for u in changed:
        print('  CHANGED  %s' % u)
    for u, why in gone:
        print('  GONE     %s  (%s)' % (u, why))
    for u, why in refused:
        print('  REFUSED  %s  (%s)' % (u, why))


def cmd_ledger(args, _session):
    rows = read_ledger()
    if args.host:
        rows = [r for r in rows
                if args.host.lower() in urllib.parse.urlparse(r['url']).netloc.lower()]
    if args.nulls:
        rows = [r for r in rows if not r.get('ok')]
    if args.latest:
        keep = {}
        for r in rows:
            keep[r['url']] = r
        rows = [keep[k] for k in sorted(keep)]
    for r in rows:
        print('%s  %-16s %-6s %s' % (r['fetched_at'], r.get('reason', '?'),
                                     r.get('status', '-'), r['url']))
    if args.nulls:
        hosts = {}
        for r in rows:
            hosts[urllib.parse.urlparse(r['url']).netloc.lower()] = \
                hosts.get(urllib.parse.urlparse(r['url']).netloc.lower(), 0) + 1
        print('\nrefusals by host (each one is a null, not a target):')
        for h, n in sorted(hosts.items(), key=lambda kv: -kv[1]):
            print('  %4d  %s' % (n, h))


def cmd_text(args, _session):
    rec = latest_by_url().get(args.url)
    if not rec or not rec.get('cache'):
        sys.exit('spider: no cached body for %s - fetch it first' % args.url)
    body = open(os.path.join(ROOT, rec['cache']), 'rb').read()
    ctype = rec.get('content_type') or ''
    if 'pdf' in ctype or body[:5] == b'%PDF-':
        sys.exit('spider: %s is a PDF. Extract it locally with a PDF tool and read '
                 'the numbers yourself - never from a model summary.' % args.url)
    s = body.decode('utf-8', 'replace')
    s = re.sub(r'<(script|style)\b.*?</\1>', ' ', s, flags=re.S | re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    sys.stdout.write(re.sub(r'[ \t]+', ' ', html.unescape(s)).strip() + '\n')


def cmd_fetch(args, session):
    for url in args.urls:
        fetch(url, session, note=args.note)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    sub = ap.add_subparsers(dest='cmd', required=True)

    f = sub.add_parser('fetch', help='fetch and record one or more URLs')
    f.add_argument('urls', nargs='+')
    f.add_argument('--note')
    f.set_defaults(fn=cmd_fetch)

    c = sub.add_parser('crawl', help='follow links within the seed host')
    c.add_argument('seed')
    c.add_argument('--depth', type=int, default=1)
    c.add_argument('--max', type=int, default=50)
    c.add_argument('--allow-host', action='append')
    c.add_argument('--note')
    c.set_defaults(fn=cmd_crawl)

    v = sub.add_parser('verify', help='re-fetch recorded sources and diff hashes')
    v.add_argument('urls', nargs='*')
    v.set_defaults(fn=cmd_verify)

    l = sub.add_parser('ledger', help='read the provenance record back')
    l.add_argument('--nulls', action='store_true', help='refusals only')
    l.add_argument('--host')
    l.add_argument('--latest', action='store_true', help='one row per URL')
    l.set_defaults(fn=cmd_ledger)

    t = sub.add_parser('text', help='cached bytes to text on stdout')
    t.add_argument('url')
    t.set_defaults(fn=cmd_text)

    args = ap.parse_args()
    os.makedirs(CACHE_DIR, exist_ok=True)
    with requests.Session() as session:
        session.max_redirects = 10
        args.fn(args, session)


if __name__ == '__main__':
    main()
