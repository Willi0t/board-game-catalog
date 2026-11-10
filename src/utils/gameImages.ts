import type {
  Game,
  GalleryImage,
  GameImageKind,
  GameGalleryEntry,
} from '../types/game';
import {
  defaultPlaceholderTheme,
  placeholderThemes,
} from '../constants/placeholderThemes';

export function getGameImage(
  game: Game,
  kind: GameImageKind,
  src?: string,
  title?: string,
  alt?: string,
): GalleryImage {
  const theme =
    placeholderThemes[game.placeholderTheme ?? ''] ?? defaultPlaceholderTheme;
  return {
    src: src?.trim() || undefined,
    alt,
    placeholderSrc: theme[kind],
    kind,
    gameId: game.id,
    gameTitle: game.title,
    title:
      title ??
      (kind === 'cover'
        ? 'Omslag'
        : kind === 'scene'
          ? 'Spelet uppdukat'
          : 'Komponenter'),
  };
}

export function getCoverImage(game: Game) {
  return getGameImage(game, 'cover', game.cover, undefined, game.coverAlt);
}

export function getHeroImage(game: Game) {
  return getGameImage(game, 'scene', game.hero, undefined, game.heroAlt);
}

export function getGalleryImages(game: Game): GalleryImage[] {
  const sources = game.gallery?.filter((entry) =>
    (typeof entry === 'string' ? entry : entry.src).trim(),
  );
  if (!sources?.length)
    return [getGameImage(game, 'scene'), getGameImage(game, 'detail')];
  return sources.map((entry, index) => {
    const source: GameGalleryEntry =
      typeof entry === 'string' ? { src: entry } : entry;
    return getGameImage(
      game,
      index === 0 ? 'scene' : 'detail',
      source.src,
      source.title || `Bild ${index + 1}`,
      source.alt,
    );
  });
}
