import { GROUP_TONES, KkEyebrow, KkGroupToneSwatch, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toToneLabel, toToneWarning } from '../group-hub-labels';

const PICKER_LABEL = 'Gruppenfarbe';
const PICKER_HINT =
  'Die Farbe trägt die Gruppe durch App und Kalender. Sie sagt nichts über einen Zustand aus.';
const TAKEN_SUFFIX = ' — schon vergeben';

interface HubTonePickerProps {
  value: GroupTone | '';
  takenTones: ReadonlySet<GroupTone>;
  onChange: (tone: GroupTone) => void;
}

export const HubTonePicker: FC<HubTonePickerProps> = ({ value, takenTones, onChange }) => {
  const warning = toToneWarning(value, takenTones);
  const warningNote = warning === null ? null : <KkNote tone="warning">{warning}</KkNote>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkEyebrow tone="muted">{PICKER_LABEL}</KkEyebrow>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
        {GROUP_TONES.map((tone) => {
          const taken = takenTones.has(tone);
          const label = taken ? `${toToneLabel(tone)}${TAKEN_SUFFIX}` : toToneLabel(tone);

          const pick = (): void => {
            onChange(tone);
          };

          return (
            <KkGroupToneSwatch
              key={tone}
              tone={tone}
              label={label}
              selected={value === tone}
              taken={taken}
              onSelect={pick}
            />
          );
        })}
      </Stack>
      <KkNote>{PICKER_HINT}</KkNote>
      {warningNote}
    </Stack>
  );
};
