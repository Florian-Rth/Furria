import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';

const PLAY_DISC = '4.5rem';
const PLAY_DISC_WIDE = '5rem';
const STEP_DISC = '3.5rem';
const GLYPH = '2.75rem';
const STEP_GLYPH = '2.25rem';

const playPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    width: PLAY_DISC,
    height: PLAY_DISC,
    [theme.breakpoints.up('desktop')]: { width: PLAY_DISC_WIDE, height: PLAY_DISC_WIDE },
    flexShrink: 0,
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor: palette.primary.main,
    color: palette.primary.contrastText,
    boxShadow: kkTokens.shadow.floating,
    transition: 'transform 140ms ease-out, opacity 200ms ease-out',
    '& svg': { width: GLYPH, height: GLYPH },
    '&:active': { transform: 'scale(0.93)' },
    '&.Mui-disabled': { opacity: 0.45 },
    ...focusRing(theme),
  };
};

const stepPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    width: STEP_DISC,
    height: STEP_DISC,
    flexShrink: 0,
    borderRadius: `${kkTokens.radius.pill}px`,
    color: palette.text.primary,
    transition: 'transform 120ms ease-out, opacity 200ms ease-out',
    '& svg': { width: STEP_GLYPH, height: STEP_GLYPH },
    '&:active': { transform: 'scale(0.9)', backgroundColor: palette.action.hover },
    '&.Mui-disabled': { color: palette.text.disabled },
    ...focusRing(theme),
  };
};

interface KkStudioFTransportProps {
  playing: boolean;
  playLabel: string;
  pauseLabel: string;
  previousLabel: string;
  nextLabel: string;
  canPlay: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const KkStudioFTransport: FC<KkStudioFTransportProps> = ({
  playing,
  playLabel,
  pauseLabel,
  previousLabel,
  nextLabel,
  canPlay,
  canPrevious,
  canNext,
  onToggle,
  onPrevious,
  onNext,
}) => {
  const glyph = playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />;
  const label = playing ? pauseLabel : playLabel;

  return (
    <Stack
      direction="row"
      data-kk-studio-f-transport
      sx={{ alignItems: 'center', justifyContent: 'center', gap: { xs: 4, desktop: 5 } }}
    >
      <ButtonBase
        aria-label={previousLabel}
        disabled={!canPrevious}
        onClick={onPrevious}
        sx={stepPaint}
      >
        <ChevronLeftRoundedIcon />
      </ButtonBase>
      <ButtonBase
        aria-label={label}
        aria-pressed={playing}
        disabled={!canPlay}
        onClick={onToggle}
        data-kk-studio-f-play
        sx={playPaint}
      >
        {glyph}
      </ButtonBase>
      <ButtonBase aria-label={nextLabel} disabled={!canNext} onClick={onNext} sx={stepPaint}>
        <ChevronRightRoundedIcon />
      </ButtonBase>
    </Stack>
  );
};
