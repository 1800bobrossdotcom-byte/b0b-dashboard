# foi — expanding the spider's freedom-of-information sources to every jurisdiction (shared brief)

The b0b.dev report (`/home/user/b0b-dashboard/site/report.html`), subsection
`xvi-the-pattern-is-not-american-international`, lists FOI regimes for: United Kingdom, Australia, Canada, New Zealand,
France, Germany, Israel, Japan, India, South Africa, Brazil, Russia, China — and concealment programmes in those states
(Operation Legacy / the Migrated Archive FCO 141 at Hanslope Park, Bloody Sunday / Saville Inquiry, Porton Down,
Rainbow Warrior, the Algerian War / Maurice Audin, French nuclear tests / Loi Morin, BND Nazi personnel / the 2011–17
historians' commission, the Stasi files, Project Coast / TRC, Unit 731, Maralinga / McClelland Royal Commission,
MKUltra at McGill / Allan Memorial, and others further down the subsection). Read the subsection first:
`cd /home/user/b0b-dashboard && python3 -c "import re,html;s=open('site/report.html',encoding='utf-8').read();i=s.index('id=\"xvi-the-pattern-is-not-american-international\"');j=s.index('<h3 id=',i+10);print(html.unescape(re.sub(r'<[^>]+>','',s[i:j])))"`

The author asked: *"Greatly expand our crawler foia data uses to all"*. Today the crawler (`scripts/spider/spider.py`)
has no FOI source registry at all. Your job: for each jurisdiction in your beat, find and PROBE the sources the crawler
can lawfully read, and return them as registry entries. You do not file any FOI request and you do not create accounts.

Write ONE file: `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/foi/foi-<beat>.md`.
**Do not edit anything in the repository.** The spider appends to `research/sources/ledger.jsonl` itself; that is intended.

## Per jurisdiction, look for these kinds (as many as exist)
- `law` — the FOI statute's official text page (and the year), plus the intelligence-service exemption clause if any.
- `portal` — where requests are filed (record it; never submit anything).
- `disclosure-log` — where agencies PUBLISH released responses (UK gov "FOI releases", Australian agency disclosure logs, Canada's completed ATI request summaries, Brazil's Busca LAI / Fala.BR answers, France CADA opinions, etc.). **Machine-readable data (CSV/JSON/API) is the prize** — e.g. open.canada.ca datasets, data.gouv.fr, dados.gov.br.
- `appeals` — the decisions of the information commissioner / tribunal (UK ICO decision notices, AU OAIC IC reviews, NZ Ombudsman, India CIC, CADA avis): these are public and often searchable.
- `civil-log` — civil-society request logs (Alaveteli sites: WhatDoTheyKnow UK, FYI.org.nz, Right to Know AU, AsktheEU, FragDenStaat DE, Ma Dada FR, etc.). **Check robots.txt carefully — many disallow /search or /request for bots. A disallow is a null, recorded, not worked around.**
- `archive` / `archive-api` — the national archive's online catalogue and any API (UK TNA Discovery API, NAA RecordSearch, LAC, Archives NZ Collections, Bundesarchiv invenio, Stasi-Unterlagen-Archiv, Israel State Archives, JACAR, Abhilekh Patal, Arquivo Nacional SIAN / Memórias Reveladas, Wilson Center Digital Archive for Russia/China, etc.).
- `program` — the specific archive holding a programme named in the subsection (e.g. TNA series FCO 141; the Saville Inquiry report; the TRC report; the McClelland Royal Commission report; the BND historians' commission publications; Project Coast TRC hearings; Unit 731 material in NARA/JACAR).

## Method (non-negotiable)
- **Probe every entry with the spider**, identified, robots obeyed:
  `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch "<url>" --note "foi <beat>: <what>"` and read with
  `python3 scripts/spider/spider.py text "<url>"`. Probe the landing page AND, where one exists, one real record /
  search / API call (e.g. a Discovery API search for "FCO 141"), so we know the data path works, not just the homepage.
- Record the result per entry: HTTP status, ok / refused (403/401/429) / robots-disallowed / decoy (a 200 that is a
  challenge page, a JS shell, a homepage-for-every-id, a "Request Access" page — say which) / not found.
  **A refusal is a finding. Never retry under another identity, never use a browser, never work around a refusal.**
- WebSearch may be used ONLY to find URLs. Never take a fact from a search or WebFetch summary.
- For any factual claim about a source (what it holds, its licence/terms of reuse, the law's year, an API's rate limit)
  give a Q line copied exactly from spider text: `Q | <url> | <exact quote>` (≤ 40 words, one line).
- Note the terms of reuse where stated (OGL, CC BY, Licence Ouverte, etc.) and any API key requirement (we do not
  register for keys; list it as "key required").
- Living-person floor: no living person named in connection with any accusation. Stop rules: substantially-imagery
  documents → stop; anything with a protective-order stamp → stop at identification.

## Output format
For each jurisdiction:
```
## <Country>
### <entry name>
```json
{"id": "gb-tna-discovery-api", "cc": "GB", "kind": "archive-api", "name": "...", "url": "...",
 "search": "https://...{q}...  (or null)", "api": "https://... (or null)", "format": "html|json|csv|xml|pdf",
 "terms": "...", "key_required": false, "programs": ["Operation Legacy (FCO 141)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok|refused|robots|decoy|not_found", "sample": "<the record/search URL probed>"},
 "use": "one sentence: what the crawler can get here",
 "limits": "one sentence: what it cannot"}
```
Q | <url> | <exact quote>
```
Then: `## Decoy candidates for hosts.json` (host, the decoy's title or byte length, why), `## Nulls`, and
`## Sources fetched`. Aim for 6–12 entries per jurisdiction where they exist; for Russia and China, say plainly what
does NOT exist and what proxies do (Wilson Center, the Mitrokhin papers at Churchill Archives, state OGI annual reports).
