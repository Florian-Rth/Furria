import type { FC } from 'react';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import type { PublicSource } from '@/lib/public-resource/public-source';
import { GroupsEmpty } from './GroupsEmpty';
import { GroupsError } from './GroupsError';
import { GroupsGallery } from './GroupsGallery';
import { GroupsLoading } from './GroupsLoading';

interface GroupsBodyProps {
  source: PublicSource<PublicGroup[]>;
}

export const GroupsBody: FC<GroupsBodyProps> = ({ source }) => {
  if (source.status === 'loading') {
    return <GroupsLoading />;
  }

  if (source.status === 'error') {
    return <GroupsError onRetry={source.retry} />;
  }

  if (source.data.length === 0) {
    return <GroupsEmpty />;
  }

  return <GroupsGallery groups={source.data} />;
};
