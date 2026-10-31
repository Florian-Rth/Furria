import { KkScreen } from '@furria/ui/KkScreen';
import { KkVisuallyHidden } from '@furria/ui/KkVisuallyHidden';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { GROUP_ACTS_TITLE, NEW_ACT_LABEL } from '../acts-copy';
import type { GroupActHistory } from '../hooks/use-group-act-history';
import { GroupActsBody } from './GroupActsBody';

interface GroupActsScreenProps {
  history: GroupActHistory;
  origin: KkScreenOrigin;
}

export const GroupActsScreen: FC<GroupActsScreenProps> = ({ history, origin }) => {
  const actions = history.manages
    ? ([
        {
          id: 'new-act',
          label: NEW_ACT_LABEL,
          icon: 'add',
          emphasis: true,
          onSelect: history.openNew,
        },
      ] as const)
    : undefined;

  return (
    <KkScreen kind="working" title={GROUP_ACTS_TITLE} origin={origin} actions={actions}>
      <KkVisuallyHidden component="h1">{GROUP_ACTS_TITLE}</KkVisuallyHidden>
      <GroupActsBody history={history} />
    </KkScreen>
  );
};
