import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import useModalDialog from '../../hooks/useModalDialog';
import Icon from '../Icon/Icon';
import styles from './MobileGamePanel.module.css';

interface MobileGamePanelProps {
  gameId: string;
  onClose: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export default function MobileGamePanel({
  gameId,
  onClose,
  openerRef,
  fallbackRef,
  panelRef,
  children,
}: MobileGamePanelProps) {
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [gameId]);
  return (
    <dialog
      {...dialogProps}
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header ref={panelRef} tabIndex={-1} className={styles.header}>
        <button onClick={onClose}>
          <Icon name="arrow" size={18} />
          Tillbaka till spelen
        </button>
        <h2 id={titleId}>Spelinformation</h2>
      </header>
      <div ref={scrollRef} className={styles.content}>
        {children}
      </div>
    </dialog>
  );
}
