import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const BEAT_COLUMNS = `repeat(${COUNTS.length}, minmax(0, 1fr))`;
const POP = 'kk-training-count-pop 200ms cubic-bezier(.2,.7,.3,1)';

type BeatState = 'on' | 'done' | 'later';

const beatStateOf = (mark: number, count: number | null): BeatState => {
  if (count === null || mark > count) {
    return 'later';
  }

  return mark === count ? 'on' : 'done';
};

const beatPaint =
  (state: BeatState) =>
  (theme: Theme): CSSObject => ({
    height: '0.75rem',
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor:
      state === 'later'
        ? (theme.vars ?? theme).palette.divider
        : (theme.vars ?? theme).palette.primary.main,
    opacity: state === 'done' ? kkTokens.opacity.dimmed : 1,
    transition: 'background-color 120ms ease-out, opacity 120ms ease-out',
  });

const numberPaint = (count: number | null): CSSObject => ({
  lineHeight: 0.85,
  color: count === null ? 'text.disabled' : 'primary.main',
  fontVariantNumeric: 'tabular-nums',
  animation: POP,
  '@keyframes kk-training-count-pop': {
    from: { transform: 'scale(1.12)', opacity: 0.6 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

interface KkTrainingViewBeatProps {
  count: number | null;
  countLabel: string;
  stepName: string;
  stepMeta: string | null;
}

export const KkTrainingViewBeat: FC<KkTrainingViewBeatProps> = ({
  count,
  countLabel,
  stepName,
  stepMeta,
}) => {
  const shown = count === null ? '–' : String(count);
  const beats = COUNTS.map((mark) => <Box key={mark} sx={beatPaint(beatStateOf(mark, count))} />);
  const meta =
    stepMeta === null ? null : (
      <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
        {stepMeta}
      </Typography>
    );

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: { xs: 2, desktop: 3 }, minWidth: 0 }}>
        <Box
          role="img"
          aria-label={countLabel}
          sx={{
            minWidth: { xs: '3.5rem', desktop: '5.5rem' },
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Typography
            key={shown}
            component="span"
            variant="poster"
            aria-hidden
            sx={numberPaint(count)}
          >
            {shown}
          </Typography>
        </Box>
        <Stack sx={{ minWidth: 0, gap: 0.5 }}>
          <Typography variant="h2" component="p" sx={{ overflowWrap: 'anywhere' }}>
            {stepName}
          </Typography>
          {meta}
        </Stack>
      </Stack>
      <Box aria-hidden sx={{ display: 'grid', gridTemplateColumns: BEAT_COLUMNS, gap: 0.5 }}>
        {beats}
      </Box>
    </Stack>
  );
};
