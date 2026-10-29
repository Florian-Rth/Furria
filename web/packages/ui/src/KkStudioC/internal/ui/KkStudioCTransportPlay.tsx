import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const DISC = '3rem';

const discPaint = (theme: Theme): CSSObject => ({
  width: DISC,
  height: DISC,
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  color: (theme.vars ?? theme).palette.primary.contrastText,
  boxShadow: kkTokens.shadow.rest,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.94)' },
  '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
  ...focusRing(theme),
});

interface KkStudioCTransportPlayProps {
  playing: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioCTransportPlay: FC<KkStudioCTransportPlayProps> = ({
  playing,
  label,
  disabled = false,
  onToggle,
}) => {
  const glyph = playing ? (
    <PauseRoundedIcon fontSize="large" />
  ) : (
    <PlayArrowRoundedIcon fontSize="large" />
  );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled}
      onClick={onToggle}
      data-kk-studio-c-play
      sx={discPaint}
    >
      {glyph}
    </ButtonBase>
  );
};
