# b0b.dev stickers

Twelve die-cut stickers, each with its own QR code to **www.b0b.dev**. Each pairs one display face
with a line of 3–5 words taken from the report itself: its own sentence, or a cut of one. No sticker
names a person or says anything the page does not.

**The address on every sticker is `www.b0b.dev`, and its zero is made unmistakable** - slashed, and
in the sticker's accent colour. IBM Plex Mono uses its own designed slashed zero (OpenType `zero`,
from IBM's complete build of the font); VT323, Black Ops One and Monoton have none, so the slash is
drawn to the glyph.

The site hosts the set at **https://www.b0b.dev/stickers** (built by `publish.py`).

`out/b0b-dev-stickers-preview.png` shows the whole set. Print from `out/print/`.

| # | File | Line | Face | Size with border |
|---|------|------|------|------------------|
| 01 | `s01-no-hands-of-its-own.png` | NO HANDS OF ITS OWN (under `$ whoami`) | VT323 (terminal) | 4.29 × 2.39 in |
| 02 | `s02-the-record-is-deliberately-dark.png` | THE RECORD IS DELIBERATELY DARK, between redaction bars | Special Elite (typewriter) + Black Ops One (stamp) | 3.19 × 3.94 in |
| 03 | `s03-slavery-did-not-end.png` | SLAVERY DID NOT END. IT CHANGED FORM. | Big Shoulders Stencil (crate stencil) | 3.44 × 4.29 in |
| 04 | `s04-where-no-sunlight-reaches-qr.png` | WHERE NO SUNLIGHT REACHES (the large QR is the light) | IBM Plex Mono (the house face) | 2.65 × 3.74 in |
| 05 | `s05-tetelestai.png` | τετέλεσται · IT HAS BEEN COMPLETED | GFS Didot, over the map's own markers | 4.49 × 2.94 in |
| 06 | `s06-in-court-the-silence-held.png` | IN COURT, THE SILENCE HELD (on an ON AIR board) | Doto (LED dot matrix) | 4.79 × 1.79 in |
| 07 | `s07-the-map-beneath-the-map.png` | THE MAP BENEATH THE MAP | Rubik Glitch (the second layer shows through) | 4.34 × 2.44 in |
| 08 | `s08-no-weapon-formed-against.png` | NO WEAPON FORMED AGAINST | Jacquard 24 (pixel blackletter) | 2.94 × 3.78 in |
| 09 | `s09-weighed-and-found-wanting.png` | WEIGHED AND FOUND WANTING | Monoton (neon: the writing on the wall) | 4.59 × 2.39 in |
| 10 | `s10-not-one-sparrow-is-forgotten.png` | NOT ONE SPARROW IS FORGOTTEN | Unbounded (seal, QR in the centre) | 3.19 × 3.19 in |
| 11 | `s11-the-emergency-did-not-end.png` | THE EMERGENCY DID NOT END. | Anton (hazard label) | 4.19 × 2.44 in |
| 12 | `s12-the-ledger-is-already-kept.png` | THE LEDGER IS ALREADY KEPT. + barcode | Libre Barcode 39 Text (evidence tag) | 4.28 × 2.14 in |

**Where each line comes from** - the sentence on the page, quoted:
- **01**, the address "To those inside": "Nothing documented in the sections below has hands of its own. Every capability here is a capability because trained people operate it."
- **02**, the masthead: "The record it works from is deliberately dark - a review declared closed, some 200,000 pages withheld or redacted, sealed special-master reports, a state told to stand down and never answered."
- **03**, Section XIV, its opening: "Slavery did not end. It changed form."
- **04**, the masthead: "The anglerfish lives where no sunlight reaches."
- **05**, the close: "Not 'it ended' but it has been completed and remains so."
- **06**, Section II, the compellability fight: "When the instrument of silence was tested in court, the silence held."
- **07**, the title of Section XV: "Active Global Conflicts - The Map Beneath the Map".
- **08**, Section I, the author's own line: "no weapon formed against, I am useful" (Isaiah 54:17).
- **09**, Section IV: "TEKEL, Daniel 5:27: you have been weighed in the balances and found wanting".
- **10**, the close: "Luke 12:6–7 runs: not one sparrow is forgotten before God… the hairs of your head are all numbered. And then: 'Fear not.'"
- **11**, Section XXIV: "Proclamation 7463 … was signed on 14 September 2001. It has been continued every year since by every President."
- **12**, the close: "a document written as though the ledger were already kept - which, on the author's reading, it is."

