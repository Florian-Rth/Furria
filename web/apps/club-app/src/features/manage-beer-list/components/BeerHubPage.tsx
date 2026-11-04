import { KkPourQuickBar } from '@furria/ui/KkPourQuickBar';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BeerHubContext } from '../beer-hub-context';
import { HUB_TITLE, POTS_TITLE, QUICK_ITEMS, QUICK_LABEL, SETTINGS_TITLE } from '../beer-hub-copy';
import type { BeerPanePath } from '../hooks/use-beer-hub';
import { useBeerHub } from '../hooks/use-beer-hub';
import { BeerHubBody } from './BeerHubBody';

const QUICK_PATHS: Partial<Record<string, BeerPanePath>> = {
  payment: '/manage/beer-list/payment',
  crates: '/manage/beer-list/crates',
  stock: '/manage/beer-list/stock',
};

export const BeerHubPage: FC = () => {
  const hub = useBeerHub();
  const isOpen = hub.state.kind === 'open';
  const potsAction = {
    id: 'pots',
    label: POTS_TITLE,
    icon: 'archive',
    onSelect: () => {
      hub.openPane('/manage/beer-list/pots');
    },
  } as const;
  const settingsAction = {
    id: 'settings',
    label: SETTINGS_TITLE,
    icon: 'settings',
    onSelect: () => {
      hub.openPane('/manage/beer-list/settings');
    },
  } as const;
  const openActions: KkScreenActions = isOpen ? [settingsAction, potsAction] : [potsAction];
  const actions = hub.allowed ? openActions : undefined;
  const chooseQuick = (id: string): void => {
    const path = QUICK_PATHS[id];

    if (path !== undefined) {
      hub.openPane(path);
    }
  };
  const quick = isOpen ? (
    <KkPourQuickBar
      label={QUICK_LABEL}
      items={QUICK_ITEMS}
      placement={hub.isWide ? 'top' : 'foot'}
      onSelect={chooseQuick}
    />
  ) : undefined;
  const tools = hub.isWide ? quick : undefined;
  const foot = hub.isWide ? undefined : quick;

  return (
    <KkScreen
      kind="working"
      title={HUB_TITLE}
      origin={MANAGE_ORIGIN}
      actions={actions}
      tools={tools}
      foot={foot}
    >
      <KkVisuallyHidden component="h1">{HUB_TITLE}</KkVisuallyHidden>
      <RequirePermission permissionKey={PERMISSION_KEYS.beerListManage}>
        <BeerHubContext value={hub}>
          <BeerHubBody />
        </BeerHubContext>
      </RequirePermission>
    </KkScreen>
  );
};
