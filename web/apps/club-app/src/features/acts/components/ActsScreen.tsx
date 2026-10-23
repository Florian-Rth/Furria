import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { useScreenSearch } from '@/features/session/hooks/use-screen-search';
import type { ActsScope } from '../acts-catalogue';
import { NEW_ACT_LABEL, SEARCH_PLACEHOLDER } from '../acts-copy';
import { useActsHub } from '../hooks/use-acts-hub';
import type { ActsSearch } from '../schemas';
import { ActsBody } from './ActsBody';

interface ActsScreenProps {
  scope: ActsScope;
  search: ActsSearch;
  title: string;
  origin: KkScreenOrigin;
}

export const ActsScreen: FC<ActsScreenProps> = ({ scope, search, title, origin }) => {
  const screenSearch = useScreenSearch(SEARCH_PLACEHOLDER);
  const hub = useActsHub(scope, search);
  const actions = [
    { id: 'new-act', label: NEW_ACT_LABEL, icon: 'add', emphasis: true, onSelect: hub.openNew },
  ] as const;

  return (
    <KkScreen kind="working" title={title} origin={origin} search={screenSearch} actions={actions}>
      <ActsBody hub={hub} />
    </KkScreen>
  );
};
