import { useRef, type CSSProperties } from 'react';
import games from './data/games';
import { resolveGameColors } from './constants/placeholderThemes';
import type { Game } from './types/game';
import styles from './App.module.css';

import useFavorites from './hooks/useFavorites';
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
  const catalog = useCatalog(games, favorites, picker.appliedCriteria);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const { mobilePanel, detailDrawer, imageModal, tab, setTab, showGameInfo } =
    useGamePanels(catalog.selectedGame?.id ?? null, isMobile);
  const libraryRef = useRef<HTMLElement>(null);
  const selectedGame = catalog.selectedGame;
  const categoryLabel = picker.appliedCriteria
    ? 'Guidens resultat'
    : catalog.filters.category;
  const themeGame = detailDrawer.game ?? selectedGame;
  const { tint, accent } = themeGame
    ? resolveGameColors(themeGame)
    : { tint: '#e9e4ed', accent: '#815467' };

  const reset = () => {
    picker.clearResults();
    catalog.resetFilters();
  };
  const changeCategory = (category: string) => {
    picker.clearResults();
    catalog.updateFilter('category', category);
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
  } = { '--tint': tint, '--accent': accent };
  return (
    <div className={styles['app']} style={themeStyle}>
      <Sidebar
        games={games}
        favorites={favorites}
        category={categoryLabel}
        onCategoryChange={changeCategory}
        onReset={reset}
      />
      <main ref={libraryRef} tabIndex={-1} className={styles['workspace']}>
        <Header
          contentClassName={styles['workspace-inner']}
          category={categoryLabel}
          onOpenPicker={picker.open}
        >
          <div className={styles['collection-layout']}>
            <div className={styles['catalog-column']}>
              {picker.appliedCriteria ? (
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
                  onMechanicChange={(value) =>
                    catalog.updateFilter('mechanic', value)
                  }
                  onGameTypeChange={(value) =>
                    catalog.updateFilter('gameType', value)
                  }
                  onAvailabilityChange={(value) =>
                    catalog.updateFilter('availability', value)
                  }
                  onReset={reset}
                  onQueryChange={(value) =>
                    catalog.updateFilter('query', value)
                  }
                  onCategoryChange={changeCategory}
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
                onSortChange={catalog.setSort}
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
          onApply={picker.apply}
          openerRef={picker.openerRef}
          fallbackRef={libraryRef}
        />
      )}
      {detailDrawer.game && (
        <GameDetailDrawer
          game={detailDrawer.game}
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
