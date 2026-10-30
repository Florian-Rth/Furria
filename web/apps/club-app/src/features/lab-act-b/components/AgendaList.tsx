import { KkAgenda } from '@furria/ui/KkAgenda';
import { KkNote } from '@furria/ui/KkNote';
import type { FC } from 'react';
import type { AgendaWeek } from '../act-agenda';
import { AGENDA_EMPTY, toMoreLabel, toSpanMeta, toSpanTitle } from '../agenda-copy';
import type { AgendaEntryRole } from './AgendaEntry';
import { AgendaEntry } from './AgendaEntry';

interface AgendaListProps {
  weeks: readonly AgendaWeek[];
  hidden: number;
  now: number;
  role: AgendaEntryRole;
  onExpand: () => void;
}

export const AgendaList: FC<AgendaListProps> = ({ weeks, hidden, now, role, onExpand }) => {
  if (weeks.length === 0) {
    return <KkNote>{AGENDA_EMPTY}</KkNote>;
  }

  const sections = weeks.map((week) => {
    const rows = week.entries.map((entry) => (
      <AgendaEntry
        key={entry.item.key}
        item={entry.item}
        order={entry.order}
        current={entry.current}
        showsDate={!entry.sameDay}
        role={role}
      />
    ));
    const title = toSpanTitle(week.span, now);
    const meta = toSpanMeta(week.entries.map((entry) => entry.item));

    return (
      <KkAgenda.Week key={week.id} title={title} meta={meta} lead={week.lead}>
        {rows}
      </KkAgenda.Week>
    );
  });
  const more =
    hidden === 0 ? null : <KkAgenda.More label={toMoreLabel(hidden)} onSelect={onExpand} />;

  return (
    <KkAgenda>
      {sections}
      {more}
    </KkAgenda>
  );
};
