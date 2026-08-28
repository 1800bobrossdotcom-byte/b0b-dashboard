# DOJ EFTA recordings — transcripts and verification record

Three recordings released by the Department of Justice under the Epstein Files
Transparency Act, pulled and verified 27 August 2026.

Each has a machine (ASR) transcript here in two forms: the original `.json`
(timestamped segments, machine speaker labels) and a readable `.md` render.

---

## Verification against justice.gov

Every field below was taken from the government's own server, not from any
mirror. Access requires the cookie `justiceGovAgeVerified=true` — DOJ put the
EFTA media behind a one-click 18+ interstitial. That is an age gate on public
records, not a credential, a paywall, or an access control.

| Bates | Description | Runtime | Recorded | DOJ `content-length` | DOJ `last-modified` |
|---|---|---|---|---|---|
| `EFTA01600824` | Interview with Steve Bannon | 1:57:46 | **2019-04-30** | 1,005,964,909 | Fri, 30 Jan 2026 06:41:01 GMT |
| `EFTA01621008` | Meeting with Ehud Barak and Larry Summers (audio only) | 3:26:56 | **2013-02-16** | 103,699,351 | Fri, 30 Jan 2026 06:42:29 GMT |
| `EFTA00179446` | Covert recording — Alfredo Rodriguez document handover | 1:23:38 | — | 135,747,655 | Wed, 04 Mar 2026 23:32:39 GMT |

URLs:

```
https://www.justice.gov/epstein/files/DataSet%2010/EFTA01600824.mov
https://www.justice.gov/epstein/files/DataSet%2010/EFTA01621008.mov
https://www.justice.gov/epstein/files/DataSet%209/EFTA00179446.m4v
```

Note the third date. The Bannon and Barak/Summers files were published in the
**30 January 2026** tranche — not "February 2026," which is when the press
noticed them. The Rodriguez file was posted **4 March 2026**, later and
separately.

### Files downloaded and hashed

Downloaded in full, byte counts confirmed against the `content-length` above,
and verified as complete QuickTime containers (`ftyp` / `wide` / `mdat` / `moov`).
The media itself is **not committed** — only these hashes.

```
sha256  241c17bcafecc977f69ee066b36d83d767c0e1ac79f6ef1f017a51a9c7095156  EFTA01600824.mov  (1,005,964,909 bytes)
sha256  09718fc665d714c1643050ac47968c230fbe3807e5ddf8725c21e2ff898a976c  EFTA01621008.mov  (  103,699,351 bytes)
```

### Metadata read out of the DOJ file itself

Parsed from the `moov` atom of the downloaded file, so it depends on no
third party:

**EFTA01600824**
- `©nam` (title): **`je_1st_session`**; QuickTime description: *"This video is about je_1st_session"*
- `mvhd` created: **2019-04-30 12:29:50**, modified: 2019-04-30 14:39:48
- `mvhd` duration: **7066.375 s** = 1:57:46
- An `©ART` author field names the videographer. **Deliberately not recorded here
  and not published** — a private, living, uncharged crew member. It adds nothing.

**EFTA01621008**
- `mvhd` created: **2013-02-16 01:19:20**
- **No embedded title, author or description.** This matters for tiering: the
  "Barak and Summers" identification is *not* DOJ's label, unlike `je_1st_session`.
  It is corroborated separately — see below.

---

## Provenance of the transcripts

The transcripts were obtained from a public index of the EFTA video release
(`tommycarstensen.com/epstein`), used **strictly as a pointer**. It is not the
source-family this report rejects elsewhere (`epstein-data.com`, the
`rhowardstone/Epstein-research` reconstructions), and the difference is testable
rather than a matter of taste: this index publishes DOJ Bates IDs and government
URLs that resolve, and its metadata reproduces **byte-for-byte** against
justice.gov's own headers and against the QuickTime atoms inside the files.
Every fact that reaches the report is re-derived from the DOJ file.

### Known defects in the transcripts — read before quoting

1. **These are ASR transcripts.** DOJ released media, not transcripts. Nothing
   here is a certified or official record of the words.
2. **Speaker labels are unreliable and in places demonstrably wrong.**
   - `EFTA01600824` carries five machine labels and an empty `speaker_names` map.
     The entire tier-one exchange at 1:56:03–1:56:30 — Bannon's question *and*
     the answer — is tagged `SPEAKER_03`. It cannot be right.
   - `EFTA01621008` and `EFTA00179446` have **no usable diarization at all**;
     every segment is `UNKNOWN`.
   - Therefore: these establish **what was said**, not **who said it**. Any quote
     published with a name attached must be corroborated independently.

---

## Passages used in the report, with their timecodes

