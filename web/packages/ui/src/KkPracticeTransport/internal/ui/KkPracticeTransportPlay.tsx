import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const discPaint = (theme: Theme): CSSObject => ({
  width: '3rem',
  height: '3rem',
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  color: (theme.vars ?? theme).palette.primary.contrastText,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.94)' },
  '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
  ...focusRing(theme),
});

interface KkPracticeTransportPlayProps {
  playing: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkPracticeTransportPlay: FC<KkPracticeTransportPlayProps> = ({
  playing,
  label,
  disabled = false,
  onToggle,
}) => {
  const glyph = playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />;

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled}
      onClick={onToggle}
      data-kk-practice-play
      sx={discPaint}
    >
      {glyph}
    </ButtonBase>
  );
};
