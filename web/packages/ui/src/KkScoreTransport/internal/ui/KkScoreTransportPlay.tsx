import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const PLAY_SHAPE = <path d="M8 5.5v13l10.5-6.5Z" />;
const PAUSE_SHAPE = (
  <>
    <rect x="6.5" y="5.5" width="4" height="13" rx="1" />
    <rect x="13.5" y="5.5" width="4" height="13" rx="1" />
  </>
);

interface KkScoreTransportPlayProps {
  playing: boolean;
  label: string;
  disabled: boolean;
  onToggle: () => void;
}

export const KkScoreTransportPlay: FC<KkScoreTransportPlayProps> = ({
  playing,
  label,
  disabled,
  onToggle,
}) => {
  const shape = playing ? PAUSE_SHAPE : PLAY_SHAPE;

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled}
      onClick={onToggle}
      data-kk-score-play
      sx={(theme) => ({
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        boxShadow: kkTokens.shadow.rest,
        transition: kkTokens.motion.press,
        '&:active': { transform: 'scale(0.94)' },
        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' },
        ...focusRing(theme),
      })}
    >
      <Box
        component="svg"
        aria-hidden
        viewBox="0 0 24 24"
        sx={{ width: '1.5rem', height: '1.5rem', fill: 'currentColor' }}
      >
        {shape}
      </Box>
    </ButtonBase>
  );
};