Both sit in the last four minutes of the released session, back to back.

| Timecode | What it is |
|---|---|
| **1:56:03–1:56:30** | The tier-one exchange — *"what are you, class three sexual predator?" / "Tier one." / "No, I'm the lowest… but a criminal."* |
| **1:56:42–1:57:36** | The devil exchange — *"Do you think you're the devil himself?" / "No, but I do have a good mirror." … "No, the devil scares me."* |

**Speaker attribution for both comes from contemporaneous reporting** (France 24,
The Independent, Premier Christian News and others, Feb 2026), **never from the
machine diarization**, which tags both sides of both exchanges to one label.

**One detail in the devil exchange is the report's own and is worth flagging.**
Epstein answers the Milton quotation with *"I saw that in a movie once called
American Dharma. I don't remember who said it."* American Dharma is Errol
Morris's 2018 documentary **about Bannon**, in which Morris offers that line and
Bannon completes it himself — *"Better to reign in hell than serve in heaven"* —
adding *"I love that line."* The session was recorded 30 April 2019, before the
film's US theatrical release. The report states the structure and explicitly
does not assert whether Epstein's answer was a lapse or a needle.

---

## Identification: how each recording's participants were established

**EFTA01600824 (Bannon).** DOJ's own embedded title `je_1st_session` plus
contemporaneous reporting (NBC/ms.now, CBS, CNN) naming Bannon as the
interviewer and quoting the tier-one exchange in wording that matches the
transcript closely.

