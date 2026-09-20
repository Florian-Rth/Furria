import { KkChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StateChip } from '@/lib/state-chips';
import { ARCHIVED_CHIP } from '@/lib/state-chips';

const UNUSED_CHIP: StateChip = { label: 'noch keiner Gruppe', tone: 'gold', dot: false };

interface GroupKindChipsProps {
  isArchived: boolean;
  isUnused: boolean;
}

export const GroupKindChips: FC<GroupKindChipsProps> = ({ isArchived, isUnused }) => {
  const chips: StateChip[] = [];

  if (isArchived) {
    chips.push(ARCHIVED_CHIP);
  }
  if (isUnused && !isArchived) {
    chips.push(UNUSED_CHIP);
  }
  if (chips.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', minWidth: 0, flexShrink: 0 }}>
      {chips.map((chip) => (
        <KkChip key={chip.label} tone={chip.tone} dot={chip.dot} size="small">
          {chip.label}
        </KkChip>
      ))}
    </Stack>
  );
};
