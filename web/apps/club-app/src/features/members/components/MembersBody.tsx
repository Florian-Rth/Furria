import type { FC } from 'react';
import { useMembersQuery } from '../api';
import { toMembersErrorMessage } from '../members-messages';
import { MembersError } from './MembersError';
import { MembersSkeleton } from './MembersSkeleton';
import { MembersView } from './MembersView';

export const MembersBody: FC = () => {
  const members = useMembersQuery();
  const errorMessage = toMembersErrorMessage(members.error);

  const reload = (): void => {
    void members.refetch();
  };

  if (members.data !== undefined) {
    return <MembersView members={members.data.members} />;
  }
  if (errorMessage !== null) {
    return <MembersError message={errorMessage} onRetry={reload} />;
  }

  return <MembersSkeleton />;
};
