import { KkAlert, KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useMemberQuery } from '../api';
import { toMemberErrorMessage } from '../members-messages';
import type { MemberSummary } from '../schemas';
import { MemberContactPanel } from './MemberContactPanel';

const SKELETON_LINES = 3;
const NOT_FOUND_MESSAGE = 'Diese Person steht nicht mehr im Verzeichnis.';

interface MemberPeekContactProps {
  member: MemberSummary;
  isSelf: boolean | undefined;
}

export const MemberPeekContact: FC<MemberPeekContactProps> = ({ member, isSelf }) => {
  const details = useMemberQuery(member.personId);
  const errorMessage = isNotFoundError(details.error)
    ? NOT_FOUND_MESSAGE
    : toMemberErrorMessage(details.error);

  if (details.data !== undefined && isSelf !== undefined) {
    return (
      <MemberContactPanel
        contact={details.data.contact}
        firstName={details.data.firstName}
        isSelf={isSelf}
        nested
      />
    );
  }
  if (errorMessage !== null) {
    return <KkAlert severity="error">{errorMessage}</KkAlert>;
  }

  return <KkSkeletonBlock lines={SKELETON_LINES} />;
};
