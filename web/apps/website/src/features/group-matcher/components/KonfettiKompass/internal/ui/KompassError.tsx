import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kompassLabels, kompassMailHref } from '@/features/group-matcher/kompass-content';

interface KompassErrorProps {
  onRetry: () => void;
}

export const KompassError: FC<KompassErrorProps> = ({ onRetry }) => (
  <Stack role="alert" sx={{ gap: 2 }}>
    <Typography variant="h5" component="p">
      {kompassLabels.errorTitle}
    </Typography>
    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
      {kompassLabels.errorText}
    </Typography>
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', pt: 1 }}>
      <Button variant="contained" color="primary" onClick={onRetry}>
        {kompassLabels.errorRetry}
      </Button>
      <Button variant="outlined" href={kompassMailHref}>
        {kompassLabels.errorMail}
      </Button>
    </Stack>
  </Stack>
);
