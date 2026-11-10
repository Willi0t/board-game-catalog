import type { RefObject } from 'react';
import Icon from '../Icon/Icon';
import GameImage from '../GameImage/GameImage';
import useModalDialog from '../../hooks/useModalDialog';
import type { GalleryImage } from '../../types/game';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  modal: GalleryImage;
  onClose: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
}

export default function ImageModal({
  modal,
  onClose,
  openerRef,
  fallbackRef,
}: ImageModalProps) {
  const dialogProps = useModalDialog({ onClose, openerRef, fallbackRef });
  return (
    <dialog
      {...dialogProps}
      className={styles['modal-backdrop']}
      aria-modal="true"
      aria-label={modal.title}
    >
      <div className={styles.modal}>
        <button onClick={onClose} aria-label="Stäng bild">
          <Icon name="close" />
        </button>
        <GameImage
          image={modal}
          className={styles.image}
          placeholderLabel={`${modal.title} · Platshållarbild`}
          label={modal.title}
          labelClassName={styles.caption}
        />
      </div>
    </dialog>
  );
}
