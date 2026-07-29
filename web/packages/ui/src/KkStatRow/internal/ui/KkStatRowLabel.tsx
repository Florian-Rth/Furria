import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface KkStatRowLabelProps extends PropsWithChildren {
  sx?: SxProps<Theme>;
}

export const KkStatRowLabel: FC<KkStatRowLabelProps> = ({ sx, children }) => (
  <Typography
    variant="caption"
    data-kk-stat-row-label
    sx={[{ color: 'text.secondary', fontWeight: 600 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Typography>
);
