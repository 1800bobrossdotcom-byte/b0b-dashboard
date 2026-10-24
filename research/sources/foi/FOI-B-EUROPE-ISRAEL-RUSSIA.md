# foi-europe - FOI source registry candidates: France, Germany, Israel, Russia, EU access-to-documents

Beat: `europe`. Probed 2026-10-24 with `scripts/spider/spider.py` (identified, robots obeyed; one retry only of transport errors, never of a refusal).
Every `Q` line was generated from the cached body by regex and re-checked with `scripts/sweep/vq.py`. Nothing was filed, no account made, no repository file edited.
`probe.result` is one of ok / refused / robots / decoy / not_found / transport_error (a TCP or TLS failure, which is not a documented refusal).

**Reading guide.** Machine-readable winners: `fr-cada-datagouv-opinions` (CSV, Licence Ouverte), `fr-dila-opendata` (statutes as XML), `de-fragdenstaat-api-*` (keyless JSON, CC0 user content), `eu-ep-open-data` (CC BY 4.0), `eu-cellar-sparql`/`eu-reg1049-text` (case-law graph of Reg. 1049/2001), `il-mfoi`/`il-censor-data` (Hebrew HTML, censor series 2011-2025).
Walls: Légifrance, Bundesarchiv invenio, Israel State Archives, data.gov.il and gov.il pages, the Council register (all 403); FranceArchives, the Ombudsman and the Commission register (JS walls served as 200).


## France

### CADA opinions and advice (avis et conseils) - data.gouv.fr open dataset, monthly CSV

```json
{
 "id": "fr-cada-datagouv-opinions",
 "cc": "FR",
 "kind": "appeals",
 "name": "CADA opinions and advice (avis et conseils) - data.gouv.fr open dataset, monthly CSV",
 "url": "https://www.data.gouv.fr/datasets/avis-et-conseils-de-la-cada",
 "search": null,
 "api": "https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/",
 "format": "json (catalogue) + csv (data)",
 "terms": "Licence Ouverte (data.gouv.fr licence id fr-lo; the dataset page itself timed out, the API metadata states it)",
 "key_required": false,
 "programs": [
  "Algerian War / Maurice Audin (search the CSV for the administration)",
  "French nuclear tests / Loi Morin",
  "any FOI refusal by a French administration"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://static.data.gouv.fr/resources/avis-et-conseils-de-la-cada/20260814-171306/export-reutilisation-avril-2024.csv"
 },
 "use": "Read the dataset's metadata and resource list from the API, then fetch the per-period CSVs from static.data.gouv.fr (April 2024 file: 406 rows, columns Numéro de dossier, Administration, Type, Année, Séance, Objet, Thème, Mots clés, Sens et motivation, Partie, Avis); the full-text of each opinion is in the Avis column.",
 "limits": "Coverage ends 2024-04-30 although the dataset was last updated 2026-08-14 (the CADA site already shows a séance of 12/12/2024); data.gouv.fr's own /datasets/r/ redirect URLs are robots-disallowed so use the static.data.gouv.fr URLs from the API; the HTML dataset pages reset or timed out."
}
```
Q | https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/ | A partir de fin 2012, l'int\u00e9gralit\u00e9 des avis et conseils est disponible.
Q | https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/ | "license": "fr-lo"
Q | https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/ | "temporal_coverage": {"end": "2024-04-30", "start": "1984-03-03"}
Q | https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/ | "last_update": "2026-08-14T17:26:47.435000+00:00"
Q | https://static.data.gouv.fr/resources/avis-et-conseils-de-la-cada/20260814-171306/export-reutilisation-avril-2024.csv | "Numéro de dossier","Administration","Type","Année","Séance","Objet"
Q | https://www.data.gouv.fr/robots.txt | Disallow: /datasets/r/

### CADA opinions search API (cada.data.gouv.fr/api), listed as a resource of the dataset above

```json
{
 "id": "fr-cada-datagouv-search-api",
 "cc": "FR",
 "kind": "appeals",
 "name": "CADA opinions search API (cada.data.gouv.fr/api), listed as a resource of the dataset above",
 "url": "http://cada.data.gouv.fr/api/",
 "search": null,
 "api": "http://cada.data.gouv.fr/api/",
 "format": "json",
 "terms": "not read (host unreachable)",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": null,
  "result": "transport_error",
  "sample": "https://cada.data.gouv.fr/ - connection reset by peer"
 },
 "use": "Would give a search endpoint over the same opinions; not usable from here.",
 "limits": "Connection reset by peer on the host root; the dataset lists it as http (not https). Treat as dead until a later probe succeeds."
}
```
Q | https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/ | "title": "API de recherche au sein des avis publi\u00e9s", "type": "api", "url": "http://cada.data.gouv.fr/api/"

### CADA website - opinion pages by reference number (cada.fr/<year><number>)

```json
{
 "id": "fr-cada-site",
 "cc": "FR",
 "kind": "appeals",
 "name": "CADA website - opinion pages by reference number (cada.fr/<year><number>)",
 "url": "https://www.cada.fr/",
 "search": "https://www.cada.fr/resultats-rechercher-un-avis?body_value={q}",
 "api": null,
 "format": "html",
 "terms": "not stated on the pages read",
 "key_required": false,
 "programs": [
  "any FOI refusal by a French administration"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.cada.fr/20246468 (avis 202406468, séance 12/12/2024); the search URL answered 403 twice"
 },
 "use": "Individual opinions are plain HTML at /<reference> (the reference drops the zero after the year); each carries the administration, séance date, keywords and the opinion text.",
 "limits": "The results page (resultats-rechercher-un-avis?body_value=...) refused the crawler with 403 on two attempts (the second after correcting an unencoded accent in the first); so there is no full-text search here, only known-reference fetches and the CSVs."
}
```
Q | https://www.cada.fr/20246468 | Avis 202406468 - Séance du 12/12/2024
Q | https://www.cada.fr/20246468 | sont considérés comme documents administratifs quels que soient leur date, leur lieu de conservation, leur forme et leur support
Q | https://www.cada.fr/rechercher-un-avis | la CADA met à disposition sur le site data.gouv.fr , les avis et conseils rendus depuis la fin de l'année 2012.

### Légifrance - CRPA (Code des relations entre le public et l'administration, Livre III) and other texts

```json
{
 "id": "fr-legifrance",
 "cc": "FR",
 "kind": "law",
 "name": "Légifrance - CRPA (Code des relations entre le public et l'administration, Livre III) and other texts",
 "url": "https://www.legifrance.gouv.fr/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "https://www.legifrance.gouv.fr/ and /robots.txt and the CRPA section URL all 403"
 },
 "use": "Nothing: refused. The same texts are reachable lawfully through the DILA open-data dumps (next entry).",
 "limits": "Not worked around; no API route was tried."
}
```

### DILA open data - LEGI (consolidated codes, laws, decrees), JORF (Journal officiel), JADE (administrative case law), CNIL, CONSTIT, CASS

```json
{
 "id": "fr-dila-opendata",
 "cc": "FR",
 "kind": "archive-api",
 "name": "DILA open data - LEGI (consolidated codes, laws, decrees), JORF (Journal officiel), JADE (administrative case law), CNIL, CONSTIT, CASS",
 "url": "https://echanges.dila.gouv.fr/OPENDATA/",
 "search": null,
 "api": "https://echanges.dila.gouv.fr/OPENDATA/LEGI/",
 "format": "xml in tar.gz",
 "terms": "Licence Ouverte v2.0 (attribution: DILA, long download URL, file name and date)",
 "key_required": false,
 "programs": [
  "CRPA access articles",
  "Loi Morin (2010-2)",
  "Arrêté of 22 Dec 2021 (Algerian War archives) in JORF",
  "Conseil d'État secret-défense access cases (JADE)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://echanges.dila.gouv.fr/OPENDATA/LEGI/ (directory listing; DILA_LEGI_Presentation_20170824.pdf read)"
 },
 "use": "Apache-style directory listings of daily increments (a few MB each) plus a yearly 'Freemium' stock; the texts are XML, so a statute or arrêté can be pulled out of a daily file without touching Légifrance.",
 "limits": "Stocks are 1.1-1.6 GB (LEGI/JORF/JADE) - not for casual fetching; no site search; the host serves no robots.txt (404), so it is open by absence."
}
```
Q | https://echanges.dila.gouv.fr/OPENDATA/LEGI/DILA_LEGI_Presentation_20170824.pdf | Le texte intégral consolidé de la législation et de la réglementation nationale.
Q | https://echanges.dila.gouv.fr/OPENDATA/LEGI/DILA_LEGI_Presentation_20170824.pdf | Les données sont réutilisables gratuitement sous licence ouverte v2.0.
Q | https://echanges.dila.gouv.fr/OPENDATA/LEGI/DILA_LEGI_Presentation_20170824.pdf | Périodicité de la mise à jour Quotidienne.
Q | https://echanges.dila.gouv.fr/OPENDATA/ | JADE/

### Ma Dada - French Alaveteli (requests for administrative documents, with CADA referral status)

```json
{
 "id": "fr-madada",
 "cc": "FR",
 "kind": "civil-log",
 "name": "Ma Dada - French Alaveteli (requests for administrative documents, with CADA referral status)",
 "url": "https://madada.fr/",
 "search": null,
 "api": "https://madada.fr/body/{body}.json and https://madada.fr/request/{slug}.json",
 "format": "html + json",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "any FOI refusal by a French administration"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://madada.fr/request/demande_de_communication_de_docu_145.json"
 },
 "use": "Body lists (51,926 authorities), per-body pages and .json for bodies and requests; request state values include saisine_cada.",
 "limits": "robots.txt disallows */search/*, */feed/*, */request/*/response/* and */request/*/download*, so there is no search and no message bodies; only request metadata and body pages. Help page says there is no full API."
}
```
Q | https://madada.fr/robots.txt | Disallow: */search/*
Q | https://madada.fr/body/gouvernement.json | "url_name":"gouvernement","name":"Premier ministre"
Q | https://madada.fr/body/list/all | 51926 autorités trouvées
Q | https://madada.fr/help/api | Ma Dada n'a pas d'API complète pour l'instant
Q | https://madada.fr/request/demande_de_communication_de_docu_145.json | "described_state":"saisine_cada"

### FranceArchives portal (national archives aggregator)

```json
{
 "id": "fr-francearchives",
 "cc": "FR",
 "kind": "archive",
 "name": "FranceArchives portal (national archives aggregator)",
 "url": "https://francearchives.gouv.fr/",
 "search": "https://francearchives.gouv.fr/fr/search?q={q}",
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Algerian War / Maurice Audin"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "decoy",
  "sample": "https://francearchives.gouv.fr/fr/search?q=Maurice+Audin - 247 bytes, 'This website requires JS enabled and cookies'"
 },
 "use": "Nothing from a plain client: the two pages tried and one /file/ PDF all return the JS/cookie wall with HTTP 200.",
 "limits": "A 200 that is a refusal. Not solved, not worked around. Register as a decoy."
}
```
Q | https://francearchives.gouv.fr/fr/ | This website requires JS enabled and cookies

### Archives nationales (landing, research aid); Salle des inventaires virtuelle (SIV) and ANOM

