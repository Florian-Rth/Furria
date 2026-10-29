import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';

const SPIN_SECONDS = 0.9;

interface KkStudioATransportPlayProps {
  label: string;
  playing: boolean;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export const KkStudioATransportPlay: FC<KkStudioATransportPlayProps> = ({
  label,
  playing,
  busy,
  disabled,
  onToggle,
}) => {
  const face = busy ? (
    <Box
      aria-hidden
      sx={{
        width: '1.25rem',
        height: '1.25rem',
        borderRadius: '50%',
        border: '2.5px solid currentColor',
        borderRightColor: 'transparent',
        animation: `kk-studio-a-spin ${SPIN_SECONDS}s linear infinite`,
        '@keyframes kk-studio-a-spin': { to: { transform: 'rotate(360deg)' } },
      }}
    />
  ) : (
    <KkStudioAGlyph name={playing ? 'pause' : 'play'} size="1.375rem" />
  );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled || busy}
      onClick={onToggle}
      data-kk-studio-a-play={playing ? 'playing' : 'resting'}
      sx={(theme) => {
        const palette = (theme.vars ?? theme).palette;
        return {
          width: '3.25rem',
          height: '3.25rem',
          flexShrink: 0,
          borderRadius: '50%',
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          boxShadow: `0 6px 18px color-mix(in srgb, ${palette.primary.main} 34%, transparent)`,
          transition: 'transform .12s, box-shadow .2s',
          '&:active': { transform: 'scale(.94)' },
          '&.Mui-disabled': {
            backgroundColor: palette.primary.main,
            color: palette.primary.contrastText,
            opacity: busy ? 0.85 : 0.4,
            boxShadow: 'none',
          },
          ...focusRing(theme),
        };
      }}
    >
      {face}
    </ButtonBase>
  );
};
