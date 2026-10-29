import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { trackEdgeOf } from '../KkShell/internal/track-edge';
import { kkTokens } from '../tokens';

interface KkStudioFClosedProps {
  name: string;
  line: string;
}

export const KkStudioFClosed: FC<KkStudioFClosedProps> = ({ name, line }) => (
  <Stack
    data-kk-studio-f-closed
    sx={{
      height: `calc(100dvh - ${trackEdgeOf('top')} - ${trackEdgeOf('bottom')})`,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: 1.5,
      px: 2,
    }}
  >
    <Typography component="h1" sx={{ typography: 'display', textWrap: 'balance' }}>
      {name}
    </Typography>
    <Typography
      sx={{ typography: 'body2', color: 'text.secondary', maxWidth: kkTokens.measure.empty }}
    >
      {line}
    </Typography>
  </Stack>
);
