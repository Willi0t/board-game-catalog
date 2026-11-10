interface PlaceholderTheme {
  cover: string;
  scene: string;
  detail: string;
}

function theme(folder: string): PlaceholderTheme {
  const base = `/images/placeholders/${folder}`;
  return {
    cover: `${base}/cover.svg`,
    scene: `${base}/scene.svg`,
    detail: `${base}/detail.svg`,
  };
}

export const defaultPlaceholderTheme = theme('castle/rose');

export const placeholderThemes: Record<string, PlaceholderTheme> = {
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
