import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkBannerStatusLineProps {
  text: string;
}

export const KkBannerStatusLine: FC<KkBannerStatusLineProps> = ({ text }) => (
  <Typography
    variant="caption"
    sx={{
      alignSelf: 'flex-start',
      px: 1,
      py: 0.25,
      borderRadius: 1,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'background.paper',
      bgcolor: 'text.primary',
    }}
  >
    {text}
  </Typography>
);
