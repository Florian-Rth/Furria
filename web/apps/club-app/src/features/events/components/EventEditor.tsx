import { KkFormSection, KkNote, KkTextField } from '@furria/ui';
import type { FC } from 'react';
import type { RunningVenue } from '@/features/calendar';
import { EVENTS_ORIGIN } from '@/features/session';
import { WriteScreen } from '@/features/write';
import { toEventVenueOptions } from '../event-form';
import { useEventEditor } from '../hooks/use-event-editor';
import type { EventDetails } from '../schemas';
import { EventPicturePanel } from './EventPicturePanel';
import { EventScheduleSection } from './EventScheduleSection';
import { EventStagedPicturePanel } from './EventStagedPicturePanel';
import { EventTicketsSection } from './EventTicketsSection';
import { EventWebsiteTextsSection } from './EventWebsiteTextsSection';

const CREATE_TITLE = 'Veranstaltung anlegen';
const EDIT_TITLE = 'Veranstaltung bearbeiten';
const CREATE_LABEL = 'Anlegen';
const SAVE_LABEL = 'Speichern';
const CREATE_NOTE =
  'Die Veranstaltung bleibt in Vorbereitung und nur hier sichtbar. Auf die Website und in den Kalender kommt sie, wenn du sie unter „Eckdaten“ veröffentlichst.';

const TITLE_SECTION = 'Veranstaltung';
const TITLE_LABEL = 'Titel';

interface EventEditorProps {
  event: EventDetails | null;
  venues: readonly RunningVenue[];
}

export const EventEditor: FC<EventEditorProps> = ({ event, venues }) => {
  const control = useEventEditor(event);
  const titleField = control.form.register('title');
  const titleErrorText = control.form.formState.errors.title?.message;

  const title = control.isEditing ? EDIT_TITLE : CREATE_TITLE;
  const actionLabel = control.isEditing ? SAVE_LABEL : CREATE_LABEL;
  const origin =
    event === null
      ? EVENTS_ORIGIN
      : {
          label: event.title,
          to: '/events/$eventId',
          params: { eventId: String(event.eventId) },
        };
  const venueOptions = toEventVenueOptions(venues, event);
  const intro = control.isEditing ? null : <KkNote>{CREATE_NOTE}</KkNote>;
  const picture =
    event === null ? (
      <EventStagedPicturePanel desk={control.stagedPicture} />
    ) : (
      <EventPicturePanel event={event} />
    );

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      {intro}
      <KkFormSection title={TITLE_SECTION}>
        <KkTextField
          name={titleField.name}
          label={TITLE_LABEL}
          required
          error={titleErrorText !== undefined}
          helperText={titleErrorText}
          onChange={titleField.onChange}
          onBlur={titleField.onBlur}
          inputRef={titleField.ref}
        />
      </KkFormSection>
      {picture}
      <EventScheduleSection control={control} venueOptions={venueOptions} />
      <EventWebsiteTextsSection control={control} />
      <EventTicketsSection control={control} />
    </WriteScreen>
  );
};
