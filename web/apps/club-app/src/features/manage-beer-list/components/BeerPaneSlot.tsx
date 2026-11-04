import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { Outlet } from '@tanstack/react-router';
import type { FC } from 'react';
import type { BeerRosterRow } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { CLOSE_LABEL, HUB_TITLE } from '../beer-hub-copy';
import { BeerHubRoster } from './BeerHubRoster';

const PANE_SPAN = 5;

interface BeerPaneSlotProps {
  roster: readonly BeerRosterRow[] | null;
}

export const BeerPaneSlot: FC<BeerPaneSlotProps> = ({ roster }) => {
  const hub = useBeerHubContext();

  if (!hub.isWide) {
    return (
      <KkBottomDrawer
        open={hub.paneOpen}
        label={HUB_TITLE}
        closeLabel={CLOSE_LABEL}
        onClose={hub.closePane}
      >
        <Outlet />
      </KkBottomDrawer>
    );
  }

  if (hub.paneOpen) {
    return (
      <KkMasterDetail.Detail span={PANE_SPAN}>
        <Outlet />
      </KkMasterDetail.Detail>
    );
  }

  return roster === null ? null : (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <BeerHubRoster rows={roster} />
    </KkMasterDetail.Detail>
  );
};
