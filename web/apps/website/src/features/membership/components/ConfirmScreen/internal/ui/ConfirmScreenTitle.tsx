import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface ConfirmScreenTitleProps {
  eyebrow: string;
  headline: string;
}

export const ConfirmScreenTitle: FC<ConfirmScreenTitleProps> = ({ eyebrow, headline }) => (
  <Stack sx={{ gap: 1 }}>
    <KkEyebrow>{eyebrow}</KkEyebrow>
    <Typography variant="h1" component="h1" sx={{ textTransform: 'uppercase' }}>
      {headline}
    </Typography>
  </Stack>
);
