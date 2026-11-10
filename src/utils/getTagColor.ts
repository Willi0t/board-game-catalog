// Colors belong to tag identities, never to their position in a sorted list.
const colors: Readonly<Record<string, string>> = {
  Competitive: '#af8b74',
  Party: '#b28d9e',
  Cooperative: '#83a19b',
  Adventure: '#8d96b3',
  Campaign: '#b39a6e',
  'Team-based': '#9baa7e',
  'Dungeon crawler': '#aa8875',
  Racing: '#ba9b60',
  'Semi-cooperative': '#71999d',
  'Boss battler': '#9484a8',
  Solo: '#7a9a81',
};

export default function getTagColor(tag: string): string {
  if (Object.hasOwn(colors, tag)) return colors[tag];
  let hash = 0;
  for (const character of tag)
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} 24% 60%)`;
}
