import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkRule } from '@furria/ui/KkRule';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { READINESS_CHECKS } from '@/features/season/schemas';
import { ACTS_HEAD, CHECK_LABELS } from '../season-c-copy';
import { CHECK_WIDTH, CHECKS_SHOWN, HEAD_HEIGHT } from '../season-c-layout';

const UPRIGHT = {
  writingMode: 'vertical-rl',
  transform: 'rotate(180deg)',
  whiteSpace: 'nowrap',
} as const;

export const SeasonCActsHead: FC = () => {
  const checkHeads = READINESS_CHECKS.map((check) => (
    <Box
      key={check}
      sx={{ width: CHECK_WIDTH, display: 'grid', justifyItems: 'center', alignItems: 'end' }}
    >
      <KkEyebrow tone="muted" sx={UPRIGHT}>
        {CHECK_LABELS[check]}
      </KkEyebrow>
    </Box>
  ));

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ height: HEAD_HEIGHT, alignItems: 'flex-end', gap: 1, minWidth: 0, pb: 0.75 }}
      >
        <KkEyebrow tone="muted" sx={{ flex: 1, minWidth: 0 }}>
          {ACTS_HEAD}
        </KkEyebrow>
        <Stack direction="row" aria-hidden sx={{ display: CHECKS_SHOWN, alignSelf: 'stretch' }}>
          {checkHeads}
        </Stack>
      </Stack>
      <KkRule weight="section" />
    </Box>
  );
};
