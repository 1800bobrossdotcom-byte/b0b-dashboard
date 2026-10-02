# VERITAS — full map marker audit, 2 Oct 2026

Author: *"all markers, require utmost accuracy - scan every marker on map and ensure this VERITAS."*
Ten audit agents, one per section batch (brief: `research/veritas/BRIEF.md`), every marker given exactly one
verdict with sources read through the spider (`research/veritas/*-verdicts.jsonl`, summaries `*-summary.md`).

**Verdicts (1,174 markers):** ok 208 · imprecise 421 · fix 363 · rule 81 · unverified 79 · editorial 22.

**Applied (live):** 839 marker edits — 176 pins moved (worst: Nord Stream ~337 km, WIPP ~319 km, Çatalhöyük ~400 km,
Mihail Kogălniceanu → Detention Site Black, Bucharest), 63 renames, ~750 ctx rewrites, 158 date fields, 26 types.
91 connection-line endpoints moved with their pins (only where the line's own label names the marker; the Tulsa
massacre lines and the Cairo line were excluded as false matches). The Camp David ↔ Raven Rock tunnel label changed
from "confirmed corridor" to "alleged". **Two markers deleted under the living-person floor:** #329 Vivex Biologics
(unsourced clearances / reverse-engineering claims about a living private person) and #522 "Sea Change Estate"
("upon death" about a possibly living person; private residence pinned). Map now **1,172** markers.

**Reviewed by me before applying:** all 122 rule / living-person fixes read in full; guards run on every fix (fetched
source present, no banned edit-narration or shielding phrasing, no residence house numbers, growth limits, every move
>100 km inspected); high-stakes claims re-read in the spider cache (Kraft — prosecutors found no trafficking evidence;
Wolfheze — English bombers; Vanguard owned by its funds; Fed Act Senate 43–25; Mena 2020 FBI/ASP/IRS document;
Farlam absolved Ramaphosa; Lutnick — island lunch at the 10 Feb 2026 Senate hearing, 2011 scaffolding visit in the May
2026 House Oversight interview). **Overrides:** #647 Lutnick wording split between the two hearings; #685 house number
dropped; **#58 rename NOT applied** — the agent would have removed "Anthropic" from "Amazon / Anthropic AI Campus" only
because it could not read a source; Amazon has said publicly that Project Rainier serves Anthropic, and the drafting
assistant's maker is not to be scrubbed on a null.

**Not changed — 65 `unverified` markers with no proposed fix** keep their text (listed by idx in the verdicts files);
those claims stand at the tier they had, unconfirmed by this pass.

**Not audited:** the connection-line, tunnel-path and animal-network labels (420 lines). Many carry the anti-map chains
this pass removed from markers ("techniques traveled", "Five Eyes psychiatry", "same playbook", "RICO-grade"). That layer
needs its own pass.

