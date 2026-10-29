import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { onFootage } from '../player-paint';

const PULSE_SECONDS = 0.32;
const DOWNBEAT = 1;

interface KkStudioDPlayerCountProps {
  label: string;
  count: number | null;
  beat: number;
}

export const KkStudioDPlayerCount: FC<KkStudioDPlayerCountProps> = ({ label, count, beat }) => {
  const face = count === null ? '·' : String(count);

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-studio-d-count={count ?? 'none'}
      sx={{
        typography: 'poster',
        width: '0.56em',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'end start',
      }}
    >
      <Typography
        key={beat}
        variant="poster"
        component="span"
        aria-hidden
        sx={(theme) => ({
          display: 'block',
          lineHeight: 0.82,
          fontVariantNumeric: 'tabular-nums',
          color:
            count === DOWNBEAT
              ? (theme.vars ?? theme).palette.primary.main
              : (theme.vars ?? theme).palette.text.primary,
          transformOrigin: '30% 80%',
          animation: `kk-studio-d-beat ${PULSE_SECONDS}s cubic-bezier(.2,.8,.2,1)`,
          '@keyframes kk-studio-d-beat': {
            from: { transform: 'scale(1.14)', opacity: 0.55 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
          ...onFootage,
          fontFamily: kkTokens.font.display,
        })}
      >
        {face}
      </Typography>
    </Box>
  );
};
