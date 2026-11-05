import type { KkStepState } from '@furria/ui/step-state';
import type { PlannedEvent } from './event-plan';
import { isCancelledEvent } from './event-plan';

export type TablePlanNeedOffer = 'drop' | 'restore' | null;

export interface HallChecks {
  skipped: boolean;
  tables: number | null;
  chairs: number | null;
  planState: KkStepState;
  tablesState: KkStepState;
}

export const hallChecksOf = (
  event: Pick<PlannedEvent, 'tablePlan' | 'withoutTablePlan'>,
): HallChecks => {
  const plan = event.tablePlan;

  if (plan === null) {
    return {
      skipped: event.withoutTablePlan,
      tables: null,
      chairs: null,
      planState: event.withoutTablePlan ? 'off' : 'open',
      tablesState: event.withoutTablePlan ? 'off' : 'open',
    };
  }

  return {
    skipped: false,
    tables: plan.tables,
    chairs: plan.chairs,
    planState: 'done',
    tablesState: plan.tables > 0 ? 'done' : 'open',
  };
};

export const tablePlanNeedOfferOf = (
  event: Pick<PlannedEvent, 'tablePlan' | 'withoutTablePlan' | 'isOver' | 'status'>,
  plansHall: boolean,
): TablePlanNeedOffer => {
  if (!plansHall || event.isOver || isCancelledEvent(event) || event.tablePlan !== null) {
    return null;
  }

  return event.withoutTablePlan ? 'restore' : 'drop';
};
