import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { AreaElement } from '@/features/hall-plan/schemas';
import { LABEL_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { KIND_LABEL, LABEL_HINT, LABEL_LABEL } from '../hall-builder-copy';
import { AREA_KIND_OPTIONS, asAreaKind } from '../hall-choices';
import { labelOrNull } from '../hall-element-edits';
import { HallRectAreaFields } from './HallRectAreaFields';

interface HallAreaFieldsProps {
  area: AreaElement;
}

export const HallAreaFields: FC<HallAreaFieldsProps> = ({ area }) => {
  const { updateElement } = useHallBuilderContext();
  const label = area.label ?? '';
  const sizeFields = area.shape === 'rect' ? <HallRectAreaFields area={area} /> : null;

  const setKind = (value: string): void => {
    const kind = asAreaKind(value);
    if (kind !== null) {
      updateElement({ ...area, area: kind }, 'kind');
    }
  };

  const setLabel = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    updateElement({ ...area, label: labelOrNull(event.target.value) }, 'label');
  };

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
      {sizeFields}
    </>
  );
};
