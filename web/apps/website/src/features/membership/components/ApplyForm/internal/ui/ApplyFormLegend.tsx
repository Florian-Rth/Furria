import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormLegend: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    component="legend"
    variant="overline"
    data-kk-apply-legend
    sx={{ ...kkTokens.eyebrow, color: 'text.secondary', p: 0 }}
  >
    {children}
  </Typography>
);
