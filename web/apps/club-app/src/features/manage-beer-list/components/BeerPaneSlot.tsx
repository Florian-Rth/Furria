import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import type { BeerRosterRow } from '../beer-hub';
import { useBeerHubContext } from '../beer-hub-context';
import { CLOSE_LABEL, HUB_TITLE } from '../beer-hub-copy';
import { beerPaneKeyOf } from '../beer-pane';
import { useShownPane } from '../hooks/use-shown-pane';
import { HUB_SPANS } from '../hub-layout';
import { BeerHubRoster } from './BeerHubRoster';
import { BeerPaneView } from './BeerPaneView';

interface BeerPaneSlotProps {
  roster: readonly BeerRosterRow[] | null;
}

export const BeerPaneSlot: FC<BeerPaneSlotProps> = ({ roster }) => {
  const hub = useBeerHubContext();
  const shown = useShownPane(hub.pane);
  const shownKey = beerPaneKeyOf(shown);
  const paneOpen = hub.pane !== null;

  if (!hub.isWide) {
    return (
      <KkBottomDrawer
        open={paneOpen}
        label={HUB_TITLE}
        closeLabel={CLOSE_LABEL}
        onClose={hub.closePane}
      >
        <BeerPaneView key={shownKey} pane={shown} />
      </KkBottomDrawer>
    );
  }

  if (paneOpen) {
    return (
      <KkMasterDetail.Detail span={HUB_SPANS.pane}>
        <BeerPaneView key={shownKey} pane={hub.pane} />
      </KkMasterDetail.Detail>
    );
  }

  if (roster === null) {
    return null;
  }

  return (
    <KkMasterDetail.Detail span={HUB_SPANS.pane}>
      <BeerHubRoster rows={roster} />
    </KkMasterDetail.Detail>
  );
};
