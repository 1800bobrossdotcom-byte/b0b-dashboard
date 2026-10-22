# trumpfam — grading a viral post about the Trump family, claim by claim (shared brief)

The author of the b0b.dev OSINT report (`/home/user/b0b-dashboard/site/report.html`) pasted a viral X post and asked
for **"the truth lines"** in it. Your job is to grade each claim in your beat against the record, at the report's tiers,
reading every source at source. **This is research only. Nothing goes on the page.** The subject is a living person, so
the file is held for the author.

You write ONE file: `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/trumpfam-<beat>.md`
(beat = `A`, `B` or `C`). **Do not edit anything in the repository.** The spider appends to
`research/sources/ledger.jsonl` by itself; that is the only repo file that changes, and that is intended.

## Tiers (use these words exactly)

- **documented** — a primary record (court filing, official record, the person's own recorded words on tape/video/in
  print, a contemporaneous newspaper record of an arrest) read at source, or a named outlet quoting that record directly.
- **attributed** — one named source says so (a biographer, an outlet's unnamed sources, a single witness). Say whose claim.
- **contested** — sources conflict; print both.
- **unsupported** — nothing found at any tier.
- Also mark, where it applies: **naming error** (the sign mistaken for the thing — e.g. examining papers ≠ "having" them;
  adult pageants ≠ teen pageants), **chronology error**, **overstated** (the core is true, the size or verb is not),
  **framing** (rhetoric, not a factual claim — say so and do not grade it as fact).

## Method (non-negotiable)

- WebSearch may be used to FIND urls only. **Every fact you report is read in a page fetched with the spider:**
  `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch "<url>" --note "trumpfam <beat>: <what>"`
  then `python3 scripts/spider/spider.py text "<url>"` to read it.
  **Never take a quote, date or figure from a WebFetch or WebSearch summary** — summarising models have invented figures on
  this project before.
- If the spider is refused (403, 401, robots, a decoy page), that is a **null**: record it and move on. Never retry under
  another identity, never work around a refusal. Wikipedia is a fine finder and is acceptable as a secondary source when
  it quotes a primary; say "per Wikipedia, citing X" in that case, and try to read X itself.
- **Quotes:** every quote must be copied exactly from the spider text, on its own line: `Q | <url> | <exact quote>`.
  Keep quotes short (one sentence or less is ideal). Figures and dates in your prose must also appear in a Q line.
- **Date-check everything.** Many claims circulate with wrong years.
- **Symmetry:** where the subject or his family denied or explained something (e.g. "it was a joke", "never happened"),
  find the denial at source and print it beside the claim. A discount applied to one side applies to the other.

## Hard rules (the report's standing constraints)

- **Living-person floor.** No living, uncharged person is asserted or implied to be a criminal or an intelligence asset.
  State what the record shows and its tier, then stop. Allegations against living people are printed only as the named
  accuser's claim, with any denial.
- **No victims named. No pageant contestants named** (describe them by role and number). No children named.
- **No residence house numbers** (the 1927 newspaper prints a street address; give the street only).
- **No numerology.** Dates and digits are facts, never read for meaning.
- **No subject-shielding disclaimers** in your prose ("no crime is alleged", "he has not been charged"). State the tier.
- Stop rules: substantially-imagery documents → stop; FBI FD-302 / victim interview / protective-order stamp → stop at
  identification, do not read on.

## The post (verbatim, as pasted by the author)

```
News flash: Donald Trump's family tree reads like a mob movie written by a demon on cocaine.

Grandpa? Friedrich Trump. Kicked out of Bavaria for dodging the army, so he did what any man of God would do: ran Klondike Gold Rush hotels that a Trump family biographer says came with "private boxes for ladies" and a scale for weighing gold dust.

Miners, whiskey, and women by the hour. The Trump fortune was born in a pay-per-minute closet.

Daddy? Fred Trump. Arrested at a Klan riot in Queens in 1927, charges dropped. Built his empire on federal housing money, got dragged before the Senate for skimming it, then got sued by the Justice Department for refusing to rent to Black tenants.
Same guy signed over land for a Brooklyn synagogue for ten bucks and funded it for 48 years. The congregation named him "lover of Israel."

The Klan in the morning, the rabbi in the afternoon. Diversified portfolio.

Uncle? John Trump, MIT physicist. When Nikola Tesla died in 1943, the government sent him to go through Tesla's papers. The Trumps had Tesla before Elon was a sperm in a petri dish.

Mentor? Roy Cohn. McCarthy's attack dog, mob lawyer, alleged ringmaster of sex-blackmail parties at the Plaza Hotel. Taught Donald the gospel: never admit, never apologize, always attack.
Lived it to the end. Died of AIDS swearing it was liver cancer.

In-law? Charles Kushner. Hired a prostitute to seduce his own brother-in-law, filmed it, mailed the tape to his own sister. Pleaded guilty. Trump pardoned him, then made him ambassador to France.

Blackmail your family, become a diplomat. The American dream.

And Donald? On live TV: "If Ivanka weren't my daughter, perhaps I'd be dating her." Called Epstein a "terrific guy" who liked women "on the younger side." Bragged to Howard Stern about strolling into teen pageant dressing rooms.

The religion? Pure theater.
1983: the Jewish National Fund's Tree of Life Award for bankrolling Israel. Still hangs in his office. "A very big award in terms of everything that I stand for."
2018: a Temple movement mints a coin with his face next to King Cyrus. Evangelicals call him "God's chosen vessel." God's chosen vessel has three wives and six bankruptcies.
2019: he looks at the sky and says, "I am the chosen one."

His daughter takes the jab wearing a red Kabbalah string and tells you to go get yours.
On the first anniversary of October 7, he prays at the grave of a rabbi whose followers believe he's the Messiah.
Then he sells you a $60 Bible. Then he tells reporters he doesn't think he's going to heaven.
Buy the Bible, folks. He's not using it.

What's he building?
Stargate: half a trillion in AI data centers with Ellison and Altman. Palantir: wired through the entire federal government. Trump TV: launched the same week he pulled reporters' credentials. $TRUMP coin and World Liberty: the family crypto racket, run while he writes the crypto rules. The AI race: settled over tea with Xi.

Your data, your news, your money, your vote. One family.
...
A brothel, a Klan riot, a mob lawyer, a blackmail tape, three generations kneeling to Israel, a self-declared chosen one, and a man who's told you he's not going to heaven.
Goodfellas meets the Book of Revelation.
Trust the plan, they said.
```

Today is 22 October 2026. The post is undated; assume it is recent.

## Output format (your file)

Start with a one-paragraph summary: which lines hold, which are naming/chronology errors, which are unsupported.
Then one block per claim, in the post's order:

```
## <n>. "<the post's words, short>"
VERDICT: <tier> [+ naming error / chronology error / overstated / framing] — one sentence saying exactly what is true.
RECORD: two to five plain sentences: what the record shows, with dates.
Q | <url> | <exact quote>
Q | ...
SYMMETRY: the subject's or family's denial/explanation, at source, or "none found in sources read"
NULL: refusals and sources not read
```

End with `## Nulls` (every refused URL) and `## Not for any page` (anything that touches the hard rules, with why).
Keep each block tight. Do not pad; if a claim cannot be checked from here, say so in one line.
