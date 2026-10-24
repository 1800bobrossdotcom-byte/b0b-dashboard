# foi-fiveeyes — FOI source registry candidates: US, UK, AU, CA, NZ

Probed 2026-10-24 with `scripts/spider/spider.py` (b0bSourceBot, robots obeyed, no retries under another identity). Every URL below is in `research/sources/ledger.jsonl`. WebSearch was used only to find URLs. "Q" lines are copied from spider text (JSON/HTML/PDF text), at most 40 words.

Legend for `probe.result`: ok / refused (403, 401, 404-from-host, 202 challenge) / robots / decoy (200 or 202 that is a challenge, JS shell or wrong page) / egress (container proxy answered 502 or dropped the CONNECT, so we do not know what the site would say) / not_found.

Spider behaviour noted: every refusal and transport error walks the 5/15/35/60/90 s ladder, so a refused or egress-denied host costs 3-8 minutes per URL. Run one URL per process in parallel when probing many hosts.

---

# UNITED STATES

### FOIA statute (foia.gov)
```json
{"id": "us-foia-statute", "cc": "US", "kind": "law", "name": "5 U.S.C. 552 as posted on FOIA.gov", "url": "https://www.foia.gov/foia-statute.html", "search": null, "api": null, "format": "html",
 "terms": "US government work; not stated on page", "key_required": false, "programs": ["Glomar / (b)(1) national defense exemption"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.foia.gov/foia-statute.html"},
 "use": "Official statute text incl. exemption (b)(1) and the (c)(3) FBI exclusion; 88 KB.",
 "limits": "Statute only; says nothing about what agencies actually released."}
```
Q | https://www.foia.gov/foia-statute.html | (1)(A) specifically authorized under criteria established by an Executive order to be kept secret in the interest of national defense or foreign policy and (B) are in fact properly classified pursuant to such Executive order;
Q | https://www.foia.gov/robots.txt | User-agent: * Allow: /

### FOIA.gov request-portal API
```json
{"id": "us-foia-gov-api", "cc": "US", "kind": "portal", "name": "FOIA.gov API (agency components, annual-report XML)", "url": "https://www.foia.gov/developer/", "search": null, "api": "https://api.foia.gov/api/agency_components", "format": "json",
 "terms": "api.data.gov key", "key_required": true, "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://api.foia.gov/api/agency_components?api_key=DEMO"},
 "use": "Documentation page is readable (33 KB). Agency list and annual-report XML (/api/annual-report-xml/DOJ/2021) are reachable only with a key.",
 "limits": "Key required (we do not register). api.foia.gov root is 404; the probe with a placeholder key was 403. The foia.gov/search.html page is a JS shell (see decoys)."}
```
Q | https://www.foia.gov/developer/ | The FOIA request Portal is powered by a public API. In order to use the API, you must signup for an API key here . Visit the Swagger page to
Q | https://www.foia.gov/developer/ | Annual Report XML API Individual annual reports, in XML format, are available via an API endpoint: /api/annual-report-xml/[agency abbreviation]/[year]

### FOIA.gov dataset download
```json
{"id": "us-foia-gov-dataset", "cc": "US", "kind": "disclosure-log", "name": "FOIA.gov annual-report data downloads", "url": "https://www.foia.gov/foia-dataset-download.html", "search": null, "api": null, "format": "html",
 "terms": "not stated", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.foia.gov/foia-dataset-download.html"},
 "use": "Page loads; heading 'Annual data'. It is where agency FOIA annual-report data is offered.",
 "limits": "Download links are not in the static HTML (only the Agency API Spec link is), so the files themselves were not reached; stats, not released records."}
```

### NARA FOIA electronic reading room
```json
{"id": "us-nara-foia-reading-room", "cc": "US", "kind": "disclosure-log", "name": "NARA Electronic Reading Room / FOIA Library", "url": "https://www.archives.gov/foia/electronic-reading-room", "search": null, "api": null, "format": "html",
 "terms": "US government work", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.archives.gov/foia/electronic-reading-room"},
 "use": "NARA's own FOIA releases index (50 KB).",
 "limits": "archives.gov robots asks Crawl-delay 10 (spider obeys); index of NARA's own FOIA, not the other agencies'."}
```
Q | https://www.archives.gov/robots.txt | Crawl-delay: 10 # CSS,

### NARA JFK Assassination Records Collection (program)
```json
{"id": "us-nara-jfk", "cc": "US", "kind": "program", "name": "President John F. Kennedy Assassination Records Collection, release pages 2017-2025", "url": "https://www.archives.gov/research/jfk", "search": null, "api": null, "format": "html+pdf",
 "terms": "US government work", "key_required": false, "programs": ["JFK records / EO 14176"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.archives.gov/files/research/jfk/releases/2025/0318/104-10130-10026.PDF (75,725 B PDF, 200)"},
 "use": "The 2025 release page (500 KB) lists 2,709 links, direct PDFs under /files/research/jfk/releases/2025/0318/; earlier releases at /research/jfk/release2023, release2022, release2021, release (2017-2018). PDFs fetch; extract text locally.",
 "limits": "Release pages only; the catalog.archives.gov API and search are robots-disallowed. Stop rules apply to any PDF that is imagery or a protected interview."}
```
Q | https://www.archives.gov/research/jfk | The President John F. Kennedy Assassination Records Collection consists of over six million pages of records, photographs, motion pictures, sound recordings, and artifacts. This webpage will host already-released documents and

### NARA Catalog (catalog.archives.gov) and its API
```json
{"id": "us-nara-catalog-api", "cc": "US", "kind": "archive-api", "name": "NARA Catalog API v2", "url": "https://catalog.archives.gov/", "search": null, "api": "https://catalog.archives.gov/api/v2/records/search?q={q}", "format": "json",
 "terms": "NARA states bulk files can be republished with attribution (see CLAUDE.md UAP entry)", "key_required": "unknown (not reached)", "programs": ["JFK", "RG 615 UAP", "all NARA holdings"],
 "probe": {"date": "2026-10-24", "status": null, "result": "robots", "sample": "https://catalog.archives.gov/api/v2/records/search?q=mkultra"},
 "use": "Nothing, as the crawler: the spider refuses both /robots.txt-governed URLs.",
 "limits": "robots Disallow / on the host. A one-off identified curl at the author's instruction is the recorded exception (CLAUDE.md section 7, UAP). Do not route around."}
```

