import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../../internal/gold-ink';

interface KkPourStockRunwayReadoutProps {
  value: string;
  unit: string;
  warn: boolean;
}

export const KkPourStockRunwayReadout: FC<KkPourStockRunwayReadoutProps> = ({
  value,
  unit,
  warn,
}) => (
  <Stack data-runway-readout sx={{ minWidth: 0, flexShrink: 0, gap: 0.25 }}>
    <Typography
      variant="h3"
      component="span"
      sx={[{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }, warn ? goldInkOf : {}]}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      noWrap
      sx={{ fontWeight: 700, color: 'text.secondary', lineHeight: 1.2 }}
    >
      {unit}
    </Typography>
  </Stack>
);
