import type { CentreView } from '@furria/studio/centre-scrub';
import { centreViewOf } from '@furria/studio/centre-scrub';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import type { KkLaneOverviewEdgeSide, KkLaneOverviewKey } from '@furria/ui/KkLaneOverview';
import { useMotionValueEvent } from 'motion/react';
import { useEffect, useState } from 'react';
import { bracketTextOf } from '../desk-copy';
import type { DeskWindow } from '../desk-window';
import { pannedCentreOf, resizedWindowOf, windowSharesOf } from '../desk-window';

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

export const useDeskWindow = (centre: CentreScrub, length: number): DeskWindowControl => {
  const { x, scale, pxPerSecond, width } = centre;
  const read = (): CentreView => centreViewOf(x.get(), pxPerSecond * scale.get(), width, length);
  const [view, setView] = useState<CentreView>(read);
  const [grabOffset, setGrabOffset] = useState(0);
  const [resizing, setResizing] = useState<DeskWindow | null>(null);
  const shares = windowSharesOf(view, length);
  const follow = (): void => {
    setView(read());
  };
  useMotionValueEvent(x, 'change', follow);
  useMotionValueEvent(scale, 'change', follow);
  useEffect(() => {
    setView(centreViewOf(x.get(), pxPerSecond * scale.get(), width, length));
  }, [x, scale, pxPerSecond, width, length]);

  const keys: Record<KkLaneOverviewKey, () => void> = {
    earlier: () => {
      centre.centreOn(pannedCentreOf(view, -1, length));
    },
    later: () => {
      centre.centreOn(pannedCentreOf(view, 1, length));
    },
    closer: () => {
      centre.zoomBy(1);
    },
    wider: () => {
      centre.zoomBy(-1);
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
      centre.centreOn(share * length - grabOffset);
    },
    edge: (side, share) => {
      const from = resizing ?? view;
      if (resizing === null) {
        setResizing(view);
      }
      const framed = resizedWindowOf(from, side, share * length, length);
      centre.frame(framed.start, framed.end);
    },
    release: () => {
      setResizing(null);
    },
    key: (key) => {
      keys[key]();
    },
  };
};
