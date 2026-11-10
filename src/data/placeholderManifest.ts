import data from './placeholder-manifest.json';

export interface PlaceholderTheme {
  cover: string;
  scene: string;
  detail: string;
  accent?: string;
  tint?: string;
}

interface ManifestTheme extends PlaceholderTheme {
  accent: string;
  tint: string;
  motif: string;
  palette: string;
}

interface PlaceholderManifest {
  version: number;
  defaultTheme: string;
  themes: Record<string, ManifestTheme | undefined>;
  games: Record<string, string | undefined>;
}

export const placeholderManifest: PlaceholderManifest = data;
