import type { Game } from '../../types/game';
import { getHeroImage } from '../../utils/gameImages';
import GameImage from '../GameImage/GameImage';
import GameTypeBadges from '../GameTypeBadges/GameTypeBadges';
import Icon from '../Icon/Icon';
import styles from './GameBanner.module.css';
import BannerMedia from './BannerMedia';

interface GameBannerProps {
  game: Game;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  className?: string;
}

export default function GameBanner({
  game,
  isFavorite,
  onToggleFavorite,
  className = '',
}: GameBannerProps) {
  return (
    <GameImage
      image={getHeroImage(game)}
      blurredBackdrop
      className={className}
      placeholderLabel="PLATSHÅLLARBILD"
      labelClassName={styles.placeholder}
      bannerControls={
        <>
          {(game.bannerVideo || game.bannerLogo) && (
            <BannerMedia key={game.id} game={game} />
          )}
          <div className={styles.controls}>
            <div className={styles.types}>
              <GameTypeBadges gameTypes={game.gameTypes} appearance="banner" />
            </div>
            <button
              className={`${styles.favorite} ${isFavorite ? styles.active : ''}`}
              aria-label={
                isFavorite ? 'Ta bort från favoriter' : 'Lägg till i favoriter'
              }
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(game.id)}
            >
              <Icon name="heart" size={19} />
            </button>
          </div>
        </>
      }
    />
  );
}
