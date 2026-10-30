import type { KkLaneOverviewEdgeSide, KkLaneOverviewKey } from '@furria/ui/KkLaneOverview';
import { useEffect, useState } from 'react';
import { bracketTextOf } from '../desk-copy';
import type { DeskWindow } from '../desk-window';
import { pannedCentreOf, resizedFrameOf, windowOf, windowSharesOf } from '../desk-window';
import type { DeskZoom } from './use-desk-zoom';

export interface DeskWindowControl {
  start: number;
  end: number;
  valueText: string;
  grab: (share: number) => void;
  pan: (share: number) => void;
  edge: (side: KkLaneOverviewEdgeSide, share: number) => void;
  release: () => void;
  key: (key: KkLaneOverviewKey) => void;
}

export const useDeskWindow = (zoom: DeskZoom, length: number): DeskWindowControl => {
  const { scroller, perSecond, visible } = zoom;
  const [left, setLeft] = useState(0);
  const [grabOffset, setGrabOffset] = useState(0);
  const [resizing, setResizing] = useState<DeskWindow | null>(null);
  const view = windowOf(left, perSecond, visible);
  const shares = windowSharesOf(view, length);

  useEffect(() => {
    if (scroller === null) {
      return;
    }
    const read = (): void => {
      setLeft(scroller.scrollLeft);
    };
    read();
    scroller.addEventListener('scroll', read, { passive: true });

    return () => {
      scroller.removeEventListener('scroll', read);
    };
  }, [scroller]);

  const keys: Record<KkLaneOverviewKey, () => void> = {
    earlier: () => {
      zoom.centreOn(pannedCentreOf(view, -1, length));
    },
    later: () => {
      zoom.centreOn(pannedCentreOf(view, 1, length));
    },
    closer: () => {
      zoom.zoom(1);
    },
    wider: () => {
      zoom.zoom(-1);
    },
  };

  return {
    start: shares.start,
    end: shares.end,
    valueText: bracketTextOf(Math.max(0, view.start), Math.min(length, view.end)),
    grab: (share) => {
      setGrabOffset(share * length - (view.start + view.end) / 2);
    },
    pan: (share) => {
      zoom.centreOn(share * length - grabOffset);
    },
    edge: (side, share) => {
      const from = resizing ?? view;
      if (resizing === null) {
        setResizing(view);
      }
      const frame = resizedFrameOf(from, side, share * length, length, visible);
      zoom.frame(frame.perSecond, frame.centre);
    },
    release: () => {
      setResizing(null);
    },
    key: (key) => {
      keys[key]();
    },
  };
};
