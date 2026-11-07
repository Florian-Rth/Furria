import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { kkTokens } from './tokens';

interface KkSsSummaryProps {
  title: string;
  meta: string;
  action: ReactNode;
}

export const KkSsSummary: FC<KkSsSummaryProps> = ({ title, meta, action }) => (
  <Stack
    direction="row"
    data-kk-ss-summary
    sx={{ alignItems: 'center', gap: 1, minWidth: 0, minHeight: kkTokens.tapTarget }}
  >
    <Stack sx={{ flex: '1 1 auto', minWidth: 0, gap: 0.125 }}>
      <Typography component="p" variant="body2" noWrap sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography
        component="p"
        variant="caption"
        noWrap
        sx={{ color: 'text.secondary', fontWeight: 700 }}
      >
        {meta}
      </Typography>
    </Stack>
    {action}
  </Stack>
);
