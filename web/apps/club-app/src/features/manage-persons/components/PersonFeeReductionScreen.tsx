import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toEntryId, toPersonId } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonFeeReductionEditor } from './PersonFeeReductionEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/fee-reductions/$feeReductionId';
const TITLE = 'Ermäßigung ändern';

export const PersonFeeReductionScreen: FC = () => {
  const { personId, feeReductionId } = useParams({ from: ROUTE_ID });
  const entryId = toEntryId(feeReductionId);
  const { gate, retry } = usePersonEditorGate(toPersonId(personId));

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  const reduction =
    entryId === null
      ? null
      : (gate.person.feeReductions.find((candidate) => candidate.feeReductionId === entryId) ??
        null);

  if (reduction === null) {
    return <PersonEditorNotFound />;
  }

  return <PersonFeeReductionEditor person={gate.person} reduction={reduction} />;
};
