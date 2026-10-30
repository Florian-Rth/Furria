import { KK_LANE_HEAD_REM } from '@furria/ui/KkLaneTrack';
import { useEffect, useState } from 'react';
import type { CountMark } from '@/features/act-player/music-timeline';
import { beatSecondsOf, canZoomOf, followLeftOf, zoomedOf, zoomRangeOf } from '../desk-time';

const BASE_FONT_PX = 16;
const FALLBACK_VISIBLE = 900;

export interface DeskZoom {
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
  frame: (perSecond: number, centre: number) => void;
  centreOn: (seconds: number) => void;
  fit: () => void;
}

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

export const useDeskZoom = (
  length: number,
  marks: readonly CountMark[],
  anchor: () => number,
): DeskZoom => {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(FALLBACK_VISIBLE);
  const [chosen, setChosen] = useState<number | null>(null);
  const [textScale, setTextScale] = useState(1);
  const range = zoomRangeOf(length, visible, beatSecondsOf(marks));
  const perSecond = clamp(chosen ?? range.min, range.min, range.max);

  useEffect(() => {
    if (scroller === null) {
      return;
    }
    const measure = (): void => {
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const scale = Number.isFinite(rem) && rem > 0 ? rem / BASE_FONT_PX : 1;
      setTextScale(scale);
      setVisible(Math.max(1, scroller.clientWidth - KK_LANE_HEAD_REM * BASE_FONT_PX * scale));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);

    return () => {
      observer.disconnect();
    };
  }, [scroller]);

  const settle = (next: number | null, centre: number): void => {
    setChosen(next);
    if (scroller !== null) {
      requestAnimationFrame(() => {
        scroller.scrollLeft = followLeftOf(centre, next ?? range.min);
      });
    }
  };

  const zoom = (direction: 1 | -1): void => {
    if (!canZoomOf(perSecond, direction, range)) {
      return;
    }
    const next = zoomedOf(perSecond, direction, range);
    if (scroller === null) {
      setChosen(next);
      return;
    }
    const centre = anchor();
    const offset = visible / 2 + centre * perSecond - scroller.scrollLeft;
    setChosen(next);
    requestAnimationFrame(() => {
      scroller.scrollLeft = Math.max(0, visible / 2 + centre * next - offset);
    });
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
    frame: (wanted, centre) => {
      settle(clamp(wanted, range.min, range.max), centre);
    },
    centreOn: (seconds) => {
      if (scroller !== null) {
        scroller.scrollLeft = followLeftOf(seconds, perSecond);
      }
    },
    fit: () => {
      settle(null, length / 2);
    },
  };
};
