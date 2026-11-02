import { KkTimeline } from '@furria/ui/KkTimeline';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { TimelineRange } from '../../../models/music-timeline';
import type { TimelineDensity } from '../../timeline-geometry';
import { secondsOfShare, windowOf } from '../../timeline-geometry';
import type { CentreScrub } from '../../use-centre-scrub';
import type { TimelineState } from '../logic/timeline-context';
import { TimelineContext } from '../logic/timeline-context';

interface TimelineBaseProps extends PropsWithChildren {
  label: string;
  density: TimelineDensity;
  length: number;
  overlay?: ReactNode;
  sx?: KkSx;
}

interface FixedTimelineProps extends TimelineBaseProps {
  centre?: null;
  focus?: TimelineRange | null;
  onSeek: (seconds: number) => void;
}

interface CentreTimelineProps extends TimelineBaseProps {
  centre: CentreScrub;
  focus?: never;
  onSeek?: never;
}

type TimelineRootProps = FixedTimelineProps | CentreTimelineProps;

export const TimelineRoot: FC<TimelineRootProps> = ({
  label,
  density,
  length,
  focus = null,
  centre = null,
  overlay = null,
  onSeek,
  sx,
  children,
}) => {
  const visible = centre?.window ?? windowOf(focus, length);
  const state: TimelineState = { length, density, window: visible, centre };
  const work = centre === null ? null : { areaRef: centre.areaRef, handlers: centre.handlers };
  const seek = (share: number): void => {
    onSeek?.(secondsOfShare(share, length));
  };

  return (
    <TimelineContext value={state}>
      <KkTimeline
        label={label}
        density={density}
        window={visible}
        work={work}
        overlay={overlay}
        onSeek={seek}
        sx={sx}
      >
        {children}
      </KkTimeline>
    </TimelineContext>
  );
};
