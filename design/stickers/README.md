# b0b.dev stickers

Twelve die-cut stickers and a QR code. Each pairs one display face with a 3–5 word attractor taken
from the site's own method. No sticker names a person or makes a claim the page does not.

`out/b0b-dev-stickers-preview.png` shows the whole set. Print from `out/print/`.

| # | File | Attractor | Face | Size with border |
|---|------|-----------|------|------------------|
| 01 | `s01-sources-or-it-didnt-happen.png` | SOURCES OR IT DIDN'T HAPPEN | VT323 (terminal) | 3.69 × 2.34 in |
| 02 | `s02-secrecy-is-evidence-of-nothing.png` | SECRECY IS EVIDENCE OF NOTHING | Special Elite (typewriter) + Black Ops One (stamp) | 2.94 × 3.64 in |
| 03 | `s03-the-tier-ladder.png` | DOCUMENTED · ATTRIBUTED · LABELED · CONTESTED · UNSUPPORTED | Big Shoulders Stencil | 3.44 × 3.29 in |
| 04 | `s04-read-the-record-yourself-qr.png` | READ THE RECORD YOURSELF + QR | IBM Plex Mono (the house face) | 2.64 × 3.74 in |
| 05 | `s05-tetelestai.png` | τετέλεσται · IT HAS BEEN COMPLETED | GFS Didot, over the map's own markers | 3.94 × 2.40 in |
| 06 | `s06-beings-observing-this-frequency.png` | ATTN: BEINGS OBSERVING THIS FREQUENCY | Doto (LED dot matrix) | 4.64 × 1.79 in |
| 07 | `s07-a-refusal-is-a-finding.png` | A REFUSAL IS A FINDING | Rubik Glitch | 3.69 × 2.15 in |
| 08 | `s08-no-weapon-formed-against.png` | NO WEAPON FORMED AGAINST | Jacquard 24 (pixel blackletter) | 2.84 × 3.49 in |
| 09 | `s09-timelines-are-not-chains.png` | TIMELINES ARE NOT CHAINS | Monoton (neon) | 3.94 × 2.24 in |
| 10 | `s10-tiered-sourced-checkable.png` | TIERED · SOURCED · CHECKABLE | Unbounded (seal) | 3.19 × 3.19 in |
| 11 | `s11-no-document-no-claim.png` | NO DOCUMENT, NO CLAIM | Anton (hazard label) | 3.74 × 2.35 in |
| 12 | `s12-every-claim-carries-a-tier.png` | EVERY CLAIM CARRIES A TIER + barcode | Libre Barcode 39 Text (evidence tag) | 3.94 × 2.09 in |

**Where each line comes from.**
- 02: the guaranteed-null rule ("secrecy is evidence of nothing about what is hidden").
- 09: the anti-map guardrail ("a shared timeline is not a chain").
- 03: the tier ladder.
- 11: the document rule ("promoted only by a document", `/start`).
- 07: the crawler rule ("refusals logged as findings", `/about`).
- 06: the opening of Section XXV.
- 08: the author's own Section I line, from Isaiah 54:17.
- 05: the report's reading of τετέλεσται.
- 01, 04, 10 and 12: describe the method.

## Printing

- **Files:** PNG at 300 dpi with a transparent background. Each already carries a 0.07 in white
  border that follows its outline. Order **die-cut** and have them cut along the outer edge of
  the white. Upload the PNG as it is; most sticker printers trace the cut line from the
  transparency automatically. If yours asks for its own border, choose "no border" or "none".
- **Sizes:** the table above is the finished size, border included. All twelve scale cleanly to
  about 80–130% of that. Below 80%, the smallest lines (6–7 pt) start to soften.
- **Colour:** the art is RGB. The neon green, cyan and magenta glows (01, 03, 06, 09, 10) are
  outside what CMYK inks can print and will come out duller. Ask the printer for a proof of those
  five before a full run.
- **Stock:** matte or gloss vinyl both work. Gloss suits the dark neon and terminal ones, matte
  suits the memo, the tag and the seal.

## The QR code

All three QR files below encode **`https://www.b0b.dev`**, the canonical host. `b0b.dev` answers
with a 308 redirect to it, so the code goes straight there.
- Error correction is level H (30%). That is what lets the "b0b" mark sit in the middle: the
  modules under the mark are left out, not painted over.
- `out/qr/b0b-dev-qr.svg` and `out/qr/b0b-dev-qr.png` are the plain code, black on white with a
  4-module quiet zone. Use them for flyers, slides or anything else.
- `out/qr/b0b-dev-qr-sticker.png` is the same file as sticker 04.

`verify.py` decodes the QR from the finished sticker:
- at full size, and scaled down to 118 px wide, which is what a phone sees from roughly arm's
  length;
- on a dark surface as well as a light one.

It also decodes the barcode on 12 to `B0B.DEV` (Code 39), at full and half size.

## Fonts and licences

Every face is in `fonts/` with its licence in `fonts/licenses/`, fetched from the google/fonts
repository. All are SIL Open Font License 1.1 except Special Elite (Apache 2.0). Both licences
allow printing and selling things made with the fonts. `verify.py` checks every font against its
licence file.

## Rebuilding

```
python3 build_assets.py   # QR codes + the marker field (reads site/map.html)
node render.js            # Chromium renders stickers.html at 300 dpi -> raw/ (fails if any face is missing)
python3 finish.py         # die-cut borders, dpi, preview -> out/
python3 verify.py         # sizes, transparency, word counts, QR + barcode decode, licences
```

Dependencies:
- Python: `segno`, `zxing-cpp`, `scipy`, `numpy`, `pillow`, `fonttools`.
- Node: Playwright with its Chromium.

Edit the designs in `stickers.html`; all sizes are in real inches and points. `render.js` refuses
to render if any face fails to load, because a silent fallback font is the defect it exists to
prevent.
