# Public announcement

A spoken announcement about the report, in one hard, direct voice, built to stand on its own and to cut
through a street from a single speaker. One pass is just under four minutes. It is published at
**https://www.b0b.dev/announcement** as a loop for repeat play and as a file a little over an hour
long.

The words live in `build_psa.py` (`SECTIONS`). The page and `script.txt` are generated from the same
list, so the page cannot drift from the audio. Every statement about the report is the report's own,
from its masthead, Section I, the address *To those inside* and the close.

## What it says

Rewritten 18 Oct 2026 after the author called the first cut "too passive". It now opens on the record
itself rather than on a description of a report. The facts are the report's own sentences: Section II,
pattern five, and the conclusion block's "a non-prosecution agreement immunising co-conspirators the
government had not named; and a decade of elite access after a sex-offence conviction".

1. **Who it is from:** a private citizen, **not the government and not the police**. It must never sound
   like an official alert, so there is no alert tone, no siren, and nothing with the noise burst of a
   gunshot or a blast.
2. **The record:**
   - 1996: the report to the police and the referral to the FBI, then "nothing happened for a decade". The
     woman is not named; no survivor is.
   - 2007: the deal and the immunity it gave.
   - A decade of access after the conviction.
   - 2019: his death in federal custody, awaiting trial. Stated as a fact, not as a manner of death.
   - Maxwell's conviction and her twenty years.
   - "Deliberately dark", with the masthead's 200,000 pages. That count will go stale; rebuild when it does.
3. **What the report is:** the record in one place with its sources named; free, public, checkable; the
   address.
4. **What it concludes, at its tier:** functioned as deniable assets; a judgment, not a document; it makes
   no claim either was run by a handler; it says what would bring the conclusion down.
5. **How it works:** the five grades. It prints what it could not prove and asks to be checked, not
   trusted.
6. **What you do now:** read it; choose one claim and check its source; prove it wrong and send the
   correction; if it holds, tell one person, today.
7. **To anyone who serves:** unchanged in substance. **"This message does not ask you to disobey legal
   orders… to desert, to sabotage, to obstruct, or to leak." Keep this in any edit.** 18 U.S.C. § 2387
   makes it a crime to urge members of the armed forces toward insubordination or refusal of duty. Then the
   lawful channels (Inspector General, Member of Congress, 10 U.S.C. § 1034), and send classified material
   to no one.
8. **Close:** the report's opening line, John 12:43, quoted with no gloss; "The record already exists…";
   and the address three times, with `b0b` spelled radio-style.

**Sound:**
- Normal pace (`LENGTH_SCALE` 1.0, was 1.12) and tighter gaps.
- A low A-minor sting opens each section instead of the soft bell.
- A low pulse, 72 to the minute at 110–330 Hz, sits under the whole pass, 21 dB below the voice and under
  the speech band.
- Harder compression and presence; mastered to about -13 LUFS integrated, LRA 2.

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

Result of the final run on the 18 Oct cut: 29/29 key phrases in all five conditions, word error 4.1–5.4%
(about 95% of words right in noise), and no negation lost. At the faster pace base.en spells "Ghislaine" five
ways (guilleen, guillain, gileigh, guillelle and the correct spelling). All are the right sound, so the
normaliser accepts any gil-/guil- spelling before "maxwell". It still rejects the gis- spellings, which are
the wrong sound. Three weak takes were re-synthesised by deleting their cache entries: the 1996 line,
"disobey legal orders" and the closing address.