### ODNI FOIA reading room (dni.gov)
```json
{"id": "us-odni-foia-reading-room", "cc": "US", "kind": "disclosure-log", "name": "ODNI FOIA Reading Room", "url": "https://www.dni.gov/index.php/foia/foia-reading-room", "search": null, "api": null, "format": "html+pdf",
 "terms": "US government work", "key_required": false, "programs": ["IC declassifications (e.g. DF- numbered releases)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.dni.gov/index.php/foia/foia-reading-room (317 KB)"},
 "use": "Lists ODNI declassification releases by year ('FOIA Reading Room 2025 (04-24-26)') with PDF links; robots allows all but /wp-admin/ and /dlm_uploads/; crawl-delay 10 for non-SearchGov agents.",
 "limits": "ODNI only; /dlm_uploads/ is disallowed so some release PDFs may be unreachable."}
```
Q | https://www.dni.gov/index.php/foia/foia-reading-room | FOIA Reading Room 2025 (04-24-26) Best
Q | https://www.dni.gov/robots.txt | Disallow: /dlm_uploads/

### DHS FOIA library, DOJ OIP FOIA library
```json
{"id": "us-dhs-foia-library", "cc": "US", "kind": "disclosure-log", "name": "DHS FOIA Library", "url": "https://www.dhs.gov/foia-library", "search": null, "api": null, "format": "html",
 "terms": "US government work", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.dhs.gov/foia-library (140 KB)"},
 "use": "DHS proactive releases index.", "limits": "Index page only was read."}
```
```json
{"id": "us-doj-oip-foia-library", "cc": "US", "kind": "disclosure-log", "name": "DOJ Office of Information Policy: FOIA Library and OIP home", "url": "https://www.justice.gov/oip/foia-library", "search": null, "api": null, "format": "html",
 "terms": "US government work", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.justice.gov/oip (110 KB) and /oip/foia-library (94 KB)"},
 "use": "DOJ FOIA guidance, annual reports, library index; the age-gate cookie is already in hosts.json.",
 "limits": "usao press pages still serve the bm-verify interstitial (registered)."}
```
Q | https://www.justice.gov/oip/foia-library | FOIA Library Skip to main content

### Agencies that refused or gave nulls (record, do not work around)
```json
{"id": "us-agency-nulls", "cc": "US", "kind": "disclosure-log", "name": "NSA, State, DoD/OSD, DIA, FBI Vault, CIA reading room, MuckRock, DocumentCloud, Mary Ferrell", "url": "(see list)", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": ["NSA FOIA", "State virtual reading room", "OSD/JS FOIA", "FBI Vault", "CREST", "MuckRock"],
 "probe": {"date": "2026-10-24", "status": "403/robots", "result": "refused", "sample": "see Nulls"},
 "use": "Nothing from these hosts; their documents arrive via mirrors (NSArchive, GovernmentAttic, Black Vault, archive.org, govinfo, NARA).",
 "limits": "All listed in Nulls with exact statuses."}
```

### National Security Archive
```json
{"id": "us-nsarchive", "cc": "US", "kind": "civil-log", "name": "National Security Archive (GWU): postings, briefing books, projects", "url": "https://nsarchive.gwu.edu/", "search": null, "api": null, "format": "html",
 "terms": "not stated in the pages read", "key_required": false, "programs": ["JFK / CIA Mexico City station (briefing book 2026-10-01)", "Chile, China, Genocide documentation projects"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://nsarchive.gwu.edu/postings/all (57 KB, 20 briefing-book links); https://nsarchive.gwu.edu/briefing-book/intelligence-mexico/2026-10-01/cia-station-mexico-last-jfk-assassination-records (97 KB)"},
 "use": "Posting lists and briefing books with document links; crawl by /postings/all and /project/*. nsarchive2.gwu.edu/NSAEBB/ (older electronic briefing books, 248 KB) also answers 200.",
 "limits": "/search/ is disallowed by robots; the /search?search_api_fulltext= form is not caught by that rule but returned '0 results(s) found' for 'mkultra', so it is not a working data path. /documents answered 403."}
```
Q | https://nsarchive.gwu.edu/robots.txt | Disallow: /search/ Disallow: /user/register
Q | https://nsarchive.gwu.edu/search?search_api_fulltext=mkultra | 0 results(s) found

### The Black Vault
```json
{"id": "us-blackvault", "cc": "US", "kind": "civil-log", "name": "The Black Vault document archive", "url": "https://www.theblackvault.com/documentarchive/", "search": null, "api": null, "format": "html+pdf",
 "terms": "not stated", "key_required": false, "programs": ["FBI files", "UAP / government releases"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.theblackvault.com/documentarchive/category/government/ (127 KB; 368 category links); .../government-accountability-i-g-reports/ (130 KB)"},
 "use": "Browse by category pages; the site's own FOIA-release index.",
 "limits": "robots Disallow /*? kills every query-string search (spider reported 'robots disallow' for /?s=); crawl categories only. Site is an aggregator, so each document needs its agency source."}
```
Q | https://www.theblackvault.com/robots.txt | Disallow: /*? Disallow: /xmlrpc.php

### GovernmentAttic
```json
{"id": "us-governmentattic", "cc": "US", "kind": "civil-log", "name": "GovernmentAttic.org", "url": "https://www.governmentattic.org/Frame-2.html", "search": null, "api": null, "format": "html+pdf",
 "terms": "not stated", "key_required": false, "programs": ["IG reports", "ODNI/State/USCIS FOIA releases"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.governmentattic.org/62docs/ODNIbicSOCM2016-035C2016.pdf (505 KB PDF, 200)"},
 "use": "The home page is a frameset; the content is Frame-2.html (30 KB, 76 links, newest documents as /62docs/*.pdf).",
 "limits": "documents.html and DocumentsIndex.html are 404. robots: Crawl-delay 5. The older document pages are not indexed on the frame (not found)."}
```
Q | https://www.governmentattic.org/robots.txt | Crawl-delay: 5 Disallow: /images/
Q | https://www.governmentattic.org/ | governmentattic.org is here to make available released government (and other) material you won't find elsewhere. Keywords: FOIA, Freedom of Information Act, documents, government documents, declassified,

