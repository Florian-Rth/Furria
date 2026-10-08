import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { InPersonInvitationScreen } from '@/features/account-access';
import { parsePositiveId } from '@/lib/positive-id';
import { useRefreshPerson } from '../api';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { toPersonOrigin } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';

const ROUTE_ID = '/_app/manage/persons_/$personId_/invitations/in-person';
const TITLE = 'Vor Ort zeigen';

export const PersonInPersonInvitationScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(personId);
  const { gate, retry } = usePersonEditorGate(id);
  const refreshPerson = useRefreshPerson(id);

  if (gate.kind !== 'ready') {
    return <PersonEditorFallback hold={gate} title={TITLE} onRetry={retry} />;
  }

  return (
    <InPersonInvitationScreen
      purpose="onboarding"
      subject={gate.person}
      origin={toPersonOrigin(gate.person)}
      onRedeemed={refreshPerson}
    />
  );
};
