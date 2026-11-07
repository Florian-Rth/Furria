import { KkTimeline } from '@furria/ui/KkTimeline';
import { useTransform } from 'motion/react';
import type { FC } from 'react';
import { centreSecondsOf } from '../../centre-scrub';
import { rulerLabelOf } from '../../timeline-geometry';
import type { CentreScrub } from '../../use-centre-scrub';

interface TimelinePlayheadTimeProps {
  centre: CentreScrub;
  length: number;
  name: string | null;
}

export const TimelinePlayheadTime: FC<TimelinePlayheadTimeProps> = ({ centre, length, name }) => {
  const time = useTransform(centre.x, (offset: number) =>
    rulerLabelOf(centreSecondsOf(offset, centre.pxPerSecond, centre.width / 2, length)),
  );

  return <KkTimeline.PlayheadTag time={time} name={name} />;
};
