import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import {
  EDITOR_DENIED_MESSAGE,
  findMembershipOfPause,
  toEntryId,
  toMembershipOrigin,
  toPersonId,
} from '../manage-persons-labels';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';
import { PersonPauseEditor } from './PersonPauseEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/pauses/$pauseId';
const TITLE = 'Ruhezeit ändern';

export const PersonPauseScreen: FC = () => {
  const { personId, pauseId } = useParams({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const entryId = toEntryId(pauseId);
  const person = usePersonQuery(id);
  const { has, isUndecided } = usePermissions();
  const mayManage = isUndecided || has(PERMISSION_KEYS.personsManage);

  if (person.data === undefined) {
    return person.isLoading ? <PersonEditorSkeleton /> : <PersonEditorNotFound />;
  }

  const found = entryId === null ? null : findMembershipOfPause(person.data, entryId);

  if (found === null) {
    return <PersonEditorNotFound />;
  }
  if (!mayManage) {
    return (
      <PersonEditorDenied
        title={TITLE}
        origin={toMembershipOrigin(person.data, found.membership)}
        message={EDITOR_DENIED_MESSAGE}
      />
    );
  }

  return (
    <PersonPauseEditor person={person.data} membership={found.membership} pause={found.pause} />
  );
};
