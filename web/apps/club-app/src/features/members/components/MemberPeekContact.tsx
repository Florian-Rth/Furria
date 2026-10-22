import { KkAlert } from '@furria/ui/KkAlert';
import { KkRetryAlert } from '@furria/ui/KkRetryAlert';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { isNotFoundError } from '@/lib/query-error';
import { useMemberQuery } from '../api';
import { toMemberErrorMessage } from '../members-messages';
import type { MemberSummary } from '../schemas';
import { MemberContactPanel } from './MemberContactPanel';

const SKELETON_LINES = 3;
const NOT_FOUND_MESSAGE = 'Diese Person steht nicht mehr im Verzeichnis.';
const RETRY_LABEL = 'Erneut laden';

interface MemberPeekContactProps {
  member: MemberSummary;
  isSelf: boolean | undefined;
}

export const MemberPeekContact: FC<MemberPeekContactProps> = ({ member, isSelf }) => {
  const details = useMemberQuery(member.personId);
  const errorMessage = toMemberErrorMessage(details.error);

  const reload = (): void => {
    void details.refetch();
  };

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
  if (isNotFoundError(details.error)) {
    return <KkAlert severity="error">{NOT_FOUND_MESSAGE}</KkAlert>;
  }
  if (errorMessage !== null) {
    return (
      <KkRetryAlert
        message={errorMessage}
        retrying={details.isFetching}
        onRetry={reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  return <KkSkeletonBlock lines={SKELETON_LINES} />;
};
