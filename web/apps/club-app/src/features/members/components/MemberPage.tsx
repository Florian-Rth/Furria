import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { useMemberQuery } from '../api';
import { toPersonId } from '../members-labels';
import { MemberBody } from './MemberBody';
import { MemberHeader } from './MemberHeader';

const MEMBER_ROUTE_ID = '/_app/_affiliated/members_/$personId';

export const MemberPage: FC = () => {
  const { personId } = useParams({ from: MEMBER_ROUTE_ID });
  const id = toPersonId(personId);
  const member = useMemberQuery(id);

  return (
    <>
      <AppPageHeader>
        <MemberHeader member={member.data} />
      </AppPageHeader>
      <MemberBody personId={id} />
    </>
  );
};
