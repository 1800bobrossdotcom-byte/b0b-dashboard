# Map labeling coherence check — all 1,182 markers

**20 September 2026.** Second pass; the first (19 Sept) fixed dates. This one tests every marker's
name against its type, section, context text and coordinates, and every marker against every other
for duplication. Method and thresholds are stated per check so the numbers can be re-run.

Source: `site/map.html` `locations` array parsed with `scripts/build-kml.py`'s walker (1,182
markers; fields `name, lat, lng, section, type, ctx`, plus `date/dprec` on 820).

---

## 1. What was fixed (autonomous, labeling only)

**Six orbital launch sites typed as "Suspicious Airports" or "Technology" → `satellite`.** The
legend's Satellite Networks class already held Cape Canaveral, Vandenberg, Baikonur, Kourou,
Tanegashima and the Sriharikota entry in Section X; the same class of site in Section IX was typed
`airport`, and the same site (Sriharikota, Sohae) carried two types on the map at once. Each
context text says spaceport, launch complex or launch facility.

| Marker | Section | Was | Now |
|---|---|---|---|
| Esrange Space Center, Kiruna, Sweden | IX | airport | satellite |
| Cayenne, French Guiana - EU Space Launch | IX | technology | satellite |
| Wenchang Space Launch Site, Hainan, China | IX | airport | satellite |
| Jiuquan Satellite Launch Center, Inner Mongolia, China | IX | airport | satellite |
| Satish Dhawan Space Centre, Sriharikota, India | IX | airport | satellite |
| Sohae Satellite Launching Station (Tongchang-ri), North Korea | IX | airport | satellite |

Sohae's Section VII twin stays `military` (it is listed there as a missile site). Plesetsk (VII)
and Clear Space Force Station (IX) stay `military`. KML regenerated. Type totals: satellite 28 → 34,
airport 27 → 22, technology 42 → 41.

**Nothing else was changed.** Everything below is held for the author because it is editorial,
deliberate, or not an error on its face.

---

## 2. Checks that came back clean

- **Coordinates in range:** 1,182 / 1,182. No null-island points. Two integer-coordinate markers
  are region markers by design (South China Sea drilling, Arctic drilling frontier).
- **Exact duplicate names:** 0.
- **Every `type` value has a legend entry** (25 types, 25 checkboxes). Every `section` value is a
  report section or one of the three map-only layers (MS, SPORTS, ANIMAL).
- **Dates:** `scripts/date-markers.py` dry run reports 0 changes against the 19 Sept rewrite —
  820 dated (242 day, 68 month, 510 year), 362 undated.
- **Context text:** shortest is 59 characters (Sugar Grove), longest 1,854 (L3Harris). No empty
  contexts.

---

## 3. Held for the author — duplication

**92 co-located pairs** (two markers within 300 m). Most are legitimately two entries for one
neighbourhood — lower Manhattan alone accounts for a dozen (NYSE, Fed vault, Kuhn Loeb, Charging
Bull, NYPD Domain Awareness, Wall Street). The ones that are the *same site or the same event
twice* fall into four classes:

**3a. Same site, same section, two markers — plain duplicates.**
- Menwith Hill, UK (X `military`) and Menwith Hill, UK - Satellite Ground Station (X `satellite`).
- Pine Gap, Northern Territory (X `military`) and Pine Gap, NT - Satellite Ground Station (X `satellite`).
- Culiacán, Sinaloa - Cartel HQ and Culiacán, Sinaloa - Cartel Capital (both XVII `organized-crime`,
  identical coordinates).
- Allegiant Stadium — Las Vegas Raiders (SPORTS `sports-gambling`) and Allegiant Stadium — Raiders /
  Sheldon Adelson Legacy (SPORTS `financial`).
- GCHQ Bude: Cable Tap (X `submarine-cable`) and Satellite Intercept (X `satellite`) — arguably two
  functions of one station.

