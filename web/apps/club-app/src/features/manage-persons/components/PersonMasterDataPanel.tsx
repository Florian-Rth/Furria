import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSwitchRow } from '@furria/ui/KkSwitchRow';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMeQuery } from '@/features/session/api';
import { toLandingKey } from '@/features/write/landing-target';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import { useClubGroupConsentSwitch } from '../hooks/use-club-group-consent-switch';
import { useContactVisibilitySwitch } from '../hooks/use-contact-visibility-switch';
import { PERSON_SECTION_TITLES, toContactChangeNote } from '../manage-persons-labels';
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
const CLUB_GROUP_CONSENT_LABEL = 'In die WhatsApp-Vereinsgruppe aufnehmen';
const CLUB_GROUP_ON_HER_WORD = 'Nur auf ihren Wunsch einschalten.';
const CLUB_GROUP_DECIDES_HERSELF = 'Sie entscheidet das selbst in der App.';
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
  const clubGroupConsent = useClubGroupConsentSwitch(person);
  const clubGroupConsentHint = clubGroupConsent.decidesHerself
    ? CLUB_GROUP_DECIDES_HERSELF
    : CLUB_GROUP_ON_HER_WORD;
  const me = useMeQuery();
  const contactChange = toContactChangeNote(
    person.contactChange,
    me.data?.person?.id ?? null,
    new Date(),
  );
  const clubGroupConsentSwitch =
    me.data?.keepsClubGroup === true ? (
      <KkSwitchRow
        label={CLUB_GROUP_CONSENT_LABEL}
        description={clubGroupConsentHint}
        checked={clubGroupConsent.checked}
        onChange={clubGroupConsent.onChange}
        busy={clubGroupConsent.busy}
        disabled={clubGroupConsent.decidesHerself}
      />
    ) : null;
  const contactChangeNote = contactChange === undefined ? null : <KkNote>{contactChange}</KkNote>;
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
      {contactChangeNote}
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
          busy={visibility.busy}
        />
        {clubGroupConsentSwitch}
      </KkPanel>
    </KkPanelSection>
  );
};
