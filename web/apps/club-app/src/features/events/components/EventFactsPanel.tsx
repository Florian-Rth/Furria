import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { EVENT_SECTION_TITLES, toClockLabel, toEventWhenLabel } from '../events-labels';
import type { EventDetails } from '../schemas';

const EDIT_LABEL = 'Bearbeiten';
const EDIT_ACTION_LABEL = 'Eckdaten bearbeiten';
const WHEN_LABEL = 'Wann';
const DOORS_LABEL = 'Einlass';
const VENUE_LABEL = 'Ort';
const TEASER_LABEL = 'Anreißer';
const DESCRIPTION_LABEL = 'Beschreibung';
const AGE_HINT_LABEL = 'Altershinweis';
const MISSING_VALUE = 'nicht angegeben';
const LANDING_KIND = 'event';

interface EventFactsPanelProps {
  event: EventDetails;
  highlightedKey: string | null;
}

export const EventFactsPanel: FC<EventFactsPanelProps> = ({ event, highlightedKey }) => {
  const landingKey = toLandingKey(LANDING_KIND, event.eventId);
  const whenLabel = toEventWhenLabel(event);
  const doorsLabel = toClockLabel(event.doorsOpenAt) ?? MISSING_VALUE;
  const venueLabel = event.venueName ?? MISSING_VALUE;
  const descriptionLabel = event.description ?? MISSING_VALUE;
  const ageHintLabel = event.ageHint ?? MISSING_VALUE;

  const action: KkPanelAction = {
    label: EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: '/events/$eventId/edit',
    params: { eventId: String(event.eventId) },
  };

  return (
    <KkPanelSection title={EVENT_SECTION_TITLES.facts} action={action}>
      <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
        <KkFieldRow label={WHEN_LABEL} value={whenLabel} />
        <KkFieldRow label={DOORS_LABEL} value={doorsLabel} />
        <KkFieldRow label={VENUE_LABEL} value={venueLabel} />
        <KkFieldRow label={TEASER_LABEL} value={event.teaser} />
        <KkFieldRow label={DESCRIPTION_LABEL} value={descriptionLabel} />
        <KkFieldRow label={AGE_HINT_LABEL} value={ageHintLabel} />
      </KkPanel>
    </KkPanelSection>
  );
};
