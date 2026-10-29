import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import CircularProgress from '@mui/material/CircularProgress';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const PLAY_SIZE = '3rem';

const playPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    flexShrink: 0,
    width: PLAY_SIZE,
    height: PLAY_SIZE,
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor: palette.primary.main,
    color: palette.primary.contrastText,
    transition: kkTokens.motion.press,
    '&:active': { transform: 'scale(0.94)' },
    '&.Mui-disabled': {
      backgroundColor: palette.action.disabledBackground,
      color: palette.text.disabled,
    },
    ...focusRing(theme),
  };
};

const GLYPH = { width: '1.75rem', height: '1.75rem' } as const;

interface KkStudioBTransportPlayProps {
  playing: boolean;
  loading: boolean;
  disabled: boolean;
  playLabel: string;
  pauseLabel: string;
  onToggle: () => void;
}

export const KkStudioBTransportPlay: FC<KkStudioBTransportPlayProps> = ({
  playing,
  loading,
  disabled,
  playLabel,
  pauseLabel,
  onToggle,
}) => {
  const label = playing ? pauseLabel : playLabel;
  const glyph = playing ? <PauseRoundedIcon sx={GLYPH} /> : <PlayArrowRoundedIcon sx={GLYPH} />;
  const face = loading ? <CircularProgress size="1.5rem" color="inherit" /> : glyph;

  return (
    <ButtonBase
      aria-label={label}
      aria-busy={loading}
      disabled={disabled}
      onClick={onToggle}
      data-kk-studio-b-play
      sx={playPaint}
    >
      {face}
    </ButtonBase>
  );
};