```json
{
 "id": "fr-archives-nationales",
 "cc": "FR",
 "kind": "archive",
 "name": "Archives nationales (landing, research aid); Salle des inventaires virtuelle (SIV) and ANOM",
 "url": "https://www.archives-nationales.culture.gouv.fr/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Algerian War / Maurice Audin",
  "2021 arrêté archives"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.archives-nationales.culture.gouv.fr/aide-la-recherche (landing and aid pages ok; SIV robots-disallowed; ANOM connection reset)"
 },
 "use": "Landing and research-aid pages only.",
 "limits": "The online inventories (www.siv.archives-nationales.culture.gouv.fr) are robots-disallowed for this crawler; anom.archivesnationales.culture.gouv.fr (overseas archives, where Algerian-war files sit) reset the connection twice."
}
```
Q | https://www.archives-nationales.culture.gouv.fr/ | Salle de lecture virtuelle

### Service historique de la Défense - online inventories search

```json
{
 "id": "fr-shd",
 "cc": "FR",
 "kind": "archive",
 "name": "Service historique de la Défense - online inventories search",
 "url": "https://www.servicehistorique.sga.defense.gouv.fr/",
 "search": "https://www.servicehistorique.sga.defense.gouv.fr/resultats-recherche?cles={q}",
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Algerian War",
  "2021 arrêté archives (ministry of the armed forces holdings)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.servicehistorique.sga.defense.gouv.fr/resultats-recherche?cles=Audin (21 results)"
 },
 "use": "GET search over SHD inventories and archive notices; the result list carries notice type, site and cote. Personnel dossiers appear in results: use them as counts, never name the individuals.",
 "limits": "Other fields of the form (thematiques, lieu, debut, fin, cote) not tried; Mémoire des hommes (memoiredeshommes.sga.defense.gouv.fr) failed with an expired TLS certificate and was not worked around."
}
```
Q | https://www.servicehistorique.sga.defense.gouv.fr/resultats-recherche?cles=Audin | 21 résultat(s)

### Arrêté du 22 décembre 2021 portant ouverture d'archives relatives à la guerre d'Algérie (JORF 23 Dec 2021) - secondary copy

```json
{
 "id": "fr-algeria-2021-arrete",
 "cc": "FR",
 "kind": "program",
 "name": "Arrêté du 22 décembre 2021 portant ouverture d'archives relatives à la guerre d'Algérie (JORF 23 Dec 2021) - secondary copy",
 "url": "https://histoirecoloniale.net/wp-content/uploads/2021/12/arrete_paru_au_journal_officiel_du_23_decembre_2021.pdf",
 "search": null,
 "api": null,
 "format": "pdf",
 "terms": "a copy of an official text hosted by a history website (histoirecoloniale.net); the official host is refused",
 "key_required": false,
 "programs": [
  "Algerian War torture programme (1954-1962)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "same URL"
 },
 "use": "The text of the derogation: judicial files and judicial-police investigations on acts connected with the war, 1 Nov 1954 - 31 Dec 1966, freely communicable before the ordinary Code du patrimoine L.213-2 deadlines; minors, intelligence-agent safety and sexual-privacy documents stay under the ordinary rule (Art. 1 II).",
 "limits": "It is a copy, not the Journal officiel; the same text should be in the DILA JORF dump for 2021-12-23 (not downloaded). The 9 Sept 2019 arrêté on the Audin disappearance was not retrieved at all (only secondary reports seen)."
}
```
Q | https://histoirecoloniale.net/wp-content/uploads/2021/12/arrete_paru_au_journal_officiel_du_23_decembre_2021.pdf | Arrêté du 22 décembre 2021 portant ouverture d'archives relatives à la guerre d'Algérie
Q | https://histoirecoloniale.net/wp-content/uploads/2021/12/arrete_paru_au_journal_officiel_du_23_decembre_2021.pdf | 1o Les documents relatifs aux affaires portées devant les juridictions et à l'exécution des décisions de justice ; 2o Les documents relatifs aux enquêtes réalisées par les services de la police judiciaire
Q | https://histoirecoloniale.net/wp-content/uploads/2021/12/arrete_paru_au_journal_officiel_du_23_decembre_2021.pdf | l'arrêté entre en vigueur le lendemain de sa publication

### 1000autres.org - Algiers 1957 disappeared persons, built by an association from archive files

```json
{
 "id": "fr-1000autres",
 "cc": "FR",
 "kind": "program",
 "name": "1000autres.org - Algiers 1957 disappeared persons, built by an association from archive files",
 "url": "https://1000autres.org/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Algerian War / Maurice Audin"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://1000autres.org/"
 },
 "use": "A civil-society project on the people taken in Algiers in 1957 (footer: Association histoire coloniale et postcoloniale); useful as a pointer to archive series, not as a primary.",
 "limits": "Advocacy source, not an archive; only the landing page was read. If its database names individuals, the crawler should extract series references only."
}
```
Q | https://1000autres.org/ | Enlevés, détenus clandestinement, torturés et parfois assassinés par l'armée française
Q | https://1000autres.org/ | Association histoire coloniale et postcoloniale, siège social 21 ter, rue Voltaire 75011 Paris

### Assemblée nationale commission d'enquête on French nuclear testing (2025): hearing on archives (28 Jan 2025) and report volume II

```json
{
 "id": "fr-nuclear-tests-an-inquiry",
 "cc": "FR",
 "kind": "program",
 "name": "Assemblée nationale commission d'enquête on French nuclear testing (2025): hearing on archives (28 Jan 2025) and report volume II",
 "url": "https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/ceesnuc/l17ceesnuc2425005_compte-rendu.pdf",
 "search": null,
 "api": null,
 "format": "pdf",
 "terms": "not read (Assemblée robots.txt is 1,286 bytes, read as allowing the path)",
 "key_required": false,
 "programs": [
  "French nuclear tests (Algeria, Polynesia) / Loi Morin"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.assemblee-nationale.fr/dyn/17/rapports/ceesnuc/l17b1558-tii_rapport-enquete.pdf (5.8 MB; 2.3 MB of text)"
 },
 "use": "An official, citable account of the declassification waves and the opening committee; the report's hearings volume (n° 1558, tome II, filed 10 June 2025) carries the CIVEN, Polynesian and journalist testimony.",
 "limits": "Parliamentary record, not the archive itself; the 233 declassified documents are not fetched here."
}
```
Q | https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/ceesnuc/l17ceesnuc2425005_compte-rendu.pdf | 233 documents sur les essais nucléaires en Polynésie ont été déclassifiés, en quatre vagues
Q | https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/ceesnuc/l17ceesnuc2425005_compte-rendu.pdf | Les premières archives ont été ouvertes le 18 novembre 2022.
Q | https://www.assemblee-nationale.fr/dyn/17/rapports/ceesnuc/l17b1558-tii_rapport-enquete.pdf | En janvier 2010, avec la loi Morin, le législateur a prévu de reconnaître et d'indemniser le préjudice subi par les témoins
Q | https://www.assemblee-nationale.fr/dyn/17/rapports/ceesnuc/l17b1558-tii_rapport-enquete.pdf | Enregistré à la Présidence de l'Assemblée nationale le 10 juin 2025.

### CIVEN (nuclear-test victims compensation committee) - site and annual report 2025

```json
{
 "id": "fr-civen",
 "cc": "FR",
 "kind": "program",
 "name": "CIVEN (nuclear-test victims compensation committee) - site and annual report 2025",
 "url": "https://www.civen.fr/",
 "search": null,
 "api": null,
 "format": "html + pdf",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "French nuclear tests / Loi Morin"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.civen.fr/sites/civen/files/documents/rapport-d-activite-2025-mn_1.pdf (4.0 MB)"
 },
 "use": "Annual activity reports with case counts since 2010; a /ressources page exists (fetched, not read); the 2024 and 2025 reports are announced as news items.",
 "limits": "Statistics in aggregate only. A Polynesian state report (polynesie-francaise.pref.gouv.fr, file named 'Rapport d'activité CIVEN 2022-2023') is in fact the High Commission's 'mission de suivi' report, not the CIVEN's."
}
```
Q | https://www.civen.fr/ | Le CIVEN, autorité indépendante, indemnise les personnes dont les maladies susceptibles d'être radio-induites pourraient être causées par les essais nucléaires français au Sahara et en Polynésie.
Q | https://www.civen.fr/rapport-dactivite-2025-du-civen | Le nombre de nouveaux dossiers déposés s'établit à un niveau élevé (794)
Q | https://www.polynesie-francaise.pref.gouv.fr/index.php/contenu/telechargement/52282/334060/file/Rapport%20d%27activit%C3%A9%20CIVEN%202022-2023.pdf | Entre 2010 et 2017, seuls 11 dossiers polynésiens ont été indemnisés.


## Germany

### Informationsfreiheitsgesetz (IFG) of 5 Sept 2005 - official consolidated text, gesetze-im-internet.de

```json
{
 "id": "de-ifg-text",
 "cc": "DE",
 "kind": "law",
 "name": "Informationsfreiheitsgesetz (IFG) of 5 Sept 2005 - official consolidated text, gesetze-im-internet.de",
 "url": "https://www.gesetze-im-internet.de/ifg/BJNR272200005.html",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read (gesetze-im-internet.de robots.txt is 'Disallow:' empty)",
 "key_required": false,
 "programs": [
  "BND personnel files",
  "Stasi records (separate statute)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.gesetze-im-internet.de/ifg/BJNR272200005.html"
 },
 "use": "Full IFG text. Intelligence exemption is s.3 no. 8 (Nachrichtendienste and security-clearance bodies); s.12 gives anyone the right to appeal to the Federal Commissioner.",
 "limits": "Text as amended to 19 June 2020 (the page's Stand line); IFG covers federal bodies only - the Länder have their own laws."
}
```
Q | https://www.gesetze-im-internet.de/ifg/BJNR272200005.html | Ausfertigungsdatum: 05.09.2005
Q | https://www.gesetze-im-internet.de/ifg/BJNR272200005.html | Jeder hat nach Maßgabe dieses Gesetzes gegenüber den Behörden des Bundes einen Anspruch auf Zugang zu amtlichen Informationen.
Q | https://www.gesetze-im-internet.de/ifg/BJNR272200005.html | 8. gegenüber den Nachrichtendiensten sowie den Behörden und sonstigen öffentlichen Stellen des Bundes, soweit sie Aufgaben im Sinne des § 10 Nr. 3 des Sicherheitsüberprüfungsgesetzes wahrnehmen.
Q | https://www.gesetze-im-internet.de/ifg/BJNR272200005.html | Jeder kann den Bundesbeauftragten für die Informationsfreiheit anrufen, wenn er sein Recht auf Informationszugang nach diesem Gesetz als verletzt ansieht.

### FragDenStaat API - requests, public bodies, laws (Alaveteli-class civil FOI log, Germany)

