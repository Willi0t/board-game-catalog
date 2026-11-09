import React, { useEffect, useRef } from 'react';
import Icon from '../Icon/Icon';

import type { GalleryImage } from '../../types/game';
import styles from './ImageModal.module.css';

interface ImageModalProps {
  modal: GalleryImage;
  onClose: () => void;
}
export default function ImageModal({ modal, onClose }: ImageModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | SVGElement | null>(null);
  useEffect(() => {
    const activeElement = document.activeElement;
    previousFocus.current =
      activeElement instanceof HTMLElement ||
      activeElement instanceof SVGElement
        ? activeElement
        : null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        e.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previousFocus.current?.focus();
    };
  }, [modal, onClose]);
  return (
    <div className={styles['modal-backdrop']} onClick={onClose}>
      <div
        className={styles['modal']}
        role="dialog"
        aria-modal="true"
        aria-label={modal.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} onClick={onClose} aria-label="Stäng bild">
          <Icon name="close" />
        </button>
        <img src={modal.src} alt={`Platshållare: ${modal.title}`} />
        <p>{modal.title} · Platshållarbild</p>
      </div>
    </div>
  );
}
