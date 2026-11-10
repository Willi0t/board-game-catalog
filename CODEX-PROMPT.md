# Codex – importera samlingen och visa speldata i Spelhyllan

Arbeta i mitt aktuella GitHub-projekt board-game-catalog. Bifogad catalog-data.json är en export av de första åtta kolumnerna i min Google Sheet, med 70 spel och 20 upcoming. Notes/Notering är avsiktligt inte med. Implementera ändringen färdigt lokalt.

## Arbetsflöde
- Läs AGENTS.md och aktuell kod. Kontrollera git-status och bevara befintliga ändringar.
- Använd en ny gren feature/catalog-metadata om vi står på main och arbetskopian är ren. Om en relevant arbetsgren redan används, fortsätt där. Gör ingen commit, push eller merge.
- Projektet ska fortsätta vara statiskt React/Vite med strikt TypeScript, CSS Modules och lokala bilder/JSON. Inga nya beroenden, backend, databas eller Google Sheets-anrop vid körning.

## Import
- Läs catalog-data.json och importera alla 70 poster till appens befintliga datamodell. Denna fil är importunderlag, inte en komplett ersättning för games.json.
- Matcha mot befintliga spel med en explicit, granskbar matchning. Bevara befintliga stabila id:n, favoritkopplingar, bilder, placeholderTheme, accent/tint och beskrivningar. Skapa inga dubbletter när en utgåva eller expansion ingår i källans namn.
- Exempel: The Castles of Burgundy matchar Castles of Burgundy / Special Edition; Clank! Catacombs + Underworld matchar Clank! Catacombs; 7 Wonders och 7 Wonders Duel måste förbli olika spel. Nemesis och Nemesis: Retaliation samt båda Ascension-utgåvorna är separata.
- Normalisera stavning och versalisering i visningsnamn, men gissa inte bort editioner eller expansonsinnehåll. Behåll källtiteln i importunderlaget.
- Befintliga poster utanför exporten ska bevaras, men får inte automatiskt tilldelas granskade data eller ägarstatus som källan saknar. Redovisa sådana poster i slutrapporten.
- Nya spel får stabila id:n och befintliga reservbildsteman. Lägg inte in bildsökvägar till filer som saknas. Nya beskrivningar lämnas tomma om underlag saknas; återanvänd aldrig Notes som beskrivning.
- Uppdatera spelarantal och weight från exporten för matchade spel. Ersätt inte okända värden med exempeldata. Exporten saknar speltid och ålder; behåll endast verkligt kända befintliga värden och visa annars okänt. Demo-speltider får inte presenteras som fakta.
- Lägg till typade fält för bestWith, playerInteraction (0–5), mechanics: string[], gameTypes: string[] och upcoming: boolean. Gör okända faktauppgifter nullable/optional enligt projektets stil.
- Solo betyder ENDAST spel som enbart spelas ensamma. Det är inte en tagg för valfritt sololäge.
- Exportens null betyder att uppgift saknas. Strängen TBA får inte visas som ett verkligt värde.
- Läs dataQuality i exporten. Använd inte en global "verified"-markering: spelarinteraktion är subjektiv och kategorierna är vår granskade indelning; vissa kommande spel har preliminära uppgifter.
- Parlay har preliminär utgåvematchning. Bevara den osäkerheten i metadata.
- Fate of the Fellowship har bestWith normaliserat från ett felaktigt datumfält till avsedd text 1–3. Importera inte datumserienumret.
- Notes/Notering får inte importeras eller visas någonstans i appen.

## Presentation
Behåll ljusa Playnite-inspirationen, mjuka färgskiftet, nuvarande layout och bilder.

1. Spelkort:
   - Diskret, läsbar "Kommande"-badge för upcoming, utan att täcka titel eller favoritknapp.
   - Håll korten luftiga. Visa högst 1–2 centrala taggar eller en kort sammanfattning; alla övriga data ska finnas i panelerna.
   - Kommande spel är fortfarande öppningsbara och får inte se avaktiverade ut.

