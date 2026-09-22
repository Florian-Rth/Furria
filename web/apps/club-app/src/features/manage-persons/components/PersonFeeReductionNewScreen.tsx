import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { usePersonQuery } from '../api';
import { EDITOR_DENIED_MESSAGE, toPersonId, toPersonOrigin } from '../manage-persons-labels';
import { PersonEditorDenied } from './PersonEditorDenied';
import { PersonEditorNotFound } from './PersonEditorNotFound';
import { PersonEditorSkeleton } from './PersonEditorSkeleton';
import { PersonFeeReductionEditor } from './PersonFeeReductionEditor';

const ROUTE_ID = '/_app/manage/persons_/$personId_/fee-reductions/new';
const TITLE = 'Ermäßigung eintragen';

export const PersonFeeReductionNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const person = usePersonQuery(id);
  const { has, isUndecided } = usePermissions();
  const mayManage = isUndecided || has(PERMISSION_KEYS.personsManage);

  if (person.data === undefined) {
    return person.isLoading ? <PersonEditorSkeleton /> : <PersonEditorNotFound />;
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

  return <PersonFeeReductionEditor person={person.data} reduction={null} />;
};
