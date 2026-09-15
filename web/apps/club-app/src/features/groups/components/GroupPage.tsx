import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupQuery } from '../api';
import { toGroupHeadline, toGroupId } from '../groups-labels';
import { GroupBody } from './GroupBody';
import { GroupHeader } from './GroupHeader';

const GROUP_ROUTE_ID = '/_app/_affiliated/groups_/$groupId';
const GROUPS_ORIGIN: KkScreenOrigin = { label: 'Gruppen', to: '/groups' };

export const GroupPage: FC = () => {
  const { groupId } = useParams({ from: GROUP_ROUTE_ID });
  const id = toGroupId(groupId);
  const group = useGroupQuery(id);
  const headline = toGroupHeadline(group.data);

  return (
    <KkScreen
      kind="detail"
      title={headline.title}
      origin={GROUPS_ORIGIN}
      header={<GroupHeader group={group.data} />}
    >
      <GroupBody groupId={id} />
    </KkScreen>
  );
};