### MuckRock
```json
{"id": "us-muckrock", "cc": "US", "kind": "civil-log", "name": "MuckRock", "url": "https://www.muckrock.com/foi/", "search": null, "api": "https://www.muckrock.com/api_v2/", "format": "json",
 "terms": "-", "key_required": "unknown", "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://muckrock.com/robots.txt (403, the robots file itself)"},
 "use": "None.", "limits": "403 on robots.txt, /foi/ and /api_v2/. Recorded null."}
```

### DOE OpenNet
```json
{"id": "us-doe-opennet", "cc": "US", "kind": "archive", "name": "DOE OpenNet (declassified nuclear documents)", "url": "https://www.osti.gov/opennet/", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": ["nuclear testing documents"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "decoy", "sample": "https://www.osti.gov/opennet/ (21 KB JS shell)"},
 "use": "None by plain GET.", "limits": "Page says it needs JavaScript; robots disallows /opennet/document and /opennet/search-results (for the groups listed, incl. Googlebot); /opennet/search.jsp 404."}
```
Q | https://www.osti.gov/opennet/ | You must have javascript to run this site
Q | https://www.osti.gov/robots.txt | Disallow: /opennet/document Disallow: /opennet/search-results

### History Office FRUS
```json
{"id": "us-frus", "cc": "US", "kind": "archive", "name": "Foreign Relations of the United States (history.state.gov)", "url": "https://history.state.gov/historicaldocuments", "search": null, "api": null, "format": "html",
 "terms": "US government work", "key_required": false, "programs": ["FRUS volumes (NSAM 271 etc.)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://history.state.gov/historicaldocuments (34 KB)"},
 "use": "FRUS volume and document pages.", "limits": "robots: Crawl-delay 20, Disallow /search and /*pg_."}
```
Q | https://history.state.gov/robots.txt | Crawl-delay: 20 Sitemap: https://history.state.gov/sitemap.xml

### govinfo API and Archive.org advanced search
```json
{"id": "us-govinfo-api", "cc": "US", "kind": "archive-api", "name": "GovInfo API", "url": "https://api.govinfo.gov/docs/", "search": null, "api": "https://api.govinfo.gov/collections", "format": "json",
 "terms": "api.data.gov key", "key_required": true, "programs": ["hearings, CFR, FR PDFs"],
 "probe": {"date": "2026-10-24", "status": 401, "result": "refused", "sample": "https://api.govinfo.gov/collections"},
 "use": "Docs page is a shell; the API returns 401 without a key. Use www.govinfo.gov PDF links instead (the existing route).",
 "limits": "Key required. /app/collection/chrg is a 1.7 KB JS shell."}
```
```json
{"id": "us-archive-org-search", "cc": "US", "kind": "archive-api", "name": "Internet Archive advanced search (cross-jurisdiction mirror finder)", "url": "https://archive.org/advancedsearch.php", "search": "https://archive.org/advancedsearch.php?q={q}&fl%5B%5D=identifier&rows=20&output=json", "api": "same", "format": "json",
 "terms": "per item", "key_required": false, "programs": ["FOIA mirrors of CIA, FBI, Stasi etc."],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "q=mkultra returned numFound 7910"},
 "use": "Keyless JSON; finds items, then /metadata/<id> carries the licence (as the intro-film work already does). Useful for the other beats' mirrors.",
 "limits": "Results are user uploads; licence must be read per item. robots Disallow /control/ and /report/ only."}
```
Q | https://archive.org/advancedsearch.php?q=mkultra&fl%5B%5D=identifier&rows=3&output=json | "numFound":7910

---

# UNITED KINGDOM

### Freedom of Information Act 2000 (legislation.gov.uk)
```json
{"id": "gb-foia-2000", "cc": "GB", "kind": "law", "name": "Freedom of Information Act 2000, incl. s.23 and s.24", "url": "https://www.legislation.gov.uk/ukpga/2000/36/contents", "search": null, "api": "https://www.legislation.gov.uk/ukpga/2000/36/section/23/data.xml", "format": "html|xml",
 "terms": "Open Government Licence v3.0", "key_required": false, "programs": ["security-body exemption"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.legislation.gov.uk/ukpga/2000/36/section/23 (49 KB), /section/24 (33 KB), /section/23/data.xml (24 KB)"},
 "use": "Official text with per-section XML. s.23 is the absolute exemption for security bodies; s.24 is national security.",
 "limits": "robots Crawl-delay 5; Disallow */data.pdf and */data.docx (XML and HTML are allowed)."}
```
Q | https://www.legislation.gov.uk/ukpga/2000/36/section/23 | Information supplied by, or relating to, bodies dealing with security matters. U.K. This section has no associated Explanatory Notes (1) Information held by a public authority is exempt information if
Q | https://www.legislation.gov.uk/ukpga/2000/36/section/24 | National security. U.K. This section has no associated Explanatory Notes (1) Information which does not fall within section 23(1) is exempt information if exemption from section 1(1)(b) is required for
Q | https://www.legislation.gov.uk/ukpga/2000/36/section/23 | Open Government Licence v3.0 except where otherwise stated . This site additionally contains content derived from EUR-Lex, reused under the terms of the Commission Decision
Q | https://www.legislation.gov.uk/robots.txt | Crawl-delay: 5 Sitemap: http://www.legislation.gov.uk/sitemap-static.xml

