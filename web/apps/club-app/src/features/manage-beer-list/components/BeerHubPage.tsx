import { KkPourQuickBar } from '@furria/ui/KkPourQuickBar';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { FC } from 'react';
import { toScreenHelp } from '@/features/help/screen-help';
import { RequirePermission } from '@/features/session/components/RequirePermission';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { BeerHubContext } from '../beer-hub-context';
import { HUB_ORIGIN, HUB_PATH, HUB_TITLE, QUICK_ITEMS, QUICK_LABEL } from '../beer-hub-copy';
import { BEER_HUB_HELP_SPOTS } from '../beer-hub-help-copy';
import { useBeerHub } from '../hooks/use-beer-hub';
import { useBeerHubActions } from '../hooks/use-beer-hub-actions';
import { useBeerHubHelpViewer } from '../hooks/use-beer-hub-help-viewer';
import { BeerHubBody } from './BeerHubBody';
import { BeerHubHelp } from './BeerHubHelp';

export const BeerHubPage: FC = () => {
  const hub = useBeerHub();
  const { actions, quickSlot, quickPlacement, chooseQuick } = useBeerHubActions(hub);
  const helpViewer = useBeerHubHelpViewer(hub);
  const help = hub.allowed ? toScreenHelp(<BeerHubHelp viewer={helpViewer} />) : undefined;
  const quick = (
    <KkPourQuickBar
      label={QUICK_LABEL}
      items={QUICK_ITEMS}
      placement={quickPlacement}
      onSelect={chooseQuick}
      landing={BEER_HUB_HELP_SPOTS.quick}
    />
  );
  const tools = quickSlot === 'tools' ? quick : undefined;
  const foot = quickSlot === 'foot' ? quick : undefined;

  return (
    <KkScreen
      kind="working"
      sceneKey={HUB_PATH}
      title={HUB_TITLE}
      origin={HUB_ORIGIN}
      actions={actions}
      tools={tools}
      foot={foot}
      help={help}
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
