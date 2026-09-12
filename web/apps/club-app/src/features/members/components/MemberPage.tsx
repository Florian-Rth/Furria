import Stack from '@mui/material/Stack';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppBackLink, AppPageHeader } from '@/features/session';
import { useMemberQuery } from '../api';
import { useIsSelf } from '../hooks/use-is-self';
import { toPersonId } from '../members-labels';
import { MemberBody } from './MemberBody';
import { MemberHeader } from './MemberHeader';

const MEMBER_ROUTE_ID = '/_app/_affiliated/members_/$personId';
const BACK_LABEL = 'Mitglieder';
const MEMBERS_PATH = '/members';

export const MemberPage: FC = () => {
  const { personId } = useParams({ from: MEMBER_ROUTE_ID });
  const id = toPersonId(personId);
  const member = useMemberQuery(id);
  const isSelf = useIsSelf(id);

  return (
    <>
      <AppPageHeader>
        <Stack sx={{ gap: 1.25, minWidth: 0 }}>
          <AppBackLink label={BACK_LABEL} to={MEMBERS_PATH} />
          <MemberHeader member={member.data} isSelf={isSelf} />
        </Stack>
      </AppPageHeader>
      <MemberBody personId={id} />
    </>
  );
};