### TNA Discovery API
```json
{"id": "gb-tna-discovery-api", "cc": "GB", "kind": "archive-api", "name": "The National Archives Discovery API", "url": "https://discovery.nationalarchives.gov.uk/API/", "search": "https://discovery.nationalarchives.gov.uk/API/search/records?sps.searchQuery={q}&sps.resultsPageSize=20", "api": "https://discovery.nationalarchives.gov.uk/API/records/v1/details/{id}", "format": "json",
 "terms": "Open Government Licence; guideline 3,000 calls/day, no faster than 1 request/second; asks to be told of use", "key_required": false, "programs": ["Operation Legacy / Migrated Archives (FCO 141)", "Porton Down"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "API/search/records?sps.searchQuery=FCO%20141 (count 21,763); API/search/records?sps.searchQuery=*&sps.recordSeries=FCO%20141 (count 21,388); API/records/v1/details/C12269323 (series record 'FCO 141', 1835-2012); API/search/records?sps.searchQuery=Porton%20Down (count 429)"},
 "use": "Keyless JSON. sps.recordSeries=FCO%20141 restricts to the series (exact), plain 'FCO 141' is free text and over-matches. Each record carries reference, covering dates, closureStatus, openingDate, adminHistory.",
 "limits": "The HTML results pages (/results/r) and /browse/ are robots-disallowed; use only /API/. Catalogue metadata only; image/order access for FCO 141 was reported withdrawn in 2022 (secondary sources, see program entry)."}
```
Q | https://www.nationalarchives.gov.uk/help/discovery-for-developers-about-the-application-programming-interface-api/ | Open Government Licence . Best practice Do not make an unreasonable number of API calls or use the API in a way which significantly compromises the experience of its other users. As a guideline, you should make no more than 3,000 API calls per day at a rate of no more frequently than one request per second.
Q | https://discovery.nationalarchives.gov.uk/robots.txt | Disallow: /browse/ Disallow: /Details/AddtoBasket
Q | https://www.nationalarchives.gov.uk/robots.txt | Content-Signal: ai-train=no, search=yes, ai-input=no Crawl-delay: 10 seconds Disallow: /book-a-reading-room-visit/

### FCO 141 Migrated Archives (program)
```json
{"id": "gb-fco-141", "cc": "GB", "kind": "program", "name": "FCO 141: Records of Former Colonial Administrations: Migrated Archives", "url": "https://discovery.nationalarchives.gov.uk/API/records/v1/details/C12269323", "search": "https://discovery.nationalarchives.gov.uk/API/search/records?sps.searchQuery=*&sps.recordSeries=FCO%20141&sps.resultsPageSize=20", "api": "same", "format": "json",
 "terms": "Open Government Licence", "key_required": false, "programs": ["Operation Legacy", "Hanslope Park Migrated Archive", "Mutua v FCO"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "FCO 141/6924 (Kenya: revised Land Settlement Scheme), id C13299344, openingDate 30/11/2012"},
 "use": "The series description records the 1961 guidance on which papers successor governments should not receive and says many were destroyed. Item-level titles are searchable (Kenya, Malta and others appear).",
 "limits": "Catalogue text only. Secondary sources (search results, not read) say TNA withdrew public access to the series in 2022 over insecticide treatment; each record's adminHistory carries an insecticide note. Current access status is not confirmed here."}
```
Q | https://discovery.nationalarchives.gov.uk/API/records/v1/details/C12269323 | "citableReference":"FCO 141","closureCode":null,"closureStatus":null,"closureType":null,"coveringDates":"183
Q | https://discovery.nationalarchives.gov.uk/API/search/records?sps.searchQuery=FCO%20141&sps.resultsPageSize=5 | A great many documents were destroyed on this basis, but others were returned to the UK.

### Porton Down (program, via Discovery)
```json
{"id": "gb-porton-down", "cc": "GB", "kind": "program", "name": "Porton Down records in the TNA catalogue", "url": "https://discovery.nationalarchives.gov.uk/API/search/records?sps.searchQuery=Porton%20Down&sps.resultsPageSize=20", "search": "same, vary sps.searchQuery", "api": "same", "format": "json",
 "terms": "Open Government Licence", "key_required": false, "programs": ["Porton Down human experiments", "Maddison inquest"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "count 429; top hits are the Chemical Defence Experimental Establishment 'Porton Down Notes' committee series 1920-1945"},
 "use": "Finds catalogue entries and series. Post-1945 human-trial files are not in the first page; refine with date or department filters.",
 "limits": "Free-text search; hits are catalogue descriptions, not the documents."}
```
Q | https://discovery.nationalarchives.gov.uk/API/search/records?sps.searchQuery=Porton%20Down&sps.resultsPageSize=5 | "count":429

### GOV.UK search API: FOI releases
```json
{"id": "gb-govuk-foi-releases", "cc": "GB", "kind": "disclosure-log", "name": "GOV.UK FOI releases (document type foi_release)", "url": "https://www.gov.uk/search/transparency-and-freedom-of-information-releases", "search": "https://www.gov.uk/api/search.json?filter_content_store_document_type=foi_release&q={q}&count=20", "api": "same", "format": "json",
 "terms": "Open Government Licence v3.0 (gov.uk content)", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "q=porton returned total 16 (MOD weekly FOI release pages, 'Gassing badgers'); the HTML page is 776 KB"},
 "use": "Keyless JSON over all departments' published FOI responses; each hit gives title, link, public_timestamp.",
 "limits": "robots disallows /search/all* only, so /api/search.json is allowed. The '(freedom of information)' text query without the filter returns ordinary publications, so keep the filter. Release pages link attachments; those were not read."}
```
Q | https://www.gov.uk/robots.txt | Disallow: /search/all* Sitemap: https://www.gov.uk/sitemap.xml

### ICO decision notices
```json
{"id": "gb-ico-decisions", "cc": "GB", "kind": "appeals", "name": "ICO decision notices", "url": "https://ico.org.uk/action-weve-taken/decision-notices/", "search": "https://ico.org.uk/action-weve-taken/decision-notices/?q={q}", "api": null, "format": "html",
 "terms": "not stated", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "decoy", "sample": "367 KB page, but the static HTML holds no notice rows (no FS5 references); the ?q=porton page is the same shell"},
 "use": "Nothing yet. The list is rendered client-side.",
 "limits": "robots Crawl-delay 6. Individual notice PDFs are reachable only if their URLs are known (no index found). Needs a different route (ICO sitemap /sitemap/ is advertised, not read)."}
```
Q | https://ico.org.uk/robots.txt | Crawl-delay: 6 Disallow: /private

### WhatDoTheyKnow
```json
{"id": "gb-wdtk", "cc": "GB", "kind": "civil-log", "name": "WhatDoTheyKnow", "url": "https://www.whatdotheyknow.com/", "search": "https://www.whatdotheyknow.com/search/{q}", "api": "https://www.whatdotheyknow.com/help/api", "format": "html|json|atom",
 "terms": "-", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://www.whatdotheyknow.com/robots.txt (403, the robots file itself); /help/api, /body/mi5, /search/porton%20down, /feed/search/porton%20down all 403"},
 "use": "None.", "limits": "Every path 403 to the identified crawler. Recorded null."}
```

