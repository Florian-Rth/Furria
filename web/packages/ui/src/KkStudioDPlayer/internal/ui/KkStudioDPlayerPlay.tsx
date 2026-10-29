import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkStudioDGlyph } from '../../../KkStudioDGlyph/KkStudioDGlyph';
import { fadesWhenAsleep, glassOf, PLAYER_LAYER } from '../player-paint';

const SPIN_SECONDS = 0.9;

interface KkStudioDPlayerPlayProps {
  label: string;
  playing: boolean;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export const KkStudioDPlayerPlay: FC<KkStudioDPlayerPlayProps> = ({
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
        width: '1.75rem',
        height: '1.75rem',
        borderRadius: '50%',
        border: '3px solid currentColor',
        borderRightColor: 'transparent',
        animation: `kk-studio-d-spin ${SPIN_SECONDS}s linear infinite`,
        '@keyframes kk-studio-d-spin': { to: { transform: 'rotate(360deg)' } },
      }}
    />
  ) : (
    <KkStudioDGlyph name={playing ? 'pause' : 'play'} size="2.25rem" />
  );

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={playing}
      disabled={disabled || busy}
      onClick={onToggle}
      data-kk-studio-d-play={playing ? 'playing' : 'resting'}
      sx={(theme) => ({
        position: 'absolute',
        zIndex: PLAYER_LAYER.overlay,
        left: '50%',
        top: '50%',
        width: '4.75rem',
        height: '4.75rem',
        marginLeft: '-2.375rem',
        marginTop: '-2.375rem',
        borderRadius: '50%',
        ...glassOf(theme),
        transition: 'opacity .45s cubic-bezier(.2,.8,.2,1), transform .12s ease-out',
        '&:active': { transform: 'scale(.92)' },
        '&.Mui-disabled': { color: (theme.vars ?? theme).palette.text.primary, opacity: 0.6 },
        ...fadesWhenAsleep,
        ...focusRing(theme),
        [theme.breakpoints.up('desktop')]: {
          width: '5.5rem',
          height: '5.5rem',
          marginLeft: '-2.75rem',
          marginTop: '-2.75rem',
        },
      })}
    >
      {face}
    </ButtonBase>
  );
};
