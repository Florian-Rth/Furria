import { KkCheckLine, KkNote, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { websiteAddressOf } from '@/lib/publish-copy';
import { checksOf, PUBLISH_CHECKS } from '../detail-checks';
import { toOnlineSince } from '../event-pane-copy';
import { publishStateOf } from '../event-plan';
import type { EventDetails } from '../schemas';
import { EventCheckRow } from './EventCheckRow';

const ONLINE_LABEL = 'Online seit';
const ADDRESS_LABEL = 'Adresse';
const CALENDAR_LABEL = 'Kalender';
const CALENDAR_VALUE = 'bei allen Mitgliedern';
const NEEDS_TITLE = 'Was die Website braucht';
const READY_NOTE =
  'Alles steht. Gedrückt halten — dann steht der Abend auf der Website und im Kalender aller Mitglieder.';
const BLOCKED_NOTE = 'Veröffentlichen geht, sobald jede Angabe steht.';
const CLOSED_NOTE = 'Abgesagt oder vorbei kommt der Abend nicht mehr auf die Website.';
const PUBLIC_PATH = '/events/';
const NOTES = { ready: READY_NOTE, blocked: BLOCKED_NOTE, closed: CLOSED_NOTE } as const;

interface EventPaneWebsiteProps {
  event: EventDetails;
}

export const EventPaneWebsite: FC<EventPaneWebsiteProps> = ({ event }) => {
  const state = publishStateOf(event);

  if (state === 'published' && event.publishedAt !== null) {
    const address = websiteAddressOf(`${PUBLIC_PATH}${event.eventId}`);
    const onlineSince = toOnlineSince(event.publishedAt);

    return (
      <Stack>
        <KkCheckLine label={ONLINE_LABEL} value={onlineSince} state="done" icon="calendar" />
        <KkCheckLine label={ADDRESS_LABEL} value={address} state="done" icon="link" />
        <KkCheckLine label={CALENDAR_LABEL} value={CALENDAR_VALUE} state="done" icon="members" />
      </Stack>
    );
  }

  const rows = checksOf(event, PUBLISH_CHECKS).map((check) => (
    <EventCheckRow key={check.key} check={check} event={event} />
  ));
  const note = state === 'published' ? null : <KkNote>{NOTES[state]}</KkNote>;

  return (
    <>
      <KkPanelSection title={NEEDS_TITLE}>
        <Stack>{rows}</Stack>
      </KkPanelSection>
      {note}
    </>
  );
};
