# Bilder i Spelhyllan

Allt bildmaterial är lokalt. Speldata ligger centralt i `src/games.json`.

## Riktigt spelmaterial

Använd spelets stabila `id` som mappnamn. Byt inte id när du byter titel eller
bilder: favoriter sparar id i localStorage.

```text
games/<game-id>/
  cover.webp
  hero.webp
  gallery/
    spelet-uppdukat.webp
    komponenter.webp
```

`coverAlt` och `heroAlt` kan beskriva motivet i dina riktiga bilder. Ett galleri
kan använda enkla sökvägar enligt exemplet ovan eller poster med egen titel och
alt-text, exempelvis (först när filen finns):

```json
{
  "src": "/images/games/burgundy/gallery/spelet-uppdukat.webp",
  "title": "Spelet uppdukat",
  "alt": "Beskriv vad just ditt fotografi visar här."
}
```

Utan egen alt-text används en neutral bildetikett och speltiteln. Vid bildfel
används alltid platshållarens alt-text, inte fotografiets beskrivning.

WebP är en namnkonvention, inte ett krav. PNG, JPG, AVIF och SVG fungerar också.
Skapa mappar först när du har verkliga filer. Lägg inte in tomma filer eller
JSON-sökvägar till framtida material.

När filerna för exempelvis `burgundy` faktiskt finns kan dess befintliga post
kompletteras med dessa bildfält (övriga spelfält behålls):

```json
{
  "id": "burgundy",
  "placeholderTheme": "castle-rose",
  "cover": "/images/games/burgundy/cover.webp",
  "hero": "/images/games/burgundy/hero.webp",
  "gallery": [
    "/images/games/burgundy/gallery/spelet-uppdukat.webp",
    "/images/games/burgundy/gallery/komponenter.webp"
  ]
}
```

För ett nytt spel: välj ett nytt stabilt id, lägg till en fullständig post i
`src/games.json` och välj ett `placeholderTheme`. Lägg därefter eventuella riktiga
bilder i `games/<det-nya-id:t>/` och ange bara sökvägar till filer som finns.
Verifiera fakta mot din utgåva; kopiera inte exempelspelens värden som fakta.

## Återanvändbara reservillustrationer

Den gemensamma sanningskällan är `src/data/placeholder-manifest.json`:

- `themes`: 72 teman (12 motiv × 6 paletter), med `cover`, `scene`, `detail`,
  `accent` och `tint`. Bilderna ligger i `placeholders/v2/<motiv>/<palett>/`.
- `games`: explicit koppling från stabilt spel-id till temanyckel. Den ändrar
  endast det visuella reservtemat, aldrig speldata, ägarstatus eller favoriter.
- `defaultTheme`: tema för spel som varken har mapping eller giltigt eget tema.

Ändra ett spels föreslagna motiv/palett genom att uppdatera dess temanyckel i
`games`. Välj en befintlig nyckel i `themes`. När nya motiv/paletter läggs till
ska alla tre SVG-formaten finnas och samtliga sökvägar uppdateras i manifestet.
Illustrationerna återskapas med `scripts/generate_placeholders.py` (Python 3,
endast standardbiblioteket). Kör från projektroten:

```bash
python3 scripts/generate_placeholders.py
```

Generatorn skriver endast de 216 SVG-bilderna under
`public/images/placeholders/v2/`. Den läser eller skriver inte speldata,
temamappning, `defaultTheme` eller manifestet. Ändra aktuell mapping manuellt i
`src/data/placeholder-manifest.json` när ett spels tema ska bytas; kör inte en
äldre paketgenerator över projektets JSON-filer.

För att granska illustrationerna separat utan att skriva till appens bilder:

```bash
python3 scripts/generate_placeholders.py --output-dir /tmp/spelhyllan-images --preview /tmp/spelhyllan-preview.svg
```

`--output-dir` väljer bildmappen; `--preview` är valfri och accepterar endast
SVG-sökvägar. Generatorns sökvägar utgår från scriptets plats, inte aktuell
arbetskatalog. Den tidigare leveransmappen behövs inte längre.

Temaprioritet: giltig manifestmapping → giltigt `game.placeholderTheme` i v2
eller det äldre registret → manifestets `defaultTheme` (`geometric-slate`).
Äldre nycklar som inte finns i v2 kan fortfarande lösas av det äldre registret
under `src/constants/placeholderThemes.ts`. Vid nyckelkrock har v2 företräde.

Färgprioriteten är samlad i `resolveGameColors` i samma modul. Importerade
poster med `castle-rose` och exakt standardparet `#815467`/`#eadce2` får det
upplösta temats accent/tint. Burgundy undantas eftersom dess rosa färger valdes
individuellt före importen. Övriga individuella färgpar bevaras. Detta beräknas
vid visning; `src/games.json` skrivs inte om.

V2-format: omslag 600×760, hero/scen 1600×640 och detalj 960×720. Motiven har
samma geometri i alla format och skalas proportionellt. `GameImage` använder
`contain` för reservbilder, med en separat tonad bakgrund, så hela motivet syns
även i smala eller höga ramar. Riktiga fotografier behåller komponentens vanliga
bildpassning och får varken reservbakgrund eller platshållarmarkering.

V2-filerna saknar synlig text och spelnamn. Appen lägger aktuell titel på
omslaget i det fria övre området med radbrytning och proportionell storlek.
Bilderna är generiska reservillustrationer och mappingen är ett visuellt
förslag, inte verifierad eller officiell produktgrafik.

### Äldre illustrationer

De tidigare mapparna `castle`, `planet` och `geometric` under `placeholders/`
finns kvar med alla färgvarianter. Varje variant innehåller `cover.svg`,
`scene.svg`, `detail.svg` och `cover.original.svg`. Det sista är arkivomslaget
med det ursprungliga spelnamnet och används inte som generell reservbild.
Inga arkivbilder eller riktiga spelbilder har ersatts.

### Riktiga bilder och laddningsfel

`cover`, `hero` och `gallery` har alltid prioritet över reservtemat. Ange deras
lokala sökvägar enligt exemplen ovan först när filerna finns. Saknad eller tom
`gallery` visar temats scen- och detaljillustration; tomma sökvägar filtreras.
En riktig bild som inte laddas ersätts med motsvarande reservbild. Misslyckas
även den görs inga fler försök i samma instans: informationsvyer visar en
textreserv och obrukbara galleriobjekt döljs. Nytt spel eller ändrade sökvägar
återställer tillståndet.

Reservbilder markeras som platshållare och får alt-text för aktuellt spel.
Bildstatus är oberoende av spelvärdenas metadata. Kör
`node --test tests/*.test.mjs` för att kontrollera mapping, färgprioritet,
bildsökvägar och oförändrad motivgeometri samt befintliga katalogtester.
