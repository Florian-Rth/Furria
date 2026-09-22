import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import {
  EDITOR_DENIED_MESSAGE,
  toEntryId,
  toMembershipOrigin,
  toPersonId,
} from '../manage-persons-labels';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';
import { PersonPauseEditor } from './PersonPauseEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/pauses/new';
const TITLE = 'Ruhezeit eintragen';

export const PersonPauseNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { membership: membershipParam } = useSearch({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);
  const { has, isUndecided } = usePermissions();
  const mayManage = isUndecided || has(PERMISSION_KEYS.personsManage);

  if (person.data === undefined) {
    return person.isLoading ? <PersonEditorSkeleton /> : <PersonEditorNotFound />;
  }

  const membershipId = membershipParam === undefined ? null : toEntryId(membershipParam);
  const membership =
    membershipId === null
      ? null
      : (person.data.memberships.find((candidate) => candidate.membershipId === membershipId) ??
        null);

  if (membership === null) {
    return <PersonEditorNotFound />;
  }
  if (!mayManage) {
    return (
      <PersonEditorDenied
        title={TITLE}
        origin={toMembershipOrigin(person.data, membership)}
        message={EDITOR_DENIED_MESSAGE}
      />
    );
  }

  return <PersonPauseEditor person={person.data} membership={membership} pause={null} />;
};
