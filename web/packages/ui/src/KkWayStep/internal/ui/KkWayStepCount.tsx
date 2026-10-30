import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const DOWNBEAT = 1;
const LARGE_TEXT = '@container kk-way (max-width: 17rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const markPaint = (lit: boolean, downbeat: boolean) => (theme: Theme) => ({
  width: '0.3125rem',
  height: downbeat ? '1.375rem' : '1rem',
  borderRadius: `${kkTokens.radius.pill}px`,
  backgroundColor: lit ? palette(theme).primary.main : palette(theme).divider,
  transform: lit ? 'scaleY(1.18)' : 'scaleY(1)',
  transition: 'transform 140ms ease-out, background-color 140ms ease-out',
});

interface KkWayStepCountProps {
  count: number | null;
  label: string;
}

export const KkWayStepCount: FC<KkWayStepCountProps> = ({ count, label }) => {
  const marks = COUNTS.map((mark) => (
    <Box key={mark} sx={markPaint(mark === count, mark === DOWNBEAT)} />
  ));
  const shown = count === null ? '·' : String(count);

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-way-count
      sx={{ alignItems: 'center', gap: 1.25, flexShrink: 0 }}
    >
      <Stack
        direction="row"
        aria-hidden
        sx={{ alignItems: 'center', gap: 0.5, [LARGE_TEXT]: { display: 'none' } }}
      >
        {marks}
      </Stack>
      <Box
        aria-hidden
        sx={{
          minWidth: '1.75rem',
          height: { xs: '3rem', desktop: '4.5rem' },
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Typography
          component="span"
          variant="display"
          sx={{
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: count === null ? 'text.disabled' : 'text.primary',
          }}
        >
          {shown}
        </Typography>
      </Box>
    </Stack>
  );
};
