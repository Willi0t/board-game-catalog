import React, { useState, useRef, useCallback } from 'react';
import gameData from './games.json';
import type { Game, GalleryImage, DetailTab } from './types/game';
import styles from './App.module.css';

import useFavorites from './hooks/useFavorites';
import filterGames from './utils/filterGames';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import CatalogToolbar from './components/CatalogToolbar/CatalogToolbar';
import GameCollection from './components/GameCollection/GameCollection';
import GameDetails from './components/GameDetails/GameDetails';
import ImageModal from './components/ImageModal/ImageModal';

const games: Game[] = gameData;

export default function App() {
  const [category, setCategory] = useState('Alla spel');
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState('');
  const [duration, setDuration] = useState('');
  const [sort, setSort] = useState('default');
  const [selectedGameId, setSelectedGameId] = useState(games[0].id);
  const [tab, setTab] = useState<DetailTab>('Om spelet');
  const [modal, setModal] = useState<GalleryImage | null>(null);
  const detailsRef = useRef<HTMLElement>(null);
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
  const selectGame = (game: Game) => {
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
  const themeStyle: React.CSSProperties & {
    '--tint': string;
    '--accent': string;
  } = { '--tint': tint, '--accent': accent };
  return (
    <div className={styles['app']} style={themeStyle}>
      <Sidebar
        games={games}
        favorites={favorites}
        category={category}
        onCategoryChange={setCategory}
        onReset={reset}
      />
      <main className={styles['workspace']}>
        <Header
          contentClassName={styles['workspace-inner']}
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
          <div className={styles['collection-layout']}>
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
