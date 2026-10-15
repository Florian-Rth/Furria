import { KkClubIconPicker, KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { ClubIcon } from '@/lib/club-icon';
import { CLUB_ICON_FIELD_LABEL, NO_CLUB_ICON_LABEL, toClubIconLabel } from '@/lib/club-icon';

interface ClubIconFieldProps {
  value: ClubIcon | null;
  onChange: (icon: ClubIcon | null) => void;
}

export const ClubIconField: FC<ClubIconFieldProps> = ({ value, onChange }) => (
  <Stack sx={{ gap: 1, minWidth: 0 }}>
    <KkEyebrow tone="muted">{CLUB_ICON_FIELD_LABEL}</KkEyebrow>
    <KkClubIconPicker
      value={value}
      onChange={onChange}
      label={CLUB_ICON_FIELD_LABEL}
      iconLabel={toClubIconLabel}
      noneLabel={NO_CLUB_ICON_LABEL}
    />
  </Stack>
);
