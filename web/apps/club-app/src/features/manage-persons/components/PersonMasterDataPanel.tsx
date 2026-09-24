import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkPanel, KkPanelSection, KkSwitchRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import { useContactVisibilitySwitch } from '../hooks/use-contact-visibility-switch';
import { PERSON_SECTION_TITLES, VISIBILITY_DESCRIPTION } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Stammdaten bearbeiten';
const EDIT_ROUTE = '/manage/persons/$personId/edit';
const NAME_LABEL = 'Name';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';
const ADDRESS_LABEL = 'Adresse';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const VISIBILITY_LABEL = 'Kontaktdaten für Mitglieder sichtbar';
const MISSING_VALUE = 'nicht hinterlegt';

interface PersonMasterDataPanelProps {
  person: PersonDetails;
  highlightedKey: string | null;
}

export const PersonMasterDataPanel: FC<PersonMasterDataPanelProps> = ({
  person,
  highlightedKey,
}) => {
  const visibility = useContactVisibilitySwitch(person);
  const address = formatAddress(person.street, person.zip, person.city);
  const landingKey = toLandingKey('person', person.personId);

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: EDIT_ROUTE,
    params: { personId: String(person.personId) },
  };

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.masterData} action={action}>
      <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
        <KkFieldRow label={NAME_LABEL} value={`${person.firstName} ${person.lastName}`} />
        <KkFieldRow label={EMAIL_LABEL} value={person.email ?? MISSING_VALUE} />
        <KkFieldRow label={PHONE_LABEL} value={person.phone ?? MISSING_VALUE} />
        <KkFieldRow label={ADDRESS_LABEL} value={address ?? MISSING_VALUE} />
        <KkFieldRow
          label={BIRTH_DATE_LABEL}
          value={person.birthDate === null ? MISSING_VALUE : formatIsoDay(person.birthDate)}
        />
        <KkSwitchRow
          label={VISIBILITY_LABEL}
          checked={visibility.checked}
          onChange={visibility.onChange}
          description={VISIBILITY_DESCRIPTION}
          busy={visibility.busy}
        />
      </KkPanel>
    </KkPanelSection>
  );
};
