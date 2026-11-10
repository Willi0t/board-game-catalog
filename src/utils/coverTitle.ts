export function layoutCoverTitle(title: string) {
  const words = title
    .trim()
    .split(/\s+/)
    .flatMap((word) => word.match(/.{1,24}/gu) ?? []);
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && last.length + word.length + 1 <= 24)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  const fontSize = Math.min(
    lines.length === 1 ? 37 : 32,
    140 / Math.max(1, lines.length) / 1.2,
  );
  return {
    lines,
    fontSize,
    lineHeight: fontSize * 1.2,
    firstY: 98 - (lines.length - 1) * fontSize * 0.6,
  };
}
