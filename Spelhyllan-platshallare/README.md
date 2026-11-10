# Reservillustrationer för Spelhyllan

Öppna preview.png för att se alla tolv motiv i omslags- och bredformat. Alla motiv finns i rose, sage, teal, slate, gold och violet.

Motiv: castle, planet, geometric, garden, forest, ocean, ship, city, industry, arcane, desert och cards. Illustrationerna är generiska, egenritade SVG:er utan inbakade spelnamn. Samma motiv har samma proportioner i alla format. Färger och former följer den befintliga ljusa katalogstilen.

## Använd i VS Code

1. Packa upp paketet i en separat mapp i projektet, exempelvis placeholder-import/.
2. Be Codex läsa CODEX-PROMPT.md i paketet och genomföra integrationen.
3. public/ och src/data/ kopieras samman med motsvarande mappar i repot. De ska inte ersätta mapparna i sin helhet.

Teman och spelkopplingar definieras i src/data/placeholder-manifest.json. Exempel: salad → garden-sage, citadels → castle-rose, knarr → ship-teal, brass-pittsburgh → industry-gold. Kopplingen omfattar de 71 spel-id:n som fanns på GitHubs main vid framtagningen 2026-11-10.

Riktigt bildmaterial prioriteras alltid före reservbilder. Äldre original och tidigare reservbilder ska behållas. Inga appfiler i det aktuella GitHub-repot har ändrats av detta paket.

current-games.json innehåller endast id och titel som reproducerbart underlag till generatorn, inte katalogens kompletta speldata. Kör python3 generate_placeholders.py för att återskapa SVG-filerna och manifestet. Generatorn använder endast Pythons standardbibliotek. Preview.png är en renderad förhandsvisning; preview.svg är dess källa.
