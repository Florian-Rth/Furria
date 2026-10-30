import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkFocusTopReadoutProps {
  value: string;
  meta: string;
  label: string;
}

export const KkFocusTopReadout: FC<KkFocusTopReadoutProps> = ({ value, meta, label }) => (
  <Stack
    role="timer"
    aria-label={label}
    sx={{ flex: 'none', minWidth: '4.5rem', px: 0.75, justifyContent: 'center' }}
  >
    <Typography
      component="span"
      variant="subtitle1"
      sx={{
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {meta}
    </Typography>
  </Stack>
);
