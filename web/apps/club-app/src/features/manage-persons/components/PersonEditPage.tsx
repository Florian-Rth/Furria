import { KkScreen, KkScreenHeaderSkeleton } from '@furria/ui';
import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { AREA_HANDOVERS, RequireAnyPermission } from '@/features/session';
import { parsePositiveId } from '@/lib/positive-id';
import { usePersonQuery } from '../api';
import { PERSONS_ORIGIN, toPersonHeadline } from '../manage-persons-labels';
import { PERSON_READ_KEYS } from '../person-read-keys';
import { PersonEditBody } from './PersonEditBody';
import { PersonEditHeader } from './PersonEditHeader';

const PERSON_ROUTE_ID = '/_app/manage/persons_/$personId';

export const PersonEditPage: FC = () => {
  const { personId } = useParams({ from: PERSON_ROUTE_ID });
  const id = parsePositiveId(personId);
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
      <RequireAnyPermission permissionKeys={PERSON_READ_KEYS}>
        <PersonEditBody personId={id} />
      </RequireAnyPermission>
    </KkScreen>
  );
};
