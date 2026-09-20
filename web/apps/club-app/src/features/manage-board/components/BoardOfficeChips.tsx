import { KkChip } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StateChip } from '@/lib/state-chips';
import { ARCHIVED_CHIP, UNHELD_CHIP } from '@/lib/state-chips';

interface BoardOfficeChipsProps {
  isArchived: boolean;
  isVacant: boolean;
}

export const BoardOfficeChips: FC<BoardOfficeChipsProps> = ({ isArchived, isVacant }) => {
  const chips: StateChip[] = [];

  if (isArchived) {
    chips.push(ARCHIVED_CHIP);
  }
  if (isVacant && !isArchived) {
    chips.push(UNHELD_CHIP);
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
