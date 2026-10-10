import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

export type KkNewsDateSpacing = 'set' | 'tracked';

interface KkNewsDateLook {
  fontWeight: number;
  color: string;
  letterSpacing?: string;
}

const SPACINGS: Record<KkNewsDateSpacing, KkNewsDateLook> = {
  set: { fontWeight: 700, color: 'text.secondary' },
  tracked: { fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' },
};

interface KkNewsDateProps {
  date: string;
  spacing: KkNewsDateSpacing;
  sx?: SxProps<Theme>;
}

export const KkNewsDate: FC<KkNewsDateProps> = ({ date, spacing, sx }) => (
  <Typography variant="caption" sx={[SPACINGS[spacing], ...(Array.isArray(sx) ? sx : [sx])]}>
    {date}
  </Typography>
);
