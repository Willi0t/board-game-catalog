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
  playersMin: number;
  playersMax: number;
  minutes: number;
  weight: number;
  metadataStatus: string;
  placeholderTheme?: string;
  cover?: string;
  coverAlt?: string;
  hero?: string;
  heroAlt?: string;
  gallery?: (string | GameGalleryEntry)[];
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
  alt?: string;
  kind: GameImageKind;
  gameId: string;
  gameTitle: string;
  title: string;
}

export type DetailTab = 'Om spelet' | 'Bilder';
