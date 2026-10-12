import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useViewer } from '../logic/viewer-context';

interface KkViewerCounterProps {
  sx?: KkSx;
}

export const KkViewerCounter: FC<KkViewerCounterProps> = ({ sx }) => {
  const viewer = useViewer();
  const position = viewer.index + 1;
  const total = ` ${viewer.labels.counterJoin} ${viewer.items.length}`;

  return (
    <Typography
      variant="h3"
      component="p"
      aria-live="polite"
      data-kk-viewer-counter
      sx={[
        {
          flexShrink: 0,
          typography: { xs: 'h4', desktop: 'h3' },
          letterSpacing: '0.04em',
          lineHeight: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {position}
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {total}
      </Box>
    </Typography>
  );
};
