import {
  KkAlert,
  KkButton,
  KkConsequenceNote,
  KkDateField,
  KkModalFrame,
  KkNote,
} from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { useKeyHandoutForm } from '../hooks/use-key-handout-form';
import {
  HANDOUT_EXPLANATION,
  HANDOUT_PICKER_NOTE,
  toHandoutQuickChoices,
} from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';

const TITLE = 'Schlüssel ausgeben';
const DATE_LABEL = 'Ausgegeben am';
const DATE_HINT = 'Darf in der Zukunft liegen. Vorher steht der Schlüssel nicht in der Übersicht.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Ausgeben';

interface HandOutKeyDialogProps {
  venue: KeyVenue | null;
  onClose: () => void;
}

export const HandOutKeyDialog: FC<HandOutKeyDialogProps> = ({ venue, onClose }) => {
  const titleId = useId();
  const open = venue !== null;
  const form = useKeyHandoutForm({
    venueId: venue?.venueId ?? 0,
    venueName: venue?.name ?? '',
    open,
    onHandedOut: onClose,
  });
  const quickChoices = toHandoutQuickChoices(new Date());

  if (venue === null) {
    return null;
  }

  const consequence =
    form.consequence === null ? null : <KkConsequenceNote>{form.consequence}</KkConsequenceNote>;

  const rejection =
    form.rejection === null ? null : <KkAlert severity="error">{form.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{venue.name}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{TITLE}</KkModalFrame.Title>
      <KkModalFrame.Body>
        <KkNote>{HANDOUT_EXPLANATION}</KkNote>
      </KkModalFrame.Body>
      <KkModalFrame.Fields>
        <PersonPicker
          selected={form.person}
          onSelect={form.select}
          onClear={form.clearPerson}
          note={HANDOUT_PICKER_NOTE}
        />
        <KkDateField
          name="sinceOn"
          label={DATE_LABEL}
          value={form.sinceOn}
          onChange={form.setSinceOn}
          quickChoices={quickChoices}
          hint={DATE_HINT}
        />
        {consequence}
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {rejection}
        <KkButton variant="outlined" onClick={onClose} disabled={form.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={form.submit} loading={form.isSaving} disabled={!form.canSubmit}>
          {CONFIRM_LABEL}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
