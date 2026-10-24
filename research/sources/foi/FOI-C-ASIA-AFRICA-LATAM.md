# foi-south: Japan, India, South Africa, Brazil, China

Probed 2026-10-24 with `scripts/spider/spider.py` (identified, robots obeyed, one identity); every probe is a ledger row whose note starts `foi south:`. Nothing in the repository was edited and nothing was filed or registered. Each Q line was machine-checked against the cached body (HTML via `spider.py text`; PDFs by local text extraction because `text` refuses PDFs; Shift_JIS pages decoded from the cached bytes): 0 failures. Where a clause could not be quoted from the text, the entry says so.

**Reading the result.** Working data paths: Japan (e-Gov JSON API, JACAR and NAJ catalogue searches, NARA IWG PDFs), South Africa (gov.za, TRC hearings and report, SAHA finding aids, Regulator's page), India (the Act and CIC static pages only), Brazil (the Câmara's LAI text only), China (OGI Regulations, State Secrets Law reprint, agency annual reports). Everything that would hold released responses or decisions is a shell, a challenge, a refusal or unreachable (Busca LAI/Fala.BR, dados.gov.br, CIC decisions, Abhilekh Patal, SIAN, Memórias Reveladas, CNV, koukai-hogo-db). `probe.result` uses the brief's values plus `not_reachable` (transport error at the session's egress or the host, as distinct from a refusal). `kind` values follow the brief; where the brief has none (e.g. `regulator`), the closest one is used.

## Japan

### e-Gov Law API v2, Act on Access to Information Held by Administrative Organs (1999)
```json
{"id": "jp-egov-api-info-disclosure-act", "cc": "JP", "kind": "law", "name": "行政機関の保有する情報の公開に関する法律 (Act No. 42 of 1999), Japanese text, e-Gov Law API v2", "url": "https://laws.e-gov.go.jp/api/2/law_data/411AC0000000042",
 "search": "https://laws.e-gov.go.jp/api/2/laws?law_title={q}  (title search, JSON; probed with 特定秘密)", "api": "https://laws.e-gov.go.jp/api/2/law_data/{law_id}", "format": "json",
 "terms": "not stated in the probed JSON; e-Gov's terms page was not read", "key_required": false, "programs": ["Unit 731 (what the Japanese statute lets the state withhold)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://laws.e-gov.go.jp/api/2/law_data/411AC0000000042"},
 "use": "Current Japanese statute text as JSON (revision 2026-07-17), including the national-security non-disclosure ground in Art. 5(iii); law ids are discoverable by title search.",
 "limits": "The human page https://laws.e-gov.go.jp/law/411AC0000000042 is an 800-byte JavaScript shell (title 'e-Gov 法令検索') with no law text, and so is /robots.txt on that host: use the API, never the page."}
```
Q | https://laws.e-gov.go.jp/api/2/law_data/411AC0000000042 | 行政機関の保有する情報の公開に関する法律
Q | https://laws.e-gov.go.jp/api/2/law_data/411AC0000000042 | 公にすることにより、国の安全が害されるおそれ、他国若しくは国際機関との信頼関係が損なわれるおそれ又は他国若しくは国際機関との交渉上不利益を被るおそれがあると行政機関の長が認めることにつき相当の理由がある情報

### Japanese Law Translation, same Act in English
```json
{"id": "jp-jlt-info-disclosure-act-en", "cc": "JP", "kind": "law", "name": "Act on Access to Information Held by Administrative Organs (Act No. 42 of 1999), English, Japanese Law Translation database", "url": "https://www.japaneselawtranslation.go.jp/en/laws/view/3765/en",
 "search": null, "api": null, "format": "html",
 "terms": "not stated on the probed page", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.japaneselawtranslation.go.jp/en/laws/view/3765/en"},
 "use": "English text of the Act, including Art. 5 item (iii), the closest thing Japan has to an intelligence/security exemption (there is no clause naming a service).",
 "limits": "The translation is stale: the page says 'Last Version： Act No. 84 of 2004', whereas e-Gov's Japanese text is at a 2026 revision. Cite the Japanese text for the current law."}
```
Q | https://www.japaneselawtranslation.go.jp/en/laws/view/3765/en | Last Version： Act No. 84 of 2004
Q | https://www.japaneselawtranslation.go.jp/en/laws/view/3765/en | likely to cause harm to national security, cause damage to the relationship of mutual trust with another country or an international organization

### Designated Secrets Act (2013), via e-Gov API
```json
{"id": "jp-egov-api-designated-secrets-act", "cc": "JP", "kind": "law", "name": "特定秘密の保護に関する法律 (Act on the Protection of Specially Designated Secrets, 2013)", "url": "https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108",
 "search": "https://laws.e-gov.go.jp/api/2/laws?law_title=%E7%89%B9%E5%AE%9A%E7%A7%98%E5%AF%86", "api": "https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108", "format": "json",
 "terms": "not stated", "key_required": false, "programs": ["Unit 731 / Japanese classification regime"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108"},
 "use": "Gives the classification periods the report's Japan row paraphrases as 'allows 60-year classification'.",
 "limits": "Statute only; it does not list what has been designated."}
```
Q | https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108 | 指定の有効期間は、通じて三十年を超えることができない。
Q | https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108 | ただし、次の各号に掲げる事項に関する情報を除き、指定の有効期間は、通じて六十年を超えることができない。

### Public Records and Archives Management Act (2009), via e-Gov API
```json
{"id": "jp-egov-api-public-records-act", "cc": "JP", "kind": "law", "name": "公文書等の管理に関する法律 (Public Records and Archives Management Act, 2009)", "url": "https://laws.e-gov.go.jp/api/2/law_data/421AC0000000066",
 "search": null, "api": "https://laws.e-gov.go.jp/api/2/law_data/421AC0000000066", "format": "json",
 "terms": "not stated", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://laws.e-gov.go.jp/api/2/law_data/421AC0000000066"},
 "use": "The statute that governs transfer of records to the National Archives of Japan (the pipeline that feeds the digital archive below).",
 "limits": "Not read beyond the title and promulgation date (2009-07-01); no article is cited."}
```
Q | https://laws.e-gov.go.jp/api/2/law_data/421AC0000000066 | 公文書等の管理に関する法律

