import type { FC } from 'react';
import type { PublicGroupsSource } from '../logic/use-public-groups-source';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsError } from './GroupsError';
import { GroupsGallery } from './GroupsGallery';
import { GroupsLoading } from './GroupsLoading';

interface GroupsBodyProps {
  source: PublicGroupsSource;
}

export const GroupsBody: FC<GroupsBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <GroupsLoading />;
  }

  if (source.status === 'error') {
    return <GroupsError onRetry={source.retry} />;
  }

  if (source.groups.length === 0) {
    return <GroupsEmpty />;
  }

  return <GroupsGallery groups={source.groups} />;
};
