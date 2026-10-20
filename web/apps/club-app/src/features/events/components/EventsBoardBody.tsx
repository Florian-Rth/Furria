import { KkMasterDetail, KkNote, KkRetryAlert } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppListSkeleton } from '@/features/session';
import { EMPTY_FILTER_NOTE, LOADING_LABEL } from '../event-board-copy';
import { toEventsErrorMessage } from '../events-messages';
import { useEventsBoard } from '../hooks/use-events-board';
import type { EventPaneKey } from '../schemas';
import { EventsBoard } from './EventsBoard';
import { EventsHealthStrip } from './EventsHealthStrip';
import { EventsSidePane } from './EventsSidePane';

const RETRY_LABEL = 'Erneut laden';

export const EventsBoardBody: FC = () => {
  const hub = useEventsBoard();
  const { selection } = hub;

  if (hub.query.data === undefined) {
    const message = toEventsErrorMessage(hub.query.error);

    return message === null ? (
      <AppListSkeleton label={LOADING_LABEL} listShape="rows" />
    ) : (
      <KkRetryAlert
        message={message}
        retrying={hub.query.isFetching}
        onRetry={hub.reload}
        retryLabel={RETRY_LABEL}
      />
    );
  }

  const select = (eventId: number, pane: EventPaneKey): void => {
    selection.select({ eventId, pane });
  };
  const choosePane = (pane: EventPaneKey): void => {
    if (selection.selection !== null) {
      selection.select({ eventId: selection.selection.eventId, pane });
    }
  };
  const isSideOpen = selection.isWide && selection.selection !== null;
  const board =
    hub.rows.length === 0 ? (
      <KkNote>{EMPTY_FILTER_NOTE}</KkNote>
    ) : (
      <EventsBoard
        rows={hub.rows}
        isTable={hub.isTable}
        compact={isSideOpen}
        selection={selection.selection}
        onSelect={select}
      />
    );
  const masterSpan = isSideOpen ? 8 : 12;
  const side =
    selection.selection === null ? null : (
      <EventsSidePane
        selection={selection.selection}
        isWide={selection.isWide}
        onChoose={choosePane}
        onClose={selection.close}
      />
    );

  return (
    <Stack sx={{ gap: 2, minWidth: 0 }}>
      <EventsHealthStrip
        tally={hub.tally}
        filters={hub.filters}
        filter={hub.filter}
        onChoose={hub.chooseFilter}
      />
      <KkMasterDetail>
        <KkMasterDetail.Master span={masterSpan}>{board}</KkMasterDetail.Master>
        {side}
      </KkMasterDetail>
    </Stack>
  );
};
