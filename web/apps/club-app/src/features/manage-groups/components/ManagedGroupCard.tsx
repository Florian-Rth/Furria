import { KkChip, KkHeading, KkMeta, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toGroupCountLine, toManagedGroupChips } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

interface ManagedGroupCardProps {
  group: ManagedGroupSummary;
  onSelect: (groupId: number) => void;
}

export const ManagedGroupCard: FC<ManagedGroupCardProps> = ({ group, onSelect }) => {
  const chips = toManagedGroupChips(group);
  const isArchived = group.archivedOn !== null;
  const countLine = toGroupCountLine(group);

  const select = (): void => {
    onSelect(group.groupId);
  };

  const statusChip =
    chips.status === null ? null : (
      <KkChip tone={chips.status.tone} dot={chips.status.dot} size="small">
        {chips.status.label}
      </KkChip>
    );

  return (
    <KkPanel variant="block" dimmed={isArchived} onClick={select} sx={{ height: '100%' }}>
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkHeading level={3}>{group.name}</KkHeading>
        <KkMeta>{countLine}</KkMeta>
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', minWidth: 0, pt: 0.25 }}>
          {statusChip}
          <KkChip tone={chips.openness.tone} dot={chips.openness.dot} size="small">
            {chips.openness.label}
          </KkChip>
        </Stack>
      </Stack>
    </KkPanel>
  );
};
