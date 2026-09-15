# b0b source spider

An identified crawler with an append-only provenance ledger. It exists so that a
citation in the report can be checked against the bytes that were actually read,
on the day they were read, and re-checked later.

```
python3 scripts/spider/spider.py fetch URL [URL ...] --note "what line of work"
python3 scripts/spider/spider.py crawl SEED --depth 2 --max 50
python3 scripts/spider/spider.py verify [URL ...]
python3 scripts/spider/spider.py ledger [--nulls] [--latest] [--host H]
python3 scripts/spider/spider.py text URL
```

`research/sources/ledger.jsonl` is committed. `research/sources/cache/` is not —
bodies are keyed by sha256 and reproducible from the ledger.

## What it will not do

One identity, always, carrying a contact address. robots.txt read and obeyed.
Per-host rate limits, and a backoff ladder when a host pushes back. **No user-agent
rotation, no address rotation, no proxy pools, no forged referers, no challenge
solving, and no retrying a refusal under a second name.**

b0b.dev runs an access gate and a crawler allowlist, and deliberately keeps GPTBot,
CCBot and ClaudeBot out. A tool that disguised itself to defeat another site's
version of that control would be the rule that only bites strangers, which §2 of
the operating memory rules out. The practical case is the stronger one: a document
obtained by defeating an access control is a document with contaminated provenance,
and provenance is the whole asset. One such citation is enough to discredit the rest.

So **a refusal is a finding, not an obstacle.** 403, 401, robots disallow — each is
written to the ledger as a null with host, status and timestamp, exactly as a
successful fetch is, and `ledger --nulls` reads them back grouped by host. That list
is the honest input to a records request or a direct approach to a publisher, which
are the routes that produce a citable document.

## The decoy rule — the reason this is not just curl in a loop

**A 200 that is really a refusal is the most dangerous outcome available**, because it
enters the ledger as a source and nothing downstream questions it. Two live examples,
both HTTP 200, both `text/html`:

- `cia.gov/readingroom` serves its own homepage for every `node/` and `print/`
  document id. The reading room is a JavaScript application; there is no header that
  changes this.
- b0b.dev's own gate answers every path, static assets included, with an 8,607-byte
  pixel page.

`hosts.json` registers known decoys by title, byte length or sha256. A match is
demoted to `reason: decoy_200, ok: false` and never recorded as a source.

## hosts.json

Per-host access requirements: an age-gate cookie the site asks every visitor to set,
a slower pace than the floor, a documented redirect. Each entry carries a `why` that
states what it is and why it is not a disguise. **The user agent is not settable there
and the loader exits if an entry tries.**

## Conventions

- `--note` every run with the research line it belongs to; it lands in each row and
  is how the ledger stays legible a year later.
- `verify` before publishing anything that cites a live page. It re-fetches and
  reports `unchanged / changed / gone / refused` against the recorded hash.
- The ledger is **append-only**. A corrected row is a new row, never an edit — the
  earlier mistake stays visible, which is the same discipline the report applies to
  its own record.
- `text` refuses to flatten a PDF. Extract PDFs locally and read the numbers
  yourself; a model summary of a filing has already invented figures on this project
  once, and must never reach the page.
