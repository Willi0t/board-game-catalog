import { useState, useEffect } from 'react';

export default function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(
        localStorage.getItem('spelhyllan-favorites') || '[]',
      );
      return Array.isArray(value)
        ? value.filter((id: unknown): id is string => typeof id === 'string')
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('spelhyllan-favorites', JSON.stringify(favorites));
    } catch {
      // Keep in-memory favorites when browser storage is unavailable or full.
    }
  }, [favorites]);
  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  return { favorites, toggleFavorite };
}
