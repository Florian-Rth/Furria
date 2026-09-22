import { KkChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupRegisterFlag } from '../manage-groups-labels';

const ROW = { gap: 0.625, flexWrap: 'wrap', alignItems: 'center', minWidth: 0 } as const;

interface GroupRegisterFlagsProps {
  flags: readonly GroupRegisterFlag[];
}

export const GroupRegisterFlags: FC<GroupRegisterFlagsProps> = ({ flags }) => {
  if (flags.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" sx={ROW}>
      {flags.map((flag) => (
        <KkChip key={flag.id} tone={flag.tone} dot={flag.dot} size="small">
          {flag.label}
        </KkChip>
      ))}
    </Stack>
  );
};
