import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const PERCENT = 100;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIWaveSeamProps {
  share: number;
  label: string;
}

export const KkStudioIWaveSeam: FC<KkStudioIWaveSeamProps> = ({ share, label }) => (
  <Box
    aria-hidden
    data-kk-studio-i-seam
    style={{ left: `${share * PERCENT}%` }}
    sx={{ position: 'absolute', top: 0, bottom: 0, width: 0, pointerEvents: 'none' }}
  >
    <Box
      sx={(theme) => ({
        position: 'absolute',
        top: '1.25rem',
        bottom: '0.75rem',
        left: 0,
        borderLeft: `1px dashed ${palette(theme).text.secondary}`,
      })}
    />
    <Typography
      component="span"
      variant="caption"
      sx={{
        position: 'absolute',
        top: '0.25rem',
        left: '0.25rem',
        lineHeight: 1,
        fontWeight: 700,
        whiteSpace: 'nowrap',
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
  </Box>
);
