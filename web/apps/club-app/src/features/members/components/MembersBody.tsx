import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { useMembersQuery } from '../api';
import type { MemberSearch } from '../hooks/use-member-search';
import { toMembersErrorMessage } from '../members-messages';
import { MemberPeekSheet } from './MemberPeekSheet';
import { MembersError } from './MembersError';
import { MembersView } from './MembersView';

const LOADING_LABEL = 'Mitgliederliste wird geladen';

interface MembersBodyProps {
  search: MemberSearch;
}

export const MembersBody: FC<MembersBodyProps> = ({ search }) => {
  const members = useMembersQuery();
  const errorMessage = toMembersErrorMessage(members.error);

  const reload = (): void => {
    void members.refetch();
  };

  if (members.data !== undefined) {
    return (
      <>
        <MembersView search={search} />
        <MemberPeekSheet members={members.data.members} />
      </>
    );
  }
  if (errorMessage !== null) {
    return <MembersError message={errorMessage} onRetry={reload} />;
  }

  return <AppListSkeleton label={LOADING_LABEL} listShape="rows" />;
};
