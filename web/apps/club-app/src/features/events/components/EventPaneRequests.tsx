import { KkCheckLine, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { REQUEST_PATIENCE_DAYS } from '../event-board';
import { QUIET_NOTE } from '../event-board-copy';
import { toCountValue, toWaitingValue } from '../event-pane-copy';
import { waitingDaysOf } from '../event-plan';
import { useEventsWorkbench } from '../hooks/use-events-workbench';
import { usePlanClock } from '../hooks/use-plan-clock';
import type { EventDetails } from '../schemas';
import { EventRequestsPanel } from './EventRequestsPanel';

const OPEN_LABEL = 'Offen';
const CARDS_LABEL = 'Karten';
const OLDEST_LABEL = 'Älteste';
const NO_KEY_NOTE = 'Kartenanfragen beantwortet, wer das Recht dafür hat.';
const PATIENCE_NOTE = `Länger als ${REQUEST_PATIENCE_DAYS} Tage unbeantwortet gilt als überfällig — und hält die Karten offen.`;

interface EventPaneRequestsProps {
  event: EventDetails;
}

export const EventPaneRequests: FC<EventPaneRequestsProps> = ({ event }) => {
  const { handlesRequests } = useEventsWorkbench();
  const { today } = usePlanClock();
  const tally = event.ticketRequests;
  const hasOpen = tally.open > 0;
  const waiting = hasOpen ? waitingDaysOf(tally.oldestRequestedAt, today) : null;
  const oldestState = waiting !== null && waiting > REQUEST_PATIENCE_DAYS ? 'overdue' : 'current';
  const openValue = toCountValue(tally.open, 'Anfrage', 'Anfragen');
  const cardsValue = toCountValue(tally.cards, 'Karte', 'Karten');
  const oldestValue = toWaitingValue(waiting);
  const list = handlesRequests ? (
    <EventRequestsPanel eventId={event.eventId} />
  ) : (
    <KkNote>{NO_KEY_NOTE}</KkNote>
  );
  const counts = hasOpen ? (
    <Stack>
      <KkCheckLine label={OPEN_LABEL} value={openValue} state="current" icon="inbox" />
      <KkCheckLine label={CARDS_LABEL} value={cardsValue} state="done" icon="tickets" />
      <KkCheckLine label={OLDEST_LABEL} value={oldestValue} state={oldestState} icon="clock" />
    </Stack>
  ) : (
    <KkCheckLine label={OPEN_LABEL} value={QUIET_NOTE} state="off" icon="inbox" />
  );

  return (
    <>
      {counts}
      {list}
      <KkNote tone="hint">{PATIENCE_NOTE}</KkNote>
    </>
  );
};
