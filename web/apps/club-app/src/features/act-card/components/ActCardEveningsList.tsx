import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NONE } from '../act-card-copy';
import { calendarEntryLinkOf } from '../act-card-paths';
import type { ActCardView } from '../act-card-view';
import { eveningRowOf } from '../evening-rows';

const LIST_LABEL = 'Abende dieser Session';

interface ActCardEveningsListProps {
  view: ActCardView;
}

export const ActCardEveningsList: FC<ActCardEveningsListProps> = ({ view }) => {
  if (view.evenings.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const rows = view.evenings.map((evening) => {
    const row = eveningRowOf(evening, view.nextEvening?.eventId ?? null);
    const link = calendarEntryLinkOf(evening.eventId);

    return (
      <KkFacetList.Row
        key={evening.eventId}
        lead={row.lead}
        leadTone={row.leadTone}
        title={evening.title}
        meta={row.meta}
        current={row.current}
        component={Link}
        to={link.to}
        params={link.params}
      />
    );
  });

  return <KkFacetList label={LIST_LABEL}>{rows}</KkFacetList>;
};
