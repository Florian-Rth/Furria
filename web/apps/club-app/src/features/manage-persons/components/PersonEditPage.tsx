import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import { toPersonId } from '../manage-persons-labels';
import { PersonEditBody } from './PersonEditBody';
import { PersonEditHeader } from './PersonEditHeader';

const PERSON_ROUTE_ID = '/_app/manage/persons_/$personId';

export const PersonEditPage: FC = () => {
  const { personId } = useParams({ from: PERSON_ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);

  return (
    <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
      <AppPageHeader>
        <PersonEditHeader person={person.data} />
      </AppPageHeader>
      <PersonEditBody personId={id} />
    </RequirePermission>
  );
};
