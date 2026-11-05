import { useKkNotice } from '@furria/ui/KkNotice';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import { useState } from 'react';
import { useEventQuery } from '@/features/events/api';
import type { EventDetails } from '@/features/events/schemas';
import { useSeatingQuery, useTablePlanQuery } from '@/features/hall-plan/api';
import type { SeatingResponse, TablePlanResponse } from '@/features/hall-plan/schemas';
import { tablePlannerOriginOf } from '../planner-origin';
import { CHANGED_ELSEWHERE } from '../table-planner-copy';

export type TablePlannerStage =
  | { kind: 'loading' }
  | { kind: 'failed'; retrying: boolean; retry: () => void }
  | { kind: 'start'; event: EventDetails; seating: SeatingResponse }
  | { kind: 'editing'; plan: TablePlanResponse; seating: SeatingResponse; edition: number };

export interface TablePlannerScreenState {
  origin: KkScreenOrigin;
  stage: TablePlannerStage;
  onConflict: () => void;
}

export const useTablePlannerScreen = (eventId: number): TablePlannerScreenState => {
  const event = useEventQuery(eventId);
  const plan = useTablePlanQuery(eventId);
  const seating = useSeatingQuery();
  const raiseNotice = useKkNotice();
  const [edition, setEdition] = useState(0);
  const origin = tablePlannerOriginOf(eventId, event.data?.title);

  const onConflict = (): void => {
    raiseNotice({ tone: 'info', message: CHANGED_ELSEWHERE });
    void plan.refetch().then(() => {
      setEdition((current) => current + 1);
    });
  };

  if (plan.error !== null || seating.error !== null || event.error !== null) {
    const retry = (): void => {
      void plan.refetch();
      void seating.refetch();
      void event.refetch();
    };

    return {
      origin,
      onConflict,
      stage: {
        kind: 'failed',
        retrying: plan.isFetching || seating.isFetching || event.isFetching,
        retry,
      },
    };
  }
  if (plan.data === undefined || seating.data === undefined || event.data === undefined) {
    return { origin, onConflict, stage: { kind: 'loading' } };
  }
  if (plan.data === null) {
    return {
      origin,
      onConflict,
      stage: { kind: 'start', event: event.data, seating: seating.data },
    };
  }

  return {
    origin,
    onConflict,
    stage: { kind: 'editing', plan: plan.data, seating: seating.data, edition },
  };
};
