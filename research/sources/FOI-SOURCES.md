# Freedom-of-information sources: what the crawler can read, by jurisdiction

Built 24 Oct 2026. The author asked: *"Greatly expand our crawler foia data uses to all"*, pointing at XVI
`xvi-the-pattern-is-not-american-international` (the FOI table and the concealment programmes).

Before this the spider had no FOI registry. Its US reading rooms were mostly nulls: the CIA reading room is a decoy
and the FBI Vault answers 403.

## Where it lives

- **`scripts/spider/foi-sources.json`:** 135 sources across 15 jurisdictions: the US, the 13 in XVI's table, and the
  EU. Every entry was probed through the spider and ledgered, and each carries its probe result.
- **`scripts/spider/spider.py foi`:**
  - `list [--cc GB] [--kind archive-api] [--program "FCO 141"]` shows what is in the registry and how each probe
    came back.
  - `probe [--cc ..] [--write]` re-tests the landing page and the sample record, and `--write` stores the result.
  - `search QUERY --id ID` runs one source's own search or API.
  - `find QUERY [--cc ..]` runs every searchable source that last answered, which makes it a cross-archive
    search.
  - **Nothing in it files a request, registers for a key, uses a browser or retries a refusal.**
- **The research behind every entry, including its quotes:**
  - `research/sources/foi/FOI-A-US-FIVE-EYES.md`;
  - `research/sources/foi/FOI-B-EUROPE-ISRAEL-RUSSIA.md`;
  - `research/sources/foi/FOI-C-ASIA-AFRICA-LATAM.md`;
  - the brief, `research/sources/foi/BRIEF.md`.
  - 229 quotes in all, every one `vq.py` OK against the cache.

## By jurisdiction

| Jurisdiction | Sources | Answered | Searchable now (`find` uses these) |
|---|---|---|---|
| United States | 21 | 15 | `us-archive-org-search`; with the key also `us-regulations-api` |
| United Kingdom | 8 | 6 | `gb-tna-discovery-api`, `gb-govuk-foi-releases`, `gb-porton-down` |
| Australia | 6 | 3 | - |
| Canada | 6 | 5 | `ca-open-ckan` |
| New Zealand | 3 | 2 | `nz-digitalnz-api` |
| France | 13 | 9 | `fr-shd` |
| Germany | 10 | 7 | - (FragDenStaat opted out, see below) |
| Israel | 11 | 8 | `il-mfoi` |
| Russia | 8 | 6 | - |
| European Union | 9 | 3 | - |
| Japan | 7 | 7 | `jp-jacar-search`, `jp-naj-digital-archive`, `jp-egov-api-info-disclosure-act` |
| India | 7 | 4 | - |
| South Africa | 9 | 8 | - |
| Brazil | 9 | 3 | - |
| China | 8 | 6 | - |

**"Answered"** means the last probe returned real content. The other states are refused, robots, decoy or
unreachable. Each is in the registry with its date.

**Every searchable source was proven to filter:** two different queries returned two different bodies. The French
CADA search answered once and then refused 403 to both test queries, so it is marked refused.

## The data paths that matter most

- **UK, TNA Discovery API:** keyless JSON under the Open Government Licence, about 3,000 calls a day.
  - The `FCO 141` series (the Migrated Archive, Operation Legacy) returns 21,388 catalogue items.
  - "Porton Down" is searchable.
  - Access to the FCO 141 files themselves was reportedly withdrawn in 2022. That was seen in search only and not
    read at source; the catalogue still reads.
- **Canada, completed access-to-information summaries:** a keyless CKAN datastore of 205,063 rows under the Open
  Government Licence – Canada. Filter by `owner_org`; `q=` answers 409. The crawl delay is 20 s.
- **Japan:**
  - **e-Gov law API** (JSON); the human law pages are JavaScript shells.
  - **JACAR:** search with `kw0`. The obvious `keyword=` is silently ignored and returns all 2,481,992 records.
  - **National Archives of Japan digital archive.**
  - Unit 731 material is in both archives: 183 JACAR entries for the Ishii unit and 155 at NAJ for 防疫給水部.
- **South Africa:**
  - the TRC CBW (Project Coast) hearing transcripts `cbw1`–`cbw22`;
  - TRC Volumes 1–7;
  - SAHA finding aids AL2878 (the FOI programme) and AL2922 (CBW/Project Coast, with an A3 "Project Coast Records"
    series).
- **France:**
  - the CADA opinions open dataset (CSV, Licence Ouverte), covering to 30 Apr 2024;
  - DILA's open-data dumps for statute text (Légifrance answers 403);
  - the Service historique de la Défense search: "Audin" returns 21 results;
  - the Assemblée nationale's nuclear-test inquiry: 233 declassified documents;
  - CIVEN (Loi Morin compensation).
