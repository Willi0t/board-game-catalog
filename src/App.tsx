import { useState, useRef, type CSSProperties } from 'react';
import games from './data/games';
import { resolveGameColors } from './constants/placeholderThemes';
import type { Game } from './types/game';
import styles from './App.module.css';

import useFavorites from './hooks/useFavorites';
import type { LibraryView } from './utils/filterGames';
import useCatalog from './hooks/useCatalog';
import useGamePicker from './hooks/useGamePicker';
import useGamePanels from './hooks/useGamePanels';
import useMediaQuery from './hooks/useMediaQuery';
import GameInfoPanel from './components/GameInfoPanel/GameInfoPanel';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header/Header';
import CatalogToolbar from './components/CatalogToolbar/CatalogToolbar';
import GameCollection from './components/GameCollection/GameCollection';
import GameDetails from './components/GameDetails/GameDetails';
import ImageModal from './components/ImageModal/ImageModal';
import GameDetailDrawer from './components/GameDetailDrawer/GameDetailDrawer';
import GamePicker from './components/GamePicker/GamePicker';
import GamePickerResult from './components/GamePickerResult/GamePickerResult';

export default function App() {
  const { favorites, toggleFavorite } = useFavorites();
  const picker = useGamePicker();
  const [aiIds, setAiIds] = useState<string[] | null>(null);
  const catalog = useCatalog(games, favorites, picker.appliedCriteria, aiIds);
  const clearAi = () => setAiIds(null);
  const recommend = (ids: string[]) => {
    const valid = [...new Set(ids)].filter((id) =>
      games.some((g) => g.id === id),
    );
    if (!valid.length) return;
    setAiIds(valid);
    picker.close();
  };
  const isMobile = useMediaQuery('(max-width: 900px)');
  const { mobilePanel, detailDrawer, imageModal, tab, setTab, showGameInfo } =
    useGamePanels(catalog.selectedGame?.id ?? null, isMobile);
  const libraryRef = useRef<HTMLElement>(null);
  const selectedGame = catalog.selectedGame;
  const viewLabel = aiIds
    ? 'AI:s rekommendationer'
    : picker.appliedCriteria
      ? 'Guidens resultat'
      : catalog.filters.libraryView === 'favorites'
        ? 'Favoriter'
        : 'Alla spel';
  const themeGame = detailDrawer.game ?? selectedGame;
  const { tint, accent } = themeGame
    ? resolveGameColors(themeGame)
    : { tint: '#e9e4ed', accent: '#815467' };
  const selectedCardColor = selectedGame
    ? (selectedGame.cardTint ?? resolveGameColors(selectedGame).accent)
    : undefined;

  const reset = () => {
    clearAi();
    picker.clearResults();
    catalog.resetFilters();
  };
  const changeLibraryView = (view: LibraryView) => {
    clearAi();
    picker.clearResults();
    catalog.updateFilter('libraryView', view);
  };
  const changeTag = (field: 'gameType' | 'mechanic', value: string) => {
    clearAi();
    picker.clearResults();
    catalog.updateFilter(field, value);
  };
  const selectGame = (game: Game, trigger: HTMLButtonElement) => {
    catalog.selectGame(game);
    showGameInfo(game, trigger);
  };
  const openDetails = (game: Game, trigger: HTMLButtonElement) => {
    catalog.selectGame(game);
    detailDrawer.open(game, trigger);
  };
  const themeStyle: CSSProperties & {
    '--tint': string;
    '--accent': string;
    '--selected-card-color'?: string;
  } = {
    '--tint': tint,
    '--accent': accent,
    '--selected-card-color': selectedCardColor,
  };
  return (
    <div
      className={styles['app']}
      data-has-selection={selectedGame ? true : undefined}
      style={themeStyle}
    >
      <Sidebar
        games={games}
        favorites={favorites}
        libraryView={
          aiIds || picker.appliedCriteria ? null : catalog.filters.libraryView
        }
        gameType={
          aiIds || picker.appliedCriteria ? '' : catalog.filters.gameType
        }
        mechanic={
          aiIds || picker.appliedCriteria ? '' : catalog.filters.mechanic
        }
        onLibraryViewChange={changeLibraryView}
        onGameTypeChange={(value) => changeTag('gameType', value)}
        onMechanicChange={(value) => changeTag('mechanic', value)}
        onReset={reset}
      />
      <main ref={libraryRef} tabIndex={-1} className={styles['workspace']}>
        <Header
          contentClassName={styles['workspace-inner']}
          viewLabel={viewLabel}
          onOpenPicker={picker.open}
        >
          <div className={styles['collection-layout']}>
            <div className={styles['catalog-column']}>
              {aiIds ? (
                <section
                  className={styles.aiResults}
                  aria-label="AI:s rekommendationer"
                >
                  <strong>AI:s rekommendationer</strong>
                  <button onClick={clearAi}>Rensa AI-filter</button>
                </section>
              ) : picker.appliedCriteria ? (
                <GamePickerResult
                  games={games}
                  criteria={picker.appliedCriteria}
                  count={catalog.visibleGames.length}
                  onEdit={picker.open}
                  onClear={picker.clearResults}
                />
              ) : (
                <CatalogToolbar
                  {...catalog.filters}
                  onMechanicChange={(value) => changeTag('mechanic', value)}
                  onGameTypeChange={(value) => changeTag('gameType', value)}
                  onAvailabilityChange={(value) =>
                    catalog.updateFilter('availability', value)
                  }
                  onReset={reset}
                  onQueryChange={(value) =>
                    catalog.updateFilter('query', value)
                  }
                  onPlayersChange={(value) =>
                    catalog.updateFilter('players', value)
                  }
                  onDurationChange={(value) =>
                    catalog.updateFilter('duration', value)
                  }
                />
              )}
              <GameCollection
                games={catalog.visibleGames}
                selectedGame={selectedGame}
                favorites={favorites}
                sort={catalog.sort}
                onSortChange={aiIds ? undefined : catalog.setSort}
                onSelectGame={selectGame}
                onOpenDetails={openDetails}
                onReset={
                  picker.appliedCriteria
                    ? (trigger) => picker.open(trigger)
                    : reset
                }
                isPickerResult={picker.appliedCriteria !== null}
              />
            </div>
            <GameInfoPanel
              gameId={selectedGame?.id}
              isMobile={isMobile}
              isOpen={mobilePanel.isOpen}
              onClose={mobilePanel.close}
              openerRef={mobilePanel.openerRef}
              fallbackRef={libraryRef}
              panelRef={mobilePanel.panelRef}
            >
              {selectedGame && (
                <GameDetails
                  game={selectedGame}
                  isFavorite={favorites.includes(selectedGame.id)}
                  onToggleFavorite={toggleFavorite}
                  tab={tab}
                  onTabChange={setTab}
                  onOpenImage={imageModal.open}
                  onShowMore={isMobile ? undefined : openDetails}
                  collectionIndex={games.indexOf(selectedGame) + 1}
                />
              )}
            </GameInfoPanel>
          </div>
        </Header>
      </main>
      {picker.isOpen && (
        <GamePicker
          games={games}
          onClose={picker.close}
          criteria={picker.criteria}
          onCriteriaChange={picker.setCriteria}
          onApply={() => {
            clearAi();
            picker.apply();
          }}
          onRecommend={recommend}
          openerRef={picker.openerRef}
          fallbackRef={libraryRef}
        />
      )}
      {detailDrawer.game && (
        <GameDetailDrawer
          game={detailDrawer.game}
          isFavorite={favorites.includes(detailDrawer.game.id)}
          onToggleFavorite={toggleFavorite}
          onClose={detailDrawer.close}
          onOpenImage={imageModal.open}
          openerRef={detailDrawer.openerRef}
          fallbackRef={
            isMobile && mobilePanel.isOpen ? mobilePanel.panelRef : libraryRef
          }
          panelRef={detailDrawer.panelRef}
        />
      )}
      {imageModal.image && (
        <ImageModal
          modal={imageModal.image}
          images={imageModal.images}
          onClose={imageModal.close}
          openerRef={imageModal.openerRef}
          fallbackRef={
            detailDrawer.game
              ? detailDrawer.panelRef
              : isMobile && mobilePanel.isOpen
                ? mobilePanel.panelRef
                : libraryRef
          }
        />
      )}
    </div>
  );
}
