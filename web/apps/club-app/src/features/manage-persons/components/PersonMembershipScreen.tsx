import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toEntryId, toPersonId } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonMembershipEditor } from './PersonMembershipEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/memberships/$membershipId';
const TITLE = 'Zeitraum ändern';

export const PersonMembershipScreen: FC = () => {
  const { personId, membershipId } = useParams({ from: ROUTE_ID });
  const entryId = toEntryId(membershipId);
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  const membership =
    entryId === null
      ? null
      : (gate.person.memberships.find((candidate) => candidate.membershipId === entryId) ?? null);

  if (membership === null) {
    return <PersonEditorNotFound />;
  }

  return <PersonMembershipEditor person={gate.person} membership={membership} />;
};
