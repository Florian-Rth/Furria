import { KkMeta } from '@furria/ui/KkMeta';
import { KkProgressRing } from '@furria/ui/KkProgressRing';
import { KkRecordHead } from '@furria/ui/KkRecordHead';
import { KkStatePill } from '@furria/ui/KkStatePill';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { EventHeadView } from '../event-pane-copy';
import type { EventDetails } from '../schemas';
import { EventThumb } from './EventThumb';

interface EventHeaderProps {
  event: EventDetails;
  view: EventHeadView;
}

export const EventHeader: FC<EventHeaderProps> = ({ event, view }) => {
  const picture = event.picture?.picture ?? null;
  const chips = view.chips.map((chip) => (
    <KkStatePill key={chip.key} state={chip.state} label={chip.label} sx={{ ml: 0 }} />
  ));

  const progress = view.cancelled ? undefined : (
    <Stack sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
      <KkProgressRing
        parts={view.tally.parts}
        label={view.tally.label}
        value={view.tally.value}
        size="large"
      />
      <KkMeta>{view.tally.caption}</KkMeta>
    </Stack>
  );

  return (
    <KkRecordHead
      eyebrow={view.eyebrow}
      title={event.title}
      cancelled={view.cancelled}
      media={
        <EventThumb
          eventId={event.eventId}
          picture={picture}
          cancelled={view.cancelled}
          shape="adaptive"
          size="large"
        />
      }
      chips={chips}
      progress={progress}
    />
  );
};
