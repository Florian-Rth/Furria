import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { isForbiddenError } from '@/lib/query-error';
import { useMyGroupQuery } from '../api';
import { toHubId } from '../group-hub-labels';
import { HubBody } from './HubBody';
import { HubDenied } from './HubDenied';
import { HubHeader } from './HubHeader';

const HUB_ROUTE_ID = '/_app/my-groups/$groupId';

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useMyGroupQuery(id);

  if (isForbiddenError(hub.error)) {
    return <HubDenied groupId={groupId} />;
  }

  return (
    <>
      <AppPageHeader>
        <HubHeader hub={hub.data} />
      </AppPageHeader>
      <HubBody groupId={id} />
    </>
  );
};
