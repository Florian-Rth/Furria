import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkFlapCount } from './KkFlapCount';
import type { KkSx } from './kk-sx';

interface KkFrameFactsProps {
  time: string;
  facts: string;
  sx?: KkSx;
}

export const KkFrameFacts: FC<KkFrameFactsProps> = ({ time, facts, sx }) => (
  <Stack
    direction="row"
    sx={[
      { alignItems: 'baseline', columnGap: 1.25, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkFlapCount value={time} variant="h2" tone="gold" />
    <Typography
      component="p"
      sx={(theme) => ({
        ...theme.typography.caption,
        fontWeight: 700,
        color: 'text.secondary',
        minWidth: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      })}
    >
      {facts}
    </Typography>
  </Stack>
);
