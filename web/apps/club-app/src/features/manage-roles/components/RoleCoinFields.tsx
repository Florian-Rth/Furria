import { KkClubIconPicker } from '@furria/ui/KkClubIconPicker';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ToneField } from '@/features/write/components/ToneField';
import type { ClubIcon } from '@/lib/club-icon';
import { CLUB_ICON_FIELD_LABEL, toClubIconLabel } from '@/lib/club-icon';
import type { GroupTone } from '@/lib/group-tone';

const TONE_FIELD_LABEL = 'Farbe';

interface RoleCoinFieldsProps {
  icon: ClubIcon | null;
  onIconChange: (icon: ClubIcon | null) => void;
  tone: GroupTone | null;
  onToneChange: (tone: GroupTone) => void;
}

export const RoleCoinFields: FC<RoleCoinFieldsProps> = ({
  icon,
  onIconChange,
  tone,
  onToneChange,
}) => (
  <Stack sx={{ gap: 2, minWidth: 0 }}>
    <ToneField label={TONE_FIELD_LABEL} value={tone} onChange={onToneChange} />
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkEyebrow tone="muted">{CLUB_ICON_FIELD_LABEL}</KkEyebrow>
      <KkClubIconPicker
        value={icon}
        onChange={onIconChange}
        label={CLUB_ICON_FIELD_LABEL}
        iconLabel={toClubIconLabel}
      />
    </Stack>
  </Stack>
);
