import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonId } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonFeeReductionEditor } from './PersonFeeReductionEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/fee-reductions/new';
const TITLE = 'Ermäßigung eintragen';

export const PersonFeeReductionNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  return <PersonFeeReductionEditor person={gate.person} reduction={null} />;
};
