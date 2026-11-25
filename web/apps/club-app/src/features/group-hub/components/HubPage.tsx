import { KkScreen } from '@furria/ui/KkScreen';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { AREA_HANDOVERS } from '@/features/session/app-sections';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { parsePositiveId } from '@/lib/positive-id';
import { useGroupHubQuery } from '../api';
import { toHubOrigin, toHubTitle } from '../group-hub-labels';
import { useHubHelpViewer } from '../hooks/use-hub-help-viewer';
import { useHubSettingsEntry } from '../hooks/use-hub-settings-entry';
import { GroupHubHelp } from './GroupHubHelp';
import { HubBody } from './HubBody';
import { HubStage } from './HubStage';

const HUB_ROUTE_ID = '/_app/groups_/$groupId';

export const HubPage: FC = () => {
  const { groupId } = useParams({ from: HUB_ROUTE_ID });
  const { isAffiliated, isManagingLogin, isUndecided } = usePermissions();
  const id = parsePositiveId(groupId);
  const hub = useGroupHubQuery(id);
  const actions = useHubSettingsEntry(hub.data);
  const helpViewer = useHubHelpViewer(hub.data);
  const help =
    helpViewer === undefined ? undefined : toScreenHelp(<GroupHubHelp viewer={helpViewer} />);
  const origin = toHubOrigin(isUndecided ? null : isAffiliated, isManagingLogin);

  return (
    <KkScreen
      kind="detail"
      title={toHubTitle(hub.data)}
      origin={origin}
      actions={actions}
      help={help}
      headerKind="banner"
      header={<HubStage groupId={id} />}
      handover={AREA_HANDOVERS.groups}
    >
      <HubBody groupId={id} />
    </KkScreen>
  );
};
