import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioALensEdgeProps {
  x: number;
  label: string;
}

export const KkStudioALensEdge: FC<KkStudioALensEdgeProps> = ({ x, label }) => (
  <Box
    data-kk-studio-a-lens-edge
    style={{ left: `${x}px` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 0,
      borderLeft: `2px solid ${(theme.vars ?? theme).palette.text.secondary}`,
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={(theme) => ({
        position: 'absolute',
        left: '0.125rem',
        top: '0.0625rem',
        maxWidth: '9rem',
        fontWeight: 800,
        lineHeight: 1,
        color: 'text.secondary',
        px: 0.5,
        py: 0.25,
        borderRadius: '4px',
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        zIndex: 1,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      })}
    >
      {label}
    </Typography>
  </Box>
);