### Saville Inquiry report (program)
```json
{"id": "gb-saville-report", "cc": "GB", "kind": "program", "name": "Report of the Bloody Sunday Inquiry (HC 29), Volume X on assets.publishing.service.gov.uk; CAIN summary", "url": "https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/279160/0029_x.pdf", "search": null, "api": null, "format": "pdf",
 "terms": "Crown copyright (per search result; not read in the PDF text)", "key_required": false, "programs": ["Bloody Sunday / Saville Inquiry"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "Volume X (appendices, rulings, bibliography), 2.9 MB PDF; also .../file/279167/0030.pdf found by search, not fetched"},
 "use": "Volume X text extracts locally. CAIN (cain.ulster.ac.uk/events/bsunday/, 14 KB) is the Ulster University secondary index with 'Reading', 'Chronology' and 'Dead' pages.",
 "limits": "The gov.uk landing page for the report is 404 (guessed slug); the 2010 inquiry website on webarchive.nationalarchives.gov.uk is robots-disallowed. Volumes I-IX not yet fetched (find their file numbers on assets.publishing.service.gov.uk)."}
```
Q | https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/279160/0029_x.pdf | Return to an Address of the Honourable the House of Commons dated 15 June 2010 for the Report of the Bloody Sunday Inquiry

### Hansard
Hansard (hansard.parliament.uk/robots.txt) answered 403: null.

---

# AUSTRALIA

### Freedom of Information Act 1982
```json
{"id": "au-foi-act", "cc": "AU", "kind": "law", "name": "Freedom of Information Act 1982 (Federal Register of Legislation)", "url": "https://www.legislation.gov.au/C2004A02562/latest/text", "search": null, "api": null, "format": "html",
 "terms": "not stated in text read", "key_required": false, "programs": ["agencies exempt (ASIO, ASIS etc.) in Schedule 2"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.legislation.gov.au/C2004A02562/latest/text (203 KB)"},
 "use": "Compiled text; the table of contents shows 'Schedule 2 Part I - Exempt agencies'.",
 "limits": "The agencies themselves are listed inside the Schedule, not extracted here."}
```
Q | https://www.legislation.gov.au/C2004A02562/latest/text | Freedom of Information Act 1982 No. 3, 1982 In force
Q | https://www.legislation.gov.au/C2004A02562/latest/text | Schedule 2 Collapse Part I—Exempt agencies Division 1 Division 2 Collapse Part II—Agencies exempt in respect of particular documents

### NAA RecordSearch
```json
{"id": "au-naa-recordsearch", "cc": "AU", "kind": "archive", "name": "National Archives of Australia RecordSearch", "url": "https://recordsearch.naa.gov.au/", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": "no public API found", "programs": ["Maralinga", "ASIO files"],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://recordsearch.naa.gov.au/"},
 "use": "None.", "limits": "403 on the root. www.naa.gov.au (robots, home, help pages) never connected: the container proxy dropped every try (egress). No NAA route exists for the crawler."}
```

### OAIC and AustLII (IC review decisions)
```json
{"id": "au-oaic-decisions", "cc": "AU", "kind": "appeals", "name": "OAIC FOI IC review decisions via AustLII (AICmr)", "url": "https://www.austlii.edu.au/au/cases/cth/AICmr/", "search": "https://www.austlii.edu.au/cgi-bin/sinosrch.cgi", "api": null, "format": "html",
 "terms": "AustLII robots: Content-Signal search=yes, ai-train=no, use=reference", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "AICmr index 403; classic.austlii.edu.au 403; cgi-bin/viewdb 403"},
 "use": "None from AustLII.", "limits": "robots allows all, but every case path is 403 to us. oaic.gov.au robots.txt is readable (Disallow /*?* ; query strings forbidden); /freedom-of-information/foi-decisions is 404 and no OAIC decision list URL was found."}
```
Q | https://www.austlii.edu.au/robots.txt | Content-Signal: search=yes,ai-train=no,use=reference Allow: /
Q | https://www.oaic.gov.au/robots.txt | Disallow: /*?* Disallow: /*_result_page=* Disallow: /*start_rank=*

### Right to Know
```json
{"id": "au-righttoknow", "cc": "AU", "kind": "civil-log", "name": "Right to Know (Alaveteli)", "url": "https://www.righttoknow.org.au/help/api", "search": null, "api": "https://www.righttoknow.org.au/body/{url_name}.json", "format": "json|atom",
 "terms": "robots Content-Signal: search=yes, ai-train=no, use=reference", "key_required": false, "programs": ["ASIO (not subject to FOI), Defence"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "/body/asio.json (941 B: 31 requests, 2 successful, 25 'visible classified'); /body/defence.json (941 B)"},
 "use": "Authority JSON with request counts and the site's own note that ASIO 'is not technically subject to Freedom of Information'.",
 "limits": "/search/maralinga is 403, /body/list/all is 403. /feed/search/maralinga returned 200 but its first item (a health-minister response) does not match the query, so treat the feed as unreliable. Request pages not probed."}
```
Q | https://www.righttoknow.org.au/body/asio.json | "name":"Australian Security Intelligence Organisation","short_name":"ASIO"
Q | https://www.righttoknow.org.au/body/asio.json | Please note: ASIO is not technically subject to Freedom of Information, and there is no promises that your request will be acknowledged or fulfilled.

### Maralinga / McClelland Royal Commission (program)
```json
{"id": "au-maralinga-rc", "cc": "AU", "kind": "program", "name": "Royal Commission into British Nuclear Tests in Australia (McClelland, 1984-85)", "url": "https://legislation.gov.au/C2004Q00993/asmade/1984-07-16/text/original/pdf", "search": null, "api": null, "format": "pdf",
 "terms": "-", "key_required": false, "programs": ["Maralinga", "Emu Field", "Monte Bello"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "Letters Patent of 16 July 1984 (236 KB PDF) naming the three commissioners"},
 "use": "The Letters Patent (primary, terms of reference). Separately a UK MoD-released copy of Royal Commission proceedings is on assets.publishing.service.gov.uk/media/6617b05a3fe61a4f683ea825/0300186-No_redact_Public_domain.pdf (1.7 MB; page 2 is a Commonwealth Reporting Service transcript of the Royal Commission).",
 "limits": "The 1985 report itself was not reached: NLA's digitised copy (nla.gov.au/nla.obj-2150995582) is behind an Anubis proof-of-work page (decoy 200); the Wayback copy of the ret.gov.au PDF found by search never connected; Trove API is robots-disallowed; aph.gov.au is 403."}
```
Q | https://legislation.gov.au/C2004Q00993/asmade/1984-07-16/text/original/pdf | appoint you to be Commissioners to inquire, in relation to the British nuclear tests (hereinafter referred to as “the tests”) that were conducted in Australia during the period of twelve years commencing on 1 January 1952
Q | https://nla.gov.au/nla.obj-2150995582/view | Making sure you're not a bot! Making sure you're not a bot! Loading... Anubis could not load its JavaScript.

