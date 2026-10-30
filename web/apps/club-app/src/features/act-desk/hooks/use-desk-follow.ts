import { useEffect } from 'react';
import { followLeftOf, glidedLeftOf } from '../desk-time';
import type { DeskZoom } from './use-desk-zoom';

export const useDeskFollow = (seconds: number, playing: boolean, zoom: DeskZoom): void => {
  const { scroller, perSecond, visible } = zoom;

  useEffect(() => {
    if (scroller === null) {
      return;
    }
    const left = scroller.scrollLeft;
    const target = followLeftOf(seconds, perSecond);
    const at = visible / 2 + seconds * perSecond;
    if (playing) {
      scroller.scrollLeft = glidedLeftOf(left, target);
      return;
    }
    if (at < left || at > left + visible) {
      scroller.scrollLeft = target;
    }
  }, [scroller, seconds, perSecond, visible, playing]);
};
