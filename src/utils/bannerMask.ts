// object-fit: contain centres the visible image inside its element's box.
// Start the fade at that visible edge, not at the edge of the letterboxing.
export function getBannerMask(
  boxWidth: number,
  boxHeight: number,
  imageWidth: number,
  imageHeight: number,
): string | undefined {
  if (Math.min(boxWidth, boxHeight, imageWidth, imageHeight) <= 0)
    return undefined;
  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  const vertical = boxHeight - height > 1;
  const horizontal = boxWidth - width > 1;
  if (!vertical && !horizontal) return undefined;
  const edge = vertical ? (boxHeight - height) / 2 : (boxWidth - width) / 2;
  const length = vertical ? height : width;
  const fade = Math.min(6, length / 4);
  return `linear-gradient(to ${vertical ? 'bottom' : 'right'}, transparent ${edge}px, #000 ${edge + fade}px, #000 ${edge + length - fade}px, transparent ${edge + length}px)`;
}
