import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { HALL_GLYPHS } from './hall-glyphs';

interface KkHallCloseProps {
  label: string;
  onPress: () => void;
}

export const KkHallClose: FC<KkHallCloseProps> = ({ label, onPress }) => (
  <ButtonBase
    aria-label={label}
    onClick={onPress}
    sx={(theme) => ({
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      borderRadius: '50%',
      color: (theme.vars ?? theme).palette.text.secondary,
      backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.paper} 80%, transparent)`,
      '&:active': { transform: 'scale(0.94)' },
      transition: kkTokens.motion.press,
      ...focusRing(theme),
    })}
  >
    {HALL_GLYPHS.close}
  </ButtonBase>
);
