import { useRef, useState } from 'react';
import type { DetailTab, Game, GalleryImage } from '../types/game';

export default function useGamePanels(
  selectedGameId: string | null,
  isMobile: boolean,
) {
  // This is the game whose panel was manually opened, not another selection.
  // Invalidate it on a selection change so automatic fallback never opens a dialog.
  const [mobilePanelGameId, setMobilePanelGameId] = useState<string | null>(
    null,
  );
  if (mobilePanelGameId !== null && mobilePanelGameId !== selectedGameId)
    setMobilePanelGameId(null);
  const [tab, setTab] = useState<DetailTab>('Om spelet');
  const [detailGame, setDetailGame] = useState<Game | null>(null);
  const [image, setImage] = useState<{
    selected: GalleryImage;
    images: readonly GalleryImage[];
  } | null>(null);
  const infoOpenerRef = useRef<HTMLElement>(null);
  const infoPanelRef = useRef<HTMLElement>(null);
  const drawerOpenerRef = useRef<HTMLElement>(null);
  const drawerPanelRef = useRef<HTMLElement>(null);
  const imageOpenerRef = useRef<HTMLElement>(null);

  const showGameInfo = (game: Game, trigger: HTMLButtonElement) => {
    infoOpenerRef.current = trigger;
    setTab('Om spelet');
    setMobilePanelGameId(isMobile ? game.id : null);
  };
  const openDetailDrawer = (game: Game, trigger: HTMLButtonElement) => {
    drawerOpenerRef.current = trigger;
    setTab('Om spelet');
    setDetailGame(game);
  };
  const openImage = (
    nextImage: GalleryImage,
    trigger: HTMLButtonElement,
    images: readonly GalleryImage[] = [nextImage],
  ) => {
    imageOpenerRef.current = trigger;
    setImage({ selected: nextImage, images });
  };

  return {
    tab,
    setTab,
    showGameInfo,
    mobilePanel: {
      isOpen:
        mobilePanelGameId !== null && mobilePanelGameId === selectedGameId,
      close: () => setMobilePanelGameId(null),
      openerRef: infoOpenerRef,
      panelRef: infoPanelRef,
    },
    detailDrawer: {
      game: detailGame,
      open: openDetailDrawer,
      close: () => setDetailGame(null),
      openerRef: drawerOpenerRef,
      panelRef: drawerPanelRef,
    },
    imageModal: {
      image: image?.selected,
      images: image?.images,
      open: openImage,
      close: () => setImage(null),
      openerRef: imageOpenerRef,
    },
  };
}
