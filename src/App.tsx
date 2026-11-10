import React, { useState, useRef, useCallback } from 'react';
import games from './data/games';
import { resolveGameColors } from './constants/placeholderThemes';
import type { Game, GalleryImage, DetailTab } from './types/game';
import styles from './App.module.css';

import useFavorites from './hooks/useFavorites';
import resolveSelectedGame from './utils/resolveSelectedGame';
import useMediaQuery from './hooks/useMediaQuery';
import GameInfoPanel from './components/GameInfoPanel/GameInfoPanel';
import filterGames, { type Availability } from './utils/filterGames';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import CatalogToolbar from './components/CatalogToolbar/CatalogToolbar';
import GameCollection from './components/GameCollection/GameCollection';
import GameDetails from './components/GameDetails/GameDetails';
import ImageModal from './components/ImageModal/ImageModal';
import GameDetailDrawer from './components/GameDetailDrawer/GameDetailDrawer';
import GamePicker from './components/GamePicker/GamePicker';
import GamePickerResult from './components/GamePickerResult/GamePickerResult';
import {
  defaultPickerCriteria,
  matchPickerGames,
  type PickerCriteria,
} from './utils/gamePicker';

export default function App() {
  const [category, setCategory] = useState('Alla spel');
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState('');
  const [duration, setDuration] = useState('');
  const [mechanic, setMechanic] = useState('');
  const [gameType, setGameType] = useState('');
  const [availability, setAvailability] = useState<Availability>('all');
  const [sort, setSort] = useState('default');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false);
  const infoOpenerRef = useRef<HTMLElement>(null);
  const infoFallbackRef = useRef<HTMLElement>(null);
  const [tab, setTab] = useState<DetailTab>('Om spelet');
  const [modal, setModal] = useState<GalleryImage | null>(null);
  const [detailGame, setDetailGame] = useState<Game | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerOpenerRef = useRef<HTMLElement>(null);
  const [pickerCriteria, setPickerCriteria] = useState(defaultPickerCriteria);
  // A snapshot of applied guide criteria is the sole active filter in guide mode.
  // Draft edits stay separate until the user confirms the final step.
  const [activePickerCriteria, setActivePickerCriteria] =
    useState<PickerCriteria | null>(null);
  const drawerOpenerRef = useRef<HTMLElement>(null);
  const imageOpenerRef = useRef<HTMLElement>(null);
  const libraryRef = useRef<HTMLElement>(null);
  const drawerFallbackRef = useRef<HTMLElement>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const closeModal = useCallback(() => setModal(null), []);
  const closeDrawer = useCallback(() => setDetailGame(null), []);
  const closePicker = useCallback(() => setIsPickerOpen(false), []);
  const openImage = (image: GalleryImage, trigger: HTMLButtonElement) => {
    imageOpenerRef.current = trigger;
    setModal(image);
  };
  const openDetails = (game: Game, trigger: HTMLButtonElement) => {
    drawerOpenerRef.current = trigger;
    setSelectedGameId(game.id);
    setTab('Om spelet');
    setDetailGame(game);
  };
  const filteredGames = activePickerCriteria
    ? filterGames(matchPickerGames(games, activePickerCriteria), { sort })
    : filterGames(games, {
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
  const selectedGame = resolveSelectedGame(filteredGames, selectedGameId);
  const resolvedGameId = selectedGame?.id ?? null;
  // Persist the fallback without invoking manual-selection focus/dialog behavior.
  if (selectedGameId !== resolvedGameId) {
    setSelectedGameId(resolvedGameId);
    if (isMobileInfoOpen) setIsMobileInfoOpen(false);
  }
  const themeGame = detailGame ?? selectedGame;
  const { tint, accent } = themeGame
    ? resolveGameColors(themeGame)
    : { tint: '#e9e4ed', accent: '#815467' };
  const selectGame = (game: Game, trigger: HTMLButtonElement) => {
    infoOpenerRef.current = trigger;
    setSelectedGameId(game.id);
    setTab('Om spelet');
    setIsMobileInfoOpen(isMobile);
  };
  const reset = () => {
    setActivePickerCriteria(null);
    setCategory('Alla spel');
    setQuery('');
    setPlayers('');
    setDuration('');
    setMechanic('');
    setGameType('');
    setAvailability('all');
  };
  const changeCategory = (nextCategory: string) => {
    setActivePickerCriteria(null);
    setCategory(nextCategory);
  };
  const openPicker = (
    trigger: HTMLButtonElement,
    changes?: Partial<PickerCriteria>,
  ) => {
    pickerOpenerRef.current = trigger;
    if (activePickerCriteria)
      setPickerCriteria({ ...activePickerCriteria, ...changes });
    setIsPickerOpen(true);
  };
  const applyPicker = () => {
    setActivePickerCriteria(pickerCriteria);
    setIsPickerOpen(false);
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
        category={activePickerCriteria ? 'Guidens resultat' : category}
        onCategoryChange={changeCategory}
        onReset={reset}
      />
      <main ref={libraryRef} tabIndex={-1} className={styles['workspace']}>
        <Header
          contentClassName={styles['workspace-inner']}
          category={activePickerCriteria ? 'Guidens resultat' : category}
          onOpenPicker={openPicker}
        >
          <div className={styles['collection-layout']}>
            <div className={styles['catalog-column']}>
              {activePickerCriteria ? (
                <GamePickerResult
                  games={games}
                  criteria={activePickerCriteria}
                  count={filteredGames.length}
                  onEdit={openPicker}
                  onClear={() => setActivePickerCriteria(null)}
                />
              ) : (
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
                  onCategoryChange={changeCategory}
                  onPlayersChange={setPlayers}
                  onDurationChange={setDuration}
                />
              )}
              <GameCollection
                games={filteredGames}
                selectedGame={selectedGame}
                favorites={favorites}
                sort={sort}
                onSortChange={setSort}
                onSelectGame={selectGame}
                onOpenDetails={openDetails}
                onReset={
                  activePickerCriteria
                    ? (trigger) => openPicker(trigger)
                    : reset
                }
                isPickerResult={activePickerCriteria !== null}
              />
            </div>
            <GameInfoPanel
              gameId={selectedGame?.id}
              isMobile={isMobile}
              isOpen={isMobileInfoOpen}
              onClose={() => setIsMobileInfoOpen(false)}
              openerRef={infoOpenerRef}
              fallbackRef={libraryRef}
              panelRef={infoFallbackRef}
            >
              {selectedGame && (
                <GameDetails
                  game={selectedGame}
                  isFavorite={favorites.includes(selectedGame.id)}
                  onToggleFavorite={toggleFavorite}
                  tab={tab}
                  onTabChange={setTab}
                  onOpenImage={openImage}
                  onShowMore={openDetails}
                  collectionIndex={games.indexOf(selectedGame) + 1}
                />
              )}
            </GameInfoPanel>
          </div>
        </Header>
      </main>
      {isPickerOpen && (
        <GamePicker
          games={games}
          onClose={closePicker}
          criteria={pickerCriteria}
          onCriteriaChange={setPickerCriteria}
          onApply={applyPicker}
          openerRef={pickerOpenerRef}
          fallbackRef={libraryRef}
        />
      )}
      {detailGame && (
        <GameDetailDrawer
          game={detailGame}
          onClose={closeDrawer}
          onOpenImage={openImage}
          openerRef={drawerOpenerRef}
          fallbackRef={
            isMobile && isMobileInfoOpen ? infoFallbackRef : libraryRef
          }
          panelRef={drawerFallbackRef}
        />
      )}
      {modal && (
        <ImageModal
          modal={modal}
          onClose={closeModal}
          openerRef={imageOpenerRef}
          fallbackRef={
            detailGame
              ? drawerFallbackRef
              : isMobile && isMobileInfoOpen
                ? infoFallbackRef
                : libraryRef
          }
        />
      )}
    </div>
  );
}
