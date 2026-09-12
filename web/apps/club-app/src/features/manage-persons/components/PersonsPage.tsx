import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { PERSONS_TITLE } from '../manage-persons-labels';
import { PersonsBody } from './PersonsBody';

export const PersonsPage: FC = () => (
  <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
    <AppPageHeader>
      <KkAppShell.PageTitle>{PERSONS_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <PersonsBody />
  </RequirePermission>
);
