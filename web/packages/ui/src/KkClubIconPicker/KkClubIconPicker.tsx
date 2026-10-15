import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkClubIcon } from '../internal/club-icon';
import { KK_CLUB_ICONS } from '../internal/club-icon';
import type { KkSx } from '../kk-sx';
import { KkClubIconSwatch } from './internal/KkClubIconSwatch';

interface KkClubIconPickerProps {
  value: KkClubIcon | null;
  onChange: (icon: KkClubIcon | null) => void;
  label: string;
  iconLabel: (icon: KkClubIcon) => string;
  noneLabel: string;
  sx?: KkSx;
}

export const KkClubIconPicker: FC<KkClubIconPickerProps> = ({
  value,
  onChange,
  label,
  iconLabel,
  noneLabel,
  sx,
}) => {
  const swatches = KK_CLUB_ICONS.map((icon) => {
    const name = iconLabel(icon);
    const selected = value === icon;

    return (
      <KkClubIconSwatch key={icon} icon={icon} label={name} selected={selected} onPick={onChange} />
    );
  });

  const noneSelected = value === null;

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      data-kk-club-icon-picker
      sx={[{ gap: 1, flexWrap: 'wrap', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkClubIconSwatch icon={null} label={noneLabel} selected={noneSelected} onPick={onChange} />
      {swatches}
    </Stack>
  );
};
