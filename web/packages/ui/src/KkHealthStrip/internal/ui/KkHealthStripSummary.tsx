import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkProgressRing } from '../../../KkProgressRing/KkProgressRing';
import type { KkProgressRingPart } from '../../../KkProgressRing/progress-ring';
import { KkStateGlyph } from '../../../KkStatePill/KkStateGlyph';
import { stepFigures, stepLabel } from '../../../KkStatePill/state-paint';
import type { KkStepState } from '../../../KkStatePill/step-state';

export interface KkHealthLegendEntry {
  state: KkStepState;
  text: string;
}

interface KkHealthStripSummaryProps {
  title: string;
  ringLabel: string;
  value: string;
  parts: readonly KkProgressRingPart[];
  legend: readonly KkHealthLegendEntry[];
}

export const KkHealthStripSummary: FC<KkHealthStripSummaryProps> = ({
  title,
  ringLabel,
  value,
  parts,
  legend,
}) => {
  const entries = legend.map((entry) => (
    <Stack
      key={entry.state}
      component="li"
      direction="row"
      sx={{ alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
    >
      <KkStateGlyph state={entry.state} />
      {entry.text}
    </Stack>
  ));

  return (
    <Stack
      direction="row"
      data-kk-health-strip-summary
      sx={{ alignItems: 'center', gap: 1.5, minWidth: 0, px: 1.5, py: 1.25, flexShrink: 0 }}
    >
      <KkProgressRing parts={parts} label={ringLabel} value={value} />
      <Stack sx={{ minWidth: 0, gap: 0.5 }}>
        <Box component="span" sx={stepLabel}>
          {title}
        </Box>
        <Stack
          component="ul"
          direction="row"
          sx={{
            ...stepFigures,
            m: 0,
            p: 0,
            listStyle: 'none',
            flexWrap: 'wrap',
            columnGap: 1.25,
            rowGap: 0.25,
            typography: 'caption',
            fontWeight: 700,
            color: 'text.secondary',
          }}
        >
          {entries}
        </Stack>
      </Stack>
    </Stack>
  );
};
