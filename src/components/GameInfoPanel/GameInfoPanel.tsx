import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import MobileGamePanel from '../MobileGamePanel/MobileGamePanel';
import usePanelViewportHeight from '../../hooks/usePanelViewportHeight';
import styles from './GameInfoPanel.module.css';

interface GameInfoPanelProps {
  gameId: string | undefined;
  isMobile: boolean;
  isOpen: boolean;
  onClose: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export default function GameInfoPanel({
  gameId,
  isMobile,
  isOpen,
  onClose,
  openerRef,
  fallbackRef,
  panelRef,
  children,
}: GameInfoPanelProps) {
  const scrollRef = useRef<HTMLElement | null>(null);
  usePanelViewportHeight(scrollRef, !isMobile);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [gameId, isMobile]);
  if (isMobile && isOpen && gameId) {
    return (
      <MobileGamePanel
        gameId={gameId}
        onClose={onClose}
        openerRef={openerRef}
        fallbackRef={fallbackRef}
        panelRef={panelRef}
      >
        {children}
      </MobileGamePanel>
    );
  }
  if (isMobile && gameId) return null;
  return (
    <section
      ref={(element) => {
        scrollRef.current = element;
        panelRef.current = element;
      }}
      tabIndex={-1}
      className={styles.panel}
      aria-label="Spelinformation"
    >
      {gameId ? (
        children
      ) : (
        <div className={styles.empty}>
          <h2>Inga spel att visa</h2>
          <p>Ändra eller rensa filtren för att visa spelinformation.</p>
        </div>
      )}
    </section>
  );
}
