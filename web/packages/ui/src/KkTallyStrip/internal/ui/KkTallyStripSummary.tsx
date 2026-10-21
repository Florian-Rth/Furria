import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkProgressRing } from '../../../KkProgressRing/KkProgressRing';
import type { KkProgressRingPart } from '../../../KkProgressRing/progress-ring';
import { stepFigures, stepLabel } from '../../../KkStatePill/state-paint';

interface KkTallyStripSummaryProps {
  ringLabel: string;
  value: number;
  total: number;
  caption: string;
}

export const KkTallyStripSummary: FC<KkTallyStripSummaryProps> = ({
  ringLabel,
  value,
  total,
  caption,
}) => {
  const parts: KkProgressRingPart[] = [
    { state: 'done', count: value },
    { state: 'overdue', count: total - value },
  ];
  const replay = `${value}/${total}`;

  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', gap: 1, flexShrink: { xs: 1, md: 0 }, minWidth: 0 }}
    >
      <KkProgressRing
        key={replay}
        parts={parts}
        label={ringLabel}
        value={String(value)}
        size="small"
      />
      <Box
        component="span"
        aria-hidden
        sx={{
          ...stepLabel,
          ...stepFigures,
          display: 'block',
          whiteSpace: { xs: 'normal', md: 'nowrap' },
          lineHeight: 1.2,
        }}
      >
        {caption}
      </Box>
    </Stack>
  );
};
