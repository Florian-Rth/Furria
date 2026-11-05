import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import { doorWidthOf } from '@/features/hall-plan/hall-ops';
import type { DoorElement } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { KIND_LABEL, WIDTH_LABEL } from '../hall-builder-copy';
import { asDoorKind, DOOR_KIND_OPTIONS } from '../hall-choices';
import { MEASURE_LIMITS, withDoorWidth } from '../hall-element-edits';
import { HallMeasureField } from './HallMeasureField';

interface HallDoorFieldsProps {
  door: DoorElement;
}

export const HallDoorFields: FC<HallDoorFieldsProps> = ({ door }) => {
  const { updateElement } = useHallBuilderContext();
  const width = doorWidthOf(door);

  const setKind = (value: string): void => {
    const kind = asDoorKind(value);
    if (kind !== null) {
      updateElement({ ...door, door: kind }, 'kind');
    }
  };

  const setWidth = (next: number): void => {
    updateElement(withDoorWidth(door, next), 'width');
  };

  return (
    <>
      <KkSelectField
        name="doorKind"
        label={KIND_LABEL}
        value={door.door}
        options={DOOR_KIND_OPTIONS}
        onChange={setKind}
        presentation="choices"
      />
      <HallMeasureField
        name="doorWidth"
        label={WIDTH_LABEL}
        value={width}
        bounds={MEASURE_LIMITS.door}
        onCommit={setWidth}
      />
    </>
  );
};
