import { useEffect, useState, type RefObject } from 'react';

export default function useBannerVisibility(
  ref: RefObject<HTMLElement | null>,
) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let intersects = false;
    const update = () => {
      const dialogs = document.querySelectorAll('dialog[open]');
      const topDialog = dialogs.item(dialogs.length - 1);
      setVisible(
        intersects &&
          !document.hidden &&
          !element.closest('[inert], [aria-hidden="true"]') &&
          (!topDialog || topDialog.contains(element)),
      );
    };
    const intersection = new IntersectionObserver(([entry]) => {
      intersects = entry.isIntersecting;
      update();
    });
    intersection.observe(element);
    // Also catches outgoing crossfades becoming inert and dialogs opening above us.
    const mutations = new MutationObserver(update);
    mutations.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open', 'inert', 'aria-hidden'],
    });
    document.addEventListener('visibilitychange', update);
    return () => {
      intersection.disconnect();
      mutations.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, [ref]);
  return visible;
}
