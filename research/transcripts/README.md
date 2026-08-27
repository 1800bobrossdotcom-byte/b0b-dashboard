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
