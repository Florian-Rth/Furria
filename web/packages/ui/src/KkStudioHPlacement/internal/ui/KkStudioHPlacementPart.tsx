import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHPlacementPartProps {
  start: number;
  end: number;
  name: string;
}

export const KkStudioHPlacementPart: FC<KkStudioHPlacementPartProps> = ({ start, end, name }) => (
  <Box
    aria-hidden
    style={{ left: `${start * PERCENT}%`, width: `${(end - start) * PERCENT}%` }}
    sx={(theme) => ({
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderLeft: `1px dashed ${palette(theme).divider}`,
      pointerEvents: 'none',
    })}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{
        position: 'absolute',
        left: '0.25rem',
        bottom: 0,
        lineHeight: 1.2,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 'calc(100% - 0.5rem)',
        color: 'text.secondary',
      }}
    >
      {name}
    </Typography>
  </Box>
);
