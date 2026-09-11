import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { MembersBody } from './MembersBody';

const MEMBERS_TITLE = 'Mitglieder';

export const MembersPage: FC = () => (
  <>
    <AppPageHeader>
      <KkAppShell.PageTitle>{MEMBERS_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <MembersBody />
  </>
);
