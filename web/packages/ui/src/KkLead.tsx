import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

interface KkLeadProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const KkLead: FC<KkLeadProps> = ({ sx, children }) => (
  <Typography
    variant="body1"
    data-kk-lead
    sx={[
      {
        color: 'text.secondary',
        fontWeight: 500,
        maxWidth: kkTokens.measure.lead,
        textWrap: 'pretty',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
