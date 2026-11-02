import { KkTimeline } from '@furria/ui/KkTimeline';
import type { FC } from 'react';
import { shareOf } from '../../timeline-geometry';
import { TimelineStrip } from '../layout/TimelineStrip';
import { useTimeline } from '../logic/timeline-context';

export interface TimelineDiamond {
  key: string;
  seconds: number;
  selected: boolean;
  dimmed: boolean;
  label: string;
  onPress: () => void;
  onNudge: (direction: -1 | 1) => void;
}

interface TimelineDiamondsProps {
  diamonds: readonly TimelineDiamond[];
}

export const TimelineDiamonds: FC<TimelineDiamondsProps> = ({ diamonds }) => {
  const { length, centre } = useTimeline();
  const activeKey = centre?.activeKey ?? null;
  const marks = diamonds.map((diamond) => (
    <KkTimeline.Diamond
      key={diamond.key}
      share={shareOf(diamond.seconds, length)}
      selected={diamond.selected || diamond.key === activeKey}
      dimmed={diamond.dimmed}
      label={diamond.label}
      onPress={diamond.onPress}
      onNudge={diamond.onNudge}
    />
  ));

  return <TimelineStrip>{marks}</TimelineStrip>;
};
