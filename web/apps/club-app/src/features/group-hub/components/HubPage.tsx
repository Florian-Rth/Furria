import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session';
import { isForbiddenError } from '@/lib/query-error';
import { useMyGroupQuery } from '../api';
import { toHubHeadline, toHubId } from '../group-hub-labels';
import { HubBody } from './HubBody';
import { HubDenied } from './HubDenied';
import { HubHeader } from './HubHeader';

const HUB_ROUTE_ID = '/_app/my-groups/$groupId';

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useMyGroupQuery(id);
  const me = useMeQuery();
  const headline = toHubHeadline(hub.data, me.data?.person.id ?? null);
  const denied = isForbiddenError(hub.error);
  const header = denied ? undefined : <HubHeader hub={hub.data} />;
  const body = denied ? <HubDenied groupId={groupId} /> : <HubBody groupId={id} />;

  return (
    <KkScreen kind="detail" title={headline.title} header={header}>
      {body}
    </KkScreen>
  );
};
