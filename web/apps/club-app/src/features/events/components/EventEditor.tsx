import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkTextField } from '@furria/ui/KkTextField';
import type { FC } from 'react';
import type { RunningVenue } from '@/features/calendar/schemas';
import { toScreenHelp } from '@/features/help/screen-help';
import { EVENTS_ORIGIN } from '@/features/session/app-sections';
import { WriteScreen } from '@/features/write/WriteScreen';
import { EVENT_EDITOR_HELP_SPOTS } from '../event-editor-help-copy';
import { presalePlaceChoicesOf, toEventVenueOptions, toPresalePlaceOptions } from '../event-form';
import { useEventEditor } from '../hooks/use-event-editor';
import { useEventEditorHelpViewer } from '../hooks/use-event-editor-help-viewer';
import type { EventDetails } from '../schemas';
import { EventEditorHelp } from './EventEditorHelp';
import { EventPicturePanel } from './EventPicturePanel';
import { EventScheduleSection } from './EventScheduleSection';
import { EventStagedPicturePanel } from './EventStagedPicturePanel';
import { EventTicketsSection } from './EventTicketsSection';
import { EventWebsiteTextsSection } from './EventWebsiteTextsSection';

const CREATE_TITLE = 'Veranstaltung anlegen';
const EDIT_TITLE = 'Veranstaltung bearbeiten';
const CREATE_LABEL = 'Anlegen';
const SAVE_LABEL = 'Speichern';
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
  const helpViewer = useEventEditorHelpViewer(control.isEditing);
  const help = toScreenHelp(<EventEditorHelp viewer={helpViewer} />);

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
  const presalePlaceOptions = toPresalePlaceOptions(
    presalePlaceChoicesOf(venues, event?.presalePlaces ?? [], control.values.presaleVenueIds),
  );
  const picture =
    event === null ? (
      <EventStagedPicturePanel
        desk={control.stagedPicture}
        landing={EVENT_EDITOR_HELP_SPOTS.picture}
      />
    ) : (
      <EventPicturePanel event={event} landing={EVENT_EDITOR_HELP_SPOTS.picture} />
    );

  return (
    <WriteScreen
      origin={origin}
      title={title}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      help={help}
      action={{
        primary: {
          label: actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          disabled: !control.canSubmit,
        },
      }}
    >
      <KkFormSection title={TITLE_SECTION} landing={EVENT_EDITOR_HELP_SPOTS.title}>
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
      <EventTicketsSection control={control} presalePlaceOptions={presalePlaceOptions} />
    </WriteScreen>
  );
};
