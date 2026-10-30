import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioIStageLegendProps {
  before: string;
  after: string;
}

export const KkStudioIStageLegend: FC<KkStudioIStageLegendProps> = ({ before, after }) => (
  <Stack
    direction="row"
    aria-hidden
    data-kk-studio-i-legend
    sx={(theme) => ({
      position: 'absolute',
      left: '0.5rem',
      bottom: '0.375rem',
      zIndex: 1,
      alignItems: 'center',
      gap: 1,
      px: 0.75,
      py: 0.25,
      borderRadius: '0.375rem',
      pointerEvents: 'none',
      '@container (max-width: 20rem)': { display: 'none' },
      backgroundColor: `color-mix(in srgb, ${palette(theme).background.paper} 82%, transparent)`,
    })}
  >
    <Box
      sx={(theme) => ({
        width: '0.625rem',
        height: '0.625rem',
        borderRadius: '50%',
        border: `1.5px solid ${palette(theme).text.disabled}`,
      })}
    />
    <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700, color: 'text.secondary' }}>
      {before}
    </Typography>
    <Box
      sx={(theme) => ({
        width: '0.625rem',
        height: '0.625rem',
        borderRadius: '50%',
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 0 0 1.5px ${palette(theme).text.primary}`,
      })}
    />
    <Typography variant="caption" sx={{ lineHeight: 1, fontWeight: 700, color: 'text.secondary' }}>
      {after}
    </Typography>
  </Stack>
);
