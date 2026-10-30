import type { GroupAct, MyAct } from '@/features/acts/schemas';
import type { AgendaItem } from './act-agenda';
import { agendaTemplateOf, nextAgendaItemOf } from './act-agenda';

export interface GroupAgendaAct {
  act: GroupAct;
  mine: MyAct | null;
  next: AgendaItem | null;
  dimmed: boolean;
  answers: boolean;
}

export const groupAgendaActsOf = (
  acts: readonly GroupAct[],
  myActs: readonly MyAct[],
  now: number,
): GroupAgendaAct[] => {
  const entries = acts.map((act): GroupAgendaAct => {
    const mine = myActs.find((candidate) => candidate.actId === act.actId) ?? null;
    const involved = act.viewerInCast || mine !== null;

    return {
      act,
      mine,
      next: mine === null ? null : nextAgendaItemOf(agendaTemplateOf(act.kind), mine, now),
      dimmed: !involved,
      answers: act.viewerInCast,
    };
  });

  return [...entries.filter((entry) => !entry.dimmed), ...entries.filter((entry) => entry.dimmed)];
};

const startOf = (entry: GroupAgendaAct): number =>
  entry.next === null ? Number.POSITIVE_INFINITY : Date.parse(entry.next.startsAt);

export const soonestActIdOf = (entries: readonly GroupAgendaAct[]): number | null =>
  entries
    .filter((entry) => entry.next !== null)
    .sort((first, second) => startOf(first) - startOf(second))[0]?.act.actId ?? null;

export const groupStripFactsOf = (
  name: string,
  kindLabel: string | null,
  facts: readonly string[],
): string[] => (kindLabel === null || kindLabel === name ? [...facts] : [kindLabel, ...facts]);
