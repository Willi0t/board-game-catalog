export interface Game {
  id: string;
  title: string;
  edition: string;
  category: string;
  accent: string;
  tint: string;
  description: string;
  playersMin: number;
  playersMax: number;
  minutes: number;
  weight: number;
  metadataStatus: string;
  cover: string;
  gallery: string[];
}

export interface GalleryImage {
  src: string;
  title: string;
}

export type DetailTab = 'Om spelet' | 'Bilder';
