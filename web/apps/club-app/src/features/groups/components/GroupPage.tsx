import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { useGroupQuery } from '../api';
import { toGroupId } from '../groups-labels';
import { GroupBody } from './GroupBody';
import { GroupHeader } from './GroupHeader';

const GROUP_ROUTE_ID = '/_app/_affiliated/groups_/$groupId';

export const GroupPage: FC = () => {
  const { groupId } = useParams({ from: GROUP_ROUTE_ID });
  const id = toGroupId(groupId);
  const group = useGroupQuery(id);

  return (
    <>
      <AppPageHeader>
        <GroupHeader group={group.data} />
      </AppPageHeader>
      <GroupBody groupId={id} />
    </>
  );
};