### Agency disclosure logs
```json
{"id": "au-agency-disclosure-logs", "cc": "AU", "kind": "disclosure-log", "name": "Home Affairs, PM&C, Defence, DFAT disclosure logs", "url": "(see Nulls)", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": "403/212 B/egress", "result": "refused", "sample": "homeaffairs.gov.au 403; pmc.gov.au 212 B Incapsula page; defence.gov.au, asio.gov.au, directory.gov.au never connected; dfat.gov.au still retrying at write time"},
 "use": "None reached.", "limits": "Each host is a separate null. data.gov.au CKAN API path is robots-disallowed."}
```

---

# CANADA

### Access to Information Act
```json
{"id": "ca-ati-act", "cc": "CA", "kind": "law", "name": "Access to Information Act (R.S.C. 1985, c. A-1), Justice Laws site", "url": "https://laws-lois.justice.gc.ca/eng/acts/a-1/", "search": null, "api": null, "format": "html|xml|pdf",
 "terms": "not stated in text read", "key_required": false, "programs": ["s.15 international affairs and defence"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "act page (26 KB), /page-2.html (56 KB, s.15), /page-3.html (54 KB, s.18-s.19)"},
 "use": "Current text ('current to 2026-09-30 and last amended on 2026-06-14') with the national security exemption s.15.",
 "limits": "The enactment year (1983) is not stated on the pages read; take it from the report's table or the Act's history note."}
```
Q | https://laws-lois.justice.gc.ca/eng/acts/a-1/ | Act current to 2026-09-30 and last amended on 2026-06-14.
Q | https://laws-lois.justice.gc.ca/eng/acts/a-1/page-2.html | Marginal note: International affairs and defence 15 (1) The head of a government institution may refuse to disclose any record requested under this Part that contains information the disclosure of which could reasonably be expected to be injurious to the conduct of international affairs, the defence of Canada

### Completed ATI request summaries (open.canada.ca): the prize
```json
{"id": "ca-ati-completed-summaries", "cc": "CA", "kind": "disclosure-log", "name": "Completed Access to Information Request Summaries dataset", "url": "https://open.canada.ca/data/en/dataset/0797e893-751e-4695-8229-a5066e4fe43c", "search": "https://open.canada.ca/data/api/action/datastore_search?resource_id=19383ca2-b01a-487d-88f7-e1ffbc7d39c2&limit=100&filters={\"owner_org\":\"{org}\"}", "api": "https://open.canada.ca/data/api/action/datastore_search?resource_id=19383ca2-b01a-487d-88f7-e1ffbc7d39c2", "format": "csv|json",
 "terms": "Open Government Licence - Canada", "key_required": false, "programs": ["CSIS, CSE, DND, RCMP completed requests"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "datastore_search ...&limit=2 returned total 205,063 rows; filters={\"owner_org\":\"csis-scrs\"} also 200; ati-all.csv is 116,697,500 B (not fetched); ati-nil.csv 665,847 B"},
 "use": "Keyless CKAN datastore. Fields: year, month, request_number, summary_en/fr, disposition, pages, comments_en/fr, umd_number, owner_org, owner_org_title. Filter by owner_org instead of downloading the 117 MB CSV.",
 "limits": "q= full-text parameter returns HTTP 409, so search must be done by filter or by walking offset. Only summaries of completed requests; personal-information requests are excluded by the dataset. The open.canada.ca /en/search/ati page is robots-disallowed. Crawl-delay 20 s."}
```
Q | https://open.canada.ca/data/en/dataset/0797e893-751e-4695-8229-a5066e4fe43c | All institutions subject to the Access to Information Act are required to post summaries of completed access to information (ATI) requests within thirty calendar days after the end of each month.
Q | https://open.canada.ca/data/api/action/package_show?id=0797e893-751e-4695-8229-a5066e4fe43c | "license_title": "Open Government Licence - Canada"
Q | https://open.canada.ca/data/api/action/datastore_search?resource_id=19383ca2-b01a-487d-88f7-e1ffbc7d39c2&limit=2 | "total": 205063
Q | https://open.canada.ca/robots.txt | Disallow: /search/ati* Disallow: /en/search/ati*

### Open Canada CKAN package search
```json
{"id": "ca-open-ckan", "cc": "CA", "kind": "archive-api", "name": "Open Government Portal CKAN API", "url": "https://open.canada.ca/data/api/action/package_search", "search": "https://open.canada.ca/data/api/action/package_search?q={q}&rows=10", "api": "same", "format": "json",
 "terms": "Open Government Licence - Canada (per dataset)", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "q=access to information completed requests returned 924 packages"},
 "use": "Finds datasets (also proactive disclosures); package_show gives resource URLs and sizes.",
 "limits": "Crawl-delay 20."}
```

