# Spelhyllan

Williams ljusa brädspelskatalog, inspirerad av Playnite/Dune. Bakgrundens ton ändras mjukt med det valda spelet. Byggd med [React](https://react.dev/) och [Vite](https://vite.dev/), utan databas eller backend.

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

- `src/main.jsx` startar React med StrictMode och laddar globala stilar.
- `src/App.jsx` kopplar ihop layout, gemensamt state och komponenter.
- `src/components/` innehåller sidomeny, sidhuvud, sökfilter, spelkort,
  samling, informationspanel, galleri, bildmodal och ikoner.
- `src/hooks/useFavorites.js` hanterar favoriter i localStorage.
- `src/utils/filterGames.js` filtrerar och sorterar utan att ändra originaldatan.
- `src/constants/categories.js` innehåller den gemensamma kategorilistan.
- `src/styles.css`, `src/games.json` och `public/images/` innehåller design,
  speldata respektive lokala bilder.

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
npm run build
npm run preview
```

ZIP-leveransen innehåller även `dist/`, ett färdigbyggt statiskt exemplar. Själva källprojektet kräver npm-kommandona ovan. Ingen API-nyckel, databas eller betald AI-tjänst används av den färdiga katalogen.
