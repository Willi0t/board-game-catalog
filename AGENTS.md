# Project guidance

- Keep this a static React/Vite catalog with local JSON content and local image files. Do not add a backend, database, authentication, or AI API calls unless explicitly requested.
- Preserve the light Playnite/Dune-inspired design and the selected game's subtle background tint with smooth transitions.
- UI text is Swedish. Keep it accessible and responsive, and honor reduced motion.
- Content lives in src/games.json; assets live in public/images. The SVG placeholders are intentionally temporary.
- Player counts, durations, weights and draft descriptions are demo content; do not present them as verified facts. Verify the exact edition when replacing them.
- Favorites use localStorage and are per browser only.
- Use strict TypeScript: React components in .tsx; hooks, utilities, constants and Vite configuration in .ts. Shared game types live in src/types/game.ts. Check imported JSON against Game without forced type assertions.
- Keep component styles in adjacent .module.css files using plain CSS, not Sass. Use src/App.module.css for shared layout; reserve src/styles.css for fonts, base element styles and reduced motion. Preserve CSS variable inheritance, selector specificity and responsive rule order; pass explicit class props across component boundaries when needed.
- Run npm run format, npm run format:check, npm run typecheck and npm run build after code changes. The build includes typechecking. Do not commit node_modules or dist.
