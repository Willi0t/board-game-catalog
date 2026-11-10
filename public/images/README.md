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

```text
placeholders/
  castle/{rose,teal,blue,red}/
  planet/{rust,gold,copper,slate}/
  geometric/{purple,green,teal,olive}/
```

Varje färgvariant har `cover.svg`, `scene.svg`, `detail.svg` och
`cover.original.svg`. Alla ursprungliga färger och former är bevarade. De tre
illustrationstyperna är slott, planet med ring och geometrisk figur.

`cover.original.svg` är det arkiverade omslaget med det ursprungliga spelnamnet.
Det används **inte** som generell reservbild. `cover.svg` har exakt samma
illustration utan titeln; `GameImage` lägger ovanpå det aktuella spelets titel
med samma SVG-position, typsnitt och storlek. Scen- och detaljbilder är oförändrade.

Temanycklar och sökvägar definieras enbart i
`src/constants/placeholderThemes.ts`, exempelvis `castle-rose`, `planet-rust`
och `geometric-purple`. Okänt eller utelämnat tema använder `castle-rose`.

`cover`, `hero` och `gallery` är valfria. Saknad eller tom `gallery` visar temats
scen- och detaljillustration. Tomma strängar i galleriet filtreras bort.
En angiven riktig bild som inte laddas ersätts med motsvarande reservbild.
Om även den misslyckas görs inga fler försök i samma bildinstans: kort och
informationsvyer visar en textreserv, medan galleriobjektet döljs. Nytt spel
eller ändrade bildsökvägar återställer laddningstillståndet.

Reservbilder får platshållartext och alt-text för det aktuella spelet. Riktiga
bilder får inte platshållarmarkering. Bildstatus är oberoende av spelvärdenas
`metadataStatus`; ett riktigt fotografi gör inte exempelvärden verifierade.
