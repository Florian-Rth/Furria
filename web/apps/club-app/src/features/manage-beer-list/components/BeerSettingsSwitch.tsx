import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { SETUP_SWITCH_LABEL, SETUP_SWITCH_LABELS } from '../beer-hub-copy';
import type { BeerPanePath } from '../hooks/use-beer-hub';

interface SetupPane {
  path: BeerPanePath;
  label: string;
  icon: KkIconName;
}

const SETUP_PANES: readonly SetupPane[] = [
  { path: '/beer-list/manage/settings', label: SETUP_SWITCH_LABELS.settings, icon: 'settings' },
  {
    path: '/beer-list/manage/enrollments',
    label: SETUP_SWITCH_LABELS.enrollments,
    icon: 'person',
  },
  { path: '/beer-list/manage/code', label: SETUP_SWITCH_LABELS.code, icon: 'qr' },
  { path: '/beer-list/manage/handover', label: SETUP_SWITCH_LABELS.handover, icon: 'handshake' },
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
