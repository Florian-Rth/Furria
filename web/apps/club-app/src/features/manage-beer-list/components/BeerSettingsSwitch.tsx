import type { KkSegmentSwitchItem } from '@furria/ui/KkSegmentSwitch';
import { KkSegmentSwitch } from '@furria/ui/KkSegmentSwitch';
import type { FC } from 'react';
import { useBeerHubContext } from '../beer-hub-context';
import { CODE_TITLE, ENROLLMENTS_TITLE, HANDOVER_TITLE, SETTINGS_TITLE } from '../beer-hub-copy';
import type { BeerPanePath } from '../hooks/use-beer-hub';

const SWITCH_LABEL = 'Bierliste einrichten';

const ITEMS: readonly KkSegmentSwitchItem[] = [
  {
    id: '/manage/beer-list/settings',
    label: SETTINGS_TITLE,
    icon: 'settings',
    count: null,
    countLabel: '',
  },
  {
    id: '/manage/beer-list/enrollments',
    label: ENROLLMENTS_TITLE,
    icon: 'person',
    count: null,
    countLabel: '',
  },
  { id: '/manage/beer-list/code', label: CODE_TITLE, icon: 'qr', count: null, countLabel: '' },
  {
    id: '/manage/beer-list/handover',
    label: HANDOVER_TITLE,
    icon: 'handshake',
    count: null,
    countLabel: '',
  },
];

const SETTINGS_PATHS: readonly BeerPanePath[] = [
  '/manage/beer-list/settings',
  '/manage/beer-list/enrollments',
  '/manage/beer-list/code',
  '/manage/beer-list/handover',
];

const toPath = (id: string): BeerPanePath | undefined => SETTINGS_PATHS.find((path) => path === id);

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

  return <KkSegmentSwitch label={SWITCH_LABEL} items={ITEMS} value={value} onChange={choose} />;
};
