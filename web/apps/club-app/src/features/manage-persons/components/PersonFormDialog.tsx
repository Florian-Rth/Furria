import { KkAlert, KkButton, KkDateField, KkModalFrame, KkNote, KkSwitchRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useId } from 'react';
import type { PersonFormSource } from '../hooks/use-person-form';
import { usePersonForm } from '../hooks/use-person-form';
import type { CreatedPerson } from '../schemas';
import { PersonFormFields } from './PersonFormFields';

const CREATE_TITLE = 'Person anlegen';
const EDIT_TITLE = 'Stammdaten bearbeiten';
const KICKER = 'Personenverwaltung';
const CREATE_EXPLANATION =
  'Name genügt. Kontaktdaten, Adresse und Geburtsdatum kannst du jederzeit nachtragen. Eine Mitgliedschaft entsteht dabei nicht — die trägst du danach im Profil der Person ein.';
const EDIT_EXPLANATION =
  'Änderungen an Stammdaten übernimmt die Personenverwaltung. Zeiträume, Ruhezeiten und Beitragsermäßigungen stehen im Profil der Person.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CREATE_CONFIRM_LABEL = 'Anlegen';
const EDIT_CONFIRM_LABEL = 'Speichern';
const BIRTH_DATE_LABEL = 'Geburtsdatum';
const BIRTH_DATE_HINT = 'Nur die Personenverwaltung sieht das Geburtsdatum.';
const BIRTH_DATE_EMPTY_LABEL = 'Nicht bekannt';
const VISIBILITY_LABEL = 'Kontaktdaten für Mitglieder sichtbar';
const VISIBILITY_DESCRIPTION =
  'Wird auf ihr Wort hin gesetzt, wenn die Person kein eigenes Konto hat. Mit Konto entscheidet sie selbst in „Mein Profil“.';

interface PersonFormDialogProps {
  person: PersonFormSource | null;
  open: boolean;
  onClose: () => void;
  onSaved: (saved: CreatedPerson) => void;
}

export const PersonFormDialog: FC<PersonFormDialogProps> = ({ person, open, onClose, onSaved }) => {
  const titleId = useId();
  const control = usePersonForm({ person, open, onSaved });
  const isEdit = person !== null;

  const rejection =
    control.rejection === null ? null : <KkAlert severity="error">{control.rejection}</KkAlert>;

  return (
    <KkModalFrame
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      closeLabel={CLOSE_LABEL}
      size="full"
    >
      <KkModalFrame.Kicker>{KICKER}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{isEdit ? EDIT_TITLE : CREATE_TITLE}</KkModalFrame.Title>
      <KkModalFrame.Body>
        <KkNote>{isEdit ? EDIT_EXPLANATION : CREATE_EXPLANATION}</KkNote>
      </KkModalFrame.Body>
      <Stack
        component="form"
        noValidate
        onSubmit={control.submit}
        sx={{ minWidth: 0, minHeight: 0, flexGrow: 1 }}
      >
        <KkModalFrame.Fields>
          <PersonFormFields form={control.form} errors={control.errors} />
          <KkDateField
            name="birthDate"
            label={BIRTH_DATE_LABEL}
            value={control.birthDate}
            onChange={control.setBirthDate}
            allowEmpty
            emptyLabel={BIRTH_DATE_EMPTY_LABEL}
            hint={BIRTH_DATE_HINT}
          />
          <KkSwitchRow
            label={VISIBILITY_LABEL}
            checked={control.contactVisibleToMembers}
            onChange={control.setContactVisibleToMembers}
            description={VISIBILITY_DESCRIPTION}
          />
        </KkModalFrame.Fields>
        <KkModalFrame.Footer>
          {rejection}
          <KkButton variant="outlined" onClick={onClose} disabled={control.isSaving}>
            {CANCEL_LABEL}
          </KkButton>
          <KkButton type="submit" loading={control.isSaving}>
            {isEdit ? EDIT_CONFIRM_LABEL : CREATE_CONFIRM_LABEL}
          </KkButton>
        </KkModalFrame.Footer>
      </Stack>
    </KkModalFrame>
  );
};
