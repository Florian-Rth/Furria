import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const discPaint = (theme: Theme): CSSObject => ({
  width: '4.25rem',
  height: '4.25rem',
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  color: (theme.vars ?? theme).palette.primary.contrastText,
  boxShadow: kkTokens.shadow.floating,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.94)' },
  '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed, boxShadow: 'none' },
  [theme.breakpoints.up('desktop')]: { width: '4.75rem', height: '4.75rem' },
  ...focusRing(theme),
});

interface KkStudioETransportPlayProps {
  playing: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioETransportPlay: FC<KkStudioETransportPlayProps> = ({
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
      data-kk-studio-e-play
      sx={discPaint}
    >
      {glyph}
    </ButtonBase>
  );
};