2. Befintlig informationspanel och stora detaljpanelen:
   - En konsekvent faktarad för Spelare, Bäst med, Svårighetsgrad och Spelarinteraktion. Visa speltid/ålder när de är kända.
   - Svårighet: t.ex. 2,40/5. Spelarinteraktion: t.ex. 3/5 med en enkel skala på fem steg. 0/5 är ett giltigt värde, inte saknad data.
   - Förklara kort via tillgänglig hjälptext att interaktionsskalan räknar både samarbete och konkurrens och är vår subjektiva bedömning. Ingen obligatorisk tooltip för att förstå siffran.
   - Tydliga separata sektioner "Spelmekanik" och "Speltyp" med mjuka, radbrytande chips. Behåll engelska taggar exakt som i exporten för konsekventa filter; övrig UI-text är svensk.
   - Status "I samlingen" eller "Kommande" när statusen är känd.
   - Saknad faktauppgift visas konsekvent som "Uppgift saknas" i faktaraden eller döljs när det passar, utan NaN, null, undefined eller låtsasvärden.
   - Inga gamla generella "exempelvärden"-texter över importerade fält. Beskrivningsutkast och andra ofullständiga uppgifter ska fortfarande markeras korrekt per fält.

3. Sökning och filter:
   - Separata filter för Spelmekanik, Speltyp och Tillgänglighet: Alla / I samlingen / Kommande.
   - Kombinera dessa med befintlig sökning, spelare, tid, favoriter och sortering. Sök även i de nya taggarna.
   - Om flera taggar kan väljas: OR inom samma filtergrupp, AND mellan grupperna.
   - Ta filteralternativ från de gemensamma tagglistorna/faktiskt data; inga stavningsvarianter eller dubbletter.
   - Visa korrekt antal träffar, tydlig återställning och en användbar tom vy.
   - Slumpval ska följa aktuella filter, så ett filter för I samlingen aldrig ger ett kommande spel.
   - Kända tider först vid tidssortering och okända sist. Vid aktivt spelar- eller tidsfilter ska okända värden inte räknas som matchningar.
   - Bevara befintliga kategorier/favoritflöden om de har annan funktion än de nya grupperna; undvik dubbla mekanikfilter med samma uppgift.

## Kod och kvalitet
- Återanvänd små gemensamma komponenter för faktarader, taggar och status när samma UI finns på flera ställen. En mapp per komponent och CSS Module. Undvik både en stor monolit och onödig uppdelning.
- Bevara dialogernas fokuslås, Escape-ordning, fokusåterställning, scrollås och bildförstoring.
- Responsivt: korta faktarader och chips ska radbryta utan horisontell scroll; kontrollera cirka 390 och 1280 px. Tangentbord, tillgängliga namn, kontrast och prefers-reduced-motion ska fungera.
- Lägg meningsfulla tester för import/matchning och filter om projektets testverktyg medger det utan nya beroenden. Kontrollera särskilt 0/5, okända tider, samtidiga filter och upcoming.
- Verifiera maskinellt att samtliga 70 källposter matchar exakt en katalogpost, inga dubbletter skapats, alla godkända taggar/poäng stämmer och exakt de 20 angivna källspelen har upcoming=true.
- Kör projektets formatkontroll, lint, typkontroll, produktionsbygge och git diff --check. Gör webbläsarverifiering av filter, kort, detaljpanel och mobil om verktyg finns; redovisa annars vad som återstår.
- Uppdatera README med datamodell, betydelsen av taggarna, manuell uppdatering från Sheets och hur man markerar ett levererat spel upcoming=false.
- Avsluta med ändringar, antal importerade spel/kommande, matchningsavvikelser, körda kontroller och kvarstående dataluckor. Ingen commit eller push.
