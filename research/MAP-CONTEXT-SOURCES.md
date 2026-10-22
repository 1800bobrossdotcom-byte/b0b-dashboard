# Map context layers: open-data source check (22 Oct 2026)

Method: every page and file below was fetched with `scripts/spider/spider.py` (ledger rows noted `maplayers: ...`), then read from the spider cache. Licence quotes are copied from spider text (PDFs and zips were extracted locally from the cached bytes). WebSearch was used only to find candidate URLs. Refusals are recorded as nulls. Repo files were not edited; the only repo change from this work is the spider's ledger append. (`git status` also shows `server.js`, `site/map.html`, `public/vendor/`, `scripts/build-map-gl.py` modified: not mine.)

Legal reading below is a plain reading of the licence text, not legal advice. Whether the Share-Alike of ODbL reaches a simplified GeoJSON is the author's call.

---

## 1. Submarine cables and landing points

**Best source found: none openly licensed. TeleGeography is the only global dataset and its data is commercially licensed.**

- Dataset: TeleGeography Submarine Cable Map, public JSON API behind submarinecablemap.com. No version or date in the files.
- Fetch: `https://www.submarinecablemap.com/api/v3/cable/cable-geo.json` 200, 754,615 B, 733 MultiLineString features (713 unique ids). `https://www.submarinecablemap.com/api/v3/landing-point/landing-point-geo.json` 200, 361,388 B, 1,928 points. robots.txt is `Disallow:` (empty), so the spider is allowed. Being fetchable is not a licence.
- Licence read at source: the CC BY-SA 4.0 grant is for "maps, URL, screen capture", not the data. The data is sold.
- Redistribution of a derived file: **not permitted / not established.** Do not self-host.
- Accuracy (publisher): routes are stylised, not real paths.
- The old GitHub repo is gone: github.com 403 and raw.githubusercontent README/LICENSE 404 (master and main). TeleGeography states it no longer maintains one.

Q | https://www2.telegeography.com/license-telegeography-map | Any reference to a TeleGeography map, URL, or any related screen capture is made available under the Creative Commons License: Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
Q | https://www2.telegeography.com/license-telegeography-map | Access to the underlying databases remains restricted to paying subscribers.
Q | https://www2.telegeography.com/license-telegeography-map | TeleGeography’s interactive cable map is not an embeddable resource. If you’d like to access the underlying data for a project, you may license our map data.
Q | https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions | We no longer maintain or update a GitHub repository for our data or source code. The raw, geocoded data underlying TeleGeography's interactive maps is available via an annual license.
Q | https://www2.telegeography.com/submarine-cable-faqs-frequently-asked-questions | No. The cable routes on our map are stylized and do not reflect the precise geolocation of systems.
Q | https://www2.telegeography.com/hubfs/LP-Assets/Product-One-Pagers/geocoded-dataset-license.pdf | If you wish to license our data for commercial purposes, access is sold as an annual license.

Other candidates checked:
- SAERI (Falklands) data portal copy of the same data: "License Creative Commons Non-Commercial (Any)", "Use Constraints Not for commercial use", dated 2022. A third-party copy of TeleGeography data; do not use.
- World Bank Data Catalog 0037968 (WDR 2021 maps; cables, landing stations, IXPs): licence "Creative Commons Attribution 4.0", but `Downloads ( 0 )` and no data file; source is the WB infrastructure map. Not usable.
- EMODnet Human Activities (EU waters only; "Telecommunication Cables (schematic routes)", "(actual route locations)", "Landing Stations"): portal text "Data are free and free of any restrictions". EU seas only, so no Gulf or Red Sea. The d4science record page timed out, so licence per dataset and download URL are **not established**.
- Australia `data.gov.au` Maritime Cables: robots-disallowed (null).
- OSM: `man_made=submarine_cable` is deprecated; cables are mapped as `power=cable`/`communication=line` + `location=underwater`. Coverage **not established** (Overpass unreachable, see section 9).
- ITU broadband map (`bbmaps.itu.int`): JS shell, no licence text readable. Not established.

Option for the author: ask TeleGeography for written permission (sales@telegeography.com is its licensing contact in the PDF; cablemap@telegeography.com is its corrections address). Otherwise leave cables out, or draw them from the author's own cited evidence only.

---

## 2. Data centres

**Best open source found: Epoch AI "AI data centers" (CC BY), but it is only ~95 hyperscale AI sites. General data-centre coverage is not established.**

