import Stack from '@mui/material/Stack';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppBackLink, AppPageHeader } from '@/features/session';
import { useGroupQuery } from '../api';
import { toGroupId } from '../groups-labels';
import { GroupBody } from './GroupBody';
import { GroupHeader } from './GroupHeader';

const GROUP_ROUTE_ID = '/_app/_affiliated/groups_/$groupId';
const BACK_LABEL = 'Gruppen';
const GROUPS_PATH = '/groups';

export const GroupPage: FC = () => {
  const { groupId } = useParams({ from: GROUP_ROUTE_ID });
  const id = toGroupId(groupId);
  const group = useGroupQuery(id);

  return (
    <>
      <AppPageHeader>
        <Stack sx={{ gap: 1.25, minWidth: 0 }}>
          <AppBackLink label={BACK_LABEL} to={GROUPS_PATH} />
          <GroupHeader group={group.data} />
        </Stack>
      </AppPageHeader>
      <GroupBody groupId={id} />
    </>
  );
};
