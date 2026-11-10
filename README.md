# Spelhyllan

Williams ljusa brädspelskatalog, inspirerad av Playnite/Dune. Bakgrundens ton ändras mjukt med det valda spelet. Byggd med [React](https://react.dev/), TypeScript och [Vite](https://vite.dev/), utan databas eller backend. Komponentstilar använder CSS Modules med vanlig CSS, utan Sass.

## Starta i VS Code

Kräver Node.js 22.13.0 eller senare inom 22-serien, eller Node.js 24 eller senare
(`^22.13.0 || >=24.0.0`). Node.js 23 ingår inte i det stödda intervallet.
CI och Netlify använder Node.js 22.23.4.

1. Packa upp projektet och öppna mappen `board-game-catalog` i VS Code.
2. Öppna terminalen i den mappen och kör:

```bash
npm install
npm run dev
```

Öppna adressen som Vite skriver i terminalen.

För fortsatt AI-utveckling: installera OpenAI:s officiella Codex-tillägg i VS Code och logga in. Öppna projektmappen innan du startar en Codex-chatt. Se [Codex i din editor](https://developers.openai.com/codex/ide).

## Formatering

Kör `npm run format` för att formatera projektet med Prettier och
`npm run format:check` för att kontrollera formateringen utan att ändra filer.
Indrag är två mellanslag. `node_modules`, `dist`, `package-lock.json` och
bildmapparna under `public/images` undantas från formateringen.

VS Code rekommenderar tillägget **Prettier – Code formatter**
(`esbenp.prettier-vscode`). Installera det för att använda projektets inställning
för automatisk formatering vid sparning.

## Kodkontroll och CI

Kör `npm run lint` för ESLints rekommenderade TypeScript- och React Hooks-regler.
Kommandot misslyckas vid både fel och varningar. `eslint.config.js` använder flat
config och undantar `dist` och `node_modules`. Prettier ansvarar för formatering;
`eslint-config-prettier` stänger av regler som kan stå i konflikt med Prettier.
VS Code rekommenderar även det officiella ESLint-tillägget
(`dbaeumer.vscode-eslint`).

Projektets verifierade verktygsversioner är ESLint 10.14.0, `@eslint/js` 10.0.1,
TypeScript 6.0.3, typescript-eslint 8.72.1 och React Hooks-plugin 7.1.1.
De är låsta till exakta versioner. Node-kravet ovan följer ESLint 10:s stödda
versioner, med 22.13.0 som projektets lägsta tillåtna version.

Kvarvarande audit-anmärkning: minimatch 10.2.6 berörs av
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), som kan
orsaka hög CPU- och minnesförbrukning vid särskilt utformade globmönster.
Det gäller utvecklingsberoenden via ESLint och typescript-eslint, inte appens
produktionsberoenden. Audit rapporterar tio måttliga paketträffar från samma
grundsårbarhet. Rättningen finns i minimatch 11.0.1, utanför den aktuella
beroendekedjans deklarerade versionsintervall. En kompatibel rättning saknas
därför i denna kedja; vi använder inte force, overrides eller inkompatibla
nedgraderingar för att dölja varningen.

`.github/workflows/ci.yml` körs vid pull requests till `main` och push till alla
grenar. Med Node.js 22.23.4 och npm-cache baserad på `package-lock.json` körs `npm ci`,
`npm run format`, `npm run lint` och `npm run build`. Formateringen skriver till
CI-jobbets arbetskopia. Bygget inkluderar typkontroll, så den körs inte separat i
CI. Arbetsflödet har endast `contents: read` och publicerar eller deployar ingenting.

## Projektstruktur

- `src/main.tsx` startar React med StrictMode och laddar globala stilar.
- `src/App.tsx` kopplar ihop layout, gemensamt state och komponenter.
- `src/App.module.css` innehåller övergripande layoutstilar.
- `src/components/GameInfoPanel/` ger katalogen och guiden samma informationspanel.
  `MobileGamePanel/` visar samma innehåll i en tillgänglig dialog på mindre skärmar.
  `src/hooks/useMediaQuery.ts` följer ändringar av skärmbredd.
- `src/components/GameDetailDrawer/` innehåller den större detaljvyn som öppnas
  med dubbelklick på ett spelkort eller informationspanelens ”Visa mer”.
- `src/hooks/useModalDialog.ts` hanterar dialogernas fokus, fokusåterställning och
  gemensamma scrollåsning, även när en bild förstoras ovanpå detaljvyn.
- `src/components/` har en mapp per komponent, med komponentens `.tsx`-fil och
  eventuell `.module.css`-fil, exempelvis `GameCard/GameCard.tsx` och
  `GameCard/GameCard.module.css`. `Icon/Icon.tsx` saknar egen CSS-fil.
  Komponenter importeras med explicit sökväg, exempelvis
  `./components/GameCard/GameCard`, utan återexport via `index.ts`.
- `src/hooks/useFavorites.ts` hanterar favoriter i localStorage.
- `src/utils/filterGames.ts` filtrerar och sorterar utan att ändra originaldatan.
- `src/constants/categories.ts` innehåller den gemensamma kategorilistan.
- `src/types/game.ts` definierar den gemensamma speltypen och typer för bildmodal
  och informationsflikar. Importerad JSON kontrolleras mot `Game[]` i `src/data/games.ts`.
- `src/styles.css` innehåller typsnitt, grundinställningar, globala elementstilar
  och stöd för minskad rörelse. Komponentstilar importeras som `styles`-objekt.
- `src/games.json` och `public/images/` innehåller speldata respektive lokala bilder.
- `src/data/placeholder-manifest.json` beskriver de 72 reservtemana och mappingen
  för de 71 katalogposterna. Äldre bilder finns kvar. Se bildguiden för färgprioritet.
- `tests/fixtures/catalog-source.json` arkiverar den tidigare katalogexporten för
  testerna, så utvecklarens borttagning av arbetskopians importunderlag bevaras.
- `tsconfig.json` aktiverar strikt typkontroll och Vites typer.

## Innehåll och bilder

All speldata finns i `src/games.json`. Bilder finns i `public/images/`.

Katalogen innehåller 71 importerade poster (50 i samlingen och 21 kommande). Spelarantal och svårighet följer importunderlaget;
exakt utgåva är inte oberoende verifierad och värden kan avse grundspelet.
Spelarinteraktion är subjektiv och taggar är vår granskade indelning.
Kommande uppgifter kan vara preliminära. Beskrivningar som fanns tidigare är
fortfarande utkast; 59 nya poster saknar beskrivning. SVG-bilder är
platshållarillustrationer, inte riktiga spelomslag.

För varje spel:

- `id`: unikt och stabilt id, exempelvis `burgundy`.
- `title`, `edition`, `category`, `description`: textinnehåll.
- `playersMin`, `playersMax`, `minutes`, `weight`: tal eller `null` för okänd
  uppgift. Svårighet visas med två decimaler på skalan 1–5. Tid och ålder saknas
  i exporten; alla tidigare demo-speltider är borttagna.
- `bestWith`: avsedd text, exempelvis `1–3`, eller `null`. Datumserienummer från
  Sheets får inte användas; Fate of the Fellowship har normaliserats till `1–3`.
- `playerInteraction`: subjektiv poäng 0–5, där 0 är ett giltigt värde. Skalan
  räknar både samarbete och konkurrens.
- `mechanics` och `gameTypes`: separata listor med exakt exportens engelska
  taggar. `Solo` betyder enbart spel som endast spelas ensamma.
- `upcoming`: `true` för kommande, `false` för i samlingen; utelämnat betyder
  okänd status och ingår inte i filtret ”I samlingen”.
- `catalogMetadata`: källrad, ursprunglig källtitel, importdatum, preliminära
  uppgifter och utgåvematchning. Parlay har uttryckligen preliminär matchning.
- `descriptionStatus`: `draft`, `missing` eller `complete`, separat från fakta.
  Ingen generell verifierad-markering används.
- `accent`: mörkare accentfärg i hex, exempelvis `#815467`.
- `tint`: mycket ljus bakgrundston, exempelvis `#eadce2`.
- `placeholderTheme`: återanvändbart reservtema, exempelvis `castle-rose`.
- `cover`, `hero`: valfria sökvägar, exempelvis `/images/games/burgundy/cover.webp`
  och `/images/games/burgundy/hero.webp`, när filerna faktiskt finns.
- `gallery`: valfri lista över bildsökvägar. Saknad eller tom lista visar temats
  scen- och detaljillustrationer.
- `longDescription`, `minimumAge`, `expansions`: valfria fält för längre
  beskrivning, åldersgräns som tal och expansionsnamn som en lista med strängar.
  Detaljvyn använder den befintliga beskrivningen om `longDescription` saknas
  och döljer åldersgräns och expansioner när uppgifter saknas. Lägg bara till
  uppgifter som gäller din utgåva; exempelspelen saknar dessa extra fält.

Lägg riktiga bilder under `public/images/games/<game-id>/` och ändra bildsökvägarna i JSON-filen. Se [bildguiden](public/images/README.md) för struktur, reservteman och exempel. Reservillustrationerna ligger i `public/images/placeholders/`. V2-teman och id-mappning definieras centralt i `src/data/placeholder-manifest.json`; `src/constants/placeholderThemes.ts` hanterar temaprioritet, färger och stöd för äldre temanycklar. `GameImage` hanterar bildfel och återställning vid spelbyte. Använd gärna WebP eller AVIF. Omslag visas stående, men kan ha andra proportioner; justera `object-fit` i CSS om du vill visa hela originalomslaget.

Behåll osäkerhetsmarkeringar per fält och skilj bildstatus från speldata. Favoriter sparas bara lokalt i besökarens webbläsare, inte mellan enheter.

## Manuell uppdatering från Sheets

1. Exportera de första åtta kolumnerna till `catalog-data.json`. Inga
   Notes/Notering ska ingå. Filen används bara vid utveckling, aldrig för anrop
   till Sheets i webbläsaren. `CODEX-PROMPT.md` och exportfilen undantas från
   automatisk formatering för att bevara importunderlagen.
2. Granska `scripts/catalog-matches.json`. Varje källrad och exakt källtitel
   matchar ett stabilt katalog-id. Ändra inte id för befintliga spel. Justera
   källtitel/källrad i matchningen om Sheets har ändrats; importeraren stoppar
   vid saknad matchning, dubbletter eller ändrat antal poster.
3. Kör `node scripts/import-catalog.mjs`. Importen uppdaterar bara de angivna
   faktauppgifterna, bevarar lokal text/bilder/färger och sparar gemensam
   källinformation och datakvalitet i `src/catalogMetadata.json`. Katalogposter
   utanför exporten bevaras utan att tilldelas ägarstatus eller granskade fakta.
4. Kör `node --test tests/*.test.mjs` samt projektets kontroller. Testerna
   använder Node:s inbyggda testverktyg samt befintliga TypeScript/esbuild; inga nya
   testberoenden krävs. Nuvarande exportkontroll förväntar 71 poster/21 kommande;
   uppdatera dessa förväntningar vid en avsiktlig ändring av underlaget.

När ett kommande spel levererats: ändra dess `upcoming` till `false` i
`src/games.json`. Uppdatera också den manuella Sheets-exporten före nästa import,
annars skriver importen tillbaka exportens status. Sätt
`catalogMetadata.preliminary` till `false` först när uppgifterna granskats.

## Funktioner

Sökning i namn och taggar, äldre kategorier, separata filter för spelmekanik, speltyp och tillgänglighet, spelar- och tidsfilter, sortering, favoriter, spelguide och bildgalleri. Ett värde väljs per tagggrupp; grupperna kombineras med AND. Okända värden matchar inte aktiva spelar-/tidsfilter. Tidssortering lägger okända tider sist. ”Välj åt mig” öppnar den separata guiden nedan. Mobil layout och stöd för minskad rörelse ingår. Typsnitt hämtas från Google Fonts med lokala systemtypsnitt som reserv.

## Gemensam spelinformation

Katalogen och guidens resultat använder samma `GameInfoPanel` och `GameDetails`.
På dator är innehållet uppdelat i ungefär 58 % grid och 42 % informationspanel.
Panelen börjar under sidhuvudet, är sticky och har egen scrollning. Dess scroll
återställs vid spelbyte utan att gridens sidscroll flyttas. Bilden behåller sina
proportioner; status, faktarader, beskrivning och separata tagggrupper återanvänds.

Första spelet i den synliga, sorterade griden är förvalt i båda vyerna. Ett
manuellt val behålls vid filtrering och sortering så länge spelet finns kvar.
Saknas ett giltigt val väljs första synliga spelet; vid noll träffar rensas
urvalet och panelen visar ”Inga spel att visa”. Automatisk markering flyttar
varken fokus eller sidans scroll och öppnar inga dialoger. Den gemensamma
urvalsregeln finns i `src/utils/resolveSelectedGame.ts`.
På skärmar upp till 900 px öppnar enkelklick samma innehåll i en modal mobilpanel
med **Tillbaka till spelen**. Den använder befintligt fokus- och scrollås och
återställer gridens scrollposition och fokus vid återgång. Bildförstoring och
**Visa mer** kan öppnas ovanpå panelen; Escape stänger den översta dialogen först.

Terraforming Mars använder sitt stabila id `terraforming` och godkända uppgifter,
med okänd spelarinteraktion (`null`). Det är spel nummer 12/källrad 13 i det
sparade importunderlaget. Efterföljande källrader är förskjutna ett steg.
Hitman är markerat som kommande. Importmatchningen använder källtitel till stabilt
id och validerar också källraden; en oväntad titel eller rad stoppar importen.

## Välj åt mig

Knappen öppnar en tillgänglig dialog med tre steg: **Sällskap → Spelkänsla → Önskemål**.
Spelarantal väljs obligatoriskt med snabbvalsknapparna 1–6, som visar dynamiska
träffantal. Spelets kända spelarintervall måste omfatta det valda antalet. Guiden använder hela katalogen.

Svårighet är ett flerval: **Låg (1 ≤ vikt < 2)**, **Medel (2 ≤ vikt < 3)** och
**Hög (3 ≤ vikt ≤ 5)**. Indelningen använder originalvärdet före eventuell avrundning.
Inga val betyder ”Spelar ingen roll”. OR används inom svårighetsnivåer,
speltyper, interaktionsnivåer och mekaniker; AND används mellan filtergrupper. Okänd svårighet och
interaktion matchar endast utan respektive filter. Interaktion är flerval: Låg (0–1/5), Medel (2–3/5) och Hög (4–5/5).
0/5 är giltig låg interaktion; inga valda nivåer betyder ”Spelar ingen roll”.
Endast kända spel i samlingen ingår normalt; ”Inkludera kommande spel” tillåter
även okänd tillgänglighet.

Varje alternativ har en badge med antal spel. Antalen beräknas i ordningen
**Spelarantal → Svårighet → Speltyp → Interaktion → Mekaniker**, med tillgänglighet
som gemensam grund. Bara tidigare grupper begränsar ett alternativ; andra val i
samma OR-grupp och senare grupper påverkar inte dess antal. Spelarintervall
räknas vid varje inkluderat antal. Totalen använder unika spel-id:n och är aldrig
en summering av taggarnas antal.

Nollalternativ visar ”0 spel” och en röd markering. Omarkerade nollalternativ är
spärrade; markerade val ligger kvar, visar ”matchar inte” och kan avmarkeras.
Interaktion kan även rensas med **Rensa interaktionsval**. En lista över val att
se över länkar till rätt steg. Inga senare val rensas automatiskt.
Tillgänglighetsvalet uppdaterar samtliga antal, även när användaren går bakåt.
Bara totalantalet annonseras med `aria-live`; alternativens antal ingår i
kontrollernas tillgängliga namn. Interaktionsnivåernas antal påverkas inte av
andra val i samma grupp. Mekanikernas antal och slutresultatet använder däremot
unionen av alla valda interaktionsnivåer. Sammanfattningen visar samtliga nivåer.

Träffantalet uppdateras löpande. **Visa N spel** stänger dialogen och visar
alla träffar i katalogens vanliga grid, utan slumpning, med samma automatiska förval som i katalogen.
Guidens bekräftade kriterier är då den enda aktiva filtreringen. De vanliga
biblioteksfiltren pausas och döljs, medan sortering fortfarande fungerar.
**Ändra mina val** öppnar guiden med tidigare val. Ändringar är utkast tills de
bekräftas; urvalet behålls om spelet fortfarande finns bland träffarna. **Rensa guidens filter**
återgår till bibliotekets tidigare filter. Kategorinavigering lämnar också guidens resultat.

Enkelklick väljer spelet till sidopanelen; dubbelklick och **Visa mer** öppnar
befintlig detaljvy. Escape stänger först bildförstoring och sedan detaljpanelen.
Dialoger återanvänder fokuslås, fokusåterställning och scrollås. Vid noll träffar
kan användaren ändra sina val eller granska konkreta förslag som faktiskt ger
träffar; inget tillämpas automatiskt.

Ren matchning, alternativantal (`countPickerOptions`), ogiltiga val
(`findPickerConflicts`) och ändringsförslag finns i `src/utils/gamePicker.ts`. Kör
`node --test tests/*.test.mjs` för spelarintervall, exakta svårighetsgränser,
flerval, OR/AND, okända värden, Party och kommande spel. Kör även
`npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`
och `git diff --check` efter ändringar.

Kontrollerat lokalt med Node.js 24.20.0: 31 tester, formatkontroll, lint,
typkontroll och produktionsbygge. Flödet har även körts med tangentbord i Chrome
vid 1280 och 390 pixlars bredd: gemensam panel i båda vyerna, träffantal/grid,
Terraforming Mars, Hitmans status, bevarat/rensat urval, tomma resultat,
panelens scrollåterställning och mobilens återgång till rätt scrollposition.
Detaljvy och bildförstoring kontrollerades även ovanpå mobilpanelen med Escape,
fokuslås, fokusåterställning och scrollås.
Guidens dynamiska antal, spärrade nollalternativ, bevarade/avmarkerade ogiltiga
val, navigation bakåt och slutknappens antal mot resultatgriden har också
kontrollerats med tangentbord i båda bredderna. Tillgängliga kontrollnamn
kontrollerades i Chromes tillgänglighetsträd.
Mobilbredd är emulerad; fysisk mobil, skärmläsaruppläsning och andra webbläsare är
inte verifierade.

De 13 godkända Party-markeringarna finns även i `tests/fixtures/catalog-source.json`.
Detta sparade importunderlag kan användas med
`node scripts/import-catalog.mjs tests/fixtures/catalog-source.json`.
Importeraren normaliserar `party` och `paty` till den kanoniska taggen `Party`,
behåller andra speltyper och tar bort dubbletter. En ny manuell export behöver
behålla dessa godkända markeringar; importera aldrig Notes.

## GitHub

Skapa ett nytt tomt repo och kör följande från projektmappen. Ersätt URL:en med din riktiga repo-adress.

```bash
git init -b main
git add .
git commit -m "Add board game catalog"
git remote add origin https://github.com/DITT-ANVANDARNAMN/DITT-REPO.git
git push -u origin main
```

Det går även att använda VS Codes Source Control → Publish to GitHub. För fortsatt arbete på separat gren:

```bash
git switch -c stage
```

Den här leveransen har inte publicerats eller pushats till något GitHub-repo.

## Netlify

Importera GitHub-repot i Netlify. `netlify.toml` innehåller bygginställningarna:

- Build command: `npm run build`
- Publish directory: `dist`

## Kontrollera produktionsbygget

```bash
npm run format
npm run format:check
npm run lint
node --test tests/*.test.mjs
npm run typecheck
npm run build
npm run preview
```

`typecheck` kör `tsc --noEmit`. `build` kör samma typkontroll före Vite-bygget.

ZIP-leveransen innehåller även `dist/`, ett färdigbyggt statiskt exemplar. Själva källprojektet kräver npm-kommandona ovan. Ingen API-nyckel, databas eller betald AI-tjänst används av den färdiga katalogen.
