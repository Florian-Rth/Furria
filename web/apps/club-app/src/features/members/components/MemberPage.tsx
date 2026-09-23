import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMemberQuery } from '../api';
import { useIsSelf } from '../hooks/use-is-self';
import { toMemberHeadline, toPersonId } from '../members-labels';
import { MemberBody } from './MemberBody';
import { MemberHeader } from './MemberHeader';

const MEMBER_ROUTE_ID = '/_app/_affiliated/members_/$personId';
const MEMBERS_ORIGIN: KkScreenOrigin = { label: 'Mitglieder', to: '/members' };

export const MemberPage: FC = () => {
  const { personId } = useParams({ from: MEMBER_ROUTE_ID });
  const id = toPersonId(personId);
  const member = useMemberQuery(id);
  const isSelf = useIsSelf(id);
  const headline = toMemberHeadline(member.data);
  const hasFailed = id === null || member.error !== null;

  const pendingHeader = hasFailed ? null : <KkScreenHeaderSkeleton />;
  const header =
    member.data === undefined || isSelf === undefined ? (
      pendingHeader
    ) : (
      <MemberHeader member={member.data} isSelf={isSelf} />
    );

  return (
    <KkScreen kind="detail" title={headline.title} origin={MEMBERS_ORIGIN} header={header}>
      <MemberBody personId={id} />
    </KkScreen>
  );
};