```json
{
 "id": "de-fragdenstaat-api-requests",
 "cc": "DE",
 "kind": "civil-log",
 "name": "FragDenStaat API - requests, public bodies, laws (Alaveteli-class civil FOI log, Germany)",
 "url": "https://fragdenstaat.de/api/",
 "search": null,
 "api": "https://fragdenstaat.de/api/v1/",
 "format": "json (tastypie-style paging) + OpenAPI schema at /api/v1/schema",
 "terms": "User-submitted content is released CC0 by the Nutzungsbedingungen (s.5); government replies are third-party material. No rate limit or scraping clause found by keyword search of the terms (scrap, crawl, automatisiert, API, Bot); OAuth exists but read access needs none.",
 "key_required": false,
 "programs": [
  "BND personnel files (public body id 98)",
  "Stasi/BStU records requests"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://fragdenstaat.de/api/v1/request/?format=json&public_body=98&limit=3 (165 requests to the Bundesnachrichtendienst)"
 },
 "use": "Unauthenticated JSON: 290,545 requests; filter by public body with ?public_body=<id> (BND = 98, found via /api/v1/publicbody/?q=Bundesnachrichtendienst); status, dates, refusal_reason, costs, law.",
 "limits": "The ?q= parameter on /request/ is ignored (returned the full 290,545); requests name private individuals, so extract counts and subjects, not names. robots.txt names ClaudeBot, GPTBot, anthropic-ai and others as Disallow: / (b0bSourceBot is not named and falls under User-agent: *), which signals the operator's attitude to AI crawlers: flag for the author. Disallowed for everyone: /anfrage/*/pdf/, /anfrage/*/download/, /account/*."
}
```
Q | https://fragdenstaat.de/api/ | Wir bieten einen maschinenlesbaren Zugriff auf die Daten von FragDenStaat.de an
Q | https://fragdenstaat.de/nutzungsbedingungen/ | Als Transparenzportal sollen die von Nutzer:innen erstellten Inhalte auf fragdenstaat.de dauerhaft verfügbar bleiben und möglichst ohne Hindernisse für alle erdenklichen Zwecke nachnutzbar sein.
Q | https://fragdenstaat.de/nutzungsbedingungen/ | Freigabeerklärung „CC0" (auch genannt „CC Zero")
Q | https://fragdenstaat.de/api/v1/request/?format=json | "total_count":290545
Q | https://fragdenstaat.de/api/v1/request/?format=json&public_body=98&limit=3 | "total_count":165
Q | https://fragdenstaat.de/api/v1/publicbody/?format=json&q=Bundesnachrichtendienst | "name":"Bundesnachrichtendienst"
Q | https://fragdenstaat.de/api/v1/law/?format=json | "total_count":189
Q | https://fragdenstaat.de/robots.txt | Disallow: /anfrage/*/pdf/
Q | https://fragdenstaat.de/robots.txt | User-agent: ClaudeBot Disallow: /

### FragDenStaat documents - released government PDFs and their page text (API)

```json
{
 "id": "de-fragdenstaat-api-documents",
 "cc": "DE",
 "kind": "disclosure-log",
 "name": "FragDenStaat documents - released government PDFs and their page text (API)",
 "url": "https://fragdenstaat.de/api/v1/document/",
 "search": null,
 "api": "https://fragdenstaat.de/api/v1/document/?format=json",
 "format": "json; files on media.frag-den-staat.de",
 "terms": "as the entry above",
 "key_required": false,
 "programs": [
  "BND personnel files"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://fragdenstaat.de/api/v1/document/?format=json&limit=2 (259,835 documents)"
 },
 "use": "Each record has file_url, num_pages, public/listed flags and a site_url; the /page/ resource carries extracted text.",
 "limits": "media.frag-den-staat.de not probed; per-document content is released government material of mixed provenance - check each record's own rights and stop rules before reading."
}
```
Q | https://fragdenstaat.de/api/v1/document/?format=json&limit=2 | "total_count":259835

### BfDI (Federal Commissioner for Data Protection and Freedom of Information) - IFG reports, via Bundestag Drucksache 19/19910

```json
{
 "id": "de-bfdi-ifg",
 "cc": "DE",
 "kind": "appeals",
 "name": "BfDI (Federal Commissioner for Data Protection and Freedom of Information) - IFG reports, via Bundestag Drucksache 19/19910",
 "url": "https://dserver.bundestag.de/btd/19/199/1919910.pdf",
 "search": null,
 "api": null,
 "format": "pdf",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "BND exemption (Bereichsausnahme)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://dserver.bundestag.de/btd/19/199/1919910.pdf (7th Tätigkeitsbericht zur Informationsfreiheit 2018/2019; 1.7 MB)"
 },
 "use": "The biennial IFG report as a Bundestag paper; contains appeal counts by ministry and the Bereichsausnahme sentence for the intelligence services.",
 "limits": "The BfDI's own archive page of Tätigkeitsberichte is robots-disallowed (/DE/Service/Publikationen/...) and robots.txt sets Crawl-delay 30; the IFG landing page was fetched but no decision series was found on it. Read reports through dserver.bundestag.de."
}
```
Q | https://dserver.bundestag.de/btd/19/199/1919910.pdf | Die Zahl der Anrufungen nach § 12 Abs. 1 IFG in Form von Vermittlungsbitten ist im Berichtszeitraum 2018/2019 im Vergleich zu den Zahlen aus 2016/2017 von 702 auf 752 gestiegen.
Q | https://dserver.bundestag.de/btd/19/199/1919910.pdf | Bereichsausnahme
Q | https://www.bfdi.bund.de/robots.txt | Disallow: /SiteGlobals/ Disallow: /DE/Service/

### Bundesarchiv invenio (online finding aids, incl. Stasi records finding aids)

```json
{
 "id": "de-bundesarchiv-invenio",
 "cc": "DE",
 "kind": "archive",
 "name": "Bundesarchiv invenio (online finding aids, incl. Stasi records finding aids)",
 "url": "https://invenio.bundesarchiv.de/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Stasi files",
  "BND records"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "https://invenio.bundesarchiv.de/"
 },
 "use": "Nothing: refused.",
 "limits": "Not worked around; the bundesarchiv.de website (below) is the readable surface."
}
```

### Stasi-Unterlagen-Archiv inside the Bundesarchiv - figures, legal basis, finding-aid overview (bundesarchiv.de)

```json
{
 "id": "de-bundesarchiv-stasi",
 "cc": "DE",
 "kind": "program",
 "name": "Stasi-Unterlagen-Archiv inside the Bundesarchiv - figures, legal basis, finding-aid overview (bundesarchiv.de)",
 "url": "https://www.bundesarchiv.de/stasi-unterlagen-archiv/das-stasi-unterlagen-archiv-in-zahlen/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Stasi domestic surveillance (exposed 1991)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.bundesarchiv.de/stasi-unterlagen-archiv/rechtsgrundlagen/ and /findmittel/"
 },
 "use": "Current figures (over 111 km of records), the legal basis (StUG with the Bundesarchivgesetz), and the Bestandsübersichten.",
 "limits": "robots.txt: Crawl-delay 30, Disallow /*? and /suche/ - no query-string pages and no site search. The same paths on stasi-unterlagen-archiv.de return the homepage (see decoys)."
}
```
Q | https://www.bundesarchiv.de/stasi-unterlagen-archiv/das-stasi-unterlagen-archiv-in-zahlen/ | Im Archiv stehen über 111 Kilometer Schriftgut für die Recherche zur Verfügung.
Q | https://www.bundesarchiv.de/stasi-unterlagen-archiv/das-stasi-unterlagen-archiv-in-zahlen/ | Davon sind 51 Kilometer bereits von der Stasi archiviert worden und sind personenbezogen zugänglich.
Q | https://www.bundesarchiv.de/stasi-unterlagen-archiv/rechtsgrundlagen/ | Das Stasi -Unterlagen-Gesetz ( StUG ) ist die gesetzliche Grundlage für den Zugang zu den Stasi -Unterlagen.
Q | https://www.bundesarchiv.de/stasi-unterlagen-archiv/findmittel/ | Die Bestandsübersicht bietet einen ersten Überblick über Inhalt, Umfang und Benutzbarkeit der im Stasi -Unterlagen-Archiv verwahrten Unterlagen des Ministeriums für Staatssicherheit
Q | https://www.bundesarchiv.de/robots.txt | Crawl-delay: 30

### stasi-unterlagen-archiv.de (alias domain) - deep paths

```json
{
 "id": "de-stasi-domain-homepage-decoy",
 "cc": "DE",
 "kind": "archive",
 "name": "stasi-unterlagen-archiv.de (alias domain) - deep paths",
 "url": "https://www.stasi-unterlagen-archiv.de/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Stasi files"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "decoy",
  "sample": "https://www.stasi-unterlagen-archiv.de/stasi-unterlagen-archiv/rechtsgrundlagen/ - 235,395 bytes, the homepage again"
 },
 "use": "Nothing beyond the homepage.",
 "limits": "Every deep path returns the homepage (title 'Stasi-Unterlagen-Archiv - Bundesarchiv', 235,394-235,395 bytes) with HTTP 200; use www.bundesarchiv.de/stasi-unterlagen-archiv/... instead."
}
```

### Bundesarchiv Digitaler Lesesaal (digitised records)

```json
{
 "id": "de-digitaler-lesesaal",
 "cc": "DE",
 "kind": "archive",
 "name": "Bundesarchiv Digitaler Lesesaal (digitised records)",
 "url": "https://digitaler-lesesaal.bundesarchiv.de/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Stasi files",
  "digitised holdings"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "decoy",
  "sample": "https://digitaler-lesesaal.bundesarchiv.de/ - 21,570 bytes, 'Bitte haben Sie einen Moment Geduld.'"
 },
 "use": "Nothing: an interstitial wait page with HTTP 200.",
 "limits": "Not solved; register as a decoy."
}
```
Q | https://digitaler-lesesaal.bundesarchiv.de/ | Bitte haben Sie einen Moment Geduld.

### Unabhängige Historikerkommission zur Erforschung der Geschichte des BND 1945-1968 (UHK) - series, redaction dispute; website lost to a squatter

```json
{
 "id": "de-uhk-bnd",
 "cc": "DE",
 "kind": "program",
 "name": "Unabhängige Historikerkommission zur Erforschung der Geschichte des BND 1945-1968 (UHK) - series, redaction dispute; website lost to a squatter",
 "url": "https://www.aufbau-verlage.de/ch-links-verlag/das-sozialprofil-des-bundesnachrichtendienstes/978-3-86153-920-9",
 "search": null,
 "api": null,
 "format": "html + pdf (Bundestag papers)",
 "terms": "publisher pages are catalogue entries; no full text of any volume was seen",
 "key_required": false,
 "programs": [
  "BND Nazi personnel (exposed 2011-2017)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://dserver.bundestag.de/btd/20/021/2002192.pdf (Antwort 20/2192 on redactions in the Henke volume)"
 },
 "use": "Publisher catalogue pages for each volume (Ch. Links Verlag) and two Bundestag papers: Drucksache 19/29966 (a parliamentary question: commission appointed 15 Feb 2011, funding, internal dispute) and 20/2192 (the government's answer on redactions in the Henke volume).",
 "limits": "The commission's website http://www.uhk-bnd.de/ (cited in Drucksache 19/29966) is now a sports-betting site, so the commission's own pages are not readable at that address. The dispute and redaction facts come from a parliamentary question and a government answer, i.e. attributed, not from BND records."
}
```
Q | https://dserver.bundestag.de/btd/19/299/1929966.pdf | am 15. Februar 2011 vom Bundesnachrichtendienst (BND) berufene Unabhängige Historikerkommission (UHK)
Q | https://dserver.bundestag.de/btd/19/299/1929966.pdf | http://www.uhk-bnd.de/?page_id=207
Q | https://www.uhk-bnd.de/ | Sportwetten Deutschland 2026: Neue Anbieter, Boni & Recht
Q | https://www.aufbau-verlage.de/ch-links-verlag/das-sozialprofil-des-bundesnachrichtendienstes/978-3-86153-920-9 | Band 1 der Veröffentlichungen der Unabhängigen Historikerkommission zur Erforschung der Geschichte des Bundesnachrichtendienstes 1945-1968
Q | https://dserver.bundestag.de/btd/20/021/2002192.pdf | Schwärzungen in Veröffentlichung der Unabhängigen Historikerkommission zur Inlandsspionage des Bundesnachrichtendienstes

