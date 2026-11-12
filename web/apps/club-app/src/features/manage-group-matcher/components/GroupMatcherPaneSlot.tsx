import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { useShownPane } from '@/lib/use-shown-pane';
import { useGroupMatcherHubContext } from '../group-matcher-hub-context';
import { CLOSE_LABEL, HUB_TITLE } from '../group-matcher-hub-copy';
import { HUB_SPANS } from '../hub-layout';
import { groupMatcherPaneKeyOf } from '../statement-pool';
import { GroupMatcherPaneView } from './GroupMatcherPaneView';

export const GroupMatcherPaneSlot: FC = () => {
  const hub = useGroupMatcherHubContext();
  const shown = useShownPane(hub.pane, groupMatcherPaneKeyOf);
  const shownKey = groupMatcherPaneKeyOf(shown);
  const paneKey = groupMatcherPaneKeyOf(hub.pane);
  const isOpen = hub.pane !== null;

  if (!hub.isWide) {
    return (
      <KkBottomDrawer
        open={isOpen}
        label={HUB_TITLE}
        closeLabel={CLOSE_LABEL}
        onClose={hub.closePane}
      >
        <GroupMatcherPaneView key={shownKey} pane={shown} isOpen={isOpen} />
      </KkBottomDrawer>
    );
  }

  if (hub.pane === null) {
    return null;
  }

  return (
    <KkMasterDetail.Detail span={HUB_SPANS.pane}>
      <GroupMatcherPaneView key={paneKey} pane={hub.pane} isOpen={isOpen} />
    </KkMasterDetail.Detail>
  );
};
