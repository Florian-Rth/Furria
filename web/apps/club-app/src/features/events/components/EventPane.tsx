import { KkPublishCeremony, KkSkeletonBlock, KkStepPane } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { PUBLISH_ANNOUNCEMENTS } from '@/lib/publish-copy';
import { PANE_TITLES } from '../event-board-copy';
import { useEventPane } from '../hooks/use-event-pane';
import type { EventPaneKey } from '../schemas';
import { EventPaneBody } from './EventPaneBody';
import { EventPaneFoot } from './EventPaneFoot';
import { EventPaneTabs } from './EventPaneTabs';
import { EventThumb } from './EventThumb';

const SKELETON_LINES = 6;

interface EventPaneProps {
  eventId: number;
  pane: EventPaneKey;
  framed: boolean;
  showsThumb: boolean;
  onChoose: (pane: EventPaneKey) => void;
  actions?: ReactNode;
}

export const EventPane: FC<EventPaneProps> = ({
  eventId,
  pane,
  framed,
  showsThumb,
  onChoose,
  actions,
}) => {
  const { event, head, tabs, action, publishing } = useEventPane(eventId, pane);
  const title = PANE_TITLES[pane];

  if (event === undefined || head === null) {
    return (
      <KkStepPane label={title} framed={framed}>
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </KkStepPane>
    );
  }

  const picture = event.picture?.picture ?? null;
  const cancelled = event.status === 'cancelled';
  const thumb = showsThumb ? (
    <EventThumb
      eventId={event.eventId}
      picture={picture}
      cancelled={cancelled}
      shape="wide"
      size="small"
    />
  ) : undefined;

  return (
    <KkPublishCeremony stage={publishing.ceremony} announcements={PUBLISH_ANNOUNCEMENTS}>
      <KkStepPane label={title} framed={framed}>
        <KkStepPane.Head
          icon={head.icon}
          title={head.title}
          context={head.context}
          state={head.state}
          stateLabel={head.stateLabel}
          due={head.due}
          media={thumb}
          actions={actions}
        />
        <EventPaneTabs eventTitle={event.title} tabs={tabs} pane={pane} onChoose={onChoose} />
        <KkStepPane.Body>
          <EventPaneBody event={event} pane={pane} />
        </KkStepPane.Body>
        <EventPaneFoot
          pane={pane}
          action={action}
          event={event}
          publishing={publishing}
          onChoose={onChoose}
        />
      </KkStepPane>
    </KkPublishCeremony>
  );
};
