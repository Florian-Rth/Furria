import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { AreaElement } from '@/features/hall-plan/schemas';
import { LABEL_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import {
  DEPTH_LABEL,
  KIND_LABEL,
  LABEL_HINT,
  LABEL_LABEL,
  ROTATION_LABEL,
  WIDTH_LABEL,
} from '../hall-builder-copy';
import { AREA_KIND_OPTIONS, asAreaKind } from '../hall-choices';
import { labelOrNull, MEASURE_LIMITS } from '../hall-element-edits';
import { HallMeasureField } from './HallMeasureField';

interface HallAreaFieldsProps {
  area: AreaElement;
}

export const HallAreaFields: FC<HallAreaFieldsProps> = ({ area }) => {
  const { updateElement } = useHallBuilderContext();
  const label = area.label ?? '';

  const setKind = (value: string): void => {
    const kind = asAreaKind(value);
    if (kind !== null) {
      updateElement({ ...area, area: kind }, 'kind');
    }
  };

  const setLabel = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    updateElement({ ...area, label: labelOrNull(event.target.value) }, 'label');
  };

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
      <KkSelectField
        name="areaKind"
        label={KIND_LABEL}
        value={area.area}
        options={AREA_KIND_OPTIONS}
        onChange={setKind}
        presentation="choices"
      />
      <KkTextField
        name="areaLabel"
        label={LABEL_LABEL}
        value={label}
        onChange={setLabel}
        maxLength={LABEL_MAX_LENGTH}
        hint={LABEL_HINT}
      />
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
