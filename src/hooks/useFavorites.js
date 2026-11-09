import { useState, useEffect } from 'react';

export default function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem('spelhyllan-favorites') || '[]',
      );
      return Array.isArray(value)
        ? value.filter((id) => typeof id === 'string')
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('spelhyllan-favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);
  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  return { favorites, toggleFavorite };
}