### Information Commissioner of Canada, CSE, CSIS, LAC, Parliament
```json
{"id": "ca-oic", "cc": "CA", "kind": "appeals", "name": "Office of the Information Commissioner", "url": "https://www.oic-ci.gc.ca/en", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.oic-ci.gc.ca/en (79 KB)"},
 "use": "Home page with 'Investigations' and 'Court cases' menus; robots permits (Disallow only /core/, /profiles/).",
 "limits": "The guessed findings URL is 404; the findings list URL was not found."}
```
```json
{"id": "ca-cse-transparency", "cc": "CA", "kind": "disclosure-log", "name": "CSE transparency: ATIP and proactive disclosure", "url": "https://www.cse-cst.gc.ca/en/accountability/transparency", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": ["CSE bulk metadata"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "37 KB"},
 "use": "Entry to CSE ATIP file/search and reports to Parliament.", "limits": "Not followed further."}
```
Q | https://www.cse-cst.gc.ca/en/accountability/transparency | Access to Information and Privacy Acts (ATIP) File or search ATIP requests or find out about CSE’s information holdings
```json
{"id": "ca-lac", "cc": "CA", "kind": "archive", "name": "Library and Archives Canada Collection Search", "url": "https://recherche-collection-search.bac-lac.gc.ca/", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": ["Allan Memorial / MKUltra records"],
 "probe": {"date": "2026-10-24", "status": null, "result": "robots", "sample": "https://recherche-collection-search.bac-lac.gc.ca/eng/Home/Result?q=Allan%20Memorial"},
 "use": "None.", "limits": "Spider reports robots-disallow on the whole collection-search host; www.bac-lac.gc.ca never connected (egress). CSIS (csis-scrs.gc.ca) answered 502 at CONNECT (egress)."}
```
Allan Memorial / McGill (program): no primary document reached. Canadian Encyclopedia (thecanadianencyclopedia.ca/en/article/mkultra) answered 403. A web search surfaced CBC (`https://www.cbc.ca/1.4373590`) and CTV pages saying the 1992 payments were $100,000 without admitting liability; none read through the spider, so the claim stays unsourced here. ourcommons.ca/robots.txt is 403.

---

# NEW ZEALAND

### FYI.org.nz (Alaveteli)
```json
{"id": "nz-fyi", "cc": "NZ", "kind": "civil-log", "name": "FYI.org.nz", "url": "https://fyi.org.nz/body/gcsb", "search": null, "api": "https://fyi.org.nz/help/api", "format": "html",
 "terms": "-", "key_required": false, "programs": ["GCSB / Waihopai", "Five Eyes UAP holdings"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "/body/gcsb (35 KB, 100 requests); /body/list/all (53 KB); /request/34791-gcsb-five-eyes-uap-intelligence-holdings-and-war-gov-pursue-consultation (27 KB)"},
 "use": "Body pages and request pages are readable. The GCSB UAP request shows the agency refusing under section 18(g)(i) as information not held.",
 "limits": "robots Disallow */search/, */feed/, */track/ and *.json.j*: no search, no Atom, no JSON. Navigate body -> request only. Requester usernames appear on pages; do not carry them."}
```
Q | https://fyi.org.nz/robots.txt | Disallow: */search/ Disallow: */similar/ Disallow: */track/ Disallow: */upload/
Q | https://fyi.org.nz/body/gcsb | 100 requests Make a request to
Q | https://fyi.org.nz/request/34791-gcsb-five-eyes-uap-intelligence-holdings-and-war-gov-pursue-consultation | We can advise that the GCSB does not hold any information that falls within the scope of your request. As such, we are refusing your request under section 18(g)(i) of the OIA, as the information requested is not

### DigitalNZ API
```json
{"id": "nz-digitalnz-api", "cc": "NZ", "kind": "archive-api", "name": "DigitalNZ records API (National Library, Turnbull Library etc.)", "url": "https://api.digitalnz.org/records.json", "search": "https://api.digitalnz.org/records.json?text={q}&per_page=20", "api": "same", "format": "json",
 "terms": "per item (rights field; CC BY 4.0 on several Turnbull items); API terms page unreadable (HTTP 202)", "key_required": false, "programs": ["Waihopai (photographs)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "text=waihopai returned result_count 15,960 (photographs, Alexander Turnbull Library); text=GCSB filtered to Archives New Zealand returned 0"},
 "use": "Keyless item metadata with rights statements and landing_url.",
 "limits": "Archives NZ is not a content partner under the name tried, so no Archives NZ holdings through here. api.digitalnz.org/terms-of-use and digitalnz.org/robots.txt answer 202 (challenge): terms unread, rate limits unknown."}
```
Q | https://api.digitalnz.org/records.json?text=waihopai | "result_count":15960

### NZ nulls
```json
{"id": "nz-institution-nulls", "cc": "NZ", "kind": "archive", "name": "Archives NZ Collections, GCSB, NZSIS, National Library, Ombudsman, Legislation, DPMC", "url": "(see Nulls)", "search": null, "api": null, "format": "html",
 "terms": "-", "key_required": false, "programs": ["GCSB proactive releases", "Official Information Act 1982"],
 "probe": {"date": "2026-10-24", "status": "200 (212 B) / 202 / 403", "result": "decoy", "sample": "see Decoy candidates and Nulls"},
 "use": "Inspector-General of Intelligence and Security (www.igis.govt.nz, 27 KB, 200) is the only NZ intelligence-oversight site that answers; publications page guessed wrongly (404).",
 "limits": "OIA text is unreachable (legislation.govt.nz answers 202)."}
```

---

## Decoy candidates for hosts.json

| host | what it returns | match on | why |
|---|---|---|---|
| www.cia.gov | HTTP 200 after redirect to `https://www.cia.gov/system-maintenance/`, 508,740 B HTML, title "System Maintenance - CIA". Hit by `/readingroom/docs/<name>.pdf` and `/readingroom/document/<slug>` (new shape; the registered decoy title "Freedom of Information Act Electronic Reading Room" does not catch it). Ledgered as `ok` today. | title "System Maintenance - CIA", or bytes 508740, or final_url `/system-maintenance/` | A maintenance page is stored as a source. |
| collections.archives.govt.nz, www.archives.govt.nz, www.gcsb.govt.nz, www.nzsis.govt.nz, natlib.govt.nz, www.pmc.gov.au | HTTP 200, 212 B: `<META NAME="robots" CONTENT="noindex,nofollow">` plus `<script src="/_Incapsula_Resource?...">` | decoy_bytes 212, or body marker `_Incapsula_Resource` | Imperva challenge shell; ledgered `ok`. |
| nla.gov.au | HTTP 200, 7,567 B, title "Making sure you're not a bot!" (Anubis proof of work) | title | Challenge page served for a digitised-object URL. |
| www.legislation.govt.nz, digitalnz.org, api.digitalnz.org (terms pages only) | HTTP 202, no body | status 202 | Challenge; spider records as refused, which is correct. Keep as refusals. (api.digitalnz.org/records.json itself answers 200 with real JSON.) |
| www.foia.gov | `/search.html` 200, 25 KB JS shell ("Thank you for visiting FOIA.gov...") | title "FOIA.gov - Freedom of Information Act: Search Government Websites" | Search is client-side against the keyed API. |
| www.osti.gov | `/opennet/` 200, 21 KB, "You must have javascript to run this site" | body marker | JS shell. |
| www.govinfo.gov | `/app/collection/chrg` 200, 1,769 B shell | bytes 1769 | JS shell. |
| ico.org.uk | decision-notices list 200, 367 KB, rows absent | no `FS5` in body | List rendered client-side (not a block). |
| archive.org | none | - | Works. |

