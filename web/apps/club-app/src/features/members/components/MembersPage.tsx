import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { useMembersQuery } from '../api';
import { toConnectedSentence } from '../members-labels';
import { MembersBody } from './MembersBody';

const MEMBERS_TITLE = 'Mitglieder';

export const MembersPage: FC = () => {
  const members = useMembersQuery();
  const lead =
    members.data === undefined ? undefined : toConnectedSentence(members.data.members.length);

  return (
    <>
      <AppPageHeader>
        <KkAppShell.PageTitle>{MEMBERS_TITLE}</KkAppShell.PageTitle>
        <KkAppShell.PageLead>{lead}</KkAppShell.PageLead>
      </AppPageHeader>
      <MembersBody />
    </>
  );
};
