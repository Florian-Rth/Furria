import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import type { LedgerHub } from '../hooks/use-ledger-hub';
import { HUB_TITLE, PANE_CLOSE } from '../ledger-copy';
import { HubPaneContent } from './HubPaneContent';

const PANE_SPAN = 5;

interface HubSideProps {
  hub: LedgerHub;
}

export const HubSide: FC<HubSideProps> = ({ hub }) => {
  if (hub.pane === null) {
    return null;
  }

  if (!hub.isWide) {
    return (
      <KkBottomDrawer open label={HUB_TITLE} closeLabel={PANE_CLOSE} onClose={hub.close}>
        <HubPaneContent hub={hub} framed={false} close={null} />
      </KkBottomDrawer>
    );
  }

  const close = <KkIconButton label={PANE_CLOSE} icon="close" size="small" onClick={hub.close} />;

  return (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <HubPaneContent hub={hub} framed close={close} />
    </KkMasterDetail.Detail>
  );
};
