import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { websiteAddressOf } from '@/lib/publish-copy';
import { ACTION_LABELS, PANE_ICONS, toStepActionLabel } from '../event-board-copy';
import type { EventPublishing } from '../hooks/use-event-publishing';
import type { PaneAction } from '../pane-actions';
import { ACTION_OPEN_LABEL, ACTION_PLAN_LABEL } from '../running-order-step-copy';
import type { EventDetails, EventPaneKey } from '../schemas';
import { EventPublishHold } from './EventPublishHold';

const PUBLIC_PATH = '/events/';
const HTTPS = 'https://';

interface EventPaneActionProps {
  action: PaneAction;
  event: EventDetails;
  publishing: EventPublishing;
  onChoose: (pane: EventPaneKey) => void;
}

export const EventPaneAction: FC<EventPaneActionProps> = ({
  action,
  event,
  publishing,
  onChoose,
}) => {
  const params = { eventId: String(event.eventId) };

  switch (action.kind) {
    case 'none':
      return null;
    case 'publish':
      return <EventPublishHold publishing={publishing} />;
    case 'view': {
      const href = `${HTTPS}${websiteAddressOf(`${PUBLIC_PATH}${event.eventId}`)}`;

      return (
        <KkButton
          size="large"
          variant="outlined"
          fullWidth
          href={href}
          startIcon={<KkIcon name="external" size="small" />}
        >
          {ACTION_LABELS.view}
        </KkButton>
      );
    }
    case 'picture':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/events/$eventId/manage"
          params={params}
          startIcon={<KkIcon name="image" size="small" />}
        >
          {ACTION_LABELS.picture}
        </KkButton>
      );
    case 'editDetails':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/events/$eventId/edit"
          params={params}
          startIcon={<KkIcon name="edit" size="small" />}
        >
          {ACTION_LABELS.editDetails}
        </KkButton>
      );
    case 'editTickets':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/events/$eventId/edit"
          params={params}
          startIcon={<KkIcon name="tickets" size="small" />}
        >
          {ACTION_LABELS.editTickets}
        </KkButton>
      );
    case 'album':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/gallery/new"
          search={{ entry: event.eventId }}
          startIcon={<KkIcon name="gallery" size="small" />}
        >
          {ACTION_LABELS.album}
        </KkButton>
      );
    case 'planRunningOrder':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/events/$eventId/ablauf"
          params={params}
          startIcon={<KkIcon name="timeline" size="small" />}
        >
          {ACTION_PLAN_LABEL}
        </KkButton>
      );
    case 'openRunningOrder':
      return (
        <KkButton
          size="large"
          fullWidth
          component={Link}
          to="/events/$eventId/ablauf"
          params={params}
          startIcon={<KkIcon name="timeline" size="small" />}
        >
          {ACTION_OPEN_LABEL}
        </KkButton>
      );
    case 'step': {
      const target = action.pane;
      const choose = (): void => {
        onChoose(target);
      };

      return (
        <KkButton
          size="large"
          variant="outlined"
          fullWidth
          onClick={choose}
          startIcon={<KkIcon name={PANE_ICONS[target]} size="small" />}
        >
          {toStepActionLabel(target)}
        </KkButton>
      );
    }
  }
};
