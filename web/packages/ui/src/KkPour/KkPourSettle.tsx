import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkPourStateGlyph } from './KkPourStateGlyph';

const TIME_COLUMN = '2.75rem';

interface KkPourSettleProps {
  time: string;
  text: string;
  amount: string;
  sx?: KkSx;
}

export const KkPourSettle: FC<KkPourSettleProps> = ({ time, text, amount, sx }) => (
  <Stack
    direction="row"
    data-kk-pour-settle
    sx={[
      {
        alignItems: 'center',
        gap: 1,
        minHeight: '2rem',
        px: 1,
        opacity: kkTokens.opacity.dimmed,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      variant="caption"
      sx={{
        width: TIME_COLUMN,
        flexShrink: 0,
        color: 'text.secondary',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {time}
    </Typography>
    <KkPourStateGlyph state="paid" />
    <Typography variant="caption" noWrap sx={{ flex: 1, minWidth: 0, color: 'text.secondary' }}>
      {text}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        flexShrink: 0,
        fontWeight: 700,
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {amount}
    </Typography>
  </Stack>
);