### Deutsche Digitale Bibliothek / Archivportal-D

```json
{
 "id": "de-ddb-archivportal",
 "cc": "DE",
 "kind": "archive-api",
 "name": "Deutsche Digitale Bibliothek / Archivportal-D",
 "url": "https://www.archivportal-d.de/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": null,
 "programs": [
  "Stasi/BND records finding aids held by German archives"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.archivportal-d.de/ and https://www.deutsche-digitale-bibliothek.de/ (landing pages only)"
 },
 "use": "Item pages may be fetchable; the aggregated finding aids from many German archives sit here.",
 "limits": "robots.txt disallows the search-result paths (DDB: /search, /searchresults; Archivportal-D: /objekte, /personen, /organisationen, /struktur). Whether an API exists and what key it needs was not read here; we would not request one. No record call was made."
}
```
Q | https://www.archivportal-d.de/robots.txt | Disallow: /objekte
Q | https://www.deutsche-digitale-bibliothek.de/robots.txt | Disallow: /searchresults


## Israel

### Freedom of Information Law, 5758-1998 - WIPO Lex English translation (2014; Hebrew controls)

```json
{
 "id": "il-foi-law-wipo",
 "cc": "IL",
 "kind": "law",
 "name": "Freedom of Information Law, 5758-1998 - WIPO Lex English translation (2014; Hebrew controls)",
 "url": "https://www.wipo.int/wipolex/en/text/346739",
 "search": null,
 "api": null,
 "format": "html (docx text, letter-spaced extraction)",
 "terms": "WIPO Lex; not read",
 "key_required": false,
 "programs": [
  "Dimona / nuclear programme records",
  "military censor"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.wipo.int/wipolex/en/text/346739"
 },
 "use": "Section 14(a) lists the bodies the law does not apply to: IDF intelligence agencies, the General Security Agency, the Institute for Intelligence and Special Tasks, the Atomic Energy Commission and its nuclear research centres, and other named units.",
 "limits": "The extracted text is letter-spaced (quotes below are reproduced as extracted); a translation of the 1998 text as at 2014 - amendments after 2014 are not reflected; the Hebrew text on nevo.co.il is robots-disallowed and the Knesset site geo-blocks (see decoys)."
}
```
Q | https://www.wipo.int/wipolex/en/text/346739 | [Prepared by WIPO, 2014] [Hebrew Version is controlling]
Q | https://www.wipo.int/wipolex/en/text/346739 | (2) The General Se c u r it y A g e n c y as well as the s e c u r it y un it s
Q | https://www.wipo.int/wipolex/en/text/346739 | (3) The I ns tit u t e f or I n t e lli g e n c e a nd S p e c i a l T a sks
Q | https://www.wipo.int/wipolex/en/text/346739 | (6) The A t o mi c E n e r g y C o mmi ss i o n a nd c e n t e r s

### Freedom of Information Law, 5758-1998 - Cyrilla English text (page 1 of 7 readable)

```json
{
 "id": "il-foi-law-cyrilla",
 "cc": "IL",
 "kind": "law",
 "name": "Freedom of Information Law, 5758-1998 - Cyrilla English text (page 1 of 7 readable)",
 "url": "https://cyrilla.org/en/entity/9k2ywjxyk8d",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "Cyrilla (not read)",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://cyrilla.org/en/entity/9k2ywjxyk8d"
 },
 "use": "Clean English of sections 1-2 (right of citizens and residents; definition of 'public authority').",
 "limits": "Only the first page of the paged viewer is in the HTML; s.14 is not on it - use the WIPO copy."
}
```
Q | https://cyrilla.org/en/entity/9k2ywjxyk8d | Every Israeli citizen and resident has the right to obtain information from a public authority, according to the stipulations of this law.

### Official Hebrew texts: Nevo (nevo.co.il) and the Knesset site

```json
{
 "id": "il-official-law-texts",
 "cc": "IL",
 "kind": "law",
 "name": "Official Hebrew texts: Nevo (nevo.co.il) and the Knesset site",
 "url": "https://www.nevo.co.il/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": null,
  "result": "robots",
  "sample": "nevo.co.il robots-disallowed; knesset.gov.il answers 200 'Unavailable' (geo-block)"
 },
 "use": "Nothing.",
 "limits": "Nevo: robots disallow. Knesset: an HTTP 200 page titled 'Unavailable' for /robots.txt and /Odata/ParliamentInfo.svc/."
}
```
Q | https://knesset.gov.il/Odata/ParliamentInfo.svc/ | The site is temporarily inaccessible from your location

### Government FOI Unit (Ministry of Justice) on gov.il - procedures PDF (Dec 2025)

```json
{
 "id": "il-gov-foi-unit",
 "cc": "IL",
 "kind": "portal",
 "name": "Government FOI Unit (Ministry of Justice) on gov.il - procedures PDF (Dec 2025)",
 "url": "https://www.gov.il/en/departments/units/foi_unit",
 "search": null,
 "api": null,
 "format": "pdf",
 "terms": "not read",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.gov.il/BlobFolder/policy/regulation-2-2/he/freedom_of_information_procedure_foi_commissioner_report_dec2025.pdf (the unit's pages themselves: 403)"
 },
 "use": "Procedure 2.4 (updated 1 Dec 2025) fixes the uniform template in which each ministry's FOI officer must publish an annual report and send the data to the Government FOI Unit by 1 February. The unit's annual national report is presumably the consolidated source (not retrieved).",
 "limits": "gov.il HTML pages answer 403, and gov.il/robots.txt is an 8,605-byte HTML app shell, not a robots file. Only a /BlobFolder/ PDF found by web search was fetchable; the unit's annual FOI report itself was not located."
}
```
Q | https://www.gov.il/BlobFolder/policy/regulation-2-2/he/freedom_of_information_procedure_foi_commissioner_report_dec2025.pdf | לפי סעיף 5(א) לחוק, על הממונה להגיש אחת לשנה דיווח על פעילותו
Q | https://www.gov.il/BlobFolder/policy/regulation-2-2/he/freedom_of_information_procedure_foi_commissioner_report_dec2025.pdf | נוהלי חופש מידע נוהל 2.4 עדכון אחרון1 בדצמבר, 2025

### State Comptroller digital library - 'Freedom of information in local authorities' (2024)

```json
{
 "id": "il-mevaker-foi-local",
 "cc": "IL",
 "kind": "appeals",
 "name": "State Comptroller digital library - 'Freedom of information in local authorities' (2024)",
 "url": "https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/7771-2.aspx",
 "search": null,
 "api": null,
 "format": "html + pdf",
 "terms": "not read",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/7771-2.aspx"
 },
 "use": "Audit report on FOI compliance (full report and summary PDFs linked from the page).",
 "limits": "The PDF itself was not fetched; robots.txt is 404."
}
```
Q | https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/7771-2.aspx | /sites/DigitalLibrary/Documents/2024/Shilton/2024-Shilton-102-Hofesh-Meda.pdf

### Movement for Freedom of Information (meida.org.il) - 'information we obtained' by authority, precedents, litigation

```json
{
 "id": "il-mfoi",
 "cc": "IL",
 "kind": "disclosure-log",
 "name": "Movement for Freedom of Information (meida.org.il) - 'information we obtained' by authority, precedents, litigation",
 "url": "https://www.meida.org.il/",
 "search": "https://www.meida.org.il/?s={q}",
 "api": null,
 "format": "html (Hebrew)",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Israel State Archives",
  "military censor"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.meida.org.il/?s=%D7%A6%D7%A0%D7%96%D7%95%D7%A8 (search for 'censor')"
 },
 "use": "WordPress site: category pages per authority (including the State Archives), a precedents category, and a working GET search. A disclosure log of FOI answers obtained by the NGO.",
 "limits": "robots.txt disallows only /wp-json/ and /?rest_route=, so use HTML categories and search, not the WP REST API. Hebrew."
}
```
Q | https://www.meida.org.il/robots.txt | Disallow: /wp-json/
Q | https://www.meida.org.il/category/%d7%9e%d7%99%d7%93%d7%a2/%d7%90%d7%a8%d7%9b%d7%99%d7%95%d7%9f-%d7%94%d7%9e%d7%93%d7%99%d7%a0%d7%94 | ארכיון המדינה | התנועה לחופש המידע
Q | https://www.meida.org.il/category/precedents | פסקי דין ותקדימים | התנועה לחופש המידע

### Military censor annual figures (2011-2025) - published by the Movement for Freedom of Information from the censor's FOI replies

```json
{
 "id": "il-censor-data",
 "cc": "IL",
 "kind": "program",
 "name": "Military censor annual figures (2011-2025) - published by the Movement for Freedom of Information from the censor's FOI replies",
 "url": "https://www.meida.org.il/18046",
 "search": null,
 "api": null,
 "format": "html (Hebrew)",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "IDF Censor pre-clearance"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.meida.org.il/16717 (2024), /15865 (2023), /18046 (2025), /6513 (2011-2016)"
 },
 "use": "Year-by-year counts of items banned and items partly redacted; the series is found through the MFOI search for 'censor' (annual articles from 2011-2016 to 2025, mixed with unrelated hits).",
 "limits": "MFOI articles are the NGO's presentation of figures the censor supplied; the censor's own replies are not linked in the text read. +972 Magazine's English articles on the same figures refused the crawler (403)."
}
```
Q | https://www.meida.org.il/15865 | הצנזורה ב-2023: השיא נשבר - מנעה פרסום של 613 כתבות
Q | https://www.meida.org.il/16717 | הצנזורה פסלה את פרסומן של 1,635 ידיעות חדשותיות, ואסרה פרסום של חלקים מתוך 6,265 ידיעות נוספות
Q | https://www.meida.org.il/18046 | פעילות הצנזורה ב-2025 - התערבה ב-15 ידיעות ביום בממוצע

### Israel State Archives (archives.gov.il) - online catalogue

```json
{
 "id": "il-isa",
 "cc": "IL",
 "kind": "archive",
 "name": "Israel State Archives (archives.gov.il) - online catalogue",
 "url": "https://www.archives.gov.il/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Dimona",
  "all state records"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "https://www.archives.gov.il/ , /en and /robots.txt all 403"
 },
 "use": "Nothing: refused.",
 "limits": "Not worked around. Third-party routes seen: Akevot's tool over the classified catalogue, and the MFOI category page on the State Archives."
}
```

### IDF and Defense Establishment Archives (archives.mod.gov.il)

```json
{
 "id": "il-idf-archives",
 "cc": "IL",
 "kind": "archive",
 "name": "IDF and Defense Establishment Archives (archives.mod.gov.il)",
 "url": "https://archives.mod.gov.il:443/sites/English/Pages/SearchCatalog.aspx",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "terms-of-use page fetched, not read",
 "key_required": false,
 "programs": [
  "IDF records",
  "Dimona"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://archives.mod.gov.il:443/sites/English/Pages/SearchCatalog.aspx (a form page; no result call made)"
 },
 "use": "Declassification rules and criteria, laws and regulations, terms of use and a catalogue search form (the catalogue is Hebrew-based).",
 "limits": "Search is a form; no GET record URL was found, so no record call was made. robots.txt (141 bytes) disallows only /_layouts/, /_vti_bin/, /_catalogs/."
}
```
Q | https://archives.mod.gov.il:443/sites/English/About/Pages/declassification.aspx | military and defense classified materials are subject to a 50 year limitation schedule, following which it may be open to public scrutiny in the normal procedure.
Q | https://archives.mod.gov.il:443/sites/English/Pages/SearchCatalog.aspx | The Catalog is based on the Hebrew language. It is recommended that you perform the search in Hebrew.
Q | https://archives.mod.gov.il/robots.txt | Disallow: /_layouts/

