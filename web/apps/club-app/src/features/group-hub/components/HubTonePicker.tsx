import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import { ToneField } from '@/features/write/components/ToneField';
import type { GroupTone } from '@/lib/group-tone';
import { toToneWarning } from '../group-hub-labels';

const PICKER_LABEL = 'Gruppenfarbe';

interface HubTonePickerProps {
  value: GroupTone | '';
  takenTones: ReadonlySet<GroupTone>;
  onChange: (tone: GroupTone) => void;
}

export const HubTonePicker: FC<HubTonePickerProps> = ({ value, takenTones, onChange }) => {
  const warning = toToneWarning(value, takenTones);
  const warningNote = warning === null ? null : <KkNote tone="warning">{warning}</KkNote>;
  const tone = value === '' ? null : value;

  return (
    <ToneField
      label={PICKER_LABEL}
      value={tone}
      onChange={onChange}
      takenTones={takenTones}
      notes={warningNote}
    />
  );
};
