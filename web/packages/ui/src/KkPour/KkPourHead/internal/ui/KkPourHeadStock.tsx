import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from '../../../../internal/gold-ink';
import { kkTokens } from '../../../../tokens';
import { KkPourStateGlyph } from '../../../KkPourStateGlyph';
import { headCellPaint } from './head-cell-paint';

interface KkPourHeadStockProps {
  label: string;
  value: string;
  unit: string;
  caption: string;
  warn: boolean;
  spark: ReactNode;
}

export const KkPourHeadStock: FC<KkPourHeadStockProps> = ({
  label,
  value,
  unit,
  caption,
  warn,
  spark,
}) => {
  const warnGlyph = warn ? <KkPourStateGlyph state="overdue" /> : null;

  return (
    <Box data-kk-pour-head-stock sx={[headCellPaint, { flex: 1 }]}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 1, sm: 1.5 },
          flex: 1,
          minWidth: 0,
        }}
      >
        <Stack sx={{ minWidth: 0, gap: 0.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: kkTokens.eyebrow.fontWeight,
              letterSpacing: kkTokens.type.tracking.label,
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {label}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75 }}>
            <Typography
              variant="h2"
              component="span"
              sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
            >
              {value}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {unit}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
            {warnGlyph}
            <Typography
              variant="caption"
              noWrap
              sx={[{ fontWeight: 700, color: 'text.secondary' }, warn ? goldInkOf : {}]}
            >
              {caption}
            </Typography>
          </Stack>
        </Stack>
        <Stack sx={{ flex: 1, minWidth: 0, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
          {spark}
        </Stack>
      </Stack>
    </Box>
  );
};
