import type { SxProps, Theme } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

type KkStatRowValueTone = 'default' | 'accent' | 'muted';

const toneColors: Record<KkStatRowValueTone, string> = {
  default: 'text.primary',
  accent: 'primary.main',
  muted: 'text.secondary',
};

interface KkStatRowValueProps extends PropsWithChildren {
  variant: TypographyProps['variant'];
  tone?: KkStatRowValueTone;
  sx?: SxProps<Theme>;
}

export const KkStatRowValue: FC<KkStatRowValueProps> = ({
  variant,
  tone = 'default',
  sx,
  children,
}) => (
  <Typography
    variant={variant}
    component="span"
    data-kk-stat-row-value
    sx={[{ lineHeight: 1, color: toneColors[tone] }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Typography>
);
