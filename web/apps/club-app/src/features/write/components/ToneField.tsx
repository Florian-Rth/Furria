import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkTonePicker } from '@furria/ui/KkTonePicker';
import type { KkTonePickerLabels } from '@furria/ui/tone-picker-labels';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { GroupTone } from '@/lib/group-tone';
import { TONE_PICKER_COPY, toToneLabel } from '@/lib/group-tone';

interface ToneFieldProps {
  label: string;
  value: GroupTone | null;
  onChange: (tone: GroupTone) => void;
  takenTones?: Iterable<GroupTone>;
  notes?: ReactNode;
}

export const ToneField: FC<ToneFieldProps> = ({ label, value, onChange, takenTones, notes }) => {
  const labels: KkTonePickerLabels = { ...TONE_PICKER_COPY, group: label };

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkEyebrow tone="muted">{label}</KkEyebrow>
      <KkTonePicker
        value={value}
        onChange={onChange}
        toneLabel={toToneLabel}
        labels={labels}
        takenTones={takenTones}
      />
      {notes}
    </Stack>
  );
};
