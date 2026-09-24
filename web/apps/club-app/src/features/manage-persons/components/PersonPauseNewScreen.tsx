import { useParams, useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toEntryId, toPersonId } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonPauseEditor } from './PersonPauseEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/pauses/new';
const TITLE = 'Ruhezeit eintragen';

export const PersonPauseNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { membership: membershipParam } = useSearch({ from: ROUTE_ID });
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  const membershipId = membershipParam === undefined ? null : toEntryId(membershipParam);
  const membership =
    membershipId === null
      ? null
      : (gate.person.memberships.find((candidate) => candidate.membershipId === membershipId) ??
        null);

  if (membership === null) {
    return <PersonEditorNotFound />;
  }

  return <PersonPauseEditor person={gate.person} membership={membership} pause={null} />;
};
