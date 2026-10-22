import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLOSE_LABEL, OPEN_EVENT_LABEL, PANE_TITLES } from '../event-board-copy';
import type { PaneSelection } from '../hooks/use-pane-selection';
import type { EventPaneKey } from '../schemas';
import { EventPane } from './EventPane';

const PANE_SPAN = 4;

interface EventsSidePaneProps {
  selection: PaneSelection;
  isWide: boolean;
  onChoose: (pane: EventPaneKey) => void;
  onClose: () => void;
}

export const EventsSidePane: FC<EventsSidePaneProps> = ({
  selection,
  isWide,
  onChoose,
  onClose,
}) => {
  const params = { eventId: String(selection.eventId) };
  const title = PANE_TITLES[selection.pane];
  const openEvent = (
    <KkIconButton
      label={OPEN_EVENT_LABEL}
      icon="chevron"
      size="small"
      component={Link}
      to="/events/$eventId"
      params={params}
    />
  );

  if (!isWide) {
    return (
      <KkBottomDrawer open label={title} closeLabel={CLOSE_LABEL} onClose={onClose}>
        <EventPane
          key={selection.eventId}
          eventId={selection.eventId}
          pane={selection.pane}
          framed={false}
          showsThumb
          onChoose={onChoose}
          actions={openEvent}
        />
      </KkBottomDrawer>
    );
  }

  const actions = (
    <>
      {openEvent}
      <KkIconButton label={CLOSE_LABEL} icon="close" size="small" onClick={onClose} />
    </>
  );

  return (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <EventPane
        key={selection.eventId}
        eventId={selection.eventId}
        pane={selection.pane}
        framed
        showsThumb
        onChoose={onChoose}
        actions={actions}
      />
    </KkMasterDetail.Detail>
  );
};
