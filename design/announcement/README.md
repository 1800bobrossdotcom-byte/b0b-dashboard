# Public announcement

A spoken announcement about the report, in one calm voice, built to stand on its own and to be heard
outdoors from a single speaker. One pass is about four minutes. It is published at
**https://www.b0b.dev/announcement** as a loop for repeat play and as a file a little over an hour
long.

The words live in `build_psa.py` (`SECTIONS`). The page and `script.txt` are generated from the same
list, so the page cannot drift from the audio. Every statement about the report is the report's own,
from its masthead, Section I, the address *To those inside* and the close.

## What it says

1. **Who it is from:** a private citizen, **not any government and not the police**. It must never
   sound like an official alert. It uses no alert-style tones, and the chime is two soft notes made
   here. Then the hook: a free, public report where every line can be checked, and where it is.
2. **What the report is:** a documented record of how institutions failed. It starts with the
   Epstein–Maxwell network and the institutions that failed to stop it, then asks whether the
   pattern is older than any government, company or family line, and it comes with a map.
3. **How it works:** the five grades, the marked boundary where facts end, the printed nulls, and the
   public corrections.
4. **What it concludes, at its tier:** that Epstein and Maxwell functioned as deniable assets. It is
   a judgment on the record, not a document. It makes no claim that either was run by a handler, and
   it shows what would lower the conclusion. This is the masthead's own wording; the film carries
   the same conclusion at the same tier.
5. **The record is deliberately dark:** a review declared closed, pages withheld and redacted,
   reports under seal.
6. **What you can do:** read it, choose one claim and check its source, send corrections, tell one
   person.
7. **To anyone who serves:** nothing documented has hands of its own; the duty is to legal orders.
   **"This message does not ask you to disobey legal orders… to desert, to sabotage, to obstruct, or
   to leak." Keep this in any edit.** 18 U.S.C. § 2387 makes it a crime to urge members of the
   armed forces toward insubordination or refusal of duty. Then the lawful channels (Inspector
   General, Member of Congress, 10 U.S.C. § 1034) and: send classified material to no one.
8. **Close:** "The record already exists…", and the address three times, with `b0b` spelled
   radio-style.

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

Result of the final run: in noise, about 96% of words correct, and no negation lost in any condition.
