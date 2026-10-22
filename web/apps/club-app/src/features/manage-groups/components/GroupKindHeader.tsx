import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkScreenHeader } from '@furria/ui/KkScreenHeader';
import type { FC } from 'react';
import type { GroupKindEntry } from '../manage-groups-labels';
import { GROUP_KIND_SECTION_TITLE, toGroupKindUsageLine } from '../manage-groups-labels';

interface GroupKindHeaderProps {
  entry: GroupKindEntry;
}

export const GroupKindHeader: FC<GroupKindHeaderProps> = ({ entry }) => {
  const usageLine = toGroupKindUsageLine(entry.groupCount);

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{GROUP_KIND_SECTION_TITLE}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{entry.name}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <KkMeta>{usageLine}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
