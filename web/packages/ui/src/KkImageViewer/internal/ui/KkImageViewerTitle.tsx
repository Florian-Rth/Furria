import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkImageViewerTitleProps {
  title: string | undefined;
}

export const KkImageViewerTitle: FC<KkImageViewerTitleProps> = ({ title }) => (
  <Typography
    variant="h3"
    component="h2"
    sx={{
      minWidth: 0,
      typography: { xs: 'h3', desktop: 'h2' },
      lineHeight: 1.05,
      overflowWrap: 'anywhere',
    }}
  >
    {title}
  </Typography>
);
