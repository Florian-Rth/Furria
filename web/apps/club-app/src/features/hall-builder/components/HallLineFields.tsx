import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { LineElement } from '@/features/hall-plan/schemas';
import { LABEL_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { LABEL_LABEL } from '../hall-builder-copy';
import { labelOrNull } from '../hall-element-edits';

interface HallLineFieldsProps {
  line: LineElement;
}

export const HallLineFields: FC<HallLineFieldsProps> = ({ line }) => {
  const { updateElement } = useHallBuilderContext();
  const label = line.label ?? '';

  const setLabel = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    updateElement({ ...line, label: labelOrNull(event.target.value) }, 'label');
  };

  return (
    <KkTextField
      name="lineLabel"
      label={LABEL_LABEL}
      value={label}
      onChange={setLabel}
      maxLength={LABEL_MAX_LENGTH}
    />
  );
};
