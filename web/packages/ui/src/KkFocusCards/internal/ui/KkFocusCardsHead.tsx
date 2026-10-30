import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkFocusCardsHeadProps {
  number: number;
  name: string;
  meta: string;
}

export const KkFocusCardsHead: FC<KkFocusCardsHeadProps> = ({ number, name, meta }) => (
  <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
    <Typography
      component="span"
      variant="h4"
      sx={{ flex: 'none', color: 'primary.main', fontVariantNumeric: 'tabular-nums' }}
    >
      {number}
    </Typography>
    <Typography
      component="h2"
      variant="h4"
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={{
        flex: 'none',
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
        fontFamily: kkTokens.font.body,
      }}
    >
      {meta}
    </Typography>
  </Stack>
);
