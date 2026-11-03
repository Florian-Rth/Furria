import { DESK_HISTORY_EMPTY, DESK_HISTORY_LIST } from '@furria/studio/desk-copy';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { ActStudio } from '@/features/acts/schemas';

interface DeskHistoryPaneProps {
  actId: number;
  studio: ActStudio;
}

export const DeskHistoryPane: FC<DeskHistoryPaneProps> = ({ actId, studio }) => {
  const history = useVisitHistory(actId, studio);
  const body =
    history.rows.length === 0 ? (
      <KkLaneInspector.Note text={DESK_HISTORY_EMPTY} />
    ) : (
      <KkLaneInspector.Log label={DESK_HISTORY_LIST} rows={history.rows} />
    );

  return body;
};
