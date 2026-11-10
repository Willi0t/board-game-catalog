import React, { useState, useRef, useCallback } from 'react';
import games from './data/games';
import type { Game, GalleryImage, DetailTab } from './types/game';
import styles from './App.module.css';

import useFavorites from './hooks/useFavorites';
import filterGames, { type Availability } from './utils/filterGames';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import CatalogToolbar from './components/CatalogToolbar/CatalogToolbar';
import GameCollection from './components/GameCollection/GameCollection';
import GameDetails from './components/GameDetails/GameDetails';
import ImageModal from './components/ImageModal/ImageModal';
import GameDetailDrawer from './components/GameDetailDrawer/GameDetailDrawer';

export default function App() {
  const [category, setCategory] = useState('Alla spel');
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState('');
  const [duration, setDuration] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [gameType, setGameType] = useState('');
  const [availability, setAvailability] = useState<Availability>('all');
  const [sort, setSort] = useState('default');
  const [selectedGameId, setSelectedGameId] = useState(games[0].id);
  const [tab, setTab] = useState<DetailTab>('Om spelet');
  const [modal, setModal] = useState<GalleryImage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerOpenerRef = useRef<HTMLElement>(null);
  const imageOpenerRef = useRef<HTMLElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const drawerFallbackRef = useRef<HTMLElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const closeModal = useCallback(() => setModal(null), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const openImage = (image: GalleryImage, trigger: HTMLButtonElement) => {
    imageOpenerRef.current = trigger;
    setModal(image);
  };
  const openDetails = (game: Game, trigger: HTMLButtonElement) => {
    drawerOpenerRef.current = trigger;
    setSelectedGameId(game.id);
    setTab('Om spelet');
    setIsDrawerOpen(true);
  };
  const filteredGames = filterGames(games, {
    category,
    favorites,
    mechanic,
    gameType,
    availability,
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
      requestAnimationFrame(() => {
        if (document.querySelector('dialog[open]')) return;
        detailsRef.current?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
          block: 'start',
        });
      });
  };
  const reset = () => {
    setCategory('Alla spel');
    setQuery('');
    setPlayers('');
    setDuration('');
    setMechanic('');
    setGameType('');
    setAvailability('all');
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
      <main ref={libraryRef} tabIndex={-1} className={styles['workspace']}>
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
            mechanic={mechanic}
            gameType={gameType}
            availability={availability}
            onMechanicChange={setMechanic}
            onGameTypeChange={setGameType}
            onAvailabilityChange={setAvailability}
            onReset={reset}
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
              onOpenDetails={openDetails}
              onReset={reset}
            />
            {selectedGame && (
              <GameDetails
                game={selectedGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onToggleFavorite={toggleFavorite}
                tab={tab}
                onTabChange={setTab}
                onOpenImage={openImage}
                onShowMore={openDetails}
                detailsRef={detailsRef}
                collectionIndex={games.indexOf(selectedGame) + 1}
              />
            )}
          </div>
        </Header>
      </main>
      {isDrawerOpen && selectedGame && (
        <GameDetailDrawer
          game={selectedGame}
          onClose={closeDrawer}
          onOpenImage={openImage}
          openerRef={drawerOpenerRef}
          fallbackRef={libraryRef}
          panelRef={drawerFallbackRef}
        />
      )}
      {modal && (
        <ImageModal
          modal={modal}
          onClose={closeModal}
          openerRef={imageOpenerRef}
          fallbackRef={isDrawerOpen ? drawerFallbackRef : libraryRef}
        />
      )}
    </div>
  );
}
