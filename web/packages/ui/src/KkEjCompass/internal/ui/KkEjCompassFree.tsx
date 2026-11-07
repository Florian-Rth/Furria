import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { compassCellOf } from './compass-paint';

interface KkEjCompassFreeProps {
  text: string;
  label: string;
  pressed: boolean;
  onPress: () => void;
}

export const KkEjCompassFree: FC<KkEjCompassFreeProps> = ({ text, label, pressed, onPress }) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    onClick={onPress}
    sx={(theme) => ({ ...compassCellOf(theme, pressed), gridArea: 'free' })}
  >
    <Typography component="span" variant="caption" sx={{ fontWeight: 800, color: 'inherit' }}>
      {text}
    </Typography>
  </ButtonBase>
);
