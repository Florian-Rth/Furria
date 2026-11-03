import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const POP_MS = 220;
const NO_COUNT = '–';

interface KkLessonBeatProps {
  count: number | null;
  eyebrow: string;
  eight: string;
  label: string;
}

export const KkLessonBeat: FC<KkLessonBeatProps> = ({ count, eyebrow, eight, label }) => {
  const shown = count === null ? NO_COUNT : String(count);
  const ink = count === null ? 'text.disabled' : 'text.primary';

  return (
    <Stack
      direction="row"
      role="img"
      aria-label={label}
      data-kk-lesson-beat
      sx={{ flexShrink: 0, alignItems: 'center', gap: 0.5 }}
    >
      <Stack aria-hidden sx={{ minWidth: '2.75rem', alignItems: 'flex-end' }}>
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.secondary' }}
        >
          {eyebrow}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 800,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
            color: 'text.primary',
          }}
        >
          {eight}
        </Typography>
      </Stack>
      <Box
        aria-hidden
        sx={{
          width: { xs: '2.25rem', desktop: '3.25rem' },
          height: { xs: '3rem', desktop: '4.25rem' },
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
            animation: `kk-lesson-beat-pop ${POP_MS}ms cubic-bezier(.2,.7,.3,1)`,
            '@keyframes kk-lesson-beat-pop': {
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