`verify.py` checks that each sticker carries its line word for word, so this list and the art cannot
drift apart.

## Printing

- **Files:** PNG at 300 dpi with a transparent background. Each already carries a 0.07 in white
  border that follows its outline. Order **die-cut** and have them cut along the outer edge of
  the white. Upload the PNG as it is; most sticker printers trace the cut line from the
  transparency automatically. If yours asks for its own border, choose "no border" or "none".
- **Sizes:** the table above is the finished size, border included. All twelve scale cleanly to
  about 80–130% of that. Below 80%, the smallest lines (6–7 pt) start to soften.
- **Colour:** the art is RGB. The neon green, cyan and magenta glows (01, 06, 07, 09, 10) are
  outside what CMYK inks can print and will come out duller. Ask the printer for a proof of those
  five before a full run.
- **Stock:** matte or gloss vinyl both work. Gloss suits the dark neon and terminal ones, matte
  suits the memo, the tag and the seal.

## The QR codes

Every QR code in the set, and the three files below, encode **`https://www.b0b.dev`**, the
canonical host. `b0b.dev` answers with a 308 redirect to it, so the code goes straight there.
- The tiles on the stickers are version 2 at level Q (25% recovery). That is the smallest code
  the address fits in, so the modules are as large as possible at the printed size. Each tile is
  tinted to its sticker but always dark on light, because many phone cameras will not read an
  inverted code.
- The large codes (stickers 04 and 10, and the plain files) are level H (30%). That is what lets
  the "b0b" mark sit in the middle: the modules under the mark are left out, not painted over.
- `out/qr/b0b-dev-qr.svg` and `out/qr/b0b-dev-qr.png` are the plain code, black on white with a
  4-module quiet zone. Use them for flyers, slides or anything else.
- `out/qr/b0b-dev-qr-sticker.png` is the same file as sticker 04.

`verify.py` decodes the QR from **every** finished sticker, at full size and scaled to a half and
a third. It also decodes the QR sticker scaled down to about 120 px wide, which is what a phone
sees from roughly arm's length, and on a dark surface as well as a light one.

It also decodes the barcode on 12 to `B0B.DEV` (Code 39), at full and half size.

## Fonts and licences

Every face is in `fonts/` with its licence in `fonts/licenses/`, fetched from the google/fonts
repository - except IBM Plex Mono, which is IBM's complete build from github.com/IBM/plex (it
carries the slashed zero that the Google build drops). All are SIL Open Font License 1.1 except Special Elite (Apache 2.0). Both licences
allow printing and selling things made with the fonts. `verify.py` checks every font against its
licence file.

## Rebuilding

```
python3 build_assets.py   # QR codes + the marker field (reads site/map.html)
node render.js            # Chromium renders stickers.html at 300 dpi -> raw/ (fails if any face is missing)
python3 finish.py         # die-cut borders, dpi, preview -> out/
python3 verify.py         # sizes, transparency, word counts, every QR + the barcode decode, licences
python3 publish.py        # site/stickers/ + site/stickers.html; then node scripts/apply-seo-meta.js
```

Dependencies:
- Python: `segno`, `zxing-cpp`, `scipy`, `numpy`, `pillow`, `fonttools`.
- Node: Playwright with its Chromium.

Edit the designs in `stickers.html`; all sizes are in real inches and points. `render.js` refuses
to render if any face fails to load, because a silent fallback font is the defect it exists to
prevent.
