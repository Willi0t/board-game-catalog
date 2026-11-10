import { useId, useState } from 'react';
import type { CatalogTagCount } from '../../utils/getTagCounts';
import TagNavigation from '../TagNavigation/TagNavigation';
import styles from './ExploreNavigation.module.css';

interface ExploreNavigationProps {
  gameTypes: readonly CatalogTagCount[];
  mechanics: readonly CatalogTagCount[];
  gameType: string;
  mechanic: string;
  onGameTypeChange: (value: string) => void;
  onMechanicChange: (value: string) => void;
}

export default function ExploreNavigation({
  gameTypes,
  mechanics,
  gameType,
  mechanic,
  onGameTypeChange,
  onMechanicChange,
}: ExploreNavigationProps) {
  const listId = useId();
  const hiddenMechanic =
    mechanics.findIndex(({ tag }) => tag === mechanic) >= 5;
  // A manual collapse stays in effect until a new hidden selection is made.
  const [listState, setListState] = useState({
    gameType,
    mechanic,
    expanded: hiddenMechanic || gameType !== '',
  });
  if (listState.gameType !== gameType || listState.mechanic !== mechanic) {
    const reveal =
      (listState.mechanic !== mechanic && hiddenMechanic) ||
      (listState.gameType !== gameType && gameType !== '');
    setListState({
      gameType,
      mechanic,
      expanded: listState.expanded || reveal,
    });
  }
  const expanded = listState.expanded;
  return (
    <>
      <div id={listId}>
        <TagNavigation
          title="Spelmekanik"
          options={expanded ? mechanics : mechanics.slice(0, 5)}
          selected={mechanic}
          onChange={onMechanicChange}
        />
        {expanded && (
          <TagNavigation
            title="Speltyp"
            options={gameTypes}
            selected={gameType}
            onChange={onGameTypeChange}
          />
        )}
      </div>
      {(mechanics.length > 5 || gameTypes.length > 0) && (
        <button
          className={styles.toggle}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() =>
            setListState({ gameType, mechanic, expanded: !expanded })
          }
        >
          {expanded ? 'Visa färre' : 'Visa fler'}
        </button>
      )}
    </>
  );
}
