import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';
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

function PanelContent({
  gameId,
  children,
}: {
  gameId: string | undefined;
  children: ReactNode;
}) {
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [content, setContent] = useState({
    gameId,
    current: children,
    previous: null as ReactNode,
  });
  const incomingRef = useRef<HTMLDivElement>(null);
  const outgoingRef = useRef<HTMLDivElement>(null);
  if (content.gameId !== gameId) {
    setContent({
      gameId,
      current: children,
      previous: reducedMotion ? null : (content.previous ?? content.current),
    });
  }
  if (
    content.gameId === gameId &&
    (content.current !== children || (reducedMotion && content.previous))
  ) {
    setContent({
      ...content,
      current: children,
      previous: reducedMotion ? null : content.previous,
    });
  }
  useLayoutEffect(() => {
    const incoming = incomingRef.current;
    const outgoing = outgoingRef.current;
    if (!incoming || !outgoing || reducedMotion) return;
    let cancelled = false;
    let revealing = false;
    let animations: Animation[] = [];
    outgoing
      .querySelectorAll('[id]')
      .forEach((element) => element.removeAttribute('id'));
    incoming.style.opacity = '0';
    // Keep the old banner visible until the new image (or its fallback) is decoded.
    const reveal = () => {
      if (cancelled || revealing) return;
      const image = incoming.querySelector<HTMLImageElement>(
        '[data-image-kind] img:not([aria-hidden])',
      );
      if (image && (!image.complete || !image.naturalWidth)) return;
      revealing = true;
      observer.disconnect();
      incoming.style.opacity = '';
      animations = [
        incoming.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 200,
          easing: 'ease-in-out',
        }),
        outgoing.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 200,
          easing: 'ease-in-out',
          fill: 'forwards',
        }),
      ];
      void animations[0].finished
        .then(() => {
          if (!cancelled)
            setContent((current) => ({ ...current, previous: null }));
        })
        .catch(() => {});
    };
    const observer = new MutationObserver(reveal);
    observer.observe(incoming, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src'],
    });
    incoming.addEventListener('load', reveal, true);
    incoming.addEventListener('error', reveal, true);
    const image = incoming.querySelector<HTMLImageElement>(
      '[data-image-kind] img:not([aria-hidden])',
    );
    if (image)
      void image
        .decode()
        .then(reveal)
        .catch(() => {});
    else reveal();
    return () => {
      cancelled = true;
      observer.disconnect();
      incoming.removeEventListener('load', reveal, true);
      incoming.removeEventListener('error', reveal, true);
      animations.forEach((animation) => animation.cancel());
      incoming.style.opacity = '';
    };
  }, [gameId, reducedMotion]);
  return (
    <div className={styles.content}>
      {content.previous && !reducedMotion && (
        <div
          ref={outgoingRef}
          className={styles.outgoing}
          inert
          aria-hidden="true"
        >
          {content.previous}
        </div>
      )}
      <div ref={incomingRef} className={styles.incoming}>
        {children}
      </div>
    </div>
  );
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
        <PanelContent gameId={gameId}>{children}</PanelContent>
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
        <PanelContent gameId={gameId}>{children}</PanelContent>
      ) : (
        <div className={styles.empty}>
          <h2>Inga spel att visa</h2>
          <p>Ändra eller rensa filtren för att visa spelinformation.</p>
        </div>
      )}
    </section>
  );
}
