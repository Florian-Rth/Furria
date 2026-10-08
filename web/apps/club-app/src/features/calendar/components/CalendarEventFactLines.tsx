import { KkText } from '@furria/ui';
import type { FC } from 'react';
import { toEventFactsLine } from '../calendar-labels';
import type { CalendarEventFacts } from '../schemas';

interface CalendarEventFactLinesProps {
  facts: CalendarEventFacts;
}

export const CalendarEventFactLines: FC<CalendarEventFactLinesProps> = ({ facts }) => {
  const factsLine = toEventFactsLine(facts);

  const factsText =
    factsLine === null ? null : (
      <KkText variant="body2" tone="secondary">
        {factsLine}
      </KkText>
    );

  return (
    <>
      <KkText variant="body2">{facts.teaser}</KkText>
      {factsText}
    </>
  );
};
