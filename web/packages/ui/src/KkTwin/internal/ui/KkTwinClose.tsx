import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkTwinCloseProps {
  label: string;
  onPress: () => void;
}

export const KkTwinClose: FC<KkTwinCloseProps> = ({ label, onPress }) => (
  <ButtonBase
    aria-label={label}
    onClick={onPress}
    data-kk-twin-close
    sx={(theme) => ({
      flexShrink: 0,
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
      borderRadius: '50%',
      color: (theme.vars ?? theme).palette.text.primary,
      backgroundColor: (theme.vars ?? theme).palette.background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      transition: kkTokens.motion.press,
      '&:active': { transform: 'scale(0.94)' },
      ...focusRing(theme),
    })}
  >
    <CloseRoundedIcon />
  </ButtonBase>
);
