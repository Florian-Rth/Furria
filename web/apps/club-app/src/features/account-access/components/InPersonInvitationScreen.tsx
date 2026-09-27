import type { KkScreenOrigin } from '@furria/ui';
import { KkPanelStack, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { IN_PERSON_TITLES } from '../account-access-labels';
import { useInPersonInvitation } from '../hooks/use-in-person-invitation';
import type { AccessSubject, InPersonPurpose } from '../types';
import { InPersonBody } from './InPersonBody';

interface InPersonInvitationScreenProps {
  purpose: InPersonPurpose;
  subject: AccessSubject;
  origin: KkScreenOrigin;
  onRedeemed: () => void;
}

export const InPersonInvitationScreen: FC<InPersonInvitationScreenProps> = ({
  purpose,
  subject,
  origin,
  onRedeemed,
}) => {
  const { phase, rejection, action } = useInPersonInvitation({ purpose, subject, onRedeemed });

  return (
    <KkScreen kind="fullscreen" title={IN_PERSON_TITLES[purpose]} origin={origin} action={action}>
      <KkPanelStack>
        <InPersonBody
          purpose={purpose}
          phase={phase}
          firstName={subject.firstName}
          rejection={rejection}
        />
      </KkPanelStack>
    </KkScreen>
  );
};
