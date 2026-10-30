import { useEffect, useState } from 'react';
import type { CountMark } from '@/features/act-player/music-timeline';
import { beatSecondsOf, canZoomOf, zoomedOf, zoomRangeOf } from '../lane-time';

const HEAD_REM = 6.5;
const BASE_FONT_PX = 16;
const FALLBACK_VISIBLE = 900;

export interface LaneZoom {
  perSecond: number;
  labelPerSecond: number;
  width: number;
  visible: number;
  scroller: HTMLDivElement | null;
  canIn: boolean;
  canOut: boolean;
  fitted: boolean;
  attach: (node: HTMLDivElement | null) => void;
  zoom: (direction: 1 | -1) => void;
  fit: () => void;
}

export const useLaneZoom = (
  length: number,
  marks: readonly CountMark[],
  anchor: () => number,
): LaneZoom => {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(FALLBACK_VISIBLE);
  const [chosen, setChosen] = useState<number | null>(null);
  const [textScale, setTextScale] = useState(1);
  const range = zoomRangeOf(length, visible, beatSecondsOf(marks));
  const perSecond = Math.min(range.max, Math.max(range.min, chosen ?? range.min));

  useEffect(() => {
    if (scroller === null) {
      return;
    }
    const measure = (): void => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scale = Number.isFinite(rem) && rem > 0 ? rem / BASE_FONT_PX : 1;
      setTextScale(scale);
      setVisible(Math.max(1, scroller.clientWidth - HEAD_REM * BASE_FONT_PX * scale));
    };
    measure();
    scroller.scrollLeft = Math.max(0, (scroller.clientWidth - HEAD_REM * BASE_FONT_PX) / 2);
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);

    return () => {
      observer.disconnect();
    };
  }, [scroller]);

  const zoom = (direction: 1 | -1): void => {
    if (!canZoomOf(perSecond, direction, range)) {
      return;
    }
    const next = zoomedOf(perSecond, direction, range);
    if (scroller !== null) {
      const centre = anchor();
      const offset = visible / 2 + centre * perSecond - scroller.scrollLeft;
      requestAnimationFrame(() => {
        scroller.scrollLeft = Math.max(0, visible / 2 + centre * next - offset);
      });
    }
    setChosen(next);
  };

  return {
    perSecond,
    labelPerSecond: perSecond / textScale,
    width: Math.max(1, Math.round(length * perSecond)),
    visible,
    scroller,
    canIn: canZoomOf(perSecond, 1, range),
    canOut: canZoomOf(perSecond, -1, range),
    fitted: chosen === null || chosen <= range.min,
    attach: setScroller,
    zoom,
    fit: () => {
      setChosen(null);
    },
  };
};
