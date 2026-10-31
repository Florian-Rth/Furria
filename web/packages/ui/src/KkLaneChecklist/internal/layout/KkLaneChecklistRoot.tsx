import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

interface KkLaneChecklistRootProps extends PropsWithChildren {
  title: string;
  aside: string;
}

export const KkLaneChecklistRoot: FC<KkLaneChecklistRootProps> = ({ title, aside, children }) => (
  <Stack data-kk-lane-checklist sx={{ minWidth: 0, minHeight: 0, gap: 1 }}>
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, px: 0.5 }}>
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: kkTokens.type.tracking.label,
          color: 'text.secondary',
        }}
      >
        {aside}
      </Typography>
    </Stack>
    <Box component="ol" role="list" aria-label={title} sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {children}
    </Box>
  </Stack>
);
