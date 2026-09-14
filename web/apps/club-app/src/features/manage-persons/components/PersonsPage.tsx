import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonsQuery } from '../api';
import { PERSONS_TITLE, toPersonsLead } from '../manage-persons-labels';
import { PersonsBody } from './PersonsBody';

export const PersonsPage: FC = () => {
  const persons = usePersonsQuery();
  const lead = persons.data === undefined ? undefined : toPersonsLead(persons.data.persons.length);

  return (
    <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
      <AppPageHeader>
        <KkAppShell.PageTitle>{PERSONS_TITLE}</KkAppShell.PageTitle>
        <KkAppShell.PageLead>{lead}</KkAppShell.PageLead>
      </AppPageHeader>
      <PersonsBody />
    </RequirePermission>
  );
};
