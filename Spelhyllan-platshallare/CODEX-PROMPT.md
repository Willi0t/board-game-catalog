# Integrera nya reservillustrationer i Spelhyllan

Implementera paketet i mitt aktuella board-game-catalog-projekt i VS Code.

## Arbetsflöde
- Läs AGENTS.md, git-status och aktuell bildhantering först. Bevara mina lokala ändringar. Om vi står på main med ren arbetskopia, skapa feature/placeholder-themes. Gör ingen commit, push eller merge.
- Paketets public/ och src/data/ är tillägg till repot, inte en ersättning för hela dessa mappar. Arkiverade original-SVG:er och verkliga spelbilder ska finnas kvar.
- Inga nya runtime-beroenden, backend eller nätverksanrop. Använd befintlig TypeScript, CSS Modules och lokala SVG-filer.

## Innehåll
- 12 motiv × 6 paletter × 3 format = 216 SVG-filer.
- cover.svg: 600×760. scene.svg: 1600×640. detail.svg: 960×720.
- src/data/placeholder-manifest.json är den gemensamma sanningskällan för temadefinitioner och kopplingen från de 71 befintliga spel-id:na till teman.
- themes innehåller cover/scene/detail samt accent/tint. games är en explicit id → temanyckel-mappning. game-theme-overview.json är endast en lättläst granskningslista, inte en andra runtime-källa.

## Korrigera skalningen
Den gamla geometriska scenbildens diamant är ritad med andra proportioner än omslagets. De nya bilderna använder samma motivgeometri i alla format och enbart proportionell scale/translate. Bakgrunden komponerar om sig för formatet; motivet deformeras aldrig.
- Använd rätt variant: cover för kort/omslag, scene för hero, detail för detaljbild.
- Behåll bildförhållandet i både SVG och CSS. Ingen preserveAspectRatio="none", object-fit: fill, scaleX/scaleY eller stretch av motivet.
- Hero-bilderna har sidomarginal för normal responsiv beskärning. Kontrollera att motivet syns helt vid faktiskt använda bildförhållanden. Om contain behövs i extrema format, låt en tonad separat bakgrund fylla ramen så det inte uppstår vita kanter.
- Ändra inte storleken på hela detaljpanelen för att dölja bildproblemet.
- För riktiga fotografier ska befintlig bildpassning fungera separat; låt dem inte få reservbildens bakgrund eller markering.

## Koppla JSON till befintlig kod
- Anpassa src/utils/gameImages.ts och temakonstanterna till att läsa manifestet med typkontroll.
- Välj tema i ordningen manifest.games[game.id] → giltigt befintligt game.placeholderTheme → manifest.defaultTheme. Om en gammal temanyckel inte finns i v2 ska den gamla temaregistreringen fortfarande kunna lösa den.
- Verklig cover/hero/gallery har alltid prioritet. Temat används när verkligt material saknas eller inte laddas. Galleriets befintliga regler för obrukbara objekt ska fungera som tidigare.
- Ändra inte spel-id:n, speluppgifter, upcoming eller favoriter. Kopiera inte current-games.json eller game-theme-overview.json över src/games.json.
- För importerade spel som fortfarande har generiska castle-rose-färger: använd manifestets accent/tint så bakgrunden passar den nya illustrationen. Bevara redan individuellt valda färger på övriga spel om de inte krockar tydligt. Redovisa hur färgprioriteten fungerar och håll den samlad på ett ställe.
- När ett nytt spel saknar explicit mapping används reservtemat. Visa ingen teknisk felruta i appen.
- JSON-mappningen är ett visuellt förslag, inte verifierad produktgrafik. Dessa är generiska reservillustrationer, inte officiella spelomslag.

## Text och tillgänglighet
- SVG-filerna innehåller inte spelnamn eller synlig text. Behåll appens dynamiska titel på omslagen, i det fria området högst upp. Se till att långa titlar som Andromeda's Edge och The Fellowship of the Ring radbryts/skalas läsbart utan att sticka utanför omslaget.
- Alla reservbilder ska fortsatt vara tydligt märkta som platshållare och ha rätt alt-text för aktuellt spel. Riktiga bilder ska inte ha reservbildsetikett.
- Behåll återställning vid spelbyte, skydd mot oändliga bildfel, fokus, dialoger och bildförstoring.

## Verifiera
- Alla manifestets bildsökvägar ska motsvara befintliga filer. Alla temanycklar i mappningen ska finnas. Alla 71 spel ska ha exakt en mapping; inga okända id:n eller dubbletter. Om repot har fått fler spel sedan paketet skapades, behåll dem och redovisa vilka som använder default.
- Kontrollera speciellt Point Salad, Citadels, Deep Regrets, Andromeda's Edge, Tend och Re;MATCH med kort, hero och förstorad bild i cirka 390 och 1280 px. Cirklar ska vara cirklar, diamanter ska ha samma proportioner i alla format, och motiv ska inte kapas.
- Kontrollera även en riktig bild, en trasig riktig bild och en trasig reservbild enligt befintlig fallback-logik.
- Kör formatkontroll, lint, typkontroll, produktionsbygge och git diff --check. Använd befintliga testverktyg för meningsfulla tester av manifestupplösning och fallback.
- Uppdatera public/images/README.md med hur motiv, palett och mapping ändras samt hur riktiga bilder ersätter reservbilderna.
- Redovisa genomförda kontroller och eventuella delar som inte har kunnat testas i webbläsare. Ingen commit eller push.
