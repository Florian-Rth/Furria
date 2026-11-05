import { KkSelectField } from '@furria/ui/KkSelectField';
import { KkTextField } from '@furria/ui/KkTextField';
import type { ChangeEvent, FC } from 'react';
import type { TextElement } from '@/features/hall-plan/schemas';
import { TEXT_MAX_LENGTH } from '@/features/hall-plan/schemas';
import { useHallBuilderContext } from '../hall-builder-context';
import { ROTATION_LABEL, SIZE_LABEL, TEXT_LABEL } from '../hall-builder-copy';
import { asTextSize, TEXT_SIZE_OPTIONS } from '../hall-choices';
import { MEASURE_LIMITS } from '../hall-element-edits';
import { useFocusOnArrival } from '../hooks/use-focus-on-arrival';
import { HallMeasureField } from './HallMeasureField';

interface HallTextFieldsProps {
  text: TextElement;
}

export const HallTextFields: FC<HallTextFieldsProps> = ({ text }) => {
  const { updateElement } = useHallBuilderContext();
  const isEmpty = text.text.trim() === '';
  const inputRef = useFocusOnArrival(text.id);

  const setText = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    updateElement({ ...text, text: event.target.value }, 'text');
  };

  const setSize = (value: string): void => {
    const size = asTextSize(value);
    if (size !== null) {
      updateElement({ ...text, size }, 'size');
    }
  };

  const setRotation = (rotation: number): void => {
    updateElement({ ...text, rotation }, 'rotation');
  };

  return (
    <>
      <KkTextField
        name="planText"
        label={TEXT_LABEL}
        value={text.text}
        onChange={setText}
        maxLength={TEXT_MAX_LENGTH}
        error={isEmpty}
        inputRef={inputRef}
      />
      <KkSelectField
        name="textSize"
        label={SIZE_LABEL}
        value={text.size}
        options={TEXT_SIZE_OPTIONS}
        onChange={setSize}
        presentation="choices"
      />
      <HallMeasureField
        name="textRotation"
        label={ROTATION_LABEL}
        value={text.rotation}
        bounds={MEASURE_LIMITS.rotation}
        onCommit={setRotation}
      />
    </>
  );
};
