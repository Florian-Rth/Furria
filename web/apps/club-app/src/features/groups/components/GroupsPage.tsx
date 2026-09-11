import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { GroupsBody } from './GroupsBody';

const GROUPS_TITLE = 'Gruppen';

export const GroupsPage: FC = () => (
  <>
    <AppPageHeader>
      <KkAppShell.PageTitle>{GROUPS_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <GroupsBody />
  </>
);
