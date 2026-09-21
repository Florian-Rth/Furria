import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { useGroupHubQuery } from '../api';
import { toHubId, toHubOrigin, toHubTitle } from '../group-hub-labels';
import { HubBody } from './HubBody';
import { HubStage } from './HubStage';

const HUB_ROUTE_ID = '/_app/groups_/$groupId';

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const { isAffiliated } = usePermissions();
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);
  const origin = toHubOrigin(isAffiliated);

  return (
    <KkScreen
      kind="detail"
      title={toHubTitle(hub.data)}
      origin={origin}
      headerKind="banner"
      header={<HubStage groupId={id} />}
    >
      <HubBody groupId={id} />
    </KkScreen>
  );
};
