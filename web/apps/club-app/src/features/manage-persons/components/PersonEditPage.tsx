import type { KkScreenOrigin } from '@furria/ui';
import { KkScreen } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import { toPersonHeadline, toPersonId } from '../manage-persons-labels';
import { PersonEditBody } from './PersonEditBody';
import { PersonEditHeader } from './PersonEditHeader';

const PERSON_ROUTE_ID = '/_app/manage/persons_/$personId';
const PERSONS_ORIGIN: KkScreenOrigin = { label: 'Personenverwaltung', to: '/manage/persons' };

export const PersonEditPage: FC = () => {
  const { personId } = useParams({ from: PERSON_ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);
  const headline = toPersonHeadline(person.data);

  return (
    <KkScreen
      kind="working"
      title={headline.title}
      origin={PERSONS_ORIGIN}
      header={<PersonEditHeader person={person.data} />}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
        <PersonEditBody personId={id} />
      </RequirePermission>
    </KkScreen>
  );
};
