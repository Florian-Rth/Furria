import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useGroupHubQuery } from '../api';
import { toHubId, toHubTitle } from '../group-hub-labels';
import { HubBody } from './HubBody';
import { HubStage } from './HubStage';

const HUB_ROUTE_ID = '/_app/groups_/$groupId';
const HUB_ORIGIN = { label: 'Gruppen', to: '/groups' };

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const id = toHubId(groupId);
  const hub = useGroupHubQuery(id);

  return (
    <KkScreen
      kind="detail"
      title={toHubTitle(hub.data)}
      origin={HUB_ORIGIN}
      headerKind="banner"
      header={<HubStage groupId={id} />}
    >
      <HubBody groupId={id} />
    </KkScreen>
  );
};
