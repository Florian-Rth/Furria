import { KkChip } from '@furria/ui/KkChip';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CallRow } from '../hooks/use-heute-a';

interface HeuteCallRowProps {
  row: CallRow;
}

export const HeuteCallRow: FC<HeuteCallRowProps> = ({ row }) => {
  const chips = row.people.map((call) => (
    <Stack component="li" key={call.key} direction="row">
      <KkChip tone={call.tone} size="small">
        {call.text}
      </KkChip>
    </Stack>
  ));

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <KkMeta lines={1}>{row.head}</KkMeta>
      <Stack
        component="ul"
        direction="row"
        aria-label={row.head}
        sx={{ flexWrap: 'wrap', gap: 0.5, m: 0, p: 0, listStyle: 'none', minWidth: 0 }}
      >
        {chips}
      </Stack>
    </Stack>
  );
};
