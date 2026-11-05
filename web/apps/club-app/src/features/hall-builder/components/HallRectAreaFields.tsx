import { KkFormPair } from '@furria/ui/KkFormPair';
import type { FC } from 'react';
import type { RectAreaElement } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { DEPTH_LABEL, ROTATION_LABEL, WIDTH_LABEL } from '../hall-builder-copy';
import { MEASURE_LIMITS } from '../hall-element-edits';
import { HallMeasureField } from './HallMeasureField';

interface HallRectAreaFieldsProps {
  area: RectAreaElement;
}

export const HallRectAreaFields: FC<HallRectAreaFieldsProps> = ({ area }) => {
  const { updateElement } = useHallBuilderContext();

  const setWidth = (widthCm: number): void => {
    updateElement({ ...area, widthCm }, 'width');
  };

  const setHeight = (heightCm: number): void => {
    updateElement({ ...area, heightCm }, 'height');
  };

  const setRotation = (rotation: number): void => {
    updateElement({ ...area, rotation }, 'rotation');
  };

  const widthField = (
    <HallMeasureField
      name="areaWidth"
      label={WIDTH_LABEL}
      value={area.widthCm}
      bounds={MEASURE_LIMITS.size}
      onCommit={setWidth}
    />
  );
  const heightField = (
    <HallMeasureField
      name="areaDepth"
      label={DEPTH_LABEL}
      value={area.heightCm}
      bounds={MEASURE_LIMITS.size}
      onCommit={setHeight}
    />
  );

  return (
    <>
      <KkFormPair start={widthField} end={heightField} phone="side" />
      <HallMeasureField
        name="areaRotation"
        label={ROTATION_LABEL}
        value={area.rotation}
        bounds={MEASURE_LIMITS.rotation}
        onCommit={setRotation}
      />
    </>
  );
};
