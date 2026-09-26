import type { KkScreenOrigin } from '@furria/ui';
import { KkPanelStack, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { IN_PERSON_ACT_LABEL } from '../account-access-labels';
import { useInPersonInvitation } from '../hooks/use-in-person-invitation';
import type { AccessSubject } from '../types';
import { InPersonBody } from './InPersonBody';

interface InPersonInvitationScreenProps {
  subject: AccessSubject;
  origin: KkScreenOrigin;
  onRedeemed: () => void;
}

export const InPersonInvitationScreen: FC<InPersonInvitationScreenProps> = ({
  subject,
  origin,
  onRedeemed,
}) => {
  const { phase, rejection, action } = useInPersonInvitation({ subject, onRedeemed });

  return (
    <KkScreen kind="fullscreen" title={IN_PERSON_ACT_LABEL} origin={origin} action={action}>
      <KkPanelStack>
        <InPersonBody phase={phase} firstName={subject.firstName} rejection={rejection} />
      </KkPanelStack>
    </KkScreen>
  );
};
