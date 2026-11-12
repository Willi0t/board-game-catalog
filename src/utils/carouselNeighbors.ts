export function getCarouselNeighbors(count: number, current: number) {
  const used = new Set([current]);
  const offsets = count === 2 ? [1] : [-1, 1, -2, 2];
  return offsets.flatMap((offset) => {
    const index = (current + offset + count) % count;
    if (count < 2 || used.has(index)) return [];
    used.add(index);
    return [{ index, offset }];
  });
}
