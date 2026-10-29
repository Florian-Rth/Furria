import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../tokens';

interface KkStudioFNoteProps {
  text: string;
}

export const KkStudioFNote: FC<KkStudioFNoteProps> = ({ text }) => (
  <Stack
    data-kk-studio-f-note
    sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', px: 3 }}
  >
    <Typography
      sx={{
        typography: 'body2',
        textAlign: 'center',
        color: 'text.secondary',
        maxWidth: kkTokens.measure.empty,
      }}
    >
      {text}
    </Typography>
  </Stack>
);
