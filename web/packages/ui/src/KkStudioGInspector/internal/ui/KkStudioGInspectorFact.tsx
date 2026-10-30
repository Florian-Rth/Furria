import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';

export type KkStudioGFactTone = 'plain' | 'attention' | 'quiet';

interface KkStudioGInspectorFactProps {
  label: string;
  value: string;
  tone?: KkStudioGFactTone;
}

export const KkStudioGInspectorFact: FC<KkStudioGInspectorFactProps> = ({
  label,
  value,
  tone = 'plain',
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      component="dt"
      variant="caption"
      noWrap
      sx={{ display: 'block', lineHeight: 1.2, color: 'text.secondary', fontWeight: 600 }}
    >
      {label}
    </Typography>
    <Typography
      component="dd"
      variant="body2"
      noWrap
      sx={(theme) => ({
        m: 0,
        lineHeight: 1.3,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        ...(tone === 'attention' ? goldInkOf(theme) : {}),
        ...(tone === 'quiet' ? { color: (theme.vars ?? theme).palette.text.disabled } : {}),
      })}
    >
      {value}
    </Typography>
  </Box>
);
