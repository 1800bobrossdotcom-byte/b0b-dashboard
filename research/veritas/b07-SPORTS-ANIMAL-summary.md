# b07-SPORTS-ANIMAL — verdict summary

109 markers checked, each with exactly one verdict:

| Verdict | Count |
|---|---|
| fix | 38 |
| imprecise | 48 |
| rule | 11 |
| ok | 6 |
| unverified | 5 |
| editorial | 1 |

## The 10 most serious problems

1. **#684 CONCACAF.** The marker says Jack Warner was "convicted — fled to Trinidad". Warner is living. He was indicted in 2015 and is fighting extradition, and he lost a US$79M civil default judgment. He has not been convicted.
2. **#668 Kraft.** The line "charges that should stick evaporate … human trafficking-connected" breaks the living-person floor. The record is two misdemeanor solicitation counts, later dropped after the video was suppressed. Prosecutors said in April 2019 there was no evidence of trafficking.
3. **#660 Boston College.** Jim Sweeney is named as an organizer of the scheme. He is living and was never charged. The scheme also started with the Perla brothers, not with Henry Hill.
4. **#673 BALCO.** The ctx says Barry Bonds was supplied steroids. Bonds is living, has denied knowing use, and his obstruction conviction was overturned. The steroids → ratings → betting chain also has no documented link.
5. **#709–711 Calabasas.** The three markers build an autonomy/ALIAS insinuation and leave out the NTSB's probable cause: the pilot continued flying by sight into cloud and became disoriented. #711 also gets Sikorsky's ownership history wrong (it was UTC-owned from 1929 to 2015).
6. **#28 Envigo/Inotiv.**
   - The DIP loan came from the first-lien lenders, not the noteholders.
   - The DIP figure appears twice and conflicts ($65.5M vs $65.4M).
   - Inotiv did not plead guilty; Envigo subsidiaries did, and Inotiv guaranteed the payment.
   - The company came out of bankruptcy on 19 July 2026, which the marker omits.
7. **#25/#75/#78 Charles River holders.** The holder list is stale. FMR is now the largest disclosed holder at 10.2% (31 Aug 2026). The 7.38% stake belongs to Vanguard Capital Management, not The Vanguard Group. Wellington is down to 3.6%.
8. **#686 Qatar.**
   - The Guardian's 6,500 figure counts migrant deaths across all sectors, not "during construction". The Guardian linked 37 deaths directly to stadium work.
   - The "$5M bribes" figure is Warner's alleged bribe to vote for Russia, not for Qatar.
9. **#714 Olympia.** The ctx contains leftover chat text ("When the user says 'Baal games'…"). Its Theodosius and death-penalty claims are also wrong.
10. **Factual errors in other markers:**
    - **Stardust (#653):** imploded 13 March 2007, not 13 Feb.
    - **Dorfman (#654):** killed three days before sentencing, not one month.
    - **Pete Rose (#672):** he was reinstated after his death, in May 2025.
    - **Rosenbloom (#664):** he never "admitted" betting on the 1958 game.
    - **Jerry Jones (#667):** he is not Comstock's CEO.
    - **Pendergast (#679):** he played at Notre Dame, not Northwestern.
    - **Temasek (#912):** the figure is S$518bn, not US$521bn.
    - **MGM (#700):** the "mob-built" Bellagio, Mirage and MGM Grand claim is false.
    - **Entain (#994):** headquartered in the Isle of Man, not London.
    - **Adelson (#657):** he pulled out of the stadium project in 2017.

## Nulls

| Host | Result |
|---|---|
| opensecrets.org | 403 |
| science.org | 403 |
| pulitzercenter.org | 403 |
| justice.gov `/usao-wdva/pr/` | decoy_200 (registered decoy shape) |
| occrp.org `/organizations/centurionbet` | 404 |

Wikipedia returned 404 for the following page titles:
- Ante_Šapina
- Arizona_State_University_point_shaving_scandal
- Northwestern_University_point_shaving_scandal
- University_of_San_Diego_point_shaving_scandal
- Costs_of_the_2014_Winter_Olympics
- Comstock_Resources
- Suncity_Group
- Janvier_Labs
- Finkelstein_Royal_Commission
- José_Luis_Meiszner

## Traps

- **USAspending can't be re-checked here.** Its API only accepts POST requests, so the Marshall award totals (#21, #80, #81) stay unverified.
- **Vanguard changed its filing entity.** After its January 2026 internal realignment, The Vanguard Group, Inc. reports 0% of CRL and the stake is filed under "Vanguard Capital Management". The CRL proxy still cites a February 2024 Vanguard figure of 12.1%.
- **Wikipedia's text and infobox can disagree** (for example, Taconic's headquarters). Read the body text.
- **Valuations and assets-under-management figures go stale fast.** Several markers carry undated figures with no source.
