import {
  placeholderManifest,
  type PlaceholderTheme,
} from '../data/placeholderManifest';
import type { Game } from '../types/game';

function theme(folder: string): PlaceholderTheme {
  const base = `/images/placeholders/${folder}`;
  return {
    cover: `${base}/cover.svg`,
    scene: `${base}/scene.svg`,
    detail: `${base}/detail.svg`,
  };
}

export const defaultPlaceholderTheme =
  placeholderManifest.themes[placeholderManifest.defaultTheme] ??
  theme('castle/rose');

export const legacyPlaceholderThemes: Record<
  string,
  PlaceholderTheme | undefined
> = {
  'castle-rose': theme('castle/rose'),
  'castle-teal': theme('castle/teal'),
  'castle-blue': theme('castle/blue'),
  'castle-red': theme('castle/red'),
  'planet-rust': theme('planet/rust'),
  'planet-gold': theme('planet/gold'),
  'planet-copper': theme('planet/copper'),
  'planet-slate': theme('planet/slate'),
  'geometric-purple': theme('geometric/purple'),
  'geometric-green': theme('geometric/green'),
  'geometric-teal': theme('geometric/teal'),
  'geometric-olive': theme('geometric/olive'),
};

// V2 definitions win when a key exists in both registries. Legacy-only keys remain usable.
export const placeholderThemes: Record<string, PlaceholderTheme | undefined> = {
  ...legacyPlaceholderThemes,
  ...placeholderManifest.themes,
};

export function resolvePlaceholderTheme(
  game: Pick<Game, 'id' | 'placeholderTheme'>,
): PlaceholderTheme {
  const mappedKey = placeholderManifest.games[game.id];
  return (
    (mappedKey ? placeholderManifest.themes[mappedKey] : undefined) ??
    placeholderThemes[game.placeholderTheme ?? ''] ??
    defaultPlaceholderTheme
  );
}

export function resolveGameColors(
  game: Pick<
    Game,
    'id' | 'placeholderTheme' | 'accent' | 'tint' | 'catalogMetadata'
  >,
) {
  const selectedTheme = resolvePlaceholderTheme(game);
  // Burgundy's rose palette was individually chosen before the catalog import.
  const hasImportedDefault =
    game.id !== 'burgundy' &&
    game.catalogMetadata != null &&
    game.placeholderTheme === 'castle-rose' &&
    game.accent === '#815467' &&
    game.tint === '#eadce2';
  return hasImportedDefault
    ? {
        accent: selectedTheme.accent ?? game.accent,
        tint: selectedTheme.tint ?? game.tint,
      }
    : { accent: game.accent, tint: game.tint };
}
