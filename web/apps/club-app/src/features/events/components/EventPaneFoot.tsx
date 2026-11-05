import { KkButton } from '@furria/ui/KkButton';
import { KkStepPane } from '@furria/ui/KkStepPane';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SECONDARY_LINKS } from '../event-board-copy';
import { tablePlanNeedOfferOf } from '../hall-step';
import type { EventPublishing } from '../hooks/use-event-publishing';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import type { PaneAction } from '../pane-actions';
import type { EventDetails, EventPaneKey } from '../schemas';
import { EventPaneAction } from './EventPaneAction';
import { EventTablePlanNeedButton } from './EventTablePlanNeedButton';

interface EventPaneFootProps {
  pane: EventPaneKey;
  action: PaneAction;
  event: EventDetails;
  publishing: EventPublishing;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventPaneFoot: FC<EventPaneFootProps> = ({
  pane,
  action,
  event,
  publishing,
  onChoose,
}) => {
  const params = { eventId: String(event.eventId) };
  const links = SECONDARY_LINKS[pane];
  const { plansHall } = useEventsWorkbench();
  const offer = pane === 'hall' ? tablePlanNeedOfferOf(event, plansHall) : null;

  if (action.kind === 'none' && links.length === 0 && offer === null) {
    return null;
  }

  const linkButtons = links.map((link) => (
    <KkButton
      key={link.label}
      size="small"
      variant="text"
      component={Link}
      to={link.to}
      params={params}
    >
      {link.label}
    </KkButton>
  ));
  const needButton =
    offer === null ? null : <EventTablePlanNeedButton eventId={event.eventId} offer={offer} />;
  const quiet =
    links.length === 0 && offer === null ? null : (
      <Stack direction="row" sx={{ columnGap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {linkButtons}
        {needButton}
      </Stack>
    );

  return (
    <KkStepPane.Foot>
      <EventPaneAction action={action} event={event} publishing={publishing} onChoose={onChoose} />
      {quiet}
    </KkStepPane.Foot>
  );
};
