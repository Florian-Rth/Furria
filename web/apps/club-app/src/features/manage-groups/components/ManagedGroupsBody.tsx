import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useManagedGroupsQuery } from '../api';
import { useGroupSelection } from '../hooks/use-group-selection';
import { MANAGE_GROUPS_SECTION_TITLES } from '../manage-groups-labels';
import { toManagedGroupsErrorMessage } from '../manage-groups-messages';
import { ManagedGroupsError } from './ManagedGroupsError';
import { ManagedGroupsView } from './ManagedGroupsView';

const LOADING_LABEL = 'Die Gruppenverwaltung wird geladen';
const TOOLBAR_CHIPS = 3;
const DETAIL_SIZE = 7;

export const ManagedGroupsBody: FC = () => {
  const groups = useManagedGroupsQuery();
  const selection = useGroupSelection();
  const errorMessage = toManagedGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <ManagedGroupsView groups={groups.data.groups} />;
  }
  if (errorMessage !== null) {
    return <ManagedGroupsError message={errorMessage} onRetry={reload} />;
  }

  return (
    <AppListSkeleton
      label={LOADING_LABEL}
      sectionTitle={MANAGE_GROUPS_SECTION_TITLES.list}
      toolbarChips={TOOLBAR_CHIPS}
      listShape="cards"
      hasSelection={selection.groupId !== null}
      asideSize={DETAIL_SIZE}
    />
  );
};
