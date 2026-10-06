import { KkFieldRow, KkNote, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import {
  APPLICANT_SECTION_TITLE,
  MINOR_NOTE,
  MISSING_PHONE,
  toApplicantAddress,
  toApplicantName,
  toBirthDateLine,
} from '../manage-membership-applications-labels';
import type { MembershipApplicationDetails } from '../schemas';

const NAME_LABEL = 'Name';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const ADDRESS_LABEL = 'Anschrift';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';

interface MembershipApplicantPanelProps {
  application: MembershipApplicationDetails;
}

export const MembershipApplicantPanel: FC<MembershipApplicantPanelProps> = ({ application }) => {
  const name = toApplicantName(application);
  const birthDate = toBirthDateLine(application);
  const address = toApplicantAddress(application);
  const phone = application.phone ?? MISSING_PHONE;
  const minorNote = application.isMinor ? (
    <KkNote tone="warning" icon="info">
      {MINOR_NOTE}
    </KkNote>
  ) : null;

  return (
    <KkPanelSection title={APPLICANT_SECTION_TITLE}>
      <KkPanel>
        <KkFieldRow label={NAME_LABEL} value={name} />
        <KkFieldRow label={BIRTH_DATE_LABEL} value={birthDate} />
        <KkFieldRow label={ADDRESS_LABEL} value={address} />
        <KkFieldRow label={EMAIL_LABEL} value={application.email} />
        <KkFieldRow label={PHONE_LABEL} value={phone} />
      </KkPanel>
      {minorNote}
    </KkPanelSection>
  );
};
