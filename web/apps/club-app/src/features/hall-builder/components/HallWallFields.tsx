import type { FC } from 'react';
import type { WallElement } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { THICKNESS_LABEL } from '../hall-builder-copy';
import { MEASURE_LIMITS } from '../hall-element-edits';
import { HallMeasureField } from './HallMeasureField';

interface HallWallFieldsProps {
  wall: WallElement;
}

export const HallWallFields: FC<HallWallFieldsProps> = ({ wall }) => {
  const { updateElement } = useHallBuilderContext();

  const setThickness = (thicknessCm: number): void => {
    updateElement({ ...wall, thicknessCm }, 'thickness');
  };

  return (
    <HallMeasureField
      name="wallThickness"
      label={THICKNESS_LABEL}
      value={wall.thicknessCm}
      bounds={MEASURE_LIMITS.thickness}
      onCommit={setThickness}
    />
  );
};
