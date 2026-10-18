# Public announcement

Spoken word over a synthesised beat, built to stand on its own and to stop people in a street. One pass is
three and a half minutes, and its last line runs into its first. It is published at
**https://www.b0b.dev/announcement** as a loop for repeat play and as a file a little over an hour
long.

The words live in `build_psa.py` (`SECTIONS`). The page and `script.txt` are generated from the same
list, so the page cannot drift from the audio. Every statement about the report is the report's own,
from its masthead, Section I, the address *To those inside* and the close.

## What it says

The author rejected two earlier cuts:
- the calm first cut ("too passive");
- an 18 Oct rewrite that still explained the report, which he called "a boring advertisement for the report.
  people are not going to listen to this".

The third cut (18 Oct) drops the explaining. It tells the record and speaks to the listener, and the site is
named only at the end.

Every fact is the report's own:
- II, pattern five and the conclusion block;
- II on JPMorgan ("flagged him and kept him", exited 2013);
- the patronage line ("heads of state, Nobel laureates, serving cabinet officers, university presidents and
  the largest banks in the country kept the relationship open");
- the New Mexico suit, attributed to the state ("New Mexico says").

No survivor is named, and the woman of 1996 is "a young woman".

1. **Nineteen ninety-six** (cold, no music): reported to the police, sent on to the FBI, "nothing happens.
   For ten years, nothing happens."
2. **The deal:** 2007, "cut a deal… grants immunity to people the government has not even named"; OPR's
   "poor judgment"; thirteen months on work release.
3. **The open door:** ten years on the registry; the door kept open; JPMorgan flags him and keeps him.
   *Drop:* "The door stays open."
4. **The cell:** 2019, charged; five weeks later dead in federal custody, before any trial. *Drop:* "No
   trial. No testimony. No cross-examination." These are facts, not a manner of death.
5. **The dark:** Maxwell's twenty years; some 200,000 pages withheld or redacted (rebuild when that count
   changes); New Mexico's stand-down, as the state's claim.
