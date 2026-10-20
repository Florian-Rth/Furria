import { KkButton, KkStepPane } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SECONDARY_LINKS } from '../event-board-copy';
import type { EventPublishing } from '../hooks/use-event-publishing';
import type { PaneAction } from '../pane-actions';
import type { EventDetails, EventPaneKey } from '../schemas';
import { EventPaneAction } from './EventPaneAction';

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

  if (action.kind === 'none' && links.length === 0) {
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
  const quiet =
    links.length === 0 ? null : (
      <Stack direction="row" sx={{ columnGap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {linkButtons}
      </Stack>
    );

  return (
    <KkStepPane.Foot>
      <EventPaneAction action={action} event={event} publishing={publishing} onChoose={onChoose} />
      {quiet}
    </KkStepPane.Foot>
  );
};
