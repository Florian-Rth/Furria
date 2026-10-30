import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { PRACTICE_KEY_GLYPHS } from './practice-key-glyphs';

const playPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  minHeight: `calc(${kkTokens.tapTarget} * 1.5)`,
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: `${kkTokens.radius.base}px`,
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  color: (theme.vars ?? theme).palette.primary.contrastText,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.98)' },
  '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
  ...focusRing(theme),
});

interface KkPracticeKeysPlayProps {
  playing: boolean;
  caption: string;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkPracticeKeysPlay: FC<KkPracticeKeysPlayProps> = ({
  playing,
  caption,
  disabled = false,
  onToggle,
}) => (
  <ButtonBase disabled={disabled} onClick={onToggle} sx={playPaint}>
    {PRACTICE_KEY_GLYPHS[playing ? 'pause' : 'play']}
    <Typography variant="button" component="span" sx={{ overflowWrap: 'anywhere' }}>
      {caption}
    </Typography>
  </ButtonBase>
);
