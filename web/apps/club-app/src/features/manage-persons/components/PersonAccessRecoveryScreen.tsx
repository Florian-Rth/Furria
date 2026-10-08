import { useParams } from '@tanstack/react-router';
import type { FC } from 'react';
import { InPersonInvitationScreen } from '@/features/account-access';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { parsePositiveId } from '@/lib/positive-id';
import { useRefreshPerson } from '../api';
import { usePersonEditorGate } from '../hooks/use-person-editor-gate';
import { RECOVERY_DENIED_MESSAGE, toPersonOrigin } from '../manage-persons-labels';
import { PersonEditorFallback } from './PersonEditorFallback';

const ROUTE_ID = '/_app/manage/persons_/$personId_/access-recovery';
const TITLE = 'Zugang wiederherstellen';

export const PersonAccessRecoveryScreen: FC = () => {
  const { personId } = useParams({ from: ROUTE_ID });
  const id = parsePositiveId(personId);
  const { gate, retry } = usePersonEditorGate(id, PERMISSION_KEYS.accountsManage);
  const refreshPerson = useRefreshPerson(id);

  if (gate.kind !== 'ready') {
    return (
      <PersonEditorFallback
        hold={gate}
        title={TITLE}
        deniedMessage={RECOVERY_DENIED_MESSAGE}
        onRetry={retry}
      />
    );
  }

  return (
    <InPersonInvitationScreen
      purpose="recovery"
      subject={gate.person}
      origin={toPersonOrigin(gate.person)}
      onRedeemed={refreshPerson}
    />
  );
};
