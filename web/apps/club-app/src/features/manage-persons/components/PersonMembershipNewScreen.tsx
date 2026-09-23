import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonId } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonMembershipEditor } from './PersonMembershipEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/memberships/new';
const TITLE = 'Zeitraum eintragen';

export const PersonMembershipNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  return <PersonMembershipEditor person={gate.person} membership={null} />;
};
