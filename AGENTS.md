# Project guidance

- Keep this a static React/Vite catalog with local JSON content and local image files. Do not add a backend, database, authentication, or AI API calls unless explicitly requested.
- Preserve the light Playnite/Dune-inspired design and the selected game's subtle background tint with smooth transitions.
- UI text is Swedish. Keep it accessible and responsive, and honor reduced motion.
- Content lives in src/games.json; assets live in public/images. The SVG placeholders are intentionally temporary.
- Player counts, durations, weights and draft descriptions are demo content; do not present them as verified facts. Verify the exact edition when replacing them.
- Favorites use localStorage and are per browser only.
- Run npm run build after code changes. Do not commit node_modules or dist.
