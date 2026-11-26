import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import type { KkScreenHelp, KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { FC } from 'react';
import { IN_PERSON_TITLES } from '../account-access-labels';
import { useInPersonInvitation } from '../hooks/use-in-person-invitation';
import type { AccessSubject, InPersonPurpose } from '../types';
import { InPersonBody } from './InPersonBody';

interface InPersonInvitationScreenProps {
  purpose: InPersonPurpose;
  subject: AccessSubject;
  origin: KkScreenOrigin;
  help?: KkScreenHelp;
}

export const InPersonInvitationScreen: FC<InPersonInvitationScreenProps> = ({
  purpose,
  subject,
  origin,
  help,
}) => {
  const { phase, rejection, action } = useInPersonInvitation({ purpose, subject });

  return (
    <KkScreen
      kind="fullscreen"
      title={IN_PERSON_TITLES[purpose]}
      origin={origin}
      action={action}
      help={help}
    >
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
