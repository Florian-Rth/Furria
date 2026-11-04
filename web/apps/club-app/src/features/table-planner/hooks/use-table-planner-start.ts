import { useNavigate } from '@tanstack/react-router';
import type { EventDetails } from '@/features/events/schemas';
import {
  useCreateHallMutation,
  useCreateTablePlanMutation,
  useHallsQuery,
  useTablePlansQuery,
} from '@/features/hall-plan/api';
import type { TablePlanSummary } from '@/features/hall-plan/schemas';
import type { HallOption } from '../planner-start';
import { copySourcesOf, hallOptionsOf, newHallNameOf } from '../planner-start';
import { HALL_BUILDER_ROUTE } from './use-hall-edit-action';

export interface TablePlannerStartState {
  isLoading: boolean;
  isBusy: boolean;
  halls: HallOption[];
  copySources: TablePlanSummary[];
  canDraw: boolean;
  chooseHall: (hallId: number) => void;
  copyFrom: (source: TablePlanSummary) => void;
  drawHall: () => void;
}

export const useTablePlannerStart = (
  eventId: number,
  event: EventDetails,
): TablePlannerStartState => {
  const navigate = useNavigate();
  const halls = useHallsQuery();
  const plans = useTablePlansQuery();
  const createPlan = useCreateTablePlanMutation(eventId);
  const createHall = useCreateHallMutation();
  const venueId = event.venueId;

  return {
    isLoading: halls.data === undefined || plans.data === undefined,
    isBusy: createPlan.isPending || createHall.isPending,
    halls: hallOptionsOf(halls.data?.halls ?? [], venueId),
    copySources: copySourcesOf(plans.data?.plans ?? [], eventId),
    canDraw: venueId !== null,
    chooseHall: (hallId) => {
      createPlan.mutate({ hallId, copyFromEventId: null });
    },
    copyFrom: (source) => {
      createPlan.mutate({ hallId: source.hallId, copyFromEventId: source.eventId });
    },
    drawHall: () => {
      if (venueId === null) {
        return;
      }
      const name = newHallNameOf(halls.data?.halls ?? [], venueId, event.venueName);
      createHall.mutate(
        { venueId, name },
        {
          onSuccess: ({ hallId }) => {
            void navigate({ to: HALL_BUILDER_ROUTE, params: { hallId: String(hallId) } });
          },
        },
      );
    },
  };
};
