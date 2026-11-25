import { toImageSource } from '@furria/ui/image-source';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPersonRow } from '@furria/ui/KkPersonRow';
import type { FC } from 'react';
import { toInitials } from '@/lib/initials';
import { formatIsoDay } from '@/lib/membership-labels';
import {
  ADDRESS_FACT,
  EMAIL_FACT,
  NEWCOMER_SECTION,
  NOT_GIVEN,
  PHONE_FACT,
  toAddressLine,
} from '../intake-labels';
import { INTAKE_REVIEW_HELP_SPOTS } from '../intake-review-help-copy';
import type { IntakeNewcomer } from '../schemas';

interface IntakeNewcomerPanelProps {
  newcomer: IntakeNewcomer;
}

export const IntakeNewcomerPanel: FC<IntakeNewcomerPanelProps> = ({ newcomer }) => {
  const initials = toInitials(newcomer.firstName, newcomer.lastName);
  const portrait = toImageSource(newcomer.portrait, 'portrait');
  const name = `${newcomer.firstName} ${newcomer.lastName}`;
  const birthDate = formatIsoDay(newcomer.birthDate);
  const address = toAddressLine(newcomer.street, newcomer.zip, newcomer.city);
  const phone = newcomer.phone ?? NOT_GIVEN;
  const email = newcomer.email ?? NOT_GIVEN;

  return (
    <KkFormSection title={NEWCOMER_SECTION} landing={INTAKE_REVIEW_HELP_SPOTS.newcomer}>
      <KkPanel>
        <KkPersonRow initials={initials} portrait={portrait} name={name} meta={birthDate} />
        <KkFieldRow label={ADDRESS_FACT} value={address} />
        <KkFieldRow label={PHONE_FACT} value={phone} />
        <KkFieldRow label={EMAIL_FACT} value={email} />
      </KkPanel>
    </KkFormSection>
  );
};