### Akevot Institute - access-to-archives data sheet (Jan 2026) and the ISA classified-catalogue search tool

```json
{
 "id": "il-akevot",
 "cc": "IL",
 "kind": "archive",
 "name": "Akevot Institute - access-to-archives data sheet (Jan 2026) and the ISA classified-catalogue search tool",
 "url": "https://www.akevot.org.il/en/",
 "search": null,
 "api": null,
 "format": "html + pdf",
 "terms": "not read (robots.txt: empty Disallow)",
 "key_required": false,
 "programs": [
  "Israel State Archives",
  "IDF archives"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.akevot.org.il/wp-content/uploads/2026/01/Akevot-Institute-Access-to-Israeli-Government-Archives-Data-Sheet-Jan-2026.pdf"
 },
 "use": "Counts of files registered versus accessible, built from the archives' own FOI replies (ISA via the Prime Minister's Office, 20 Dec 2025); a news item describing the Hebrew search tool over the ISA's classified-records catalogue.",
 "limits": "An NGO's tabulation; the figures are attributed to FOI replies, not independently audited here. The search tool itself was not probed."
}
```
Q | https://www.akevot.org.il/wp-content/uploads/2026/01/Akevot-Institute-Access-to-Israeli-Government-Archives-Data-Sheet-Jan-2026.pdf | Of the 3,685,776 files4 registered in the Israel State Archives, 700,645 have been fully or partially declassified (19% of the registered files).
Q | https://www.akevot.org.il/wp-content/uploads/2026/01/Akevot-Institute-Access-to-Israeli-Government-Archives-Data-Sheet-Jan-2026.pdf | This archive contains 13,422,974 files,7 of which 54,526 are fully or partially accessible to the public
Q | https://www.akevot.org.il/en/news-item/search-tool-isa-classified-records-catalogue/ | In July 2018, the ISA uploaded a large part of the Classified Records Catalogue, about 250,000 out of 300,000 titles.
Q | https://www.wilsoncenter.org/blog-post/survey-middle-east-archives-israel | Documents deposited into the ISA are closed for 15 years before being available for public release. This time is increased to 50-70 years if deemed necessary for state-security reasons.

### data.gov.il (national open-data portal, CKAN)

```json
{
 "id": "il-datagov",
 "cc": "IL",
 "kind": "disclosure-log",
 "name": "data.gov.il (national open-data portal, CKAN)",
 "url": "https://data.gov.il/",
 "search": null,
 "api": "https://data.gov.il/api/ (robots-disallowed)",
 "format": "n/a",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "https://data.gov.il/he/datasets 403; robots.txt Disallow: /api/"
 },
 "use": "Nothing.",
 "limits": "Pages 403 and the CKAN API is disallowed by robots.txt."
}
```
Q | https://data.gov.il/robots.txt | Disallow: /api/


## Russia

**What does not exist.** Russia has no FOI regime comparable to the others in this file: Federal Law 8-FZ (2009) covers *information about the activities of state bodies*, the state-secrets law prevails over it (RTI Rating, quoted below), no disclosure log or appeals-decision series that this crawler could read was found; the Federal Archival Agency's site did not answer. What the crawler can lawfully use are proxies held outside Russia (Hoover Fond 89, the Bukovsky copies, the Churchill Mitrokhin papers) and Russian press reports of current practice. The report's table row says 'No comprehensive FOIA equivalent': 8-FZ exists and the row should name it. The row's 'Putin sealed presidential archives for 30 years in 2006' was not checked here.

### Federal Law No. 8-FZ of 9 Feb 2009 'On Providing Access to Information on the Activities of Government Bodies and Bodies of Local Self-Government' - English text on Cyrilla

```json
{
 "id": "ru-8fz-law-cyrilla",
 "cc": "RU",
 "kind": "law",
 "name": "Federal Law No. 8-FZ of 9 Feb 2009 'On Providing Access to Information on the Activities of Government Bodies and Bodies of Local Self-Government' - English text on Cyrilla",
 "url": "https://cyrilla.org/en/entity/v77kx9jefx8",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "Cyrilla (not read)",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://cyrilla.org/en/entity/v77kx9jefx8"
 },
 "use": "English text of the law as amended to 2013; page 1 of 17 of the paged viewer is readable.",
 "limits": "A translation, third-party; it is a law on information about the activities of state bodies, not a general right to documents, and state-secrets law prevails (see the rating below). The official texts failed: pravo.gov.ru returned 503, the Rosstat-hosted PDF failed TLS verification (certificate not trusted by the system store; not bypassed)."
}
```
Q | https://cyrilla.org/en/entity/v77kx9jefx8 | Federal Law On Providing Access to Information on the Activities of Government Bodies and Bodies of Local Self-Government
Q | https://cyrilla.org/en/entity/v77kx9jefx8 | Adopted by the State Duma on January 21, 2009

### RTI Rating (Centre for Law and Democracy / Access Info) - Russia assessment

```json
{
 "id": "ru-rti-rating",
 "cc": "RU",
 "kind": "appeals",
 "name": "RTI Rating (Centre for Law and Democracy / Access Info) - Russia assessment",
 "url": "https://www.rti-rating.org/country-data/Russia/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.rti-rating.org/country-data/Russia/"
 },
 "use": "Scored article-by-article assessment (98 of 150) of the 2009 law, with the exceptions regime criticised.",
 "limits": "An NGO's rating of the statute, not a record of practice."
}
```
Q | https://www.rti-rating.org/country-data/Russia/ | Russia's RTI rating varies significantly across the categories, leading to a slightly above average score.
Q | https://www.rti-rating.org/country-data/Russia/ | State secrets law is not trumped by the RTI law, which permits further situations where exceptions are possible.

### Federal Archival Agency (Rosarkhiv) and archives.ru / GARF

```json
{
 "id": "ru-rusarchives",
 "cc": "RU",
 "kind": "archive",
 "name": "Federal Archival Agency (Rosarkhiv) and archives.ru / GARF",
 "url": "https://rusarchives.ru/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "KGB archive access"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": null,
  "result": "transport_error",
  "sample": "https://rusarchives.ru/ (twice) and /robots.txt (once): connection reset by peer"
 },
 "use": "Nothing reached.",
 "limits": "rusarchives.ru and archives.ru: the TCP connection is reset (not a documented refusal; do not read it as proof of a geo-block). garf.su (State Archive of the Russian Federation) answered 403, a refusal recorded as a null."
}
```

### Rosarkhiv order no. 38 of 20 March 2025 (restricted official information list) - press reports

```json
{
 "id": "ru-rosarkhiv-order-38",
 "cc": "RU",
 "kind": "appeals",
 "name": "Rosarkhiv order no. 38 of 20 March 2025 (restricted official information list) - press reports",
 "url": "https://meduza.io/news/2025/10/06/rosarhiv-ogranichil-issledovatelyam-dostup-k-delam-zhertv-politicheskih-repressiy",
 "search": null,
 "api": null,
 "format": "html (Russian)",
 "terms": "news reports",
 "key_required": false,
 "programs": [
  "access to files of the politically repressed"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://novayagazeta.ru/articles/2025/10/01/pod-grifom-snova-sekretno"
 },
 "use": "Two Russian outlets report that an agency order lets archives add documents to a 'restricted official information' list; read as attributed reporting on current practice.",
 "limits": "Secondary: the order itself was not retrieved. Both outlets are carried as reported."
}
```
Q | https://meduza.io/news/2025/10/06/rosarhiv-ogranichil-issledovatelyam-dostup-k-delam-zhertv-politicheskih-repressiy | Исследователь предполагает, что отказ связан с приказом Росархива № 38 от 20 марта 2025 года.
Q | https://novayagazeta.ru/articles/2025/10/01/pod-grifom-snova-sekretno | ведомственный порядок позволяет фактически переворачивать закон

### Wilson Center Digital Archive (digitalarchive.wilsoncenter.org)

```json
{
 "id": "ru-wilson-digital-archive",
 "cc": "RU",
 "kind": "archive",
 "name": "Wilson Center Digital Archive (digitalarchive.wilsoncenter.org)",
 "url": "https://digitalarchive.wilsoncenter.org/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [
  "Cold War documents from Russian/Soviet archives"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": null,
  "result": "transport_error",
  "sample": "proxy tunnel returned 502 Bad Gateway for digitalarchive.wilsoncenter.org (robots.txt and root)"
 },
 "use": "Nothing reached.",
 "limits": "Failure is at the agent proxy for this host (502 on the tunnel), not a documented refusal by the Wilson Center. https://www.wilsoncenter.org/digital-archive loads (200) but is a stub that only points to the unreachable host."
}
```

### Mitrokhin Archive (MITN) - Churchill Archives Centre, Cambridge

```json
{
 "id": "ru-churchill-mitrokhin",
 "cc": "RU",
 "kind": "program",
 "name": "Mitrokhin Archive (MITN) - Churchill Archives Centre, Cambridge",
 "url": "https://archives.chu.cam.ac.uk/?p=2965",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "KGB foreign-intelligence archive notes (Mitrokhin)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://archives.chu.cam.ac.uk/?p=2965 (finding aid in ArchiveSearch: https://archivesearch.lib.cam.ac.uk/ - 403)"
 },
 "use": "Collection description and access statement; the item-level catalogue is the University's ArchiveSearch.",
 "limits": "archivesearch.lib.cam.ac.uk answered 403 on robots.txt and on two record pages, so item-level access conditions could not be read here."
}
```
Q | https://archives.chu.cam.ac.uk/?p=2965 | are now open for consultation at the Churchill Archives Centre

### Hoover Institution - Archives of the Soviet Communist Party and Soviet State (microfilm), incl. Fond 89 from the 1992 Constitutional Court trial of the CPSU

```json
{
 "id": "ru-hoover-fond89",
 "cc": "RU",
 "kind": "program",
 "name": "Hoover Institution - Archives of the Soviet Communist Party and Soviet State (microfilm), incl. Fond 89 from the 1992 Constitutional Court trial of the CPSU",
 "url": "https://www.hoover.org/library-archives/collections/archives-soviet-communist-party-and-soviet-state-microfilm-collection",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Yeltsin-era releases of party and KGB-related documents"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "same URL (digitalcollections.hoover.org: 403)"
 },
 "use": "Collection page with finding-aid description of Fond 89 (three thousand documents, 10,000 pages).",
 "limits": "Hoover's digital-collections host refused the crawler (403). A catalogue of KGB file releases as such was not found; Fond 89 is the nearest."
}
```
Q | https://www.hoover.org/library-archives/collections/archives-soviet-communist-party-and-soviet-state-microfilm-collection | Fond 89 is the designation for the three thousand documents (10,000 pages) submitted to the Constitutional Court of the Russian Federation for the trial of the Communist Party

### Bukovsky Archive - copies made in 1992 from the CPSU Central Committee archive

