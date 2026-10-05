import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyErrorTitle } from '@/features/membership/apply-content';
import { ApplyFallbackMail } from './ApplyFallbackMail';

interface ApplyErrorFallbackProps {
  message: string;
  mailHref: string | null;
}

export const ApplyErrorFallback: FC<ApplyErrorFallbackProps> = ({ message, mailHref }) => (
  <Alert severity="error" data-kk-apply-error>
    <AlertTitle>{applyErrorTitle}</AlertTitle>
    <Stack sx={{ gap: 1.5, alignItems: 'flex-start' }}>
      <Typography variant="body2">{message}</Typography>
      <ApplyFallbackMail mailHref={mailHref} />
    </Stack>
  </Alert>
);
