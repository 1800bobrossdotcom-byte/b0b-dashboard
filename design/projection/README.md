# b0b.dev — wall projection

The author asked on 21 Oct 2026: *"make a www.b0b.dev with b zero b at the bottom so people know - static image to
project on wall in landscape. Or a video that is looping with images from the report"*.

`python3 design/projection/build.py` writes three files to `out/`:

| File | What it is |
|---|---|
| `b0b-dev-projection-1080p.png` | The still, 1920×1080. |
| `b0b-dev-projection-4k.png` | The same still, 3840×2160. |
| `b0b-dev-projection-loop.mp4` | A silent loop: 2:51, 1920×1080, 25 fps, H.264 with faststart, ~27 MB. It plays from a USB stick on most projectors and TVs. CRF 27 with `-tune stillimage` reads the same as CRF 20 on the documents' type at half the size. |

Other modes:
- `--still`: the stills only.
- `--sheet`: `out/contact-sheet.jpg`, one frame per shot, for review before a render.

## The still

- **The address:** `www.b0b.dev` in IBM Plex Mono Bold, in the wordmark's green (`#00ff41`).
  - **The zero is slashed in the wordmark's cyan (`#00ccff`).** The font's own slashed glyph (`zero`) is drawn cyan, then its plain glyph (`salt`) is drawn green over it, so only the slash shows cyan.
- **The spelling:** "b zero b" sits at the bottom, with *zero* in the same cyan, so the 0 is never read as an O.
- **The QR:** it encodes `https://www.b0b.dev`, version 2, level Q.
  - It is dark on light, because inverted codes fail on many phone cameras (the sticker rule).
  - `build.py` decodes it at full and half size from every still (zxing-cpp), and from the band on an image frame.

## The loop

- **Its images are the report's own:** the licence-checked listen-mode set in `site/listen-media.js`.
- **Face-free items only.** The build refuses any item whose `faces` field is not empty. A projected loop has no
  narration to grade what sits next to what, and in a montage juxtaposition is implication (the films' rule). So no
  person appears: only documents, buildings, places and the sky.
- **Also left out:** residences and the streets around them, prisons, and the author's own city.
- **Credits:** every image carries its source tag on screen, as in the films. The CC BY items need it:
  - BIS tower, Fred Romero, CC BY 2.0;
  - Starlink over CTIO, NOIRLab/CTIO/AURA/DELVE, CC BY 4.0;
  - UN Security Council chamber, JDForrester, CC BY 4.0.
- **Layout:** each image is framed over a dark blur of itself, with a slow push in. The address band holds at the
  bottom throughout: `www.b0b.dev`, "b zero b" and the QR.
- **Timing:**
  - each image holds for 5 s, with 0.8 s crossfades;
  - the full address card returns after every six images;
  - the loop starts on the card and fades back into it at the end, so it repeats without a seam.
- **The 30 images, in order:**
  1. the Black Marble (the Americas at night);
  2. the National Security Act 1947;
  3. the CIA headquarters entrance;
  4. the CIA Act 1949 certificate clause;
  5. NSA, Fort Meade;
  6. the UKUSA revision of 1954;
  7. Menwith Hill;
  8. MKUltra subproject 8;
  9. Eisenhower's farewell reading copy, p. 15;
  10. Northwoods;
  11. San Cristobal, 1 Nov 1962;
  12. the Gulf of Tonkin Resolution;
  13. Church Committee Book II;
  14. the Cheyenne Mountain portal;
  15. Mount Weather;
  16. the Federal Reserve Act;
  17. the BIS tower;
  18. the Bretton Woods meeting room;
  19. Proclamation 7463;
  20. the AUMF;
  21. the USA PATRIOT Act;
  22. the NSA Utah Data Center;
  23. CORONA over Beijing;
  24. Starlink trails;
  25. the UN Security Council chamber, empty;
  26. the Oval Office, empty;
  27. the FBI Robert Maxwell file cover;
  28. the Epstein Files Transparency Act;
  29. the National Archives stacks;
  30. the Archives pediment.

## Fonts

IBM Plex Mono (Bold, Medium) from `design/stickers/fonts/`, under the OFL (`design/stickers/fonts/licenses/`).

## The jacket version — `--jacket`, 21 Oct 2026

The author sent a photograph of the jacket's patch in answer to the CLAUDE.md §1 tension: the site's
green terminal look against principles 4 and 5 of `design/INSTITUTION.md`. `--jacket` builds the same
still and loop in the jacket's world:
- the ground is navy with the fabric's ripstop grid, barely there;
- the type is thread-white, with the font's own slashed zero, and no neon;
- the QR is navy on a thread-coloured tile.

`python3 design/projection/build.py --jacket` writes:
- `b0b-dev-projection-jacket-1080p.png`;
- `b0b-dev-projection-jacket-4k.png`;
- `b0b-dev-projection-jacket-loop.mp4`.

**The seal, `seal.py`:** it writes `out/seal-thread-2000.png` (transparent) and `out/seal-mask-2000.png`.
- **The source** is `src/patch-crop.png`, a crop of the author's photo. It carries no EXIF; the original had none.
- **Traced from the thread:** the figure and the dotted running-stitch bolts.
  - The trace uses a local-contrast threshold.
  - It is warped from the sleeve's ellipse (rx 218.8, ry 233.4) to a circle and turned 5° upright.
  - The photo's specks and the fabric stain under the feet are removed.
- **Set:**
  - the two rings, as true circles;
  - the motto, in Liberation Serif on the measured arc: 196° across the top, with word gaps as on the patch;
  - the six stars, 25° apart and centred at the bottom, a point toward the centre.
- **Why the motto is set rather than traced:** the traced letters broke up ("ARS" read as "AKS").
- **On the site:** `site/img/insignia.png` is this seal in thread on a navy disc, 360 px and quantized to 24 colours (22 KB). It heads the Briefing at `/start`.
- **Animated, `seal_anim.py`:** the seal assembling (rings, motto, stars, then the figure), 1280×720, silent. Since 28 Oct 2026 it is also the homepage's second arrival step, after the b0b.dev wordmark and before the films (`site/b0b-seal.js`): `sh design/projection/build_seal_intro.sh` renders it with `--speed 1.5 --hold 1.2` (4.8 s), cuts the centre 720×720 square and writes `public/seal-intro.{webm,mp4,png}`.
- **The insignia's status:** it is the masthead's "insignia of a unit that does not exist", of unknown manufacture. The page records it as artistic appropriation, and it claims no real unit (INSTITUTION.md principle 7).