```json
{
 "id": "ru-bukovsky",
 "cc": "RU",
 "kind": "program",
 "name": "Bukovsky Archive - copies made in 1992 from the CPSU Central Committee archive",
 "url": "https://bukovsky-archive.com/2018/09/07/concerning-these-archives/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "not read",
 "key_required": false,
 "programs": [
  "Yeltsin-era access to Central Committee documents (1992)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "same URL"
 },
 "use": "The archive's own account of how the copies were made.",
 "limits": "Provenance statement from the archive holder; a different TLD (.net) failed at the proxy."
}
```
Q | https://bukovsky-archive.com/2018/09/07/concerning-these-archives/ | With a hand-held scanner, he copied several thousand pages of Secret and Top Secret documents


## European Union (Regulation 1049/2001)

The EU regime is Regulation (EC) No 1049/2001; the institutions' registers are the disclosure logs, AsktheEU is the civil log, the Ombudsman and the Court are the appeal route.

### AsktheEU.org (Alaveteli) - requests under Regulation 1049/2001

```json
{
 "id": "eu-asktheeu",
 "cc": "EU",
 "kind": "civil-log",
 "name": "AsktheEU.org (Alaveteli) - requests under Regulation 1049/2001",
 "url": "https://www.asktheeu.org/",
 "search": null,
 "api": "https://www.asktheeu.org/request/{slug}.json and /body/{body}.json",
 "format": "html + json",
 "terms": "site content CC BY-SA (footer); request text and replies not read",
 "key_required": false,
 "programs": [
  "EU access-to-documents requests (Council, Commission, Parliament, agencies)"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://www.asktheeu.org/request/dg_trade_contacts_with_industry.json"
 },
 "use": "159 public authorities listed; request and body pages with .json versions.",
 "limits": "robots.txt disallows */search/*, */feed/*, */request/*/response/* (individual replies) and */request/*/download*, so no search and no reply bodies; the help page says it has no full API."
}
```
Q | https://www.asktheeu.org/robots.txt | Disallow: */search/*
Q | https://www.asktheeu.org/robots.txt | Disallow: */request/*/response/*
Q | https://www.asktheeu.org/help/api | AsktheEU.org does not have a full API yet
Q | https://www.asktheeu.org/help/api | Adding .json to the end of the URL.
Q | https://www.asktheeu.org/help/about | The EU rules are called Regulation 1049/2001 on Access to EU Documents.
Q | https://www.asktheeu.org/en/body/list/all | Found 159 public authorities
Q | https://www.asktheeu.org/request/dg_trade_contacts_with_industry.json | "described_state":"partially_successful"

### Regulation (EC) No 1049/2001 - official text

```json
{
 "id": "eu-reg1049-text",
 "cc": "EU",
 "kind": "law",
 "name": "Regulation (EC) No 1049/2001 - official text",
 "url": "https://eur-lex.europa.eu/eli/reg/2001/1049/oj",
 "search": null,
 "api": "https://publications.europa.eu/resource/celex/32001R1049",
 "format": "html (EUR-Lex) / rdf+xml (Cellar)",
 "terms": "not read",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 202,
  "result": "refused",
  "sample": "EUR-Lex (3 URLs) and data.europa.eu/eli answer HTTP 202, an access challenge, not content; Cellar resource URL answered 200"
 },
 "use": "The Cellar 'celex' resource for 32001R1049 returns a 73,222,182-byte RDF/XML notice: the regulation's own identifiers (ELI sameAs links) plus about 92,000 work_cited_by_work annotations and some 5,700 distinct case-law CELEX numbers (sector 6) in citation relations with it. A lawful machine-readable map of the case law on Reg. 1049/2001.",
 "limits": "No article text; EUR-Lex itself is walled. The Cellar response values sit in XML attributes, so they cannot be quoted through the text layer; verify by sha256 in the ledger. Fetch once and cache."
}
```

### Publications Office Cellar SPARQL endpoint

```json
{
 "id": "eu-cellar-sparql",
 "cc": "EU",
 "kind": "archive-api",
 "name": "Publications Office Cellar SPARQL endpoint",
 "url": "https://publications.europa.eu/webapi/rdf/sparql",
 "search": null,
 "api": "https://publications.europa.eu/webapi/rdf/sparql?query={sparql}&format=application%2Fsparql-results%2Bjson",
 "format": "json",
 "terms": "not read",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "a SELECT ... LIMIT 1 query returned one binding"
 },
 "use": "Lets the crawler list the cases and acts that cite Reg. 1049/2001 without downloading the 73 MB notice.",
 "limits": "Ontology not explored; robots.txt for the host was not read separately."
}
```
Q | https://publications.europa.eu/webapi/rdf/sparql?query=SELECT%20%3Fs%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo%7D%20LIMIT%201&format=application%2Fsparql-results%2Bjson | "value": "http://publications.europa.eu/ontology/cdm/cmr#metsStructSubDiv"

### European Commission register of documents (ec.europa.eu/transparency/documents-register)

```json
{
 "id": "eu-commission-register",
 "cc": "EU",
 "kind": "disclosure-log",
 "name": "European Commission register of documents (ec.europa.eu/transparency/documents-register)",
 "url": "https://ec.europa.eu/transparency/documents-register/",
 "search": null,
 "api": null,
 "format": "html (JS app)",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "decoy",
  "sample": "55,040 bytes; the only text is the title 'Register of Commission Documents'; /api/ answered 503"
 },
 "use": "Nothing from a plain client.",
 "limits": "robots.txt allows the path, but the register is a script application with no server-rendered records."
}
```
Q | https://ec.europa.eu/transparency/documents-register/ | Register of Commission Documents

### Council of the EU public register

```json
{
 "id": "eu-council-register",
 "cc": "EU",
 "kind": "disclosure-log",
 "name": "Council of the EU public register",
 "url": "https://www.consilium.europa.eu/en/documents-publications/public-register/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "page and robots.txt both 403"
 },
 "use": "Nothing: refused.",
 "limits": "Not worked around."
}
```

### European Parliament Open Data API v2 (documents, adopted texts, questions, committee documents)

```json
{
 "id": "eu-ep-open-data",
 "cc": "EU",
 "kind": "archive-api",
 "name": "European Parliament Open Data API v2 (documents, adopted texts, questions, committee documents)",
 "url": "https://data.europarl.europa.eu/api/v2/",
 "search": null,
 "api": "https://data.europarl.europa.eu/api/v2/{resource}?limit=1&format=application%2Fld%2Bjson",
 "format": "json-ld",
 "terms": "CC BY 4.0 (stated in the OpenAPI document); 500 requests per 5 minutes",
 "key_required": false,
 "programs": [
  "Parliament documents released under Reg. 1049/2001"
 ],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "ok",
  "sample": "https://data.europarl.europa.eu/api/v2/adopted-texts?limit=1&format=application%2Fld%2Bjson"
 },
 "use": "Documented, keyless, licensed API; about twenty resource families including /documents, /external-documents and /parliamentary-questions.",
 "limits": "It exposes Parliament's published documents, not its access-to-documents register; robots.txt asks for Crawl-delay: 2."
}
```
Q | https://data.europarl.europa.eu/api/v2/ | "license":{"name":"CC BY 4.0 - Attribution 4.0 International"
Q | https://data.europarl.europa.eu/api/v2/ | Maximum number of requests 500 in 5min.
Q | https://data.europarl.europa.eu/robots.txt | Crawl-delay: 2

### European Ombudsman - decisions on access-to-documents complaints

```json
{
 "id": "eu-ombudsman",
 "cc": "EU",
 "kind": "appeals",
 "name": "European Ombudsman - decisions on access-to-documents complaints",
 "url": "https://www.ombudsman.europa.eu/en/decisions",
 "search": null,
 "api": null,
 "format": "html (JS app)",
 "terms": "not read; robots.txt carries a Content-Signal",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 200,
  "result": "decoy",
  "sample": "3,196 bytes, text 'European Ombudsman Loading . . .'"
 },
 "use": "Nothing from a plain client.",
 "limits": "JS shell; no server-rendered decisions."
}
```
Q | https://www.ombudsman.europa.eu/en/decisions | European Ombudsman Loading
Q | https://ombudsman.europa.eu/robots.txt | Content-Signal: ai-train=yes, search=yes, ai-input=yes

### Court of Justice (curia.europa.eu) and europarl.europa.eu main site

```json
{
 "id": "eu-curia-and-parliament-sites",
 "cc": "EU",
 "kind": "appeals",
 "name": "Court of Justice (curia.europa.eu) and europarl.europa.eu main site",
 "url": "https://curia.europa.eu/",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": 403,
  "result": "refused",
  "sample": "robots.txt 403 on both hosts"
 },
 "use": "Nothing.",
 "limits": "Case law on Reg. 1049/2001 is reachable only through the Cellar graph above."
}
```

### data.europa.eu SPARQL (OpenLink Virtuoso editor)

```json
{
 "id": "eu-data-europa-sparql",
 "cc": "EU",
 "kind": "archive-api",
 "name": "data.europa.eu SPARQL (OpenLink Virtuoso editor)",
 "url": "https://data.europa.eu/sparql",
 "search": null,
 "api": null,
 "format": "html",
 "terms": "n/a",
 "key_required": false,
 "programs": [],
 "probe": {
  "date": "2026-10-24",
  "status": null,
  "result": "robots",
  "sample": "a GET with ?query= is disallowed by robots.txt (Disallow: /*?query=*); the editor page itself loads"
 },
 "use": "Nothing by GET; use the Cellar endpoint.",
 "limits": "Robots disallow on query strings."
}
```
Q | https://data.europa.eu/robots.txt | Disallow: /*?query=*

## Decoy candidates for hosts.json

Format follows `scripts/spider/hosts.json` (decoy by title, byte length or body marker). `boi.org.il` ("Radware Page") is already registered and is not repeated.

| host | what answers with HTTP 200 | marker to register | why |
|---|---|---|---|
| francearchives.gouv.fr | `/fr/` 225 B, `/fr/search?q=...` 247 B, a `/file/...pdf` 355 B | body `This website requires JS enabled and cookies` | a JS/cookie wall in place of every page and file; nothing downstream would notice |
| www.vie-publique.fr | `/sites/default/files/rapport/pdf/194000689.pdf` 267 B | same body string | PDF path answered with the JS/cookie wall |
| www.uhk-bnd.de | `/` 100,680 B, title `Sportwetten Deutschland 2026: Neue Anbieter, Boni & Recht` | title | the BND historians' commission domain (cited in Bundestag Drucksache 19/29966) now belongs to a betting site; any ledger row from it would be a wrong source |
| www.stasi-unterlagen-archiv.de | every path (`/`, `/stasi-unterlagen-archiv/rechtsgrundlagen/`, `/.../findmittel/`, ...) 235,394-235,395 B, title `Stasi-Unterlagen-Archiv - Bundesarchiv` | byte length 235,394 / 235,395 (host-wide) | alias domain returns the homepage for every path; the same paths on www.bundesarchiv.de are real (110-140 KB) |
| digitaler-lesesaal.bundesarchiv.de | `/` 21,570 B, title starts `Bitte haben Sie einen Moment Geduld.` | title | interstitial wait page, not the digitised reading room |
| knesset.gov.il, main.knesset.gov.il | `/robots.txt` and `/Odata/ParliamentInfo.svc/` 131,618 B, title `Unavailable` | title `Unavailable` or body `The site is temporarily inaccessible from your location` | a geo-block served as a normal page; also makes robots.txt unreadable |
| supreme.court.gov.il | `/robots.txt` 229,362 B HTML, title `בית המשפט העליון של ישראל` | content type html on a robots path | an app shell where robots.txt should be |
| www.gov.il | `/robots.txt` 8,605 B HTML, title `govil - אתר השירותים והמידע הממשלתי` | content type html on a robots path | an app shell where robots.txt should be (pages themselves 403) |
| ec.europa.eu | `/transparency/documents-register/` 55,040 B, text `Register of Commission Documents` only | path + title | script application, no server-rendered records |
| www.ombudsman.europa.eu | `/en/decisions` 3,196 B, text `European Ombudsman Loading . . .` | body `Loading . . .` | script application, no server-rendered decisions |

