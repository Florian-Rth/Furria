import { KkSkeletonBlock } from '@furria/ui';
import type { FC } from 'react';
import { useMemberQuery } from '../api';
import type { MemberSummary } from '../schemas';
import { MemberContactPanel } from './MemberContactPanel';

const SKELETON_LINES = 3;

interface MemberPeekContactProps {
  member: MemberSummary;
  isSelf: boolean;
}

export const MemberPeekContact: FC<MemberPeekContactProps> = ({ member, isSelf }) => {
  const details = useMemberQuery(member.personId);

  if (details.data === undefined) {
    return <KkSkeletonBlock lines={SKELETON_LINES} />;
  }

  return (
    <MemberContactPanel
      contact={details.data.contact}
      firstName={details.data.firstName}
      isSelf={isSelf}
      nested
    />
  );
};
