import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { SiteFormFallback } from '../../site-form-types';
import { SiteFormFallbackMail } from './SiteFormFallbackMail';

interface SiteFormErrorProps {
  title: string;
  message: string;
  fallback: SiteFormFallback | null;
}

export const SiteFormError: FC<SiteFormErrorProps> = ({ title, message, fallback }) => (
  <Alert severity="error" data-kk-site-form-error>
    <AlertTitle>{title}</AlertTitle>
    <Stack sx={{ gap: 1.5, alignItems: 'flex-start' }}>
      <Typography variant="body2">{message}</Typography>
      <SiteFormFallbackMail fallback={fallback} />
    </Stack>
  </Alert>
);
