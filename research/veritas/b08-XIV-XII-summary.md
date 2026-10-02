# b08-XIV-XII — VERITAS summary (109 markers)

**Verdicts:** fix 44 · imprecise 32 · rule 19 · ok 9 · editorial 3 · unverified 2. Every idx appears exactly once in `b08-XIV-XII-verdicts.jsonl`.

## The 10 most serious problems
1. **Marikana (735)** breaks the living-person floor. The marker implies that Ramaphosa's emails led to the 34 deaths. The Farlam Commission "entirely absolved" him. The rewrite prints the emails and the absolution together.
2. **Nestlé (470)** misquotes a living person. Brabeck never said "Water is not a human right". He called declaring it a public right "an extreme solution" (2005), and later said drinking water *is* a human right.
3. **Kipushi (303)** says "Robert Friedland - sanctions controversies". No sanctions exist. The label is unsupported and attached to a living person.
4. **Eastern Congo cobalt (176)** sits in South Kivu, about 855 km from the cobalt belt. This is an editorial call: delete it, or re-label it as a 3TG marker (per cobalt-legal). **Lubumbashi (302)**: no source exists for the "$74B" figure; remove it.
5. **Coordinates are badly off on 20+ markers.** The worst are Laucala (~65 km), Perm-36 (~80 km), Simandou (~70 km), Manus (~35 km), Reko Diq (~35 km), Muruntau (~33 km) and Runit (~32 km). Thacker Pass, El Teniente, Tagomago, Brecqhou (it sits on St Peter Port), Guantánamo (it sits on Cuban Caimanera) and Buck Island (it sits on Tortola) are also wrong.
6. **Stale ownership.** Rössing is now CNUC, not Rio Tinto. Cerrejón is Glencore, and South32 never owned it. Mountain Pass was never a "Chinese consortium", and the DoD has been its largest holder since 2025. Grasberg is 51% Indonesian state.
7. **Wrong facts:**
   - Indian Creek: the $170M purchase was Zuckerberg's, not Bezos's.
   - Palmyra is an *incorporated* territory.
   - Norilsk was re-closed in 2001; the marker treats 2001 as an opening.
   - Pitcairn: seven men were tried, not "nearly every adult male".
   - Tetiaroa was not bought from royals.
   - Hashima: forced labour was not "acknowledged".
   - Churchill is not on the Northwest Passage.
8. **Anti-map chains.** The chains on 176/301, 241, 304, 305 (lithium deal then "coup"), 310, 313, 319, 741 and 734 present sequence as cause. 734's "gold standard built on apartheid" is also anachronistic.
9. **Edit-history narration** ("CORRECTED/ADDED/QUALIFIED 31 Aug 2026") survives in 15 ctx fields, against the 12 Sept rule. Compliant rewrites are given.
10. **"Tier N" labels on living people** (Musk T5, Kushner T5, Rice T3) are not explained on the map.

## Nulls / refused
- `idc-seychelles.com`: transport error.
- `idc.sc` root: an empty JS shell, 218 chars. Its /about/ and /services/ pages read fine.
- Wikipedia 404s on several titles. Alternatives were found for all except the Weda Bay and 2021 Ceuta pages.
- mining.com (403 per the cobalt pass) was not used.

## Traps
- Wikipedia's Desroches page gives ICAO **FSDA**, which the d'Arros marker also claims. This is unresolved; drop the codes until they are checked against the AIP.
- The Peter Island page says the island is owned by both the "DeVos family" and the "Van Andel family".
- Two Nauru markers (236, 446) share identical coordinates.
