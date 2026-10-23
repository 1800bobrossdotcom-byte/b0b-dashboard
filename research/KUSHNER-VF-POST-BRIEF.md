# kushner — grading a viral post about Jared Kushner, Dutch intelligence and Gulf money (shared brief)

The author of the b0b.dev OSINT report (`/home/user/b0b-dashboard/site/report.html`) pasted the post below with no
instruction. As with the last one, the job is to grade every claim in your beat against the record, at the report's
tiers, reading every source at source. **Research only. Nothing goes on the page.** Jared Kushner and Steve Witkoff are
living and uncharged, and the claims are defamation-adjacent, so the file is held for the author.

You write ONE file: `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/kushner-<beat>.md`
(beat = `A` or `B`). **Do not edit anything in the repository.** The spider appends to `research/sources/ledger.jsonl`
by itself; that is the only repo file that changes, and that is intended.

## Tiers (use these words exactly)

- **documented** — a primary record (court filing, regulatory filing, an official statement, a government document, the
  person's own recorded words) read at source, or a named outlet quoting that record directly.
- **attributed** — one named source says so (a book, an outlet's unnamed sources, a single official). Say whose claim.
  **An anonymous source quoted in a book excerpt is attributed to the book's author and the outlet, never documented.**
- **contested** — sources conflict; print both.
- **unsupported** — nothing found at any tier, including in the excerpt the post cites.
- Also mark, where it applies: **not in the source** (the post says the excerpt says X; the excerpt does not),
  **naming error** (e.g. an investment into a fund read as money "placed for him"), **chronology error**,
  **overstated**, **framing** (rhetoric, not a factual claim; say so and do not grade it as fact).

**The single most important test for beat A: does the Vanity Fair excerpt actually say each thing the post says it says?**
Viral summaries of book excerpts routinely add numbers, verbs and actors. Quote the excerpt's own sentence for every
claim, or say it is not there.

## Method (non-negotiable)

- WebSearch may be used to FIND urls only. **Every fact you report is read in a page fetched with the spider:**
  `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch "<url>" --note "kushner <beat>: <what>"`
  then `python3 scripts/spider/spider.py text "<url>"` to read it.
  **Never take a quote, date or figure from a WebFetch or WebSearch summary** — summarising models have invented figures on
  this project before.
- If the spider is refused (403, 401, robots, a paywall stub, a decoy page), that is a **null**: record it and move on.
  Never retry under another identity, never work around a refusal or a paywall. If Vanity Fair refuses or paywalls,
  look for named outlets that quote the excerpt directly, and say that the excerpt itself was not read.
- **Quotes:** every quote must be copied exactly from the spider text, on its own line: `Q | <url> | <exact quote>`.
  Keep quotes short. Figures and dates in your prose must also appear in a Q line.
- **Date-check everything.** Today is 23 October 2026; the post is undated and presented as breaking.
- **Symmetry:** find every denial or response at source (Kushner / Affinity Partners, the UAE, Saudi Arabia, First Abu
  Dhabi Bank, the Bank of Israel, the Prime Minister's Office, the Dutch services AIVD/MIVD or the Dutch government,
  Witkoff, the White House) and print it beside the claim. A discount applied to one side applies to the other.

## Hard rules (the report's standing constraints)

- **Living-person floor.** No living, uncharged person is asserted or implied to be a criminal or an intelligence asset.
  Allegations are printed only as the named accuser's claim, with any denial. Do not write "bribe", "slush fund",
  "kickback" or "laundering" in your own voice; quote them only as someone's words.
- **Never de-anonymise** an unnamed source, official or account holder. No bank account numbers, no addresses.
- **No numerology.**
- **No subject-shielding disclaimers** in your prose ("he has not been charged"). State the tier.

## The post (verbatim, as pasted by the author)

```
BREAKING: Dutch spies hacked Jared Kushner's iPhone and watched him access a Dubai bank account holding hundreds of millions funneled from Azerbaijan, part of at least $2 billion MBS and MBZ placed for him after he promised to push their agenda with Trump, per a Vanity Fair excerpt.

"Jared was looking for shortcuts in his diplomacy. He promised MBZ that he'd push their agenda with Trump if they participated in a fund. He wanted normalization with Israel so that business could take off," a source who knew the arrangement said.

The money was meant to redraw the region's map and lock in normalization with Israel. Roughly $1 billion of it was deposited in Israel's Central Bank for Kushner, with Netanyahu requiring dual-key approval on any transfers.

The two royals initially discussed more than $10 billion for a shared slush fund. That narrowed to roughly $2 billion deposited into accounts Kushner could access, including roughly $750 million at First Abu Dhabi Bank under a UAE charity used as cover for covert operations.

The reveal comes as Kushner is deeply involved in Iran war diplomacy, where Iran has accused him and Steve Witkoff of pocketing $9 billion through market manipulation, using insider knowledge of the talks to trade oil futures, energy stocks, and prediction markets.
```

## Output format (your file)

Start with a one-paragraph summary: what the excerpt actually says, what the post added, what is documented elsewhere.
Then one block per claim, in the post's order:

```
## <n>. "<the post's words, short>"
VERDICT: <tier> [+ not in the source / naming error / overstated / framing] — one sentence saying exactly what is true.
RECORD: two to five plain sentences: what the record shows, with dates and whose claim it is.
Q | <url> | <exact quote>
SYMMETRY: the denial or response at source, or "none found in sources read"
NULL: refusals and sources not read
```

End with `## Nulls` (every refused URL) and `## Not for any page` (anything touching the hard rules, with why).
Keep each block tight. If a claim cannot be checked from here, say so in one line.
