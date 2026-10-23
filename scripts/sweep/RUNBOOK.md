# Current-events sweep — runbook

The method behind every XV "Status update" since 22 Sept 2026, written down so a scheduled session can run it with
no memory of earlier ones. **CLAUDE.md wins on any conflict.** Read it first, every time.

Set up 23 Oct 2026 at the author's instruction: *"Current events sweep. How do we automate this"*. He chose a run
**every 2 days** that **publishes documented items itself** and holds the rest for him.

## 0. Before anything

- `cd /home/user/b0b-dashboard && git fetch origin main && git status`. Work on the session's designated branch,
  rebased on `origin/main`.
- **Stop if `scripts/sweep/PAUSE` exists.** That file is the author's off switch. Report that the sweep is paused,
  and do nothing else.
- `npm install` if `node_modules` is missing (the self-tests need express).
- Set `SCRATCH` to the session's scratchpad directory, or `/tmp/sweep` if there is none.

## 1. The window

- Find the newest `<h3 id="xv-status-update-…">` in `site/report.html`. Its date is the window's start; today is
  its end.
- **If the newest update is dated today, stop:** there is nothing to sweep.
- Run id: `news-YYYY-MM-DD` (today).

## 2. Research: three researchers, in parallel

- Fill `scripts/sweep/BRIEF-TEMPLATE.md` (`{RUN}`, `{WINDOW}`, `{LAST_ID}`, `{SCRATCH}`, `{DAY_PAGES}` =
  `2026_October_22`, `_23` …) into `$SCRATCH/{RUN}-BRIEF.md`.
- Launch three researchers, one per beat:
  - `mideast`: Iran–US, Hormuz, Yemen–Saudi, the Mecca pact, Israel, Gaza/West Bank, Lebanon, Iraq, the ICC/ICJ,
    RAF Fairford;
  - `world`: Sudan, Ethiopia–Eritrea, Af–Pak, Ukraine–Russia, Nord Stream, Greenland, the Koreas, China–Taiwan,
    spyware findings, the Black Sea;
  - `us`: the Epstein instruments (discharge petition, *Phang*, the D.C. Cir., DDF, Black, New Mexico, the estate,
    the DOJ library), Congress, the Supreme Court, AUTOWARCOM/Meridian, UAP, FBI/DOJ/IC.
- Each gets the brief, its scope, and the "Open threads" checklist from the newest sweep entry in CLAUDE.md §7.

## 3. Verify: never skip

- For each note: `python3 scripts/sweep/qlines.py NOTE.md OUT.jsonl`, then
  `python3 scripts/sweep/vq.py --batch OUT.jsonl`. **Every quote must be OK.** A MISS is dropped or re-read at
  source, never published.
- Read every note yourself. The researchers' tier calls are drafts, not findings.

## 4. Sort every item: PUBLISH or HOLD

**PUBLISH (goes live without the author)** only if **all** of these hold:
- each sentence states what a named party said or did on the record: a statement, filing, vote, court order, or a
  figure with whose count it is;
- every quote passed `vq.py`, and the item was read at a named outlet or primary via the spider;
- each side's account is printed (the symmetry rule), and no attacker or operator is named beyond a party's claim;
- no living person is named in connection with an accusation, arrest, investigation or wrongdoing (describe them by
  role), and no victim, survivor or child is named.

**HOLD (to `research/NEWS-YYYY-MM-DD-HELD.md`, never on the page)** if **any** of these apply:
- it is defamation-adjacent, or rests on an allegation against a living, uncharged person;
- its only basis is anonymous sourcing;
- it involves Anthropic (the AI-supplier disclosure is the author's to word);
- it needs an editorial call: a new subsection, a change to an argument section (I–XIV, XVI–XXV outside dated status
  lines), a map change, or anything a CLAUDE.md entry marks "his call";
- it would correct an error outside the XV status updates;
- it involves a court case filed against named living people (the New Mexico estate suit precedent).

**Corrections to our own dated status updates** are PUBLISH when the primary source has been read: fix the claim in
place with **no narration** (CLAUDE.md §1: "Do not re-add 'an earlier version of this passage said X' prose").

If nothing passes PUBLISH, publish nothing. Write the HELD file and the CLAUDE.md entry, and stop.

## 5. Draft

- One new `<h3 id="xv-status-update-D-month-YYYY" style="color:#ffcc00;">Status update - D Month YYYY: …</h3>`,
  inserted **directly after the previous update's last paragraph** (before the next `<h3`).
- Open with `<p><strong>N days on.</strong> The dated record for …, each item read in a named outlet or a primary
  document.</p>`.
- Then one `<p>` per thread, in the house style: a bold lead; quotes as `<em>&ldquo;…&rdquo;</em>` (Outlet); counts
  with whose count; "a search null, not a document" for nulls.
- Close with the Sources `<span style="color:#888">` paragraph, which also lists refusals and "Not established".
- Tone: CLAUDE.md §6. No subject-shielding disclaimers (§2). No numerology. Do not call b0b.dev "the institution".
- Edit HTML with Python string replacement, never `sed` (`&` in a replacement is "the whole match").
- `python3 scripts/sweep/vqdraft.py DRAFT.html --since <window start>` must show every quote OK. The only exceptions
  are quotes of the report's own text, which you check against `site/report.html`.

## 6. Deploy: CLAUDE.md §4, every step

- Back up `site/report.html` first, then run `python3 scripts/sweep/pipecheck.py site/report.html BACKUP`. Every tag
  balance must be unchanged, with no duplicate ids, no dangling anchors, 0 TOC mismatches and 0 JS fails.
- `python3 scripts/sweep/scale.py --write`.
- Then, in order:
  - `build-concordance.py`;
  - `build-transmissions.py` (a 404 is normal; the reel is left alone);
  - `node linguistic-integrity.js generate`, then `verify` → **STATUS: PASS**;
  - `check-consistency.py` → **0 mismatches**, then `--selftest`;
  - `node scripts/security-selftest.js` and `node scripts/seo-selftest.js` → all pass.
- **Any failure: stop, do not push, and report the failure.**
- Commit the conventional way with the session's attribution trailer, then push the branch **and** `HEAD:main`.
- Wait for the Vercel status (`gh api repos/1800bobrossdotcom-byte/b0b-dashboard/commits/<sha>/status`) to read
  `success`. Then `node scripts/check-live.js`, then four consecutive cache-busted reads that contain the new h3 id.

## 7. Record

- `research/NEWS-YYYY-MM-DD-HELD.md`: every held item, with its reason and its quotes.
- A CLAUDE.md §7 entry at the top, in the house format:
  - the window;
  - what went live;
  - our errors fixed in place;
  - what was held and why;
  - the open threads for the next run;
  - the scale line.
- The final message to the author: what went live (with the anchor link), what is held for his call, and any page
  errors found outside the status updates.
