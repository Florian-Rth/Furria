import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkScoreGlyph } from '../../../KkScoreGlyph/KkScoreGlyph';

interface KkScoreManualLegendProps {
  movementLabel: string;
  videoLabel: string;
}

const KEY_PAINT = {
  alignItems: 'center',
  gap: 0.5,
  typography: 'caption',
  fontWeight: 700,
  color: 'text.secondary',
} as const;

export const KkScoreManualLegend: FC<KkScoreManualLegendProps> = ({
  movementLabel,
  videoLabel,
}) => (
  <Stack
    component="li"
    direction="row"
    aria-hidden
    data-kk-score-manual-legend
    sx={{ gap: 1.5, justifyContent: 'flex-end', minWidth: 0, flexWrap: 'wrap' }}
  >
    <Stack direction="row" component="span" sx={KEY_PAINT}>
      <KkScoreGlyph kind="movement" present />
      <Box component="span">{movementLabel}</Box>
    </Stack>
    <Stack direction="row" component="span" sx={KEY_PAINT}>
      <KkScoreGlyph kind="video" present />
      <Box component="span">{videoLabel}</Box>
    </Stack>
  </Stack>
);
