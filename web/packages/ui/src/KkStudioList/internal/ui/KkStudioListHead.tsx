import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioListHeadProps {
  text: string;
  aside: string | null;
}

export const KkStudioListHead: FC<KkStudioListHeadProps> = ({ text, aside }) => (
  <Stack
    direction="row"
    sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1, px: 1, pt: 0.75 }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1.2,
        color: 'text.secondary',
      }}
    >
      {text}
    </Typography>
    <Typography
      variant="caption"
      sx={{ fontWeight: 700, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {aside}
    </Typography>
  </Stack>
);
