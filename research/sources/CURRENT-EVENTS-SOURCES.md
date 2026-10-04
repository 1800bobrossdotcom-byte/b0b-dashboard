# Current-events source pulls

**Read this before every current-events sweep.** It records where the sweep looks for events and what each
source is allowed to do.

## The rule

- **A lead source finds an event; it never carries one onto the page.** Every item that is published is
  re-verified at a named outlet, or at the primary, through the spider. Every quote and figure is re-read in
  the spider cache with `vq.py`.
- **Date-check everything.** Search results for 2026 queries routinely return 2025 items.
- **A source with a declared perspective is a lead in proportion to that perspective.** For each item it
  surfaces, look for coverage from the other side of the story before publishing. That is the symmetry rule,
  applied to sourcing.

## Lead sources

| Source | What it is | Access from here | Role |
|---|---|---|---|
| Wikipedia `Portal:Current_events/YYYY_Month_DD` | Daily event pages with links to outlets | ok via spider. Use the **day pages**: the monthly page truncates. | Lead. It has invented details before (DI Khan attribution, "21 ENDF airstrikes"), so verify every item. |
| **https://www.osint613.com/** (added 4 Oct 2026, author's instruction) | "OSINT613 — Live Intelligence Feed": rolling one-line headlines, weighted to Israel, Iran, Gaza, Lebanon, Yemen and the Gulf | ok via spider; robots allows all crawlers | **Lead only.** Items carry **no source links on the page.** Its outbound links are its own X, Telegram, WhatsApp and newsletter (`osint613news.beehiiv.com`) channels. Each headline must be found at a named outlet before use. **Declared perspective:** an Israel-focused aggregator. Pair its items with outlets reporting from the other parties. |
| **https://x.com/Osint613** (added 4 Oct 2026, author's instruction) | The same feed's X account | **refused: X disallows the spider by robots**, as does `publish.twitter.com/oembed`. Recorded as a null; never worked around. | Lead only, and only through the author: he pastes a post's text, or the item is found on osint613.com or at a named outlet. |

## Named outlets: reachable vs refused

These are the outlets most recently used to verify sweep items.

- **Reachable:** BBC, CNN, Al Jazeera, Stars and Stripes, Air & Space Forces Magazine, Foreign Policy, NBC,
  Euronews, Snopes, DefenseScoop, Law360 (lede only), UN News, Treasury and OFAC.
- **Refused (nulls):** Reuters (robots), AP, The Hill, Sudan Tribune, OHCHR, CNBC, Forbes and Cybernews (403).
  ohchr.org also serves a decoy 200 homepage for dead PDF paths.
