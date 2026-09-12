import { KkChip, KkSelectRow } from '@furria/ui';
import type { FC } from 'react';
import { toGroupCountLine, toManagedGroupRowChip } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';

interface ManagedGroupRowProps {
  group: ManagedGroupSummary;
  selected: boolean;
  onSelect: (groupId: number) => void;
}

export const ManagedGroupRow: FC<ManagedGroupRowProps> = ({ group, selected, onSelect }) => {
  const chip = toManagedGroupRowChip(group);

  const select = (): void => {
    onSelect(group.groupId);
  };

  const trailing = (
    <KkChip tone={chip.tone} dot={chip.dot} size="small">
      {chip.label}
    </KkChip>
  );

  return (
    <KkSelectRow
      title={group.name}
      meta={toGroupCountLine(group)}
      trailing={trailing}
      selected={selected}
      dimmed={group.archivedOn !== null}
      onClick={select}
    />
  );
};
