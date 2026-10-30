import { KkFacetList } from '@furria/ui/KkFacetList';
import { KkMeta } from '@furria/ui/KkMeta';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { NONE } from '../act-c-copy';
import type { ActCView } from '../act-c-view';
import { eveningRowOf } from '../evening-rows';
import { eventLinkOf } from '../lab-act-c-paths';

const LIST_LABEL = 'Abende dieser Session';

interface ActCEveningsListProps {
  view: ActCView;
}

export const ActCEveningsList: FC<ActCEveningsListProps> = ({ view }) => {
  if (view.evenings.length === 0) {
    return <KkMeta>{NONE}</KkMeta>;
  }

  const rows = view.evenings.map((evening) => {
    const row = eveningRowOf(evening, view.nextEvening?.eventId ?? null);
    const link = eventLinkOf(evening.eventId);

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
