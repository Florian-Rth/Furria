import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const POP_MS = 220;

interface KkLessonBeatProps {
  count: number | null;
  label: string;
}

export const KkLessonBeat: FC<KkLessonBeatProps> = ({ count, label }) => {
  const shown = count === null ? '–' : String(count);
  const ink = count === null ? 'text.disabled' : 'text.primary';

  return (
    <Box
      role="img"
      aria-label={label}
      data-kk-lesson-beat
      sx={{
        flexShrink: 0,
        width: { xs: '2.25rem', desktop: '3.25rem' },
        height: { xs: '3rem', desktop: '4.25rem' },
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Typography
        key={shown}
        component="span"
        aria-hidden
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
  );
};
