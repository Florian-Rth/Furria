import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { groupsChapter } from '@/features/club/groups-content';
import { usePublicGroupsSource } from './internal/logic/use-public-groups-source';
import { GroupsBody } from './internal/ui/GroupsBody';

export const GroupsGrid: FC = () => {
  const source = usePublicGroupsSource();

  return (
    <KkSection>
      <KkSection.Header {...groupsChapter} />
      <GroupsBody source={source} />
    </KkSection>
  );
};
