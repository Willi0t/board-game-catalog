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
  och informationsflikar. Importerad JSON kontrolleras mot `Game[]` i `App.tsx`.
- `src/styles.css` innehåller typsnitt, grundinställningar, globala elementstilar
  och stöd för minskad rörelse. Komponentstilar importeras som `styles`-objekt.
- `src/games.json` och `public/images/` innehåller speldata respektive lokala bilder.
- `tsconfig.json` aktiverar strikt typkontroll och Vites typer.

## Innehåll och bilder

All speldata finns i `src/games.json`. Bilder finns i `public/images/`.

De tolv spelen är exempel för att visa layouten. Samlingen är inte en verifierad import av din kompletta lista. Beskrivningarna är utkast; spelarantal, tider och svårighet är avsiktliga exempelvärden och markeras så i gränssnittet. SVG-bilderna är egna enkla platshållare, inte riktiga spelomslag.

För varje spel:

- `id`: unikt och stabilt id, exempelvis `burgundy`.
- `title`, `edition`, `category`, `description`: textinnehåll.
- `playersMin`, `playersMax`, `minutes`, `weight`: verifiera mot exakt utgåva innan slutlig publicering. Svårighet anges på en skala 1–5.
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

Lägg riktiga bilder under `public/images/games/<game-id>/` och ändra bildsökvägarna i JSON-filen. Se [bildguiden](public/images/README.md) för struktur, reservteman och exempel. Reservillustrationerna ligger i `public/images/placeholders/` och definieras centralt i `src/constants/placeholderThemes.ts`. `GameImage` hanterar bildfel och återställning vid spelbyte. Använd gärna WebP eller AVIF. Omslag visas stående, men kan ha andra proportioner; justera `object-fit` i CSS om du vill visa hela originalomslaget.

Innan exempelvärden ersätts helt: behåll gränssnittets exempelmarkeringar. När alla uppgifter är kontrollerade kan markeringarna i komponenterna under `src/components/` tas bort. Favoriter sparas bara lokalt i besökarens webbläsare, inte mellan enheter.

## Funktioner

Sökning, kategorier, filter för antal spelare och tid, sortering, favoritmarkeringar, slumpval och bildgalleri. Mobil layout och stöd för minskad rörelse ingår. Typsnitt hämtas från Google Fonts med lokala systemtypsnitt som reserv.

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
npm run typecheck
npm run build
npm run preview
```

`typecheck` kör `tsc --noEmit`. `build` kör samma typkontroll före Vite-bygget.

ZIP-leveransen innehåller även `dist/`, ett färdigbyggt statiskt exemplar. Själva källprojektet kräver npm-kommandona ovan. Ingen API-nyckel, databas eller betald AI-tjänst används av den färdiga katalogen.
