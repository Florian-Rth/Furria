import type { KkTimelineRows } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { KkSx } from '@furria/ui/kk-sx';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import type { TimelineDensity } from '../../timeline-geometry';
import { WHOLE_WINDOW } from '../../timeline-geometry';
import type { CentreScrub } from '../../use-centre-scrub';
import type { OverviewBracket } from '../../use-overview-bracket';
import type { TimelineState } from '../logic/timeline-context';
import { TimelineContext } from '../logic/timeline-context';

interface TimelineBaseProps extends PropsWithChildren {
  label: string;
  density: TimelineDensity;
  rows: KkTimelineRows;
  length: number;
  overlay?: ReactNode;
  sx?: KkSx;
}

interface CentreTimelineProps extends TimelineBaseProps {
  centre: CentreScrub;
  overview?: null;
}

interface OverviewTimelineProps extends TimelineBaseProps {
  centre?: null;
  overview: OverviewBracket;
}

type TimelineRootProps = CentreTimelineProps | OverviewTimelineProps;

export const TimelineRoot: FC<TimelineRootProps> = ({
  label,
  density,
  rows,
  length,
  centre = null,
  overview = null,
  overlay = null,
  sx,
  children,
}) => {
  const visible = centre?.window ?? WHOLE_WINDOW;
  const state: TimelineState = { length, density, window: visible, centre, overview };
  const gestures = centre ?? overview;
  const work =
    gestures === null ? null : { areaRef: gestures.areaRef, handlers: gestures.handlers };
  const centred = centre !== null;

  return (
    <TimelineContext value={state}>
      <KkTimeline
        label={label}
        density={density}
        rows={rows}
        window={visible}
        work={work}
        centred={centred}
        overlay={overlay}
        sx={sx}
      >
        {children}
      </KkTimeline>
    </TimelineContext>
  );
};
