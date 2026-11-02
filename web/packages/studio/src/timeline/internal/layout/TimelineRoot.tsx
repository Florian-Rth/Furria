import { KkTimeline } from '@furria/ui/KkTimeline';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC, PropsWithChildren } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import type { TimelineDensity } from '../../timeline-geometry';
import { secondsOfShare, windowOf } from '../../timeline-geometry';
import type { TimelineState } from '../logic/timeline-context';
import { TimelineContext } from '../logic/timeline-context';

interface TimelineRootProps extends PropsWithChildren {
  label: string;
  density: TimelineDensity;
  length: number;
  focus?: TimelineRange | null;
  onSeek: (seconds: number) => void;
  sx?: KkSx;
}

export const TimelineRoot: FC<TimelineRootProps> = ({
  label,
  density,
  length,
  focus = null,
  onSeek,
  sx,
  children,
}) => {
  const visible = windowOf(focus, length);
  const state: TimelineState = { length, density, window: visible };
  const seek = (share: number): void => {
    onSeek(secondsOfShare(share, length));
  };

  return (
    <TimelineContext value={state}>
      <KkTimeline label={label} density={density} window={visible} onSeek={seek} sx={sx}>
        {children}
      </KkTimeline>
    </TimelineContext>
  );
};
