import { placedLinesOf } from '@/features/running-order/running-order-ops';
import { actLineKeyOf } from '@/features/running-order/running-order-review';
import type { ActGroup, CatalogueAct, RunningOrderSummary } from '@/features/running-order/schemas';
import type { RunningOrderDraft } from '@/features/running-order/types';

export type CatalogueSection =
  | { kind: 'group'; id: string; group: ActGroup; acts: CatalogueAct[] }
  | { kind: 'points'; id: string; acts: CatalogueAct[] };

export type CatalogueRowState =
  | { kind: 'off' }
  | { kind: 'placed'; place: number }
  | { kind: 'new' };

export interface PreviousEvening {
  eventId: number;
  title: string;
  startsAt: string;
  actIds: number[];
  missing: number;
}

const POINTS_SECTION_ID = 'points';
const MAX_PREVIOUS = 3;
const COLLATOR = new Intl.Collator('de-DE');

const isInEvening = (draft: RunningOrderDraft, actId: number): boolean =>
  draft.lines.some((line) => line.key === actLineKeyOf(actId));

export const availableActsOf = (
  acts: readonly CatalogueAct[],
  draft: RunningOrderDraft,
): CatalogueAct[] => acts.filter((act) => !act.archived && !isInEvening(draft, act.actId));

export const catalogueRowStateOf = (draft: RunningOrderDraft, actId: number): CatalogueRowState => {
  const key = actLineKeyOf(actId);

  if (!isInEvening(draft, actId)) {
    return { kind: 'off' };
  }

  const index = placedLinesOf(draft).findIndex((line) => line.key === key);

  return index < 0 ? { kind: 'new' } : { kind: 'placed', place: index + 1 };
};

export const archivedLeftOutOf = (
  acts: readonly CatalogueAct[],
  draft: RunningOrderDraft,
  actIds: readonly number[],
): number =>
  acts.filter((act) => act.archived && actIds.includes(act.actId) && !isInEvening(draft, act.actId))
    .length;

export const archivedActIdsOf = (acts: readonly CatalogueAct[]): Set<number> =>
  new Set(acts.filter((act) => act.archived).map((act) => act.actId));

export const catalogueSectionsOf = (
  acts: readonly CatalogueAct[],
  draft: RunningOrderDraft,
): CatalogueSection[] => {
  const available = acts
    .filter((act) => !act.archived || isInEvening(draft, act.actId))
    .sort((left, right) => COLLATOR.compare(left.name, right.name));
  const groups = new Map<number, CatalogueSection & { kind: 'group' }>();
  const points: CatalogueAct[] = [];

  for (const act of available) {
    if (act.group === null) {
      points.push(act);
      continue;
    }

    const section = groups.get(act.group.groupId);

    if (section === undefined) {
      groups.set(act.group.groupId, {
        kind: 'group',
        id: `group:${act.group.groupId}`,
        group: act.group,
        acts: [act],
      });
    } else {
      section.acts.push(act);
    }
  }

  const grouped: CatalogueSection[] = [...groups.values()].sort((left, right) =>
    left.kind === 'group' && right.kind === 'group'
      ? COLLATOR.compare(left.group.name, right.group.name)
      : 0,
  );

  return points.length === 0
    ? grouped
    : [...grouped, { kind: 'points', id: POINTS_SECTION_ID, acts: points }];
};

export const previousEveningsOf = (
  summaries: readonly RunningOrderSummary[],
  eventId: number,
  acts: readonly CatalogueAct[],
  draft: RunningOrderDraft,
): PreviousEvening[] => {
  const availableIds = availableActsOf(acts, draft).map((act) => act.actId);

  return summaries
    .filter((summary) => summary.eventId !== eventId)
    .map((summary) => ({
      eventId: summary.eventId,
      title: summary.title,
      startsAt: summary.startsAt,
      actIds: summary.actIds,
      missing: summary.actIds.filter((actId) => availableIds.includes(actId)).length,
    }))
    .filter((evening) =>
      evening.actIds.some((actId) => acts.some((act) => act.actId === actId && !act.archived)),
    )
    .sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt))
    .slice(0, MAX_PREVIOUS);
};
