import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { parsePositiveId } from '@/lib/positive-id';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { findMembershipOfPause } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonPauseEditor } from './PersonPauseEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/pauses/$pauseId';
const TITLE = 'Ruhezeit ändern';

export const PersonPauseScreen: FC = () => {
  const { personId, pauseId } = useParams({ from: ROUTE_ID });
  const entryId = parsePositiveId(pauseId);
  const { gate, retry } = usePersonEditorGate(parsePositiveId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  const found = entryId === null ? null : findMembershipOfPause(gate.person, entryId);

  if (found === null) {
    return <PersonEditorNotFound />;
  }

  return (
    <PersonPauseEditor person={gate.person} membership={found.membership} pause={found.pause} />
  );
};
