import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { MailInvitationEditor } from '@/features/account-access';
import { useRefreshPerson } from '../api';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonId, toPersonOrigin } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';

const ROUTE_ID = '/_app/manage/persons_/$personId_/invitations/new';
const TITLE = 'Per Mail einladen';

export const PersonInvitationNewScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const id = toPersonId(personId);
  const { gate, retry } = usePersonEditorGate(id);
  const refreshPerson = useRefreshPerson(id);

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  return (
    <MailInvitationEditor
      subject={gate.person}
      origin={toPersonOrigin(gate.person)}
      onInvited={refreshPerson}
    />
  );
};
