import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequirePermission } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import { PERSONS_ORIGIN, toPersonHeadline, toPersonId } from '../manage-persons-labels';
import { PersonEditBody } from './PersonEditBody';
import { PersonEditHeader } from './PersonEditHeader';

const PERSON_ROUTE_ID = '/_app/manage/persons_/$personId';

export const PersonEditPage: FC = () => {
  const { personId } = useParams({ from: PERSON_ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);
  const headline = toPersonHeadline(person.data);
  const hasFailed = id === null || person.error !== null;

  const pendingHeader = hasFailed ? null : <KkScreenHeaderSkeleton />;
  const header =
    person.data === undefined ? pendingHeader : <PersonEditHeader person={person.data} />;

  return (
    <KkScreen
      kind="working"
      title={headline.title}
      origin={PERSONS_ORIGIN}
      header={header}
      handover={AREA_HANDOVERS.manage}
    >
      <RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>
        <PersonEditBody personId={id} />
      </RequirePermission>
    </KkScreen>
  );
};
