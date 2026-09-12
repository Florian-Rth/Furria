import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useGroupsQuery } from '../api';
import { GROUPS_SECTION_TITLE } from '../groups-labels';
import { toGroupsErrorMessage } from '../groups-messages';
import { GroupsError } from './GroupsError';
import { GroupsView } from './GroupsView';

const LOADING_LABEL = 'Gruppen werden geladen';
const TOOLBAR_CHIPS = 3;

export const GroupsBody: FC = () => {
  const groups = useGroupsQuery();
  const errorMessage = toGroupsErrorMessage(groups.error);

  const reload = (): void => {
    void groups.refetch();
  };

  if (groups.data !== undefined) {
    return <GroupsView groups={groups.data.groups} />;
  }
  if (errorMessage !== null) {
    return <GroupsError message={errorMessage} onRetry={reload} />;
  }

  return (
    <AppListSkeleton
      label={LOADING_LABEL}
      sectionTitle={GROUPS_SECTION_TITLE}
      toolbarChips={TOOLBAR_CHIPS}
      listShape="cards"
    />
  );
};
