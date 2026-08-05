import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  applyErrorTitle,
  applyFallbackLabel,
  applyFallbackLead,
} from '@/features/membership/apply-content';

interface ApplyErrorFallbackProps {
  message: string;
  mailHref: string;
}

export const ApplyErrorFallback: FC<ApplyErrorFallbackProps> = ({ message, mailHref }) => (
  <Alert severity="error" data-kk-apply-error>
    <AlertTitle>{applyErrorTitle}</AlertTitle>
    <Stack sx={{ gap: 1.5, alignItems: 'flex-start' }}>
      <Typography variant="body2">{message}</Typography>
      <Typography variant="body2">{applyFallbackLead}</Typography>
      <Button href={mailHref} variant="outlined" color="inherit" size="small">
        {applyFallbackLabel}
      </Button>
    </Stack>
  </Alert>
);
