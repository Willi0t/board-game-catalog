<div align="center">

# Spelhyllan

A board game catalog to track your collection and pick a game for your next game night.

[![CI][ci-badge]][ci-url]
[![GitHub stars][stars-badge]][stars-url]
[![Forks][forks-badge]][forks-url]
[![Open issues][issues-badge]][issues-url]
[![Contributors][contributors-badge]][contributors-url]

[Getting started](#getting-started) · [Report a bug][bug-url] · [Suggest a feature][issues-url]

</div>

## Contents

- [About the project](#about-the-project)
- [Getting started](#getting-started)
- [Usage](#usage)
- [Maintaining the catalog](#maintaining-the-catalog)
  - [Connect your own data source in a fork](#connect-your-own-data-source-in-a-fork)
- [Development and deployment](#development-and-deployment)
- [Acknowledgments](#acknowledgments)

## About the project

Spelhyllan shows games in the collection and upcoming games. Each game has a
detail view with a description, game information, and a gallery. The interface
is available in Swedish, English, Spanish, German, and French.

![The Spelhyllan catalog with search, filters, and the detail panel for The Castles of Burgundy open](docs/images/spelhyllan-katalog.webp)

### Built with

[![React][react-badge]](https://react.dev/)
[![TypeScript][typescript-badge]](https://www.typescriptlang.org/)
[![Vite][vite-badge]](https://vite.dev/)
[![Netlify][netlify-badge]](https://www.netlify.com/)

The app uses CSS Modules and local JSON files for game data and translations.
The optional AI chat calls [Groq](https://groq.com/) through a Netlify Function.

### Why local files?

I keep the game data and translations in JSON files in the repository. The
collection changes infrequently, so editing the files and redeploying is enough
for my needs. Static hosting lets me run the catalog without the cost and
maintenance of an always-on server or database service.

## Getting started

### Prerequisites

Install Git and Node.js 22.13.0 or later in the 22.x series, or Node.js 24 or
later. GitHub Actions and Netlify use Node.js 22.23.4.

### Installation

```bash
git clone https://github.com/Willi0t/board-game-catalog.git
cd board-game-catalog
npm ci
npm run dev
```

Open the address printed by Vite in your terminal. These commands start the
catalog and the manual game picker.

## Usage

- **Browse the catalog** with search, sorting, and filters for game type,
  mechanics, player count, and more.
- **Open a game** to see its description, gallery, and any expansions. You can
  switch languages while the detail view is open.
- **Save favorites** for quick access. They are stored in your current browser.
- **Pick for me** opens the manual game picker or the password-protected AI
  chat. The chat's recommendations appear in the catalog.

### Enable the AI chat

Create a local `.env` file with the variables below, then start the app with
`npx netlify-cli dev`.

| Variable                     | Value                                                        |
| ---------------------------- | ------------------------------------------------------------ |
| `GROQ_API_KEY`               | API key from [GroqCloud](https://console.groq.com/keys).     |
| `GAME_PICKER_PASSWORD_HASH`  | Salted scrypt hash of the chat password.                     |
| `GAME_PICKER_SESSION_SECRET` | Separate random value generated with `openssl rand -hex 32`. |

Generate the password hash in Bash and save the result as
`GAME_PICKER_PASSWORD_HASH`.

```bash
read -rsp 'Chat password: ' picker_password; printf '\n'
printf '%s' "$picker_password" | node -e 'const { randomBytes, scryptSync } = require("node:crypto"); const salt = randomBytes(16); const hash = scryptSync(require("node:fs").readFileSync(0), salt, 32, { N: 65536, r: 8, p: 1, maxmem: 96 * 1024 * 1024 }); console.log(salt.toString("hex") + ":" + hash.toString("hex"));'
unset picker_password
```

## Maintaining the catalog

| Content                                                | Location                                             |
| ------------------------------------------------------ | ---------------------------------------------------- |
| Game data and English source descriptions              | [`src/games.json`](src/games.json)                   |
| Swedish, Spanish, German, and French game descriptions | `src/data/descriptions/`, one JSON file per language |
| Interface translations                                 | `src/i18n/`                                          |
| Game images and placeholder illustrations              | [Image guide](public/images/README.md)               |

Use each game's existing `id` as the key in the language files and as the
folder name for images under `public/images/games/`. When a translation is
missing, the app uses the source description. If you replace a cover, run
`npm run covers:generate` to update its image variants. To preview theme
colors, run `node scripts/cover-theme.mjs <game-id>`. Add `--write` to save them.

### Import game data from Google Sheets

1. Export the first nine columns, including `Expansions`, to
   `catalog-data.json`. Omit the Notes column (`Notes` or `Notering`).
2. Review the source rows and titles in
   [`scripts/catalog-matches.json`](scripts/catalog-matches.json). Keep
   existing game IDs and enter the title and edition separately.
3. Run `node scripts/import-catalog.mjs`. The import updates catalog metadata
   and preserves local descriptions, images, and colors.
4. Run the project checks below. When an upcoming game joins the collection,
   update the source spreadsheet so the next import preserves its new status.

### Connect your own data source in a fork

The game views use the same data structure regardless of where the content is
stored. In a fork, start by changing how the catalog loads its data.

- **Google Sheets:** Use the import process above. To automate it, fetch rows
  through the Sheets API, map them to the import format, and run
  `scripts/import-catalog.mjs` before building. The catalog can still be hosted
  statically. Store credentials for a private spreadsheet in the build
  environment.
- **Database:** Give each game a stable `id` and create an API that reads game
  records and returns JSON matching the [`Game`](src/types/game.ts) type.
  Adapt [`src/data/games.ts`](src/data/games.ts) and its callers to load the
  catalog from the API, with loading and error states. Store database
  credentials in the API's environment.

Keep game IDs stable so that favorites, images, and translations still point
to the right games. If you enable the AI chat, configure the Netlify Function
to read the same catalog. It currently reads `src/games.json`.

## Development and deployment

```bash
npm run format:check
npm run lint
node --test tests/*.test.mjs
npm run build
```

Use `npm run format` to format files. The build runs type checks and verifies
cover variants before Vite writes the output to `dist/`. Use `npm run preview`
to preview the production build.

[GitHub Actions](.github/workflows/ci.yml) runs formatting, linting, and the
build on pushes to all branches and on pull requests targeting `main`.
[`netlify.toml`](netlify.toml) sets `npm run build` as the build command and
`dist/` as the publish directory. To enable the AI chat in production, set
the environment variables in Netlify with access for Functions, then
redeploy.

## Acknowledgments

The README structure is inspired by
[Best README Template](https://github.com/othneildrew/Best-README-Template).

[Back to top](#spelhyllan)

[ci-badge]: https://github.com/Willi0t/board-game-catalog/actions/workflows/ci.yml/badge.svg?branch=feat%2Fui-copy-and-localization
[ci-url]: https://github.com/Willi0t/board-game-catalog/actions/workflows/ci.yml
[stars-badge]: https://img.shields.io/github/stars/Willi0t/board-game-catalog?style=flat&logo=github
[stars-url]: https://github.com/Willi0t/board-game-catalog/stargazers
[forks-badge]: https://img.shields.io/github/forks/Willi0t/board-game-catalog?style=flat&logo=github
[forks-url]: https://github.com/Willi0t/board-game-catalog/forks
[issues-badge]: https://img.shields.io/github/issues/Willi0t/board-game-catalog?style=flat&logo=github
[issues-url]: https://github.com/Willi0t/board-game-catalog/issues
[bug-url]: https://github.com/Willi0t/board-game-catalog/issues/new
[contributors-badge]: https://img.shields.io/github/contributors/Willi0t/board-game-catalog?style=flat&logo=github
[contributors-url]: https://github.com/Willi0t/board-game-catalog/graphs/contributors
[react-badge]: https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB
[typescript-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white
[vite-badge]: https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white
[netlify-badge]: https://img.shields.io/badge/Netlify-004D4D?style=flat&logo=netlify&logoColor=white
