import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { ManagedGroupSummary } from '../schemas';
import { ManagedGroupRow } from './ManagedGroupRow';

const NO_MATCH_TITLE = 'KEINE GRUPPE PASST';
const NO_MATCH_DESCRIPTION = 'Anderer Suchbegriff oder ein anderer Filter bringt sie zurück.';
const NO_GROUPS_TITLE = 'NOCH KEINE GRUPPE';
const NO_GROUPS_DESCRIPTION =
  'Leg die erste Gruppe an. Danach kannst du Personen dazu eintragen und Gruppen-Admins ernennen.';

interface ManagedGroupsListProps {
  groups: readonly ManagedGroupSummary[];
  selectedId: number | null;
  onSelect: (groupId: number) => void;
  isFiltered: boolean;
}

export const ManagedGroupsList: FC<ManagedGroupsListProps> = ({
  groups,
  selectedId,
  onSelect,
  isFiltered,
}) => {
  if (groups.length === 0) {
    const title = isFiltered ? NO_MATCH_TITLE : NO_GROUPS_TITLE;
    const description = isFiltered ? NO_MATCH_DESCRIPTION : NO_GROUPS_DESCRIPTION;

    return (
      <KkPanel variant="block">
        <KkEmptyState icon="group" title={title} description={description} />
      </KkPanel>
    );
  }

  return (
    <KkPanel variant="list">
      {groups.map((group) => (
        <ManagedGroupRow
          key={group.groupId}
          group={group}
          selected={group.groupId === selectedId}
          onSelect={onSelect}
        />
      ))}
    </KkPanel>
  );
};
