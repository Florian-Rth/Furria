import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CALL_NONE, CALL_TITLE } from '../heute-a-copy';
import type { HeuteA } from '../hooks/use-heute-a';
import { HeuteCallRow } from './HeuteCallRow';

interface HeuteCallListProps {
  heute: HeuteA;
}

export const HeuteCallList: FC<HeuteCallListProps> = ({ heute }) => {
  const rows = heute.calls.map((row) => <HeuteCallRow key={row.key} row={row} />);
  const body = rows.length === 0 ? <KkMeta>{CALL_NONE}</KkMeta> : rows;

  return (
    <Stack
      component="section"
      aria-label={CALL_TITLE}
      sx={{ flex: 1, gap: 0.75, minHeight: 0, minWidth: 0 }}
    >
      <KkEyebrow>{CALL_TITLE}</KkEyebrow>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
        <Stack sx={{ gap: 1, minWidth: 0 }}>{body}</Stack>
      </Box>
    </Stack>
  );
};
