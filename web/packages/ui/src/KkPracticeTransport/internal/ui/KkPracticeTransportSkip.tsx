import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkPracticeTransportSkipDirection = 'back' | 'forward';

const GLYPHS: Record<KkPracticeTransportSkipDirection, ReactNode> = {
  back: <SkipPreviousRoundedIcon />,
  forward: <SkipNextRoundedIcon />,
};

const skipPaint = (theme: Theme): CSSObject => ({
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: (theme.vars ?? theme).palette.text.primary,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.9)' },
  '&.Mui-disabled': { color: (theme.vars ?? theme).palette.text.disabled },
  ...focusRing(theme),
});

interface KkPracticeTransportSkipProps {
  direction: KkPracticeTransportSkipDirection;
  label: string;
  disabled?: boolean;
  onSkip: () => void;
}

export const KkPracticeTransportSkip: FC<KkPracticeTransportSkipProps> = ({
  direction,
  label,
  disabled = false,
  onSkip,
}) => (
  <ButtonBase
    aria-label={label}
    disabled={disabled}
    onClick={onSkip}
    data-kk-practice-skip={direction}
    sx={skipPaint}
  >
    {GLYPHS[direction]}
  </ButtonBase>
);