- **Israel:** the Movement for Freedom of Information's copies of the military censor's annual figures, the IDF
  archive's 50-year declassification rules, and Akevot's file counts. The state's own hosts refused.
- **Germany:**
  - the Stasi records pages on `bundesarchiv.de`;
  - the IFG text;
  - FragDenStaat's API works but is opted out (below).
- **EU:** the Cellar SPARQL endpoint and the European Parliament open-data API (keyless, CC BY 4.0). EUR-Lex,
  `curia.europa.eu` and the Council register refused.
- **US:**
  - the NARA JFK release pages (2,709 links, the PDFs fetch);
  - the ODNI, DHS and DOJ OIP reading rooms;
  - the National Security Archive, the Black Vault, GovernmentAttic;
  - archive.org's keyless advanced search.
- **Russia and China:**
  - **Russia:** Federal Law 8-FZ (2009) is a real access-to-information law, read via the Cyrilla English copy.
  - **China:** the 2019 OGI Regulations and the 2024 State Secrets Law are readable.
  - The proxies that load: the Churchill Archives (Mitrokhin papers), Hoover's Fond 89 page, the Bukovsky copies.
  - The Wilson Center Digital Archive was unreachable from here (502).

## Refused, recorded and not worked around

- **US:** NSA, State, DoD, DIA, the FBI Vault, MuckRock and DocumentCloud (403). The NARA catalog API is
  robots-disallowed.
- **Keyed APIs:** FOIA.gov, govinfo, Congress.gov and Regulations.gov need the api.data.gov key. It is wired, and
  waits on the author's key (see the section below).
- **UK:** WhatDoTheyKnow (403 everywhere).
- **Australia:** NAA RecordSearch (403); AustLII (403).
- **Canada and Germany:** LAC's search is robots-disallowed; Bundesarchiv invenio (403).
- **Israel:** archives.gov.il, gov.il and data.gov.il (403).
- **Russia:** rusarchives.ru (connection reset).
- **India and Brazil:**
  - the CIC decisions app is a shell;
  - Abhilekh Patal returns 202 with an empty body;
  - Busca LAI and Fala.BR are shells;
  - dados.gov.br answers 401;
  - SIAN serves a bot challenge.
- **The rest** are listed per entry in the registry and in the beat notes.

**A refusal is a finding.** `spider.py ledger --nulls` groups them by host, and that list is the input to a records
request or a direct approach.

## The api.data.gov key (the author's decision, 24 Oct 2026: "Lets do 2")

The api.data.gov signup page runs reCAPTCHA, so the key is the author's to request, and the crawler never solves a
challenge. Once he has it, it lives in the cloud environment's settings, never in the repository or the chat:
- as a Network secret where that section is offered,
- or otherwise as the environment variable **`API_DATA_GOV_KEY`**.

New sessions, the scheduled sweep included, pick it up.

**How the spider uses it:**
- `hosts.json` marks `api.govinfo.gov`, `api.foia.gov`, `api.congress.gov`, `api.regulations.gov` and
  `api.open.fec.gov` with `api_key_env`.
- The key is sent as the `X-Api-Key` header, which api.data.gov accepts in place of the `api_key` URL parameter.
- The ledger records only whether a key was sent (`auth`), never its value.
- **A URL carrying a key or token is refused outright**, because the ledger is public. api.data.gov's own public
  `DEMO_KEY` is the one exception.
- Without the variable, `foi search` and `foi find` skip these sources with a "no key" line instead of spending
  minutes on the 401 backoff ladder.

**Tested 24 Oct with `DEMO_KEY` as the header:**

| Source | Result |
|---|---|
| Regulations.gov search | 200 |
| Congress.gov bills | 200 |
| FOIA.gov agency directory | 200 |
| govinfo | 429: DEMO_KEY is rate-limited per IP |

**What the key opens:**
- **Congress.gov:** bills, actions, texts and House roll calls; the discharge-petition and war-powers threads the sweep
  follows.
- **Regulations.gov:** every rulemaking docket, searchable.
- **GovInfo:** hearings, committee reports, the Federal Register and court opinions, by package.
- **FOIA.gov:** the agency directory.

**Not opened by it:** NARA's catalog API. It takes a separate key from NARA, and catalog.archives.gov's robots.txt
disallows it anyway.

## Opted out of AI-run crawling: the author's call (FragDenStaat: stays skipped, his "skip 1", 24 Oct)

