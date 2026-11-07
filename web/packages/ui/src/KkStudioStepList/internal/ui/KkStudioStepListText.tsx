import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioStepListTextProps {
  title: string;
  meta: string;
}

export const KkStudioStepListText: FC<KkStudioStepListTextProps> = ({ title, meta }) => (
  <Stack sx={{ flex: '1 1 auto', minWidth: 0 }}>
    <Typography component="span" variant="body2" noWrap sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {meta}
    </Typography>
  </Stack>
);
