import { useLayoutEffect, type RefObject } from 'react';

// Measure the sticky panel's actual viewport offset rather than assuming a
// header height. CSS supplies the viewport height and the shared bottom gutter.
export default function usePanelViewportHeight(
  panelRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!enabled || !panel) return;
    let frame: number | undefined;
    const measure = () => {
      frame = undefined;
      const top = `${Math.max(0, panel.getBoundingClientRect().top)}px`;
      if (panel.style.getPropertyValue('--panel-viewport-top') !== top)
        panel.style.setProperty('--panel-viewport-top', top);
    };
    const scheduleMeasure = () => {
      if (frame === undefined) frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    // Ancestors also catch header wrapping, font loading and content changes
    // that move the panel without resizing the browser window.
    for (
      let ancestor: HTMLElement | null = panel;
      ancestor;
      ancestor = ancestor.parentElement
    )
      observer.observe(ancestor);
    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    window.visualViewport?.addEventListener('resize', scheduleMeasure);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      window.visualViewport?.removeEventListener('resize', scheduleMeasure);
      if (frame !== undefined) cancelAnimationFrame(frame);
      panel.style.removeProperty('--panel-viewport-top');
    };
  }, [panelRef, enabled]);
}
