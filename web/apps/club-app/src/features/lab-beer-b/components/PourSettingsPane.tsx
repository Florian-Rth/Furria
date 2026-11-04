import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import { KkStepPane } from '@furria/ui/KkStepPane';
import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import { labBeerPersonOf } from '@/features/lab-beer/beer-lab-fixture';
import type { PourHub, PourSettingsTab } from '../hooks/use-pour-hub';
import { fullNameOf } from '../pour-copy';
import { ownerContextOf, SETTINGS_TABS, SETTINGS_TITLE } from '../pour-hub-copy';
import { PourCodeTab } from './PourCodeTab';
import { PourHandoverTab } from './PourHandoverTab';
import { PourSettingsTabBody } from './PourSettingsTabBody';

const isTab = (id: string): id is PourSettingsTab =>
  id === 'settings' || id === 'code' || id === 'handover';

interface PourSettingsPaneProps {
  hub: PourHub;
  tab: PourSettingsTab;
  framed: boolean;
  actions: ReactNode;
}

const bodyOf = (hub: PourHub, tab: PourSettingsTab): ReactNode => {
  switch (tab) {
    case 'code':
      return <PourCodeTab />;
    case 'handover':
      return <PourHandoverTab />;
    default:
      return <PourSettingsTabBody hub={hub} />;
  }
};

export const PourSettingsPane: FC<PourSettingsPaneProps> = ({ hub, tab, framed, actions }) => {
  const context = ownerContextOf(fullNameOf(labBeerPersonOf(hub.world.pot.ownerId)));
  const body = bodyOf(hub, tab);
  const choose = (id: string): void => {
    if (isTab(id)) {
      hub.openSide({ kind: 'settings', tab: id });
    }
  };

  return (
    <KkStepPane label={SETTINGS_TITLE} framed={framed}>
      <KkStepPane.Head
        icon="settings"
        title={SETTINGS_TITLE}
        context={context}
        state="open"
        stateLabel=""
        actions={actions}
      />
      <KkSegmentSwitch label={SETTINGS_TITLE} items={SETTINGS_TABS} value={tab} onChange={choose} />
      <KkStepPane.Body>
        <Stack sx={{ gap: 2, minWidth: 0 }}>{body}</Stack>
      </KkStepPane.Body>
    </KkStepPane>
  );
};
