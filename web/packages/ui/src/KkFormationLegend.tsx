import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { SCORE_FIGURES } from './KkScoreTrack/internal/score-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkFormationLegendEntry {
  key: number;
  number: number;
  caption: string | null;
  own: boolean;
  open: boolean;
}

const SIDE_LEGEND_FROM = '34rem';
const SIDE_LEGEND_WIDTH = '8rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFormationLegendProps {
  figure: ReactNode;
  entries: readonly KkFormationLegendEntry[];
  openLabel: string;
  sx?: KkSx;
}

export const KkFormationLegend: FC<KkFormationLegendProps> = ({
  figure,
  entries,
  openLabel,
  sx,
}) => {
  const sxList = Array.isArray(sx) ? sx : [sx];
  const items = entries
    .toSorted((left, right) => left.number - right.number)
    .map((entry) => (
      <Stack
        key={entry.key}
        component="li"
        direction="row"
        data-own={entry.own}
        data-open={entry.open}
        sx={(theme) => ({
          alignItems: 'baseline',
          gap: 0.5,
          minWidth: 0,
          typography: 'caption',
          fontWeight: 700,
          color: 'text.primary',
          '&[data-open="true"]': { color: 'text.secondary' },
          '&[data-own="true"]': { color: palette(theme).primary.main, fontWeight: 900 },
        })}
      >
        <Box
          component="span"
          sx={{
            fontFamily: kkTokens.font.display,
            minWidth: '1.25rem',
            textAlign: 'right',
            ...SCORE_FIGURES,
          }}
        >
          {entry.number}
        </Box>
        <Box component="span" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {entry.caption ?? openLabel}
        </Box>
      </Stack>
    ));

  return (
    <Box
      data-kk-formation-legend-root
      sx={[{ width: '100%', minWidth: 0, containerType: 'inline-size' }, ...sxList]}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1,
          alignItems: 'start',
          [`@container (min-width: ${SIDE_LEGEND_FROM})`]: {
            gridTemplateColumns: `minmax(0, 1fr) ${SIDE_LEGEND_WIDTH}`,
            '& [data-kk-formation-legend]': { gridTemplateColumns: 'minmax(0, 1fr)' },
          },
        }}
      >
        <Box sx={{ minWidth: 0 }}>{figure}</Box>
        <Box
          component="ol"
          data-kk-formation-legend
          sx={{
            listStyle: 'none',
            m: 0,
            p: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(5.5rem, 1fr))',
            columnGap: 1,
            rowGap: 0.25,
          }}
        >
          {items}
        </Box>
      </Box>
    </Box>
  );
};
