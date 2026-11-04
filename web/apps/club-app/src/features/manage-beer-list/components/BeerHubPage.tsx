import { KkPourQuickBar } from '@furria/ui/KkPourQuickBar';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { MANAGE_ORIGIN } from '@/features/session/app-sections';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BeerHubContext } from '../beer-hub-context';
import { HUB_PATH, HUB_TITLE, QUICK_ITEMS, QUICK_LABEL } from '../beer-hub-copy';
import { useBeerHub } from '../hooks/use-beer-hub';
import { useBeerHubActions } from '../hooks/use-beer-hub-actions';
import { BeerHubBody } from './BeerHubBody';

export const BeerHubPage: FC = () => {
  const hub = useBeerHub();
  const { actions, quickSlot, quickPlacement, chooseQuick } = useBeerHubActions(hub);
  const quick = (
    <KkPourQuickBar
      label={QUICK_LABEL}
      items={QUICK_ITEMS}
      placement={quickPlacement}
      onSelect={chooseQuick}
    />
  );
  const tools = quickSlot === 'tools' ? quick : undefined;
  const foot = quickSlot === 'foot' ? quick : undefined;

  return (
    <KkScreen
      kind="working"
      sceneKey={HUB_PATH}
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
