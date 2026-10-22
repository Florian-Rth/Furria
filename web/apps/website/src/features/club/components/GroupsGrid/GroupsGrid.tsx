import { KkSection } from '@furria/ui/KkSection';
import type { FC } from 'react';
import { groupsChapter } from '@/features/club/groups-content';
import { publicGroups } from '@/lib/public-groups/api';
import { GroupsBody } from './internal/ui/GroupsBody';

export const GroupsGrid: FC = () => {
  const source = publicGroups.useSource();

  return (
    <KkSection>
      <KkSection.Header {...groupsChapter} />
      <GroupsBody source={source} />
    </KkSection>
  );
};
