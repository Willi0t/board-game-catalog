import { useEffect, useRef, useState } from 'react';
import type { Game } from '../../types/game';
import useMediaQuery from '../../hooks/useMediaQuery';
import useBannerVisibility from '../../hooks/useBannerVisibility';
import { loadYouTubeAPI, type YouTubePlayer } from '../../utils/youtubePlayer';
import styles from './BannerMedia.module.css';

function Video({ youtubeId, paused }: { youtubeId: string; paused: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | undefined>(undefined);
  const pausedRef = useRef(paused);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    pausedRef.current = paused;
    if (paused) playerRef.current?.pauseVideo();
    else playerRef.current?.playVideo();
  }, [paused]);
  useEffect(() => {
    let cancelled = false;
    let player: YouTubePlayer | undefined;
    let timer: number | undefined;
    const stop = () => {
      if (cancelled) return;
      setPlaying(false);
      player?.destroy();
      player = undefined;
      playerRef.current = undefined;
      window.clearTimeout(timer);
    };
    void loadYouTubeAPI()
      .then((api) => {
        if (cancelled || !host.current) return;
        const target = document.createElement('div');
        host.current.replaceChildren(target);
        player = new api.Player(target, {
          videoId: youtubeId,
          playerVars: {
            autoplay: pausedRef.current ? 0 : 1,
            mute: 1,
            controls: 0,
            playsinline: 1,
            loop: 1,
            playlist: youtubeId,
            enablejsapi: 1,
            origin: window.location.origin,
            disablekb: 1,
          },
          events: {
            onReady: ({ target: readyPlayer }) => {
              if (cancelled) return;
              const iframe = host.current?.querySelector('iframe');
              if (iframe) {
                iframe.tabIndex = -1;
                iframe.title = 'Dekorativ videobakgrund';
                iframe.setAttribute('aria-hidden', 'true');
              }
              readyPlayer.mute();
              if (pausedRef.current) readyPlayer.pauseVideo();
              else readyPlayer.playVideo();
            },
            onStateChange: ({ data }) => {
              if (cancelled) return;
              if (data === 1) window.clearTimeout(timer);
              setPlaying((current) => data === 1 || (data === 2 && current));
            },
            onError: stop,
            onAutoplayBlocked: stop,
          },
        });
        playerRef.current = player;
        timer = window.setTimeout(stop, 15000);
      })
      .catch(stop);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      player?.destroy();
      playerRef.current = undefined;
    };
  }, [youtubeId]);
  return (
    <div
      ref={host}
      className={`${styles.video} ${playing ? styles.playing : ''}`}
      aria-hidden="true"
    />
  );
}

export default function BannerMedia({ game }: { game: Game }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useBannerVisibility(ref);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [paused, setPaused] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const video = game.bannerVideo;
  return (
    <>
      <div ref={ref} className={styles.media}>
        {video && visible && !reducedMotion && (
          <Video youtubeId={video.youtubeId} paused={paused} />
        )}
        {video && <div className={styles.shade} />}
        {game.bannerLogo && !logoFailed && (
          <img
            className={styles.logo}
            src={game.bannerLogo.src}
            alt={game.bannerLogo.alt}
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>
      {video && !reducedMotion && (
        <button
          type="button"
          className={styles.pause}
          aria-label={paused ? 'Spela bannerfilm' : 'Pausa bannerfilm'}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? 'Spela' : 'Pausa'}
        </button>
      )}
    </>
  );
}
