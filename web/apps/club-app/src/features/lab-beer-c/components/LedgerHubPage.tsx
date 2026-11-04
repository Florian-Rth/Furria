import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useLedgerHub } from '../hooks/use-ledger-hub';
import { HUB_SETTINGS, HUB_TITLE, LAB_ORIGIN } from '../ledger-copy';
import type { LedgerViewer } from '../schemas';
import { HubHealthTiles } from './HubHealthTiles';
import { HubSide } from './HubSide';
import { HubTable } from './HubTable';
import { LabViewerSwitch } from './LabViewerSwitch';

const HUB_PATH = '/lab/beer-hub-c';
const HUB_VIEWERS: readonly LedgerViewer[] = ['owner', 'operator'];

interface LedgerHubPageProps {
  viewer: LedgerViewer;
}

export const LedgerHubPage: FC<LedgerHubPageProps> = ({ viewer }) => {
  const hub = useLedgerHub(viewer);
  const actions: KkScreenActions = [
    { id: 'settings', label: HUB_SETTINGS, icon: 'settings', onSelect: hub.openSettings },
  ];
  const sideOpen = hub.isWide && hub.pane !== null;
  const masterSpan = sideOpen ? 7 : 12;
  const selectedId = hub.selected?.person.id ?? null;

  return (
    <KkScreen kind="list" title={HUB_TITLE} origin={LAB_ORIGIN} actions={actions}>
      <Stack sx={{ gap: 2, minWidth: 0 }}>
        <HubHealthTiles
          health={hub.health}
          filter={hub.filter}
          pane={hub.pane}
          onChoose={hub.chooseTile}
        />
        <KkMasterDetail>
          <KkMasterDetail.Master span={masterSpan}>
            <HubTable
              rows={hub.rows}
              filter={hub.filter}
              sort={hub.sort}
              selectedId={selectedId}
              onSort={hub.sortBy}
              onClearFilter={hub.clearFilter}
              onOpen={hub.openPerson}
            />
          </KkMasterDetail.Master>
          <HubSide hub={hub} />
        </KkMasterDetail>
        <LabViewerSwitch
          path={HUB_PATH}
          viewer={viewer}
          viewers={HUB_VIEWERS}
          onEmptyStock={hub.emptyStock}
        />
      </Stack>
    </KkScreen>
  );
};
