import NorthRounded from '@mui/icons-material/NorthRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { compassCellOf } from './compass-paint';

interface KkEjCompassArrowProps {
  degrees: number;
  label: string;
  pressed: boolean;
  onPress: () => void;
}

export const KkEjCompassArrow: FC<KkEjCompassArrowProps> = ({
  degrees,
  label,
  pressed,
  onPress,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    onClick={onPress}
    sx={(theme) => ({ ...compassCellOf(theme, pressed), gridArea: `a${degrees}` })}
  >
    <NorthRounded aria-hidden fontSize="small" sx={{ transform: `rotate(${degrees}deg)` }} />
  </ButtonBase>
);
