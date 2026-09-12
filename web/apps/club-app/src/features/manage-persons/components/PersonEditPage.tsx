import Stack from '@mui/material/Stack';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AppBackLink, AppPageHeader, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import { toPersonId } from '../manage-persons-labels';
import { PersonEditBody } from './PersonEditBody';
import { PersonEditHeader } from './PersonEditHeader';

const PERSON_ROUTE_ID = '/_app/manage/persons_/$personId';
const BACK_LABEL = 'Personenverwaltung';
const PERSONS_PATH = '/manage/persons';

export const PersonEditPage: FC = () => {
  const { personId } = useParams({ from: PERSON_ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);

  return (
    <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
      <AppPageHeader>
        <Stack sx={{ gap: 1.25, minWidth: 0 }}>
          <AppBackLink label={BACK_LABEL} to={PERSONS_PATH} />
          <PersonEditHeader person={person.data} />
        </Stack>
      </AppPageHeader>
      <PersonEditBody personId={id} />
    </RequirePermission>
  );
};
