export type InteractionScore = 0 | 1 | 2 | 3 | 4 | 5;

export interface Game {
  id: string;
  title: string;
  edition: string;
  category: string;
  accent: string;
  tint: string;
  description: string;
  longDescription?: string;
  minimumAge?: number;
  expansions?: string[];
  playersMin: number | null;
  playersMax: number | null;
  minutes: number | null;
  weight: number | null;
  bestWith: string | null;
  playerInteraction: InteractionScore | null;
  mechanics: string[];
  gameTypes: string[];
  upcoming?: boolean;
  descriptionStatus?: 'draft' | 'missing' | 'complete';
  catalogMetadata?: {
    sourceRow: number;
    sourceTitle: string;
    importedAt: string;
    preliminary: boolean;
    editionMatch: string;
  };
  metadataStatus: string;
  placeholderTheme?: string;
  cover?: string;
  coverAlt?: string;
  coverVariants?: CoverVariant[];
  hero?: string;
  heroAlt?: string;
  bannerVideo?: { youtubeId: string };
  bannerLogo?: { src: string; alt: string };
  gallery?: (string | GameGalleryEntry)[];
}

export interface CoverVariant {
  src: string;
  width: number;
}

export interface GameGalleryEntry {
  src: string;
  title?: string;
  alt?: string;
}

export type GameImageKind = 'cover' | 'scene' | 'detail';

export interface GalleryImage {
  src?: string;
  placeholderSrc: string;
  placeholderTint?: string;
  alt?: string;
  kind: GameImageKind;
  gameId: string;
  gameTitle: string;
  title: string;
}

export type DetailTab = 'Om spelet' | 'Bilder';
