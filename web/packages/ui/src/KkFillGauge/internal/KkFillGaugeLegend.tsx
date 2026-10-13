import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../tokens';
import type { KkFillSwatch } from './fill-gauge-paint';
import { swatchPaint } from './fill-gauge-paint';

const SWATCH_SIZE = 10;

export interface KkFillGaugeLegendItem {
  key: string;
  label: string;
  figure: string;
  swatch: KkFillSwatch;
}

interface KkFillGaugeLegendProps {
  items: readonly KkFillGaugeLegendItem[];
}

export const KkFillGaugeLegend: FC<KkFillGaugeLegendProps> = ({ items }) => {
  const entries = items.map((item) => (
    <Stack key={item.key} component="li" sx={{ rowGap: 0.25, minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', columnGap: 0.75, minWidth: 0 }}>
        <Box
          aria-hidden
          sx={[
            {
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              flexShrink: 0,
              borderRadius: `${kkTokens.radius.bar / 2}px`,
            },
            swatchPaint(item.swatch),
          ]}
        />
        <Typography
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 800,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
          }}
        >
          {item.label}
        </Typography>
      </Stack>
      <Typography
        component="span"
        variant="h4"
        sx={{ fontVariantNumeric: 'tabular-nums', letterSpacing: kkTokens.type.tracking.display }}
      >
        {item.figure}
      </Typography>
    </Stack>
  ));

  return (
    <Stack
      component="ul"
      direction="row"
      sx={{ m: 0, p: 0, listStyle: 'none', flexWrap: 'wrap', columnGap: 2.5, rowGap: 1 }}
    >
      {entries}
    </Stack>
  );
};
