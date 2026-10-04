# EDGE TIERS — brief for the map line audit (read in full before starting)

The author has approved tiering every connection line on https://www.b0b.dev/map (`site/map.html`) by the
**strength of the relationship between its two endpoints**. This answers an outside reviewer: *"the map can make
independent facts look causally connected — tier the relationship between nodes, not just the claim."*

You audit ONE batch file of edges and write verdicts. **Do not edit any repo file**; the spider may append to its own
ledger. Before starting, read `/home/user/b0b-dashboard/CLAUDE.md` §2 (standing constraints) and §3 (named rules).
Pay particular attention to the **anti-map guardrail: a shared timeline is not a chain.**

## Input
Batch file: `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/edges/eN.json`.

Each edge has:
- `id`
- `kind`: `connection`, `tunnel` or `animal-network`
- `from` and `to`: coordinates
- `label`: what the map shows on hover
- `from_markers` and `to_markers`: the nearest map markers with their ctx text. These markers were audited on
  2 Oct 2026 (VERITAS), so their ctx is a verified starting point. **They are not proof of the edge.**

## The scale — the tier of the EDGE, not of either endpoint
- **0 analogy** — structural or thematic resemblance, a shared symbol or style, or a coincidence. No documented
  relationship between the two places or entities.
- **1 correlation** — the two share a time, a place, a person's presence, or a sequence. Nothing documents that one
  acted on the other. "A happened, then B happened" is tier 1 at most.
- **2 contact** — documented contact: meetings, correspondence, visits, membership, attendance, or a shared
  board seat.
- **3 material** — a documented material relationship: ownership, subsidiary or parent, funding, a contract or
  grant, employment, a transfer of property or money, a licence, or a physical connection (an existing tunnel,
  cable or pipeline).
- **4 coordination** — documented joint action: a signed agreement acted on by both, a joint operation, or a
  documented instruction from one to the other.
- **5 causation** — the record shows A produced B: an official finding, a court finding, or the body's own
  records stating it.

Rules for applying the scale:
- An "alleged" or "reported" relationship takes the tier of what is **documented**. Its label must say "alleged".
- **Tunnels:** a documented existing tunnel is 3. An alleged tunnel with no document is 0 or 1, and its label says
  "alleged".
- **Animal network:** a same-company HQ→site line is 3, if the ownership is documented. A disclosed
  shareholder→company line is 3.

## What to check per edge
1. **Read the label as a claim about the edge.** What relationship does it assert? Is that relationship
   documented, and at what tier?
   - Verify anything you would put at **tier 2 or higher** against a source you read via the spider.
   - Alternatively, you may rely on an endpoint marker's VERITAS-audited ctx if it states the relationship
     explicitly. Say so in `basis`.
2. **The label must not overstate the tier.**
   - Arrows "A → B" imply direction or causation. If the edge is tier 0–1, rewrite the label to state the
     actual relationship (for example "same year", "same architect style", "shared founder").
   - Or mark it as an analogy.
   - Keep labels concise and in the existing style, using " - " not " — ".
3. **Standing-rule checks**, report these even if the relationship is true:
   - **Living-person floor:** no living, uncharged person is asserted or implied to be a criminal or an
     intelligence asset; documented affiliation is never an operational tie.
   - **No house numbers** for residences.
   - **No numerology.**
   - **No "crown"** for the top of a man-made structure.
   - **Anti-map chains:** A→B→C where only shared timing exists.
4. **Endpoint errors:** if an endpoint coordinate does not sit on the place the label names, say so.
5. **Delete** an edge only if it asserts a relationship that is false, or that violates the living-person floor
   and cannot be rewritten. Give the reason.

## Evidence rules
- **Fetching.** Use the spider only:
  `cd /home/user/b0b-dashboard && python3 scripts/spider/spider.py fetch URL`, then `... text URL`.
  It uses one identity and obeys robots.txt. A 403, 401, robots refusal or decoy is a recorded null; never retry it
  under another identity.
- **WebSearch and WebFetch are for discovering URLs only.** A model summary is never evidence.
- **Wikipedia** is fine for uncontested basics: ownership, founding, an event date.
- **When you cannot verify, give the tier the label's relationship can actually be shown at.** That is usually
  the lower one. Say `"verified": false`.
  - **Do not invent a higher tier.**
  - **Do not mark a relationship false just because you could not reach a source.** (A previous agent tried to
    drop a true relationship that way. It was rejected.)
- **Efficiency.** Many edges are obvious, such as corporate HQ→site lines or a documented tunnel. Spend your effort
  on arrows, chains and anything involving people.

## Output
Write `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/edges/eN-verdicts.jsonl`, one JSON
object per edge, **every id in your batch exactly once**:
```
{"id":"c12","tier":0-5,"tier_name":"analogy|correlation|contact|material|coordination|causation",
 "label":"replacement label, or null to keep",
 "delete":false, "verified":true|false,
 "basis":"one sentence: what document establishes the tier (or why it is this low)",
 "issues":["specific problems, if any"],
 "sources":[{"url":"...","ledger":"ok|http_403|robots|..."}]}
```
Then reply with a summary of under 250 words:
- counts per tier;
- relabels and deletes, and why;
- the five most misleading lines you found;
- nulls.
