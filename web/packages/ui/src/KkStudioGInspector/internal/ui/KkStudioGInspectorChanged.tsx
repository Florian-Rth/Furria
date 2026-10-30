import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';

interface KkStudioGInspectorChangedProps {
  text: string;
}

export const KkStudioGInspectorChanged: FC<KkStudioGInspectorChangedProps> = ({ text }) => (
  <Stack direction="row" data-kk-studio-g-changed sx={{ alignItems: 'center', gap: 0.75 }}>
    <Box
      aria-hidden
      sx={(theme) => ({
        width: '0.5rem',
        height: '0.5rem',
        borderRadius: '50%',
        backgroundColor: (theme.vars ?? theme).palette.warning.main,
        flexShrink: 0,
      })}
    />
    <Typography variant="caption" sx={(theme) => ({ fontWeight: 700, ...goldInkOf(theme) })}>
      {text}
    </Typography>
  </Stack>
);
