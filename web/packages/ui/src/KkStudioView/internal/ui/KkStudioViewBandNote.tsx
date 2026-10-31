import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { tonePaint } from '../../../internal/tone';
import { KkIcon } from '../../../KkIcon';

interface KkStudioViewBandNoteProps {
  text: string;
}

export const KkStudioViewBandNote: FC<KkStudioViewBandNoteProps> = ({ text }) => (
  <Stack
    direction="row"
    role="status"
    sx={(theme) => ({
      ...tonePaint(theme, 'gold'),
      alignItems: 'center',
      gap: 1,
      minWidth: 0,
      px: 1.5,
      py: 0.75,
      borderRadius: 1,
    })}
  >
    <KkIcon name="calendar" />
    <Typography variant="body2" sx={{ minWidth: 0 }}>
      {text}
    </Typography>
  </Stack>
);
