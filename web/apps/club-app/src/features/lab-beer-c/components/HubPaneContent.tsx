import type { FC, ReactNode } from 'react';
import type { LedgerHub } from '../hooks/use-ledger-hub';
import { HubPersonPane } from './HubPersonPane';
import { HubSettingsPane } from './HubSettingsPane';
import { HubStockPane } from './HubStockPane';

interface HubPaneContentProps {
  hub: LedgerHub;
  framed: boolean;
  close: ReactNode;
}

export const HubPaneContent: FC<HubPaneContentProps> = ({ hub, framed, close }) => {
  switch (hub.pane?.kind) {
    case 'stock':
      return (
        <HubStockPane
          beer={hub.beer}
          health={hub.health}
          operatorId={hub.operatorId}
          framed={framed}
          close={close}
        />
      );
    case 'settings':
      return <HubSettingsPane beer={hub.beer} framed={framed} close={close} />;
    case 'person':
      return hub.selected === null ? null : (
        <HubPersonPane
          key={hub.selected.person.id}
          beer={hub.beer}
          line={hub.selected}
          operatorId={hub.operatorId}
          framed={framed}
          close={close}
        />
      );
    default:
      return null;
  }
};
