import { KkMeta } from '@furria/ui';
import type { FC } from 'react';
import { GroupCardBody } from '@/features/groups';
import type { RoleMasterEntry } from '../manage-roles-labels';
import {
  ROLE_SECTION_TITLES,
  toHolderUnitLabel,
  toNoDescriptionLine,
} from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

const FULL_HEIGHT = { height: '100%' } as const;

interface RoleCardProps {
  entry: RoleMasterEntry;
  onSelect: () => void;
}

export const RoleCard: FC<RoleCardProps> = ({ entry, onSelect }) => {
  const holderLine = entry.meta === null ? undefined : <KkMeta>{entry.meta}</KkMeta>;
  const unitLabel = toHolderUnitLabel(entry.holderCount);
  const emptyDescription = toNoDescriptionLine(entry.name);
  const chips = <RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />;

  return (
    <GroupCardBody
      name={entry.name}
      count={entry.holderCount}
      unitLabel={unitLabel}
      description={entry.description}
      emptyDescription={emptyDescription}
      initials={entry.holderInitials}
      total={entry.holderCount}
      footNote={ROLE_SECTION_TITLES.holders}
      chips={chips}
      footer={holderLine}
      dimmed={entry.isArchived}
      onSelect={onSelect}
      sx={FULL_HEIGHT}
    />
  );
};
