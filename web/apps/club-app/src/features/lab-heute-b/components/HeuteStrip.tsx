import type { KkChipTone } from '@furria/ui/KkChip';
import { KkChip } from '@furria/ui/KkChip';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { STRIP_LABEL } from '../heute-b-copy';
import type { StripChip, StripChipState } from '../heute-board';
import { useStripFollow } from '../hooks/use-strip-follow';

interface HeuteStripProps {
  chips: readonly StripChip[];
  focusId: number | null;
}

const TONES: Record<StripChipState, KkChipTone> = {
  done: 'neutral',
  now: 'accent',
  next: 'gold',
  later: 'ink',
};

export const HeuteStrip: FC<HeuteStripProps> = ({ chips, focusId }) => {
  const ref = useStripFollow(focusId);
  const items = chips.map((chip) => {
    const done = chip.state === 'done';
    const name = done ? <KkVisuallyHidden>{chip.name}</KkVisuallyHidden> : chip.name;
    const now = chip.state === 'now';
    const current = now ? 'step' : undefined;
    const tone = TONES[chip.state];

    return (
      <Box
        component="li"
        key={chip.appearanceId}
        data-heute-chip={chip.appearanceId}
        aria-current={current}
        sx={{ flexShrink: 0 }}
      >
        <KkChip tone={tone} live={now} dot={now}>
          {chip.number} {name}
        </KkChip>
      </Box>
    );
  });

  return (
    <Stack
      ref={ref}
      component="ol"
      direction="row"
      aria-label={STRIP_LABEL}
      sx={{
        position: 'relative',
        m: 0,
        p: 0,
        py: 0.5,
        gap: 0.75,
        listStyle: 'none',
        overflowX: 'auto',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'none',
        alignItems: 'center',
      }}
    >
      {items}
    </Stack>
  );
};