**3b. The Olympic set is on the map twice.** Section XIII's "Olympic Pattern" carries fourteen host
venues; the SPORTS layer carries eight of the same hosts under different names and types:
Berlin 1936 (XIII `archaeological` / SPORTS `sports-gambling`), Munich 1972 (`conflict` / `conflict`),
Salt Lake 2002 (`financial` / `organized-crime`), Beijing 2008 (`surveillance` / `sports-gambling`),
Sochi 2014 (`conflict` / `sports-gambling`), Rio 2016 (`financial` / `sports-gambling`), plus
Atlanta 1996 and Olympia only in SPORTS. The IOC headquarters is also on the map twice
(VII `governance` and SPORTS `governance`, same coordinates). Merge or keep is editorial.

**3c. Same event twice across sections** — the six from the first pass plus two:
Tehran 1953, Guatemala 1954, Santiago 1973 (VII `military` / XV `conflict`); Menwith Hill and Pine
Gap (above); Svalbard Seed Vault (IX `underground` / XVII `corporate`); **Medellín CENTRA SPIKE**
(VII `military` / XVII `organized-crime`, identical coordinates, near-identical names); **Củ Chi
Tunnels** (IX `underground` / XV `conflict`).

**3d. Same institution, two sections, two types** — probably intended as two lenses, listed so the
choice is visible: General Dynamics HQ Reston (VII `military` / XV `corporate`); ASML Veldhoven
(X `corporate` / IX `technology`); Harvard (IX `governance` Law School / IX `technology` University);
Nauru (XII `enclave` / XIV `mining`); Guantánamo (XII `enclave` / VII `military`); Little St. James
(II `epstein-network` / IX `enclave`); Göbekli Tepe ×3 (XIII site, XIII museum, XV "region" as a
`conflict` marker 8 km away).

---

## 4. Held for the author — type coherence

**4a. The Olympic venues in XIII carry seven different types for one class of site:**
`conflict` (Sochi, Munich, Sarajevo, Mexico City), `financial` (Athens, Rio, Salt Lake, Tokyo,
Montreal), `surveillance` (Beijing, London), `governance` (PyeongChang, Los Angeles) and
`archaeological` (Berlin 1936). This reads as deliberate — each type encodes what the contest at
that host was — and it is coherent on that reading except Berlin, where `archaeological` does not
describe 1936. A `sports-gambling` type exists and is what the SPORTS layer uses for the same
venues. Author's call whether the encoding stays.

**4b. Keyword-versus-type disagreements: 58 flagged by heuristic, reviewed by hand.** After
removing the six launch sites fixed above and the false positives (national laboratories typed
`technology`, "Arsenal" in a sports owner's name, Camp David typed `underground` for its tunnel,
Tura–Masara typed `underground` on purpose), the remaining ones worth a look:
- Hotel Hartenstein / Airborne Museum, Oosterbeek — VII `military`; a `museum` type exists.
- Tulsa Convention Hall - 1921 Detention Camp — XIII `military`; the adjacent Greenwood marker is
  `conflict`.
- Camp Lemonnier, Djibouti — IX `blacksite`; it is a base used as a rendition hub, context says so.
- Shamsi Airfield (CIA Drone Base) — IX `military` while the rendition-transit airports are `airport`.
- Mount Pony Federal Reserve Bunker — IX `underground` (the cash bunker); could be `financial`.
- Norges Bank Investment Management — ANIMAL `capital` (deliberate: institutional holder list).

**4c. The 18 `capital` markers in the ANIMAL layer** are the disclosed institutional holders of the
animal-research companies. Deliberate; recorded again so it is not re-flagged.

**4d. Section × type matrix, for reference.** VII: military 76, obelisk 38, financial 26,
governance 25. IX: underground 74, technology 34, airport 20 → 15 after the fix, military 15,
blacksite 11. X: corporate 38, surveillance 35, submarine-cable 31, satellite 28 → 33. XIII: museum 44,
archaeological 28, financial 12, obelisk 8, conflict 6. XVI: blacksite 35, military 15. SPORTS:
sports-gambling 43, organized-crime 18, governance 4, conflict 3, archaeological 3.

