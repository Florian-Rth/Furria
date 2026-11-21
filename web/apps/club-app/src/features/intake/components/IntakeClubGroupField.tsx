import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { FC } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useController } from 'react-hook-form';
import {
  CLUB_GROUP_CONSENT_DESCRIPTION,
  CLUB_GROUP_CONSENT_LABEL,
  CLUB_GROUP_CONSENT_TITLE,
} from '@/lib/club-group-consent-copy';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import type { NewcomerForm } from '../schemas';

interface IntakeClubGroupFieldProps {
  form: UseFormReturn<NewcomerForm>;
}

export const IntakeClubGroupField: FC<IntakeClubGroupFieldProps> = ({ form }) => {
  const consent = useController({ control: form.control, name: 'clubGroupConsent' });
  const toggle = (checked: boolean): void => {
    consent.field.onChange(checked);
  };

  return (
    <KkFormSection title={CLUB_GROUP_CONSENT_TITLE}>
      <KkSwitchRow
        label={CLUB_GROUP_CONSENT_LABEL}
        description={CLUB_GROUP_CONSENT_DESCRIPTION}
        checked={consent.field.value}
        onChange={toggle}
        stateLabel={SWITCH_STATE_LABELS}
      />
    </KkFormSection>
  );
};