### Information Disclosure and Personal Information Protection Review Board, answers
```json
{"id": "jp-soumu-review-board-answers", "cc": "JP", "kind": "appeals", "name": "情報公開・個人情報保護審査会 答申 (Review Board reports), Ministry of Internal Affairs page and answer PDFs", "url": "https://www.soumu.go.jp/main_sosiki/singi/jyouhou/toushin.html",
 "search": "http://koukai-hogo-db.soumu.go.jp/  (the search database; REFUSED, see limits)", "api": null, "format": "html+pdf",
 "terms": "not stated on the probed page", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.soumu.go.jp/main_content/000978211.pdf"},
 "use": "The answers index page (Shift_JIS) and individual answer PDFs under /main_content/ fetch fine; the Cabinet Office's English one-pager (https://www.cao.go.jp/en/pmf/pmf_24.pdf) describes the Board (15 members).",
 "limits": "The searchable database koukai-hogo-db.soumu.go.jp answered 403 on the page and on /robots.txt (refusal, recorded, not worked around), so decisions on, e.g., a security-ground refusal cannot be searched by the crawler; the sample PDF is about a private individual's own data and is not used here."}
```
Q | https://www.soumu.go.jp/main_sosiki/singi/jyouhou/toushin.html | 情報公開・個人情報保護審査会の答申等について、用語、諮問庁、答申番号等により、検索することができます。
Q | https://www.cao.go.jp/en/pmf/pmf_24.pdf | The Board (15 members )
(The soumu.go.jp page is Shift_JIS; `spider.py text` prints mojibake, so the Japanese was decoded from the cached bytes as shift_jis. The cao.go.jp line is from the PDF's local text extraction.)

### JACAR (Japan Center for Asian Historical Records)
```json
{"id": "jp-jacar-search", "cc": "JP", "kind": "archive", "name": "JACAR 国立公文書館 アジア歴史資料センター, search", "url": "https://www.jacar.archives.go.jp/",
 "search": "https://www.jacar.archives.go.jp/aj/search?kl0=AND&ks0=kw_all&kw0={q}&rows=20   (English UI: /aj/search-en?kl0=AND&ks0=kw_all&kw0={q}&rows=20)", "api": null, "format": "html",
 "terms": "personal download and print are free; citation conventions at https://www.jacar.archives.go.jp/aj/www/doc/ (image terms page, read in Japanese)", "key_required": false, "programs": ["Unit 731 (records of the Ishii unit, 石井部隊)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.jacar.archives.go.jp/aj/search?kl0=AND&ks0=kw_all&kw0=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A&rows=20  -> 検索結果数 183 件"},
 "use": "Server-rendered catalogue results (reference codes, creator, holding institution) for the National Archives, the Diplomatic Archives and the Defense Ministry's military history centre, 1868 to about 1945; the Ishii unit keyword returns 183 catalogue entries (the first three carry reference codes A03023865100, B08060755400 and C01003508400, from the National Archives, the Diplomatic Archives and the Defense Ministry's military history centre respectively; only their catalogue lines were read).",
 "limits": "TRAP: the obvious parameter `keyword=` is ignored and the page reports the whole corpus (検索結果数 2481992 件), a 200 that answers a different question; the working parameters are kl0/ks0/kw0, found in /bundles/apps-aj/js/search-cond.js. Image files are under /contentDownload/, which robots.txt disallows (and Crawl-delay 30); the crawler reads catalogue records, not page images."}
```
Q | https://www.jacar.go.jp/english/about/outline.html | The Japan Center for Asian Historical Records (JACAR) is an electronic resources center operated by the National Archives of Japan
Q | https://www.jacar.archives.go.jp/robots.txt | Disallow: /contentDownload/*
Q | https://www.jacar.archives.go.jp/robots.txt | Crawl-delay: 30
Q | https://www.jacar.archives.go.jp/aj/search?kl0=AND&ks0=kw_all&kw0=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A&rows=20 | 検索結果数 183 件
Q | https://www.jacar.archives.go.jp/aj/search?kl0=AND&ks0=kw_all&kw0=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A&rows=20 | B08060755400
Q | https://www.jacar.archives.go.jp/aj/search?keyword=731 | 検索結果数 2481992 件
Q | https://www.jacar.archives.go.jp/aj/www/doc/ | 個人利用を目的とした資料画像のダウンロード、プリントアウトは自由にしていただけます。

### National Archives of Japan Digital Archive
```json
{"id": "jp-naj-digital-archive", "cc": "JP", "kind": "archive", "name": "国立公文書館デジタルアーカイブ (National Archives of Japan digital archive), catalogue search", "url": "https://www.digital.archives.go.jp/",
 "search": "https://www.digital.archives.go.jp/search?kw={q}", "api": null, "format": "html",
 "terms": "https://www.digital.archives.go.jp/secondary-use : digital content 'may be used freely' (任意にご利用いただけます), user bears responsibility; a request about AI-processed use follows", "key_required": false, "programs": ["Unit 731 (防疫給水部 = epidemic prevention and water purification units)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.digital.archives.go.jp/search?kw=%E9%98%B2%E7%96%AB%E7%B5%A6%E6%B0%B4%E9%83%A8  -> 検索結果数 155 件"},
 "use": "Catalogue search of the national archive's own holdings; the keyword 防疫給水部 returns 155 entries, i.e. Japanese-held records under that unit name are catalogued and searchable, which bears on the report's line that Unit 731 records 'surfaced through U.S. FOIA, not Japanese disclosure'.",
 "limits": "Catalogue entries only were read; whether any listed file is a personnel roster, an order or an unrelated item was not examined. robots.txt: Crawl-delay 30 and Disallow /contentDownload/* (bulk downloads are closed to the crawler). No API found."}
```
Q | https://www.digital.archives.go.jp/robots.txt | Crawl-delay: 30
Q | https://www.digital.archives.go.jp/robots.txt | Disallow: /contentDownload/*
Q | https://www.digital.archives.go.jp/search?kw=%E9%98%B2%E7%96%AB%E7%B5%A6%E6%B0%B4%E9%83%A8 | 検索結果数 155 件
Q | https://www.digital.archives.go.jp/secondary-use | は、任意にご利用いただけます。

### NARA, Interagency Working Group: Japanese war crimes records (Unit 731 cross-reference)
```json
{"id": "us-nara-iwg-japanese-war-crimes", "cc": "US", "kind": "program", "name": "NARA IWG, Researching Japanese War Crimes (Japanese Imperial Government Disclosure Act), finding aids and selected documents on Japanese biological warfare", "url": "https://www.archives.gov/iwg/japanese-war-crimes",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "US federal website; reuse terms not stated on the probed page", "key_required": false, "programs": ["Unit 731"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.archives.gov/files/iwg/japanese-war-crimes/select-documents.pdf (24.3 MB, 170 pages)"},
 "use": "Introductory essays PDF, Greg Bradsher's 1,700-page guide (zip), and the 'Select Documents on Japanese War Crimes and Japanese Biological Warfare, 1934-2006' compilation; its first page states the statute (P.L. 106-657) behind it. This is the American-side proof for the report's 'surfaced through U.S. records' line.",
 "limits": "Compilation and guide, not the record groups themselves; the NARA Catalog (the item-level index) is robots-disallowed (below). Compilation not read beyond its front matter; no person is named here."}
```
Q | https://www.archives.gov/iwg/japanese-war-crimes | Select Documents on Japanese War Crimes and Japanese Biological Warfare, 1934-2006 (23.2 MB) encompasses several thousand documents on Japanese war crimes & Japanese biological warfare.
Q | https://www.archives.gov/files/iwg/japanese-war-crimes/select-documents.pdf | The enactment of the Japanese Imperial Government Disclosure Act (P.L.106-657)
(The second line is from local PDF text extraction; `spider.py text` refuses PDFs by design.)

### NARA Catalog (item-level index): robots-disallowed
```json
{"id": "us-nara-catalog-api", "cc": "US", "kind": "archive-api", "name": "NARA National Archives Catalog and API v2", "url": "https://catalog.archives.gov/",
 "search": "https://catalog.archives.gov/search?q={q}", "api": "https://catalog.archives.gov/api/v2/records/search?q={q}", "format": "json",
 "terms": "n/a", "key_required": "unknown (not reached)", "programs": ["Unit 731 (RG 263, RG 153 series)"],
 "probe": {"date": "2026-10-24", "status": null, "result": "robots", "sample": "https://catalog.archives.gov/api/v2/records/search?q=Unit%20731"},
 "use": "None for the crawler: the spider's robots check refused both the API URL and /robots.txt itself.",
 "limits": "Disallowed under the spider's rule. (CLAUDE.md §7 records the single exception already granted, the RG 615 bulk files that NARA's own bulk page offers; it does not cover the Catalog or its API.)"}
```
## India

### RTI Act 2005, English text (CIC copy)
```json
{"id": "in-cic-rti-act-english-pdf", "cc": "IN", "kind": "law", "name": "The Right to Information Act, 2005 (Act No. 22 of 2005), English PDF hosted by the Central Information Commission", "url": "https://cic.gov.in/sites/default/files/RTI_English.pdf",
 "search": null, "api": null, "format": "pdf",
 "terms": "CIC site; its 'Copy Right Policy' and 'Terms and Conditions' pages were not read", "key_required": false, "programs": ["RTI exemption for RAW and IB"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://cic.gov.in/sites/default/files/RTI_English.pdf (25 pages, 355 KB)"},
 "use": "Act text with the Second Schedule. s.24(1) takes the Schedule's intelligence and security organisations (Intelligence Bureau; Research and Analysis Wing including the Aviation Research Centre; Directorate of Revenue Intelligence; and others) out of the Act, with a proviso that information on allegations of corruption and human-rights violations is not excluded.",
 "limits": "The report's row says RAW and IB are 'exempt'; the text is narrower, and the row does not mention the proviso or the second proviso (human-rights information from these bodies is provided only after the Central Information Commission's approval, within 45 days). The official copies refused or failed: rti.gov.in/rti-act.pdf (connection reset by the host), indiacode.nic.in (403)."}
```
Q | https://cic.gov.in/sites/default/files/RTI_English.pdf | Nothing contained in this Act shall apply to the intelligence and security organisations specified in the Second Schedule, being organisations established by the Central Government or any information furnished by such organisations to that Government
Q | https://cic.gov.in/sites/default/files/RTI_English.pdf | Provided that the information pertaining to the allegations of corruption and human rights violations shall not be excluded under this sub-section
Q | https://cic.gov.in/sites/default/files/RTI_English.pdf | Research and Analysis Wing including its technical wing namely, the Aviation Research Centre of the Cabinet Secretariat.
Q | https://cic.gov.in/sites/default/files/RTI_English.pdf | the information shall only be provided after the approval of the Central Information Commission, and notwithstanding anything contained in section 7, such information shall be provided within forty-five days from the date of the receipt of request
(Quotes from local PDF text extraction.)

### Official RTI Act hosts: unreachable or refused
```json
{"id": "in-official-rti-act-hosts", "cc": "IN", "kind": "law", "name": "rti.gov.in (RTI Act PDF) and IndiaCode (India Code, RTI Act handle)", "url": "https://rti.gov.in/rti-act.pdf",
 "search": null, "api": null, "format": "pdf",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": null, "result": "refused", "sample": "https://rti.gov.in/rti-act.pdf: transport error 'Connection reset by peer' after the spider's whole back-off ladder (ledger row 02:42 UTC); https://www.indiacode.nic.in/handle/123456789/2065 and /robots.txt: 403"},
 "use": "None. Use the CIC copy above.",
 "limits": "Recorded as nulls; the crawler did not change identity or route. A connectivity-only check with curl (no content kept) to rti.gov.in also returned no response, so the failure is at the host or on the path to it, not in the spider's headers."}
```

### Central Information Commission
```json
{"id": "in-cic-site", "cc": "IN", "kind": "appeals", "name": "Central Information Commission (India), site: decisions index, landmark decisions, s.4 disclosure, annual reports", "url": "https://cic.gov.in/",
 "search": "https://cic.gov.in/decision  (links out to the decision search apps, below)", "api": null, "format": "html+pdf",
 "terms": "not read (Copy Right Policy page not fetched)", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://cic.gov.in/decision ; https://cic.gov.in/cic_landmark (a 74 MB PDF of landmark decisions is linked) ; https://cic.gov.in/circular-reports-conventions (annual reports) ; https://cic.gov.in/rti-disclosoures (the CIC's own s.4(1)(b) disclosure)"},
 "use": "Static pages that fetch: the Act and Rules PDFs (/rti_act), landmark decisions, annual reports, study reports, and the s.4 compliance material (/transparency_audit_of_disclosures).",
 "limits": "robots.txt (Drupal default) bars /search/ and /index.php/search/, so the CIC's own site search is closed to the crawler. The decision databases are on other hosts (next entry)."}
```
Q | https://cic.gov.in/robots.txt | Disallow: /search/
Q | https://cic.gov.in/decision | Both Old and New Decisions

### CIC decision search apps: shell and 503
```json
{"id": "in-cic-decision-search", "cc": "IN", "kind": "appeals", "name": "CIC decisions search (new: dss.cic.gov.in; legacy: dsscic.nic.in cause-list-report-web)", "url": "https://dss.cic.gov.in/citizen-service?tab=decision",
 "search": "http://dsscic.nic.in/cause-list-report-web/view-decision/1  (legacy, decisions from 11 Sep 2016)", "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "decoy", "sample": "https://dss.cic.gov.in/citizen-service?tab=decision (200, 2,127 bytes) and https://dss.cic.gov.in/robots.txt (200, the same 2,127 bytes); http://dsscic.nic.in/cause-list-report-web/view-decision/1 (503 after back-off); https://dsscic.nic.in/robots.txt (transport error)"},
 "use": "None by plain HTTP. The 'new' app is a JavaScript single-page shell (meta description 'CIC Application', scripts under /assets/) that returns identical bytes for any path, including robots.txt; the legacy app answered 503.",
 "limits": "Individual CIC decisions cannot be searched or listed by the crawler; only the landmark-decisions PDF and annual reports (above) are readable. A decision PDF's direct URL, if one is supplied by an author, can still be fetched; none was probed."}
```
(No Q line: `spider.py text` prints nothing for this page because it has no visible text. The cached HTML, read directly, is 2,127 bytes with `<meta name="description" content="CIC Application" />`; the same sha256 is recorded for the /robots.txt URL.)

### RTI Online (record only)
```json
{"id": "in-rtionline-portal", "cc": "IN", "kind": "portal", "name": "RTI Online (DoPT) - where central-government RTI applications and first appeals are filed", "url": "https://rtionline.gov.in/",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": "login required to file; nothing was submitted", "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://rtionline.gov.in/ (landing only); https://rtionline.gov.in/robots.txt -> 404"},
 "use": "Recorded as the filing point. The landing text says the portal is for central public authorities, not State governments, and that CIC's second-appeal portal is integrated with it.",
 "limits": "A filing portal, not a disclosure log: no released responses are published here."}
```
Q | https://rtionline.gov.in/ | Please do not file RTI applications through this portal for the public authorities under the State Governments, including Government of NCT Delhi.

### Abhilekh Patal (National Archives of India)
```json
{"id": "in-abhilekh-patal", "cc": "IN", "kind": "archive", "name": "Abhilekh Patal, Portal for Access to Archives and Learning (National Archives of India)", "url": "https://www.abhilekh-patal.in/",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 202, "result": "decoy", "sample": "https://www.abhilekh-patal.in/ (HTTP 202, empty body) and https://www.abhilekh-patal.in/robots.txt (HTTP 202, empty body)"},
 "use": "None. Both URLs answer 202 Accepted with no body to the identified crawler, which is a bot challenge in everything but name; the spider records 202 as not ok.",
 "limits": "Not retried under another identity and not opened in a browser. NAI holdings can be sought through the site below or by a request to the archive."}
```

### National Archives of India (main site)
```json
{"id": "in-nai-site", "cc": "IN", "kind": "archive", "name": "National Archives of India, official website", "url": "https://nationalarchives.nic.in/",
 "search": null, "api": null, "format": "html",
 "terms": "not read", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://nationalarchives.nic.in/ (187 KB, Hindi/English); https://nationalarchives.nic.in/robots.txt -> 404"},
 "use": "Carries the access rules for public records and the SoP for supplying non-digitised records, and points to the Abhilekh Patal search. Pages beyond the landing were not read.",
 "limits": "No catalogue on this host. No Indian declassification register was found."}
```
## South Africa

### PAIA, original 2000 text (gov.za)
```json
{"id": "za-govza-paia-act", "cc": "ZA", "kind": "law", "name": "Promotion of Access to Information Act 2 of 2000, South African Government document page and Government Gazette PDF", "url": "https://www.gov.za/documents/promotion-access-information-act",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "official government publication; reuse terms not stated on the probed page", "key_required": false, "programs": ["Project Coast"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.gov.za/sites/default/files/gcis_document/201409/a2-000.pdf (45 pages, Gazette No. 20852 of 3 Feb 2000)"},
 "use": "Original Act text; s.41 lets a public body refuse a record whose disclosure could reasonably be expected to prejudice the defence or security of the Republic, and the definitions treat 'a foreign or hostile intelligence operation' as a threat.",
 "limits": "Unamended 2000 text: the gov.za page itself lists amendments only to Act 31 of 2019. The consolidated versions (lawlibrary.org.za, SAFLII) refused the crawler (below)."}
```
Q | https://www.gov.za/documents/promotion-access-information-act | to give effect to the constitutional right of access to any information held by the State and any information that is held by another person and that is required for the exercise or protection of any rights; and
Q | https://www.gov.za/sites/default/files/gcis_document/201409/a2-000.pdf | may refuse a request for access to a record of the body if its disclosure
(Second line is from local PDF text extraction; the OCR layer is imperfect, so only the clean clause is quoted. The s.41(1)(a) heads, 'the defence of the Republic' and 'the security of the Republic', follow it in the same text.)

### Consolidated PAIA on LawLibrary and SAFLII: refused
```json
{"id": "za-lawlibrary-paia", "cc": "ZA", "kind": "law", "name": "PAIA consolidated text on lawlibrary.org.za (and SAFLII mirror)", "url": "https://lawlibrary.org.za/akn/za/act/2000/2/eng@2021-06-30",
 "search": null, "api": null, "format": "html",
 "terms": "robots.txt carries a Content-Signal: ai-train=no, search=yes, ai-input=no, and says these are express reservations of rights under EU Directive 2019/790 Art. 4", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://lawlibrary.org.za/akn/za/act/2000/2/eng@2021-06-30 (403); https://www.saflii.org/za/legis/consol_act/poatia2000366/index.html (403); https://www.saflii.org/robots.txt (403)"},
 "use": "None for the crawler. Recorded so the next sweep does not retry. The gov.za original (above) is the readable text.",
 "limits": "Two refusals and a stated reservation against AI input; the crawler does not work around either."}
```
Q | https://lawlibrary.org.za/robots.txt | Content-Signal: ai-train=no, search=yes, ai-input=no

### Information Regulator
```json
{"id": "za-inforegulator-paia", "cc": "ZA", "kind": "appeals", "name": "Information Regulator (South Africa), PAIA annual-report portal and PAIA assessment report", "url": "https://inforegulator.org.za/paia-annual-report/",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "not stated on the probed pages", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://inforegulator.org.za/wp-content/uploads/2026/03/PAIA_2024-25_-_Final_Annual_Assessment_Report.docx.pdf (53 pages)"},
 "use": "The Regulator's page explains the s.32 annual-report duty (portal opens 1 April, deadline 30 June); the 2024/25 assessment report lists, by body, who did and did not file (a compliance map; Part F summary and a 'Bodies which did not submit' list).",
 "limits": "No searchable database of PAIA complaint outcomes or enforcement notices was found on the pages probed. The e-services portal itself (eservices.inforegulator.org.za) was not probed (account-gated filing). robots.txt only bars /wp-admin/."}
```
Q | https://inforegulator.org.za/paia-annual-report/ | In terms of Section 32 of PAIA, the Information Officer (“IO”) of every public body must annually submit to the regulator a report on access to information requests received and processed by the body.
Q | https://inforegulator.org.za/paia-annual-report/ | 30 June annually: Deadline for submission of PAIA Annual Reports.
Q | https://inforegulator.org.za/robots.txt | Disallow: /wp-admin/

### SAHA, Freedom of Information Programme collection
```json
{"id": "za-saha-foip-al2878", "cc": "ZA", "kind": "disclosure-log", "name": "South African History Archive, Freedom of Information Programme Collection (AL2878)", "url": "https://www.saha.org.za/collections/the_freedom_of_information_project.htm",
 "search": null, "api": null, "format": "html",
 "terms": "'This collection is open for research. Use Restrictions: User restrictions may apply. See SAHA copyright statement.'", "key_required": false, "programs": ["Project Coast", "apartheid security records"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.saha.org.za/collections/AL2878/b.htm (B, Non Special Projects: B01 public bodies, B02 private bodies)"},
 "use": "Catalogue (static HTML tree: /collections/AL2878/a.htm, b.htm and below) of what PAIA requests by SAHA released, apartheid security-establishment records among them. This is South Africa's civil-society request log.",
 "limits": "The collection is largely paper held in Johannesburg (23.9 linear metres); only the finding-aid tree is online. SAHA serves its homepage at /robots.txt with HTTP 200 (no robots file; treated as 'no rules', title 'SAHA - South African History Archive - Home'); the crawler still keeps its own pacing."}
```
Q | https://www.saha.org.za/collections/the_freedom_of_information_project.htm | The Freedom of Information Programme (FOIP) collection comprises copies of materials released pursuant to the Promotion of Access to Information Act (PAIA).
Q | https://www.saha.org.za/collections/the_freedom_of_information_project.htm | Extent: 23.9 linear metres (239 archival boxes.)
Q | https://www.saha.org.za/collections/AL2878/b.htm | B :: Non Special Projects

### SAHA, Chemical and Biological Warfare Project collection (AL2922)
```json
{"id": "za-saha-cbw-al2922", "cc": "ZA", "kind": "program", "name": "SAHA, The Chemical and Biological Warfare (CBW) Project Collection (AL2922), including 'Project Coast Records'", "url": "https://www.saha.org.za/collections/AL2922/a.htm",
 "search": null, "api": null, "format": "html",
 "terms": "see SAHA copyright statement (not read)", "key_required": false, "programs": ["Project Coast"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.saha.org.za/collections/AL2922/a.htm"},
 "use": "Finding aid with four series: A1 correspondence regarding TRC documents 1999-2000, A2 the TRC hearing into CBW, A3 Project Coast records, A4 press clippings.",
 "limits": "The page lists series titles only; the listing itself ('View the listing for this collection') was not opened, and the records are held in Johannesburg."}
```
Q | https://www.saha.org.za/collections/AL2922/a.htm | A3 :: PROJECT COAST RECORDS

### TRC report (justice.gov.za)
```json
{"id": "za-trc-final-report", "cc": "ZA", "kind": "program", "name": "Truth and Reconciliation Commission of South Africa, Final Report (justice.gov.za)", "url": "https://justice.gov.za/trc/report/index.htm",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "not stated on the probed page", "key_required": false, "programs": ["Project Coast", "TRC"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://justice.gov.za/trc/report/finalreport/Volume%202.pdf (1.7 MB, 200 application/pdf)"},
 "use": "Direct PDFs of Volumes 1-7 (index lists Volume 1 through 5, Volume 6 sections 1-6, Volume 7 parts 1-5). Volume 2, Chapter 6 is the 'Special Investigation into Project Coast'.",
 "limits": "Volume 2's PDF was fetched but its text was not extracted; the Chapter 6 quotes below come from the sabctrc.saha.org.za HTML mirror and the nuke.fas.org copy. robots.txt bars /search/ on justice.gov.za, so the site's own search is closed to the crawler; browse by link instead."}
```
Q | https://justice.gov.za/trc/report/index.htm | TRC Final Report - Volume 2 (1.7 MB)
Q | https://justice.gov.za/robots.txt | Disallow: /search/

### TRC hearings: Chemical and Biological Warfare (Project Coast)
```json
{"id": "za-trc-cbw-hearings", "cc": "ZA", "kind": "program", "name": "TRC Special Hearing: Chemical and Biological Warfare, Cape Town, 8 June-31 July 1998 (transcripts)", "url": "https://justice.gov.za/trc/special/index.htm",
 "search": null, "api": null, "format": "html",
 "terms": "not stated on the probed pages", "key_required": false, "programs": ["Project Coast"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://justice.gov.za/trc/special/cbw/cbw18.htm (8 July 1998, Day 2, 207 KB)"},
 "use": "Day files cbw1.htm to cbw22.htm are plain-HTML transcripts; a second copy with metadata is on the SAHA-run mirror sabctrc.saha.org.za (export/hearinghtml.php?id=NNNNN, original path /originals/special/cbw/cbwN.htm).",
 "limits": "Transcripts are testimony, taken under oath, of persons some of whom are living; no name is carried into this registry. The hearings' own record of destroyed documents is in Chapter 6 (below), not re-derived here. sabctrc.saha.org.za has no robots.txt (the URL returns its homepage)."}
```
Q | https://justice.gov.za/trc/special/cbw/cbw1.htm | CHEMICAL AND BIOLOGICAL WARFARE HEARING
Q | https://sabctrc.saha.org.za/export/hearinghtml.php?id=56266 | Original File https://sabctrc.saha.org.za/originals/special/cbw/cbw18.htm
Q | https://sabctrc.saha.org.za/reports/volume2/chapter6/part3/subsection1.htm | The Commission's hearings into South Africa's Chemical and Biological Warfare programme (the CBW programme, also known as Project Coast) during the 1980s and early 1990s, were held in Cape Town in June and July 1998.

### TRC Volume 2 Chapter 6: Special Investigation into Project Coast
```json
{"id": "za-trc-vol2-ch6-project-coast", "cc": "ZA", "kind": "program", "name": "TRC Final Report Vol. 2, Ch. 6 'Special Investigation into Project Coast' (HTML mirrors)", "url": "https://sabctrc.saha.org.za/reports/volume2/chapter6/part3/subsection1.htm",
 "search": null, "api": null, "format": "html",
 "terms": "not stated on the probed pages", "key_required": false, "programs": ["Project Coast"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://nuke.fas.org/guide/rsa/cbw/2chap6c.htm (38 KB, a second HTML copy)"},
 "use": "The Commission's findings on the programme as HTML. This is where the report's line 'most documents destroyed' can be checked against the Commission's own wording.",
 "limits": "polity.org.za's copy answered 403 (refusal). The destruction-of-documents passages were located but the full Chapter 6 was not read here, so the report's 'burned by [the programme head's] handlers' wording is NOT confirmed or refuted by this probe."}
```
Q | https://sabctrc.saha.org.za/reports/volume2/chapter6/part3/subsection1.htm | The scientific research undertaken by the project was pedestrian, misdirected, ineffectual and unproductive.
Q | https://nuke.fas.org/guide/rsa/cbw/2chap6c.htm | Agreed to the destruction of documents describing the activities and the financial aspects of these programmes.
(That last bullet in the Commission's findings is about a named official; the name is not carried here. It is a finding about conduct, not a statement that "most documents" were destroyed.)

### TRC amnesty hearings and decisions
```json
{"id": "za-trc-amnesty", "cc": "ZA", "kind": "appeals", "name": "TRC Amnesty Hearings and Decisions (transcripts 1996-2001)", "url": "https://justice.gov.za/trc/amntrans/index.htm",
 "search": null, "api": null, "format": "html",
 "terms": "not stated on the probed page", "key_required": false, "programs": ["TRC"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://justice.gov.za/trc/amntrans/index.htm; sibling https://justice.gov.za/trc/hrvtrans/index.htm (Human Rights Violations hearings)"},
 "use": "Year indexes of amnesty hearing transcripts (1996-2000) and decision transcripts (1996-2001), with a status table as at 1 Nov 2000.",
 "limits": "Index only was read; a guessed path (/trc/amntrans/1998/index.htm) was a 404, so follow the page's own links. The page warns that the 'result' field should not be used for statistics and that names are often misspelt."}
```
Q | https://justice.gov.za/trc/amntrans/index.htm | Please note that the 'result' field should not be used for statistical purposes.
## Brazil

### Lei de Acesso à Informação (Lei 12.527/2011), Câmara dos Deputados consolidated text
```json
{"id": "br-camara-lai-consolidated", "cc": "BR", "kind": "law", "name": "Lei nº 12.527, de 18 de novembro de 2011 (Lei de Acesso à Informação), texto atualizado, Câmara dos Deputados", "url": "https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html",
 "search": null, "api": null, "format": "html",
 "terms": "official legislative database; reuse terms not read. robots.txt disallows search/form paths and individual deputies' pages, not /legin/", "key_required": false, "programs": ["dictatorship files (1964-1985)"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html (110 KB); original-publication copy .../lei-12527-18-novembro-2011-611802-publicacaooriginal-134287-pl.html (200)"},
 "use": "Full current text. Art. 21 (sole paragraph): information on human-rights violations by public agents or on their orders 'cannot be the object of access restriction'; Art. 24: maximum classification periods 25 (ultra-secret), 15 (secret), 5 (reserved) years; Art. 35 creates the Joint Commission for Reassessment of Information (CMRI), which reviews secret and ultra-secret classifications.",
 "limits": "Planalto's own copy (https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm) could not be reached from this session (transport error 'ProxyError', ledger row 02:44 UTC), so this is the Câmara's copy. The law names no intelligence service; the exemption is by classification, not by agency. Art. 31 limits personal information to 100 years regardless of classification."}
```
Q | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html | As informações ou documentos que versem sobre condutas que impliquem violação dos direitos humanos praticada por agentes públicos ou a mando de autoridades públicas não poderão ser objeto de restrição de acesso.
Q | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html | I - ultrassecreta: 25 (vinte e cinco) anos; II - secreta: 15 (quinze) anos; e III - reservada: 5 (cinco) anos.
Q | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html | terão seu acesso restrito, independentemente de classificação de sigilo e pelo prazo máximo de 100 (cem) anos a contar da sua data de produção
Q | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html | É instituída a Comissão Mista de Reavaliação de Informações, que decidirá, no âmbito da administração pública federal, sobre o tratamento e a classificação de informações sigilosas

### Planalto copy: unreachable
```json
{"id": "br-planalto-lai", "cc": "BR", "kind": "law", "name": "planalto.gov.br, Lei 12.527 and Decreto 7.724/2012", "url": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": null, "result": "not_reachable", "sample": "transport error: ProxyError 'Unable to connect to proxy' (the session's egress), ledger row 02:44 UTC; a connectivity-only curl to https://www.planalto.gov.br/ also returned nothing"},
 "use": "None from this session.",
 "limits": "Not a refusal by Planalto; the session's egress path does not reach the host. Not worked around."}
```

### gov.br Acesso à Informação (federal LAI portal) and the monitoring pages
```json
{"id": "br-gov-acessoainformacao", "cc": "BR", "kind": "portal", "name": "Acesso à Informação (gov.br), federal LAI portal and CGU monitoring reports", "url": "https://www.gov.br/acessoainformacao/pt-br",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "gov.br pages state a Creative Commons licence in the footer (the Memórias Reveladas page reads 'Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada'; this page's footer was not separately read)", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.gov.br/acessoainformacao/pt-br (66 KB); https://www.gov.br/robots.txt (200)"},
 "use": "Landing for LAI guidance; CGU's per-ministry transparência passiva monitoring PDFs sit under /acessoainformacao/pt-br/lai-para-sic/ (one search hit, not fetched).",
 "limits": "Landing only; no request data here."}
```

### Busca LAI / Informa.BR and Fala.BR: JavaScript shells
```json
{"id": "br-buscalai-informa-br", "cc": "BR", "kind": "disclosure-log", "name": "Busca LAI (answers to federal LAI requests), now 'Informa.BR: Plataforma de Transparência e Acesso à Informação'; and Fala.BR (request platform)", "url": "https://buscalai.cgu.gov.br/",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "decoy", "sample": "https://buscalai.cgu.gov.br/ and https://buscalai.cgu.gov.br/robots.txt: both 200, both the identical 2,844-byte shell; https://falabr.cgu.gov.br/ redirects to /web/home, and /web/home and /web/dadosabertoslai are the identical 1,405-byte shell (title 'Fala.BR - Plataforma Integrada de Ouvidoria e Acesso à Informação')"},
 "use": "None by plain HTTP. These are JavaScript applications: the Busca LAI shell says 'Essa página requer javascript para funcionar corretamente.' and answers every path, robots.txt included, with the same bytes.",
 "limits": "The published answers to individual requests, and the Fala.BR open-data download tab the CGU page points to, cannot be listed by the crawler. Fala.BR /robots.txt is a 404. The CSV/ZIP files that these tabs serve were not located (see dados.gov.br)."}
```
Q | https://buscalai.cgu.gov.br/ | Essa página requer javascript para funcionar corretamente.
(That the page links https://falabr.cgu.gov.br/web/dadosabertoslai was read from the cached HTML's links; `spider.py text` does not print URLs.)

### dados.gov.br
```json
{"id": "br-dados-gov-br", "cc": "BR", "kind": "disclosure-log", "name": "Portal Brasileiro de Dados Abertos (dados.gov.br), CGU datasets: e-SIC / LAI requests, QualiLAI", "url": "https://dados.gov.br/",
 "search": "https://dados.gov.br/dataset?q={q}  (probed with the CGU organisation filter)", "api": null, "format": "html",
 "terms": "not read", "key_required": "API use appears to need a key (not probed; not registered)", "programs": [],
 "probe": {"date": "2026-10-24", "status": 401, "result": "refused", "sample": "https://dados.gov.br/ -> 200 ('Portal de Dados Abertos', 9,632 bytes, a JavaScript page); https://dados.gov.br/robots.txt -> 401; https://dados.gov.br/dataset/dados-referentes-ao-e-sic -> 401 (after the back-off ladder); https://dados.gov.br/dataset?organization=ministerio-da-transparencia-e-controladoria-geral-da-uniao-cgu -> 401; https://dados.gov.br/dataset/relatorios-quali-lai -> 401"},
 "use": "None for the crawler today. Dataset pages for the CGU's LAI request data (found by search, not by fetch: 'e-SIC', 'Relatórios QualiLAI') answer 401.",
 "limits": "Refusal recorded; not retried under another identity. The CGU's LAI request exports therefore remain unlocated as machine-readable files; a person with a key or a browser could fetch them."}
```
Q | https://dados.gov.br/ | Portal de Dados Abertos Essa página requer javascript para funcionar corretamente.

### CGU open-data page
```json
{"id": "br-cgu-dados-abertos", "cc": "BR", "kind": "disclosure-log", "name": "CGU Dados Abertos page (gov.br) listing the Fala.BR module data and Portal da Transparência downloads", "url": "https://www.gov.br/cgu/pt-br/acesso-a-informacao/dados-abertos",
 "search": null, "api": null, "format": "html",
 "terms": "not read", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.gov.br/cgu/pt-br/acesso-a-informacao/dados-abertos (150 KB); https://dadosabertos.cgu.gov.br/ -> transport error (unreachable)"},
 "use": "The index of CGU datasets, with 'Fala.BR - Módulo Acesso' and 'Estatísticas LAI' among the entries, and download links under portaltransparencia.gov.br/download-de-dados/ for sanction lists.",
 "limits": "The Fala.BR data link leads to the JavaScript shell above. The download links for the sanction lists (CEIS, CNEP, CEAF) were not fetched and are not part of the LAI question."}
```
Q | https://www.gov.br/cgu/pt-br/acesso-a-informacao/dados-abertos | Fala.BR - Módulo Acesso

### Arquivo Nacional: databases (SIAN and "consulta")
```json
{"id": "br-arquivo-nacional-sian", "cc": "BR", "kind": "archive", "name": "Arquivo Nacional, bases de dados (SIAN) and remote service (consulta.an.gov.br)", "url": "https://www.gov.br/arquivonacional/pt-br/servicos/bases-de-dados",
 "search": "https://sian.an.gov.br/", "api": null, "format": "html",
 "terms": "not read", "key_required": false, "programs": ["SNI and other dictatorship-era holdings"],
 "probe": {"date": "2026-10-24", "status": 200, "result": "decoy", "sample": "https://www.gov.br/arquivonacional/pt-br/servicos/bases-de-dados (200, lists 'Sian', 'Outras bases de dados', 'Tutoriais'); https://sian.an.gov.br/ (200, 50,614 bytes) and https://consulta.an.gov.br/ (200, 45,429 bytes) both return a human-verification page"},
 "use": "The gov.br pages (bases de dados, 'Bases de dados e instrumentos de pesquisa', 'Dados abertos') describe the databases and link out; the catalogue itself is not reachable.",
 "limits": "SIAN and consulta.an.gov.br each answer HTTP 200 with a page that says 'Please enable JavaScript to view the page content. Your support ID is: …' and asks 'What code is in the image?' - a bot challenge presented as a document. It is not solved and not worked around."}
```
Q | https://sian.an.gov.br/ | This question is for testing whether you are a human visitor and to prevent automated spam submission.
Q | https://www.gov.br/arquivonacional/pt-br/servicos/bases-de-dados | Bases de dados Sian Outras bases de dados Tutoriais

### Memórias Reveladas
```json
{"id": "br-memorias-reveladas", "cc": "BR", "kind": "archive", "name": "Memórias Reveladas (Centro de Referência das Lutas Políticas no Brasil, 1964-1985), Arquivo Nacional", "url": "https://www.gov.br/memoriasreveladas/pt-br",
 "search": "https://www.gov.br/memoriasreveladas/pt-br/faca-uma-pesquisa-em-nossa-base-de-dados", "api": null, "format": "html",
 "terms": "gov.br footer: 'Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada'", "key_required": false, "programs": ["SNI and dictatorship-era holdings", "Comissão Nacional da Verdade"],
 "probe": {"date": "2026-10-24", "status": 401, "result": "refused", "sample": "https://www.gov.br/memoriasreveladas/pt-br -> 200 (238 KB, title 'Português (Brasil)', thin: services widgets and footer only); .../faca-uma-pesquisa-em-nossa-base-de-dados -> 401; .../assuntos/comissao-nacional-da-verdade -> 404; https://memoriasreveladas.arquivonacional.gov.br/ -> transport error (unreachable)"},
 "use": "The landing is reachable (it is a client-rendered React app, hence thin) and carries the licence; the database page that the Arquivo Nacional's own pages call 'Banco de Dados Memórias Reveladas' refused the crawler.",
 "limits": "No SNI catalogue or document could be read. Whether SNI archives are 'incomplete' because of transition-era destruction (the report's claim) is not addressed by anything fetched here."}
```
Q | https://www.gov.br/memoriasreveladas/pt-br | Todo o conteúdo deste site está publicado sob a licença Creative Commons Atribuição-SemDerivações 3.0 Não Adaptada

### Comissão Nacional da Verdade, final report
```json
{"id": "br-cnv-final-report", "cc": "BR", "kind": "program", "name": "Comissão Nacional da Verdade, Relatório Final (3 volumes, Dec 2014)", "url": "http://cnv.memoriasreveladas.gov.br/images/pdf/relatorio/volume_1_digital.pdf",
 "search": null, "api": null, "format": "pdf",
 "terms": "n/a", "key_required": false, "programs": ["Comissão Nacional da Verdade", "dictatorship files"],
 "probe": {"date": "2026-10-24", "status": null, "result": "not_reachable", "sample": "http://cnv.memoriasreveladas.gov.br/ and the Volume 1 PDF path (the path was given by a USP repository citation found by search, not by a CNV page): transport errors, ledger rows 02:50 and 02:54 UTC"},
 "use": "None from this session. The host did not answer the spider; the URL is recorded for a later try, and a gov.br-hosted copy was not found (the gov.br CNV subject page was a 404).",
 "limits": "Unreachable, not refused. Volume contents and page counts are unread; nothing in this file characterises the report."}
```
## China

**What does not exist, stated plainly.** The Regulations (as read) give no independent information commissioner (complaints go to the superior organ or the OGI competent department, then reconsideration or suit, Art. 51), no intelligence-service schedule (the state-secrets exclusion applies to everything, not to named agencies), and no searchable archive of declassified security files or disclosure log of released responses was found. The OGI Regulations are a duty on administrative organs to publish "government information"; Article 14 removes state secrets from that duty entirely. The report's line "No declassification mechanism exists" is wrong as a statement of law: the State Secrets Law (2024 revision) fixes maximum secrecy periods (绝密 30 years, 机密 20, 秘密 10) and says information whose period has run "自行解密" (declassifies by itself) on expiry, with annual review (Arts. 20, 24). What is true is narrower and is what matters to the crawler: the statute declassifies on paper, but no public register of what has declassified, no request-and-review channel for it, and no searchable declassified archive was found; the foreign ministry archive's own page lists no public finding aid. The proxy for primary material is therefore foreign-held: the Wilson Center Digital Archive (host unreachable from this session, below), and the Mitrokhin papers (Churchill Archives, other beat).

### Regulations on Open Government Information (2019), gov.cn
```json
{"id": "cn-gov-ogi-regulations-2019", "cc": "CN", "kind": "law", "name": "中华人民共和国政府信息公开条例 (State Council Order No. 711, 15 Apr 2019, in force 15 May 2019)", "url": "https://www.gov.cn/zhengce/content/2019-04/15/content_5382991.htm",
 "search": null, "api": null, "format": "html",
 "terms": "official State Council text; reuse terms not stated on the probed page", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.gov.cn/zhengce/content/2019-04/15/content_5382991.htm"},
 "use": "Official Chinese text. Art. 14: state secrets, information whose disclosure laws and regulations forbid, and information whose release could endanger national security, public safety, economic security or social stability are 'not to be disclosed'. Art. 51: complaint to the superior organ, administrative reconsideration or suit.",
 "limits": "Chinese only on the official site. No intelligence-service schedule and no independent commissioner in the text. gov.cn robots.txt carries a list of Disallow lines for old '2016' site sections and 'Allow: /1'; the crawler fetched this page without a robots block."}
```
Q | https://www.gov.cn/zhengce/content/2019-04/15/content_5382991.htm | 第十四条 　依法确定为国家秘密的政府信息，法律、行政法规禁止公开的政府信息，以及公开后可能危及国家安全、公共安全、经济安全、社会稳定的政府信息，不予公开。
Q | https://www.gov.cn/zhengce/content/2019-04/15/content_5382991.htm | 现公布修订后的《中华人民共和国政府信息公开条例》，自2019年5月15日起施行。

### Same Regulations, English (unofficial)
```json
{"id": "cn-chinalawtranslate-ogi-2019", "cc": "CN", "kind": "law", "name": "Open Government Information Regulations of the P.R.C. (2019), China Law Translate (crowdsourced)", "url": "https://www.chinalawtranslate.com/en/ogi2019/",
 "search": null, "api": null, "format": "html",
 "terms": "crowdsourced translation project; reuse terms not read; robots.txt has per-bot content rules (the identified crawler was served)", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.chinalawtranslate.com/en/ogi2019/ -> redirected to /en/open-government-information-regulations-of-the-p-r-c-2019/"},
 "use": "English text for readers; Article 14 and Article 51 are in the first screens.",
 "limits": "Not an official translation (the site describes itself as a crowdsourced project). Cite the Chinese text for anything that matters."}
```
Q | https://www.chinalawtranslate.com/en/ogi2019/ | CLT is a crowdsourced, crowdfunded legal translation project that enables English speaking people to better understand Chinese law.
Q | https://www.chinalawtranslate.com/en/ogi2019/ | Government information that is lawfully designated as state secrets, government information that laws and regulations prohibit disclosure of, as well as government information that might endanger national security, public safety, economic security, or social stability after release, is not to be disclosed.
Q | https://www.chinalawtranslate.com/en/ogi2019/ | Article 51: Where citizens, legal persons, or other organizations find that administrative organs have violated their lawful rights and interests during open government information work, they may make a complaint or report to the administrative organ at the level above or the competent department for open government information work

### The 2007 Regulations (in force 1 May 2008), CECC copy
```json
{"id": "cn-cecc-ogi-2007", "cc": "CN", "kind": "law", "name": "Regulations on Open Government Information, 2007 text (Yale China Law Center translation, hosted by the US Congressional-Executive Commission on China)", "url": "https://www.cecc.gov/resources/legal-provisions/regulations-of-the-peoples-republic-of-china-on-open-government",
 "search": null, "api": null, "format": "html",
 "terms": "US-government-hosted page; the translation is credited to Yale Law School's China Law Center", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.cecc.gov/resources/legal-provisions/regulations-of-the-peoples-republic-of-china-on-open-government"},
 "use": "The original regime (adopted 5 April 2007; in force 1 May 2008) with Chinese and English; lets the crawler date what the 2019 revision changed.",
 "limits": "Superseded by the 2019 revision."}
```
Q | https://www.cecc.gov/resources/legal-provisions/regulations-of-the-peoples-republic-of-china-on-open-government | Regulations of the People’s Republic of China on Open Government Information (Adopted by the State Council on April 5, 2007; Effective May 1, 2008)

### State Secrets Law (2024 revision)
```json
{"id": "cn-12371-state-secrets-law-2024", "cc": "CN", "kind": "law", "name": "中华人民共和国保守国家秘密法 (revised 27 Feb 2024, in force 1 May 2024), full text on 12371.cn", "url": "https://www.12371.cn/2024/02/27/ARTI1709036758179382.shtml",
 "search": null, "api": null, "format": "html",
 "terms": "Communist Party members' website reprint; robots.txt disallows only /download_busy/", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.12371.cn/2024/02/27/ARTI1709036758179382.shtml"},
 "use": "Art. 20 sets maximum secrecy periods; Art. 24 says a secret whose period has expired 'declassifies by itself' and requires annual review: the statutory basis for the correction above.",
 "limits": "A reprint, not the official database: the National Laws and Regulations Database (flk.npc.gov.cn) answered 403 on the page and on /robots.txt (refusal, recorded). The statute describes the rule; it says nothing about what has in fact been released."}
```
Q | https://www.12371.cn/2024/02/27/ARTI1709036758179382.shtml | 国家秘密的保密期限，除另有规定外，绝密级不超过三十年，机密级不超过二十年，秘密级不超过十年。
Q | https://www.12371.cn/2024/02/27/ARTI1709036758179382.shtml | 国家秘密的保密期限已满的，自行解密。
Q | https://www.12371.cn/robots.txt | Disallow: /download_busy/

### National Laws and Regulations Database: refused
```json
{"id": "cn-flk-npc", "cc": "CN", "kind": "law", "name": "国家法律法规数据库 (National Laws and Regulations Database), flk.npc.gov.cn", "url": "https://flk.npc.gov.cn/",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 403, "result": "refused", "sample": "https://flk.npc.gov.cn/ (403) and https://flk.npc.gov.cn/robots.txt (403)"},
 "use": "None for the crawler.",
 "limits": "Refusal recorded; not retried."}
```

### Annual OGI reports: format rule and a sample
```json
{"id": "cn-ogi-annual-report-format-2021", "cc": "CN", "kind": "disclosure-log", "name": "OGI annual-report format (State Council General Office OGI Office, 国办公开办函〔2021〕30号) and an agency's 2024 annual report", "url": "https://www.gov.cn/zhengce/content/2021-09/29/content_5639620.htm",
 "search": null, "api": null, "format": "html+pdf",
 "terms": "official publications; reuse terms not stated", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.spt.gov.cn/xxgk/zfxxgknb/2024/dwzfpcjgjqzfgzbmzssydwzfxxgkgzndbg/202501/P020250123393917367030.pdf (248 KB application/pdf)"},
 "use": "Every administrative organ publishes its own annual OGI report on its own site, each following this format (totals of applications received, granted, refused, plus reconsideration and litigation counts); these are the only 'disclosure statistics' China offers, one PDF per organ per year.",
 "limits": "No consolidated national report was found (a search for the State Council General Office's own report returned only agency and local reports; the 'national' OGI platform https://www.gov.cn/zhengce/xxgk/ is a JavaScript search shell that prints '抱歉，没有找到相关结果' with no query run; https://www.gov.cn/zhengce/zhengceku/ answered 403; xxgk.www.gov.cn was refused at the proxy). The sample report was not parsed for numbers."}
```
Q | https://www.gov.cn/zhengce/xxgk/ | 抱歉，没有找到相关结果

### Ministry of Foreign Affairs, Bureau of Archives
```json
{"id": "cn-mfa-bureau-of-archives", "cc": "CN", "kind": "archive", "name": "Ministry of Foreign Affairs of the P.R.C., Bureau of Archives (档案馆)", "url": "https://www.mfa.gov.cn/eng/wjb/zzjg_663340/dag_665324/",
 "search": null, "api": null, "format": "html",
 "terms": "n/a", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": 200, "result": "ok", "sample": "https://www.mfa.gov.cn/wjb_673085/zzjg_673183/dag_674733/ (Chinese page, 200)"},
 "use": "Confirms who holds the diplomatic records; lists a telephone contact.",
 "limits": "The page gives no online catalogue, no finding aid and no declassification listing. https://www.mfa.gov.cn/robots.txt returns a '系统维护' (system maintenance) HTML page with HTTP 200, i.e. there is no robots file to read."}
```
Q | https://www.mfa.gov.cn/eng/wjb/zzjg_663340/dag_665324/ | The Bureau permanently houses diplomatic records accumulated since the founding of the People's Republic of China.

### Wilson Center Digital Archive (the proxy for Chinese primary documents)
```json
{"id": "int-wilson-digital-archive", "cc": "CN", "kind": "archive", "name": "Wilson Center Digital Archive (International History Declassified), Chinese-sourced collections", "url": "https://digitalarchive.wilsoncenter.org/",
 "search": "https://digitalarchive.wilsoncenter.org/search?q={q}", "api": null, "format": "html",
 "terms": "not read", "key_required": false, "programs": [],
 "probe": {"date": "2026-10-24", "status": null, "result": "not_reachable", "sample": "https://digitalarchive.wilsoncenter.org/ and /robots.txt: transport error 'ProxyError: Unable to connect to proxy' (ledger rows 02:40, 02:44 and 02:49 UTC)"},
 "use": "Could not be probed. The parent site is reachable: https://www.wilsoncenter.org/program/history-and-public-policy-program answered 200 and its robots.txt answered (304, from an earlier fetch of the same file).",
 "limits": "This is a refusal at the session's egress proxy, not a refusal by the Wilson Center; it is recorded as a null and not worked around. Whether the archive's robots.txt would admit the crawler is unknown. Until it is reachable, nothing in this registry supplies Chinese-origin primary documents."}
```
## Report lines this beat's reading bears on (flagged, not edited)
These are checks of the table rows in `xvi-the-pattern-is-not-american-international` against the texts fetched above. Nothing in the repository was touched.
- **India, "RAW and IB exempt".** s.24(1) of the RTI Act takes the Second Schedule organisations (IB; RAW with its Aviation Research Centre; and others) out of the Act, but the proviso keeps "the allegations of corruption and human rights violations" in, and human-rights information from them is released only after the Central Information Commission's approval, within 45 days. The row omits both provisos. The "80+ RTI activists killed" figure was not examined here.
- **China, "No declassification mechanism exists".** The 2024 State Secrets Law, Art. 20 and Art. 24, sets maximum periods (绝密 30, 机密 20, 秘密 10 years) and says a secret whose period has expired "declassifies by itself", with an annual review. The statute provides for declassification; what was not found is any public register, request channel or searchable archive of declassified security files. The row also cites the Law as "amended 2010": the current text is the revision of 27 Feb 2024 in force 1 May 2024 (per the reprint read); the OGI Regulations were adopted 2007 (in force 1 May 2008) and revised 2019 (State Council Order 711, in force 15 May 2019), so "2008" is the commencement of the first version. "Life imprisonment" for unauthorised disclosure was not checked.
- **Japan, "Designated Secrets Act (2013) allows 60-year classification".** The Act caps a designation at 30 years, and Cabinet approval can extend it to a total of 60, "ただし" except for listed categories (one example: information provided by a foreign government on condition of designation beyond 60 years), which are outside that cap.
- **Japan, "Unit 731 records partially surfaced through U.S. FOIA, not Japanese disclosure".** The American side is documented (NARA IWG compilation under P.L. 106-657). The Japanese side is not empty: the National Archives of Japan's own catalogue returns 155 entries for 防疫給水部 and JACAR returns 183 for 石井部隊. What those entries are was not opened, so this neither confirms nor refutes the row; it means the sentence cannot say "not Japanese disclosure" without looking.
- **Japan, "1999 (effective 2001)".** The Act is Act No. 42 of 14 May 1999 (JLT page); the 2001 effective date was not verified here.
- **South Africa, "Project Coast records mostly burned by [the programme head's] handlers before TRC hearings" (the row names him; he is living).** The TRC's Chapter 6 findings include that a named senior official "agreed to the destruction of documents describing the activities and the financial aspects of these programmes"; the phrase "mostly burned", "handlers", and a destruction date were not found in the passages read. Verify against Chapter 6 in full before the sentence stays. The "acquitted on 67 charges in 2002" figure was not examined.
- **Brazil, "SNI archives still incomplete - documents destroyed during transition".** Not addressed by anything fetched (the Arquivo Nacional databases and the CNV report both refused or were unreachable). What the LAI does say is not in the row: Art. 21's sole paragraph bars restricting access to information on human-rights violations by public agents.

## Decoy candidates for hosts.json
| host | what it serves | how to match | why |
|---|---|---|---|
| laws.e-gov.go.jp (everything outside `/api/`) | 800-byte JS shell for any path, `/law/411AC0000000042` and `/robots.txt` alike | decoy title "e-Gov 法令検索", 800 bytes | A 200 with no law text; `/api/2/...` JSON is the working path |
| sian.an.gov.br | 50,614-byte human-verification page, HTTP 200 | marker `Your support ID is`, blank title | Bot challenge presented as a document |
| consulta.an.gov.br | 45,429-byte human-verification page, HTTP 200 | marker `Your support ID is`, blank title | Same shape (F5-style) as SIAN |
| buscalai.cgu.gov.br | 2,844-byte JS shell, identical for `/` and `/robots.txt` | title "Informa.BR: Plataforma de Transparência e Acesso à Informação", 2,844 bytes | Answers every path with the same bytes |
| falabr.cgu.gov.br | 1,405-byte JS shell; `/web/home` and `/web/dadosabertoslai` identical | title "Fala.BR - Plataforma Integrada de Ouvidoria e Acesso à Informação", 1,405 bytes | The "open data" tab is the shell, not a file |
| dss.cic.gov.in | 2,127-byte React shell, identical for `?tab=decision` and `/robots.txt` (sha256 `9b27b9f0fd33…`) | blank title, marker `content="CIC Application"` | CIC decisions search is not readable by plain HTTP |
| www.mfa.gov.cn (`/robots.txt` only) | 54 KB maintenance page, HTTP 200, redirected to /web/system/index_17321.shtml | title "系统维护_中华人民共和国外交部" | Not a robots file |
| www.gov.cn `/zhengce/xxgk/` | 226 KB JS search shell that prints "抱歉，没有找到相关结果" before any query | title "政府信息公开平台_中国政府网" | A search page that returns "no results" for the crawler |
| www.jacar.archives.go.jp `/aj/search` | not a host decoy: the parameter `keyword=` is ignored and the page reports the whole corpus, 検索結果数 2481992 件 | guard in code: reject a result whose count equals the unfiltered total; use `kw0` | A 200 that answers a different question |
| www.abhilekh-patal.in | HTTP 202 with an empty body on `/` and `/robots.txt` | status 202, 0 bytes | Already non-ok in the spider (no body); listed so it is not treated as "reachable" |

## Nulls
- **Refused (HTTP 403):** koukai-hogo-db.soumu.go.jp (page and robots), lawlibrary.org.za (Act), www.saflii.org (Act and robots), www.polity.org.za (TRC Ch. 6 copy), www.indiacode.nic.in (RTI Act handle and robots), flk.npc.gov.cn (page and robots), www.gov.cn `/zhengce/zhengceku/`.
- **Refused (HTTP 401):** dados.gov.br `/robots.txt` and its dataset pages (e-SIC / LAI datasets; CGU organisation list), gov.br Memórias Reveladas database page and `/assuntos`.
- **503 after back-off:** dsscic.nic.in decision search (legacy CIC app).
- **Robots-disallowed:** catalog.archives.gov (API and robots.txt), as for all NARA Catalog calls; jacar.archives.go.jp and digital.archives.go.jp `/contentDownload/*`; cic.gov.in `/search/`; justice.gov.za `/search/`.
- **Challenge pages with HTTP 200 or 202:** see the decoy table (Arquivo Nacional SIAN and consulta, Abhilekh Patal, CIC decision app, Busca LAI, Fala.BR).
- **Unreachable from this session (transport error after the full back-off ladder, not a refusal by the site):** rti.gov.in (connection reset), www.planalto.gov.br (proxy error), digitalarchive.wilsoncenter.org (proxy error), cnv.memoriasreveladas.gov.br, memoriasreveladas.arquivonacional.gov.br, dadosabertos.cgu.gov.br, dsscic.nic.in `/robots.txt`, xxgk.www.gov.cn.
- **Not found (404):** a guessed Câmara URL (wrong id, fixed by search), `justice.gov.za/trc/amntrans/1998/index.htm`, `gov.cn/zhengce/zhengceku/2025-10/17/content_5920104.htm` (guessed), `gov.br/memoriasreveladas/pt-br/assuntos/comissao-nacional-da-verdade`, `archives.gov/iwg/japanese-war-crimes/introductory-essays` (the PDF path works), `japaneselawtranslation.go.jp/robots.txt`.
- **No national consolidated OGI annual report for China** and **no searchable PAIA enforcement database for South Africa** were found on the pages probed (absence in what was read, not proof of absence).
- A stray probe: `https://www.japaneselawtranslation.go.jp/en/laws/view/4224` was fetched early by guess and is an unrelated Act (Act on Vesting of Land Ownership ... in the National Treasury); the correct page is `/en/laws/view/3765/en`. It is in the ledger and should not be cited.
## Sources fetched
Every row below is a ledger entry with note `foi south: …` (latest row per URL; status as the spider recorded it). Total: 170 URLs.

- 200 | ok | ok  | 77601 B | https://www.japaneselawtranslation.go.jp/en/laws/view/4224
- 200 | ok | ok  | 78300 B | https://www.japaneselawtranslation.go.jp/en/laws/view/3765/en
- 200 | ok | ok  | 117412 B | https://www.japaneselawtranslation.go.jp/en/laws/view/3765
- 200 | ok | ok  | 800 B | https://laws.e-gov.go.jp/law/411AC0000000042
- 200 | ok | ok  | 101469 B | https://laws.e-gov.go.jp/api/1/lawdata/411AC0000000042
- 200 | ok | ok  | 99221 B | https://laws.e-gov.go.jp/api/2/law_data/411AC0000000042
- 200 | ok | ok  | 10890 B | https://www.jacar.go.jp/english/
- 200 | ok | ok  | 10625 B | https://www.jacar.go.jp/english/about/outline.html
- 404 | NOT OK | http_404  | - B | https://www.jacar.go.jp/robots.txt
- 200 | ok | ok  | 13082 B | https://www.jacar.go.jp/index.html
- 404 | NOT OK | http_404  | - B | https://www.archives.go.jp/robots.txt
- 200 | ok | ok  | 90706 B | https://www.digital.archives.go.jp/
- 200 | ok | ok  | 219 B | https://www.digital.archives.go.jp/robots.txt
- 200 | ok | ok  | 9467 B | https://www.archives.go.jp/english/
- 200 | ok | ok  | 88439 B | https://www.jacar.archives.go.jp/
- 200 | ok | ok  | 219 B | https://www.jacar.archives.go.jp/robots.txt
- 404 | NOT OK | http_404  | - B | https://www.jacar.archives.go.jp/aj/meta/
- 404 | NOT OK | http_404  | - B | https://www.jacar.go.jp/english/jacarbl-e/
- 200 | ok | ok  | 88579 B | https://www.jacar.archives.go.jp/aj/search-en
- 404 | NOT OK | http_404  | - B | https://www.jacar.archives.go.jp/aj/meta/listPhoto?LANG=default&BID=F0000000000000000000&ID=M0000000000000000000&REFCODE=C04122234100&TYPE=
- 200 | ok | ok  | 498032 B | https://www.jacar.archives.go.jp/aj/search?keyword=731
- 404 | NOT OK | http_404  | - B | https://www.jacar.archives.go.jp/aj/meta/searchList?keyword=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A
- 200 | ok | ok  | 498065 B | https://www.jacar.archives.go.jp/aj/search?keyword=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A
- 200 | ok | ok  | 498885 B | https://www.jacar.archives.go.jp/aj/search-en?keyword=Unit+731
- 200 | ok | ok  | 17315 B | https://www.jacar.archives.go.jp/bundles/apps-aj/js/search-cond.js
- 400 | NOT OK | http_400  | - B | https://www.jacar.archives.go.jp/aj/search?kw0=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A
- 400 | NOT OK | http_400  | - B | https://www.jacar.archives.go.jp/aj/search-en?kw0=Unit+731
- 200 | ok | ok  | 242532 B | https://www.jacar.archives.go.jp/aj/search?kl0=AND&ks0=kw_all&kw0=%E7%9F%B3%E4%BA%95%E9%83%A8%E9%9A%8A&rows=20
- 200 | ok | ok  | 360625 B | https://www.jacar.archives.go.jp/aj/search-en?kl0=AND&ks0=kw_all&kw0=Unit+731&rows=20
- 200 | ok | ok  | 79421 B | https://www.soumu.go.jp/main_sosiki/singi/jyouhou/toushin.html
- 200 | ok | ok  | 35 B | https://www.soumu.go.jp/robots.txt
- 200 | ok | ok  | 160205 B | https://www.cao.go.jp/en/pmf/pmf_24.pdf
- 200 | ok | ok  | 914334 B | https://www.digital.archives.go.jp/search?kw=%E9%98%B2%E7%96%AB%E7%B5%A6%E6%B0%B4%E9%83%A8
- 403 | NOT OK | http_403  | - B | http://koukai-hogo-db.soumu.go.jp/
- 403 | NOT OK | http_403  | - B | https://koukai-hogo-db.soumu.go.jp/
- 403 | NOT OK | http_403  | - B | https://koukai-hogo-db.soumu.go.jp/robots.txt
- 200 | ok | ok  | 113704 B | https://www.soumu.go.jp/main_content/000978211.pdf
- 200 | ok | ok  | 369921 B | https://www.nijl.ac.jp/
- 404 | NOT OK | http_404  | - B | https://www.japaneselawtranslation.go.jp/robots.txt
- 200 | ok | ok  | 800 B | https://laws.e-gov.go.jp/robots.txt
- 404 | NOT OK | http_404  | - B | https://www.cao.go.jp/robots.txt
- 404 | NOT OK | http_404  | - B | https://www.cas.go.jp/jp/gaiyou/jimu/tokuteihimitsu/
- 200 | ok | ok  | 42262 B | https://www.soumu.go.jp/main_sosiki/gyoukan/kanri/jyohokokai/index.html
- 200 | ok | ok  | 35266 B | https://www.archives.gov/iwg/japanese-war-crimes
- 404 | NOT OK | http_404  | - B | https://www.archives.gov/iwg/japanese-war-crimes/introductory-essays.html
- 200 | ok | ok  | 47357 B | https://www.archives.gov/iwg/declassified-records/rg-263-cia-records
- 404 | NOT OK | http_404  | - B | https://www.archives.gov/research/japanese-war-crimes
- 200 | ok | ok  | 2189 B | https://www.archives.gov/robots.txt
- 404 | NOT OK | http_404  | - B | https://www.archives.gov/iwg/japanese-war-crimes/introductory-essays
- 404 | NOT OK | http_404  | - B | https://www.archives.gov/iwg/japanese-war-crimes/japanese-war-crimes-guide.html
- no response | NOT OK | robots_disallow  | - B | https://catalog.archives.gov/api/v2/records/search?q=Unit%20731
- no response | NOT OK | robots_disallow  | - B | https://catalog.archives.gov/robots.txt
- 200 | ok | ok  | 2624656 B | https://www.archives.gov/files/iwg/japanese-war-crimes/introductory-essays.pdf
- 200 | ok | ok  | 24327262 B | https://www.archives.gov/files/iwg/japanese-war-crimes/select-documents.pdf
- 200 | ok | ok  | 115193 B | https://www.archives.gov/iwg/reports/japanese-interim-report-march-2002-1.html
- 403 | NOT OK | http_403  | - B | https://lawlibrary.org.za/akn/za/act/2000/2/eng@2021-06-30
- 403 | NOT OK | http_403  | - B | https://www.saflii.org/za/legis/consol_act/poatia2000366/index.html
- 200 | ok | ok  | 42313 B | https://www.gov.za/documents/promotion-access-information-act
- 200 | ok | ok  | 920404 B | https://www.gov.za/sites/default/files/gcis_document/201409/a2-000.pdf
- 200 | ok | ok  | 5747 B | https://lawlibrary.org.za/robots.txt
- 403 | NOT OK | http_403  | - B | https://www.saflii.org/robots.txt
- 200 | ok | ok  | 67395 B | https://www.gov.cn/zhengce/content/2019-04/15/content_5382991.htm
- 200 | ok | ok  | 811 B | https://www.gov.cn/robots.txt
- 200 | ok | ok  | 171512 B | https://www.chinalawtranslate.com/en/ogi2019/
- 200 | ok | ok  | 958 B | https://www.chinalawtranslate.com/robots.txt
- 200 | ok | ok  | 114657 B | https://www.cecc.gov/resources/legal-provisions/regulations-of-the-peoples-republic-of-china-on-open-government
- 404 | NOT OK | http_404  | - B | https://www.gov.cn/zhengce/zhengceku/2025-10/17/content_5920104.htm
- 403 | NOT OK | http_403  | - B | https://www.gov.cn/zhengce/zhengceku/
- 200 | ok | ok  | 27455 B | https://www.gov.cn/guoqing/
- 200 | ok | ok  | 226265 B | https://www.gov.cn/zhengce/xxgk/
- 404 | NOT OK | http_404  | - B | https://laws.e-gov.go.jp/api/2/law_data/425AC1000000108
- 200 | ok | ok  | 134172 B | https://laws.e-gov.go.jp/api/2/law_data/421AC0000000066
- 200 | ok | ok  | 10696 B | https://laws.e-gov.go.jp/api/2/laws?law_title=%E7%89%B9%E5%AE%9A%E7%A7%98%E5%AF%86
- 200 | ok | ok  | 102831 B | https://laws.e-gov.go.jp/api/2/law_data/425AC0000000108
- 200 | ok | ok  | 234156 B | https://inforegulator.org.za/
- 200 | ok | ok  | 133136 B | https://www.12371.cn/2024/02/27/ARTI1709036758179382.shtml
- 200 | ok | ok  | 77 B | https://www.12371.cn/robots.txt
- 403 | NOT OK | http_403  | - B | https://flk.npc.gov.cn/
- 200 | ok | ok  | 173 B | https://inforegulator.org.za/robots.txt
- 200 | ok | ok  | 203913 B | https://inforegulator.org.za/paia-annual-report/
- 403 | NOT OK | http_403  | - B | https://flk.npc.gov.cn/robots.txt
- no response | NOT OK | transport_error  | - B | https://rti.gov.in/rti-act.pdf
- 200 | ok | ok  | 25748 B | https://sabctrc.saha.org.za/reports/volume2/chapter6/part3/subsection1.htm
- 200 | ok | ok  | 252491 B | https://sabctrc.saha.org.za/export/hearinghtml.php?id=56266
- 200 | ok | ok  | 16070 B | https://sabctrc.saha.org.za/robots.txt
- 403 | NOT OK | http_403  | - B | https://www.polity.org.za/polity/govdocs/commissions/1998/trc/2chap6c.htm
- 200 | ok | ok  | 38476 B | https://nuke.fas.org/guide/rsa/cbw/2chap6c.htm
- 200 | ok | ok  | 11475 B | https://www.saha.org.za/collections/AL2922/a.htm
- 200 | ok | ok  | 1692555 B | https://inforegulator.org.za/wp-content/uploads/2026/03/PAIA_2024-25_-_Final_Annual_Assessment_Report.docx.pdf
- 200 | ok | ok  | 14395 B | https://www.saha.org.za/collections/the_freedom_of_information_project.htm
- 200 | ok | ok  | 16467 B | https://www.saha.org.za/robots.txt
- 200 | ok | ok  | 10976 B | https://www.saha.org.za/collections/AL2878/b.htm
- 200 | ok | ok  | 14246 B | https://www.saha.org.za/collection.php?id=575
- 200 | ok | ok  | 13608 B | https://saha.org.za/collections.php
- 200 | ok | ok  | 14110 B | https://justice.gov.za/trc/report/index.htm
- 200 | ok | ok  | 13799 B | https://justice.gov.za/trc/
- 200 | ok | ok  | 10617 B | https://justice.gov.za/trc/amntrans/index.htm
- 200 | ok | ok  | 9012 B | https://justice.gov.za/trc/hrvtrans/index.htm
- 200 | ok | ok  | 197 B | https://justice.gov.za/robots.txt
- 200 | ok | ok  | 17719 B | https://sabctrc.saha.org.za/reports.htm
- 200 | ok | ok  | 257281 B | https://www.gov.cn/zhengce/content/2021-09/29/content_5639620.htm
- 200 | ok | ok  | 248059 B | https://www.spt.gov.cn/xxgk/zfxxgknb/2024/dwzfpcjgjqzfgzbmzssydwzfxxgkgzndbg/202501/P020250123393917367030.pdf
- no response | NOT OK | transport_error  | - B | https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm
- 200 | ok | ok  | 1696111 B | https://justice.gov.za/trc/report/finalreport/Volume%202.pdf
- 200 | ok | ok  | 32208 B | https://justice.gov.za/trc/special/index.htm
- 404 | NOT OK | http_404  | - B | https://justice.gov.za/trc/amntrans/1998/index.htm
- no response | NOT OK | transport_error  | - B | https://xxgk.www.gov.cn/
- 200 | ok | ok  | 84688 B | https://justice.gov.za/trc/special/cbw/cbw1.htm
- 200 | ok | ok  | 207544 B | https://justice.gov.za/trc/special/cbw/cbw18.htm
- 202 | NOT OK | http_202  | - B | https://www.abhilekh-patal.in/
- 200 | ok | ok  | 66500 B | https://www.gov.br/acessoainformacao/pt-br
- 403 | NOT OK | http_403  | - B | https://www.indiacode.nic.in/handle/123456789/2065
- 200 | ok | ok  | 9632 B | https://dados.gov.br/
- 200 | ok | ok  | 2844 B | https://buscalai.cgu.gov.br/
- 200 | ok | ok  | 20605 B | https://rtionline.gov.in/
- 200 | ok | ok  | 82568 B | https://cic.gov.in/
- 202 | NOT OK | http_202  | - B | https://www.abhilekh-patal.in/robots.txt
- 200 | ok | ok  | 2102 B | https://www.gov.br/robots.txt
- 403 | NOT OK | http_403  | - B | https://www.indiacode.nic.in/robots.txt
- 200 | ok | ok  | 2844 B | https://buscalai.cgu.gov.br/robots.txt
- 200 | ok | ok  | 2027 B | https://cic.gov.in/robots.txt
- 404 | NOT OK | http_404  | - B | https://rtionline.gov.in/robots.txt
- 200 | ok | ok  | 1405 B | https://falabr.cgu.gov.br/
- 404 | NOT OK | http_404  | - B | https://falabr.cgu.gov.br/robots.txt
- 200 | ok | ok  | 187342 B | https://nationalarchives.nic.in/
- 404 | NOT OK | http_404  | - B | https://nationalarchives.nic.in/robots.txt
- 200 | ok | ok  | 150019 B | https://www.gov.br/cgu/pt-br/acesso-a-informacao/dados-abertos
- 200 | ok | ok  | 238568 B | https://www.gov.br/memoriasreveladas/pt-br
- 200 | ok | ok  | 1405 B | https://falabr.cgu.gov.br/web/dadosabertoslai
- 200 | ok | ok  | 50614 B | https://sian.an.gov.br/
- 200 | ok | ok  | 170034 B | https://www.gov.br/arquivonacional/pt-br
- 200 | ok | ok  | 1405 B | https://falabr.cgu.gov.br/web/home
- 200 | ok | ok  | 50992 B | https://cic.gov.in/decision
- 200 | ok | ok  | 50470 B | https://cic.gov.in/cic_landmark
- 200 | ok | ok  | 74014 B | https://cic.gov.in/rti-disclosoures
- 200 | ok | ok  | 66774 B | https://cic.gov.in/circular-reports-conventions
- 200 | ok | ok  | 59292 B | https://cic.gov.in/rti_act
- 200 | ok | ok  | 50245 B | https://cic.gov.in/rti-study-reports
- 200 | ok | ok  | 355456 B | https://cic.gov.in/sites/default/files/RTI_English.pdf
- 200 | ok | ok  | 49157 B | https://www.digital.archives.go.jp/secondary-use
- 200 | ok | ok  | 22694 B | https://www.jacar.archives.go.jp/aj/www/doc/
- 401 | NOT OK | http_401  | - B | https://dados.gov.br/robots.txt
- 200 | ok | ok  | 87092 B | https://www.wilsoncenter.org/program/history-and-public-policy-program
- 200 | ok | ok  | 64513 B | https://www.mfa.gov.cn/wjb_673085/zzjg_673183/dag_674733/
- 304 | ok | not_modified  | 2374 B | https://www.wilsoncenter.org/robots.txt
- 200 | ok | ok  | 22318 B | https://www.mfa.gov.cn/eng/wjb/zzjg_663340/dag_665324/
- 200 | ok | ok  | 54156 B | https://www.mfa.gov.cn/robots.txt
- no response | NOT OK | transport_error  | - B | https://dadosabertos.cgu.gov.br/
- no response | NOT OK | transport_error  | - B | https://memoriasreveladas.arquivonacional.gov.br/
- no response | NOT OK | transport_error  | - B | http://cnv.memoriasreveladas.gov.br/
- 401 | NOT OK | http_401  | - B | https://www.gov.br/memoriasreveladas/pt-br/faca-uma-pesquisa-em-nossa-base-de-dados
- 200 | ok | ok  | 138739 B | https://www.gov.br/arquivonacional/pt-br/servicos/atendimento/bases-de-dados-e-instrumentos-de-pesquisa
- 200 | ok | ok  | 136852 B | https://www.gov.br/arquivonacional/pt-br/acesso-a-informacao/dados-abertos-2
- 200 | ok | ok  | 130170 B | https://www.gov.br/arquivonacional/pt-br/servicos/bases-de-dados
- 200 | ok | ok  | 45429 B | https://consulta.an.gov.br/
- 503 | NOT OK | http_503  | - B | http://dsscic.nic.in/cause-list-report-web/view-decision/1
- 401 | NOT OK | http_401  | - B | https://dados.gov.br/dataset/dados-referentes-ao-e-sic
- no response | NOT OK | transport_error  | - B | http://cnv.memoriasreveladas.gov.br/images/pdf/relatorio/volume_1_digital.pdf
- 404 | NOT OK | http_404  | - B | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-610005-publicacaooriginal-132611-pl.html
- 404 | NOT OK | http_404  | - B | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-610005-normaatualizada-pl.html
- 200 | ok | ok  | 109893 B | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-normaatualizada-pl.html
- 200 | ok | ok  | 94508 B | https://www2.camara.leg.br/legin/fed/lei/2011/lei-12527-18-novembro-2011-611802-publicacaooriginal-134287-pl.html
- 200 | ok | ok  | 5809 B | https://www2.camara.leg.br/robots.txt
- 404 | NOT OK | http_404  | - B | https://www.gov.br/memoriasreveladas/pt-br/assuntos/comissao-nacional-da-verdade
- no response | NOT OK | transport_error  | - B | https://dsscic.nic.in/robots.txt
- 401 | NOT OK | http_401  | - B | https://dados.gov.br/dataset?organization=ministerio-da-transparencia-e-controladoria-geral-da-uniao-cgu
- 200 | ok | ok  | 2127 B | https://dss.cic.gov.in/citizen-service?tab=decision
- 200 | ok | ok  | 2127 B | https://dss.cic.gov.in/robots.txt
- 401 | NOT OK | http_401  | - B | https://www.gov.br/memoriasreveladas/pt-br/assuntos
- 401 | NOT OK | http_401  | - B | https://dados.gov.br/dataset/relatorios-quali-lai
