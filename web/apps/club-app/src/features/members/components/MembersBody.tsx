import type { FC } from 'react';
import { useMembersQuery } from '../api';
import { useMemberSearch } from '../hooks/use-member-search';
import { toMembersErrorMessage } from '../members-messages';
import type { MemberSummary } from '../schemas';
import { MembersError } from './MembersError';
import { MembersSkeleton } from './MembersSkeleton';
import { MembersView } from './MembersView';

const NO_MEMBERS: readonly MemberSummary[] = [];

export const MembersBody: FC = () => {
  const members = useMembersQuery();
  const search = useMemberSearch(members.data?.members ?? NO_MEMBERS);
  const errorMessage = toMembersErrorMessage(members.error);

  const reload = (): void => {
    void members.refetch();
  };

  if (members.data !== undefined) {
    return <MembersView search={search} />;
  }
  if (errorMessage !== null) {
    return <MembersError message={errorMessage} onRetry={reload} />;
  }

  return <MembersSkeleton search={search} />;
};
