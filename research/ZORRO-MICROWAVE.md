# "Israeli military-grade Ceragon equipment at Zorro Ranch" — the claim tested against the document

**21 September 2026. Research, unpublished.** Author-supplied claim, verbatim in part: *"Epstein was
using an ISRAELI communications Ceragon Equipment (Israeli Military-Grade) at ZORRO RANCH confirmed …
Ceragon is a defense contractor supplying microwave systems to military and intelligence agencies. This
is not consumer equipment … They had to extend the antenna mount by 10 feet to maintain line-of-sight to
Sandia Crest. This suggests precise engineering requirements for the link … Epstein had a PRE-EXISTING
2.4 GHz microwave link to Sandia Crest that was upgraded to 6 GHz in 2014."* Source given:
`justice.gov/epstein/files/DataSet 9/EFTA01124507.pdf`. The document was fetched (sha256
`4e4113b2…2f671`, 4 pages, ledgered by the spider on the second attempt after an Akamai 401), OCR text
extracted, and the email layer queried for everything around it. Sources in
`research/sources/ledger.jsonl`.

---

## 0. Finding

**The document is real. The adjectives are not.** EFTA01124507–09 is a pair of competing 2014 vendor
quotes for a rural telephone-and-internet backhaul link. One bidder proposed Ceragon radios; the other
proposed Exalt, a Californian make. The email layer shows the Ceragon project was **not built**: by
December 2014 the vendor was asking whether to close the account, and the link that was finally installed
in **September 2016** was designed by a third contractor at **11 GHz**, equipment unnamed. So "confirmed"
describes a quotation. **"Israeli military-grade" is a naming error:** Ceragon's own SEC filing for the
year of the quote lists the FibeAir IP-10 as sub-6 GHz short-haul backhaul sold to "cellular operators
and other wireless service providers," and the following year's filing calls it "legacy." The same quote
is otherwise US commercial kit — Andrew antennas, an Adtran router, Times Microwave and Heliax cable.
The ten feet of pipe is antenna elevation for a 43 km licensed path; the "precise engineering
requirements" are what every FCC Part 101 microwave link has. **What the record actually documents is
worth keeping and is duller and better:** no fibre passed the ranch, the incumbent carrier had no budget
to build it, the ranch's phones and internet ran over a hop to the broadcast-tower farm on Sandia Crest
from at least 2012, and in April 2013 Epstein asked **Greg Wyler**, founder of the satellite-internet
companies O3b and OneWeb, whether he was "making a mistake by running fiber as opposed to a microwave
link." Wyler: "start with microwave (cheap)." That contact is documented, dated and EFTA-cited, and it is
about a ranch's internet connection.

---

## 1. The document, read

Four pages, OCR-layered scans. Two quotations and the tail of a terms sheet.

**Pages 1–2 (EFTA01124507–08): Durham Communications, Mesa, Arizona.** An email of 6 June 2014 to the
ranch manager: *"Attached is the best quote that I could work up. Unfortunately for us, you are getting
a really good deal with that pricing and we just can't touch that. The engineers over at Exalt decided
that it would be better to go with an 11GHz system … Both the 6GHz and 11GHz will require FCC licensing
prior to ordering product … approximately 6 months."* Quote summary: *"Removal of 2.4 GHz Microwave
backhaul system. Installation of 6 GHz Microwave Link From Sandia Crest to Zorro Ranch in Stanley, NM.
This will provide 8 T1 …"* Equipment: Exalt ExtendAir GigE indoor/outdoor units at 11 GHz, a 6 ft
high-performance antenna, Talley-supplied Andrew/CommScope mounts and Heliax cable. Project total
**$61,828.92**.