- Dataset: Epoch AI, "AI data centers" (formerly Frontier Data Centers). Updated 20 Oct 2026 (downloads page).
- Download: `https://epoch.ai/data/data_centers/data_centers.csv` 200, 71,165 B, **95 rows**. Columns include Name, Owner, Users, Current power (MW), Country, **Address** (street address, **no lat/lon**; would need geocoding). ZIP at `/data/data_centers/data_centers.zip` (listed in llms.txt, not fetched).
- Licence: "Creative Commons Attribution license" (version not stated on the page; the site's other text calls it CC BY).
- Derived file: allowed with credit, no Share-Alike, no NC.
- Attribution: "Epoch AI, 'AI data centers'. Published online at epoch.ai. Retrieved from 'https://epoch.ai/data/data-centers-documentation' [online resource]. Accessed 22 Oct 2026."
- Caveats: coverage is selected by compute, not complete. Rows name owners and users (e.g. SpaceXAI, Anthropic, Amazon, Microsoft). **Anthropic is named as a user of rows, so the Anthropic disclosure applies if those rows are drawn.** Ownership attribution is Epoch's own `#confident`/`#likely` tags. Addresses are corporate sites, but check against the streets-only rule before showing house numbers.

Q | https://www.epoch.ai/data/data-centers-documentation | Epoch’s data is free to use, distribute, and reproduce provided the source and authors are credited under the Creative Commons Attribution license.
Q | https://www.epoch.ai/data/data-centers-documentation | Epoch’s AI data centers hub is an independent database covering the construction timelines of major AI data centers through high-resolution satellite imagery, permits, and public documents.

Not usable:
- PeeringDB facilities (`/api/fac`, lat/lon present, 200 unauthenticated): barred by the AUP (section 3).
- TeleGeography Data Center Research Map: commercial licence only (PDF above).
- OSM `telecom=data_center` (wiki: "A building used to house computers and network equipment."; ODbL). Count and Gulf coverage **not established**: Overpass unreachable, taginfo API robots-disallowed.

---

## 3. Internet exchange points (IXPs)

**Best source: none usable. Every database that carries coordinates either bars bulk redistribution or is non-commercial.**

- PeeringDB (publisher: PeeringDB; software 2.84.0; live, "1330 Exchanges", "5886 Facilities" on the page). API `https://www.peeringdb.com/api/ix?depth=0&limit=2` and `/api/fac?...` both 200 without a key, so it is fetchable. **Redistribution of a derived file: not allowed.** The AUP says the data "may not be passed on in bulk" and bars storing or reproducing it except for approved "Internet operational purposes", defined to exclude "demographic mapping, or any other commercial application".
- IXPDB (Euro-IX / IX-F; `api.ixpdb.net`, 200): same AUP wording, applied to "IXPDB data".
- PCH IXP directory: Creative Commons BY-NC-SA 4.0. Non-commercial and share-alike. Download format and URL not established (JS directory).
- Wikidata (CC0) would be clean, but `query.wikidata.org` robots disallows `/sparql` and `wikidata.org` robots disallows `/w/`. Null.
- CAIDA IXP dataset: catalogue page is a JS shell, no licence readable. Not established.

Q | https://www.peeringdb.com/aup | The PeeringDB data may not be passed on in bulk to any other person or organization unless approved by PeeringDB.
Q | https://www.peeringdb.com/aup | Except for Internet operational purposes approved by PeeringDB, no part of the PeeringDB data may be reproduced, stored in a retrieval system, or transmitted, in any form or by any means, electronic, mechanical, recording, or otherwise, without prior permission of PeeringDB on behalf of the copyright holders.
Q | https://www.peeringdb.com/aup | It would not include compiling marketing lists, demographic mapping, or any other commercial application.
Q | https://ixpdb.euro-ix.net/en/ix-f/acceptable-use-policy/ | The IXPDB data may not be passed on in bulk to any other person or organization unless approved by IX-F.
Q | https://www.pch.net/ixp/dir | This work is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 License.

Option: ask PeeringDB (support@peeringdb.com) for approval. Not recommended as a dependency.

---

## 4. Power plants (point, fuel type)

**Best source: WRI Global Power Plant Database v1.3.0, CC BY 4.0. Clean licence, but frozen at 2021 and unmaintained.**

- Dataset: Global Power Plant Database, World Resources Institute and Google, **v1.3.0, released 2021-06-02**. Not maintained since early 2022.
- Download (no login): `https://wri-dataportal-prod.s3.amazonaws.com/manual/global_power_plant_database_v_1_3.zip` 200, 4,178,889 B. Also `https://raw.githubusercontent.com/wri/global-power-plant-database/master/output_database/global_power_plant_database.csv` 200, 11,973,385 B (same size as the zip's CSV). Format CSV (UTF-8), WGS84. CSV sha256 `4b1f93e0fd93664f18684d9b05d0a52ed9658c6a8cf0d21ff2520791379ba7fc`.
- Features: **34,936 plants, 167 countries**, all with lat/lon. Primary fuel: Solar 10,665; Hydro 7,156; Wind 5,344; Gas 3,998; Coal 2,330; Oil 2,320; Biomass 1,430; Waste 1,068; Nuclear 195; Geothermal 189; Storage 135; other 106. Gulf/Levant counts: Iran 107, Saudi Arabia 90, Israel 59, UAE 30, Iraq 28, Oman 12, Qatar 12, Kuwait 9, Bahrain 8, Yemen 7.
- Licence: CC BY 4.0. Derived GeoJSON allowed, no Share-Alike, no NC. Per-row `source` and `geolocation_source` fields name the upstream (EIA 9,789 rows, Wiki-Solar 3,690, etc.); the copyright line reads "WRI and Data Contributors".
- Attribution text (portal): "Global Energy Observatory, Google, KTH Royal Institute of Technology in Stockholm, Enipedia, World Resources Institute. 2021. Global Power Plant Database version 1.3.0. Accessed through https://datasets.wri.org/datasets/global-power-plant-database on <date>"
- Publisher caveats: facility-level (one grid connection point), >= 1 MW, "about 72% of the world's capacity"; matching "can sometimes wrongly match two power plants or fail to match two entries for the same power plant"; 17,489 rows have no commissioning year; `primary_fuel` is the largest share or the source's label.
- More current alternative: GEM Global Integrated Power Tracker (Sept 2026 release, "180,000+ power facilities tracked"), CC BY 4.0 via form (see section 5). Not fetched.

Q | https://raw.githubusercontent.com/wri/global-power-plant-database/master/README.md | The latest database release (v1.3.0) is available in CSV format [here](http://datasets.wri.org/dataset/globalpowerplantdatabase) under a [Creative Commons-Attribution 4.0 (CC BY 4.0) license](https://creativecommons.org/licenses/by/4.0/).
Q | https://raw.githubusercontent.com/wri/global-power-plant-database/master/README.md | This project is not currently maintained by WRI. There are no planned updates as of this time (early 2022). The last version of this database is version 1.3.0.
Q | https://wri-dataportal-prod.s3.amazonaws.com/manual/global_power_plant_database_v_1_3.zip (README.txt inside) | License: Creative Commons Attribution 4.0 International -- CC BY 4.0
Q | https://wri-dataportal-prod.s3.amazonaws.com/manual/global_power_plant_database_v_1_3.zip (README.txt inside) | Copyright: Copyright 2018-2021 World Resources Institute and Data Contributors
Q | https://datasets.wri.org/datasets/global-power-plant-database | "license_id":"cc-by","license_title":"Creative Commons Attribution","license_url":"http://www.opendefinition.org/licenses/cc-by"
Q | https://creativecommons.org/licenses/by/4.0/ | Share — copy and redistribute the material in any medium or format for any purpose, even commercially.
Q | https://creativecommons.org/licenses/by/4.0/ | Adapt — remix, transform, and build upon the material for any purpose, even commercially.

---

## 5. Oil and gas infrastructure (pipelines, refineries, LNG, offshore platforms)

Two CC BY 4.0 sources. Neither could be downloaded here: one is behind a form, the other is 3.4 GB.

### 5a. Global Energy Monitor trackers (pipelines, LNG terminals)
- Datasets: Global Oil Infrastructure Tracker (GOIT), Global Gas Infrastructure Tracker (GGIT), Global Oil & Gas Extraction Tracker (GOGET), Global Oil & Gas Plant Tracker (GOGPT).
- Versions on the pages: GOIT cites "June 2026 release" but also says "The most recent release of this data was in March 2025" (the page contradicts itself; **not established which is current**). GGIT: pipelines Nov 2025, LNG terminals Sept 2025, LNG carriers June 2026. GOGET: March 2026. GOGPT: Aug 2026.
- Counts (GGIT page): 4,158 gas pipelines, 1.5 million km combined; 1,207 LNG terminal projects. GOIT count not stated.
- Licence: CC BY 4.0, full text on GEM's "Creative Commons License" page, which is the default `license-url` of the download form's licence checkbox. The tracker pages themselves carry no licence line, so the link between the two is by the form's code, not by a sentence.
- Download: **form-gated, not fetchable from here.** The form (`gem-download-form.bundle.js`) asks for an email address, a free-text "use" statement (`USE_CASE_MIN_CHARS=100`) and a ticked "Creative Commons Public License" box, then delivers a ZIP. Formats: GeoJSON, GeoPackage, shapefile, Excel. I did not submit it.
- Derived file: allowed with credit (CC BY). Attribution: the tracker's citation, e.g. "Global Gas Infrastructure Tracker, Global Energy Monitor, [release date]."
- Caveat: **GEM.wiki text is CC BY-NC-SA** ("Creative Commons Attribution-NonCommercial-ShareAlike"). That covers the wiki prose, not the tracker data, but do not copy wiki text into the map.
- Accuracy (publisher): routes "approximated from start and end points (and sometimes midpoints)" when no map exists; pipelines >= 100 km prioritised.

Q | https://globalenergymonitor.org/creative-commons-license | Creative Commons Attribution 4.0 International Public License
Q | https://globalenergymonitor.org/creative-commons-license | Subject to the terms and conditions of this Public License, the Licensor hereby grants You a worldwide, royalty-free, non-sublicensable, non-exclusive, irrevocable license to exercise the Licensed Rights in the Licensed Material to: reproduce and Share the Licensed Material, in whole or in part; and produce, reproduce, and Share Adapted Material.
Q | https://globalenergymonitor.org/projects/global-gas-infrastructure-tracker/ | Gas pipeline and LNG terminal data are now provided as Excel files and in GeoJSON, GeoPackage, and shapefile formats via the download form
Q | https://globalenergymonitor.org/projects/global-oil-infrastructure-tracker/ | Pipeline routes are provided in GeoJSON and GeoPackage formats via the download form.
Q | https://globalenergymonitor.org/projects/global-oil-infrastructure-tracker/ | The most recent release of this data was in March 2025.
Q | https://globalenergymonitor.org/projects/global-oil-infrastructure-tracker/ | The recommended citation is "Global Oil Infrastructure Tracker, Global Energy Monitor, June 2026 release."
Q | https://api.globalenergymonitor.org/static/gem-download-form.bundle.js | Fill out the form to receive your selected datasets in a ZIP file.
Q | https://www.gem.wiki/Global_Energy_Monitor:Copyrights | Original text of GEM Wiki entries is licensed to the public under the GNU Free Documentation License (GFDL) and Creative Commons Attribution-NonCommercial-ShareAlike.

### 5b. EDF / MethaneSAT OGIM (refineries, LNG, offshore platforms, pipelines, terminals, wells)
- Dataset: Oil and Gas Infrastructure Mapping (OGIM) database, **v3.0, published 2026-09-18**, Zenodo `https://zenodo.org/records/22835235` (reached via `/records/15103476/latest`). Concept DOI 10.5281/zenodo.7466757 (from the v2.7 source PDF).
- Download: `https://zenodo.org/records/22835235/files/OGIM_v3.0.gpkg?download=1`, no login. HEAD (curl, spider UA) 200, `content-length: 3422806016` (**3.4 GB GeoPackage**). **Not downloaded.** Zenodo's `/api` is robots-disallowed (null), so metadata came from the record page. Formats: GeoPackage only.
- Features: v3.0 "7.6 million geospatial records", 193 countries. Per-layer counts for v3.0 **not established**. v2.7 (Mar 2025) layer counts from its README: Crude_Oil_Refineries 692; LNG_Facilities 547; Offshore_Platforms 3,903; Petroleum_Terminals 3,661; Natural_Gas_Compressor_Stations 12,156; Gathering_and_Processing 10,396; Oil_Natural_Gas_Pipelines 1,858,109 (LineString segments, too many to ship raw); Oil_and_Natural_Gas_Wells 4,537,369; Natural_Gas_Flaring_Detections 10,233.
- Licence: CC BY 4.0, read from the Zenodo record's rights field.
- Derived file: allowed with credit. Attribution: cite Omara et al. 2023, ESSD 15, 3761, https://doi.org/10.5194/essd-15-3761-2023, and (for v3.0) O’Brien et al., OGIM v3.0 (in review).
- **Caveats:**
  - The CC BY is EDF's. The data is compiled from 188 (v2.7) source datasets that EDF calls "public-domain"; the source PDF lists URLs, not licences. Per-source terms are not established.
  - The open version omits about 300 Russian compressor stations.
  - **The flaring layer is included only by permission of the Earth Observation Group to EDF.** Do not redistribute that layer (see section 6).
  - Publisher: "The database is based on public information which can be of variable spatial quality, update frequency, and richness of feature attributes depending on the data source." Records carry `SRC_DATE`; some are out of date.
  - Iran refineries (v2.7) are sourced from the refining companies' own websites (2022 visit).

Q | https://zenodo.org/records/15103476/latest | "The Creative Commons Attribution license allows re-distribution and re-use of a licensed work on the condition that the creator is appropriately credited."
Q | https://zenodo.org/records/15103476/latest | "id": "cc-by-4.0"
Q | https://zenodo.org/records/15103476/latest | OGIM v3.0 is based on public-domain datasets reported in 2025 or prior.
Q | https://zenodo.org/records/15103476/latest | increases the database to 7.6 million geospatial records spanning the upstream, midstream, and downstream oil and gas supply chain
Q | https://zenodo.org/records/15103476 | this open-access version of the OGIM database does not include the locations of about 300 natural gas compressor stations in Russia.
Q | https://zenodo.org/records/15103476/files/README_OGIM_v2.7_20250328.pdf?download=1 | The database is based on public information which can be of variable spatial quality, update frequency, and richness of feature attributes depending on the data source.
Q | https://zenodo.org/records/15103476/files/README_OGIM_v2.7_20250328.pdf?download=1 | The Earth Observation Group at the Colorado School of Mines has granted EDF permission to include these 2023 data in OGIM.

Not usable / not established:
- OSM `man_made=pipeline`, `industrial=oil`, `man_made=offshore_platform`, `power=plant` (ODbL): counts and extracts not established; Overpass unreachable (section 9).
- US-only HIFLD and EIA layers appear as OGIM inputs; not checked separately.

---

## 6. Gas flaring sites

**Best source: World Bank GFMR per-location flare volumes, 2012-2025. Licence rests on the World Bank dataset terms (CC BY 4.0 + extra terms); the upstream satellite product is itself now licence-restricted.**

- Dataset: "Dataset: 2012 - 2025 Flare Volume Estimates by Individual Flare Location", World Bank Global Flaring and Methane Reduction partnership (GFMR), with NOAA and the Payne Institute (Colorado School of Mines). Published with the Global Gas Flaring Tracker, June 2026 (data year 2025).
- Download (no login): `https://thedocs.worldbank.org/en/doc/b34e0c054bb3fe3695e70154c28eef3f-0400072026/related/Flare-Volume-Estimates-by-individual-Flare-Location-2012-2025.xlsx` 200, 47,115,914 B, Excel. Fetched.
- Features (counted from the file): **27,365 unique flare ids** (27,396 rows per year x 14 years, 2012-2025), 102 countries. Columns: id, lat, lon, Country, BCM, MMSCFD, Year, Field type, Operator, Field name, Location (ONSHORE/OFFSHORE), Flare Level, Flaring Vol (million m3). Flare sites per country: Iran 545, Saudi Arabia 537, Iraq 300, Oman 256, UAE 167, Kuwait 126, Qatar 122, Yemen 52, Bahrain 16, Israel 5.
- Licence: the programme page for the file carries no licence line. The World Bank's dataset terms apply "Unless specifically labeled otherwise": CC BY 4.0 with a mandatory dispute-resolution addition (mediation, then arbitration) and a **no-endorsement** clause. The older catalogue entry 0037743 (country volumes, v5, to 2021) is labelled "Creative Commons Attribution 4.0".
- Derived file: allowed with credit; no Share-Alike; no NC. **Per-file licence not stated; confirm with data@worldbank.org before publishing.**
- Attribution: "The World Bank: Dataset name: Data source (if known)." Sources line on the page: "NOAA, the Payne Institute at the Colorado School of Mines, World Bank/GFMR".
- Publisher caveat: locations are matched to field metadata from several sources and may be out of date. This is annual volume per flare, not a live detection. A flare is a satellite-detected heat source, which is the labelling the map plan needs.
- Upstream: the volumes come from VIIRS Nightfire (EOG). EOG changed to licensed access on 10 Jan 2025. Whether that reaches the World Bank's CC BY redistribution is **not established**.

Q | https://www.worldbank.org/ext/en/legal/terms-conditions/datasets | Unless specifically labeled otherwise, these Datasets are provided to you under a Creative Commons Attribution 4.0 International License (CC BY 4.0), with the additional terms below.
Q | https://www.worldbank.org/ext/en/legal/terms-conditions/datasets | You agree to provide attribution to The World Bank and its data providers in the following format: The World Bank: Dataset name: Data source (if known).
Q | https://www.worldbank.org/ext/en/legal/terms-conditions/datasets | You may not publicly represent or imply that The World Bank is participating in, or has sponsored, approved or endorsed the manner or purpose of your use or reproduction of the Datasets.
Q | https://datacatalog.worldbank.org/search/dataset/0037743 | License : Creative Commons Attribution 4.0
Q | https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data | To identify the location of the flaring, the flare data has been combined with metadata, obtained from several sources. Although the metadata is updated on a regular basis, changes may have taken place since the last update.
Q | https://www.worldbank.org/en/programs/gasflaringreduction/global-flaring-data | Attribution and data sources: Flare gas volumes - NOAA, the Payne Institute at the Colorado School of Mines, World Bank/GFMR

**Earth Observation Group VIIRS Nightfire (VNF): do not use.**
- Data is behind a signed licence since 10 Jan 2025: no-cost one-year licence for academics, paid subscription for commercial users, annual subscription for non-profits. Nightly CSV/KMZ products, v4.0 current. `eogdata.mines.edu/robots.txt` disallows `/wwwdata`.
- **My slip, disclosed:** I put `https://eogdata.mines.edu/wwwdata/hidden/` in a fetch list as a guess. The spider sent it (its robots parser reads `Allow: /` before `Disallow: /wwwdata` and so let it through). The host answered with a redirect to its OAuth login (`eogauth.mines.edu`), which failed as a transport error. One request, nothing retrieved, no login attempted, and no further `/wwwdata` URL was tried. The ledger row is there. The spider's robots handling of "Allow: /" followed by "Disallow" is a bug worth fixing separately.

Q | https://eogdata.mines.edu/products/vnf/ | Effective January 10, 2025, all VIIRS Nightfire data is available through a VIIRS Nightfire Data Use License. By accessing the data, you agree to comply with the terms of the license.
Q | https://payneinstitute.mines.edu/viirs-nightfire-licensing/ | VIIRS Nightfire data is available to academic researchers through a no-cost one-year license to be signed and returned by the licensee.
Q | https://payneinstitute.mines.edu/viirs-nightfire-licensing/ | The VIIRS Nightfire Commercial Data Use License Agreement governs the use of VIIRS Nightfire data by commercial entities and is available through a paid one-year subscription.
Q | https://eogdata.mines.edu/robots.txt | Disallow: /wwwdata

**OGIM `Natural_Gas_Flaring_Detections` (10,233 records, 2023): do not redistribute** (EOG permission was granted to EDF only; quote in section 5b).

---

## 7. GNSS / GPS interference

**No openly licensed, redistributable feed exists. Best route: compute our own daily hex layer from adsb.lol (ODbL), the feed the map already uses.**

### 7a. Build from adsb.lol (recommended path, needs a scheduled job)
- Source: adsb.lol open API `https://api.adsb.lol/v2/...`, licence ODbL 1.0, "available to everyone", no key. The map already reads `api.adsb.lol/v2` (site/map.html line 3994).
- Verified here: one sample (`/v2/point/26/52/250`, Gulf, 200, 27,353 B) returned 49 aircraft, all with `nac_p`, `nic` and `lat`; `nac_p` values 11 x8, 10 x6, 9 x31, 8 x1, **0 x3** (0 = accuracy unknown/worse than 10 NM). A single snapshot is not a measurement.
- Terms: ODbL. Attribution required; Share-Alike applies to a publicly used adapted database (summary quote below). A daily hex file derived from adsb.lol is such a database; the rendered map is a produced work. `www.adsb.lol/docs/privacy-license` is fetchable; `adsb.lol` apex returns 403 to the spider (null).
- Caveats (gpsjam FAQ, same method): low accuracy is not necessarily jamming; coverage is zero where no aircraft fly or no receiver feeds ("an active war zone"); aggregation is 24 h; one bad aircraft is subtracted per hex to cut false positives. Label as "reported low navigation accuracy", never as "jamming" or "who".

Q | https://www.adsb.lol/docs/open-data/api/ | license: ODbL 1.0
Q | https://opendatacommons.org/licenses/odbl/summary/ | Attribute : You must attribute any public use of the database, or works produced from the database, in the manner specified in the ODbL.
Q | https://opendatacommons.org/licenses/odbl/summary/ | Share-Alike : If you publicly use any adapted version of this database, or works produced from an adapted database, you must also offer that adapted database under the ODbL.
Q | https://raw.githubusercontent.com/wiedehopf/readsb/dev/README-json.md | nac_p: Navigation Accuracy for Position (2.2.5.1.35)

### 7b. Stanford GPS Lab RFI portal (documented, but non-commercial)
- Dataset: rfi.stanford.edu, daily ADS-B-based GNSS interference ("jamming", "spoofing", "dashboard" JSON), GitHub downloader. Page "Last updated: August 2026". The page links airplanes.live, OpenSky, ADS-B Exchange and AirNav under its provider/connection headings; which one is the current feed is **not established**. airplanes.live returns 403 to the spider (null).
- Licence: **CC BY-NC 4.0**; "Commercial use ... get in touch" (Stanford OTL). Derived self-hosted file: allowed only for non-commercial use, with credit. Whether b0b.dev counts as non-commercial is the author's call.
- Not fetched: the JSON URL pattern is inside the GitHub repo (github.com HTML is refused to the spider); no undocumented endpoint was probed.
- Attribution: "Source: Stanford GPS Lab, rfi.stanford.edu."

Q | https://rfi.stanford.edu/resources | Data provided through rfi.stanford.edu are available under the Creative Commons Attribution–NonCommercial 4.0 International License (CC BY-NC 4.0). You may share and adapt the data for non-commercial purposes with appropriate credit.
Q | https://rfi.stanford.edu/resources | For a map, screenshot, figure, or visualization, this short attribution is enough: Source: Stanford GPS Lab, rfi.stanford.edu.

### 7c. gpsjam.org (do not use)
- Pages 200 (`/`, `/about`, `/faq`); `robots.txt` 404. **No licence, no terms and no download link** on any of them. Data comes from airplanes.live and ADS-B Exchange. No data before 2022-02-14. Redistribution is not established; treat as all rights reserved. Linking out to the site is a separate matter.

Q | https://gpsjam.org/about | The map uses data provided by airplanes.live and ADS-B Exchange to generate maps of likely GPS interference, based on aircraft reports of their navigation system accuracy.
Q | https://gpsjam.org/faq | No. Red and yellow hexes show where a significant number of aircraft reported low navigation accuracy.
Q | https://gpsjam.org/faq | but the data doesn't tell me what's causing the low accuracy

---

## 8. Attribution and licence notes that apply across layers

- **ODbL (OSM, adsb.lol):** credit plus a link to the licence kept with the file; adapted databases offered under ODbL. OSM wording: "Map data from OpenStreetMap." or "© OpenStreetMap contributors"; for a database, "attribution to OpenStreetMap and either the text of the ODbL or a link to it".
- **CC BY 4.0 (WRI, OGIM, GEM, Epoch, World Bank):** credit, link to licence, say if changed ("simplified"). A simplified GeoJSON is an adaptation; say so.
- **Keep context files separate** from the site's own evidence data, so any ODbL Share-Alike stays on the context files only.

Q | https://www.openstreetmap.org/copyright | OpenStreetMap is open data, licensed under the Open Data Commons Open Database License (ODbL) by the OpenStreetMap Foundation (OSMF).
Q | https://www.openstreetmap.org/copyright | If you alter or build upon our data, you may distribute the result only under the same license.
Q | https://osmfoundation.org/wiki/Licence/Attribution_Guidelines | The historical forms of attribution “© OpenStreetMap contributors” or “© OpenStreetMap” are acceptable.
Q | https://osmfoundation.org/wiki/Licence/Attribution_Guidelines | You must include attribution to OpenStreetMap and either the text of the ODbL or a link to it as part of the database, derivative database, or database as part of a collective database.

---

## 9. Nulls and unreachable (not established)

- `overpass-api.de`: proxy tunnel closed x5 on the robots fetch, then a single `/api/status` call timed out. **No OSM feature counts or extracts for data centres, pipelines, platforms, power plants or cables.** Overpass fair-use text (wiki): "less than 10,000 queries per day and download less than 1 GB data per day".
- `taginfo.openstreetmap.org/api/...`: robots-disallow (10 URLs). `zenodo.org/api/...`: robots-disallow. `query.wikidata.org/sparql` and `wikidata.org/w/`: robots-disallow. `data.gov.au` Maritime Cables: robots-disallow.
- 403: `github.com` HTML (TeleGeography, WRI), `api.github.com`, `adsb.lol` apex, `airplanes.live` (3 URLs).
- 404: TeleGeography `/main` and `/master` README and LICENSE; `globalenergymonitor.org/about/permissions`, `/terms-of-use`, `/about/faq`; `thedocs.worldbank.org/robots.txt` (no robots file).
- Timed out: EMODnet d4science record, `flaring.worldbank.org` (502 via proxy).
- Not fetched by design: OGIM v3.0 (3.4 GB), GEM trackers (form), Stanford RFI JSON (URL pattern in GitHub), Epoch ZIP.

---

## Recommendation

| Layer | Verdict | Source | One-line reason |
|---|---|---|---|
| Submarine cables, landing points | **DO NOT USE** | TeleGeography API | Fetchable but the data is sold ("annual license"); CC BY-SA covers maps/screenshots only; routes are stylised. No open global alternative found. Ask sales@telegeography.com for permission or omit. |
| Data centres | **USE WITH CONDITIONS** | Epoch AI (CC BY) | Only ~95 AI sites, address-only (needs geocoding), names Anthropic among users (disclosure). PeeringDB facilities barred. OSM coverage not established. |
| IXPs | **DO NOT USE** | PeeringDB / IXPDB / PCH | PeeringDB and IXPDB AUPs bar bulk redistribution; PCH is CC BY-NC-SA. No open source established. |
| Power plants | **USE WITH CONDITIONS** | WRI GPPD v1.3.0 (CC BY 4.0) | Clean licence, 34,936 plants, fetched. Frozen June 2021 and unmaintained: label the vintage. GEM GIPT is newer but form-gated. |
| Oil and gas (pipelines, LNG, refineries, platforms) | **USE WITH CONDITIONS** | GEM trackers (CC BY 4.0) for pipelines and LNG; OGIM v3.0 (CC BY 4.0) for refineries and platforms | Both openly licensed but neither fetched here (form; 3.4 GB). OGIM's upstream licences are not listed. GOIT currency unclear. Author must download once. |
| Gas flaring sites | **USE WITH CONDITIONS** | World Bank GFMR per-flare xlsx | 27,365 sites fetched; CC BY by World Bank dataset terms but the file page states no licence and the upstream VNF is now licensed: confirm with data@worldbank.org. Do not use EOG VNF or OGIM's flare layer. |
| GNSS interference | **USE WITH CONDITIONS** | Own hex layer from adsb.lol (ODbL) | `nac_p` present in the feed the map already uses; ODbL attribution and share-alike on the derived file; coverage gaps. Stanford RFI is CC BY-NC; gpsjam has no licence (do not use). |

---

## Decisions, 22 Oct 2026 (the author: "All except carto key")

- **Built:** power plants (WRI GPPD), oil and gas facilities (OGIM v3.0, four point layers; not its flaring layer, not its pipelines), gas flares (World Bank GFMR, under the World Bank dataset terms, with the no-endorsement line on the card and in the credits; the licence question was not put to data@worldbank.org), AI data centres (Epoch AI, placed by `scripts/geocode-context.py`; 8 rows naming Anthropic carry the disclosure).
- **Not built:** cables, landing points, IXPs (no open source); GEM pipelines and LNG (form requires the author's email); a daily GNSS hex layer (storage and a scheduled job).
- **Geocoding:** Nominatim (`/search`, `/reverse`) and Photon are disallowed by robots.txt and were not used. US street addresses: US Census Bureau geocoder. Elsewhere: the coordinates of the Wikipedia article for the place the record names.
