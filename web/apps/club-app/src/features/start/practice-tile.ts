import { META_SEPARATOR } from '@/features/acts/acts-copy';
import type { ActPageLink } from '@/features/acts/acts-origin';
import { ACT_PAGE_PATH, actPageLinkOf } from '@/features/acts/acts-origin';
import type { MyAct } from '@/features/acts/schemas';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type { ActKind } from '@/features/running-order/schemas';
import type { BoardPanel, StartPanel, StartPracticePanel } from './schemas';
import { toShownCount } from './start-board';

export const PRACTICE_SHOWN = 3;
const PRACTICE_ORIGIN = 'start';
const PRACTICE_VIEW = 'play';

export type PracticeReach = { kind: 'act'; act: MyAct } | { kind: 'sheet' };

export interface PracticeTarget {
  to: typeof ACT_PAGE_PATH;
  params: { actId: string };
  search: { view: typeof PRACTICE_VIEW; from: typeof PRACTICE_ORIGIN };
}

export interface PracticeMeta {
  group: string | null;
  kind: ActKind | null;
}

export const practisableActsOf = (acts: readonly MyAct[]): MyAct[] =>
  acts.filter((act) => act.playable);

export const boardPanelsOf = (
  panels: readonly StartPanel[],
  acts: readonly MyAct[],
): BoardPanel[] => {
  if (acts.length === 0) {
    return [...panels];
  }

  const practice: StartPracticePanel = {
    kind: 'practice',
    shownCount: toShownCount(PRACTICE_SHOWN, acts.length),
    acts: [...acts],
  };
  const afterCalendar = panels.findIndex((panel) => panel.kind === 'calendar') + 1;

  return [...panels.slice(0, afterCalendar), practice, ...panels.slice(afterCalendar)];
};

export const practiceActsOf = (panels: readonly BoardPanel[]): MyAct[] =>
  panels.find((panel): panel is StartPracticePanel => panel.kind === 'practice')?.acts ?? [];

export const practiceReachOf = (acts: readonly MyAct[]): PracticeReach => {
  const [only, ...more] = acts;

  return only !== undefined && more.length === 0 ? { kind: 'act', act: only } : { kind: 'sheet' };
};

export const practiceTargetOf = (act: MyAct): PracticeTarget => ({
  to: ACT_PAGE_PATH,
  params: { actId: String(act.actId) },
  search: { view: PRACTICE_VIEW, from: PRACTICE_ORIGIN },
});

export const practiceLinkOf = (act: MyAct): ActPageLink =>
  actPageLinkOf(act.actId, practiceTargetOf(act).search);

const sameName = (left: string, right: string): boolean =>
  left.trim().localeCompare(right.trim(), undefined, { sensitivity: 'base' }) === 0;

export const practiceMetaOf = (act: MyAct): PracticeMeta => ({
  group: act.group === null || sameName(act.group.name, act.name) ? null : act.group.name,
  kind: act.kind,
});

export const toPracticeMeta = (act: MyAct): string | undefined => {
  const meta = practiceMetaOf(act);
  const parts = [meta.group, meta.kind === null ? null : toActKindLabel(meta.kind)].filter(
    (part): part is string => part !== null,
  );

  return parts.length === 0 ? undefined : parts.join(META_SEPARATOR);
};
