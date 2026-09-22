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
import { PersonFeeReductionEditor } from './PersonFeeReductionEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/fee-reductions/$feeReductionId';
const TITLE = 'Ermäßigung ändern';

export const PersonFeeReductionScreen: FC = () => {
  const { personId, feeReductionId } = useParams({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const entryId = toEntryId(feeReductionId);
  const person = usePersonQuery(id);
  const { has, isUndecided } = usePermissions();
  const mayManage = isUndecided || has(PERMISSION_KEYS.personsManage);

  if (person.data === undefined) {
    return person.isLoading ? <PersonEditorSkeleton /> : <PersonEditorNotFound />;
  }

  const reduction =
    entryId === null
      ? null
      : (person.data.feeReductions.find((candidate) => candidate.feeReductionId === entryId) ??
        null);

  if (reduction === null) {
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

  return <PersonFeeReductionEditor person={person.data} reduction={reduction} />;
};
