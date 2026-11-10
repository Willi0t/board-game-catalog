import {
  useEffect,
  useRef,
  type RefObject,
  type SyntheticEvent,
  type MouseEvent,
} from 'react';

let scrollLocks = 0;
let restoreScroll: (() => void) | undefined;

function lockPageScroll() {
  if (scrollLocks === 0) {
    const { body, documentElement } = document;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const properties = [
      'position',
      'top',
      'left',
      'width',
      'overflow',
      'paddingRight',
    ] as const;
    const previousStyles = properties.map(
      (property) => [property, body.style[property]] as const,
    );
    const previousOverflow = documentElement.style.overflow;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const paddingRight = getComputedStyle(body).paddingRight;
    body.style.position = 'fixed';
    body.style.top = `${-scrollY}px`;
    body.style.left = `${-scrollX}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `calc(${paddingRight} + ${scrollbarWidth}px)`;
    documentElement.style.overflow = 'hidden';
    restoreScroll = () => {
      for (const [property, value] of previousStyles)
        body.style[property] = value;
      documentElement.style.overflow = previousOverflow;
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' });
    };
  }
  scrollLocks += 1;
  return () => {
    scrollLocks -= 1;
    if (scrollLocks === 0) {
      restoreScroll?.();
      restoreScroll = undefined;
    }
  };
}

interface ModalDialogOptions {
  onClose: () => void;
  openerRef: RefObject<HTMLElement | null>;
  fallbackRef: RefObject<HTMLElement | null>;
}

export default function useModalDialog({
  onClose,
  openerRef,
  fallbackRef,
}: ModalDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = openerRef.current;
    const fallback = fallbackRef.current;
    const unlockScroll = lockPageScroll();
    dialog.showModal();
    dialog
      .querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      const activeIndex = controls.findIndex(
        (element) => element === document.activeElement,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialog.focus();
      } else if (event.shiftKey && activeIndex <= 0) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (activeIndex === controls.length - 1 || activeIndex < 0)
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.close();
      unlockScroll();
      const target = opener?.isConnected ? opener : fallback;
      target?.focus({ preventScroll: true });
    };
  }, [openerRef, fallbackRef]);
  return {
    ref: dialogRef,
    onCancel: (event: SyntheticEvent<HTMLDialogElement>) => {
      event.preventDefault();
      onClose();
    },
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
  };
}