## HELD FOR THE AUTHOR (27)
- **#18 La Sante Prison, Paris (Brunel custody death)** [editorial] - Facts correct (found 19 Feb 2022, ruled suicide; coords match 48.83389,2.33972)
- **#176 Eastern Congo / DRC - Cobalt Mines** [editorial] - Wrong location for cobalt: -3.45,28.0 is Wamuzima, Mwenga territory, South Kivu - about 855 km from Kolwezi. DRC cobalt is mined in the southern Copperbelt (Lualaba, Haut-Katanga).
- **#186 National Defense University, Washington D.C.** [editorial] - Location (Fort McNair) and the existence of international-fellow programmes are uncontested; 'Graduates return carrying the architecture in their training' is the report's interpretation stated as fact - label it or cut it.
- **#236 Nauru - Mining + Detention Island** [editorial] - Duplicate of idx 446 'Nauru' (identical coordinates -0.5228,166.9315; XII vs XIV). Merge or keep both is the author's call.
- **#333 HAARP, Gakona, Alaska** [editorial] - 'Transfer to university changed FOIA jurisdiction, not capability' is insinuation without a source
- **#341 Concordia Station, Antarctica (France/Italy)** [editorial] - type 'military' is wrong for a French-Italian research station
- **#373 Soto Cano Air Base, Honduras** [editorial] - JTF-Bravo HQ checks. 'Proximity to School of Americas graduates who governed the region' is a loaded juxtaposition with no documented edge - label or cut.
- **#446 Nauru** [editorial] - Duplicate of idx 236 (identical coordinates). Merge is the author's call.
- **#476 Göbekli Tepe Excavation Site Museum, Urfa** [editorial] - Same coordinates as idx 171 (Göbekli Tepe) - duplicate site; the museum holding the finds is Şanlıurfa Archaeology Museum in the city.
- **#536 The Alamo (Astor Place Cube), New York City** [editorial] - Facts check: Tony Rosenthal, 1967, 8-ft Cor-Ten cube on a corner, rotates on a hidden pole
- **#539 KAWS Companion Sculptures - Various Locations** [editorial] - Not an obelisk (type wrong); 'Various Locations' pinned to an arbitrary Manhattan point.
- **#541 Maman (Giant Spider) - Louise Bourgeois, Various Locations** [editorial] - No permanent Maman in Paris (Tuileries/Pompidou 2008 were temporary) - pin is wrong; permanent editions: NGC Ottawa, Guggenheim Bilbao, Mori Tokyo, Crystal Bridges, Leeum Seoul, QNCC Doha, Kemper KC.
- **#591 Mosfilm Studios, Moscow, Russia** [editorial] - Founding Nov 1920 (as Goskino's first and third film factories; formal 1924), Battleship Potemkin produced by Mosfilm, Stalker (1979): confirmed.
- **#602 Ionia State Hospital, Michigan** [unverified] - 'MKUltra Subproject 53', 'Dr. James Hamilton' at Ionia, LSD/mescaline/scopolamine on prisoners, 'closed 1968' and 'records largely destroyed' - none found in any fetched source (Wikipedia Ionia State Hospital has no MKUltra/Hamilton/LSD mention). Hold or remov Proposed: delete.
- **#604 Creedmoor Psychiatric Center, Queens, NY** [fix] - Harold Blauer died on 8 January 1953 at the New York State Psychiatric Institute, not at Creedmoor and not in December 1952; NYSPI is not part of a 'Creedmoor network'. The death was an Army Chemical Corps contract, which predates MKUltra (April 1953) - 'MKUlt Proposed: delete.
- **#606 Riverview Hospital (Essondale), Coquitlam, BC, Canada** [fix] - 'Dr. Hollywood (actual name: Dr. J.G. Chicken worked under pseudonym)' has no source and appears garbled - the BC LSD work associated with 'Hollywood' was at the private Hollywood Hospital, New Westminster, not Riverview. Riverview LSD experiments, 'multiple p Proposed: delete.
- **#613 Kasr El Aini Hospital, Cairo, Egypt** [editorial] - The marker types Egypt's main teaching hospital (Kasr Al Ainy, Cairo University) as a 'blacksite' and asserts 'psychiatric commitment as political tool', an HRW finding about this hospital, and a 'dissident -> arrested -> psychiatric evaluation -> commitment - Proposed: delete.
- **#615 Topeka State Hospital, Kansas** [fix] - 'MKUltra Subproject 43 - Dr. Robert Hyde', 'Menninger Foundation was CIA's preferred psychiatric training ground' and 'trained CIA-affiliated psychiatrists who later conducted experiments across the MKUltra network' are unsupported in any fetched source (Wikip Proposed: delete.
- **#632 Technion - Israel Institute of Technology, Haifa** [editorial] - The Technion→8200→founders pipeline is self-published and thin as evidence (operating memory: 8200 founder claims are near-worthless; the binding document is the DECA export licence)
- **#645 De Witte Poort (The White Gate), Oosterbeek** [fix] - WRONG STREET AND PLACE: municipal monument 'Woonhuis "De Witte Poort"' (1850) is at Benedendorpsweg, Oosterbeek, 51.97806,5.82944 - not on the Utrechtseweg; marker is ~1 km off Proposed: delete.
- **#712 Colosseum - Rome (The Original 'Baal Game')** [editorial] - Facts confirmed (completed AD 80 under Titus; 50,000-80,000).
- **#1142 Concrete company shooting - Smithsburg, Maryland** [editorial] - names a living defendant stating he "shot four coworkers" as fact; conviction status not verified here
- **#1144 Highland Park July 4 parade shooting - Highland Park, Illinois** [editorial] - note: injured 46 is MJ's figure; WP 48 - definitions differ (gunfire vs total, later updates); not changed
- **#1146 Raleigh spree shooting - Hedingham, North Carolina** [editorial] - names a 15-year-old perpetrator and his 16-year-old brother (a victim) by first name; Wikipedia: pleaded guilty 21 Jan 2026, tried as adult - naming a juvenile is an author call on top of the open perpetrator-naming question
- **#1166 Montana bar shooting - Anaconda, Montana** [editorial] - names a living defendant ("the suspect in the attack"); conviction status not verified here
- **#1167 Austin parking lot shooting - Austin, Texas** [editorial] - names a living defendant with "allegedly"; status not verified
- **#1168 North Carolina waterfront bar shooting - Southport Yacht Basin, North Carolina** [editorial] - note: injured 8 is MJ's figure; WP 6 - definitions differ (gunfire vs total, later updates); not changed