import type { SxProps, Theme } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

interface KkStatRowValueProps extends PropsWithChildren {
  variant: TypographyProps['variant'];
  sx?: SxProps<Theme>;
}

export const KkStatRowValue: FC<KkStatRowValueProps> = ({ variant, sx, children }) => (
  <Typography
    variant={variant}
    component="span"
    data-kk-stat-row-value
    sx={[{ lineHeight: 1 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Typography>
);