6. **The verse:** every decision had a person behind it; John 12:42 paraphrased ("rulers who believed, and
   would not say so"). *Drop:* John 12:43.
7. **To those inside:** "has no hands of its own"; **the safety lines verbatim: "This message does not ask
   you to disobey legal orders. It does not ask you to desert, to sabotage, to obstruct, or to leak." Keep
   them in any edit.** 18 U.S.C. § 2387 makes it a crime to urge members of the armed forces toward
   insubordination or refusal of duty. Then the Inspector General / Member of Congress route, § 1034, and
   send classified material to no one.
8. **Close:**
   - "keep looking";
   - read, check one line, prove it wrong or say it out loud;
   - the address, with the beat stopped under it;
   - "a public announcement, from a private citizen … not from the government … not from the police";
   - "Nineteen ninety-six. Nothing happened." *Drop:* "Not this time.", which ends on the hit alone and
     loops into the cold open.

**Left out on purpose:**
- **The conclusion (deniable assets).** It cannot be said at its tier without three hedges, and the
  documented record hits harder alone. Restore it only with all of them: a judgment, not a document; no
  handler claimed; what would lower it.
- **The grades,** except "every claim graded".

**Sound:**
- `music()` is an 84 bpm minor beat (Am–F–C–G): kick, brushed snare with a soft attack, hats, bass on every
  beat, and a pad.
- It sits 9 dB under the voice's speech level between lines and ducks a further 10 dB under speech
  (20 ms attack, 300 ms release).
- It stops for the cold open, for the four drop lines and for the address. It comes back in on the low A-minor
  hit.
- Mastering: highpass 45 Hz (it was 110, which would have removed the kick), compression, and about
  -13 LUFS.
- **Refused by design:** alert tones, sirens, and any lone sharp crack, because it plays in crowds.

## Rebuilding

The toolchain is not in the repo. Set it up next to these files; the paths are gitignored:

```
python3 -m venv .venv && .venv/bin/pip install piper-tts faster-whisper
mkdir voice && cd voice && for f in en_GB-cori-high.onnx en_GB-cori-high.onnx.json MODEL_CARD; do
  curl -sSLO "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_GB/cori/high/$f"; done && cd ..
# en_GB-cori-high.onnx sha256 470b4dd634c98f8a4850d7626ffc3dfc90774628eeef6605a6dd8f88f30a5903
# a static ffmpeg 7 (johnvansickle.com/ffmpeg) linked here as ./ffmpeg and ./ffprobe

.venv/bin/python build_psa.py        # synthesise, master (-14 LUFS, -1.5 dBTP), write out/
.venv/bin/python check_clarity.py    # machine listener: clean + four street recordings
python3 publish.py                   # site/announcement/*.mp3 + site/announcement.html
node ../../scripts/apply-seo-meta.js
```

The voice is **Piper `en_GB-cori-high`**, the narrator the site's films already use. Its model card
says it was trained on public-domain LibriVox recordings, so the audio carries no voice licence.

**Every synthesis is a fresh random take**, because the model samples noise. Each line is cached in
`work/cache` by its text, so an unchanged line keeps its verified take. Changing a line's text buys a
new take, and it must be heard again. The closing address reuses the opening line's exact text for
that reason.

## The listening test, and what it changed

`check_clarity.py` transcribes one pass with Whisper `base.en`, followed by the start of the next
pass, as it sounds on repeat. It runs clean and through four street recordings: a small speaker at a
distance (250 Hz–4 kHz, street echo) with traffic noise 6 dB and then 3 dB below the voice, each with
two noise draws. It scores word error and the key phrases. **It also fails any safety-critical
sentence heard without its negation.**

**Read `work/asr-*.txt`, not only the score.** The remaining misses are the transcriber's spelling:
"its not" for "it does not", a phonetic "Geelaine" for Ghislaine, "onlineb". Those are not audio
faults. These were real, and changed the script:

- **"The report *never* claims that either was run by a handler" was heard as "*now* claims"** in
  every condition, a reversal of meaning. "Nothing here asks you to disobey…" lost "Nothing" in noise.
  **Keep every safety-critical negation mid-sentence** ("makes no claim", "does not ask"); at the start
  of a sentence it is the first thing noise erases.
- **"lawful orders" → "law for orders"**, so the lines say **legal / illegal**.
- **"Ghislaine": the voice said "GHIS-layn".** Her name is /ɡiːˈleɪn/, ghee-LAYN. `PRONOUNCE` in
  `build_psa.py` gives the voice phonemes while the page prints the spelling. Check any new name with
  `PiperVoice.phonemize()`.
- **"functioned as" → "function does"**. A lead-in ("Its conclusion is this.") and a spoken comma fixed it.
- **The address.** Spelling "www" or "D-E-V" aloud made it worse. "b, zero, b, dot dev" as its own
  sentence works. A soft final *v* was being trimmed, so line ends keep a 120 ms tail.
- Short words after a pause vanish in noise ("Pick" → gone), so it says "Choose one claim".

Result on the third cut's published MP3 (18 Oct):

| Condition | Key phrases |
|---|---|
| Clean | 30/32 |
| Street, both noise draws | 32/32 each |
| Loud, first draw | 32/32 |
| Loud, second draw | 31/32 |

Word error was 2.2–3.7%, and no negation was lost. Every miss was a phrase heard correctly in the other
conditions: "onto" for "on to" (now normalised), a skipped repeat of the address, and "Title X, Section 34".

The scorer was also fixed on this cut. It deleted any number it had no entry for, so "until 2013" read as a
missing phrase. `words()` now says years the British way. At the faster pace base.en spells the name five
ways, so any gil-/guil- spelling before "maxwell" is accepted, and the gis- spellings, which are the wrong
sound, still fail.
