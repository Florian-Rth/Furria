import { KkButton, KkChip, KkFieldRow, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { formatAddress, formatIsoDay } from '@/lib/membership-labels';
import { toSwitchStateChip } from '@/lib/state-chips';
import { usePersonFormDialog } from '../hooks/use-person-form-dialog';
import { PERSON_SECTION_TITLES, toVisibilityPointer } from '../manage-persons-labels';
import type { PersonDetails } from '../schemas';
import { PersonFormDialog } from './PersonFormDialog';

const EDIT_LABEL = 'Bearbeiten';
const NAME_LABEL = 'Name';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';
const ADDRESS_LABEL = 'Adresse';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const VISIBILITY_LABEL = 'Für Mitglieder sichtbar';
const MISSING_VALUE = 'nicht hinterlegt';

interface PersonMasterDataPanelProps {
  person: PersonDetails;
}

export const PersonMasterDataPanel: FC<PersonMasterDataPanelProps> = ({ person }) => {
  const dialog = usePersonFormDialog();
  const address = formatAddress(person.street, person.zip, person.city);

  const action = (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="edit" size="small" />}
      onClick={dialog.open}
    >
      {EDIT_LABEL}
    </KkButton>
  );

  const visibility = toSwitchStateChip(person.contactVisibleToMembers);
  const visibilityChip = (
    <KkChip tone={visibility.tone} dot={visibility.dot}>
      {visibility.label}
    </KkChip>
  );

  return (
    <KkPanelSection title={PERSON_SECTION_TITLES.masterData} action={action}>
      <KkPanel>
        <KkFieldRow label={NAME_LABEL} value={`${person.firstName} ${person.lastName}`} />
        <KkFieldRow label={EMAIL_LABEL} value={person.email ?? MISSING_VALUE} />
        <KkFieldRow label={PHONE_LABEL} value={person.phone ?? MISSING_VALUE} />
        <KkFieldRow label={ADDRESS_LABEL} value={address ?? MISSING_VALUE} />
        <KkFieldRow
          label={BIRTH_DATE_LABEL}
          value={person.birthDate === null ? MISSING_VALUE : formatIsoDay(person.birthDate)}
        />
        <KkFieldRow
          label={VISIBILITY_LABEL}
          value={visibilityChip}
          hint={toVisibilityPointer(person.firstName)}
        />
      </KkPanel>
      <PersonFormDialog
        person={person}
        open={dialog.isOpen}
        onClose={dialog.close}
        onSaved={dialog.close}
      />
    </KkPanelSection>
  );
};
