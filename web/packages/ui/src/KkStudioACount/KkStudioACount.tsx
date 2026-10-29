import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { redInk } from '../internal/red-ink';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const POP_SECONDS = 0.16;

type CellState = 'on' | 'done' | 'rest';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const cellPaints: Record<CellState, (theme: Theme) => CSSObject> = {
  on: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
  }),
  done: (theme) => ({
    ...redInk(theme),
    backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 18%, transparent)`,
  }),
  rest: (theme) => ({
    color: palette(theme).text.disabled,
    backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
  }),
};

const cellStateOf = (cell: number, count: number | null): CellState => {
  if (count === null || cell > count) {
    return 'rest';
  }

  return cell === count ? 'on' : 'done';
};

interface KkStudioACountProps {
  count: number | null;
  countLabel: string;
  title: string;
  meta: string;
  clock?: ReactNode;
  sx?: KkSx;
}

export const KkStudioACount: FC<KkStudioACountProps> = ({
  count,
  countLabel,
  title,
  meta,
  clock,
  sx,
}) => {
  const digit = count === null ? '–' : String(count);
  const cells = COUNTS.map((cell) => {
    const state = cellStateOf(cell, count);

    return (
      <Box
        key={cell}
        data-kk-studio-a-count-cell={state}
        sx={(theme) => ({
          width: '0.9375rem',
          height: '1.25rem',
          borderRadius: '5px',
          display: 'grid',
          placeItems: 'center',
          typography: 'caption',
          fontFamily: kkTokens.font.display,
          lineHeight: 1,
          transition: 'background-color .08s, color .08s',
          ...cellPaints[state](theme),
        })}
      >
        {cell}
      </Box>
    );
  });

  return (
    <Stack
      direction="row"
      data-kk-studio-a-count
      sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box
        role="img"
        aria-label={countLabel}
        sx={{ width: '2.25rem', flexShrink: 0, display: 'grid', placeItems: 'center' }}
      >
        <Typography
          key={digit}
          component="span"
          variant="display"
          aria-hidden
          sx={(theme) => ({
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 0.9,
            ...(count === null ? { color: 'text.disabled' } : redInk(theme)),
            animation: `kk-studio-a-pop ${POP_SECONDS}s cubic-bezier(.2,.8,.2,1)`,
            '@keyframes kk-studio-a-pop': {
              from: { transform: 'scale(1.18)' },
              to: { transform: 'scale(1)' },
            },
          })}
        >
          {digit}
        </Typography>
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.75 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              flex: 1,
              minWidth: 0,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {clock}
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
          <Stack direction="row" aria-hidden sx={{ gap: '2px', flexShrink: 0 }}>
            {cells}
          </Stack>
          <Typography
            variant="caption"
            sx={{
              minWidth: 0,
              color: 'text.secondary',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2,
            }}
          >
            {meta}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
