import { swedish, type Translate } from '../i18n/translations';
import type {
  Game,
  GalleryImage,
  GameImageKind,
  GameGalleryEntry,
} from '../types/game';
import { resolvePlaceholderTheme } from '../constants/placeholderThemes';

export function getGameImage(
  game: Game,
  kind: GameImageKind,
  src?: string,
  title?: string,
  alt?: string,
  t: Translate = swedish.t,
): GalleryImage {
  const theme = resolvePlaceholderTheme(game);
  return {
    src: src?.trim() || undefined,
    alt,
    placeholderSrc: theme[kind],
    placeholderTint: theme.tint ?? game.tint,
    kind,
    gameId: game.id,
    gameTitle: game.title,
    title:
      title ??
      (kind === 'cover'
        ? t('cover')
        : kind === 'scene'
          ? t('gameSetup')
          : t('components')),
  };
}

export function getCoverImage(game: Game, t?: Translate) {
  return getGameImage(game, 'cover', game.cover, undefined, game.coverAlt, t);
}

export function getHeroImage(game: Game, t?: Translate) {
  return getGameImage(game, 'scene', game.hero, undefined, game.heroAlt, t);
}

export function getGalleryImages(
  game: Game,
  t: Translate = swedish.t,
): GalleryImage[] {
  const sources = game.gallery?.filter((entry) =>
    (typeof entry === 'string' ? entry : entry.src).trim(),
  );
  if (!sources?.length)
    return (['scene', 'detail'] as const).map((kind) =>
      getGameImage(game, kind, undefined, undefined, undefined, t),
    );
  return sources.map((entry, index) => {
    const source: GameGalleryEntry =
      typeof entry === 'string' ? { src: entry } : entry;
    return {
      ...getGameImage(
        game,
        index === 0 ? 'scene' : 'detail',
        source.src,
        source.title || t('numberedImage', index + 1),
        source.alt,
        t,
      ),
      videoSrc: source.videoSrc,
    };
  });
}
