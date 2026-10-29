import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const DOWNBEAT = 1;
const POP_MS = 240;

interface KkStudioECountProps {
  count: number | null;
  label: string;
  sx?: KkSx;
}

const markPaint = (lit: boolean, downbeat: boolean) => (theme: Theme) => ({
  width: { xs: '0.3125rem', desktop: '0.4375rem' },
  height: downbeat ? { xs: '1.375rem', desktop: '1.75rem' } : { xs: '1rem', desktop: '1.25rem' },
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: lit
    ? (theme.vars ?? theme).palette.primary.main
    : (theme.vars ?? theme).palette.divider,
  transform: lit ? 'scaleY(1.18)' : 'scaleY(1)',
  transition: 'transform 140ms ease-out, background-color 140ms ease-out',
});

export const KkStudioECount: FC<KkStudioECountProps> = ({ count, label, sx }) => {
  const marks = COUNTS.map((mark) => (
    <Box key={mark} sx={markPaint(mark === count, mark === DOWNBEAT)} />
  ));
  const shown = count === null ? '–' : String(count);
  const ink = count === null ? 'text.disabled' : 'text.primary';

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-studio-e-count
      sx={[
        { alignItems: 'center', gap: { xs: 1.25, desktop: 2 }, flexShrink: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack
        direction="row"
        aria-hidden
        sx={{ alignItems: 'center', gap: { xs: 0.5, desktop: 0.75 } }}
      >
        {marks}
      </Stack>
      <Box
        aria-hidden
        sx={{
          width: { xs: '1.75rem', desktop: '2.75rem' },
          height: { xs: '3rem', desktop: '4.5rem' },
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography
          key={shown}
          component="span"
          variant="display"
          sx={{
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: ink,
            animation: `kk-studio-e-count-pop ${POP_MS}ms cubic-bezier(.2,.7,.3,1)`,
            '@keyframes kk-studio-e-count-pop': {
              from: { transform: 'scale(1.14)', opacity: 0.6 },
              to: { transform: 'scale(1)', opacity: 1 },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {shown}
        </Typography>
      </Box>
    </Stack>
  );
};
