import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import {
  CODE_TITLE,
  ENROLLMENTS_TITLE,
  HANDOVER_TITLE,
  SETTINGS_TITLE,
  SETUP_SWITCH_LABEL,
} from '../beer-hub-copy';
import type { BeerPanePath } from '../hooks/use-beer-hub';

interface SetupPane {
  path: BeerPanePath;
  label: string;
  icon: KkIconName;
}

const SETUP_PANES: readonly SetupPane[] = [
  { path: '/manage/beer-list/settings', label: SETTINGS_TITLE, icon: 'settings' },
  { path: '/manage/beer-list/enrollments', label: ENROLLMENTS_TITLE, icon: 'person' },
  { path: '/manage/beer-list/code', label: CODE_TITLE, icon: 'qr' },
  { path: '/manage/beer-list/handover', label: HANDOVER_TITLE, icon: 'handshake' },
];

const ITEMS: readonly KkSegmentSwitchItem[] = SETUP_PANES.map((pane) => ({
  id: pane.path,
  label: pane.label,
  icon: pane.icon,
  count: null,
  countLabel: '',
}));

const toPath = (id: string): BeerPanePath | undefined =>
  SETUP_PANES.find((pane) => pane.path === id)?.path;

interface BeerSettingsSwitchProps {
  value: BeerPanePath;
}

export const BeerSettingsSwitch: FC<BeerSettingsSwitchProps> = ({ value }) => {
  const hub = useBeerHubContext();
  const choose = (id: string): void => {
    const path = toPath(id);

    if (path !== undefined) {
      hub.openPane(path);
    }
  };

  return (
    <KkSegmentSwitch label={SETUP_SWITCH_LABEL} items={ITEMS} value={value} onChange={choose} />
  );
};
