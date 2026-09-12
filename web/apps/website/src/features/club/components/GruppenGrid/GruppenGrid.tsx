import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { groupsChapter } from '@/features/club/groups-content';
import { usePublicGroupsSource } from './internal/logic/use-public-groups-source';
import { GruppenBody } from './internal/ui/GruppenBody';

export const GruppenGrid: FC = () => {
  const source = usePublicGroupsSource();

  return (
    <KkSection>
      <KkSection.Header {...groupsChapter} />
      <GruppenBody source={source} />
    </KkSection>
  );
};
