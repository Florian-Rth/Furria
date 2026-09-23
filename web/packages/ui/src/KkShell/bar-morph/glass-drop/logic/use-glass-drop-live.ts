import { useEffect, useState } from 'react';
import type { GlassDropAct } from './glass-drop-plan';

const LIVE_SECONDS: Record<GlassDropAct, number> = {
  settled: 0,
  fade: 0.2,
  exchange: 1.5,
  wobble: 1.15,
  wave: 1.1,
};

const MILLISECONDS = 1000;

export const useGlassDropLive = (act: GlassDropAct): boolean => {
  const [live, setLive] = useState(act !== 'settled');

  useEffect(() => {
    if (!live) {
      return;
    }

    const settle = window.setTimeout(() => setLive(false), LIVE_SECONDS[act] * MILLISECONDS);

    return () => window.clearTimeout(settle);
  }, [act, live]);

  return live;
};
