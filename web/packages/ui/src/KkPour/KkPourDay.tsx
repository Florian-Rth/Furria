import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

interface KkPourDayProps {
  label: string;
  facts: string;
  sx?: KkSx;
}

export const KkPourDay: FC<KkPourDayProps> = ({ label, facts, sx }) => (
  <Stack
    direction="row"
    data-kk-pour-day
    sx={[
      {
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 1,
        pt: 1.5,
        pb: 0.5,
        borderBottomWidth: kkTokens.line.hair,
        borderBottomStyle: 'solid',
        borderColor: 'divider',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component="h3"
      variant="caption"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.type.tracking.section,
        textTransform: 'uppercase',
        color: 'text.primary',
      }}
    >
      {label}
    </Typography>
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {facts}
    </Typography>
  </Stack>
);
