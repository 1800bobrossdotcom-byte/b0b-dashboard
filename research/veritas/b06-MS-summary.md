# b06-MS: summary (161 markers, US mass shootings, Mother Jones 1982-2026)

**Verdicts:** ok 90 · imprecise 61 · fix 3 · editorial 6 · unverified 1 (161, every idx once).

**Primary obtained:** the MJ Google Sheet CSV through the spider (ledger ok, sha256 8602f73d…bc83, 161 rows). **All 161 markers match their MJ rows exactly** on case name, location, date, venue, killed, injured and total, and the summary text matches (37 are cut at a sentence boundary). No MJ row is missing from the map. Every marker was then checked against its Wikipedia article (139 fetched) and the reverse-geocode cache. **Every pin sits in the right city or county.**

## Most serious problems
1. **Three dates are wrong in MJ, and the marker copied them:** Seattle café (1070) was 30 May 2012, not 20 May. Fort Hood 2 (1081) was 2 Apr 2014, not 3 Apr. Springfield MO (1131) was 15 Mar 2020, not 16 Mar.
2. **MJ's "Killed" counts the perpetrator in 36 rows, mostly before 2013** (San Ysidro 22 = 21 victims; Luby's 24 = 23; Binghamton 14 = 13; …). Other rows leave the shooter out (Virginia Tech, Sandy Hook), so the field means different things on the same layer. MJ's own guide says victims "not including himself". Fix: annotate the count and keep MJ's number.
3. **Las Vegas (1103):** "Injured: 546" matches no official figure. The official count is about 867, with at least 413 hurt by gunfire or shrapnel.
4. **25 pins are 3–13 km from the actual site.** They are city centroids or MJ's city-level points: Uvalde 11 km, Tulsa 12 km, San Diego mosque 11 km, Westside 13 km, Covenant 9 km, Oikos 9 km and others. Each fix gives Wikipedia's coordinates.
5. **1143** happened in Vestavia Hills, not Birmingham.
6. **Stale "allegedly":** Crimo (1144) pleaded guilty in Mar 2025 and Carriker (1157) in Dec 2025.
7. **1146 names a 15-year-old shooter and his brother, who was one of the victims.**
8. **Seven typos copied from MJ:** Lousiana, Philidelphia, businees, "San Diego, CA", a stray \x87 byte, a garbled sentence (1088), and "would" for "wound".
9. Injured counts differ from Wikipedia in about 20 rows (for example Covenant MJ 6 vs 2, Thousand Oaks 22 vs 16). These are recorded as notes and left unchanged.
10. **1033:** I could not check whether its count includes the perpetrator. There is no Wikipedia article and NYT returned 403.

**Perpetrator named: 160 of 161.** Every marker except 1138 (Sacramento church) names one. Living, charged people stated as fact: 1104, 1142, 1162, 1165, 1166, 1168, and 1167 with "allegedly".

**Nulls:** Wikipedia REST API (blocked by robots.txt); nytimes.com (403); 33 guessed Wikipedia titles returned 404. **Traps:** MJ dates mix 4-digit and 2-digit years; the Wikipedia event coordinate for Red Lake is about 31 km off, so it was not adopted.
