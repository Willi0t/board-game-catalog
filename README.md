# Spelhyllan

Williams ljusa brädspelskatalog, inspirerad av Playnite/Dune. Bakgrundens ton ändras mjukt med det valda spelet. Byggd med [React](https://react.dev/), TypeScript och [Vite](https://vite.dev/), utan databas eller backend. Komponentstilar använder CSS Modules med vanlig CSS, utan Sass.

## Starta i VS Code

Kräver Node.js 22.12 eller senare (eller en senare LTS-version).

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
`public/images` undantas från formateringen.

VS Code rekommenderar tillägget **Prettier – Code formatter**
(`esbenp.prettier-vscode`). Installera det för att använda projektets inställning
för automatisk formatering vid sparning.

## Projektstruktur

- `src/main.tsx` startar React med StrictMode och laddar globala stilar.
- `src/App.tsx` kopplar ihop layout, gemensamt state och komponenter.
- `src/App.module.css` innehåller övergripande layoutstilar.
- `src/components/` innehåller komponenter i `.tsx` och deras lokala
  `.module.css`-filer för sidomeny, sidhuvud, sökfilter, spelkort, samling,
  informationspanel, galleri och bildmodal, samt ikoner.
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
- `cover`: bildsökväg, exempelvis `/images/burgundy-cover.webp`.
- `gallery`: lista över bildsökvägar.

Lägg dina bilder i `public/images/` och ändra bildsökvägarna i JSON-filen. Använd gärna WebP eller AVIF. Omslag visas stående, men kan ha andra proportioner; justera `object-fit` i CSS om du vill visa hela originalomslaget.

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
npm run typecheck
npm run build
npm run preview
```

`typecheck` kör `tsc --noEmit`. `build` kör samma typkontroll före Vite-bygget.

ZIP-leveransen innehåller även `dist/`, ett färdigbyggt statiskt exemplar. Själva källprojektet kräver npm-kommandona ovan. Ingen API-nyckel, databas eller betald AI-tjänst används av den färdiga katalogen.
