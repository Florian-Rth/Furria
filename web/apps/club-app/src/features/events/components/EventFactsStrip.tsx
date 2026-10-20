import { KkFactStrip } from '@furria/ui';
import type { FC } from 'react';
import { FACTS_LABEL } from '../event-board-copy';
import { toEventFacts } from '../event-pane-copy';
import type { EventDetails } from '../schemas';

interface EventFactsStripProps {
  event: EventDetails;
  today: string;
}

export const EventFactsStrip: FC<EventFactsStripProps> = ({ event, today }) => {
  const facts = toEventFacts(event, today).map((fact) => (
    <KkFactStrip.Fact
      key={fact.key}
      label={fact.label}
      value={fact.value}
      icon={fact.icon}
      state={fact.state}
    />
  ));

  return <KkFactStrip label={FACTS_LABEL}>{facts}</KkFactStrip>;
};
