import { KkMasterDetail, KkRetryAlert, KkSkeletonBlock } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session';
import { isNotFoundError } from '@/lib/query-error';
import { EVENT_LOADING_LABEL } from '../event-board-copy';
import { toEventErrorMessage } from '../events-messages';
import type { EventPageState } from '../hooks/use-event-page';
import { EventFactsStrip } from './EventFactsStrip';
import { EventHeader } from './EventHeader';
import { EventLaterSheet } from './EventLaterSheet';
import { EventNotFound } from './EventNotFound';
import { EventSidePane } from './EventSidePane';
import { EventStepList } from './EventStepList';

const RETRY_LABEL = 'Erneut laden';
const SKELETON_LINES = 8;
const LIST_SPAN = 4;

interface EventBodyProps {
  page: EventPageState;
}

export const EventBody: FC<EventBodyProps> = ({ page }) => {
  const { query, eventId } = page;
  const event = query.data;

  if (eventId === null || isNotFoundError(query.error)) {
    return <EventNotFound />;
  }
  if (event === undefined || page.head === null) {
    const message = toEventErrorMessage(query.error);
    const reload = (): void => {
      void query.refetch();
    };

    return message === null ? (
      <AppSkeletonRegion label={EVENT_LOADING_LABEL}>
        <KkSkeletonBlock lines={SKELETON_LINES} />
      </AppSkeletonRegion>
    ) : (
      <KkRetryAlert
        message={message}
        retrying={query.isFetching}
        onRetry={reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const pane =
    page.pane === null ? null : (
      <EventSidePane
        eventId={eventId}
        pane={page.pane}
        isWide={page.step.isWide}
        onChoose={page.step.choose}
        onClose={page.step.close}
      />
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <EventHeader event={event} view={page.head} />
      <EventFactsStrip event={event} today={page.today} />
      <KkMasterDetail>
        <KkMasterDetail.Master span={LIST_SPAN}>
          <EventStepList
            event={event}
            cells={page.cells}
            pane={page.pane}
            onChoose={page.step.choose}
          />
        </KkMasterDetail.Master>
        {pane}
      </KkMasterDetail>
      <EventLaterSheet />
    </Stack>
  );
};