Not 200 but worth knowing: `eur-lex.europa.eu` (3 URLs) and `data.europa.eu/eli/...` answer HTTP 202 with a challenge; the spider already records them as not ok.

## Nulls

Refusals and failures, each a finding and none retried under another identity (a transport error got one same-identity retry).

- 403: `legifrance.gouv.fr` (home, robots.txt, CRPA section); `cada.fr/resultats-rechercher-un-avis?body_value=...` (twice; the second after fixing an unencoded accent in the first); `invenio.bundesarchiv.de`; `archives.gov.il` (home, /en, robots.txt); `gov.il/en/departments/units/foi_unit`; `data.gov.il/he/datasets`; `consilium.europa.eu` (robots.txt and the public register); `curia.europa.eu/robots.txt`; `europarl.europa.eu/robots.txt`; `972mag.com` (censor article); `archivesearch.lib.cam.ac.uk` (robots and two records); `digitalcollections.hoover.org`; `garf.su`.
- robots disallow: `nevo.co.il`; `siv.archives-nationales.culture.gouv.fr` (the Archives nationales' online inventories); BfDI `/DE/Service/Publikationen/Taetigkeitsberichte/...`; `data.europa.eu/sparql?query=...` (Disallow: /*?query=*). Also by rule though not fetched: `madada.fr` and `asktheeu.org` */search/* and */request/*/response/*; `data.gouv.fr` /datasets/r/ and *.csv list exports; `archivportal-d.de` /objekte, /personen; `deutsche-digitale-bibliothek.de` /search.
- 404 (wrong path of ours, not a finding about the host): BfDI Informationsfreiheit_node under /DE/Fachthemen/..., the Commission access-documents page, `gouvernement.fr` 2016 CIVEN PDF.
- 503: `ec.europa.eu/transparency/documents-register/api/`, `pravo.gov.ru/`.
- Transport errors (connection reset, TLS or proxy): `rusarchives.ru`, `archives.ru`, `anom.archivesnationales.culture.gouv.fr`, `cada.data.gouv.fr`, `www.data.gouv.fr` HTML dataset pages (reset, one read timeout), `digitalarchive.wilsoncenter.org` (proxy 502), `rosstat.gov.ru` (certificate not trusted - not bypassed), `memoiredeshommes.sga.defense.gouv.fr` (certificate expired - not bypassed), `bukovsky-archive.net` (our wrong TLD guess; `.com` works).
- Not found at all (no URL located, not a refusal): the official Journal officiel text of the 9 Sept 2019 Audin arrêté; the Israeli government FOI unit's annual national report; the Israel State Archives annual report; the CADA opinions after April 2024 in open-data form; the Wilson Center Digital Archive's Russian collections.

## Sources fetched

Every URL below carries the ledger note `foi europe: ...` in `research/sources/ledger.jsonl` (225 distinct URLs; last attempt shown).

- 403  http_403  https://www.legifrance.gouv.fr/robots.txt
- 200  ok  https://www.cada.fr/
- 200  ok  https://www.cada.fr/robots.txt
- 200  ok  https://www.data.gouv.fr/robots.txt
- robots_disallow  robots_disallow  https://www.nevo.co.il/
- 200  ok  https://fragdenstaat.de/robots.txt
- 403  http_403  https://invenio.bundesarchiv.de/
- 200  ok  https://www.asktheeu.org/robots.txt
- 200  ok  https://fragdenstaat.de/
- 200  ok  https://www.bundesarchiv.de/robots.txt
- 200  ok  https://fragdenstaat.de/api/
- 200  ok  https://www.asktheeu.org/
- 200  ok  https://www.gesetze-im-internet.de/ifg/BJNR272200005.html
- 200  ok  https://main.knesset.gov.il/robots.txt
- 202  http_202  https://eur-lex.europa.eu/eli/reg/2001/1049/oj
- 200  ok  https://www.bundesarchiv.de/
- 200  ok  https://fragdenstaat.de/api/v1/
- 403  http_403  https://www.archives.gov.il/
- 202  http_202  https://eur-lex.europa.eu/robots.txt
- 403  http_403  https://www.archives.gov.il/robots.txt
- 403  http_403  https://www.consilium.europa.eu/robots.txt
- 200  ok  https://fragdenstaat.de/api/v1/request/?format=json
- 200  ok  https://www.gov.il/robots.txt
- 403  http_403  https://www.consilium.europa.eu/en/documents-publications/public-register/
- 200  ok  https://www.stasi-unterlagen-archiv.de/
- 200  ok  https://ec.europa.eu/transparency/documents-register/
- 200  ok  https://ec.europa.eu/robots.txt
- 200  ok  https://www.stasi-unterlagen-archiv.de/robots.txt
- 200  ok  https://www.meida.org.il/
- 200  ok  https://www.gesetze-im-internet.de/robots.txt
- 200  ok  https://www.meida.org.il/robots.txt
- 200  ok  https://www.bfdi.bund.de/
- 200  ok  https://www.bfdi.bund.de/robots.txt
- 200  ok  https://fragdenstaat.de/api/v1/document/?format=json&limit=2
- 200  ok  https://fragdenstaat.de/api/v1/request/?format=json&q=BND&limit=3
- 200  ok  https://fragdenstaat.de/api/v1/publicbody/?format=json&q=Bundesnachrichtendienst
- 200  ok  https://fragdenstaat.de/api/v1/schema
- 200  ok  https://fragdenstaat.de/nutzungsbedingungen/
- 200  ok  https://fragdenstaat.de/api/v1/law/?format=json
- 200  ok  https://fragdenstaat.de/api/v1/request/?format=json&publicbody=98&limit=3
- 200  ok  https://fragdenstaat.de/api/v1/request/?format=json&public_body=98&limit=3
- 202  http_202  https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32001R1049
- 200  ok  https://www.deutsche-digitale-bibliothek.de/robots.txt
- 200  ok  https://francearchives.gouv.fr/fr/search?q=Maurice+Audin
- 200  ok  https://www.akevot.org.il/en/
- 200  ok  https://data.europa.eu/robots.txt
- 200  ok  https://francearchives.gouv.fr/fr/
- 200  ok  https://www.archivportal-d.de/robots.txt
- 200  ok  https://ombudsman.europa.eu/robots.txt
- 200  ok  https://www.akevot.org.il/wp-content/uploads/2026/01/Akevot-Institute-Access-to-Israeli-Government-Archives-Data-Sheet-Jan-2026.pdf
- 200  ok  https://dserver.bundestag.de/btd/19/299/1929966.pdf
- 200  ok  https://www.archives-nationales.culture.gouv.fr/
- 200  ok  https://data.europarl.europa.eu/robots.txt
- 200  ok  https://data.gov.il/robots.txt
- 200  ok  https://www.uhk-bnd.de/
- 403  http_403  https://www.gov.il/en/departments/units/foi_unit
- 200  ok  https://www.data.gouv.fr/api/1/datasets/53698f37a3a729239d2036a0/
- 200  ok  https://www.servicehistorique.sga.defense.gouv.fr/
- transport_error  transport_error  https://rusarchives.ru/
- 200  ok  https://histoirecoloniale.net/wp-content/uploads/2021/12/arrete_paru_au_journal_officiel_du_23_decembre_2021.pdf
- 200  ok  https://www.vie-publique.fr/sites/default/files/rapport/pdf/194000689.pdf
- 200  ok  https://www.rti-rating.org/country-data/Russia/
- 200  ok  https://cyrilla.org/en/entity/v77kx9jefx8
- 403  http_403  https://archivesearch.lib.cam.ac.uk/robots.txt
- 200  ok  https://dserver.bundestag.de/btd/20/021/2002192.pdf
- 403  http_403  https://archivesearch.lib.cam.ac.uk/repositories/9/resources/1716
- 200  ok  https://www.journal-officiel.gouv.fr/
- 200  ok  https://www.aufbau-verlage.de/ch-links-verlag/das-sozialprofil-des-bundesnachrichtendienstes/978-3-86153-920-9
- 403  http_403  https://archivesearch.lib.cam.ac.uk/repositories/9/archival_objects/461432
- 403  http_403  https://www.legifrance.gouv.fr/
- 200  ok  https://www.aufbau-verlage.de/robots.txt
- 200  ok  https://static.data.gouv.fr/robots.txt
- 404  http_404  https://echanges.dila.gouv.fr/robots.txt
- 200  ok  https://www.wipo.int/wipolex/en/text/346739
- 404  http_404  https://www.bfdi.bund.de/DE/Fachthemen/Inhalte/Informationsfreiheit/Informationsfreiheit_node.html
- 200  ok  https://www.asktheeu.org/en/body/list/all
- 200  ok  https://echanges.dila.gouv.fr/OPENDATA/
- 200  ok  https://www.bverwg.de/robots.txt
- 200  ok  https://www.stasi-unterlagen-archiv.de/stasi-unterlagen-archiv/das-stasi-unterlagen-archiv-in-zahlen/
- 200  ok  https://knesset.gov.il/Odata/ParliamentInfo.svc/
- 200  ok  https://cyrilla.org/en/entity/9k2ywjxyk8d
- 200  ok  https://echanges.dila.gouv.fr/OPENDATA/LEGI/
- 403  http_403  https://data.gov.il/he/datasets
- 403  http_403  https://www.972mag.com/israeli-military-censor-media-2024/
- 200  ok  https://www.asktheeu.org/en/help/about
- 403  http_403  https://www.archives.gov.il/en
- 200  ok  https://www.bnd.de/robots.txt
- 200  ok  https://www.stasi-unterlagen-archiv.de/stasi-unterlagen-archiv/findmittel/
- 200  ok  https://www.akevot.org.il/en/news-item/search-tool-isa-classified-records-catalogue/
- 200  ok  https://www.stasi-unterlagen-archiv.de/stasi-unterlagen-archiv/rechtsgrundlagen/
- 200  ok  https://supreme.court.gov.il/robots.txt
- 200  ok  https://www.stasi-unterlagen-archiv.de/im-archiv-recherchieren/stasi-unterlagen-einsehen/forschung-und-medien/
- 200  ok  https://digitaler-lesesaal.bundesarchiv.de/
- 200  ok  https://publications.europa.eu/resource/celex/32001R1049
- 200  ok  https://data.europarl.europa.eu/api/v2/
- 200  ok  https://www.ombudsman.europa.eu/en/decisions
- 200  ok  https://www.asktheeu.org/request/dg_trade_contacts_with_industry
- 200  ok  https://www.asktheeu.org/request/dg_trade_contacts_with_industry.json
- transport_error  transport_error  https://www.data.gouv.fr/fr/datasets/avis-de-la-cada/
- 200  ok  https://www.asktheeu.org/body/list/all
- 403  http_403  https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000031366350/LEGISCTA000031367472/
- 200  ok  https://www.asktheeu.org/help/about
- 200  ok  https://madada.fr/robots.txt
- 200  ok  https://madada.fr/
- 200  ok  https://francearchives.gouv.fr/robots.txt
- 200  ok  https://francearchives.gouv.fr/
- 200  ok  https://www.bundesarchiv.de/im-archiv-recherchieren/stasi-unterlagen-einsehen/
- 200  ok  https://www.bundesarchiv.de/stasi-unterlagen-archiv/rechtsgrundlagen/
- 404  http_404  https://www.bundesarchiv.de/nonexistent-path-b0b-probe/
- 200  ok  https://www.cada.fr/rechercher-un-avis
- 200  ok  https://www.cada.fr/20246468
- 200  ok  https://www.cada.fr/lacada/rapport-dactivite-2025
- 200  ok  https://www.assemblee-nationale.fr/robots.txt
- 404  http_404  https://www.gouvernement.fr/upload/media/organization/0001/01/sites_default_files_contenu_piece-jointe_2021_05_rapport_annuel_dactivite_2016.pdf
- 200  ok  https://madada.fr/body/list/all
- 200  ok  https://1000autres.org/
- 200  ok  https://www.assemblee-nationale.fr/dyn/17/comptes-rendus/ceesnuc/l17ceesnuc2425005_compte-rendu.pdf
- 200  ok  https://www.service-public.pf/dscen/recherche-et-documentation/
- 200  ok  https://madada.fr/body/gouvernement
- 200  ok  https://1000autres.org/robots.txt
- 200  ok  https://histoirecoloniale.net/robots.txt
- 200  ok  https://www.service-public.pf/robots.txt
- 200  ok  https://www.assemblee-nationale.fr/dyn/17/rapports/ceesnuc/l17b1558-tii_rapport-enquete.pdf
- 200  ok  https://madada.fr/body/cnil
- 403  http_403  https://www.cada.fr/resultats-rechercher-un-avis?body_value=algérie+archives
- 200  ok  https://www.asktheeu.org/help/api
- 200  ok  https://madada.fr/help/api
- 200  ok  https://madada.fr/body/gouvernement.json
- 200  ok  https://madada.fr/request/demande_de_communication_de_docu_145.json
- transport_error  transport_error  https://rusarchives.ru/robots.txt
- 200  ok  https://madada.fr/request/demande_de_communication_de_docu_145
- 200  ok  https://www.bundesarchiv.de/stasi-unterlagen-archiv/das-stasi-unterlagen-archiv-in-zahlen/
- 200  ok  https://www.bundesarchiv.de/stasi-unterlagen-archiv/findmittel/
- 200  ok  https://www.bundesarchiv.de/im-archiv-recherchieren/stasi-unterlagen-einsehen/forschung-und-medien/
- 200  ok  https://digitalcollections.hoover.org/robots.txt
- 200  ok  https://archives.chu.cam.ac.uk/?p=2965
- 200  ok  https://archives.chu.cam.ac.uk/robots.txt
- transport_error  transport_error  https://digitalarchive.wilsoncenter.org/robots.txt
- 403  http_403  https://digitalcollections.hoover.org/
- transport_error  transport_error  https://legislationline.org/taxonomy/term/27020
- 200  ok  https://leap.unep.org/en/countries/ru/national-legislation/federal-law-no-8-fz-ensuring-access-information-activities-state
- 200  ok  https://www.hoover.org/library-archives/collections/archives-soviet-communist-party-and-soviet-state-microfilm-collection
- 200  ok  https://meduza.io/news/2025/10/06/rosarhiv-ogranichil-issledovatelyam-dostup-k-delam-zhertv-politicheskih-repressiy
- 200  ok  https://bukovsky-archive.com/2018/09/07/concerning-these-archives/
- 200  ok  https://novayagazeta.ru/articles/2025/10/01/pod-grifom-snova-sekretno
- 200  ok  https://www.hoover.org/robots.txt
- 200  ok  https://bukovsky-archive.com/robots.txt
- 403  http_403  https://www.cada.fr/resultats-rechercher-un-avis?body_value=algerie
- robots_disallow  robots_disallow  https://www.siv.archives-nationales.culture.gouv.fr/
- 503  http_503  https://ec.europa.eu/transparency/documents-register/api/
- 200  ok  https://echanges.dila.gouv.fr/OPENDATA/LEGI/DILA_LEGI_Presentation_20170824.pdf
- 200  ok  https://francearchives.gouv.fr/file/8e5f699ecbd3710af2fe0bff8a8a55e33b16c598/Un%20an%20d%E2%80%99actualit%C3%A9s%20l%C3%A9gislatives_Version%20%C3%A0%20diffuser.pdf
- 200  ok  https://echanges.dila.gouv.fr/OPENDATA/JORF/
- 200  ok  https://echanges.dila.gouv.fr/OPENDATA/JADE/
- 200  ok  https://static.data.gouv.fr/resources/avis-et-conseils-de-la-cada/20260814-171306/export-reutilisation-avril-2024.csv
- transport_error  transport_error  https://www.data.gouv.fr/datasets/avis-et-conseils-de-la-cada
- 200  ok  https://www.gov.il/BlobFolder/policy/regulation-2-2/he/freedom_of_information_procedure_foi_commissioner_report_dec2025.pdf
- 200  ok  https://archives.mod.gov.il/robots.txt
- 200  ok  https://dserver.bundestag.de/btd/19/199/1919910.pdf
- 200  ok  https://www.akevot.org.il/en/?p=4863
- 200  ok  https://netzpolitik.org/2017/informationsfreiheitsgesetz-sinkende-anzahl-bei-beschwerden-und-eingaben/
- 200  ok  https://archives.mod.gov.il:443/sites/English/About/Pages/datafiles.aspx
- 200  ok  https://library.mevaker.gov.il/sites/DigitalLibrary/Pages/Reports/7771-2.aspx
- 200  ok  https://www.akevot.org.il/robots.txt
- 200  ok  https://mod.gov.il/en/departments/idf-defense-establishment-archives
- 200  ok  https://www.wilsoncenter.org/blog-post/survey-middle-east-archives-israel
- 404  http_404  https://library.mevaker.gov.il/robots.txt
- transport_error  transport_error  https://www.data.gouv.fr/explore/cada
- transport_error  transport_error  https://bukovsky-archive.net/
- 200  ok  https://archives.mod.gov.il:443/sites/English/Pages/SearchCatalog.aspx
- 200  ok  https://archives.mod.gov.il:443/sites/English/About/Pages/declassification.aspx
- 200  ok  https://archives.mod.gov.il:443/sites/English/About/Pages/laws-and-regulations.aspx
- 200  ok  https://data.europa.eu/sparql
- transport_error  transport_error  https://digitalarchive.wilsoncenter.org/
- 200  ok  https://commission.europa.eu/robots.txt
- 200  ok  https://www.wilsoncenter.org/robots.txt
- 200  ok  https://archives.mod.gov.il:443/sites/English/About/Pages/declassification-Criteria.aspx
- 403  http_403  https://www.europarl.europa.eu/robots.txt
- 200  ok  https://archives.mod.gov.il:443/sites/English/About/Pages/terms-of-use.aspx
- 403  http_403  https://curia.europa.eu/robots.txt
- robots_disallow  robots_disallow  https://data.europa.eu/sparql?query=SELECT%20%3Fs%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo%7D%20LIMIT%201&format=application%2Fsparql-results%2Bjson
- 200  ok  https://publications.europa.eu/webapi/rdf/sparql?query=SELECT%20%3Fs%20WHERE%20%7B%3Fs%20%3Fp%20%3Fo%7D%20LIMIT%201&format=application%2Fsparql-results%2Bjson
- 202  http_202  https://data.europa.eu/eli/reg/2001/1049/oj
- 200  ok  https://data.europarl.europa.eu/api/v2/adopted-texts?limit=1&format=application%2Fld%2Bjson
- 404  http_404  https://commission.europa.eu/about/service-standards-and-principles/transparency/access-documents_en
- 404  http_404  https://dserver.bundestag.de/robots.txt
- 200  ok  https://www.bfdi.bund.de/DE/Buerger/Informationsfreiheit/informationsfreiheit_node.html
- 200  ok  https://www.deutsche-digitale-bibliothek.de/
- 200  ok  https://www.archivportal-d.de/
- 404  http_404  https://www.bfdi.bund.de/DE/Datenbarometer/Informationsfreiheit/Informationsfreiheit_node.html
- robots_disallow  robots_disallow  https://www.bfdi.bund.de/DE/Service/Publikationen/Taetigkeitsberichte/taetigkeitsberichte_node.html
- transport_error  transport_error  https://anom.archivesnationales.culture.gouv.fr/
- 503  http_503  http://pravo.gov.ru/
- 200  ok  http://kremlin.ru/acts/bank/28816
- 200  ok  https://www.meida.org.il/category/%d7%9e%d7%99%d7%93%d7%a2/%d7%90%d7%a8%d7%9b%d7%99%d7%95%d7%9f-%d7%94%d7%9e%d7%93%d7%99%d7%a0%d7%94
- 200  ok  https://www.meida.org.il/category/precedents
- 200  ok  https://www.meida.org.il/?s=%D7%A6%D7%A0%D7%96%D7%95%D7%A8
- transport_error  transport_error  https://bukovsky-archive.net/robots.txt
- 403  http_403  https://ru.openlist.wiki/robots.txt
- 304  not_modified  https://www.servicehistorique.sga.defense.gouv.fr/robots.txt
- 200  ok  https://www.archives-nationales.culture.gouv.fr/aide-la-recherche
- 200  ok  https://www.servicehistorique.sga.defense.gouv.fr/recherche-simple
- 200  ok  https://www.servicehistorique.sga.defense.gouv.fr/guides-aide-recherche
- 200  ok  https://www.servicehistorique.sga.defense.gouv.fr/resultats-recherche?cles=Audin
- transport_error  transport_error  https://cada.data.gouv.fr/
- transport_error  transport_error  https://www.memoiredeshommes.sga.defense.gouv.fr/
- 200  ok  https://www.archives-nationales.culture.gouv.fr/robots.txt
- 200  ok  https://www.meida.org.il/18046
- transport_error  transport_error  https://rosstat.gov.ru/storage/mediabank/%D0%A4%D0%B5%D0%B4%D0%B5%D1%80%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%B7%D0%B0%D0%BA%D0%BE%D0%BD%20%D0%BE%D1%82%2009.02.200...
- 200  ok  https://www.meida.org.il/16717
- 200  ok  https://www.meida.org.il/15865
- 200  ok  https://www.meida.org.il/6513
- 200  ok  https://www.polynesie-francaise.pref.gouv.fr/index.php/contenu/telechargement/52282/334060/file/Rapport%20d%27activit%C3%A9%20CIVEN%202022-2023.pdf
- 404  http_404  https://www.polynesie-francaise.pref.gouv.fr/robots.txt
- 200  ok  https://www.civen.fr/
- transport_error  transport_error  https://rosstat.gov.ru/robots.txt
- 200  ok  https://www.civen.fr/robots.txt
- 200  ok  https://www.civen.fr/ressources
- 200  ok  https://www.civen.fr/rapport-dactivite-2025-du-civen
- 200  ok  https://www.civen.fr/sites/civen/files/documents/rapport-d-activite-2025-mn_1.pdf
- transport_error  transport_error  https://archivescatalogue.churchillarchivescentre.co.uk/
- transport_error  transport_error  https://archives.ru/
- transport_error  transport_error  https://archives.ru/robots.txt
- 200  ok  https://www.wilsoncenter.org/digital-archive
- 403  http_403  https://garf.su/
