import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import type { InPersonPurpose } from '@/features/account-access/types';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { IN_PERSON_HELP_COPY } from '../person-access-help-copy';

interface PersonInPersonHelpProps {
  purpose: InPersonPurpose;
}

export const PersonInPersonHelp: FC<PersonInPersonHelpProps> = ({ purpose }) => {
  const isRecovery = purpose === 'recovery';
  const recovery = isRecovery ? (
    <KkHelp.Hint>
      <KkHelp.Title>{IN_PERSON_HELP_COPY.recovery.title}</KkHelp.Title>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.recovery.text}</KkHelp.Text>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.recovery.inPerson}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const after = isRecovery ? (
    <KkHelp.Hint>
      <KkHelp.Title>{IN_PERSON_HELP_COPY.recovered.title}</KkHelp.Title>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.recovered.text}</KkHelp.Text>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.recovered.finish}</KkHelp.Text>
    </KkHelp.Hint>
  ) : (
    <KkHelp.Hint>
      <KkHelp.Title>{IN_PERSON_HELP_COPY.onboarding.title}</KkHelp.Title>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.onboarding.text}</KkHelp.Text>
      <KkHelp.Text>{IN_PERSON_HELP_COPY.onboarding.single}</KkHelp.Text>
    </KkHelp.Hint>
  );

  return (
    <ScreenHelp>
      {recovery}
      <KkHelp.Hint>
        <KkHelp.Title>{IN_PERSON_HELP_COPY.code.title}</KkHelp.Title>
        <KkHelp.Text>{IN_PERSON_HELP_COPY.code.text}</KkHelp.Text>
        <KkHelp.Text>{IN_PERSON_HELP_COPY.code.expiry}</KkHelp.Text>
      </KkHelp.Hint>
      {after}
    </ScreenHelp>
  );
};
