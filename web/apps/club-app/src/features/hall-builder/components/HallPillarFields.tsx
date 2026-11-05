import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkSelectField } from '@furria/ui/KkSelectField';
import type { FC } from 'react';
import type { PillarElement } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { DEPTH_LABEL, SHAPE_LABEL, WIDTH_LABEL } from '../hall-builder-copy';
import { PILLAR_SHAPE_OPTIONS } from '../hall-choices';
import { MEASURE_LIMITS } from '../hall-element-edits';
import { HallMeasureField } from './HallMeasureField';

interface HallPillarFieldsProps {
  pillar: PillarElement;
}

const ROUND_VALUE = 'round';
const SQUARE_VALUE = 'square';

export const HallPillarFields: FC<HallPillarFieldsProps> = ({ pillar }) => {
  const { updateElement } = useHallBuilderContext();
  const shape = pillar.round ? ROUND_VALUE : SQUARE_VALUE;

  const setShape = (value: string): void => {
    updateElement({ ...pillar, round: value === ROUND_VALUE }, 'shape');
  };

  const setWidth = (widthCm: number): void => {
    updateElement({ ...pillar, widthCm }, 'width');
  };

  const setHeight = (heightCm: number): void => {
    updateElement({ ...pillar, heightCm }, 'height');
  };

  const widthField = (
    <HallMeasureField
      name="pillarWidth"
      label={WIDTH_LABEL}
      value={pillar.widthCm}
      bounds={MEASURE_LIMITS.size}
      onCommit={setWidth}
    />
  );
  const heightField = (
    <HallMeasureField
      name="pillarDepth"
      label={DEPTH_LABEL}
      value={pillar.heightCm}
      bounds={MEASURE_LIMITS.size}
      onCommit={setHeight}
    />
  );

  return (
    <>
      <KkSelectField
        name="pillarShape"
        label={SHAPE_LABEL}
        value={shape}
        options={PILLAR_SHAPE_OPTIONS}
        onChange={setShape}
        presentation="choices"
      />
      <KkFormPair start={widthField} end={heightField} phone="side" />
    </>
  );
};
