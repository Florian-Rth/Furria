import { KkTouchLab } from '@furria/ui/KkTouchLab';
import type { FC } from 'react';
import type { KeyLane } from '../hooks/use-key-lane';
import { KEY_LANE_AREA } from '../studio-lab-copy';

interface KeyLaneAreaProps {
  lane: KeyLane;
}

export const KeyLaneArea: FC<KeyLaneAreaProps> = ({ lane }) => {
  const overlay =
    lane.readout === null ? null : (
      <KkTouchLab.Readout
        x={lane.readout.x}
        y={lane.readout.y}
        value={lane.readout.value}
        detail={lane.readout.detail}
        badge={lane.readout.badge}
      />
    );

  return (
    <KkTouchLab
      label={KEY_LANE_AREA}
      size="lane"
      areaRef={lane.area.areaRef}
      handlers={lane.area.handlers}
      overlay={overlay}
    >
      <KkTouchLab.Ticks ticks={lane.ticks} snapX={lane.snapX} />
      <KkTouchLab.Keys keys={lane.keys} />
      <KkTouchLab.Playhead x={lane.playheadX} />
    </KkTouchLab>
  );
};
