import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import type { MePerson } from '@/lib/api/schemas';
import { formatAddress } from '@/lib/membership-labels';
import {
  CONTACT_DETAILS_EDIT_TITLE,
  CONTACT_DETAILS_LANDING,
  PROFILE_SECTION_TITLES,
  toOwnContactChangeNote,
} from '../profile-labels';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ROUTE = '/profile/contact/edit';
const PHONE_LABEL = 'Telefon';
const EMAIL_LABEL = 'E-Mail';
const ADDRESS_LABEL = 'Adresse';
const MISSING_VALUE = 'Nicht hinterlegt';

const EDIT_ACTION: KkPanelAction = {
  label: EDIT_LABEL,
  icon: 'edit',
  ariaLabel: CONTACT_DETAILS_EDIT_TITLE,
  component: Link,
  to: EDIT_ROUTE,
};

const LANDING_KEY = toLandingKey(CONTACT_DETAILS_LANDING.kind, CONTACT_DETAILS_LANDING.id);

interface ProfileContactPanelProps {
  person: MePerson;
  highlightedKey: string | null;
}

export const ProfileContactPanel: FC<ProfileContactPanelProps> = ({ person, highlightedKey }) => {
  const address = formatAddress(person.street, person.zip, person.city);
  const changeNote = toOwnContactChangeNote(person.contactChange, person.id, new Date());
  const isHighlighted = highlightedKey === LANDING_KEY;

  return (
    <KkPanelSection
      title={PROFILE_SECTION_TITLES.contact}
      action={EDIT_ACTION}
      description={changeNote}
    >
      <KkPanel highlight={isHighlighted} landing={LANDING_KEY}>
        <KkFieldRow label={PHONE_LABEL} value={person.phone ?? MISSING_VALUE} />
        <KkFieldRow label={EMAIL_LABEL} value={person.email ?? MISSING_VALUE} />
        <KkFieldRow label={ADDRESS_LABEL} value={address ?? MISSING_VALUE} />
      </KkPanel>
    </KkPanelSection>
  );
};
