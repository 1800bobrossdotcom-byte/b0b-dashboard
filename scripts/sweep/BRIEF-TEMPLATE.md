# {RUN} — current-events sweep, {WINDOW} (shared brief)

You are one of three researchers on a current-events sweep for the b0b.dev OSINT report
(`/home/user/b0b-dashboard/site/report.html`). The report's last dated update is Section XV
`{LAST_ID}`, the most recent dated update. Your job is the window **since that update: {WINDOW}**, plus a status check on the open threads named in your beat.

You research and write ONE file: `{SCRATCH}/{RUN}-<beat>.md`.
**Do not edit anything in the repository.** The spider appends to `research/sources/ledger.jsonl` by itself; that is the
only repo file that changes, and that is intended.

## Read first (5 minutes)

1. `/home/user/b0b-dashboard/research/sources/CURRENT-EVENTS-SOURCES.md` — where to look and what each source may do.
2. The last update on the page, in plain text:
   `cd /home/user/b0b-dashboard && python3 -c "import re,html;s=open('site/report.html',encoding='utf-8').read();i=s.index('id=\"{LAST_ID}\"');j=s.index('<h3 id=',i+10);print(html.unescape(re.sub(r'<[^>]+>','',s[i:j])))"`
3. Your checklist of open threads: the "Open threads" of the newest current-events sweep entry in CLAUDE.md §7, plus the page's last update itself.

## Method (non-negotiable)

- **Leads:** the Wikipedia day pages `https://en.wikipedia.org/wiki/Portal:Current_events/{DAY_PAGES}` (one per day in the window; today's may be thin or missing — then use named outlets directly) (the day pages, never the monthly page), fetched with the spider. WebSearch may be used to FIND outlet URLs only.
- **Every item you report is read at a named outlet or the primary document, fetched with the spider:**
  `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch "<url>" --note "{RUN} <beat>: <what>"`
  then read it with `python3 scripts/spider/spider.py text "<url>"`.
  **Never take a quote or a figure from a WebFetch or WebSearch summary** — those summarising models have invented
  figures on this project before. If the spider is refused (403, 401, robots, decoy page), that is a **null**: record
  it and move on. Never retry under another identity, never work around a refusal.
- **Date-check everything.** Searches for 2026 routinely return 2025 items. An item outside the window is out of
  window unless it is a status check on an open thread.
- **Quotes:** every quote you give must be copied exactly from the spider text, on a line of the form
  `Q | <url> | <exact quote>` so it can be machine-checked. Paraphrase is fine in the prose; figures in prose must also
  appear in a Q line.
- **Symmetry:** for every claim by one party, look for the other party's account in an outlet that reports it, and
  print both. Casualty figures carry whose count they are.
- **Attribution:** no attacker, operator or perpetrator is named unless an official or attributed claim names it, and
  then it is printed as that party's claim.

## Hard rules (the report's standing constraints)

- **Living-person floor.** No living, uncharged person is asserted or implied to be a criminal or an intelligence asset.
  Arrested or accused but uncharged/untried people are described **by role, not named**, in the prose meant for the
  page; put names (if you must record them) only in a `WITHHELD` list at the end.
- **No victims named.** No survivors named. No children named.
- **Stop rules:** if a document is substantially imagery, stop. If it is an FBI FD-302, a victim interview, or carries a
  protective-order stamp, stop at identification and do not read on.
- **No residence house numbers. No numerology** (dates and digits are facts, never read for meaning).
- Do not call b0b.dev "the institution" or "the Institute".

## Output format (your file)

```
# {RUN} — <beat>, {WINDOW}

## 1. <Headline>
- **<date>:** what happened, in two or three plain sentences.
Q | <url> | <exact quote>
TIER: documented / attributed / labeled / contested / unsupported — and why
SYMMETRY: the other side's account, or "none found in outlets read"
NULL: refusals and unread sources

## Open threads — status
- <thread>: new event / "no new event found in outlets read" (that is a search null, not a finding)

## Not for the page (with the reason)
## WITHHELD (names and details under the floor)
```

Keep it to what is verified: about 4–12 items. A short window may have little; say so plainly rather than pad.
Finish with a one-paragraph summary at the top of the file of what is new and what is not.
