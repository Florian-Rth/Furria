import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import { useVisitHistory } from '@/features/act-studio/hooks/use-visit-history';
import type { Studio } from '@/features/acts/schemas';
import { LANE_HISTORY_EMPTY, LANE_HISTORY_LIST } from '../lane-copy';

interface LaneHistoryPaneProps {
  actId: number;
  studio: Studio;
}

export const LaneHistoryPane: FC<LaneHistoryPaneProps> = ({ actId, studio }) => {
  const history = useVisitHistory(actId, studio);
  const body =
    history.rows.length === 0 ? (
      <KkLaneInspector.Note text={LANE_HISTORY_EMPTY} />
    ) : (
      <KkLaneInspector.Log label={LANE_HISTORY_LIST} rows={history.rows} />
    );

  return body;
};
