import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonId } from '../manage-persons-labels';
import { PersonEditor } from './PersonEditor';
import { PersonEditorFallback } from './PersonEditorFallback';

const ROUTE_ID = '/_app/manage/persons_/$personId_/edit';
const TITLE = 'Stammdaten bearbeiten';

export const PersonEditScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  return <PersonEditor person={gate.person} />;
};
