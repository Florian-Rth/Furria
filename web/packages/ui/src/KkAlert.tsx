import Alert from '@mui/material/Alert';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';

type KkAlertSeverity = 'error' | 'warning' | 'success' | 'info';

interface KkAlertProps extends PropsWithChildren {
  severity?: KkAlertSeverity;
  sx?: KkSx;
}

export const KkAlert: FC<KkAlertProps> = ({ severity = 'error', sx, children }) => (
  <Alert severity={severity} role="alert" data-kk-alert sx={sx}>
    {children}
  </Alert>
);