## Nulls

- US: api.foia.gov root 404; api.foia.gov agency_components with placeholder key 403; www.nsa.gov (all paths probed) 403; www.state.gov/foia/ 403; foia.state.gov robots-disallowed (incl. its /robots.txt); www.esd.whs.mil 403; www.dia.mil FOIA reading room 403; www.fbi.gov/services/information-management/foipa 403; vault.fbi.gov 403; www.cia.gov/readingroom/search/site/... robots-disallowed; catalog.archives.gov and its API robots-disallowed; muckrock.com 403 (incl. robots.txt); www.documentcloud.org/api/ 403; www.maryferrell.org robots-disallowed; nsarchive.gwu.edu/documents 403; theblackvault.com/?s= robots-disallowed; governmentattic.org/documents.html 404; api.govinfo.gov/collections 401; www.intel.gov/foia 404.
- UK: whatdotheyknow.com all 403 (robots file too); hansard.parliament.uk/robots.txt 403; discovery results pages (/results/r) and /browse/ robots-disallowed; webarchive.nationalarchives.gov.uk Saville site robots-disallowed; gov.uk guessed Saville and FCO 141 pages 404; TNA operation-legacy guess 404.
- AU: recordsearch.naa.gov.au 403; www.naa.gov.au, www.defence.gov.au, www.asio.gov.au, www.directory.gov.au never connected (container proxy dropped the CONNECT; egress, not a site refusal); homeaffairs.gov.au 403; austlii.edu.au/au/cases/cth/AICmr/ 403 (three hosts/paths); righttoknow.org.au /search/ and /body/list/all 403; aph.gov.au 403; api.trove.nla.gov.au and data.gov.au API robots-disallowed; oaic.gov.au/freedom-of-information/foi-decisions 404; www.dfat.gov.au and the wayback.archive.org Maralinga PDF still retrying at write time (probably egress).
- CA: recherche-collection-search.bac-lac.gc.ca robots-disallowed; www.bac-lac.gc.ca and www.csis-scrs.gc.ca egress (the proxy status lists csis as 502); thecanadianencyclopedia.ca 403; ourcommons.ca robots 403; open.canada.ca /en/search/ati robots-disallowed; datastore_search with q= HTTP 409; oic-ci.gc.ca findings URL 404.
- NZ: ombudsman.parliament.nz 403 (robots and case notes); www.dpmc.govt.nz 403; legislation.govt.nz (OIA 1982, robots, versions page) 202; digitalnz.org/developers and /robots.txt, api.digitalnz.org/terms-of-use 202; igis.govt.nz/reports-and-publications/ 404; parliament.nz Hansard guess 404. FYI search/feed/json robots-disallowed.

## Policy notes for the registry

- Content-Signal lines: nationalarchives.gov.uk (`ai-train=no, search=yes, ai-input=no`), austlii.edu.au and righttoknow.org.au (`search=yes, ai-train=no, use=reference`). The spider's ledger and quotes are reference use; flag for the author that any model training on these is excluded.
- Rate: TNA API 1 request/second and 3,000/day; open.canada.ca crawl-delay 20 s; history.state.gov 20 s; nationalarchives.gov.uk www host 10 s; archives.gov 10 s; legislation.gov.uk 5 s; ico.org.uk 6 s; governmentattic.org 5 s.
- Keys: foia.gov API, govinfo API need keys (not registered). The TNA, gov.uk, Open Canada, DigitalNZ, archive.org APIs ran keyless.
- FYI request pages and Right to Know pages show requesters' usernames; not to be copied onto the page.

## Sources fetched

All in `research/sources/ledger.jsonl` (notes begin "foi fiveeyes" for the first batch; later batches were fetched without --note):
foia.gov (/, /robots.txt, /developer/, /foia-statute.html, /data.html, /foia-dataset-download.html, /search.html), archives.gov (/robots.txt, /foia/electronic-reading-room, /research/jfk, /research/jfk/release-2025, one 2025 PDF), dni.gov (reading room, robots), dhs.gov/foia-library, justice.gov/oip and /oip/foia-library, nsarchive.gwu.edu (robots, home, postings/all, project page, one briefing book, search), nsarchive2.gwu.edu, theblackvault.com (robots, archive, three category pages), governmentattic.org (robots, home, Frame-2, one PDF), osti.gov (opennet, robots), history.state.gov, api.govinfo.gov, archive.org (robots, advancedsearch), cia.gov (two reading-room URLs), discovery.nationalarchives.gov.uk (robots, API help, 3 searches, 1 detail), nationalarchives.gov.uk (robots, API terms, OGL), legislation.gov.uk (FOI Act contents, s23, s24, s23 XML, robots), gov.uk (robots, search page, API x2), ico.org.uk (robots, decision notices x2), assets.publishing.service.gov.uk (Saville vol X PDF, MoD-released Royal Commission transcript), cain.ulster.ac.uk, nla.gov.au, legislation.gov.au (FOI Act, Letters Patent PDF), oaic.gov.au robots, austlii robots, righttoknow.org.au (robots, help/api, asio.json, defence.json, feed), open.canada.ca (robots, dataset, package_search, package_show, datastore_search x3, resource_show), laws-lois.justice.gc.ca (three pages), oic-ci.gc.ca (home, robots), cse-cst.gc.ca, fyi.org.nz (robots, help/api, body/gcsb, body/list/all, one request), igis.govt.nz, api.digitalnz.org (two searches), plus the refused/robots hosts listed in Nulls.

Helper scripts (scratchpad, not in repo): `/tmp/claude-0/-home-user/9915310d-9125-5a6d-9896-9cfd05323aa5/scratchpad/foi/tools/` (t.sh, q.py, links.py, cachepath.py).
