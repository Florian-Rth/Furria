import type { FC } from 'react';
import { START_ORIGIN } from '@/features/session/app-sections';
import { AccessDeniedScreen } from '@/features/session/components/AccessDeniedScreen';
import { ScreenNotFound } from '@/features/session/components/ScreenNotFound';
import { isForbiddenError, isNotFoundError } from '@/lib/query-error';
import { GROUP_ACTS_DENIED, GROUP_ACTS_TITLE } from '../acts-copy';
import { groupOriginOf } from '../acts-origin';
import { useGroupActHistory } from '../hooks/use-group-act-history';
import type { GroupActsSearch } from '../schemas';
import { GroupActsScreen } from './GroupActsScreen';

interface GroupActsPageProps {
  groupId: string;
  search: GroupActsSearch;
}

export const GroupActsPage: FC<GroupActsPageProps> = ({ groupId, search }) => {
  const history = useGroupActHistory(groupId, search);

  if (
    history.groupId === null ||
    isNotFoundError(history.hub.error) ||
    isNotFoundError(history.query.error)
  ) {
    return <ScreenNotFound />;
  }

  const origin =
    history.hub.data === undefined
      ? START_ORIGIN
      : groupOriginOf(history.groupId, history.hub.data.name);

  if (isForbiddenError(history.query.error)) {
    return (
      <AccessDeniedScreen title={GROUP_ACTS_TITLE} origin={origin} message={GROUP_ACTS_DENIED} />
    );
  }

  return <GroupActsScreen history={history} origin={origin} />;
};
