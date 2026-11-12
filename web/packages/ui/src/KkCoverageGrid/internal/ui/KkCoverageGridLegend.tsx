import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkStateMark } from '../../../KkStatePill/KkStateMark';
import type { KkStepState } from '../../../KkStatePill/step-state';
import type { KkSx } from '../../../kk-sx';

export interface KkCoverageGridLegendEntry {
  state: KkStepState;
  label: string;
}

interface KkCoverageGridLegendProps {
  entries: readonly KkCoverageGridLegendEntry[];
  sx?: KkSx;
}

export const KkCoverageGridLegend: FC<KkCoverageGridLegendProps> = ({ entries, sx }) => {
  const items = entries.map((entry) => (
    <Stack
      key={entry.state}
      component="li"
      direction="row"
      sx={{ alignItems: 'center', gap: 0.75 }}
    >
      <KkStateMark state={entry.state} />
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {entry.label}
      </Box>
    </Stack>
  ));

  return (
    <Stack
      component="ul"
      direction="row"
      sx={[
        { m: 0, p: 0, listStyle: 'none', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {items}
    </Stack>
  );
};
