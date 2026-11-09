import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkGroupTone } from '../internal/group-tone';
import { GROUP_TONE_PRESETS, isToneTaken } from '../internal/group-tone';
import { KkGroupToneSwatch } from '../KkGroupToneSwatch';
import type { KkSx } from '../kk-sx';
import { useTonePicker } from './internal/logic/use-tone-picker';
import { KkToneField } from './internal/ui/KkToneField';
import { KkTonePickerCustomSwatch } from './internal/ui/KkTonePickerCustomSwatch';
import type { KkTonePickerLabels } from './tone-picker-labels';

const NO_TAKEN_TONES: readonly KkGroupTone[] = [];

interface KkTonePickerProps {
  value: KkGroupTone | null;
  onChange: (tone: KkGroupTone) => void;
  toneLabel: (tone: KkGroupTone) => string;
  labels: KkTonePickerLabels;
  takenTones?: Iterable<KkGroupTone>;
  sx?: KkSx;
}

export const KkTonePicker: FC<KkTonePickerProps> = ({
  value,
  onChange,
  toneLabel,
  labels,
  takenTones = NO_TAKEN_TONES,
  sx,
}) => {
  const picker = useTonePicker(value);

  const presets = GROUP_TONE_PRESETS.map((tone) => {
    const isTaken = isToneTaken(tone, takenTones);
    const label = isTaken ? `${toneLabel(tone)}${labels.takenSuffix}` : toneLabel(tone);

    const pick = (): void => {
      onChange(tone);
    };

    return (
      <KkGroupToneSwatch
        key={tone}
        tone={tone}
        label={label}
        selected={value === tone}
        taken={isTaken}
        onSelect={pick}
      />
    );
  });

  const field = picker.isFieldOpen ? (
    <KkToneField value={value} onChange={onChange} labels={labels} />
  ) : null;

  return (
    <Stack data-kk-tone-picker sx={[{ gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        role="group"
        aria-label={labels.group}
        sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}
      >
        {presets}
        <KkTonePickerCustomSwatch
          tone={picker.customTone}
          label={labels.custom}
          isExpanded={picker.isFieldOpen}
          onToggle={picker.toggleField}
        />
      </Stack>
      {field}
    </Stack>
  );
};
