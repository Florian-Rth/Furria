import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, usePermissions } from '@/features/session';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { toHubOrigin, toHubTitle } from '../group-hub-labels';
import { HubBody } from './HubBody';
import { HubStage } from './HubStage';

const HUB_ROUTE_ID = '/_app/groups_/$groupId';

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const { isAffiliated, isManagingLogin, isUndecided } = usePermissions();
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);
  const origin = toHubOrigin(isUndecided ? null : isAffiliated, isManagingLogin);

  return (
    <KkScreen
      kind="detail"
      title={toHubTitle(hub.data)}
      origin={origin}
      headerKind="banner"
      header={<HubStage groupId={id} />}
      handover={AREA_HANDOVERS.groups}
    >
      <HubBody groupId={id} />
    </KkScreen>
  );
};
