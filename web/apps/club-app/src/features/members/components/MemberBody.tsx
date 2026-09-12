import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useMemberQuery } from '../api';
import { useIsSelf } from '../hooks/use-is-self';
import { toMemberErrorMessage } from '../members-messages';
import { MemberError } from './MemberError';
import { MemberNotFound } from './MemberNotFound';
import { MemberSkeleton } from './MemberSkeleton';
import { MemberView } from './MemberView';

interface MemberBodyProps {
  personId: number | null;
}

export const MemberBody: FC<MemberBodyProps> = ({ personId }) => {
  const member = useMemberQuery(personId);
  const isSelf = useIsSelf(personId);
  const errorMessage = toMemberErrorMessage(member.error);
  const missing = personId === null || isNotFoundError(member.error);

  const reload = (): void => {
    void member.refetch();
  };

  if (member.data !== undefined) {
    return <MemberView member={member.data} isSelf={isSelf} />;
  }
  if (missing) {
    return <MemberNotFound />;
  }
  if (errorMessage !== null) {
    return <MemberError message={errorMessage} onRetry={reload} />;
  }

  return <MemberSkeleton />;
};
