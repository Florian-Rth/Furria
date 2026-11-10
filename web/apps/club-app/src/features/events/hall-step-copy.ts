import { toChairCountLabel, toTableCountLabel } from './event-board-copy';
import type { HallChecks, TablePlanNeedOffer } from './hall-step';

export const PLAN_CHECK_LABEL = 'Tischplan';
export const TABLES_CHECK_LABEL = 'Tische gestellt';
export const CHAIRS_CHECK_LABEL = 'Stühle';
export const SKIPPED_LABEL = 'Saal & Tische';
export const SKIPPED_VALUE = 'kein Tischplan nötig';
export const ACTION_PLAN_TABLES_LABEL = 'Tischplan anlegen';
export const ACTION_OPEN_TABLES_LABEL = 'Tischplan öffnen';

const MISSING_PLAN = 'noch keiner';
const NONE_PLACED = 'noch keiner';

export const toPlanValue = (checks: HallChecks): string =>
  checks.tables === null ? MISSING_PLAN : 'angelegt';

export const toTablesValue = (checks: HallChecks): string =>
  checks.tables === null || checks.tables === 0 ? NONE_PLACED : toTableCountLabel(checks.tables);

export const toChairsValue = (checks: HallChecks): string =>
  checks.chairs === null ? '–' : toChairCountLabel(checks.chairs);

export const NEED_OFFER_LABELS: Record<Exclude<TablePlanNeedOffer, null>, string> = {
  drop: 'Kein Tischplan nötig',
  restore: 'Doch einen Tischplan',
};
