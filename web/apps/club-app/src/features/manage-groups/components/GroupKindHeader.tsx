import { KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
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
