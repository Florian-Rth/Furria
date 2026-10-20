import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { checksOf, DETAIL_CHECKS } from '../detail-checks';
import type { EventDetails } from '../schemas';
import { EventCheckRow } from './EventCheckRow';

interface EventPaneDetailsProps {
  event: EventDetails;
}

export const EventPaneDetails: FC<EventPaneDetailsProps> = ({ event }) => {
  const rows = checksOf(event, DETAIL_CHECKS).map((check) => {
    const showsFix = check.fix !== 'picture';

    return <EventCheckRow key={check.key} check={check} event={event} showsFix={showsFix} />;
  });

  return <Stack>{rows}</Stack>;
};
