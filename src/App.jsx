import React, { useState, useRef, useCallback } from 'react';
import games from './games.json';
import useFavorites from './hooks/useFavorites';
import filterGames from './utils/filterGames';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CatalogToolbar from './components/CatalogToolbar';
import GameCollection from './components/GameCollection';
import GameDetails from './components/GameDetails';
import ImageModal from './components/ImageModal';

export default function App() {
  const [category, setCategory] = useState('Alla spel');
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState('');
  const [duration, setDuration] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedGameId, setSelectedGameId] = useState(games[0].id);
  const [tab, setTab] = useState('Om spelet');
  const [modal, setModal] = useState(null);
  const detailsRef = useRef(null);
  const { favorites, toggleFavorite } = useFavorites();
  const closeModal = useCallback(() => setModal(null), []);
  const filteredGames = filterGames(games, {
    category,
    favorites,
    query,
    players,
    duration,
    sort,
  });
  const selectedGame =
    filteredGames.find((g) => g.id === selectedGameId) || filteredGames[0];
  const tint = selectedGame?.tint || '#e9e4ed',
    accent = selectedGame?.accent || '#815467';
  const selectGame = (game) => {
    setSelectedGameId(game.id);
    setTab('Om spelet');
    if (window.matchMedia('(max-width: 650px)').matches)
      requestAnimationFrame(() =>
        detailsRef.current?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
          block: 'start',
        }),
      );
  };
  const reset = () => {
    setCategory('Alla spel');
    setQuery('');
    setPlayers('');
    setDuration('');
  };
  return (
    <div className="app" style={{ '--tint': tint, '--accent': accent }}>
      <Sidebar
        games={games}
        favorites={favorites}
        category={category}
        onCategoryChange={setCategory}
        onReset={reset}
      />
      <main className="workspace">
        <Header
          category={category}
          hasGames={filteredGames.length > 0}
          onRandomGame={() =>
            selectGame(
              filteredGames[Math.floor(Math.random() * filteredGames.length)],
            )
          }
        >
          <CatalogToolbar
            query={query}
            category={category}
            players={players}
            duration={duration}
            onQueryChange={setQuery}
            onCategoryChange={setCategory}
            onPlayersChange={setPlayers}
            onDurationChange={setDuration}
          />
          <div className="collection-layout">
            <GameCollection
              games={filteredGames}
              selectedGame={selectedGame}
              favorites={favorites}
              sort={sort}
              onSortChange={setSort}
              onSelectGame={selectGame}
              onReset={reset}
            />
            {selectedGame && (
              <GameDetails
                game={selectedGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onToggleFavorite={toggleFavorite}
                tab={tab}
                onTabChange={setTab}
                onOpenImage={setModal}
                detailsRef={detailsRef}
                collectionIndex={games.indexOf(selectedGame) + 1}
              />
            )}
          </div>
        </Header>
      </main>
      {modal && <ImageModal modal={modal} onClose={closeModal} />}
    </div>
  );
}