**Pages 3–4 (EFTA01124508–09): Advanced Communications & Electronics, Inc., Albuquerque, 14 April
2014.** *"This quote is to provide the FCC License for a 6 GHz microwave link between Sandia Crest and
Zorro Ranch for transporting a maximum of 8 each T-1 circuits. The existing 2.4 GHz microwave equipment
will be removed prior to installing the new equipment to utilize the existing mounting locations and
some hardware on Sandia Crest and at Zorro Ranch."* An octal T-1 card for "the existing Adtran router at
the Main House," configured for services "from twTelecom that are to be delivered and installed at the
TeleBeeper Radio Site on Sandia Crest." *"Zorro Ranch will provide a man-lift and add a 10 foot section
of pipe to the current pipe mount at the Ranch HVAC location where the 2.4 GHz antenna is installed.
This will meet the elevation requirements for installing the 6 GHz link at that location."* The vendor
"does not assume any responsibility for the structural integrity of the Telebeeper tower at Sandia Crest
and the GOO mount provided at Zorro Ranch." Equipment: 2 × Ceragon IP10-G(R3) indoor units (Ethernet,
16 T1, 50 Mbps capacity licence, ACM licence), 2 × Ceragon RFU-CX 6 GHz radio units (TX high / TX low),
2 × **Andrew** 6 ft antennas, Heliax and Times LMR-400 cable, the Adtran NetVanta octal T1 module,
grounding and mount hardware. Subtotal equipment **$28,472.87**; frequency coordination / FCC licence
$2,430.77; total **$51,652.75** including 7% gross receipts tax.

The quote carries the ranch's street address with its house number. Not reproduced here (§2 standing
constraint). The vendor staff named on the quotes are private individuals and are referred to by role.

---

## 2. What the email layer says happened — the link, 2012 to 2018

Method: `POST jmail.world/api/emails/search`, exact phrases, results re-filtered so a hit counts only
when the phrase is in the body. `"Ceragon"` returns **zero** email bodies — the word exists in the corpus
only inside this PDF attachment.

| Date | EFTA | What |
|---|---|---|
| 30 Aug 2012 | 01891664, 01890683 | Ranch manager lays out three options to serve "Ranch Central" from the demarcation point: separate fibre, fibre from the Main House, or "microwave link from MH to Ranch Central — the third option is basically what we are doing now." Epstein: *"why not copper to rc … fibr … is still more reliable, not weather dependent and not reliant on electric."* |
| 17 Apr 2013 | 01896182, 02026891 | Epstein to **Greg Wyler**: *"see whether i am making a mistake by running fiber as opposed to a micro wave link on my ranch."* Wyler: *"You can always start with microwave (cheap) and add fiber as a second/redundant path."* |
| 10 Jun 2013 | 01970552 | *"this is the only service proposal on the table this service is from Sandia Crest, via a Licensed link there is a application process involved and fee … the microwave dishes at Sandia and the Ranch would need to be upgraded."* |
| 2 Aug 2013 | 02573128 | *"I need to go to Sandia Crest and reset circuit for phones and internet."* — the far end of the existing 2.4 GHz hop, physically. |
| 5 Aug 2013 | 02572875 | CenturyLink account manager: the fibre engineer for Stanley *"did not get any budget for that area or to include your site for a fiber DSL build."* |
| 1–2 Apr 2014 | 01928993, 01929243 | Epstein has asked for **four extra T1s**; TW Telecom confirms availability; Advanced Communications and the ranch manager look at "an abandoned tower and building which is on Ranch Property" for the licensed link, otherwise "a 50 to 60 ft tower." Epstein: *"towers are cheap. least part of the problem."* |
| 14 Apr 2014 | 01124508 | The Ceragon quote (§1). |
| 5–6 Jun 2014 | 01124507 | The Exalt quote, conceding on price. |
| 17 Jun 2014 | 00695369, 01919864 | Kahn: Advanced's project manager "was terminated as Advanced has been losing a lot of government work"; *"I will also speak with Advanced about using other equipment that has less lead time"*; Durham: microwave licences "4–6 weeks," a temporary authorisation possible "within 10 days." |
| 1 Dec 2014 | 01206652 | Vendor: *"need to close out or continue the 6 GHz microwave link project. The FCC requires the link to be constructed within the 1 year period from the issuance of the FCC License or the license is cancelled … If an alternate plan is adopted we should look at updating and closing the account."* **Nothing built.** |
| 5 Aug 2015 | 02493745 | Ranch manager still asking for "microwave link detail." |
| 1–22 Apr 2016 | 02466300, 02465426, 02465483, 02703490, 02702863 | CenturyLink engineers confirm fibre is 8 ft from a conduit running 70 ft to the ranch's "present tower location on Sandia Crest"; a new contractor, **Future Tech**, is asked to "design and install, link from Sandia to Ranch due the distance involved" plus a short hop from "the big tower on ranch to main house"; the design runs "at 11 GHz in 40 MHz channel"; Future Tech has "concerns with the direct link to Main House, due to the mountain between Sandia and the Ranch." Epstein: *"future tech, 3 foot dish right to main house sounds good?"* |
| 25 Apr 2016 | 02703189 | CenturyLink quotes a 200 Mb/s wave circuit at Sandia Crest, $500/month, 3-year term. |
| 15–16 May 2016 | 02463176, 02355928 | Dish sizes: 2 ft / 4 ft, 11 GHz. Epstein: *"why not go big we dont care what it looks like."* "Internet finalized with future tech and wire sent for deposit." |
| 5–25 Aug 2016 | 00648032, 02453421 | CenturyLink "screwed up order again … did not order the cards for the equipment on Sandia"; Future Tech "to be on site 9/19 to install the new Microwave Link at Zorro," staying at the bunkhouse 5–7 days. |
| Dec 2018 | 02609795 | Future Tech again, for the island network; the ranch manager "backed away" over a $9k site-visit fee. |

