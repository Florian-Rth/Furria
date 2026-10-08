import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonMembershipEditor } from './PersonMembershipEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/memberships/$membershipId';
const TITLE = 'Zeitraum ändern';

export const PersonMembershipScreen: FC = () => {
  const { personId, membershipId } = useParams({ from: ROUTE_ID });
  const entryId = parsePositiveId(membershipId);
  const { gate, retry } = usePersonEditorGate(parsePositiveId(personId));

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
