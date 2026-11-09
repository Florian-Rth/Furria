import Stack from '@mui/material/Stack';
import type { ChangeEvent, FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { KkTextField } from '../../../KkTextField';
import type { KkTonePickerLabels } from '../../tone-picker-labels';
import { useToneField } from '../logic/use-tone-field';
import { KkToneArea } from './KkToneArea';
import { KkToneHue } from './KkToneHue';

const HEX_MAX_LENGTH = 7;
const HEX_PLACEHOLDER = '#1F7565';

interface KkToneFieldProps {
  value: KkGroupTone | null;
  onChange: (tone: KkGroupTone) => void;
  labels: KkTonePickerLabels;
}

export const KkToneField: FC<KkToneFieldProps> = ({ value, onChange, labels }) => {
  const field = useToneField(value, onChange);

  const handleHex = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    field.typeDraft(event.target.value);
  };
  const hexHelper = field.isDraftInvalid ? labels.hexInvalid : undefined;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkToneArea hsv={field.hsv} label={labels.area} onPick={field.pickHsv} />
      <KkToneHue hue={field.hsv.h} label={labels.hue} onPick={field.pickHue} />
      <KkTextField
        name="tone-hex"
        label={labels.hex}
        value={field.draft}
        placeholder={HEX_PLACEHOLDER}
        maxLength={HEX_MAX_LENGTH}
        autoComplete="off"
        error={field.isDraftInvalid}
        helperText={hexHelper}
        onChange={handleHex}
      />
    </Stack>
  );
};