**Reading.** The 2.4 GHz link predates 2012 and carried the ranch's phones and internet because no wired
carrier reached Stanley. The 2014 upgrade to a licensed band was quoted twice, an FCC licence was
apparently issued, and the build did not happen within the licence year. The link that replaced the 2.4
GHz hop was installed in September 2016 by a different contractor at 11 GHz. **Whether any Ceragon unit
was ever bolted to that pipe is not in the record.** "Upgraded to 6 GHz in 2014" is the quote's proposal,
not an event.

---

## 3. The label — "Israeli military-grade," tested against the vendor's own filings

- **Ceragon Networks Ltd.**: Tel Aviv, NASDAQ CRNT, founded 1996 as Giganet, renamed 2000. Israeli:
  documented.
- **What the IP-10 was, in the company's words at the time.** 20-F for fiscal 2014 (filed 2 April 2015,
  read at source): *"We provide wireless backhaul solutions that enable cellular operators and other
  wireless service providers to deliver voice and data services."* The FibeAir IP-10 series "offers
  products that address the complete wireless backhaul needs of IP-based, hybrid and circuit-switched
  networks," with **IP-10G** in the *short-haul* table as "High-Capacity Multi-Service Sub 6GHz." The same
  filing already calls it "our legacy FibeAir IP-10" beside the newer IP-20 platform. System integrators,
  distributors and resellers were 15.1% of 2014 revenue — the channel through which an Albuquerque
  integrator quotes it.
- **The words "military" and "defense" in that filing** occur only as Israel-country risk factors
  (reserve call-ups, hostilities) and a legal-defence sentence. The FY2025 20-F is the same: the risk
  factors, a director's IDF-intelligence background, and *private networks* described as "new market
  fields" the company is "expanding into." The company's own site lists mobile operators, utilities,
  public safety, ISPs and smart cities as its markets. Governments and public-safety agencies do buy
  Ceragon radios. That is true of Cisco, Motorola and Adtran too.
- **The tell inside the quote.** Every other line is American commercial telecom: Andrew antennas
  (CommScope), an Adtran NetVanta router and T1 card, Times Microwave LMR-400, Heliax, Talley-supplied
  mounts. The competing bid was Exalt Wireless of California. The service being carried was eight T1
  circuits from tw telecom, a US competitive carrier. Nothing in the document distinguishes the Ceragon
  line from the Exalt line except the bidder and the price.
- **Tier.** Ceragon is Israeli: *documented.* The IP-10 was carrier backhaul: *documented, from the
  vendor's own filing for that year.* "Military-grade," "defense contractor supplying … intelligence
  agencies" as a description of this equipment at this site: *unsupported at any tier.* The standing
  constraint applies exactly: **documented affiliation is never an operational tie**, and a company's
  nationality is not a property of a 50 Mbps radio. This is the naming error in its commonest form — the
  vendor's flag read as the equipment's character.

