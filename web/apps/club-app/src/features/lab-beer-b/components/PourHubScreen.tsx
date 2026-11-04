import { KkPourQuickBar } from '@furria/ui/KkPourQuickBar';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenActions } from '@furria/ui/screen-declaration';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { LAB_ORIGIN } from '@/features/lab/lab-greetings';
import type { PourFormKind } from '../hooks/use-pour-hub';
import { usePourHub } from '../hooks/use-pour-hub';
import { POUR_HUB_TITLE } from '../pour-copy';
import { CODE_ACTION, QUICK_ITEMS, QUICK_LABEL, SETTINGS_ACTION } from '../pour-hub-copy';
import type { PourViewer } from '../schemas';
import { POUR_OPERATOR_VIEWERS } from '../schemas';
import { PourHubBody } from './PourHubBody';
import { PourViewerSwitch } from './PourViewerSwitch';

const isForm = (id: string): id is PourFormKind =>
  id === 'payment' || id === 'crate' || id === 'delivery' || id === 'correction';

interface PourHubScreenProps {
  viewer: PourViewer;
  onViewer: (id: string) => void;
}

export const PourHubScreen: FC<PourHubScreenProps> = ({ viewer, onViewer }) => {
  const hub = usePourHub(viewer);
  const chooseQuick = (id: string): void => {
    if (isForm(id)) {
      hub.openSide({ kind: 'form', form: id, personId: null });
    }
  };
  const actions: KkScreenActions = [
    {
      id: 'code',
      label: CODE_ACTION,
      icon: 'qr',
      onSelect: () => {
        hub.openSide({ kind: 'settings', tab: 'code' });
      },
    },
    {
      id: 'settings',
      label: SETTINGS_ACTION,
      icon: 'settings',
      onSelect: () => {
        hub.openSide({ kind: 'settings', tab: 'settings' });
      },
    },
  ];
  const placement = hub.isWide ? 'top' : 'foot';
  const quick = (
    <KkPourQuickBar
      label={QUICK_LABEL}
      items={QUICK_ITEMS}
      placement={placement}
      onSelect={chooseQuick}
    />
  );
  const tools = hub.isWide ? quick : undefined;
  const foot = hub.isWide ? undefined : quick;

  return (
    <KkScreen
      kind="working"
      title={POUR_HUB_TITLE}
      origin={LAB_ORIGIN}
      actions={actions}
      tools={tools}
      foot={foot}
    >
      <KkVisuallyHidden component="h1">{POUR_HUB_TITLE}</KkVisuallyHidden>
      <Stack sx={{ gap: 6, minWidth: 0 }}>
        <PourHubBody hub={hub} />
        <PourViewerSwitch viewers={POUR_OPERATOR_VIEWERS} value={viewer} onChange={onViewer} />
      </Stack>
    </KkScreen>
  );
};
