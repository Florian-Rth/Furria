import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkPressRulerLegendEntry } from '../../press-ruler-data';
import { GUTTER_START } from '../logic/ruler-metrics';
import { KkPressRulerGlyph } from './KkPressRulerGlyph';

interface KkPressRulerLegendProps {
  entries: readonly KkPressRulerLegendEntry[];
}

export const KkPressRulerLegend: FC<KkPressRulerLegendProps> = ({ entries }) => {
  const items = entries.map((entry) => (
    <Stack
      key={entry.state}
      direction="row"
      component="li"
      sx={{ alignItems: 'center', gap: 0.625, whiteSpace: 'nowrap' }}
    >
      <KkPressRulerGlyph state={entry.state} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        <Typography
          component="strong"
          variant="caption"
          sx={{ color: 'text.primary', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {entry.count}
        </Typography>{' '}
        {entry.label}
      </Typography>
    </Stack>
  ));

  return (
    <Stack
      direction="row"
      component="ul"
      sx={(theme) => ({
        flexWrap: 'wrap',
        columnGap: 1.5,
        rowGap: 0.5,
        m: 0,
        p: 0,
        pl: theme.spacing(GUTTER_START),
        listStyle: 'none',
      })}
    >
      {items}
    </Stack>
  );
};
