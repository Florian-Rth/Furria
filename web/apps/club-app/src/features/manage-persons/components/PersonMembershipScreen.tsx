import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import {
  EDITOR_DENIED_MESSAGE,
  toEntryId,
  toPersonId,
  toPersonOrigin,
} from '../manage-persons-labels';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';
import { PersonMembershipEditor } from './PersonMembershipEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/memberships/$membershipId';
const TITLE = 'Zeitraum ändern';

export const PersonMembershipScreen: FC = () => {
  const { personId, membershipId } = useParams({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const entryId = toEntryId(membershipId);
  const person = usePersonQuery(id);
  const { has, isUndecided } = usePermissions();
  const mayManage = isUndecided || has(PERMISSION_KEYS.personsManage);

  if (person.data === undefined) {
    return person.isLoading ? <PersonEditorSkeleton /> : <PersonEditorNotFound />;
  }

  const membership =
    entryId === null
      ? null
      : (person.data.memberships.find((candidate) => candidate.membershipId === entryId) ?? null);

  if (membership === null) {
    return <PersonEditorNotFound />;
  }
  if (!mayManage) {
    return (
      <PersonEditorDenied
        title={TITLE}
        origin={toPersonOrigin(person.data)}
        message={EDITOR_DENIED_MESSAGE}
      />
    );
  }

  return <PersonMembershipEditor person={person.data} membership={membership} />;
};
