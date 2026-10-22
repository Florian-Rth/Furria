import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextArea } from '@furria/ui/KkTextArea';
import type { FC } from 'react';
import type { EventEditorControl } from '../hooks/use-event-editor';
import { EVENT_DESCRIPTION_MAX_LENGTH, EVENT_TEASER_MAX_LENGTH } from '../schemas';

const SECTION_TITLE = 'Texte für die Website';
const TEASER_LABEL = 'Kurzbeschreibung';
const TEASER_PLACEHOLDER = 'Ein Satz, der Lust auf den Abend macht';
const TEASER_HINT = 'Steht in der Veranstaltungsübersicht und in Link-Vorschauen.';
const TEASER_ROWS = 2;
const DESCRIPTION_LABEL = 'Ausführliche Beschreibung';
const DESCRIPTION_PLACEHOLDER = 'Programm, Mitwirkende, was die Gäste erwartet';
const DESCRIPTION_HINT = 'Steht auf der Seite der Veranstaltung. Ohne Formatierung.';
const DESCRIPTION_ROWS = 6;

const toCountLabel = (used: number, max: number): string => `${used} von ${max} Zeichen`;

interface EventWebsiteTextsSectionProps {
  control: EventEditorControl;
}

export const EventWebsiteTextsSection: FC<EventWebsiteTextsSectionProps> = ({ control }) => {
  const errors = control.form.formState.errors;
  const teaserErrorText = errors.teaser?.message;
  const descriptionErrorText = errors.description?.message;

  return (
    <KkFormSection title={SECTION_TITLE}>
      <KkTextArea
        name="teaser"
        label={TEASER_LABEL}
        required
        value={control.values.teaser}
        onChange={control.setTeaser}
        rows={TEASER_ROWS}
        maxLength={EVENT_TEASER_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={TEASER_PLACEHOLDER}
        hint={TEASER_HINT}
        error={teaserErrorText !== undefined}
        helperText={teaserErrorText}
      />
      <KkTextArea
        name="description"
        label={DESCRIPTION_LABEL}
        value={control.values.description}
        onChange={control.setDescription}
        rows={DESCRIPTION_ROWS}
        maxLength={EVENT_DESCRIPTION_MAX_LENGTH}
        showCount
        countLabel={toCountLabel}
        placeholder={DESCRIPTION_PLACEHOLDER}
        hint={DESCRIPTION_HINT}
        error={descriptionErrorText !== undefined}
        helperText={descriptionErrorText}
      />
    </KkFormSection>
  );
};
