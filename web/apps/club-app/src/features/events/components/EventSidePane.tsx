import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkMasterDetail } from '@furria/ui/KkMasterDetail';
import type { FC } from 'react';
import { CLOSE_LABEL, PANE_TITLES } from '../event-board-copy';
import type { EventPaneKey } from '../schemas';
import { EventPane } from './EventPane';

const PANE_SPAN = 8;

interface EventSidePaneProps {
  eventId: number;
  pane: EventPaneKey;
  isWide: boolean;
  onChoose: (pane: EventPaneKey) => void;
  onClose: () => void;
}

export const EventSidePane: FC<EventSidePaneProps> = ({
  eventId,
  pane,
  isWide,
  onChoose,
  onClose,
}) => {
  const title = PANE_TITLES[pane];

  if (!isWide) {
    return (
      <KkBottomDrawer open label={title} closeLabel={CLOSE_LABEL} onClose={onClose}>
        <EventPane
          eventId={eventId}
          pane={pane}
          framed={false}
          showsThumb={false}
          onChoose={onChoose}
        />
      </KkBottomDrawer>
    );
  }

  return (
    <KkMasterDetail.Detail span={PANE_SPAN}>
      <EventPane eventId={eventId} pane={pane} framed showsThumb={false} onChoose={onChoose} />
    </KkMasterDetail.Detail>
  );
};
