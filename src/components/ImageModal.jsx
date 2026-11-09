import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

export default function ImageModal({ modal, onClose }) {
  const closeRef = useRef(null);
  const previousFocus = useRef(null);
  useEffect(() => {
    previousFocus.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
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
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
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
