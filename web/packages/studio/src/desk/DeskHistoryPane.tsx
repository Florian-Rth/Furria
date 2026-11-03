import { DESK_HISTORY_EMPTY, DESK_HISTORY_LIST } from '@furria/studio/desk-copy';
import type { VisitHistory } from '@furria/studio/visit-history';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface DeskHistoryPaneProps {
  history: VisitHistory;
}

export const DeskHistoryPane: FC<DeskHistoryPaneProps> = ({ history }) => {
  const body =
    history.rows.length === 0 ? (
      <KkLaneInspector.Note text={DESK_HISTORY_EMPTY} />
    ) : (
      <KkLaneInspector.Log label={DESK_HISTORY_LIST} rows={history.rows} />
    );

  return body;
};