**EFTA01621008 (Barak / Summers).** DOJ attached no label, so identification
rests on two independent legs:
- *Internal*: a participant is addressed as **"Ehud"** (1:48:12, *"Ehud, this
  was very good"*); a participant is addressed as a former prime minister
  (0:50:28) and says *"I wasn't prime minister of my country"* (0:55:26);
  another participant is discussed as "Larry" in the third person at 1:55:10 and
  2:14:18. Ehud Barak was Prime Minister of Israel 1999–2001 and was **serving
  Defense Minister** in February 2013.
- *External and decisive*: **Barak himself publicly responded to this recording**
  in an N12 interview (reported by The Jerusalem Post, 12 February 2026), saying
  *"I regret the moment I met him in 2003,"* calling the release *"a distorted
  description through cutting pieces of a conversation,"* and stating there was
  *"no crime, no criminal act, nothing improper."* A subject confirming the
  recording is of him is the strongest identification available, and his
  objection to the framing is on the record and must travel with any use of it.

**EFTA00179446 (Rodriguez).** Identification is the index's, not DOJ's, and is
**not independently corroborated here**. The content is consistent with the
documented 2009 FBI sting in which Epstein's former house manager Alfredo
Rodriguez attempted to sell stolen Epstein documents to an undercover agent —
the recording opens on a cash-for-documents handover (*"Well, here's five. Go get
the documents"*, 0:02:00) — but that consistency is not proof of identity. Hold
at attributed tier or verify further before publishing anything about it.

---

## Reviewed and deliberately excluded

`EFTA01621008` at 0:37:18 contains the phrase *"Many young, handsome girls will
come."* In context (0:36:41–0:37:45) it is unambiguously about **Jewish
immigration to Israel from Russia and Belarus** and Israeli demographic policy.
It has nothing to do with the trafficking. Barak has publicly disavowed the
wording as *"an unfortunate choice of words and metaphor."*

It is excluded from the report on purpose. Lifting a sentence containing "girls"
out of an Epstein recording where it means something else is precisely the false
weld the report's anti-map guardrail exists to refuse, and doing it to our own
material would be worse than doing it to someone else's. Recorded here so the
exclusion is a decision on the record rather than a silent omission.

---

# DOJ EFTA device extraction — Epstein iMessages, 20 December 2018

Added 28 August 2026. This is **not** a recording and **not** the email corpus. It is a
forensic extraction report from Epstein's own device, released as a PDF.

| Bates range | Pages | DOJ dataset | DOJ `content-length` | DOJ `last-modified` |
|---|---|---|---|---|
| `EFTA01211330`–`EFTA01211347` | 18 | DataSet 9 | 1,038,108 | Fri, 30 Jan 2026 06:17:15 GMT |

URL:

```
https://www.justice.gov/epstein/files/DataSet%209/EFTA01211330.pdf
```

```
sha256  da5311e1c63f866ebbb42bf76726c5828cd8ccceaad1892b0e011fe9efe8c98b  EFTA01211330.pdf  (1,038,108 bytes)
```

Retrieved with the same `justiceGovAgeVerified=true` interstitial cookie as the media
files. The PDF itself is **not committed** — only the hash and the extracted text
(`EFTA01211330.raw.txt`, produced with `pypdf`).

### What the document is, in its own words

- Evidence item: **`NYC024365.aff4`** (Device Details → `NYC024365.aff4 - 001`).
- Section header: **`Case Data: Messages (39001-39100 of 54988)`**.
- The account rendered as `Self` on every outbound message: **`jeeitunes@gmail.com`**.
- One Bates number per page; page 1 = `EFTA01211330`, page 18 = `EFTA01211347`.

**The denominator is the load-bearing fact.** The device held **54,988** messages and
DOJ published a window of **one hundred**. That is stated by the extraction tool, not
inferred, and it is the same shape as the `je_1st_session` title on the Bannon video:
the release documents its own incompleteness.

### Known defects — read before quoting

1. **The scan is poor and the text layer is imperfect.** Confirmed OCR corruptions
   include `grnail.com` for `gmail.com`, `eeitune ail.com` / `jeeitunes®gmail.com` for
   the address, `bums down his house` for *burns*, `hups://` for `https://`, and garbled
   timestamps (`I I:IR:42`). Every quotation used in the report was read against the
   surrounding lines; none is repaired silently.
2. **Every message is rendered two or three times.** Each appears once with a bracketed
   index (`[2]`, `[3]`, `[4]`, `[5]`) and again as `[1]`. The `[1]` copies are duplicates.
3. **The bracketed index is NOT relied on.** Within the single Syria/Iran exchange the
   leading index alternates between `[3]` and `[4]`, which would mean Epstein pushed the
   same analysis to two correspondents in parallel. That is a real possibility and it is
   **deliberately not published**, because at this scan quality a `3`/`4` misread is at
   least as likely as a second thread. Recorded here as unresolved.
4. **At least three distinct correspondents are interleaved** in the hundred-message
   window: the Syria/geopolitics thread, a philosophy-of-consciousness thread (Tagore,
   Rumi, *"Running to yoga class"*), and a third that closes with *"I'm grateful for your
   help with my business."* The export is a slice of the Messages table by row number,
   not a conversation.

### Identification: deliberately not attempted

**DOJ redacted every participant except Epstein.** The Syria correspondent's own messages
nonetheless contain a good deal of self-identifying material — travel, a named UN
official described as a former subordinate, and a reference to a White House briefing.

**That material is not reproduced in the report and no identification is offered.**
De-anonymising a government redaction on a living, uncharged person by inference is the
naming error the report exists to refuse, performed on our own material, and being
someone Epstein texted is not an offence. The analytic consequence is stated in the
report instead: the recipient-incentive analysis run on the Wolff and Maxwell letters
**cannot be run here**, so these messages are held *lower*, not higher.

### Passages used in the report

All are Epstein (`Sender: Self`), 20 December 2018, times UTC — the morning after the
19 December announcement of the US withdrawal from Syria.

| Time | Text |
|---|---|
| 11:45:27 | *"Trump pulling troops out of syria , is a bad sign. He is up to something . And its not good"* |
| 11:46:23 | *"btw. I believe that his pulling troops out of syria is step one"* |
| 11:46:56 | *"He needs a large diversion"* |
| 11:53:46 | *"You guys need to understand that he is psychotic. And would not blink twice at encouraging an attack on us . So he can leap to the country.s defense. . mindset. If I go down I m taking everyone with"* |
| 11:54:12 | *"Cornering a rat, never a good idea"* |
| 11:56:46 | *"Could be he doesn't want them there if a much bigger operation might put them in jeopardy . Reminder , he will take everyone down with him, if he feels the end is near. I always urge people not to corner a rat.. they become extremely dangerous and unpredictable"* |
| 12:14:13 | *"They are going drip by drip. But rats go crazy BEFORE the cage closes. Too much time . The republicans are beginning to understand .. I would nt be surprised to see him do things that might encourage a real problem"* |
| 12:21:49 | *"We only had 2k troops there , if he were to bomb Iran , they would be slaughtered"* |

**One correction the primary document forced on our own draft, recorded because it
matters.** Before this PDF was read, the working note held that the viral quote card —
*"If Trump feels cornered like a rat, he will bomb Iran just to create a diversion"* —
had invented the diversion motive outright. It had not. **"He needs a large diversion" is
Epstein's own sentence**, sent at 11:46:56, thirty-five minutes before the Iran line. The
card is a **weld of three real messages into one sentence he never wrote**, not an
invention — a materially different and more interesting object, and the finding published
in Section XIII says so.

**Also settled by the document:** *"If I go down I m taking everyone with"* is not
Epstein speaking about himself. It is the tail of a sentence about Trump, and the word
immediately preceding it is *mindset*.
