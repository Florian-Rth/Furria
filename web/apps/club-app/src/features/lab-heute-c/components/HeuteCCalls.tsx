import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CALL_LIST_LABEL, CALL_NONE, CALL_TITLE } from '../heute-c-copy';
import type { HeuteCState } from '../hooks/use-heute-c';
import { HeuteCCallLine } from './HeuteCCallLine';
import { HeuteCCallTick } from './HeuteCCallTick';

interface HeuteCCallsProps {
  heute: HeuteCState;
}

export const HeuteCCalls: FC<HeuteCCallsProps> = ({ heute }) => {
  const rows = heute.calls.map((call) =>
    heute.canDirect ? (
      <HeuteCCallTick key={call.key} call={call} />
    ) : (
      <HeuteCCallLine key={call.key} call={call} />
    ),
  );
  const none = heute.calls.length === 0 ? <KkMeta>{CALL_NONE}</KkMeta> : null;

  return (
    <Stack
      component="aside"
      aria-label={CALL_TITLE}
      sx={{ minHeight: 0, height: '100%', gap: 0.5 }}
    >
      <KkLaneInspector.Section text={CALL_TITLE} />
      {none}
      <Box
        component="ul"
        aria-label={CALL_LIST_LABEL}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          display: 'grid',
          alignContent: 'start',
          gap: 0.25,
          m: 0,
          p: 0,
          listStyle: 'none',
        }}
      >
        {rows}
      </Box>
    </Stack>
  );
};