- **FragDenStaat** (`fragdenstaat.de/robots.txt`: `User-agent: ClaudeBot` / `Disallow: /`, and the same for GPTBot).
  - Our crawler runs under its own name, so robots lets it in.
  - The site's intent toward AI-run crawling is plain, and this crawler is run by an AI assistant.
  - **It was probed and queried on 24 Oct before this was noticed** (ledgered).
  - It is now marked `optout`. `find` and `search` skip it unless `--include-optout` is passed.
- **LawLibrary / SAFLII (ZA):** robots declares `Content-Signal: ai-input=no`. Marked `optout`; it answered 403
  anyway.
- **Training only:** nationalarchives.gov.uk, AustLII and Right to Know publish `Content-Signal: ai-train=no`. That
  covers training, and our use is reference, so they stay in use.

## Decoys registered in `hosts.json` (proven both ways, 24 Oct)

- **CIA:** reading-room document and PDF URLs redirect to `/system-maintenance/`, a 508,740 B page.
  - It is matched by redirect path, a new rule type `decoy_redirect_paths`.
  - The title sits past the 200 KB the title reader scans, so a title rule cannot catch it.
  - **Two such rows were ledgered `ok` today before the rule existed. Do not cite them.**
- **Imperva 212 B shells:** Archives NZ, GCSB, NZSIS, the National Library of NZ, the Australian PM&C.
- **The National Library of Australia's Anubis challenge.**
- **JavaScript shells:**
  - the FOIA.gov search shell;
  - DOE OpenNet;
  - the EU Ombudsman decisions page;
  - the Commission documents register;
  - e-Gov outside `/api/`;
  - Informa.BR / Busca LAI and Fala.BR;
  - the CIC decision search;
  - gov.cn's OGI search shell.
- **JavaScript / cookie walls:** FranceArchives and vie-publique PDFs.
- **Domains that no longer serve the source:**
  - `www.uhk-bnd.de`: the BND historians' commission domain is now a sports-betting site;
  - `stasi-unterlagen-archiv.de`: an alias that returns the homepage for every path. The real pages are on
    `bundesarchiv.de`.
- **Interstitials and blocks:**
  - the Bundesarchiv Digitaler Lesesaal wait page;
  - the Knesset geo-block ("inaccessible from your location");
  - the F5 challenge on SIAN and the Arquivo Nacional;
  - the mfa.gov.cn maintenance page served as robots.txt.
- **The test:** every rule was run against the cached bodies.
  - The decoys were demoted.
  - The real pages on the same hosts were kept: bundesarchiv.de, the e-Gov `/api/` JSON, DigitalNZ records, cia.gov
    `/static/` PDFs, gov.cn statute pages.
  - Two were re-fetched live: the CIA maintenance redirect and uhk-bnd.de are now `decoy_200`.

## Fixed in the spider on the way

- **Pages are decoded in their declared charset.** Japanese government pages are Shift_JIS. `text` and the
  `vq.py` quote checker used to read them as mojibake, and a true quote failed. Both now share `decode_body()`.

## Lines on the report this survey contradicts: flagged, NOT edited (the author's call)

In XVI's FOI table and programme list:

1. **Japan:** "Designated Secrets Act (2013) allows 60-year classification". The Act caps at 30 years and extends to
   60 only with listed exceptions.
2. **India:** "RAW and IB exempt". RTI Act s.24's proviso keeps information on corruption and human-rights
   violations inside the Act even for the exempt bodies.
3. **China:** "No declassification mechanism exists". The 2024 State Secrets Law Art. 24: a secret whose period has
   run declassifies by itself (自行解密). No public register, request channel or searchable declassified archive was
   found, so the practical point stands but the sentence is wrong as written.
4. **Russia:** "No comprehensive FOIA equivalent". Federal Law 8-FZ (2009) exists. The RTI Rating says state-secrets
   law is not overridden by it, so name the law and state its limit.
5. **South Africa:** "Project Coast records mostly burned". The TRC passage read says a named official agreed to the
   destruction of documents. "Mostly" is not in what was read.
6. **"Unit 731 records partially surfaced through U.S. FOIA, not Japanese disclosure":** JACAR and NAJ hold
   catalogued entries. They were not opened, so the line is unverified rather than shown wrong.
7. **Not checked:** "Putin sealed presidential archives for 30 years in 2006"; Brazil's SNI line.

## Next, if the author wants it

- **Run `foi find` inside the current-events sweep and the research briefs.** It is a cross-archive search in one
  command.
- **His calls:**
  - a free api.data.gov key (FOIA.gov, govinfo, NARA, Regulations.gov);
  - FragDenStaat (`--include-optout`);
  - the seven page lines above.
- **Not built:** bulk downloads (the Canada ATI CSV is 117 MB; the DILA dumps). The registry points at them; pulling
  them is a separate decision about disk and licence.
