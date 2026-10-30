import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioIWaveEdgeProps {
  side: 'start' | 'end';
  text: string;
}

export const KkStudioIWaveEdge: FC<KkStudioIWaveEdgeProps> = ({ side, text }) => (
  <Typography
    component="span"
    variant="caption"
    aria-hidden
    sx={{
      position: 'absolute',
      top: '0.25rem',
      ...(side === 'start' ? { left: 0 } : { right: 0 }),
      maxWidth: '30%',
      lineHeight: 1,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      color: 'text.disabled',
      pointerEvents: 'none',
    }}
  >
    {text}
  </Typography>
);
