import type { RefObject } from 'react';
import Icon from '../Icon/Icon';
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
  const dialogRef = useModalDialog({ openerRef, fallbackRef });
  return (
    <dialog
      ref={dialogRef}
      className={styles['modal-backdrop']}
      aria-modal="true"
      aria-label={modal.title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button onClick={onClose} aria-label="Stäng bild">
          <Icon name="close" />
        </button>
        <img src={modal.src} alt={`Platshållare: ${modal.title}`} />
        <p>{modal.title} · Platshållarbild</p>
      </div>
    </dialog>
  );
}
