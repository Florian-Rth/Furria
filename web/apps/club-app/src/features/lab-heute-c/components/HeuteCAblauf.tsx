import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkStatePill } from '@furria/ui/KkStatePill';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ABLAUF_TITLE } from '../heute-c-copy';
import { ENTRY_STATES } from '../heute-c-layout';
import { useFollowCurrent } from '../hooks/use-follow-current';
import type { HeuteCEntry } from '../hooks/use-heute-c';

interface HeuteCAblaufProps {
  entries: readonly HeuteCEntry[];
  currentIndex: number | null;
}

export const HeuteCAblauf: FC<HeuteCAblaufProps> = ({ entries, currentIndex }) => {
  const listRef = useFollowCurrent(currentIndex);
  const items = entries.map((entry) => {
    const current = entry.state === 'current' ? 'step' : undefined;

    return (
      <Box component="li" key={entry.key} aria-current={current} sx={{ minWidth: 0 }}>
        <KkStatePill state={ENTRY_STATES[entry.state]} label={entry.text} sx={{ ml: 0 }} />
      </Box>
    );
  });

  return (
    <Stack
      component="nav"
      aria-label={ABLAUF_TITLE}
      sx={{ minHeight: 0, height: '100%', gap: 0.5 }}
    >
      <KkLaneInspector.Section text={ABLAUF_TITLE} />
      <Box
        component="ol"
        ref={listRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'grid',
          alignContent: 'start',
          gap: 0.5,
          m: 0,
          p: 0,
          listStyle: 'none',
        }}
      >
        {items}
      </Box>
    </Stack>
  );
};
