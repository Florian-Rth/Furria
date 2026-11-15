import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../../internal/gold-ink';
import type { KkPourStockLine } from '../../../stock-line';
import { lineToneOf } from './line-tones';

const SWATCH = '0.5rem';
const CELL = { fontWeight: 700, lineHeight: 1.3, fontVariantNumeric: 'tabular-nums' } as const;

interface KkPourStockLinesKeyProps {
  line: KkPourStockLine;
  index: number;
}

export const KkPourStockLinesKey: FC<KkPourStockLinesKeyProps> = ({ line, index }) => {
  const tone = lineToneOf(index);

  return (
    <Box component="li" data-lines-key sx={{ display: 'contents' }}>
      <Box
        component="span"
        data-line-tone={tone}
        sx={{
          width: SWATCH,
          height: SWATCH,
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          alignSelf: 'center',
        }}
      />
      <Typography variant="caption" noWrap sx={[CELL, { minWidth: 0, color: 'text.primary' }]}>
        {line.label}
      </Typography>
      <Typography
        variant="caption"
        noWrap
        sx={[CELL, { textAlign: 'right', color: 'text.secondary' }]}
      >
        {line.facts}
      </Typography>
      <Typography
        variant="caption"
        noWrap
        sx={[CELL, { color: 'text.secondary' }, line.warn ? goldInkOf : {}]}
      >
        {line.outlook}
      </Typography>
    </Box>
  );
};
