# "DARPA solved RSI over a decade ago" — the claim and its word list, tested

**Status: research, unpublished. 20 September 2026.** Sources fetched by the spider and held in
`research/sources/ledger.jsonl`; refusals recorded as nulls.

**The claim, as circulated** (a reply in a public thread, 12 Sept 2026; the account is a private
individual and is not named): *"Darpa solved rsi over a decade ago and Noone cared."* Asked for
detail: *"Key words: Spiking neural net, Synapse, Avatar, Stdp, Calo, Pal, Siri, And even
deepmind."*

**RSI** in this usage is *recursive self-improvement*: a system that modifies its own code or
architecture to raise its own capability, and does so iteratively. That is the standard sense
(the Wikipedia treatment, ledgered, describes "a seed improver" that "enables the system to
modify and improve its own codebase and algorithms").

---

## 1. Verdict first

**"Solved RSI": unsupported at any tier.** No program on the list, and no DARPA program found,
claims recursive self-improvement, and the documented outputs of the list are a scheduling
assistant and a low-power pattern-recognition chip. The list is not evidence for the claim. It
is evidence for something else, which is worth having.

**What the list actually is: a real, documented DARPA lineage in *cognitive systems* and
*neuromorphic hardware*, 2003–2014, with one unrelated program (Avatar) and one non-DARPA
company (DeepMind) appended.** The lineage is strong and mostly public. The claim converts
"learns" into "recursively self-improves," which is the naming error at the scale of a verb.

**"Noone cared": false on the record.** The SyNAPSE chip was a DARPA press release and the
cover of *Science* in August 2014; CALO's spin-out has shipped in every iPhone since October
2011. The second half of the claim fails harder than the first.

---

## 2. The words, one by one

| Word | What it is | Documented | Tier / note |
|---|---|---|---|
| **PAL** | *Personalized Assistant that Learns* — the DARPA program (Information Processing Technology Office) under which CALO was funded. | Named as CALO's funding program in the SRI and secondary record. The DARPA program page is gone (404, ledgered). | Documented as the program name; the program's own page is a null from here. |
| **CALO** | *Cognitive Assistant that Learns and Organizes*, SRI International as lead integrator, **May 2003 – 2008**, "over 300 researchers from 25" institutions; SRI's own 2008 description: an agent that "observes and tracks user desktop actions and offers contextually appropriate assistance." The name is from Latin *calo*, "soldier's servant." | SRI's 2008 AAAI entry (sri.com, ledgered); Wikipedia (ledgered). | Documented. The goal language — "reason, learn from experience, be told what to do, explain what they are doing, reflect on their experience" — is a learning assistant, not a self-modifying one. |
| **Siri** | Spun out of SRI's AI Center as Siri Inc. in **December 2007** (Kittlaus, Cheyer, Gruber, with SRI Ventures); released as an iOS app **Dec 2010**; **acquired by Apple** (SRI's page says April 2010, the Siri page says two months after the app); integrated in the iPhone 4S, **14 Oct 2011**. SRI: "Siri's technology was born from SRI's work on the DARPA-funded CALO project." | SRI International and Siri pages (ledgered). | **Documented, and the strongest thing on the list.** A DARPA contract is the seed of the consumer assistant. That is a cap-table fact, not a club fact. |
| **Synapse** | **SyNAPSE**, *Systems of Neuromorphic Adaptive Plastic Scalable Electronics*, DARPA, from **Nov 2008**: IBM ($4.9m, then +$16.1m, then +$21m in 2011) and HRL Laboratories ($5.9m, +$10.7m, +$17.9m). DARPA's stated vision: "low-power electronic neuromorphic computers that scale to biological levels." Output: the IBM chip announced **7 Aug 2014** — 5.4bn transistors, one million electronic neurons, 256 million synapses, under 100 mW, "two orders of magnitude in energy savings" on pattern-recognition benchmarks. "This program is now complete." | DARPA program page and 7 Aug 2014 release (darpa.mil, ledgered); Wikipedia for the award figures. | Documented. The DARPA release describes perception, pattern recognition and power. It says nothing about self-modification. |
| **Spiking neural net** | The computational model SyNAPSE hardware implements: neurons that communicate by discrete spikes, event-driven ("processing and transmitting data only as required, similar to how the brain works" — DARPA). | Same. | Documented as the architecture. A spiking network is not more self-improving than any other; it is more power-efficient. |
| **STDP** | *Spike-timing-dependent plasticity*: a synaptic learning rule from neuroscience — Markram (published 1997, Sakmann's lab) and Bi & Poo (1998) — where the order and timing of pre- and post-synaptic spikes strengthens or weakens the connection. SyNAPSE's first phase built "synaptic components capable of adapting the connection strength between two neurons in a manner analogous to that seen in biological systems (Hebbian learning)." | STDP page (ledgered); SyNAPSE page. | Documented as a mechanism; it is a rule for changing connection weights, i.e. learning, not for rewriting the learner. Whether the 2014 IBM chip learned on-chip at all is **not verified here** (the *Science* paper was not read for this note). |
| **Avatar** | Two candidates. (a) A DARPA Tactical Technology Office line item in the **FY2013** request, widely reported in Feb 2012 as ~$7m to develop interfaces letting a soldier partner with a semi-autonomous bipedal machine acting as a surrogate — a telepresence-robot program, not a cognition program. (b) *AVATAR*, an Arizona/DHS-funded deception-detection kiosk. | **Not retrieved from here.** darpa.mil (404), Wired (404), The Verge (404), IEEE Spectrum (404), ExtremeTech (403), the OSD comptroller FY2013 PDF (403) — all in the ledger as nulls. | **Attributed** (press memory of the FY2013 request). On either reading it is off the cognition thread and on the list by name only. The primary to pull is the FY2013 RDT&E justification, DARPA volume. |
| **DeepMind** | Founded London, **23 Sept 2010** (Hassabis, Legg, Suleyman); early money from Founders Fund and Horizons Ventures, plus Thiel, Musk, Banister, Tallinn; **acquired by Google 26 Jan 2014**; Atari-playing agents (2013–15), AlphaGo (Oct 2015). | Wikipedia (ledgered). Search of the page: **DARPA 0**, military 0. | Documented as a company; **no DARPA tie at any tier.** "And even deepmind" is adjacency by subject matter (reinforcement learning, neuroscience-inspired methods), not funding. The one club-layer edge — Founders Fund is Thiel's, Thiel co-founded Palantir — is exactly the kind of edge the report weights lowest. |

---

## 3. Where the "RSI" language would have to come from, and does not

Searched for the nearest DARPA program language:

- **SyNAPSE (2008):** "neuromorphic computers that scale to biological levels." Scaling is
  hardware size, not self-improvement.
- **CALO/PAL (2003):** "learn from experience … reflect on their experience." Learning a user's
  workflow. SRI's own 2008 demo is workflow recognition and proactive assistance.
- **Lifelong Learning Machines, L2M (darpa.mil, ledgered):** "systems that can learn
  continuously during execution and become increasingly expert while performing tasks, **are
  subject to safety limits**, and apply previous skills and knowledge to new situations —
  without forgetting previous learning." This is the closest DARPA text to the claim's shape,
  and it cuts three ways against it: it is **2017** (not "over a decade ago" from 2026 by a
  narrow margin, and a decade *after* the words on the list); its own premise is that "current
  AI is not intelligent in the biological sense" and is "limited to performing only those tasks
  for which they have been specifically programmed"; and it bounds the learner by design. A
  program whose framing sentence says the problem is unsolved is not evidence that it was
  solved earlier.

**Guaranteed-null caution, applied to ourselves:** the absence of an RSI claim in public DARPA
pages is not evidence that no classified program made one. It is evidence of nothing either
way, and a claim that "no one cared" about a thing that was never published is unfalsifiable
in the way Section I refuses. The claim as stated points at *public* programs by name; on the
public record of those programs it fails.

---

## 4. Symmetry — what is true here and adverse to the dismissive reading

Killing the claim does not kill the lineage, and the lineage is better material than the claim:

1. **The consumer assistant is a documented DARPA spin-out.** PAL (2003) → CALO at SRI → Siri
   Inc. (Dec 2007) → Apple (2010) → every iPhone (Oct 2011). The Latin behind the name is
   "soldier's servant," on SRI's and the secondary record. This is the report's money-layer
   thesis in one chain: **a contract, a spin-out and an acquisition are documents**; the club
   layer is not needed to draw the edge.
2. **The neuromorphic chip is a documented DARPA product**, funded in named tranches to IBM and
   HRL from 2008, announced by DARPA itself, and pitched in DARPA's own words for "mobile robots
   and remote sensors where electrical power is limited."
3. **The report currently carries none of it.** `Siri` appears three times (elsewhere, not in
   this lineage); SyNAPSE, CALO, PAL, TrueNorth, neuromorphic, STDP, DeepMind: **0**. DARPA: 29.
   Section X (technology as control) is where a PAL→Siri entry would sit at documented tier,
   and Section VII's Lockheed/DARPA material is where the neuromorphic line would sit.
   **Recommended for the author's decision; nothing published.**

---

## 5. Ledger

Fetched OK: darpa.mil SyNAPSE program page; darpa.mil 7 Aug 2014 release; darpa.mil L2M page;
sri.com CALO 2008 entry; Wikipedia — SyNAPSE, CALO, Siri, SRI International, Google DeepMind,
TrueNorth (cognitive computer), Spike-timing-dependent plasticity, Recursive self-improvement,
Intelligence explosion, Seed AI, Neuromorphic computing, DARPA.
Refused (nulls): darpa.mil `/research/programs/avatar` 404; darpa.mil PAL program page 404;
darpa.mil history page 404; research.ibm.com TrueNorth blog 404; wired.com 2012 Avatar 404;
theverge.com 2012 Avatar 404; spectrum.ieee.org 404; extremetech.com 403; comptroller.defense.gov
FY2013 DARPA PB PDF 403; Wikipedia `AVATAR_(kiosk)` 404.

**Not done:** the *Science* 2014 TrueNorth paper (on-chip learning question); the FY2013 DARPA
budget justification (Avatar); DARPA's PAL program documents (Federal Register / SAM for the
2003 BAA would settle the program dates and dollar figure, which this note does not state
because no source here carries them).