---

## 5. Held for the author — form

- **Name dash styles are mixed:** 348 names use ` - ` and 233 use ` — ` for the same role
  (name – qualifier). Cosmetic; a one-line normalisation either way, but it touches a third of the
  names, so not done unasked.
- **58 markers sit at two decimal places or fewer** (~1 km). Regions, fields, atolls and sea areas
  are correct at that precision. Point facilities at 2 dp that could be tightened if wanted:
  Mount Yamantau, NEOM/THE LINE, Gotthard Base Tunnel, CFB North Bay, Perm-36, Semipalatinsk,
  Concordia and Rothera stations, Lefdal Mine DC, Tuas Equinix, OneWeb Fairbanks, Luxembourg
  Freeport, Ankang, Kwajalein.
- **Context text rarely repeats the marker's name** (155 markers share no distinctive token
  between name and context). Checked by hand on forty: normal, the context describes rather than
  restates. Not a mislabel signal and not pursued further.

---

## 6. Name ↔ coordinate agreement (reverse geocode)

Method: every marker reverse-geocoded through Nominatim (one identified request per 1.2 s, cached
in `scratchpad/revgeo.json`); a gazetteer built from the geocoder's own answers plus US states and
aliases; a marker is flagged when its *name* contains a place term and none of the named places
appear anywhere in the geocode answer for its own coordinates. The first 600 were reviewed by hand
to tune the exclusions (East India Company, Chicago Outfit, New England, the Pentagon's D.C.
address against its Arlington coordinates, Crimea, Gaza, Turkey/Türkiye), all benign.

**Result: no coordinate error found.** 1,152 unique coordinates geocoded (co-located markers share a
key); 12 returned no result and are sea or ocean points by design (Lady Ghislaine's last position,
the Strait of Malacca cable transit, Narco-Submarines Pacific, offshore drilling regions); 166
markers name no place at all (companies, people, artworks) and cannot be tested this way; **1,004
compared, 10 flagged, all ten benign on inspection:**

| Marker | Name says | Geocode says | Why it is fine |
|---|---|---|---|
| Pentagon, Washington D.C. | D.C. | Virginia / Arlington | The building is in Arlington; the postal address is D.C. |
| London Olympic Park, Stratford | Stratford | Greater London | Stratford is inside Greater London |
| Luxor Hotel Obelisk; T-Mobile Arena; Allegiant Stadium; MGM Resorts HQ; Wynn Las Vegas | Las Vegas | Clark County | The Strip is unincorporated Clark County, not the city |
| Ramoji Film City, Hyderabad | Hyderabad | Telangana | Outside the city limits, correct state |
| Jerry Jones — Dallas Cowboys | Dallas | Texas / Arlington | AT&T Stadium is in Arlington, Texas |
| Guerguerat Crossing / Moroccan Berm — Western Sahara | "western" | Morocco / Dakhla-Oued Ed-Dahab | Gazetteer artefact; the crossing is where the marker is |

So the coordinates agree with the names everywhere the names can be tested. The thing the first
pass found in dates has no counterpart in positions.

---

## 7. Summary

| Check | Markers | Errors fixed | Held for the author |
|---|---|---|---|
| Coordinate range and precision | 1,182 | 0 | 14 point facilities at ~1 km precision |
| Name ↔ coordinate (reverse geocode) | 1,004 testable | 0 | 0 |
| Type ↔ name class | 1,182 | 6 launch sites → `satellite` | 6 individual type choices (§4b); Olympic encoding (§4a) |
| Duplicates | 92 co-located pairs | 0 | 5 same-section duplicates; the XIII/SPORTS Olympic overlap; IOC ×2; 8 same-event-twice pairs |
| Dates | 820 | 0 (stable since 19 Sept) | — |
| Form | 1,182 | 0 | mixed dash styles, 348 vs 233 |
