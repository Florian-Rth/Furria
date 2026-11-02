import type { KkTimelineLaneSize } from '@furria/ui/KkTimeline';
import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC, PropsWithChildren } from 'react';

interface TimelineLaneProps extends PropsWithChildren {
  lane: string;
  label: string;
  aside?: string | null;
  size: KkTimelineLaneSize;
}

export const TimelineLane: FC<TimelineLaneProps> = ({
  lane,
  label,
  aside = null,
  size,
  children,
}) => (
  <KkTimeline.Lane lane={lane} label={label} size={size}>
    {children}
    <KkTimeline.LaneLabel text={label} aside={aside} />
  </KkTimeline.Lane>
);