---

## 4. The engineering, plainly

- **Path:** Sandia Crest (35.2101, −106.4487; 3,255 m; the Albuquerque broadcast and telecom tower farm
  with a visitor centre and the tramway summit) to the ranch near Stanley (~35.15, −105.98): **43.2 km**
  great-circle. The ranch sits roughly 1,300 m lower, with a mountain in the direct path to the main
  house — the 2016 contractor's stated concern.
- **2.4 GHz vs 6/11 GHz:** 2.4 GHz is an unlicensed band (the same as Wi-Fi), which is why the old link
  needed no FCC filing and why its far end could be reset by driving up the mountain. 6 and 11 GHz are
  licensed Part 101 point-to-point bands: frequency coordination, a licence, a one-year construction
  deadline. Both quotes say so.
- **The ten feet of pipe:** a licensed microwave path needs the first Fresnel zone clear of the ground
  along 43 km; the fix for a marginal mount is height. The vendor states the reason in the same sentence:
  "This will meet the elevation requirements." That is the "precise engineering requirement."
- **Eight T1s at 1.544 Mb/s each ≈ 12 Mb/s**, on a radio licensed for 50 Mb/s. In 2016 CenturyLink
  offered 200 Mb/s at the tower for $500 a month. The whole project is a large rural property buying
  the internet connection the local carrier would not build.

---

## 5. Symmetry

- The claim is right that this is not consumer equipment: it is carrier-class backhaul, and the
  vendor's nationality is correctly stated. The error is the inference from those two facts.
- Ceragon does have public-safety and government customers, and the Sudan file elsewhere in this
  repository documents Israeli-origin systems reaching wars through third parties. None of that is
  evidence about a T1 backhaul radio quoted to a ranch by an Albuquerque integrator, and the report's
  rule is that it may not be spent as such.
- The Wyler contact runs the other way from the claim's thesis: the expert Epstein consulted was an
  American satellite-internet founder, and his advice was to buy the cheap thing.

---

## 6. What the page carries, and what could go on it

`Zorro` 20, `Sandia` 3 (a 2026 disappearance and a DIA redaction — unrelated), `Ceragon` 0, `Wyler` 0,
`O3b` 0. If anything from this file belongs on the page it is (a) the **Wyler exchange of 17 April 2013**
as a documented, dated contact in the Section II contact record — a satellite-internet founder consulted
on a ranch's connectivity, at documented tier and no higher; (b) the ranch particular that **no fibre
passed the property and its communications ran over a microwave hop to Sandia Crest**, beside the Zorro
acreage already in Section VI/XIII; and (c) the claim itself as a killed specimen — a real DOJ document,
a real Israeli vendor, and an adjective the document does not contain. **Author's call.**

**Leads, not citations:** the FCC ULS Part 101 record for a 6 GHz licence issued in 2014 for a Stanley,
NM path would show the licensee entity and whether it was cancelled for non-construction (the FCC
licence-view API returned nothing for the ranch entity names; the ULS search itself was not run); the
2016 Future Tech proposal would name what was actually installed.

## 7. Ledger

Fetched OK: justice.gov EFTA01124507.pdf (spider, 200, sha256 `4e4113b2…2f671`, after one Akamai 401; the
same hash as the browser-UA curl fetch made under the documented DOJ method); sec.gov Ceragon 20-F for
fiscal 2014 (`zk1516531.htm`) and fiscal 2025 (`zk2634939.htm`), and the EDGAR filing indexes; ceragon.com
home; Wikipedia "Ceragon," "Sandia Crest," "Greg Wyler"; jmail.world email-layer search (phrases:
Ceragon, Sandia Crest, Advanced Communications, Durham Communications, microwave link, microwave, Exalt,
Future Tech, 11 GHz, HAAM, licensed link, ZDC, FCC license, twtelecom).
Refused / null: ceragon.com/about and two IP-10 product paths (404 — retired product); Wikipedia
"Exalt_Wireless" and "Ceragon_Networks" (404); data.fcc.gov license-view basicSearch (empty for "Zorro
Ranch," "Cypress Inc," "NES LLC").
